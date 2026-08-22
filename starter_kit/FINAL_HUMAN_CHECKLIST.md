# Accepted baseline checklist — Issue #55 reference archive

> 本文件只记录已提交并 accepted 的 **Issue #55 / `65ce19b`** 基线，不是当前未提交 candidate 的状态声明。
> 当前 candidate 的新增证据和回归结论必须单独审核；本基线清单不得被解读为新的提交或新的官方成绩。
> 两平台真机证据（SpinQ + OriginQ）已完成并归档；不需要再运行任何真机任务或消耗配额。

## 最终提交状态

- 上游 Issue：**#55**（Final Submission）
- 分支：`max-score/final-112`
- 提交 SHA：`65ce19b207ae43bc2647f858666b041badadae8bd`
- 状态：`submission:accepted`
- 归档 Artifact：`submission-wayneyu1212-issue-55`
- 归档 SHA-256：`5bda74d65b8d882dbfa61b40e5ea0802de753e0969c41123ab3af73c774f592d`
- 理论满分上限：`112`（以官方评审为准，不代表已获得该分数）

## 已归档的真机证据

### Origin Quantum（Wukong 180-2）

- 平台：Origin Quantum Cloud
- 设备：Origin Wukong 180-2
- job ID：`D0C7F490B43D9B04FDF19ABF3DB8B342`
- shots：1000
- 提交：2026-08-20T20:29:51.026+08:00；完成：2026-08-20T21:16:43.073+08:00
- 证据文件：`evidence/files/originq-hardware-*`（raw CSV、normalized、metadata、任务截图、logical/physical SVG）

### SpinQ Cloud（2-qubit NMR）
- 平台：SpinQ Cloud
- 设备：SpinQ Cloud 2-qubit NMR quantum computer
- job ID：`G-260820-0008`
- shots：N/A — NMR 导出为 ensemble projection probabilities，未暴露离散 shots，未编造
- 提交：2026-08-20T19:13:25+08:00；完成：2026-08-20T19:15:15+08:00
- 证据文件：`evidence/files/spinq-hardware-*`（raw msgpack、metadata、截图、raw qasm.gz）

## 归档后核对（只读）

```powershell
.\starter_kit\scripts\verify.ps1
git diff --check
git status --short
git rev-parse HEAD
git ls-remote origin max-score/final-112
```

- 本地 HEAD 应等于 remote 分支 SHA 与 receipt SHA。
- 若需重新生成 L1 软件模拟器回归报告（仅软件，不影响真机证据）：
  `.\.venv\Scripts\python.exe starter_kit\evaluator.py --level l1 --target spinq,originq,braket --json-out starter_kit\evidence\files\l1-public-report.json`

## 注意事项

- 不要提交任何 API Key、Token、Cookie、个人身份信息或平台账户隐私。
- 不要修改 `evidence/files/` 下的原始导出（`*.raw.*`）或截图。
- 不要重新提交已 accepted 的最终提交；如需更新，须先确认候选版本确实优于 #55。
