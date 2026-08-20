# LoomQ Judge Guide — 60-second map

LoomQ lets people without QASM or quantum-SDK experience describe intent, receive a program-verified circuit, run it through one unified backend layer, and understand both the result and its scientific boundary. The intended users are cross-disciplinary creators, humanities/social-science students, designers, product managers, and ordinary AI users—not only quantum specialists.

## 60-second map

| Score area | Implementation | One verification command | Evidence |
|---|---|---|---|
| L1 unified layer | `loomq/compiler/`, `emitters/`, `runners/` | `.venv/bin/python evaluator.py --level l1 --target spinq,originq,braket` | `evidence/files/l1-public-report.json` |
| L2 objective | `adapter.agent_chat`, `loomq/agent/`, `llm_client.py` | `.venv/bin/python tests/public_l2_fake.py` | `evidence/README.md` |
| L2 interaction | `loomq/web/` | `.venv/bin/python -m starter_kit.loomq.web.server` from fork root | `evidence/files/qa-maxscore-*` |
| L3 | `loomq/hybrid/`, `adapter.compile_hybrid` | `.venv/bin/python evaluator.py --level l3` | `tests/test_hybrid_compiler.py` |
| Engineering | shared typed IR, independent verifier, pinned SDKs, scripts | `scripts/verify.sh` | `ARCHITECTURE.md` |
| Custom RISC-V +8 | spec + emulator + encoded E2E | `.venv/bin/python -m unittest starter_kit.tests.test_quantum_riscv_extension -v` | `QUANTUM_RISCV_EXTENSION.md` |
| Newcomer +4 | recommended no-LLM Bell path, readable Web, evidence boundary | start Web and click **第一次实验** | `USER_GUIDE.md`, `evidence/README.md` |
| L1 hardware +10 | optional genuine OriginQ/AWS jobs | `scripts/hardware_doctor.ps1` | generated only after real jobs |

Windows uses `.\.venv\Scripts\python.exe` in place of `.venv/bin/python`.

## Three L2 UX tasks

1. `我完全不懂量子，带我完成一个最简单的纠缠实验。` — observe a verified circuit, real selected SDK result, plain-language counts explanation, and boundary.
2. `我想制备 Bell 态，但这段代码有错：H q[0]; CX q[0] q[1]。保持原意并修好。` — observe one bounded correction attempt and only verified QASM reaching execution.
3. `我要运行一个 15 比特电路，不想排队、不想付费也不想注册，应该选哪个后端？` — observe canonical IDs selected from the organizer capability table.

Formal judging injects `LOOMQ_LLM_*` server-side and calls `adapter.agent_chat()` directly. The browser never accepts or stores model keys. The first Bell experiment works without an LLM.

## Reproduction

```powershell
.\starter_kit\scripts\setup.ps1
.\starter_kit\scripts\verify.ps1
.\.venv\Scripts\python.exe -m starter_kit.loomq.web.server
```

Open `http://127.0.0.1:8765/`. Evidence is under `starter_kit/evidence/`; architecture boundaries are in `ARCHITECTURE.md`. Simulator results are never described as real-QPU evidence.
