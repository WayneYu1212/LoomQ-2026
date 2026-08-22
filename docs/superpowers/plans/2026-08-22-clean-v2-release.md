# Clean V2 Final Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a clean, auditable LoomQ V2 release candidate with isolated campaign tests, a bounded 500-case real-model harness, preserved historical evidence, and exact final-release verification.

**Architecture:** Keep campaign generation, watchdog execution, checkpoint serialization, and evidence validation in the existing `starter_kit` Python layout. Unit tests use temporary destinations; only an explicit production campaign command may target the versioned V2 evidence paths. Existing hardware/provider evidence remains read-only.

**Tech Stack:** Python 3.10, `unittest`, existing LoomQ agent/compiler validators, PowerShell, Git, and the existing submission archive tool.

**Spec:** `C:/Users/UUWayne/.codex/attachments/fcadcc30-e8bd-4824-89f4-8dbae350b181/goal-objective.md`

## Global Constraints

- Work only in `C:/Users/UUWayne/LoomQ-2026-submission-final` on `submission/final`.
- Preserve accepted baseline `9c2cac2f058680ce38ecc77be207b7b09b87cbcb` and unrelated dirty worktrees.
- Never reconstruct or commit the invalid 7-record V1 artifact; never fabricate campaign records.
- Tests must use temporary paths and must not alter formal evidence SHA-256 values.
- No new hardware, QPU, tomography, Bell, GHZ, UI redesign, or large CSS changes.
- Never print secret values; environment checks may print only `PRESENT` or `MISSING`.
- Do not push, prepare an archive, or commit until the staged diff and all required validations are clean.

### Task 1: Quarantine and inventory evidence

**Files:**
- Modify: `starter_kit/evidence/files/` only by moving the confirmed untracked invalid V1 summary outside the repository.
- Read: existing tracked historical L2, hardware, vendor, fuzz, tomography, and runtime evidence.

**Interfaces:**
- Produces: a clean formal evidence path and a before/after SHA inventory for raw provider files.

- [x] Confirm current branch, worktree, HEAD, origin HEAD, and the invalid summary record count.
- [x] Move only the confirmed untracked 7-record synthetic artifact to `C:/Users/UUWayne/LoomQ-2026-forensics/invalid-campaign-v1-20260822/`.
- [ ] Verify historical 102-case evidence and raw provider file hashes are unchanged.

### Task 2: Make the campaign harness V2-safe

**Files:**
- Modify: `starter_kit/scripts/l2_extended_campaign.py`
- Modify: `starter_kit/scripts/campaign_watchdog.py`
- Test: `starter_kit/tests/test_campaign_watchdog.py`
- Test: `starter_kit/tests/test_l2_extended_campaign.py`
- Test: `starter_kit/tests/test_llm_transport_timeout.py`

**Interfaces:**
- `build_corpus(seed: int) -> list[dict]` returns exactly 500 unique V2 cases with category budgets 150/150/120/50/30.
- `run_case_with_watchdog(case: dict, request_budget: int | None) -> dict` executes one single-flight child under the bounded deadline.
- Production checkpoints use `l2-deepseek-v4-flash-validation-v2-summary.json` and `l2-deepseek-v4-flash-validation-v2-records.jsonl` only when explicitly requested.

- [ ] Add failing tests for V2 paths, 540 attempt cap, atomic JSON/JSONL checkpointing, duplicate detection, and a test-side-effect guard.
- [ ] Run the focused tests and observe the expected failures against the current V1 implementation.
- [ ] Implement the smallest general fix: versioned V2 state, explicit production destination, temp-path test injection, and bounded accounting.
- [ ] Run focused harness tests, then the full campaign regression suite; verify formal evidence hashes are unchanged.

### Task 3: Run release gates and environment check

**Files:**
- Read/execute: existing offline validators and `starter_kit/scripts/verify.ps1`.
- Create: V2 evidence/checkpoint files only if the redacted environment gate is fully present and matches `deepseek-v4-flash`.

**Interfaces:**
- Produces: offline gate receipts and, only when authorized by the environment gate, the actual V2 campaign records and summary.

- [ ] Run watchdog, transport, corpus, resume, pause, duplicate, budget, and isolation tests offline.
- [ ] Print only `PRESENT`/`MISSING` for the three LLM variables and verify the model name without printing its value.
- [ ] If blocked, record `REAL_MODEL_ENV_BLOCKED` and do not call the API; otherwise run V2 single-flight with max 540 attempts and atomic per-case checkpoints.
- [ ] Run checkpoint integrity checks at 50/100/200/300/400/500 attempted cases.

### Task 4: Final evidence, documentation, and security audit

**Files:**
- Modify: `starter_kit/evidence/README.md`
- Modify: `starter_kit/JUDGE_GUIDE.md`
- Create: `starter_kit/evidence/L2_REAL_MODEL_VALIDATION_V2.md`

**Interfaces:**
- Produces: concise judge navigation with direct links and reproduction commands, preserving historical `101/102` separately from actual V2 results.

- [ ] Run existing validators for L1, L2 public, L3, Web, RISC-V, runtime, tomography, vendor, and fuzz artifacts without rerunning hardware.
- [ ] Run fresh Python 3.10 dependency and core-mypy checks when the environment supports them; classify optional type debt separately.
- [ ] Scan tracked files, V2 artifacts, staged diff, and final archive for secrets and forbidden temporary paths without printing values.
- [ ] Review `git diff --check`, intended file list, and all evidence hashes.

### Task 5: Commit and delivery gate

**Files:**
- Modify only explicitly reviewed files in the staged diff.

**Interfaces:**
- Produces: a clean commit, prepared submission archive metadata, and a non-force-pushed `submission/final` remote SHA only if every gate passes.

- [ ] Stage only intended files and inspect the staged diff.
- [ ] Commit with `test: strengthen real-model validation harness` or an equally accurate message.
- [ ] Confirm clean status, run `prepare_submission --team-id WayneYu1212`, record archive bytes/SHA/extract/security checks, and compare material improvement against #63.
- [ ] Push `submission/final` without force only after the user-authorized release conditions are satisfied; generate a copyable issue title/body but do not create an issue.
