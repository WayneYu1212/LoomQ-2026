# LoomQ final release checklist — local candidate

> This is a local final-candidate handoff for human review. It is not a new submission, official score, or remote-hardware claim.

## Candidate identity

- Base UX candidate: `98d2ce03c927fab57ec12f7901652880c33afa2a`.
- Current candidate identity: `git rev-parse HEAD`.
- Final submitted identity: the exact 40-character SHA recorded in the Final Submission Issue.
- Previous accepted fallback: Issue `#119`, SHA `ac0eb3b9f37b1b85f1d7b05ab83b8ee1a7331fd5`.
- Required external actions: none performed. No push and no new Issue.
- Theoretical maximum `112` is not an awarded score.
- Final product Demo: `evidence/files/loomq-final-demo.mp4` — 8,817,627 bytes; SHA-256 `b4efb73bedeba32766e7a4a62d3149a6790352e038738a322efd08587d9d4ab2`; byte-identical to the user-provided reviewed file. No original 200+ MB recording is included.

## P0 backend merge

The candidate contains the backend polarity correction and its regression test:

- `zero_queue=true` requires `queue="none"`.
- `zero_queue=false` or null leaves queueing allowed.
- `kind=qpu` preserves a real hardware request; account and cost constraints remain explicit.
- The red-before-fix test was observed once; the corrected P0 test passes 1/1.

## Final-candidate L2 evidence

| Gate | Result | Boundary |
|---|---:|---|
| `backend-40-real` repeated gate | 5/5 | Five distinct real-model runs; canonical `originq_wukong`; no rerun substitution |
| 12 unseen paraphrases | 12/12 | Fresh prompts; canonical backend IDs; no provider timeout or semantic failure |
| Balanced 6-case gate | 6/6 | 2 generation + 2 repair + 2 backend recommendation |
| Interleaved 30-case smoke | 28/30 | 22/24 in the remaining cases; one provider timeout and one semantic backend-ID failure retained |
| Agent service | 9/9 | Local unit/integration contract |
| Timeout/campaign/watchdog focused tests | 18/18 | Local regression |
| Historical Clean V2 | 499/500 | Retained historical record; not rewritten or relabeled as current |

Retained failures in the 30-case smoke are evidence, not discarded noise:

- `backend-30-local`: provider/pipeline hard-watchdog timeout at the configured deadline.
- `backend-34-cloud-sim`: semantic failure; response did not provide a valid `braket_cloud` backend ID.

## Regression status

- Starter suite: 137/137.
- Organizer suite: 26/26.
- L1 public evaluator: PASS — 6/6 in a fresh temporary output file; canonical evidence was not overwritten.
- Public L2 fake protocol test: PASS — 1/1, one local HTTP model call.
- L3 evaluator: PASS — 1/1 public branch.
- Quantum RISC-V focused/adversarial tests: PASS — 7/7.
- Web asset/server checks: PASS — local HTTP homepage and `/api/health` returned 200; browser QA covered the final local route at 390, 360, 430, 1366, and 1440 widths, including the English control path.
- `node --check`: PASS. `compileall`: PASS. `pip check`: PASS. `git diff --check`: PASS.
- `mypy starter_kit/loomq`: PASS — no issues in 29 source files.

## Evidence and human-review boundaries

- Canonical SpinQ and OriginQ hardware evidence remains unchanged. No new hardware job was submitted.
- The five `WK_C180_2` Runtime packages remain supplemental and do not replace canonical OriginQ.
- Synthetic cognitive walkthrough is AI-assisted regression detection, not external human usability evidence.
- Final product Demo was provided and human-confirmed by the user at the canonical path above; no new recording was made and no duplicate video was added.
- Science text is a reference-based technical review, not a physical-expert endorsement.
- Provenance, raw exports, manifests, metadata, checksums, and hashes were not rewritten for tidiness.

## Final sweeps

- `SECURITY_SWEEP.md`: PASS for current tree, staged diff, history, static assets, storage-source boundary, and personal-path scan; no secret values were printed.
- `SCIENTIFIC_CLAIMS_AUDIT.md`: PASS as a reference-based final UX wording diff; it is not a physical-expert endorsement.
- `CLEAN_ROOM_REPRODUCTION.md`: PASS in a fresh no-hardlinks clone and new Python 3.10.11 venv; Docker was unavailable and the development `.venv` did not count.
- `prepare_submission.py --team-id WayneYu1212`: executed after the local candidate commit; `[FAIL]` only because the current HEAD is not on any `origin` branch. This is the intentional no-push freeze, not a product or archive failure.

## Human handoff

Before any future submission, a human must separately approve the candidate SHA, remote state, organizer evidence, real-device claims, and final UI/device review. This closeout stops locally.
