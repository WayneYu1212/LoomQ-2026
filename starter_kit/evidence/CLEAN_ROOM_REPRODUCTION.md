# Clean-room reproduction

Date: 2026-08-25

## Method

- Docker was checked first and was unavailable on this host; no floating or unverified Docker base pin was retained.
- A fresh local clone was created with `git clone --no-hardlinks --no-local` from candidate source commit `4de249926d152616e6c82cc688e76763a222c9c9`.
- A new Python 3.10.11 venv was created in a named external temporary directory outside the development checkout. The development `.venv` was not used.
- The pinned `starter_kit/requirements.txt` was installed into that new venv.

## Results

| Check | Result |
|---|---|
| Python | PASS — 3.10.11 |
| `pip check` | PASS — No broken requirements found |
| Starter suite | PASS — 137/137 |
| Organizer suite | PASS — 26/26 |
| L1 evaluator | PASS — 6/6, all three targets across Bell and GHZ-3 |
| L3 evaluator | PASS — 1/1 public branch |
| Quantum RISC-V focused/adversarial tests | PASS — 7/7 |
| Demo byte identity | PASS — 8,817,627 bytes; SHA-256 `b4efb73bedeba32766e7a4a62d3149a6790352e038738a322efd08587d9d4ab2` |
| `starter_kit` archive projection | PASS — 11,445,642 bytes / 10.915415 MiB; one video file |

Clean-room reproduction did not submit hardware or call the real external LLM campaign. Those gates were run separately on the final candidate and are recorded in `FINAL_RELEASE_CHECKLIST.md`.

## Boundary

This is a fresh-environment reproducibility result for the local source and pinned core dependencies. It is not Docker evidence, remote-provider acceptance, real-device acceptance, or external human usability evidence.
