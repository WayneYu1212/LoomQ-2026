# LoomQ 2026 — HISTORICAL CANDIDATE DELTA REPORT (SUPERSEDED)

> 此为 X/Y basis evidence 完成前的历史快照，不能作为当前 candidate 的 judge-facing 状态或提交依据。以 `FINAL_CHAMPIONSHIP_REPORT.md` 为唯一当前接管报告。
>
> 评估：当前本地 candidate（branch `final-polish/first-place-runtime`）相对 accepted #55（`65ce19b2`）是否值得作为新的 Final Submission。
> **结论：值得作为新的 Final Submission candidate。** 本次不是 cosmetic 文档改动，而是完成了 OriginQ 证据迁移、跨 job 证据分离、科学表述修正、Runtime 依赖隔离，且 accepted #55 canonical 证据完整保留、全新 clean-env 回归全 PASS。

---

## A. 与 accepted #55 相比，究竟改进了什么

| 维度 | accepted #55 | 本 candidate |
|---|---|---|
| OriginQ 真机通道 | 仅 legacy `pyqpanda.QCloud`（chip 72），该网关已返回 maintenance | 新增官方 `qpanda3_runtime.RuntimeService`（device `WK_C180_2`），成功跑 3 个新 job |
| OriginQ 证据 | 仅 1 个 Bell（D0C7F4） | canonical D0C7F4 **完整保留** + 3 个独立 runtime 证据包（Bell/GHZ-3/Multi），**无跨 job 混用** |
| 科学表述 | 曾出现"纠缠正确/证明纠缠"等过度表述 | 已全部纠正，计算基相关与纠缠声明明确分离 |
| 依赖面 | 无 runtime 依赖 | `qpanda3-runtime`/`pyqpanda3` 隔离到 optional `requirements-originq-runtime.txt`，core 依赖面不变 |
| L2 统计 | 手工改过 90→102 | 程序化校验，确认 JSON 支持 102/101，建立单一事实源 validator |

## B. 变更文件清单

**修改（6 个）**：
- `starter_kit/evidence/README.md` — 科学表述修正 + runtime 证据路径
- `starter_kit/evidence/SCORECARD.md` — L1 硬件行更新（runtime jobs + 科学边界）
- `starter_kit/JUDGE_GUIDE.md` — 依赖隔离 + 科学诚实边界
- `starter_kit/README.md` — 可选依赖说明
- `starter_kit/FINAL_HUMAN_CHECKLIST.md`、`starter_kit/evidence/files/l1-public-report.json`（重生成报告）

**新增（未跟踪）**：
- `starter_kit/hardware/originq_runtime_real.py`（新 Runtime runner，隔离）
- `starter_kit/requirements-originq-runtime.txt`（可选依赖）
- `starter_kit/scripts/validate_l2_stress.py`（L2 单一事实源 validator）
- `starter_kit/scripts/run_originq_reproducibility.py`（迁移到 Runtime API + 修复 import/SHA）
- `starter_kit/evidence/files/originq_runtime_bell-*`、`originq_runtime_ghz3-*`、`originq_runtime_multi-*`（3 个独立证据包 + manifest）
- `starter_kit/evidence/files/originq_runtime_multi-reference-comparison.json`（simulator 交叉校验）
- `starter_kit/evidence/files/originq-manifest.json`、`originq-reproducibility-summary.json`（更新）
- `.gitignore`（新增 `.venv-clean/`）

**恢复为 accepted #55（不再改动）**：
- `starter_kit/hardware/originq_real.py`（byte-identical to HEAD）
- `starter_kit/requirements.txt`（byte-identical to HEAD）
- `starter_kit/evidence/files/originq-hardware-*`（6 个文件全部 byte-identical to HEAD）

## C. Canonical evidence integrity

- `originq-hardware-*`（D0C7F4）与 `spinq-hardware-*`（G-260820-0008）**全部 byte-identical to accepted #55（HEAD）**，`git diff HEAD` 为空。
- `validate_evidence.py`：canonical originq + spinq 均 **PASS**。
- 未触碰任何 accepted raw 硬件数据、截图、哈希。

## D. 新增硬件任务与哈希

| 电路 | job_id | device | 物理比特 | shots | counts | manifest SHA 记录 |
|---|---|---|---|---|---|---|
| Bell（runtime） | `2C68A9D3E2F6626B55EEC966DBC3CE2B` | WK_C180_2 | [49,58] | 1000 | 00:458, 11:542 | `originq_runtime_bell-manifest.json` |
| GHZ-3 | `B23E5B75D47D124A078F25B1C0083C2A` | WK_C180_2 | [49,58,67] | 1000 | 000:703, 011:187, 111:108 | `originq_runtime_ghz3-manifest.json` |
| Multi | `8575222FE2C04A065B38B9DEE5BA9AEE` | WK_C180_2 | [49,58] | 1000 | 00:209, 01:278, 10:302, 11:211 | `originq_runtime_multi-manifest.json` |

每个包均含 manifest（job_id/device_id/物理量/shots/circuit/文件 SHA-256/data source/missing provider exports）。**cross-reference check：ALL_PACKAGES_CONSISTENT = True**，任何前缀下无两个不同 job。

## E. 科学声明审计

- **Bell**：改为 "strong Z-basis 00/11 correlation consistent with the target Bell circuit"，**不声明证明纠缠**。
- **GHZ-3**：改为 "GHZ-3 circuit executed on WK_C180_2; computational-basis distribution; target-state population affected by hardware noise"，**不声明三比特纠缠证明**。
- **Multi**：用 LoomQ reference simulator 对同一电路计算理想分布（均匀 0.25），程序化比较硬件分布：**TVD≈0.08、classical fidelity≈0.993、Hellinger≈0.058**，结论 "distribution consistent with intended circuit"。
- 明确边界：simulator / QPU / computational-basis correlation / entanglement witness 分离；**未运行 X/Y-basis entanglement witness，故不声明纠缠证明**。

## F. DeepSeek case-count 单一事实源

- `l2-deepseek-v4-flash-stress-summary.json` 程序化重算：**total=102, passed=101, failed=1, pass_rate=0.990**，与 summary 声明一致。
- 新增 `validate_l2_stress.py`：校验 summary 内部一致 + 交叉校验 docs 中 "102/101" 与 JSON 一致，**全部 PASS**。
- 结论：102/101 由真实 JSON 支持，可保留。

## G. Clean environment 结果

全新 Python 3.10 venv（`.venv-clean`），仅装 `requirements.txt`（**不含 runtime 依赖**）：
- `pip check`：无 broken requirements。
- 确认 `qpanda3_runtime`/`pyqpanda3` **未安装**（隔离生效）。
- `origin_runtime_real.py --doctor` 在 clean core 下正确报告 `runtime_available=false`（exit 2，符合隔离预期）。

## H. 完整回归（clean venv）

| 项目 | 结果 |
|---|---|
| organizer tests（`tests/`） | 26/26 PASS |
| submission tests（`starter_kit/tests/`） | 81/81 PASS |
| L1（spinq/originq/braket） | 6/6 PASS |
| L2 public fake | 1/1 PASS |
| L3 | 1/1 PASS |
| custom RISC-V + hybrid | PASS |
| web assets + server | PASS |
| hardware tools | 7/7 PASS |
| hardware evidence validator | PASS（canonical + runtime ghz3/multi） |
| L2 stress validator | PASS |
| compileall | PASS |
| narrow mypy（`originq_runtime_real.py`） | PASS（exit 0） |
| git diff --check | PASS |
| secret scan | 无真实 secret（仅 README placeholder 示例） |
| absolute-path scan | 无真实绝对路径 |
| archive size | ~1.26 MiB（远低于 100 MiB） |
| Docker | **NOT RUN**（本机无 Docker，如实申报） |

## I. Archive size

- `starter_kit` projection ≈ **1.26 MiB**，远低于 100 MiB 上限。

## J. 为什么比 #55 实质更好

1. **硬件证据链更强**：从 1 个 Bell 扩展到 Bell/GHZ-3/Multi 三个不同电路，且全部走官方现代 Runtime API（`WK_C180_2`），证明 LoomQ 统一 OpenQASM→backend runner→真机链路在多个量子程序上实际执行。
2. **科学诚实**：纠正了过度纠缠声明，明确计算基相关 vs 纠缠 witness 边界，经得起量子专业评委检查。
3. **证据隔离**：canonical #55 完整保留，新 runtime 证据完全分离，无任何跨 job 混用，程序化 cross-reference 校验通过。
4. **依赖隔离**：core evaluator 依赖面与 #55 完全一致，新增 runtime 依赖为 optional，不增加 hidden-test 风险。
5. **可复现**：`run_originq_reproducibility.py` 已修复（import/SHA），`requirements-originq-runtime.txt` pin 版本。

## K. Remaining risks

1. **Bell runtime 包无精确时间戳**（`timestamp_note` 已诚实声明 date-granularity）；canonical D0C7F4 有完整时间戳，不受影响。
2. **runtime 包无 provider CSV / task 截图**（该 API 路径不导出），已明确写 N/A，未复用旧 job 的 CSV/截图。
3. **X/Y-basis entanglement witness 未运行**：当前证据只能证明计算基相关，不能区分 Bell 纠缠与 classical mixture。若剩余免费额度足够且希望更强 claim，可考虑补跑（但排队 40-50 分钟，且不保证通过）。
4. **`prepare_submission.py` 未运行**：需要 clean tree + pushed HEAD，当前 working tree dirty，待 commit 后运行。
5. **`.venv-clean` 为本地验证产物**：已加入 `.gitignore`，不进入提交。
6. **`l1-public-report.json` 有 fidelity 漂移**：本地 L1 software rerun 的模拟器数值漂移，非硬件证据，不影响硬件 claim（与 #55 处理一致）。

## 结论

- **值得创建新的 Final Submission candidate**（但**未自动创建 Issue**，等待确认）。
- 待确认后流程：commit（`final-polish/first-place-runtime`）→ push → 运行 `prepare_submission.py` → 创建新 Final Submission Issue。
- **未 commit / 未 push / 未创建 Issue / 未修改 #55**，符合 HARD STOP。
