# 第一次 LoomQ 实验

这份指南不要求任何量子计算背景。先在五分钟内跑出一份结果，再回来看概念、Agent 与恢复方式。

## 5 分钟跑完第一次实验

1. 按 `README.md` 的命令完成安装并启动 Web 服务。
2. 打开 `http://127.0.0.1:8765/`。
3. 点击 **重做刚才的 Bell 实验**，载入已经讲过的 Bell 电路。
4. 选择任意一个本地后端，点击 **执行这个实验**。
5. 在 **你刚刚看见了什么？** 中查看 counts、解释、电路和默认展开的 QASM，再向下读 **如果还想把这个状态看得更完整**。

不要把 `loomq/web/static/index.html` 当作 `file://` 页面打开；静态页面无法连接 Python SDK 服务。若误开，LoomQ 会给出正确的启动地址，不会把它误报为模型 Key 问题。

这条 Bell 路径不需要模型 Key。自由输入的 Agent 任务才使用服务端注入的 `LOOMQ_LLM_*`，浏览器不要求输入 Key，也不会把密钥写入 LocalStorage。

## V7.1 Windows 本地服务

从当前仓库启动 Web 的唯一必要命令是：

```powershell
$Repo = (Get-Location).Path
$Py = Join-Path $Repo '.venv\Scripts\python.exe'
Set-Location $Repo
& $Py -X utf8 -m starter_kit.loomq.web.server --host 127.0.0.1 --port 8765
```

然后从浏览器打开 `http://127.0.0.1:8765/`。不要双击静态 HTML；静态页面只能展示故事，无法连接本地实验接口。

Bell 的正确本地结果通常由 `00` 和 `11` 主导，各自接近 50%。49%/51% 与恰好 50%/50% 都可能是健康的采样涨落。但这份计算基相关性只是重要线索：经典混合也能产生相同的 `00/11` 统计，因此不能只凭这张图认证纠缠。页面的证据段会继续指向换基测量、纠缠见证和量子态层析。

## 先记住三个概念

- **qubit（量子比特）**是电路操作的基本单位。
- **gate（量子门）**是程序中的一次操作。
- **shots** 表示重复执行同一个实验；counts 记录每种经典结果出现了多少次。

使用 Web 入口不需要手算矩阵，也不需要自己写 QASM。

After configuring `LOOMQ_LLM_*`, try `生成 3 比特 GHZ 态`. A correct GHZ result is dominated by `000` and `111`.

## Agent tasks

After configuring `LOOMQ_LLM_*`, try:

1. `生成一个 5 比特 GHZ 态并测量全部量子比特。`
2. `我想制备 Bell 态，但这段代码有错：H q[0]; CX q[0] q[1]。保持原意并修好。`
3. `我要运行一个 15 比特电路，不想排队、不想付费也不想注册，应该选哪个后端？`

The first two responses must contain complete verified OpenQASM. The third must contain canonical IDs from the organizer's capability table. If the model returns an invalid candidate, LoomQ gives it one correction attempt; it never silently claims the invalid program passed.

## Reading the workbench

- **CIRCUIT** shows the shared IR as circuit rails. A small circle marks a control; a labeled box is the target gate; `M` marks measurement.
- **VERIFICATION** lists checks actually returned by the program. No check begins green.
- **RESULT** shows raw SDK counts as bars and an accessible table.
- **这些结果能说明什么？** gives a beginner explanation. OpenQASM is visible by default and can still be collapsed when you want to focus on the result.

## Scientific boundary

An ideal local simulator can show that the program implements the intended mathematical distribution. It does not prove quantum advantage, hardware fidelity, or resistance to real QPU noise. A true hardware claim needs a traceable platform job ID and raw result captured inside the contest window.

## Recovery

- **Agent 模型尚未配置**: set all three required `LOOMQ_LLM_BASE_URL`, `LOOMQ_LLM_API_KEY`, `LOOMQ_LLM_MODEL` values, or use a labeled local example.
- **Unsupported gate**: the contest accepts only the 12 gates listed in the README.
- **SDK unavailable**: run the setup script and `python -m pip check` inside `.venv`.
- **Counts look slightly uneven**: sampling fluctuation is expected. Use 8192 shots for scoring comparisons.
- **Port 8765 is busy**: start with `--port 8766` and open that address.

## V7 MAX 页面路线

页面从一个可见的 `00 / 11` 结果开始，依次解释单 qubit、H、CNOT、shots、Bell、OpenQASM、真实返回和 X/Y/Z 归档证据。第一次出现的概念总是先讲刚刚发生的现象，再给名称和公式；科学边界随后单独展开。

- X/Y/Z 面板是三个独立归档作业的交互回放：`Czz = 0.99955`、`Cxx = 0.99956`、`Cyy = -0.99865`。
- tomography 卡片展示 provider 重建点估计：Fidelity `0.952449` 与 PPT `λmin -0.4561`，并说明这不是统计置信区间或量子优势声明。
- 评委证据路线先指向可计分的 SpinQ + OriginQ canonical hardware，再指向 Wukong X/Y/Z、tomography 与 Agent / L3 / Custom RISC-V 的补充与工程材料；页面只回放已有证据。
- 英文界面与中文界面共用同一条实验路径；移动端优先保留原生按钮、可见 shots/backend 帮助和可展开 OpenQASM。
- 归档证据的英文边界句是：`This page is replaying evidence; it is not submitting a new hardware job.`
