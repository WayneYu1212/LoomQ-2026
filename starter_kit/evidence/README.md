# LoomQ 人工评分证据

这份文件是人工评分材料的统一入口。请直接编辑它，只填写要申报的项目。截图、原始结果或图表统一放在 `starter_kit/evidence/files/`，也可以引用 `starter_kit/` 中已有的代码和文档。

证据包是可选的。没有申报某项人工分时，留空即可，不影响自动评分。

## 提交前填写

把要申报项目的方框改成 `[x]`，并填写对应内容：

- [x] L1 真机
- [x] L2 交互体验
- [x] 工程与产品化
- [x] 自定义量子 RISC-V Bonus
- [x] 新手引导与视觉叙事 Bonus

## L1 真机

平台名称：Origin Quantum Cloud
设备：Origin Wukong 180-2
平台 job ID：D0C7F490B43D9B04FDF19ABF3DB8B342
提交时间：2026-08-20T20:29:51.026+08:00
完成时间：2026-08-20T21:16:43.073+08:00
shots：1000
实际执行的 QASM：`evidence/files/originq-hardware-bell.qasm`
平台返回的原始结果：`evidence/files/originq-hardware-result.raw.json`
规范化结果：`evidence/files/originq-hardware-result.normalized.json`
元数据：`evidence/files/originq-hardware-metadata.json`
任务页截图：`evidence/files/originq-hardware-task.png`
真实性边界：该记录来自平台任务页与原始导出文件中的可追溯硬件任务 ID，不是 simulator；组织方仍可登录平台复核。

平台名称：SpinQ Cloud
设备：SpinQ Cloud 2-qubit NMR quantum computer
平台 job ID：G-260820-0008
提交时间：2026-08-20T19:13:25+08:00
完成时间：2026-08-20T19:15:15+08:00
shots：N/A — SpinQ NMR task page and export expose ensemble projection probabilities; no discrete shot count was provided, so none is fabricated.
实际执行的 QASM：`evidence/files/spinq-hardware-bell.qasm`
平台返回的原始结果：`evidence/files/spinq-hardware-result.raw.json`
规范化结果：`evidence/files/spinq-hardware-result.normalized.json`
元数据：`evidence/files/spinq-hardware-metadata.json`
任务页截图：`evidence/files/spinq-hardware-task.png`
真实性边界：该记录来自平台任务页与原始导出文件中的可追溯硬件任务 ID，不是 simulator；组织方仍可登录平台复核。

## L2 交互体验

请填写：

```text
启动界面或 CLI 的命令：在 fork 根目录运行 `.venv/bin/python -m starter_kit.loomq.web.server`（Windows 为 `.\.venv\Scripts\python.exe -m starter_kit.loomq.web.server`）
测试入口或页面地址：`http://127.0.0.1:8765/`
用于交互体验评测的 3 个用户任务：
1. `我完全不懂量子，带我完成一个最简单的纠缠实验。`
2. `我想制备 Bell 态，但这段代码有错：H q[0]; CX q[0] q[1]。保持原意并修好。`
3. `我要运行一个 15 比特电路，不想排队、不想付费也不想注册，应该选哪个后端？`
截图或演示视频：`evidence/files/qa-maxscore-homepage-1440.png`、`evidence/files/qa-maxscore-homepage-1366.png`、`evidence/files/qa-maxscore-bell-no-llm-1440.png`、`evidence/files/qa-maxscore-agent-connected-1440.png`、`evidence/files/qa-maxscore-homepage-390.png`、`evidence/files/qa-maxscore-bell-390.png`
```

工作人员会在组委会统一模型环境中运行最终代码，测试新手是否看得懂、出错后能否得到有效帮助、结果是否清楚，以及多轮回答是否一致。选手自己的对话截图只用于说明产品流程，不直接证明得分。

## 工程与产品化

已有内容可以直接引用主 README 或其他项目文档，不必复制到本目录。

```text
干净环境中的构建和启动命令：`README.md` 的“5 分钟启动”和“一条命令验证”；Windows `.\starter_kit\scripts\setup.ps1` 后运行 `.\starter_kit\scripts\verify.ps1`
架构说明：`ARCHITECTURE.md`；一个 parser/typed IR，三个 emitter 和三个真实 SDK runner，独立 verifier 不冒充 target
目标用户和使用场景：没有量子背景的人文社科学生、设计师、产品经理、艺术创作者与普通 AI 用户，在五分钟内完成第一次可解释、可验证的量子实验
完整使用流程：`USER_GUIDE.md`、`evidence/files/qa-maxscore-bell-no-llm-1440.png`、`evidence/files/qa-maxscore-agent-connected-1440.png`、`evidence/files/qa-maxscore-bell-390.png`
```

工作人员会按最终 commit 实际构建和启动，并检查文档与代码是否一致、产品是否真的降低了量子计算的使用门槛。

## 自定义量子 RISC-V Bonus

以下三项必须齐全且测试通过，才获得 8 分：

```text
指令编码规格：`QUANTUM_RISCV_EXTENSION.md`
模拟器扩展实现：`riscv_emulator.py` 的 `custom-0` encoder/decoder 与 `quantum_trace`
端到端测试命令：`.venv/bin/python -m unittest starter_kit.tests.test_quantum_riscv_extension -v`（Windows 为 `.\.venv\Scripts\python.exe -m unittest starter_kit.tests.test_quantum_riscv_extension -v`）；演示为 `examples/quantum_riscv_demo.py`
```

## 新手引导与视觉叙事 Bonus

请填写已有材料的路径，不要求为评分另写一套文档：

```text
零基础首次运行指南：`USER_GUIDE.md` 的“Offline five-minute path”；Web 首页“第一次实验”本地 Bell 入口与三个快捷入口
量子概念解释：`USER_GUIDE.md` 的“Three ideas you need”与 Web 的“验证与解释 / 这证明了什么”
结果可视化：`loomq/web/static/` 中的电路 rails、counts bars 及并列表格；截图见 `evidence/files/`
错误恢复或无障碍引导：`loomq/web/server.py` 的结构化恢复错误；HTML labels/live region/skip link；键盘焦点进入结果区；reduced-motion 与移动单列 CSS
```

以上四项各 1 分。普通项目 README 完整不代表自动获得 Bonus。

## 提交规则

- 所有材料都要在截止前进入最终提交的 commit，工作人员不接受截止后补交。
- 外部视频可以用稳定只读链接，源码、原始结果和复现命令应保存在仓库中。
- 整个 fork commit 的归档包不得超过 100 MiB。
- 不要提交 API Key、Token、Cookie、个人身份信息或平台账户隐私。
- 如申报 L1 真机分，在最终提交 Issue 的 `Hardware evidence` 中填写 `starter_kit/evidence/README.md`。
