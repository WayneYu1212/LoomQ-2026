# Organizer Intent Alignment Audit

> Scope: read-only audit of accepted #61 (`fe305e8`). No product, evidence, test, hardware, or submission change is proposed by this document.

## Evidence reviewed

- `starter_kit/README.md`
- `starter_kit/JUDGE_GUIDE.md`
- `starter_kit/ARCHITECTURE.md`
- `starter_kit/USER_GUIDE.md`
- `starter_kit/loomq/web/static/index.html` and `app.js` first-run flow

## A. Main narrative: One language → many quantum machines

**PASS, but not maximally foregrounded.** The README opening states that one unified IR is sent to three platforms. The next delivery summary names one parser, one frozen IR, and three emitters. `IMPLEMENTATION_EXPLAINER.md` states the same idea in newcomer language. This directly matches the organizer's core task.

The limitation is ordering: the mission is immediately followed by a competition-delivery inventory. A judge can find the interoperability thesis, but the first visual emphasis after the title is not a concise platform-bridge promise.

## B. End-to-end compiler path

**PASS.** README's architecture graph explicitly shows OpenQASM 2.0 → unified parser → Typed Circuit IR → SpinQ/OriginQ/Braket emitters → three SDK runners → unified counts schema → explanation/evidence. `ARCHITECTURE.md` supplies the non-marketing detail: one immutable `Circuit`, platform-specific native artifacts, runner semantics, and normalization rules.

This is unusually legible evidence that LoomQ is a translation layer rather than three unrelated example programs.

## C. Fourth-backend extensibility

**PARTIAL.** The underlying boundaries are clear: `compiler/`, `emitters/`, `runners/`, `runners.result`, and a shared typed `Circuit`. A technically fluent reviewer can infer the extension route.

However, none of the reviewed documents gives a short, explicit “add a fourth backend” contract: required emitter artifact, runner adapter, measurement-order declaration, result normalization, capability entry, and cross-backend tests. This weakens the open-source/community motivation more than it weakens the present L1 implementation.

## D. Newcomer path / first 60 seconds

**PARTIAL-to-PASS after setup.** The first-run flow is strong once the local service is running:

1. Click **第一次实验**.
2. Click **运行实验**.
3. See circuit, counts, verification rows, and the boundary between a local simulator result and real-QPU evidence.

The UI is intentionally no-LLM and no-key for this path; `USER_GUIDE.md` explains qubit, gate, shots, and counts before asking a newcomer to write QASM. This strongly supports accessibility.

The documentation calls this a “five-minute path,” rather than showing an explicit under-60-second success criterion after setup. The first success state and the one scientific lesson could be more prominent.

## E. Narrative balance

**Moderate imbalance.** README, `ARCHITECTURE.md`, and `USER_GUIDE.md` explain interoperability and accessibility well. `JUDGE_GUIDE.md` appropriately uses a score map, but its opening table and README's delivery bullets give tests, hardware, and scoring evidence nearly equal visual weight to the platform-bridge story.

This is not an overclaim problem. It is a sequencing problem: an organizer looking for standards/interoperability and developer access should encounter those two ideas before the evidence inventory.

## F. Five high-value narrative adjustments

1. **Lead README and Judge Guide with one stable sentence:** “LoomQ accepts OpenQASM once, validates it once, and emits executable artifacts for multiple quantum machines.” Put score/evidence after this statement.
2. **Add a one-screen “add a fourth backend” guide in `ARCHITECTURE.md`:** typed IR input, emitter, runner, declared native bit ordering, normalization, capability table, and shared differential tests. Do not invent a fourth backend.
3. **Rename the newcomer route around the outcome:** “60 秒完成第一次量子实验（完成环境启动后）”; show the exact two clicks, expected 00/11 result, and the one-line simulator boundary together.
4. **Make the open-source/community angle concrete:** point contributors to `target_ir_contract.md` and describe the target adapter boundary as a reusable extension seam, not merely a contest implementation detail.
5. **Move proof volume below the product thesis:** retain all tests/hardware/score evidence, but group it under “How judges can verify the bridge” rather than mixing it into the first statement of what LoomQ is.

## Resubmission decision

These are wording, information-architecture, and contributor-onboarding improvements. They do not reveal a missing compiler, runner, normalization, or newcomer-flow capability. They are **not** sufficient to justify a new Final Submission.

**DO NOT RESUBMIT FOR THIS ALONE.**
