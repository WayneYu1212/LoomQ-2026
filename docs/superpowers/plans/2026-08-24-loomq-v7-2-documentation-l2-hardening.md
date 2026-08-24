# LoomQ V7.2 Documentation Sync and L2 Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Synchronize the public V7.2 documentation with the accepted `#119` fallback and harden the L2 transport so two bounded model attempts fit inside the official 120-second case budget without changing Agent semantics or evidence.

**Architecture:** Keep the V7.2 static Web patch unchanged except for documentation references and selected evidence screenshots. In `starter_kit/llm_client.py`, parse the configured timeout, reject non-finite or non-positive values, and pass `min(configured_timeout, 55.0)` to `urlopen`; leave the existing one-correction orchestration and deterministic backend selector untouched.

**Tech Stack:** Python 3.10 standard library, `unittest`, static Markdown, existing LoomQ Web screenshots, Git worktree.

**Spec:** `C:/Users/UUWayne/Downloads/LoomQ_V7_2_Documentation_Sync_Checklist.md` and `C:/Users/UUWayne/Downloads/LoomQ_V7_2_L2_Hardening_Addendum (1).md`

## Global Constraints

- Keep `ac0eb3b9f37b1b85f1d7b05ab83b8ee1a7331fd5` as the accepted fallback through `59b33e0c07f08b4cef2d27d0af060a40beae607a` and this candidate; never rewrite raw hardware evidence, job IDs, tomography values, or provenance history.
- Do not change Agent task semantics, correction retry count, evaluator contracts, `submission.yaml`, requirements, or backend output policy.
- Cap each transport attempt at `55.0` seconds; retain an explicitly smaller configured timeout; reject `nan`, `inf`, `-inf`, and non-positive values before network access.
- Keep deterministic backend output as all compatible canonical IDs selected from `backend_capabilities.json`; do not add a third model call or mechanically adopt single-ID output.
- Keep `112` labeled as the official theoretical ceiling, never an awarded score.
- Do not push, submit, create a new Final Submission Issue, or claim private/real-device acceptance from local evidence.

---

### Task 1: Verify the isolated baseline and protected scope

**Files:**
- Read: accepted/V7.2 Git history, `starter_kit/llm_client.py`, Agent tests, documentation files, and existing V7.2 QA screenshots.
- Create: `docs/superpowers/plans/2026-08-24-loomq-v7-2-documentation-l2-hardening.md`

- [ ] **Step 1: Confirm worktree and parent.**

Run:

```powershell
git status --short --branch
git log -2 --format="%h %H %s%nparent=%P"
```

Expected: branch `codex/loomq-v7.2-docs-l2-hardening`, clean before plan creation, and `HEAD` at `59b33e0c07f08b4cef2d27d0af060a40beae607a` with parent `ac0eb3b9f37b1b85f1d7b05ab83b8ee1a7331fd5`.

- [ ] **Step 2: Run the fresh baseline regression.**

Run:

```powershell
& 'C:\Users\UUWayne\LoomQ-venvs\accepted69-v6-baseline-20260823\Scripts\python.exe' -X utf8 -m unittest discover -s starter_kit/tests -p 'test_*.py'
```

Expected: the V7.2 parent suite passes before any L2 hardening or documentation synchronization.

### Task 2: Add failing L2 transport and policy tests

**Files:**
- Modify: `starter_kit/tests/test_llm_transport_timeout.py`
- Modify: `starter_kit/tests/test_agent_service.py`

**Interfaces:**
- Consumes: current `_configuration()`, `chat_completion()`, `agent_chat()`, and `select_backends()` behavior.
- Produces: executable regression coverage for timeout cap, smaller timeout preservation, non-finite rejection before `urlopen`, exactly-two-call correction recovery, secret-safe errors, and all-compatible canonical backend output.

- [ ] **Step 1: Write timeout-cap tests before changing production code.**

Add tests that patch the environment with the required variables and assert:

```python
with mock.patch.dict(os.environ, {**base_env, "LOOMQ_LLM_TIMEOUT_SECONDS": "120"}, clear=True):
    self.assertEqual(_configuration()[3], 55.0)
with mock.patch.dict(os.environ, {**base_env, "LOOMQ_LLM_TIMEOUT_SECONDS": "12.5"}, clear=True):
    self.assertEqual(_configuration()[3], 12.5)
for value in ("nan", "inf", "-inf"):
    with self.subTest(value=value), mock.patch.dict(os.environ, {**base_env, "LOOMQ_LLM_TIMEOUT_SECONDS": value}, clear=True):
        with mock.patch("urllib.request.urlopen") as urlopen, self.assertRaises(RuntimeError):
            chat_completion([{"role": "user", "content": "x"}])
        urlopen.assert_not_called()
```

Keep the existing accepted-connection timeout test and existing secret-safe Agent test.

- [ ] **Step 2: Strengthen the existing two-attempt test.**

Keep its malformed/invalid first response and valid second response, assert exactly two request payloads, assert the returned text contains only the verified final QASM, and assert the invalid gate is absent. Do not introduce a third request.

- [ ] **Step 3: Add an exact canonical backend rendering assertion.**

For the 15-qubit zero-queue/free/accountless recommendation, compute the expected IDs with `select_backends(BackendConstraints(...))`, extract canonical IDs from rendered `- <id> — ...` lines, and assert the rendered set equals the selected set. This locks the current all-compatible output policy without changing selector code.

- [ ] **Step 4: Run only the new/affected tests and observe RED.**

Run:

```powershell
& 'C:\Users\UUWayne\LoomQ-venvs\accepted69-v6-baseline-20260823\Scripts\python.exe' -X utf8 -m unittest starter_kit.tests.test_llm_transport_timeout starter_kit.tests.test_agent_service
```

Expected: the new timeout-cap and non-finite tests fail because current transport passes configured `120` through and accepts non-finite floats; existing correction, secret, and backend tests remain informative.

### Task 3: Implement the narrow transport hardening

**Files:**
- Modify: `starter_kit/llm_client.py`

**Interfaces:**
- Consumes: `LOOMQ_LLM_TIMEOUT_SECONDS` as a user/organizer-provided numeric string.
- Produces: `_configuration()` returning the effective per-attempt timeout; `chat_completion()` continuing to make one HTTP request per invocation with the existing payload and error boundary.

- [ ] **Step 1: Add the explicit cap and finite-value guard.**

Use `math.isfinite()` and:

```python
MAX_ATTEMPT_TIMEOUT_SECONDS = 55.0

timeout = float(os.environ.get("LOOMQ_LLM_TIMEOUT_SECONDS", "120"))
if not math.isfinite(timeout):
    raise RuntimeError("LoomQ L2 timeout must be finite")
if timeout <= 0:
    raise RuntimeError("LoomQ L2 timeout and output-token limit must be positive")
timeout = min(timeout, MAX_ATTEMPT_TIMEOUT_SECONDS)
```

Preserve the existing output-token parsing, required-variable checks, URL construction, authorization header behavior, and exception messages that do not expose values.

- [ ] **Step 2: Run the affected tests GREEN.**

Run the Task 2 command again. Expected: timeout cap, smaller-value, non-finite, two-attempt, secret, and backend policy tests pass.

### Task 4: Synchronize V7.2 public documentation

**Files:**
- Modify: `starter_kit/FINAL_HUMAN_CHECKLIST.md`
- Modify: `starter_kit/evidence/SCORECARD.md`
- Modify: `starter_kit/JUDGE_GUIDE.md`
- Modify: `starter_kit/README.md`
- Modify: `starter_kit/USER_GUIDE.md`
- Modify: `starter_kit/evidence/README.md`

- [ ] **Step 1: Replace stale accepted metadata.**

In `FINAL_HUMAN_CHECKLIST.md`, replace the current accepted reference with previous accepted fallback `#119 / ac0eb3b9...`, remove the claim that #55 is current final, and retain hardware records and the `112` theoretical-ceiling wording. Keep the V7.2 candidate SHA as `<V7.2 SHA>` until this candidate is committed.

- [ ] **Step 2: Update the scorecard boundary.**

In `evidence/SCORECARD.md`, identify `#119` as previous accepted fallback, remove `#55`/`max-score/final-112` as current final metadata, and keep `112` explicitly as “theoretical ceiling, not awarded score.” Do not alter evidence values or scoring targets.

- [ ] **Step 3: Merge the duplicate Judge Guide route.**

Keep one V7.2 60-second route that starts with “开始前，先认四件事,” continues through one qubit → CNOT/Bell → no-key Bell run → OpenQASM/result → tomography/hardware. Remove the duplicate bottom “V7 MAX 评委 60 秒核验” route. Move the existing provenance discrepancy into a separate detailed scientific/provenance note, outside the 60-second route, without changing hashes or raw-history language.

- [ ] **Step 4: Sync README to the V7.2 newcomer route.**

Replace the V2 GHZ screenshot with the selected V7.2 onboarding screenshot, change “V7.1 人类审核” to V7.2, describe `开始前，先认四件事 → Bell → run`, retain one-command startup and the no-model-Key Bell path, and state that a configured `120` timeout is capped to `55` per transport attempt. Do not expand README into an audit report.

- [ ] **Step 5: Sync the linked beginner guide.**

In `USER_GUIDE.md`, change the V7.1/V7 MAX headings to V7.2, put “开始前，先认四件事” before the Bell run in the five-minute path, retain the no-model-Key statement, and replace the “评委证据路线” wording with a neutral archived-evidence description.

- [ ] **Step 6: Sync evidence screenshot references.**

Replace stale Web screenshot names in `evidence/README.md` with the selected 2–4 V7.2 evidence files; update the newcomer path to reference the V7.2 onboarding block. Keep evidence values, job IDs, raw files, and archive boundaries unchanged.

### Task 5: Add only selected V7.2 screenshot assets

**Files:**
- Create: `starter_kit/evidence/files/v7.2-zero-knowledge-intro-1440.png`
- Create: `starter_kit/evidence/files/v7.2-bell-result-openqasm-1440.png`
- Create: `starter_kit/evidence/files/v7.2-api-optional-390.png`
- Create: `starter_kit/evidence/files/v7.2-mobile-full-390.png`

- [ ] **Step 1: Copy the four already captured QA screenshots.**

Copy from `C:\Users\UUWayne\LoomQ-2026-v7.2-zero-knowledge-qa`:

```text
02-zero-knowledge-intro.png -> v7.2-zero-knowledge-intro-1440.png
08-openqasm-result-layout.png -> v7.2-bell-result-openqasm-1440.png
17-mobile-api-optional.png -> v7.2-api-optional-390.png
19-mobile-full-footer.png -> v7.2-mobile-full-390.png
```

Do not copy the full QA directory or add raw evidence.

- [ ] **Step 2: Check asset size and references.**

Run:

```powershell
Get-ChildItem starter_kit/evidence/files/v7.2-*.png | Select-Object Name,Length
rg -n "v7\.2-|qa-desktop-ghz|web-qa-homepage" starter_kit/README.md starter_kit/evidence/README.md
```

Expected: four bounded screenshots are referenced; no old screenshot remains in the updated newcomer/documentation paths.

### Task 6: Full verification, protected-scope audit, and local handoff

**Files:**
- Read: all changed files and Git diff against `59b33e0` / accepted parent.

- [ ] **Step 1: Run the complete regression gates.**

Run the affected tests, full project suite, `node --check starter_kit/loomq/web/static/app.js`, `git diff --check`, and the relevant Web asset tests. The full suite must pass with zero failures.

- [ ] **Step 2: Audit prohibited paths and values.**

Run:

```powershell
git diff --name-only 59b33e0c07f08b4cef2d27d0af060a40beae607a..HEAD
git diff -- starter_kit/evidence/files starter_kit/hardware starter_kit/evaluator.py starter_kit/submission.yaml starter_kit/requirements.txt
rg -n "65ce19b|Issue #55|max-score/final-112|V7\.1|V7 MAX|获得 112 分" starter_kit/FINAL_HUMAN_CHECKLIST.md starter_kit/evidence/SCORECARD.md starter_kit/JUDGE_GUIDE.md starter_kit/README.md starter_kit/USER_GUIDE.md starter_kit/evidence/README.md
```

Expected: only the planned files/assets are changed; protected code/evidence diff is empty; stale metadata and awarded-score claims are absent from synchronized docs.

- [ ] **Step 3: Stage explicit paths and run staged checks.**

Stage only the plan, timeout/tests, six documentation files, and four selected PNGs. Run `git diff --cached --check` and a staged secret scan before committing.

- [ ] **Step 4: Commit locally and verify.**

Create a local commit with message `feat: sync V7.2 docs and harden L2 timeout`, verify the parent remains the V7.2 candidate, report the new SHA, and do not push or create a submission Issue.
