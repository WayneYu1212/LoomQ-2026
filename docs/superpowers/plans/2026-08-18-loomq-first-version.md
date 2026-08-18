# LoomQ First Version Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a competition-ready LoomQ first version that transpiles and truly runs the official OpenQASM subset on three local SDK backends, answers all three L2 task families through a verified LLM pipeline, and gives beginners a one-page experiment flow.

**Architecture:** A thin official adapter delegates to one parser and typed circuit IR, three target emitters, three SDK runners, and a separate standard-library reference simulator. L2 uses the organizer transport contract plus deterministic validation/selection tools; a dependency-free local HTTP server exposes the same pipeline to a static single-page UI.

**Tech Stack:** Python 3.10.11, `unittest`, SpinQit 0.2.4, pyQPanda 3.8.5, Amazon Braket SDK 1.99.0/default simulator 1.27.0, standard-library HTTP server, HTML/CSS/vanilla JavaScript.

**Spec:** `docs/superpowers/specs/2026-08-18-loomq-first-version-design.md`

## Global Constraints

- Official contract remains v1.0 and Starter Kit remains v1.1.0.
- Only `h x s sdg t tdg rz ry cx cu1 swap ccx` are accepted.
- `adapter.py` remains thin; the official evaluator and official public circuits are never weakened or edited to force a pass.
- `run` uses a real target SDK and returns actual sampled counts; the reference simulator is not a silent target fallback.
- Count keys are `c[n-1]...c[0]`, counts sum exactly to shots, and `bit_order` is `little`.
- L2 reads only `LOOMQ_LLM_*`, performs at least one successful model call per case, and never logs secrets.
- L1/L2/Web tests and runnable artifacts live under `starter_kit/`, because that is the archived scoring root.
- L3 stays disabled and true-hardware evidence stays unchecked without traceable jobs.
- Commit, push, PR, and submission Issue actions are excluded until the user explicitly authorizes them; each task ends with an exact-path diff review instead.

---

## File Map

Create these focused units:

- `starter_kit/loomq/compiler/{ir,expressions,parser,validator,metrics}.py`: source-language and IR core.
- `starter_kit/loomq/emitters/{spinq,originq,braket}.py`: target-native text only.
- `starter_kit/loomq/runners/{result,spinq,originq,braket}.py`: SDK execution and result normalization only.
- `starter_kit/loomq/simulator.py`: independent reference semantics and seeded sampling.
- `starter_kit/loomq/agent/{prompts,response,selector,verifier,service}.py`: L2 orchestration.
- `starter_kit/loomq/web/server.py` and `starter_kit/loomq/web/static/*`: local product entry.
- `starter_kit/tests/test_*.py`: unit, integration, L2, and Web contract tests.
- `starter_kit/scripts/{setup.ps1,setup.sh,verify.ps1,verify.sh}`: reproducible commands.

Modify only these official submission files:

- `starter_kit/adapter.py`: delegate fixed interfaces.
- `starter_kit/requirements.txt`: exact compatible lock.
- `starter_kit/submission.yaml`: declare L1/L2 and network contract.
- `starter_kit/README.md`, `starter_kit/evidence/README.md`, `starter_kit/Dockerfile`: truthful run and scoring evidence.

### Task 1: Python 3.10 and Reproducible Dependency Baseline

**Files:**
- Modify: `starter_kit/requirements.txt`
- Create: `starter_kit/scripts/setup.ps1`
- Create: `starter_kit/scripts/setup.sh`

**Interfaces:**
- Produces: root `.venv` with Python 3.10.11 and importable `spinqit`, `pyqpanda`, `braket` modules.
- Produces: a requirements lock whose every requirement uses `==` and whose Braket/SpinQ ANTLR versions are compatible.

- [ ] **Step 1: Install Python side-by-side**

Run:

```powershell
winget install --id Python.Python.3.10 -e --version 3.10.11 --scope user --silent --accept-package-agreements --accept-source-agreements
py -3.10 --version
```

Expected: `Python 3.10.11`. Existing Python installations remain registered.

- [ ] **Step 2: Create an isolated environment and prove UTF-8 behavior**

Run:

```powershell
py -3.10 -m venv .venv
$env:PYTHONUTF8='1'
.\.venv\Scripts\python.exe -c "import sys; assert sys.version_info[:2] == (3, 10); print(sys.version)"
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

Expected: the 26 organizer repository tests pass; the prior Windows GBK-only failure disappears under `PYTHONUTF8=1`.

- [ ] **Step 3: Install the compatibility set and exercise imports**

Run:

```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade "pip==26.2"
.\.venv\Scripts\python.exe -m pip install "numpy==1.26.4" "antlr4-python3-runtime==4.9.2" "spinqit==0.2.4" "pyqpanda==3.8.5" "amazon-braket-sdk==1.99.0" "amazon-braket-default-simulator==1.27.0"
.\.venv\Scripts\python.exe -c "import spinqit, pyqpanda; from braket.devices import LocalSimulator; print('sdk-imports-pass')"
```

Expected: resolver succeeds without an ANTLR conflict and prints `sdk-imports-pass`.

- [ ] **Step 4: Lock and validate all installed runtime packages**

Generate a sorted freeze, remove build-only `pip/setuptools`, write it to `starter_kit/requirements.txt`, then run:

```powershell
.\.venv\Scripts\python.exe -m pip check
Select-String starter_kit\requirements.txt -Pattern '>=|~=|(?<![<>=!])>(?!=)|(?<![<>=!])<(?![=])'
```

Expected: `pip check` reports no broken requirements and the range-operator scan returns no lines.

- [ ] **Step 5: Add setup scripts and review scope**

Both scripts create `.venv`, enable UTF-8, install `requirements.txt`, run `pip check`, and print exact next commands. Run the PowerShell script from a fresh temporary venv name, then review:

```powershell
git diff -- starter_kit/requirements.txt starter_kit/scripts/setup.ps1 starter_kit/scripts/setup.sh
git diff --check
```

### Task 2: Typed IR and Safe Parameter Expressions

**Files:**
- Create: `starter_kit/loomq/__init__.py`
- Create: `starter_kit/loomq/compiler/__init__.py`
- Create: `starter_kit/loomq/compiler/ir.py`
- Create: `starter_kit/loomq/compiler/expressions.py`
- Create: `starter_kit/tests/__init__.py`
- Create: `starter_kit/tests/test_expressions_ir.py`

**Interfaces:**
- Produces: `Gate(name: str, qubits: tuple[int, ...], params: tuple[float, ...], source: str)`.
- Produces: `Measurement(qubit: int, cbit: int, source: str)`.
- Produces: `Circuit(qubit_count: int, cbit_count: int, operations: tuple[Gate | Measurement, ...])`.
- Produces: `parse_parameter(expression: str) -> float`.

- [ ] **Step 1: Write expression and immutability tests**

```python
class ParameterExpressionTests(unittest.TestCase):
    def test_accepts_official_arithmetic(self):
        self.assertAlmostEqual(parse_parameter("-3*pi/8 + pi/4"), -math.pi / 8)

    def test_rejects_calls_and_unknown_names(self):
        for source in ("__import__('os')", "sin(pi)", "theta"):
            with self.subTest(source=source), self.assertRaises(ValueError):
                parse_parameter(source)

    def test_ir_is_immutable(self):
        gate = Gate("h", (0,), (), "h q[0]")
        with self.assertRaises(dataclasses.FrozenInstanceError):
            gate.name = "x"
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `.\.venv\Scripts\python.exe -m unittest starter_kit.tests.test_expressions_ir -v`

Expected: import failure because compiler modules do not exist.

- [ ] **Step 3: Implement frozen dataclasses and AST allowlist**

`parse_parameter` parses after converting QASM `^` to Python `**`, walks only `Expression`, numeric constants, `pi`, unary plus/minus, and binary add/subtract/multiply/divide/power nodes, rejects booleans/non-finite values, and returns `float`.

- [ ] **Step 4: Verify GREEN and review**

Run the focused test, then `git diff --check` and review only Task 2 paths.

### Task 3: OpenQASM Parser and Validator

**Files:**
- Create: `starter_kit/loomq/compiler/parser.py`
- Create: `starter_kit/loomq/compiler/validator.py`
- Create: `starter_kit/tests/test_parser_validator.py`

**Interfaces:**
- Consumes: IR types and `parse_parameter` from Task 2.
- Produces: `parse_qasm(source: str) -> Circuit`.
- Produces: `validate_circuit(circuit: Circuit, *, require_measurements: bool = True) -> None`.
- Produces: `QASMParseError(ValueError)` and `CircuitValidationError(ValueError)` with statement context.

- [ ] **Step 1: Write failing source-language tests**

Cover the public Bell circuit, all 12 gates, `measure q -> c`, per-bit measurement, multiple registers with flattened offsets, block/line comments, `pi` expressions, wrong arity, unknown gates, out-of-range indices, mismatched register measurement, missing declarations, and a gate after measurement.

```python
def test_multiple_register_offsets_and_measurements(self):
    circuit = parse_qasm(MULTI_REGISTER_QASM)
    self.assertEqual((circuit.qubit_count, circuit.cbit_count), (3, 3))
    self.assertEqual(circuit.operations[-1], Measurement(2, 2, "measure aux[0] -> out[0]"))
```

- [ ] **Step 2: Run focused tests and verify RED**

Expected: missing parser/validator imports.

- [ ] **Step 3: Implement statement parsing**

Strip comments with a scanner that respects quoted includes; split on semicolons; build register offset maps; expand register-wide measurement into ordered `Measurement` nodes; normalize gate names to lowercase; preserve the original statement in `source`.

- [ ] **Step 4: Implement semantic validation**

Use exact arity tables `{h: (1,0), ..., cu1: (2,1), ccx: (3,0)}`; reject repeated qubits in a multi-qubit gate, measurement before the final gate, duplicate writes to a cbit, non-finite params, and circuits over 30 qubits with a clear resource error.

- [ ] **Step 5: Verify focused and existing tests**

Run parser tests and `python -m unittest discover -s tests -v`; review Task 3 paths and `git diff --check`.

### Task 4: Independent Reference Simulator

**Files:**
- Create: `starter_kit/loomq/simulator.py`
- Create: `starter_kit/tests/test_simulator.py`

**Interfaces:**
- Consumes: validated `Circuit`.
- Produces: `probabilities(circuit: Circuit) -> dict[str, float]`.
- Produces: `sample(circuit: Circuit, shots: int, *, seed: int | None = None) -> dict[str, int]`.

- [ ] **Step 1: Write failing probability tests**

Assert Bell/GHZ ideal distributions, phase-sensitive interference, all 12 gates against small hand-computed cases, non-identity measurement mapping, exact shot totals, deterministic seeds, and a memory guard above 16 qubits.

```python
def test_bell_distribution_uses_classical_bit_order(self):
    probs = probabilities(parse_qasm(BELL_QASM))
    self.assertAlmostEqual(probs["00"], 0.5)
    self.assertAlmostEqual(probs["11"], 0.5)
    self.assertEqual(set(probs), {"00", "11"})
```

- [ ] **Step 2: Verify RED**

Expected: missing `loomq.simulator`.

- [ ] **Step 3: Implement gate application and measurement projection**

Use little-endian basis-bit indexing (`1 << qubit`), pair iteration for one-qubit matrices, predicate-controlled phase/flip for `cx`, `cu1`, `ccx`, direct amplitude swap for `swap`, and map final qubit basis states into the declared classical string.

- [ ] **Step 4: Implement stable seeded sampling**

Build a sorted cumulative distribution, sample with `random.Random(seed)`, omit zero-count states, and assert the output total equals shots.

- [ ] **Step 5: Verify GREEN and regression**

Run focused tests and all root tests; review Task 4 paths and `git diff --check`.

### Task 5: Three Native Emitters and Circuit Metrics

**Files:**
- Create: `starter_kit/loomq/compiler/metrics.py`
- Create: `starter_kit/loomq/emitters/__init__.py`
- Create: `starter_kit/loomq/emitters/spinq.py`
- Create: `starter_kit/loomq/emitters/originq.py`
- Create: `starter_kit/loomq/emitters/braket.py`
- Create: `starter_kit/tests/test_emitters.py`

**Interfaces:**
- Produces: `emit_spinq(circuit: Circuit) -> str`, `emit_originq(...) -> str`, `emit_braket(...) -> str`.
- Produces: `emit(circuit: Circuit, target: str) -> str` and `SUPPORTED_TARGETS`.
- Produces: `circuit_metrics(circuit: Circuit) -> dict[str, int]` with `transpiled_gates` and logical `depth`.

- [ ] **Step 1: Write exact artifact tests for Bell and 12 gates**

Assert headers/declarations/measurements and mappings: Braket `sdg->si`, `tdg->ti`, `cx->cnot`, `cu1->cphaseshift`, `ccx->ccnot`; OriginQ `sdg->SDAG`, `tdg->TDAG`, `cx->CNOT`, `ccx->TOFFOLI`; SpinQ retains official names.

- [ ] **Step 2: Verify RED**

- [ ] **Step 3: Implement deterministic emitters**

Emit a flattened `q` and `c` register, format floats with `.17g`, output one per-bit measurement for portability, end text with a newline, and raise `ValueError("unsupported target: ...")` before dispatch for unknown target values.

- [ ] **Step 4: Verify artifacts with SDK parsers where available**

Instantiate Braket `Program(source=...)`; compile SpinQ QASM through `get_compiler('qasm')`; check OriginIR against a strict line parser in the test. No execution happens in this task.

- [ ] **Step 5: Run focused/all tests and review**

### Task 6: Unified Result Schema and Thin Adapter Transpile Path

**Files:**
- Create: `starter_kit/loomq/runners/__init__.py`
- Create: `starter_kit/loomq/runners/result.py`
- Modify: `starter_kit/adapter.py`
- Create: `starter_kit/tests/test_result_adapter.py`

**Interfaces:**
- Produces: `normalize_counts(raw: Mapping[object, object], *, width: int, reverse_bits: bool = False) -> dict[str, int]`.
- Produces: `build_result(target: str, job_id: str, shots: int, counts: Mapping[object, object], width: int, meta: Mapping[str, Any]) -> dict[str, Any]`.
- Adapter `transpile(qasm_str, target)` becomes parse -> validate -> emit.

- [ ] **Step 1: Write Schema and adapter RED tests**

Test integer/decimal/binary keys, whitespace, bit reversal, leading-zero width, duplicate normalized keys merging, bool/float/negative counts rejection, exact total, UTC timestamp ending in `Z`, and three valid transpile outputs.

- [ ] **Step 2: Implement result normalization**

Reject ambiguous non-binary strings; never silently rescale counts; use `datetime.now(timezone.utc).isoformat().replace('+00:00','Z')`; include metrics and `engine` in meta.

- [ ] **Step 3: Wire only adapter.transpile**

Keep `run` and `agent_chat` unimplemented until their tasks, preserving fixed signatures and `SUPPORTED_TARGETS`.

- [ ] **Step 4: Run focused/all tests and review**

### Task 7: Real SpinQ, OriginQ, and Braket Runners

**Files:**
- Create: `starter_kit/loomq/runners/spinq.py`
- Create: `starter_kit/loomq/runners/originq.py`
- Create: `starter_kit/loomq/runners/braket.py`
- Modify: `starter_kit/loomq/runners/__init__.py`
- Modify: `starter_kit/adapter.py`
- Create: `starter_kit/tests/test_sdk_runners.py`

**Interfaces:**
- Produces: `run_spinq(circuit, shots)`, `run_originq(circuit, shots)`, and `run_braket(circuit, shots)` returning the unified dict.
- Produces: `run_circuit(circuit: Circuit, target: str, shots: int) -> dict[str, Any]`.
- Adapter `run(qasm_str, target, shots)` becomes parse -> validate -> target SDK -> normalize.

- [ ] **Step 1: Write SDK integration tests**

Run Bell and GHZ-3 at 2048 shots on each SDK; call official `validate_schema`; assert fidelity >=0.97; assert `meta.engine` names the actual SDK. Patch imports unavailable in a separate test and assert an install-action RuntimeError rather than reference-simulator fallback.

- [ ] **Step 2: Verify RED**

- [ ] **Step 3: Implement SpinQ runner**

Write emitted QASM to a securely closed temporary `.qasm`, compile with `get_compiler('qasm')`, execute `get_basic_simulator()` using `BasicSimulatorConfig.configure_shots`, normalize `result.counts`, and always unlink the temporary file.

- [ ] **Step 4: Implement OriginQ runner**

Build a `QProg` from IR with allocated qubits/cbits and pyQPanda gate constructors, call `measure` for every mapping, execute `CPUQVM.run_with_configuration`, normalize its keys, and finalize the QVM in `finally`.

- [ ] **Step 5: Implement Braket runner**

Create `Program(source=emit_braket(circuit))`, execute `LocalSimulator().run(...).result()`, use `measurement_counts`, task metadata ID, and measured-qubit metadata without AWS credentials.

- [ ] **Step 6: Wire adapter.run and run official L1**

Run:

```powershell
.\.venv\Scripts\python.exe starter_kit\evaluator.py --level l1 --target spinq,originq,braket --json-out logs\l1-public.json
```

Expected: 6 PASS, 0 FAIL, real SDK engine metadata in direct runner tests.

- [ ] **Step 7: Review Task 7 paths and result JSON**

### Task 8: Hidden-Test Resistance Suite

**Files:**
- Create: `starter_kit/tests/fixtures.py`
- Create: `starter_kit/tests/test_cross_backend.py`

**Interfaces:**
- Consumes: parser, simulator, emitters, and real runners.
- Produces: fixed GHZ-5, QFT-like, Grover-like, 12-gate and seeded random circuits used only as tests, never runtime special cases.

- [ ] **Step 1: Add circuits generated independently of runtime implementation**

Fixtures return QASM strings; they do not import emitters or runner code. Random cases use fixed seeds and valid register/measurement syntax.

- [ ] **Step 2: Write cross-backend fidelity tests**

For each fixture, compare each real SDK counts distribution with the reference simulator distribution at 8192 shots and require fidelity >=0.97. Also compare every emitter artifact to its source circuit through available target parsers.

- [ ] **Step 3: Run and diagnose by gate, not by fixture name**

Run each failing subtest separately; fix shared parser/emitter/runner semantics, never branch on circuit labels or input hashes.

- [ ] **Step 4: Run the full L1 suite twice with fresh sampling**

Expected: no threshold flake; if a statistically valid circuit is close to threshold, increase only test shots, not production counts manipulation.

### Task 9: Backend Selector and LLM Response Protocol

**Files:**
- Create: `starter_kit/loomq/agent/__init__.py`
- Create: `starter_kit/loomq/agent/prompts.py`
- Create: `starter_kit/loomq/agent/response.py`
- Create: `starter_kit/loomq/agent/selector.py`
- Create: `starter_kit/tests/test_agent_tools.py`

**Interfaces:**
- Produces: `AgentPlan(task: Literal['generate','repair','recommend'], qasm: str | None, constraints: BackendConstraints | None, explanation: str)`.
- Produces: `parse_agent_plan(text: str) -> AgentPlan` accepting raw JSON or one fenced JSON object.
- Produces: `select_backends(constraints: BackendConstraints) -> list[dict[str, Any]]` loading `backend_capabilities.json` at call time.
- Produces: `SYSTEM_PROMPT` specifying strict JSON, official gates, canonical backend IDs, and no secrets.

- [ ] **Step 1: Write tool RED tests**

Test 15-qubit/zero-queue, free 5-qubit QPU, 50-qubit no-solution, conflicting constraints, malformed model JSON, QASM containing semicolons/newlines, and canonical ID preservation.

- [ ] **Step 2: Implement typed plan parsing**

Reject extra top-level text except Markdown fences, unknown tasks, absent task-specific fields, non-integer qubits, and invented constraint values.

- [ ] **Step 3: Implement deterministic capability filtering**

Filter `max_qubits`, `kind`, `queue`, `cost`, and `requires_account` with explicit semantics; return original records so canonical IDs cannot be rewritten by the model.

- [ ] **Step 4: Run focused tests and review**

### Task 10: Verified L2 Agent Service

**Files:**
- Create: `starter_kit/loomq/agent/verifier.py`
- Create: `starter_kit/loomq/agent/service.py`
- Modify: `starter_kit/adapter.py`
- Create: `starter_kit/tests/test_agent_service.py`

**Interfaces:**
- Produces: `verify_qasm(qasm: str) -> VerificationReport` with valid circuit, distribution, checks, and human summary.
- Produces: `agent_chat(prompt: str) -> str` through adapter.
- Consumes: official `llm_client.chat_completion`, parser/validator/reference simulator, and selector.

- [ ] **Step 1: Build a fake OpenAI-compatible server test harness**

The handler records call count and authorization presence, returns queued structured plans, and never stores the actual authorization value. Tests cover valid GHZ generation, invalid-first/valid-repair, Bell repair, backend recommendation, no-solution, missing environment, HTTP failure, and secret non-disclosure.

- [ ] **Step 2: Verify RED**

- [ ] **Step 3: Implement the first model call and plan extraction**

Use official `chat_completion` with system/user messages, temperature already fixed by transport, and a request for a single JSON object. Extract `choices[0].message.content` defensively and raise a stable error for malformed API responses.

- [ ] **Step 4: Implement generate/repair verifier loop**

Parse and validate QASM, run reference probabilities, and return complete QASM plus a concise explanation. On failure, make exactly one correction call containing the original user intent, candidate QASM, and sanitized validation error; if it fails again, return a recovery message without invalid QASM.

- [ ] **Step 5: Implement recommend flow**

Use model-extracted constraints, programmatic selector results, and render canonical backend IDs plus trade-offs. The model call establishes genuine Agent participation; selector output establishes correctness.

- [ ] **Step 6: Enable L2 manifest and run public L2 with fake server**

Modify `submission.yaml`: `levels.l2: true`, `network.required_for_l2: true`. Run evaluator against the fake server and require PASS plus recorded call count >=1.

- [ ] **Step 7: Run focused/all tests and review**

### Task 11: LoomQ Lab HTTP API

**Files:**
- Create: `starter_kit/loomq/web/__init__.py`
- Create: `starter_kit/loomq/web/server.py`
- Create: `starter_kit/tests/test_web_server.py`

**Interfaces:**
- Produces: `python -m loomq.web.server --host 127.0.0.1 --port 8765`.
- Produces: `POST /api/experiment` with `{prompt,target,shots}` and response `{reply,qasm,circuit,verification,result,explanation}`.
- Produces: `GET /api/health` and same-origin static serving.

- [ ] **Step 1: Write HTTP RED tests**

Start on port 0 in a thread; test health, built-in offline Bell/GHZ example, fake-LLM experiment, invalid JSON, body >64 KiB, shots outside 1..8192, unsupported target, missing static file, and `../` path traversal.

- [ ] **Step 2: Implement bounded request routing**

Use `ThreadingHTTPServer`; bind loopback by default; set JSON UTF-8 headers; never expose tracebacks; serve only files resolved beneath the static root; shut down cleanly in tests.

- [ ] **Step 3: Implement experiment assembly**

AI mode calls adapter.agent_chat, extracts returned QASM, then adapter.run. Offline examples are explicit `mode: local_example`, use checked-in QASM, and never claim an LLM call. Serialize circuit gates/measurements for the UI.

- [ ] **Step 4: Run focused/all tests and review**

### Task 12: One-Page Beginner UI

**Files:**
- Create: `starter_kit/loomq/web/static/index.html`
- Create: `starter_kit/loomq/web/static/styles.css`
- Create: `starter_kit/loomq/web/static/app.js`
- Create: `starter_kit/tests/test_web_assets.py`

**Interfaces:**
- Consumes: Task 11 JSON only; no duplicate compiler or scoring logic in JavaScript.
- Produces: responsive input, circuit, verification, counts, explanation, and expandable QASM views.

- [ ] **Step 1: Load the UI design skill before visual implementation**

Read `ui-designer/SKILL.md`, retain the approved quiet scientific-lab direction, and document any material token/layout decisions in the final handoff.

- [ ] **Step 2: Write static contract RED tests**

Assert one visible `h1`, labeled prompt/target/shots controls, real button type, live status region, result canvas alternative table, QASM disclosure, UTF-8 Chinese examples, no CDN/script/font URLs, and reduced-motion CSS.

- [ ] **Step 3: Implement semantic HTML and progressive states**

The initial state offers three example buttons; submitting renders `理解意图/验证程序/真实运行/解释结果` as measured states. Disabled/loading/error handling restores focus and gives a retry action.

- [ ] **Step 4: Implement quiet scientific visual system**

Use local system fonts, warm paper background, ink/navy text, restrained blue/amber status colors, 44px minimum targets, responsive two-column-to-one-column layout, no neon glow, and no decorative particle canvas.

- [ ] **Step 5: Implement data rendering without unsafe HTML**

Use `textContent` and DOM creation, normalize chart widths from returned counts, render an accessible table beside bars, draw circuit rails/gates from JSON, and never insert model output with `innerHTML`.

- [ ] **Step 6: Run tests and browser smoke verification**

Start the server, open it in the in-app browser, execute offline Bell and GHZ flows at desktop and narrow viewport, capture evidence screenshots, then inspect keyboard focus and console/network errors.

### Task 13: Reproduction, Documentation, and Evidence

**Files:**
- Modify: `starter_kit/README.md`
- Modify: `starter_kit/evidence/README.md`
- Modify: `starter_kit/Dockerfile`
- Create: `starter_kit/ARCHITECTURE.md`
- Create: `starter_kit/USER_GUIDE.md`
- Create: `starter_kit/scripts/verify.ps1`
- Create: `starter_kit/scripts/verify.sh`
- Create: `starter_kit/evidence/files/.gitkeep`

**Interfaces:**
- Produces: exact setup/test/Web commands and a mapping from claims to executable evidence.

- [ ] **Step 1: Write documentation contract tests**

Add a test that checks all referenced repo paths exist, all documented commands use Python 3.10-compatible syntax, L2 env names are exact, L3 is stated disabled, and no evidence checkbox claims true hardware.

- [ ] **Step 2: Write architecture and newcomer guide**

Explain one parser/IR, target boundaries, real SDK engines, bit order, LLM verifier loop, privacy, the target user, a five-minute Bell journey, and “what this proves/does not prove.”

- [ ] **Step 3: Update README and evidence truthfully**

Check L2 interaction, engineering/product, and beginner visual narrative only after their referenced commands and screenshots exist. Leave hardware and RISC-V unchecked.

- [ ] **Step 4: Make verification one command per OS**

Scripts enable UTF-8, run pip check, root organizer tests, `starter_kit/tests`, official L1/L2 public evaluator with a documented fake endpoint for deterministic local L2, secret scan, `git diff --check`, and archive-size check.

- [ ] **Step 5: Update Docker entrypoint**

Keep Python 3.10, add only required system libraries, install the exact lock, and run the declared public evaluator. Build if Docker is available; otherwise record Docker validation as not executed and use a clean temporary Python 3.10 venv as evidence.

### Task 14: Final Verification and First-Version Handoff

**Files:**
- Create: `starter_kit/evidence/files/l1-public-report.json`
- Create: `starter_kit/evidence/files/verification-summary.md`
- Modify: only files found inconsistent by verification.

**Interfaces:**
- Produces: fresh, timestamped evidence and an honest open-risk list.

- [ ] **Step 1: Invoke verification-before-completion skill**

Read and follow its evidence rules before any completion claim.

- [ ] **Step 2: Run clean Python 3.10 verification**

Create a new temporary venv outside the repo, install `starter_kit/requirements.txt`, run all tests and official evaluator, then remove only that verified temporary directory.

- [ ] **Step 3: Run L1 twice and L2 deterministic suite**

Require three-target public L1 6/6 twice, hidden-resistance integration suite all green, and fake-server L2 generation/repair/recommend all green with call evidence. Run a real personal-model smoke only if an already-configured `LOOMQ_LLM_*` environment exists; never print values.

- [ ] **Step 4: Run security and packaging checks**

Scan tracked and untracked diff for API-key patterns, reject caches/logs outside evidence, verify archive projection under 100 MiB, ensure only `starter_kit/` is required for runtime, and run `prepare_submission.py` only as a diagnostic after noting it must fail until changes are intentionally committed and pushed.

- [ ] **Step 5: Review the complete diff**

Run `git status --short`, `git diff --stat`, `git diff --check`, and inspect every modified path. Preserve the user-owned fork and do not stage, commit, push, or submit.

- [ ] **Step 6: Deliver the first version**

Report exact PASS counts and commands, clickable file paths, how to launch LoomQ Lab, environment facts, any unavailable external verification, and the minimal separately authorized next actions for commit/push/final Issue or real-hardware bonus.
