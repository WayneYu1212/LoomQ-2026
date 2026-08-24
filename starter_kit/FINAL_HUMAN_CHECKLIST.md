# V7.2 human checklist — previous accepted fallback

> 本文件把 **#119 / `ac0eb3b9f37b1b85f1d7b05ab83b8ee1a7331fd5`** 作为 previous accepted fallback，不是新的提交或新的官方成绩。
> 当前 V7.2 candidate：`<V7.2 SHA>`（commit 前保持 placeholder；candidate 仍需人工审核）。
> 当前 candidate 的新增文档、L2 hardening 与回归结论必须单独审核；不得把本清单解读为新的官方成绩。
> 两平台真机证据（SpinQ + OriginQ）已完成并归档；不需要再运行任何真机任务或消耗配额。

## 最终提交状态

- Previous accepted fallback：**#119**
- Previous accepted SHA：`ac0eb3b9f37b1b85f1d7b05ab83b8ee1a7331fd5`
- Current candidate SHA：`<V7.2 SHA>`
- 状态：`V7.2 candidate pending human review; #119 remains fallback`
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
```

- 本地 HEAD、branch 与 candidate SHA 必须在人工审核时单独核对；本轮不自动 push 或创建新的 Final Submission Issue。
- 若需重新生成 L1 软件模拟器回归报告（仅软件，不影响真机证据）：
  `.\.venv\Scripts\python.exe starter_kit\evaluator.py --level l1 --target spinq,originq,braket --json-out starter_kit\evidence\files\l1-public-report.json`

## 注意事项

- 不要提交任何 API Key、Token、Cookie、个人身份信息或平台账户隐私。
- 不要修改 `evidence/files/` 下的原始导出（`*.raw.*`）或截图。
- 不要修改或覆盖 #119 fallback；如需发起新的 submission，须先完成人工审核并获得明确授权。
