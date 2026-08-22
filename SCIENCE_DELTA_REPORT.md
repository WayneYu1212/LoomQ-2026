# LoomQ 2026 Science Delta

Baseline: accepted Issue #61 at `fe305e8176f54f390ef6e6d60367ec52b475ac85`; this candidate preserves it.

The material delta is one corrected real-QPU Bell Phi+ tomography result: `F7287E16E8478E4DB5051105468DB638` on `WK_C180_2`. Attempt 1 is retained as client-input debugging provenance. The provider fidelity is `0.952449`; independent fidelity is `0.952448944997`; PPT minimum eigenvalue is `-0.456096768`; negativity is `0.456096768`. Claim boundary: provider-reconstructed density-matrix point estimate only; no statistical confidence interval, device-independent claim, Bell-violation claim, loophole-free claim, or quantum-advantage claim.

AI-to-QPU logical-equivalence demonstration: after the tomography job had completed, a real official DeepSeek V4 Flash response produced a Bell-state program that passed LoomQ validation and was verified logically equivalent to the preparation circuit used in that completed Wukong experiment. It is not causal provenance for the earlier hardware submission. No extra QPU job was submitted. The product narrative remains one language -> OpenQASM -> typed IR -> verification -> SpinQ/OriginQ/Braket; tomography is scientific proof, not the product's primary story.

See `starter_kit/evidence/ORIGINQ_BELL_TOMOGRAPHY.md` and the final command receipts in this report's delivery checklist.

## Release-gate closure

The supplemental Runtime manifests were stale derived records after line-ending changes in QASM, metadata and normalized result payloads; raw provider JSON hashes remained unchanged. They were regenerated programmatically from current payload bytes and now pass the independent validator. Core typing checks only the core package and adapter; optional QPanda3 Runtime typing is checked in a separate fresh optional environment. The DeepSeek item is a post-completion AI-to-QPU logical-equivalence demonstration, not causal provenance for the hardware submission.
