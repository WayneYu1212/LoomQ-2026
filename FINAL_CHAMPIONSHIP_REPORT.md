# LoomQ 2026 — Final Championship Takeover Report

> Audit date: 2026-08-22. This is the sole current candidate-status report. It distinguishes verified automation from organizer, human, device, and remote acceptance.

## A. Accepted baseline

- Accepted Issue: **#55**
- Accepted SHA: `65ce19b207ae43bc2647f85866b041badadae8bd`
- Accepted remote branch: `origin/max-score/final-112` at the same SHA.
- `git ls-files --deleted`: empty. The previously reported large deletion was not a tracked-project deletion.

## B. Candidate and working tree

- Candidate branch: `final-polish/first-place-runtime`
- Candidate is committed and pushed. Obtain its authoritative SHA with `git rev-parse HEAD`; the matching remote ref is `origin/final-polish/first-place-runtime`.
- Official `prepare_submission.py --team-id wayneyu1212` preflight passed after push; it verified the fork owner, clean tree, required files and a pushed HEAD.
- The tree was clean at preflight. `.tmp*` is ignored; no tracked path was deleted.

## C. Material improvements over #55

1. SpinQ count normalization now reduces BasicSimulator full-width keys to the actual measured-qubit order before the shared cbit remapper. The three-SDK adversarial corpus covers partial/permuted measurements, multiple cregs and little-endian output.
2. Deterministic L1, L3/hybrid and RISC-V adversarial suites add independent reference/interpreter comparisons rather than prompt-specific assertions.
3. An optional, isolated QPanda3 Runtime path records five separate Wukong `WK_C180_2` job packages. Canonical accepted evidence remains untouched.
4. DeepSeek V4 Flash local robustness evidence has a programmatic 102/101/1 source-of-truth validator; it remains local evidence, not an organizer L2 score claim.
5. Bell X/Y measurements and formulas are retained as three-basis point estimates, while the unsupported binomial confidence/witness claim and Runtime-derived Wilson intervals were removed.
6. Runtime manifest self-hash entries were removed; all payload hashes now verify without touching raw data.

## D. Score matrix (organizer ownership)

| Area | Maximum | Objective evidence | Manual evidence / uncertainty |
|---|---:|---|---|
| L1 | 45 | 6/6 public evaluator and 35 software/semantic checks pass; accepted SpinQ and OriginQ canonical packages validate locally | Hardware traceability and allocation remain organizer-reviewed; Runtime packages are supplemental and not part of this score gate |
| L2 | 30 | Public contract passes; local DeepSeek summary is 102 total, 101 pass, 1 transient | Interaction quality and private semantics are organizer/human-scored; local stress is not an official score |
| L3 | 15 | Public evaluator plus hybrid/RISC-V and adversarial tests pass | Organizer hidden cases remain external |
| Engineering | 10 | Fresh Python 3.10 environment, 89 submission tests, 26 organizer tests, compileall, mypy and diff check pass | Deployment/container review remains separate |
| Bonus | 12 | RISC-V and web/product artifacts are testable | Bonus allocation is manual; no score is asserted here |

## E. Hardware evidence inventory

| Package | Job ID | Device / requested shots | Raw SHA-256 | Claim boundary |
|---|---|---|---|---|
| SpinQ | `G-260820-0008` | SpinQ 2-qubit NMR / N/A | `94e0174d7acf6c10f273513c203eeb8864e044e44eaa32a88d22508761abff64` | Ensemble probabilities; no discrete shots fabricated |
| Accepted OriginQ | `D0C7F490B43D9B04FDF19ABF3DB8B342` | Wukong 180-2 / 1000 | `4616e632a168b1dd04fc9e0f5fbc0407e3d7f6bb6edff02d4a1fe353e09f3d11` | Canonical #55 calculation-basis correlation; not an entanglement proof |
| Runtime Bell Z | `2C68A9D3E2F6626B55EEC966DBC3CE2B` | WK_C180_2 / 1000 | `7cbef6e85a517a4df3b92368fdee3a80e3bdd85d7d60a72fa6a2d08c0249a1c7` | Provider probability point estimate; no raw-shot CI |
| Runtime GHZ-3 | `B23E5B75D47D124A078F25B1C0083C2A` | WK_C180_2 / 1000 | `7b2c1a33a03ce80c6f380223ba29f459b3ce834eb045033fb20c4f69b7887f99` | No multipartite-entanglement claim |
| Runtime Multi | `8575222FE2C04A065B38B9DEE5BA9AEE` | WK_C180_2 / 1000 | `268b315ac5501b3376f955e8990291f16d18a77a8e67de741b074be9f47746ca` | Distribution comparison only |
| Runtime Bell X | `CA80432C12CFA2EBB33AC9A14C3AFF20` | WK_C180_2 / 1000 | `b17b424e13a1b35bace2ef7743ab4cccc96f3d120fc6476091822cda27bc0cf1` | Provider probability point estimate |
| Runtime Bell Y | `5ABEAE903BE47DDEDCDEFABFBE162904` | WK_C180_2 / 1000 | `24e05214fae35dec8cbb169433782637edb3b32d101c9289e0e3a7229e139227` | Provider probability point estimate |

Supplemental Runtime validator: PASS — 5 packages, 5 unique jobs, non-empty QASM, preserved provider probabilities, payload SHA-256, cross-job separation, no secret-like keys, no fabricated timestamp and no fabricated per-shot counts. This is an offline integrity check, not remote provider verification.

## F. Bell three-basis recomputation

- Raw provider probabilities produce `Cxx = 0.9995576`, `Cyy = -0.9986527`, `Czz = 0.9995545`.
- `|Cxx| + |Czz| = 1.9991121`.
- `F(Phi+) = (1 + Cxx - Cyy + Czz) / 4 = 0.9994412`.
- X basis uses H/H before measurement. Y basis uses Sdg/Sdg then H/H; the SDK submission uses the functionally equivalent S-cubed decomposition.
- The raw Runtime output consists of provider floating-point probabilities, not raw per-shot counts (for example, probability times 1000 is non-integral). Therefore `statistical_inference` is `not_computed`: no binomial CI, Wilson CI, entanglement-witness result, or fidelity-threshold result is claimed.

## G. DeepSeek evidence

- Source of truth: `starter_kit/evidence/files/l2-deepseek-v4-flash-stress-summary.json`
- Total / pass / fail: **102 / 101 / 1**; one non-reproduced transient model-output failure.
- Latency: mean 7946 ms, p50 7688.9 ms, p95 9032.2 ms.
- Boundary: participant-side local robustness evidence only; it does not replace organizer private L2 evaluation or establish an official L2 score.

## H. Adversarial validation

- L1: deterministic corpus across parser, validator, reference simulator and all three SDK runners; includes partial/permuted measurement, multiple cregs and little-endian cases.
- L3/hybrid: 240 differential subcases from deep nesting, all three-bit injections, negative arithmetic, shared registers and multiple classical blocks.
- RISC-V: instruction round-trip and machine-word end-to-end adversarial tests pass.
- SpinQ review: the minimal full-width-key reduction is covered by the cross-SDK corpus and 89-test clean-env submission suite.

## I. Clean environments

- Core: a newly created Python 3.10 temporary environment installed only `starter_kit/requirements.txt`; `pip check` passed. The requested deletion of existing `.venv-clean` was blocked by the local command safety layer before execution, so this fresh external environment is the actual clean-env evidence.
- Core regression: 26 organizer tests, 89 submission tests, L1 6/6, L2 public, L3 public, hybrid/RISC-V, Web, hardware tools, L2 validator, compileall, narrow mypy and `git diff --check` all passed.
- Optional Runtime: a second new Python 3.10 environment installed both requirements files; imports passed. Doctor reported runtime available and token absent, exiting 2 as designed. No hardware job was submitted.

## J. Web

- Automated Web evidence: 13 Web asset/server tests pass, including same-origin API, safe DOM rendering, accessible labels/live region, reduced-motion and request boundary behavior.
- The prior handoff reported browser QA, but this takeover found no durable five-viewport screenshot/report artifact. Five-viewport visual acceptance is **NOT REVERIFIED**; automated desktop checks are not a substitute for device/human acceptance.

## K. Security and archive

- Security scan found 0 secret-value heuristics in `starter_kit` (OpenAI-like keys, AWS access keys, long Bearer values, Origin token assignments, private-key blocks). Symbol names and test fixtures were reviewed separately and are not credentials.
- No `C:\\Users\\`, `UUWayne`, browser-profile path, or browser artifacts were found in candidate-facing text.
- Candidate `starter_kit` projection: 1,391,830 bytes (1.327 MiB), below the 100 MiB limit.
- `.tmp*` is ignored. No temporary script/log is part of the projected `starter_kit` archive.

## L. Competition context

`COMPETITOR_AUDIT_FINAL.md` is retained only as a historical, public-source research snapshot. It contains no copied competitor code. It is not used to claim a score or current submission state.

## M. Remaining risks and hard gates

1. The strict canonical hardware validator passes accepted SpinQ and canonical OriginQ packages; only these packages are used for the L1 hardware ladder. Supplemental Runtime packages are validated by their dedicated probability-only validator and do not replace or add to the canonical platform claim.
2. Runtime results are provider probabilities without raw counts or a documented uncertainty/mitigation model. The point estimates are retained, but no statistical witness/fidelity certification is claimed.
3. Docker was not tested locally, and five-viewport human browser acceptance was not reverified.

## N. Recommendation

**READY FOR NEW FINAL SUBMISSION: YES**

The official score gate is satisfied by the accepted canonical SpinQ and OriginQ packages. The five Runtime packages remain supplemental participant-side engineering/scientific evidence. No new hardware submission, Issue creation, force push, baseline rewrite, or raw-evidence overwrite was performed.
