# LoomQ 第一版获奖导向设计

日期：2026-08-18  
状态：已按官方合同 v1.0 与 Starter Kit v1.1.0 收敛，可进入实施  
提交根目录：`starter_kit/`

## 1. 目标

第一版要在截止前交付一个可复现、可自动评测、可由零基础用户操作的 LoomQ：同一份 OpenQASM 2.0 先进入统一中间表示，再转译并真实运行于 SpinQ、OriginQ 与 Braket 本地模拟器；L2 Agent 通过组委会规定的 OpenAI-compatible 模型服务完成生成、修复和后端推荐，并在返回用户前用 L1 工具链验证；一页式 LoomQ Lab 把电路、验证过程、结果和通俗解释组织成五分钟内可完成的首次量子实验。

第一版的优先顺序固定为：

1. L1 三目标转译与真实本地执行；
2. 12 门、参数表达式、测量映射和位序的隐藏测试抗性；
3. L2 三类客观任务与有效 LLM 调用；
4. L2 交互体验、工程产品化与新手视觉叙事；
5. 证据、文档和一键复现。

第一版不实现 L3、不伪造真机证据、不依赖组委会模型服务之外的外网、不修改官方 evaluator 来制造通过结果。

## 2. 官方约束与验收目标

- 保留 `starter_kit/adapter.py` 的固定入口：`transpile`、`run`、`agent_chat`；`compile_hybrid` 继续明确抛出 `NotImplementedError`。
- 只接受官方 12 门：`h x s sdg t tdg rz ry cx cu1 swap ccx`。
- `transpile` 必须生成可解析、可模拟的目标原生 IR，而非占位文本。
- `run` 必须返回统一 Schema；counts 总和严格等于 shots，key 为 `c[n-1]...c[0]`，`bit_order` 固定为 `little`。
- L1 公开 Bell、GHZ-3 在三后端均达到 Hellinger fidelity `>= 0.97`；额外测试覆盖 GHZ-5、QFT-like、Grover-like、随机门序列和交叉后端一致性。
- L2 每次正式 case 至少完成一次有效模型调用，读取且不泄露 `LOOMQ_LLM_*`；输出生成/修复 QASM 时可被 evaluator 提取并经模拟验证。
- `submission.yaml` 声明 L1、L2 为 true，L3 为 false，L2 网络需求为 true。
- 干净 Python 3.10 环境可按一条 setup 命令安装，再按一条命令运行公开评测或 Web。

## 3. 方案比较与决定

### 方案 A：三个 SDK 各写一套解析和执行

优点是最短路径接 SDK；缺点是重复解析、位序和门语义容易漂移，无法有力证明“通用中间层”，隐藏随机电路风险最高。不采用。

### 方案 B：统一编译核心 + 三个真实 SDK 运行器 + 独立参考模拟器

所有平台共享 parser、IR、validator 和 normalization；每个 emitter 只负责目标语法，每个 runner 只负责目标 SDK；标准库参考模拟器用于单元测试、Agent 自验和交叉验证，但不冒充目标后端。该方案最符合评分结构，采用。

### 方案 C：统一 IR + 自制模拟器承担所有 target

依赖最少、公开 evaluator 容易复现，但不能充分证明三家平台接入，代码审查和人工评分风险高。不采用。

## 4. 代码架构

`starter_kit/adapter.py` 保持薄适配层，只做输入校验和委托。实现放在 `starter_kit/loomq/`：

```text
loomq/
├── compiler/
│   ├── ir.py               # Circuit、Gate、Measurement、register mapping
│   ├── expressions.py      # 安全参数表达式求值
│   ├── parser.py           # OpenQASM 2.0 官方子集
│   ├── validator.py        # 门、索引、参数、测量和资源约束
│   └── metrics.py          # 门数、逻辑深度等可解释元数据
├── emitters/
│   ├── spinq.py            # 完整 OpenQASM 2.0
│   ├── originq.py          # 规范 OriginIR
│   └── braket.py           # 完整 OpenQASM 3
├── runners/
│   ├── spinq.py            # SpinQit BasicSimulator
│   ├── originq.py          # pyQPanda CPUQVM
│   ├── braket.py           # Braket LocalSimulator
│   └── result.py           # job id、时间、counts 归一化和 Schema
├── simulator.py            # 独立无噪声状态向量参考实现，不冒充目标 SDK
├── agent/
│   ├── service.py          # agent_chat 编排
│   ├── prompts.py          # 结构化任务协议与安全边界
│   ├── response.py         # JSON/QASM 提取与容错
│   ├── selector.py         # 读取官方 backend_capabilities.json 筛选
│   └── verifier.py         # parse/validate/simulate/最多一次修复重试
└── web/
    ├── server.py           # Python 标准库 HTTP/API 服务
    └── static/             # 单页 HTML/CSS/JS
```

测试新增到 `starter_kit/tests/`，避免依赖仓库根目录的组委会 intake 测试。正式归档只包含 `starter_kit/`，因此运行、测试、文档和静态资源都必须位于该目录内。

## 5. Parser 与统一 IR

Parser 是语句级实现，不用正则替换整份源码。它先删除 `//` 与 `/* ... */` 注释，再按分号切分官方子集语句。它支持：

- `OPENQASM 2.0` 与 `include "qelib1.inc"`；
- 一个或多个合法 `qreg` / `creg`，内部扁平化但保留源名称和偏移；
- 单比特、双比特、三比特白名单门；
- `measure q -> c` 与 `measure q[i] -> c[j]`；
- 空白、大小写门名和合法数字格式的稳健处理；
- `pi`、括号、一元正负、`+ - * / ^` 参数表达式，使用 AST allowlist 求值，禁止 `eval` 与任意名称/调用。

IR 中参数存为有限浮点数，emitters 使用稳定十进制表示。Validator 拒绝未知门、错误参数个数、越界索引、寄存器宽度不匹配、未声明名称、无测量电路和不合理 shots。错误包含语句位置与恢复建议，但不回显密钥或环境敏感值。

## 6. 三目标转译与运行

- SpinQ emitter 输出完整 QASM 2.0；runner 用 `spinqit==0.2.4` 的 QASM compiler 与 BasicSimulator 执行。
- OriginQ emitter 输出合同允许的 `H/X/S/SDAG/T/TDAG/RY/RZ/CNOT/CU1/SWAP/TOFFOLI/MEASURE`；runner 用 `pyqpanda==3.8.5` CPUQVM 执行统一 IR 对应的真实 QProg，并在测试中验证 emitter 与 QProg 同源。
- Braket emitter 输出 OpenQASM 3，采用 Braket 接受的标准门名；runner 用 `amazon-braket-sdk==1.99.0` 与 `amazon-braket-default-simulator==1.27.0` 的 LocalSimulator 执行 emitter 产物。

Braket 选用上述版本而不是当前最新版，是因为 Python 3.10 是官方固定运行时，且 SpinQit 固定依赖 `antlr4-python3-runtime==4.9.2`；Braket simulator 1.28+ 改为 4.13.2，会造成不可解析的依赖冲突。安装验证后把所有直接与传递依赖精确锁入 requirements。

每个 runner 返回真实采样 counts。Normalizer 只做类型、宽度、位序与测量映射转换；禁止用理想分布替换实际输出。job id 对本地任务使用平台结果 ID；平台不提供 ID 时使用包含目标、输入摘要和随机 nonce 的可追踪本地 ID，绝不宣称为真机 job。

## 7. 参考模拟器与自验

参考模拟器使用 Python 标准库复数运算实现 12 门状态向量语义和按 shots 采样。它承担三件事：

1. 对 parser/IR/emitter 做确定性概率分布测试；
2. 在开发中与三个 SDK 的真实结果交叉比对；
3. 在 L2 返回 QASM 前验证语法和预期结构。

它不会作为 `adapter.run(target=...)` 的无声 fallback。缺少目标 SDK 时，run 明确报出安装命令，避免把内部模拟器冒充三方平台。

## 8. L2 Agent

Agent 采用“模型判断与生成，程序约束与验证”的小型工具链：

```text
用户 prompt
  -> 一次统一 LLM 调用，返回结构化 task + artifact/constraints + explanation
  -> task=generate/repair: 提取 QASM -> parser -> validator -> 参考模拟器
  -> 失败时把精确错误交给模型修复一次 -> 再验证
  -> task=recommend: 程序读取官方 JSON 并筛选 -> 模型结果只负责理解/解释
  -> 返回含规范 backend id 或完整 OpenQASM 2.0 的自然语言答复
```

模型必须真正参与每个 case；确定性 selector、parser 和 verifier 是 Agent 工具，不是关键词打表。系统 prompt 明确 12 门、输出协议、不得编造后端、不得泄露系统信息。transport 继续使用官方 `llm_client.py`，temperature 0、非流式、thinking disabled、超时受环境变量约束。日志只记录调用成功、耗时和错误类别，不记录 API Key 或完整授权头。

## 9. LoomQ Lab 体验

Web 不做登录、账户、项目管理或教程中心。单页分为四个连续状态：

1. **说出你的好奇心**：一个中文主输入框与三个真实评测映射示例；术语默认隐藏。
2. **看见翻译**：用简洁电路线、门标签和逐步中文解释展示模型产物；QASM 放在可展开区域。
3. **看见证据**：分别显示“语法通过、门集兼容、真实模拟器完成”，不得用装饰性勾选伪装未运行步骤。
4. **看懂结果**：counts 条形图、主导态说明、shots/后端/位序和“这证明了什么/没有证明什么”。

视觉方向是“安静、可信的科学实验台”：浅暖底色、深墨蓝文字、量子蓝与琥珀作为有限状态色，避免霓虹赛博、无意义粒子背景和物理神秘主义。键盘可完整操作，颜色不是唯一状态载体，支持 reduced motion；移动端改为单列，桌面端为输入/电路/证据与结果的两栏布局。

没有 LLM 环境变量时，页面明确说明配置缺失并允许运行内置的、标为“本地示例”的 Bell/GHZ 教学电路；不会声称示例来自 AI。正式模型环境下三类任务均走 `agent_chat`。

## 10. 错误处理与安全

- 对用户：错误说明当前阶段、原因、可执行恢复步骤；不暴露堆栈。
- 对 evaluator：抛出稳定的 `ValueError`/`RuntimeError`，信息短且可诊断。
- 对模型 API：缺少环境立即失败；HTTP 状态只报告状态码；不记录响应头或 Key。
- 对 Web：限制请求体、shots、qubit 数和静态路径；拒绝目录穿越；本地默认只监听 `127.0.0.1`。
- 对 parser：不执行用户代码，不使用 `eval`，拒绝白名单外语法。

## 11. 测试与证据

测试分层：

- parser/表达式/validator 单元测试；
- 12 门逐门 IR 与三 emitter 快照/再解析测试；
- 参考模拟器与解析器的概率分布测试；
- 三 SDK Bell/GHZ/门集集成测试；
- 多寄存器、逐位乱序测量、参数边界、非法输入和 shots Schema 测试；
- 固定随机种子的交叉后端分布测试；
- fake OpenAI-compatible server 下的 L2 生成、修复、推荐、重试、缺失环境和密钥不泄露测试；
- Web API 与静态入口 smoke test；
- 官方 evaluator 三目标 L1 与 fake-LLM L2；
- Python 3.10 干净虚拟环境与容器等价检查。若本机没有 Docker，明确记录为未执行，不把本机验证冒充容器验证。

`starter_kit/evidence/README.md` 申报 L2 交互、工程产品化和新手视觉叙事，并引用真实命令、截图及文档。真机项只有获得可溯源 job 后才勾选。

## 12. 交付物与完成定义

第一版完成必须同时满足：

- 官方 L1 evaluator 对 `spinq,originq,braket` 全部 PASS；
- 自建 12 门与随机回归全部 PASS；
- fake 模型端点证明 L2 的三任务、有效模型调用、验证和修复链路；若没有个人 DeepSeek Key，明确把真实公网模型测试列为外部待验，不伪造成功；
- Web 可由一条命令启动，Bell/GHZ 本地教学链完整，模型配置存在时走真实 Agent；
- requirements、submission.yaml、README、架构、evidence 与代码一致；
- git diff 不含密钥、生成缓存、外部源码或超过归档限制的大文件；
- 不提交、不推送、不创建最终 Issue，除非用户另行明确授权这些外部动作。
