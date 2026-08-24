# LoomQ Judge Guide — 60-second map

LoomQ lets people without QASM or quantum-SDK experience describe intent, receive a program-verified circuit, run it through one unified backend layer, and understand both the result and its scientific boundary. The intended users are cross-disciplinary creators, humanities/social-science students, designers, product managers, and ordinary AI users—not only quantum specialists.

**One language → many quantum machines:** OpenQASM is parsed once into a typed IR, verified once, and emitted to SpinQ, OriginQ and Braket. The evidence below verifies that bridge.

## 60-second experience

1. 从 Hero 进入：“先看见一个结果，再走进量子世界”。
2. 向下认识一个量子比特，并观察 `H` 如何改变可能性。
3. 进入 Bell 故事，看见 `00/11` 相关结果。
4. 页面把计算基相关性与需要更多测量方向的完整纠缠判断清楚分开。
5. 点击 **重做刚才的 Bell 实验**，载入同一条 Bell 电路。
6. 点击 **执行这个实验**，检查真实本地 SDK 返回的 counts、解释、电路与 QASM。
7. 继续滚动到 tomography 与硬件证据，确认多方向测量、数学重建与可追溯证据的关系。

## Technical evidence map

| Score area | Implementation | One verification command | Evidence |
|---|---|---|---|
| L1 unified layer | `loomq/compiler/`, `emitters/`, `runners/` | `.venv/bin/python evaluator.py --level l1 --target spinq,originq,braket` | `evidence/files/l1-public-report.json` |
| L2 objective | `adapter.agent_chat`, `loomq/agent/`, `llm_client.py` | `.venv/bin/python tests/public_l2_fake.py` | `evidence/README.md` |
| L2 historical real-model validation | Historical DeepSeek V4 Flash robustness set | `python scripts/validate_l2_stress.py` | `evidence/L2_REAL_MODEL_VALIDATION.md` — 101/102 |
| L2 Clean V2 real-model validation | Bounded single-flight campaign, 500 unique cases | `python scripts/l2_extended_campaign.py --production --limit 500 --checkpoint 50 --resume` | `evidence/L2_REAL_MODEL_VALIDATION_V2.md` — 499/500, 509/540 attempts |
| L2 interaction | `loomq/web/` | `.venv/bin/python -m starter_kit.loomq.web.server` from fork root | `evidence/files/web-qa-*` |
| L3 | `loomq/hybrid/`, `adapter.compile_hybrid` | `.venv/bin/python evaluator.py --level l3` | `tests/test_hybrid_compiler.py` |
| Engineering | shared typed IR, independent verifier, pinned SDKs, scripts | `scripts/verify.sh` | `ARCHITECTURE.md` |
| Custom RISC-V +8 | spec + emulator + encoded E2E | `.venv/bin/python -m unittest starter_kit.tests.test_quantum_riscv_extension -v` | `QUANTUM_RISCV_EXTENSION.md` |
| Newcomer +4 | recommended no-LLM Bell path, readable Web, evidence boundary | start Web and click **重做刚才的 Bell 实验** | `USER_GUIDE.md`, `evidence/README.md` |
| L1 hardware +10 | genuine SpinQ + OriginQ task records | `.venv/bin/python -m starter_kit.hardware.validate_evidence evidence/files/spinq-hardware-metadata.json evidence/files/originq-hardware-metadata.json` | `evidence/HARDWARE_EVIDENCE_SUMMARY.md` |
| Vendor SDK cross-validation | 40 fixed-seed circuits × 3 local runners | read-only evidence validator | `evidence/files/vendor-sdk-cross-validation-summary.json` — 120/120 |
| Fixed-seed fuzz | parser, measurement, hybrid, RISC-V and security corpus | read-only evidence validator | `evidence/files/offline-fuzz-summary.json` — 35,000/35,000 |
| OriginQ modern Runtime (supplemental) | Five separate `WK_C180_2` probability-only packages; not required for L1 hardware ladder or +10 | `.venv/bin/python starter_kit/scripts/validate_runtime_evidence.py` | `evidence/ORIGINQ_REPRODUCIBILITY.md`, `evidence/files/originq_runtime_*-manifest.json` |
| OriginQ Bell tomography (supplemental science) | Real `WK_C180_2` Bell Φ+ tomography; supplemental, not additional L1 hardware points | `.venv/bin/python starter_kit/scripts/validate_originq_tomography.py` | `evidence/ORIGINQ_BELL_TOMOGRAPHY.md`, `evidence/files/originq-tomography/originq_tomography_bell_phi_plus-corrected-density-audit.json` |

Windows uses `.\.venv\Scripts\python.exe` in place of `.venv/bin/python`.

## Dependency isolation (important for judges)

The **core evaluator does not require** `qpanda3-runtime` / `pyqpanda3`. Those are **optional** and isolated in `requirements-originq-runtime.txt`; they are only needed to reproduce the modern Origin Wukong 180-2 Runtime path (`originq_runtime_real.py`). The legacy `originq_real.py` (pyqpanda QCloud, chip 72) remains preserved for canonical two-platform hardware evidence. Installing only `requirements.txt` yields a clean core that runs all L1/L2/L3, SpinQ, Braket, and RISC-V tests.

## Scientific honesty boundary

- **Simulator** results (SpinQit / pyQPanda CPUQVM / Braket LocalSimulator) are never described as real-QPU evidence.
- **Real QPU** results are only the recorded task IDs with provider exports.
- **Computational-basis correlation** (e.g. Bell 00/11) alone is reported as *correlation consistent with the target circuit*, not as a proof of entanglement — a classical mixture could produce the same Z-basis marginals.
- **Three-basis Bell point estimates (2026-08-22)**: a pre-registered experiment on `WK_C180_2` qubits [49,58] (Z job `2C68A9D3`, X job `CA80432C`, Y job `5ABEAE90`, 1000 requested shots each) measured Cxx=0.9996, Cyy=−0.9987, Czz=0.9996, yielding |Cxx|+|Czz|=1.999 and F_Phi+=0.9994. The Runtime API exported provider probabilities rather than raw per-shot counts, so no independently justified confidence interval is available and this is **not** presented as a statistical entanglement witness or fidelity-threshold result. Theory (separable bound and formula) was checked programmatically before hardware submission; recompute point estimates with `.venv/bin/python starter_kit/scripts/compute_bell_witness.py` → `evidence/files/bell-witness-analysis.json`.
- **Bell Φ+ tomography (supplemental scientific validation)**: job `F7287E16E8478E4DB5051105468DB638` on `WK_C180_2`, physical block [49,58], requested shots=1000, returned a provider-reconstructed 4×4 density matrix and provider fidelity `0.952449`. Independent fidelity is `0.952448944997`; the PPT minimum eigenvalue is `-0.456096768` and negativity is `0.456096768`. At the level of this density-matrix point estimate, the state is entangled under the 2×2 PPT criterion. **No statistical confidence interval is claimed.** This is not device-independent certification, a Bell inequality violation, loophole-free certification, or quantum advantage.
- **GHZ-3** reports the real-QPU computational-basis distribution (P(000)≈0.703, P(111)≈0.108, P(011)≈0.187), **affected by hardware noise**; it is not claimed to be a noiseless perfect GHZ state and no multipartite-entanglement claim is made.
- The **Multi** circuit's hardware distribution is compared programmatically against the LoomQ reference simulator (TVD ≈ 0.08, classical fidelity ≈ 0.993) as a distribution-consistency check, not an entanglement witness.

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

## V7 MAX 评委 60 秒核验

先点 Hero 的“把这个结果拆开看”，确认单 qubit 页面显示“测量后仍读到 0 或 1”；再观察 H 让重复分布变成约 50/50、CNOT 的控制位/目标位规则，以及 Bell 的 `00/11` 预测。点“重做刚才的 Bell 实验”并运行 1024 shots，确认 counts、验证、circuit 和默认展开的 OpenQASM 同时出现。继续到 X/Y/Z 面板，三次切换应显示 `Czz = 0.99955`、`Cxx = 0.99956`、`Cyy = -0.99865`，再读 tomography 的 Fidelity `0.952449`、PPT `λmin -0.4561` 与不确定性边界。

页面的“评委证据路线”按三层排列：先看可计分的 SpinQ + OriginQ canonical hardware（任务、实际 QASM、原始结果与 validator 路径），再看 Origin Wukong X/Y/Z 与 tomography 的 supplemental science 回放，最后看 Agent 生成/修复/推荐、统一 typed IR、L3 Hybrid-QASM 与 Custom RISC-V 工程证据。Bell 主入口不调用模型；正式 L2 评测由服务端注入 `LOOMQ_LLM_*`。

本页是归档证据回放，不会提交新的硬件任务。既有 provenance 不一致按已授权规则记录：metadata 为 `a56b4e20039f…`，当前 raw JSON、density audit 和 `SHA256SUMS.txt` 为 `9f7b903131aa…`；评审时不要把两者描述成完全一致，也不要修改 raw evidence。
