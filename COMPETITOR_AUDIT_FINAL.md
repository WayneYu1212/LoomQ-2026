# Competitor Audit — Historical Research Snapshot（2026-08-22）

> 本文件保留竞品与公开资料研究快照；其中的“gap / 下一步”是当时的研究计划，不是当前 candidate 状态。当前提交判断以 `FINAL_CHAMPIONSHIP_REPORT.md` 为准。

> 数据来源：QAIDAO/LoomQ-2026 公开 Issues 与各队 fork 的 `starter_kit/evidence/README.md`（仅公开资料，未复制任何代码/文案）。
> 目的：找出**真正影响打分的 gap**，不追求数量竞赛。

## 1. 竞品矩阵（均为 submission:accepted）

| 维度 | AphrixZjr #32 | WilderNoTrack #31 | Jessica #58 | tale03 #39 | AzureWynn #45 | hongwei #50 | zhangxinyang #54 | elenawia #59 | **我们 #55+candidate** |
|---|---|---|---|---|---|---|---|---|---|
| 真机平台数 | **2**（OriginQ WK_C180 + SpinQ triangulum NMR） | **2**（SpinQ NMR×2 + OriginQ 180 超导×2） | 1 厂商 2 机型（SpinQ 2/3 比特 NMR）；OriginQ 维护失败如实弃报 | 2（SpinQ Gemini + OriginQ 180） | 1（SpinQ，2 机型同平台） | 1（SpinQ gemini_vp） | 1（SpinQ gemini_vp） | 0 | **2**（SpinQ NMR + OriginQ Wukong 180-2） |
| 真机 job 数 | **8**（33,168 shots） | 4 | 2 有效 | 2（8192 shots×2） | 2 | 1 | 1 | 0 | 2 canonical（完整导出）+ **3 新 Runtime**（Bell/GHZ-3/Multi，现代官方 API） |
| 硬件证据深度 | job ID+时间戳+shots+概率换算 counts（声明非逐 shot raw）+Wilson CI | job ID+shots+噪声量化+vendor bug 记录 | job ID+QASM+raw+截图；含无效对照自愿申报 | job ID+8192 shots+QASM+raw，**无截图** | job ID+shots，**无截图** | job ID+shots，无截图 | job ID+shots，无截图 | 空 | job ID+QASM+raw+normalized+**CSV/msgpack provider 导出**+**任务页截图**+manifest SHA-256+跨 job 程序化校验 |
| L2 真实模型 | **312/312**（3×104，含分类明细） | 16/16 | 3 任务本地通过 | 无（仅任务描述） | 无 | 无 | 无（CLI 输出文本） | 无 | **102/101**（含 adversarial+私有变体，1 transient 如实披露，粒度如实声明） |
| L2 UX | Web+浏览器 CDP 22/22+4 视口 | Web+tour 四步 | **judge-first Web 回放**（URL 参数直达 3 demo）+4 截图 | Flask Web，无截图 | CLI，无截图 | Web，无截图 | **纯 CLI** | 无 | Web+**6 截图（3 视口）**+无 LLM 首跑路径+结构化恢复 |
| L3/RISC-V | 完整（规格+E2E） | 19 E2E 用例 | 机器码闭环 E2E | 规格+模拟器 | 8/8 测试 | 规格+模拟器 | 完整 | 无 | 12 测试+`.word` E2E+编码规格 |
| 工程 | Docker 统一构建、268/268、294/294 | 165 测试（Py3.14+3.10 双版本）、36/36 vendor SDK | start_demo.sh 一键 | 一般 | Docker+本地脚本 | 引用式声明 | Docker | 模板 | 26 organizer+81 submission 测试、脚本、pin 依赖、optional runtime 隔离 |
| 科学严谨 | Wilson CI、NMR 计分不确定性主动披露 | 噪声量化 | 无效对照主动申报 | 一般 | 主峰粗验 | 一般 | 一般 | — | **SCIENTIFIC_CLAIMS_AUDIT、计算基相关 vs 纠缠边界、TVD/fidelity 程序化对比、witness 判定标准预注册** |
| 可复现 | SHA 绑定 artifacts | 好 | 好 | 一般 | 一般 | 弱 | 一般 | — | manifest SHA-256、validate 脚本、可选依赖隔离 |

## 2. 关键结论

### 2.1 我们的相对优势（可防守的差异化）

1. **唯一展示官方现代 QPanda3 Runtime 通道**（`qpanda3_runtime.RuntimeService + WK_C180_2`）：所有竞品的 OriginQ 证据都来自旧 API（QCloud/pyqpanda chipId 180 或 REST）；我们是唯一在 legacy 网关进入 maintenance 后迁移到新 Runtime 并留下 3 个新 job 的队伍。证明工程生命力 + 2026 年当下可复现性。
2. **canonical 证据最完整**：CSV/msgpack provider 原始导出 + 任务页截图 + ISO 时间戳 + manifest SHA-256 + 跨 job 程序化校验。AphrixZjr 的 counts 是概率换算（自declared）；tale03/AzureWynn/hongwei/zhangxinyang 无截图。
3. **科学严谨性文档化**：SCIENTIFIC_CLAIMS_AUDIT + witness 判定标准预注册 + L2 粒度如实披露。AphrixZjr 有 Wilson CI 但无 claims audit；多数队没有系统化声明审计。
4. **证据链故事完整**：L1 统一层→L2 真实模型→L3 hybrid→RISC-V→两平台真机→现代 Runtime 复现→新手 UX，JUDGE_GUIDE 60 秒可导航。

### 2.2 真实 gap（影响打分的）

| Gap | 竞品基准 | 我们现状 | 修复成本 | 决策 |
|---|---|---|---|---|
| G1 硬件统计不确定性（Wilson CI） | AphrixZjr 对 Bell/GHZ 支撑率给 Wilson 95% CI | 未计算 | **零新 job，纯离线分析** | **今晚补**（提升科学严谨对齐最强竞品） |
| G2 纠缠 witness（X-basis） | **无任何竞品有**（全部只有 Z-basis） | 无 | 1 个新 job（~40-50 分钟排队） | **跑**（唯一能形成对全部竞品差异化的硬件实验；判定标准已预注册，不 cherry-pick） |
| G3 L2 用例数量 | AphrixZjr 312/312 | 102/101 | 24 个 API calls 上限 | **不追**（用户规则：不烧 API 做 vanity benchmark；我们的 102 例含 adversarial+失败如实披露，质量口径不同） |
| G4 浏览器自动化 E2E | AphrixZjr CDP 22/22 | Python 级 web 测试 | 中 | **不做**（L2 交互分由评委现场运行决定，我们已有 6 视口截图+无 LLM 首跑路径；重写自动化收益低于风险） |
| G5 Docker | AphrixZjr/WilderNoTrack 有 | NOT RUN（本机无 Docker） | — | **如实申报 NOT RUN**（禁止虚报） |
| G6 双 Python 版本 | WilderNoTrack Py3.14+3.10 | 3.10 only | — | **不做**（官方基础镜像即 3.10，3.14 兼容性无评分依据） |

### 2.3 特别注意：AphrixZjr 的 NMR 计分风险（非我们的行动项）

AphrixZjr 自己承认：`problem_statement.md` 写"超导真机"而其 SpinQ 平台是**核磁**（triangulum_vp），`+5/平台` 是否成立待组委会书面确认。**我们的两平台是 SpinQ 2 比特 NMR + OriginQ 超导**，OriginQ 超导一档无争议；SpinQ NMR 档与其他所有用 NMR 的竞品风险相同，非我们独有。

## 3. 对今晚行动的指导

1. **G1（Wilson CI）**：对 canonical Bell（D0C7F4）、runtime Bell（2C68A9D3）、GHZ-3（B23E5B75）的计算基支撑率计算 Wilson 95% CI，写入 evidence。零风险纯增强。
2. **G2（X-basis witness）**：按 SCIENTIFIC_CLAIMS_AUDIT §4 预注册标准执行：理论公式先程序化验证（对可分离态族数值检查 |Cxx|+|Czz|≤1），再提交 X-basis job，最后含 binomial 不确定性判定。失败则如实记录并停止。
3. 其余 gap 明确不追，理由如上。
