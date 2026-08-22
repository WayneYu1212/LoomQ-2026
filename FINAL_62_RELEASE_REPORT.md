# Final #62 Release Report

- Accepted #61 baseline: `fe305e8176f54f390ef6e6d60367ec52b475ac85` (unchanged).
- Candidate: `championship/science-delta`.
- Material delta: completed Wukong Bell Phi+ tomography `F7287E16E8478E4DB5051105468DB638`; audit and claim boundaries are in `starter_kit/evidence/ORIGINQ_BELL_TOMOGRAPHY.md`.
- Attempt 1 is preserved as a client-side missing-measurement error; it is not a provider failure.
- Manifest drift: derived manifests were stale after non-raw payload line-ending changes. All provider raw JSON hashes remained intact; manifests were regenerated from payload byte size and SHA-256 without self-reference.
- Typing: core and optional Runtime have separate fresh-Python-3.10 gates. Third-party SDK stub gaps use only local `import-untyped` boundaries.
- DeepSeek: real V4 Flash generated a validated Bell program after the QPU job completed; this is logical-equivalence replay, not causal job provenance.
- No new QPU job, force push, #61 modification, or Issue #62 creation occurred.
