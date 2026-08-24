# LoomQ V7.2.1 Pedagogy + Local Runtime Refinement Patch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add small, scientifically conservative teaching interactions, correct Bell circuit rendering, and a reproducible local SDK launcher while preserving the accepted V7.2/L2 contract.

**Architecture:** Keep the current dependency-free static page and standard-library HTTP server. Add pedagogical state machines in `app.js`, semantic markup in `index.html`, and scoped CSS with one bounded `requestAnimationFrame` animation per user action. Expose read-only runner import availability through `/api/health` and reject an unavailable target before `adapter.run()`; do not alter adapter, runner execution, evaluator, backend IDs, hardware evidence, tomography values, or scoring semantics.

**Tech Stack:** HTML5 `<details>`/buttons, vanilla JavaScript, CSS/SVG, Python 3.10 standard library, PowerShell launcher, existing `unittest` suites, in-app browser QA.

**Spec:** `C:/Users/UUWayne/Downloads/LoomQ_V7_2_1_Pedagogy_Animation_Runtime_Patch.md`

## Global Constraints

- Work only from `f30792181a4ed32c7ea6a14942b7f839944fd972` on a new isolated branch.
- Keep accepted fallback `#119 / ac0eb3b9f37b1b85f1d7b05ab83b8ee1a7331fd5` untouched.
- Do not push, create a Final Submission Issue, or change L1/L2/L3 architecture, hardware evidence, tomography values, validators, evaluator, backend capability semantics, or accepted raw evidence.
- Preserve canonical backend IDs `spinq`, `originq`, and `braket`; preserve `adapter.run()` and runner execution semantics.
- Mark teaching animations as ideal/local visualization; never fabricate hardware execution, counts, timestamps, or scientific claims.
- Respect `prefers-reduced-motion: reduce`, keyboard focus, tap targets, single-open tooltips, and 360/390/430 px no-overflow behavior.

---

### Task 1: Establish the candidate baseline and source note

**Files:**
- Create: `docs/superpowers/plans/2026-08-24-loomq-v7-2-1-pedagogy-runtime.md`
- Create: `starter_kit/PEDAGOGY_REFERENCES.md`
- Test: existing `starter_kit/tests` and root `tests`

**Interfaces:**
- Consumes: accepted V7.2 hardening commit and the attached V7.2.1 contract.
- Produces: a clean candidate worktree, a non-branding source note, and a recorded baseline of 116 starter-kit and 26 organizer tests.

- [x] **Step 1: Verify the candidate parent and protected paths**

  Run:

  ```powershell
  git rev-parse HEAD
  git rev-parse HEAD^
  git status --short --branch
  ```

  Expected: `HEAD` is `f30792181a4ed32c7ea6a14942b7f839944fd972`, the worktree is isolated, and no protected file is modified.

- [x] **Step 2: Run the clean baseline suites**

  Run:

  ```powershell
  & 'C:\Users\UUWayne\LoomQ-venvs\accepted69-v6-baseline-20260823\Scripts\python.exe' -X utf8 -m unittest discover -s starter_kit/tests -p 'test_*.py'
  & 'C:\Users\UUWayne\LoomQ-venvs\accepted69-v6-baseline-20260823\Scripts\python.exe' -X utf8 -m unittest discover -s tests -p 'test_*.py'
  ```

  Expected: 116 and 26 tests pass before any implementation change.

- [ ] **Step 3: Add the compact Microsoft-inspired source note**

  Record the six supplied Microsoft learning references as teaching inspiration, explicitly state that LoomQ uses original visuals, and state that no Microsoft branding, screenshot, logo, or copied source is shipped. Do not add Microsoft branding to the learner flow.

- [ ] **Step 4: Run `git diff --check` and commit the source note with the implementation**

  The source note is documentation-only and must not change product behavior or protected evidence.

### Task 2: Write failing tests for Bell topology, pedagogy interactions, and runtime availability

**Files:**
- Modify: `starter_kit/tests/test_web_server.py`
- Modify: `starter_kit/tests/test_web_assets.py`
- Create: `starter_kit/tests/test_pedagogy_runtime.py`
- Test: the files above

**Interfaces:**
- Consumes: `starter_kit.loomq.web.server.BELL_QASM`, `_circuit_payload`, `backend_availability`, and static page assets.
- Produces: regression assertions for exact Bell operation order, q0/control and q1/target mapping, measurement grouping, required bilingual copy, bounded interaction hooks, launcher preflight text, backend-unavailable behavior, and no fake-success fallback.

- [ ] **Step 1: Add the Bell operation-order regression test**

  Assert the local Bell response exposes operations in this order: `h` on q0, `cx` on q0/q1, then measurement on q0 and q1; assert the CNOT control is q0 and target is q1.

- [ ] **Step 2: Add static asset contract tests for the new interactions**

  Assert markup and script contain `h-lab`, `h-single-run`, `h-shots-run`, one-qubit Bloch copy, `cnot-rule-choice`, `cnot-rule-result`, `bell-shot-lab`, `bell-one-shot`, `bell-auto-shots`, `requestAnimationFrame`, `prefers-reduced-motion`, exact required beginner copy, and the ideal/local teaching label. Assert no forbidden literal “half 0 and half 1” physical-state claim and no `setInterval`.

- [ ] **Step 3: Add availability and preflight tests**

  Patch the read-only availability map to mark a target unavailable, post a Bell example for that target, assert HTTP 503 with `backend_unavailable`, actionable setup text, and assert `adapter.run` was not called. Assert health returns only safe backend availability metadata.

- [ ] **Step 4: Add launcher preflight tests**

  Assert `starter_kit/scripts/run_web.ps1` resolves `.venv\Scripts\python.exe`, checks `spinqit==0.2.4`, prints a local URL, uses `-m starter_kit.loomq.web.server`, and gives a precise setup instruction when `.venv` is absent; assert it does not contain the stale vague `SpinQit is unavailable; run starter_kit/scripts/setup` message.

- [ ] **Step 5: Run the new tests to confirm RED**

  Run:

  ```powershell
  & 'C:\Users\UUWayne\LoomQ-venvs\accepted69-v6-baseline-20260823\Scripts\python.exe' -X utf8 -m unittest starter_kit.tests.test_pedagogy_runtime starter_kit.tests.test_web_server starter_kit.tests.test_web_assets
  ```

  Expected: new assertions fail because the new markup, availability API, launcher, and interactions do not yet exist; failures must be feature-missing failures, not import or test typos.

### Task 3: Implement the pedagogical HTML and local ideal interaction surfaces

**Files:**
- Modify: `starter_kit/loomq/web/static/index.html`
- Test: `starter_kit/tests/test_pedagogy_runtime.py`, `starter_kit/tests/test_web_assets.py`

**Interfaces:**
- Consumes: existing qubit, Bell, CNOT, and result sections.
- Produces: keyboard/tap-accessible H, CNOT, and Bell teaching controls with bilingual copy and explicit scientific boundaries.

- [ ] **Step 1: Add the H interaction markup**

  Add `|0⟩ → H → |+⟩`, buttons for `单次测量` and `重复 100 次`, a live single-result field, a two-bar histogram, and an optional one-qubit-only Bloch-sphere `<details>` fold. Include the exact required H copy and label the visualization as ideal/local.

- [ ] **Step 2: Convert the CNOT rule cards into accessible controls**

  Replace static spans with four `type="button"` choices for `00 → 00`, `01 → 01`, `10 → 11`, `11 → 10`; add a live result panel with control/target bit labels and the exact 0/1 rule copy. Add the explicit boundary that CNOT alone is not entanglement and that H on q0 followed by CNOT produces Bell Φ+ here.

- [ ] **Step 3: Add the Bell shot accumulator markup**

  Add `再测一次` and `自动跑 100 次`, two outcome bars for `00` and `11`, shot count, and the exact ideal-local copy. Keep the stronger X/Y/Z/tomography boundary visible or one click away.

- [ ] **Step 4: Run static HTML contract tests**

  Run the focused asset tests and inspect the exact failure output before JavaScript implementation.

### Task 4: Implement bounded vanilla JS interactions and circuit rendering

**Files:**
- Modify: `starter_kit/loomq/web/static/app.js`
- Test: `starter_kit/tests/test_pedagogy_runtime.py`, `starter_kit/tests/test_web_assets.py`

**Interfaces:**
- Consumes: the new IDs/data attributes from `index.html`, `prefers-reduced-motion`, and the server circuit payload.
- Produces: `initHInteraction()`, `initCnotInteraction()`, `initBellShotAccumulator()`, grouped measurement columns, explicit CNOT role labels, and localized state updates.

- [ ] **Step 1: Implement H interaction with a bounded animation**

  Use one-shot deterministic local teaching outcomes and a 100-shot ideal histogram. Use `requestAnimationFrame` for a finite accumulation only; cancel an in-flight animation before starting another; use final values immediately under reduced motion. Never describe a qubit as literally half 0 and half 1.

- [ ] **Step 2: Implement the clickable CNOT truth table**

  Toggle one `aria-pressed` button at a time, highlight q0/control, show q1/target before and after, and animate only the target when the control bit is 1. Update Chinese and English live copy without measuring the control.

- [ ] **Step 3: Implement the Bell shot accumulator**

  Alternate ideal `00`/`11` local teaching outcomes for one-shot runs and animate a bounded 100-shot accumulation toward approximately 50/50. Expose counts and `aria-live` status. Never call `/api/experiment` from these teaching controls.

- [ ] **Step 4: Replace generic result-circuit rendering with grouped semantic columns**

  Preserve operation order from the server, group adjacent q0/q1 measurement operations into one measurement column, draw continuous rails through every cell, render q0 control dot and q1 circled-X at the same CNOT column, and render connected measurement cards with `aria-label`/`title` rather than floating `M` text.

- [ ] **Step 5: Initialize the three interactions and keep reduced-motion behavior centralized**

  Call the initializers beside existing page initializers and ensure language switching updates all interactive labels/status text.

- [ ] **Step 6: Run JS syntax and focused tests**

  Run `node --check starter_kit/loomq/web/static/app.js` and the new focused unittest module; expected result is GREEN.

### Task 5: Add backend availability exposure and precise local launcher

**Files:**
- Modify: `starter_kit/loomq/runners/__init__.py`
- Modify: `starter_kit/loomq/web/server.py`
- Modify: `starter_kit/loomq/runners/spinq.py`
- Modify: `starter_kit/loomq/runners/originq.py`
- Modify: `starter_kit/loomq/runners/braket.py`
- Modify: `starter_kit/loomq/web/static/index.html`
- Modify: `starter_kit/loomq/web/static/app.js`
- Create: `starter_kit/scripts/run_web.ps1`
- Modify: `starter_kit/USER_GUIDE.md`
- Modify: `starter_kit/README.md`
- Test: `starter_kit/tests/test_pedagogy_runtime.py`, `starter_kit/tests/test_web_server.py`, `starter_kit/tests/test_web_assets.py`

**Interfaces:**
- Consumes: existing runner `_IMPORT_ERROR` values and canonical target map.
- Produces: `backend_availability() -> dict[str, dict[str, str | bool]]`, health payload `backends`, HTTP `backend_unavailable` 503 preflight, and launcher parameters `-Port`/`-Host`.

- [ ] **Step 1: Expose read-only runner import availability**

  Add a function in `runners/__init__.py` that reports canonical IDs, display labels, `available`, dependency name, and safe status text; do not change `run_circuit` or runner execution. Avoid exposing exception paths or secrets.

- [ ] **Step 2: Add server health availability and execution preflight**

  Add `backends` to `/api/health`; before `adapter.run`, reject an unavailable selected backend with HTTP 503 `backend_unavailable` and actionable “run `starter_kit\scripts\setup.ps1` inside this repository” guidance. Keep local Bell free of `agent_chat` and do not fabricate a result.

- [ ] **Step 3: Add UI backend state**

  Disable unavailable options, annotate them without “ready” language, select the first available local backend when health returns, and prevent submission until availability is known. Preserve target values `spinq`, `originq`, and `braket`.

- [ ] **Step 4: Add the PowerShell launcher**

  Resolve repository root from `$PSScriptRoot`, require `.venv\Scripts\python.exe`, verify Python 3.10 and `spinqit` version `0.2.4`, print `http://127.0.0.1:<port>/`, and execute the server module. If missing or mismatched, stop with the exact setup command and no vague setup path.

- [ ] **Step 5: Sync user-facing launch instructions**

  Make the launcher the documented Windows entry point; explain that it runs the real local SDK path and that unavailable SDK backends remain unavailable rather than becoming synthetic successes.

- [ ] **Step 6: Run runtime/launcher focused tests**

  Run the focused server, launcher, and asset tests; expected result is GREEN.

### Task 6: Add responsive/reduced-motion styles and source documentation

**Files:**
- Modify: `starter_kit/loomq/web/static/styles.css`
- Create: `starter_kit/PEDAGOGY_REFERENCES.md`
- Test: `starter_kit/tests/test_web_assets.py`

**Interfaces:**
- Consumes: new semantic classes and `data-state`/`data-control` attributes.
- Produces: legible desktop/mobile circuit topology, 44 px controls, non-overflowing teaching cards, and static reduced-motion presentation.

- [ ] **Step 1: Add scoped teaching styles**

  Style H flow, histogram, optional one-qubit Bloch SVG, CNOT selected/control/target states, Bell accumulator, measurement cards, and backend availability annotations without introducing a dependency or a permanent animation loop.

- [ ] **Step 2: Add mobile breakpoints**

  At 360/390/430 px stack teaching surfaces, keep circuit rails horizontally scrollable only inside their bounded view, keep button hit targets at least 44 px, and prevent body-level horizontal overflow.

- [ ] **Step 3: Add reduced-motion overrides**

  Disable transitions/transform animations and show final histogram/target states when `prefers-reduced-motion: reduce` is active.

- [ ] **Step 4: Run CSS/asset checks**

  Run the focused web asset tests and `git diff --check`; expected result is GREEN.

### Task 7: Full regression, local runtime QA, browser evidence, and human-review handoff

**Files:**
- Create: `starter_kit/evidence/files/v7.2.1-*.png` selected screenshots only
- Modify: none outside the approved implementation files
- Test: all existing suites and browser QA

**Interfaces:**
- Consumes: completed V7.2.1 page, launcher, availability health, and local Bell endpoint.
- Produces: fresh browser screenshots, exact launch command, clean local commit, and a human-review gate.

- [ ] **Step 1: Run full Python and static gates**

  Run all starter-kit and root tests, L1/L2/L3/RISC-V regression commands, hardware tool tests, `pip check`, `node --check`, `git diff --check`, and staged secret scan. No real hardware or provider campaign is allowed.

- [ ] **Step 2: Run the launcher-backed local server**

  From the candidate worktree, use:

  ```powershell
  .\starter_kit\scripts\run_web.ps1 -Port 8765
  ```

  Confirm `/api/health` reports backend availability, then run the built-in Bell example through the browser and confirm real SDK counts, qasm, circuit, and verification return without LLM configuration.

- [ ] **Step 3: Perform browser QA at all required sizes**

  Check 1280/1440/1600 and 360/390/430 px in Chinese and English. Exercise H single/100 shots, CNOT all four rows, Bell single/100 shots, corrected result circuit, backend-unavailable state, tooltip/tap/focus/ESC, disclosure folds, reduced motion, and local Bell. Capture screenshots for corrected circuit, H, CNOT, Bell accumulator, unavailable backend, and mobile.

- [ ] **Step 4: Audit protected scope and screenshot files**

  Confirm no changes under hardware/raw evidence/tomography/validator/evaluator/submission paths; only selected display screenshots may be added under `starter_kit/evidence/files`.

- [ ] **Step 5: Explicitly stage, commit locally, and verify the handoff**

  Stage only the planned files, run cached diff/secret/protected scans, commit with `feat: add V7.2.1 pedagogy runtime refinement`, verify parent/child SHA and clean status, and leave the branch/worktree intact for human review. Do not push or create an Issue.

---

# V7.2.2 judge-aligned information architecture addendum

The addendum `C:/Users/UUWayne/Downloads/LoomQ_V7_2_2_Judge_Aligned_Beginner_UX_Research_Addendum.md` is an in-scope continuation of this candidate, not a redesign. It takes precedence over V7.2.1 whenever page order, content priority, Agent placement, or beginner copy conflicts.

## V7.2.2 constraints

- Keep the V7.2.1 SpinQit/runtime repair, Bell topology correction, H/CNOT/Bell micro-interactions, scientific boundaries, mobile adaptations, and QA evidence.
- Make the product promise explicit before concepts: a zero-background user can run once, see the outcome, understand the path, and later ask the Agent a natural-language question.
- Use the page order: promise and two entry choices → ideal Bell outcome → concept foundation → H/one-qubit → CNOT/two-qubit → whole-circuit inspection → local Bell run → result/OpenQASM → archived hardware bridge → Agent destination → advanced X/Y/Z/tomography.
- Keep the Agent visible as a product destination with the heading `现在，把你的问题说成人话就行。` and the three addendum prompt cards. Cards fill prompts only; they do not hard-code model answers.
- Keep the first Bell run model-free and explain that model configuration is optional advanced functionality. Do not ask beginners to paste an API key.
- Preserve scientific boundaries: `00/11` in one basis is correlation, not by itself proof of entanglement; archived hardware is replay-only; no new algorithms, hardware abilities, backends, jobs, or evidence claims.
- Keep advanced mathematics and evidence behind clear disclosure affordances, with mobile tap targets and one readable path in both languages.

## V7.2.2 verification checklist

- [x] Promise, outcome-first Bell view, Agent destination, hardware bridge, and DOM order are covered by runtime/assets tests.
- [x] The whole-circuit inspector exposes start, after-H, after-CNOT, and measurement states.
- [x] The Agent cards populate the existing prompt field without generating a canned response.
- [x] API/model copy makes the first Bell path explicitly independent from model configuration.
- [ ] Complete browser QA at 1280/1440/1600 and 360/390/430 in Chinese and English, including local Bell, disclosures, tooltip behavior, and no overflow.
- [ ] Complete full regression, protected-scope audit, screenshot capture, and local human-review handoff.
