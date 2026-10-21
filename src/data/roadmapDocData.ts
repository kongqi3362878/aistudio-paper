import { SystemDocFile, downloadDocFile } from './downloadableDocs';

// 4. 2026年10月-12月 双周敏捷迭代项目路线图与需求功能任务排期计划 (Word HTML 格式)
export const generateRoadmapHtml = () => `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>论文智检智能审查管理系统 - 2026年Q4双周敏捷迭代排期路线图 (10月-12月)</title>
  <style>
    @page { size: A4; margin: 2.54cm; }
    body { font-family: 'SimSun', '宋体', serif; font-size: 13.5pt; line-height: 1.75; color: #000; margin: 0 auto; max-width: 850px; }
    .cover-page { page-break-after: always; height: 90vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
    .cover-title { font-family: 'SimHei', '黑体', sans-serif; font-size: 25pt; font-weight: bold; letter-spacing: 2px; margin-top: 170px; margin-bottom: 25px; }
    .cover-subtitle { font-family: 'SimHei', '黑体', sans-serif; font-size: 19pt; letter-spacing: 3px; margin-bottom: 220px; }
    .cover-dept { font-family: 'SimSun', '宋体', serif; font-size: 13.5pt; margin-bottom: 35px; }
    .cover-date { font-family: 'SimSun', '宋体', serif; font-size: 13.5pt; }
    .toc-title { font-family: 'SimHei', '黑体', sans-serif; font-size: 21pt; text-align: center; letter-spacing: 6px; margin-top: 35px; margin-bottom: 25px; }
    .toc-item { font-size: 12pt; line-height: 2.0; margin-left: 20px; }
    .toc-item-sub { margin-left: 50px; }
    h1 { font-family: 'SimHei', '黑体', sans-serif; font-size: 17pt; font-weight: bold; margin-top: 35px; margin-bottom: 18px; border-bottom: 1px solid #333; padding-bottom: 6px; }
    h2 { font-family: 'SimHei', '黑体', sans-serif; font-size: 14.5pt; font-weight: bold; margin-top: 25px; margin-bottom: 12px; color: #0f172a; }
    h3 { font-family: 'SimHei', '黑体', sans-serif; font-size: 13pt; font-weight: bold; margin-top: 18px; margin-bottom: 10px; color: #1e293b; }
    p { text-indent: 2em; margin-top: 8px; margin-bottom: 8px; text-align: justify; }
    .highlight-box { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 15px 0; font-size: 11pt; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0 25px 0; font-size: 10pt; }
    th, td { border: 1px solid #333; padding: 6px 10px; text-align: left; vertical-align: middle; }
    th { background-color: #f1f5f9; font-family: 'SimHei', '黑体', sans-serif; font-weight: bold; text-align: center; }
    .iteration-badge { font-weight: bold; color: #1d4ed8; text-align: center; }
    .status-badge { text-align: center; font-weight: bold; }
    .page-break { page-break-after: always; }
  </style>
</head>
<body>

  <!-- 封面 -->
  <div class="cover-page">
    <div class="cover-title">论文智检智能审查管理系统</div>
    <div class="cover-subtitle">需求功能任务排期与敏捷迭代路线图 (2026年10月-12月)</div>
    <div class="cover-dept">编制部门：项目管理办公室 (PMO) / 产研敏捷项目组</div>
    <div class="cover-date">发布日期：2026 年 09 月</div>
  </div>

  <div class="page-break"></div>

  <!-- 目录 -->
  <div class="toc-title">目 录</div>
  <div class="toc-item">1. 路线图编排概述与敏捷管理规约 ..................................................... 3</div>
  <div class="toc-item toc-item-sub">1.1 编排目标与交付范围 ................................................................. 3</div>
  <div class="toc-item toc-item-sub">1.2 双周敏捷迭代机制 (Sprint Cadence) ........................................ 3</div>
  <div class="toc-item toc-item-sub">1.3 质量与准出标准 (DoD) .............................................................. 4</div>
  <div class="toc-item">2. 10月-12月 全周期总体里程碑 (Milestones) .................................... 5</div>
  <div class="toc-item">3. 双周迭代详细排期与功能任务分解 (Sprint 1 ~ Sprint 6) ................. 6</div>
  <div class="toc-item toc-item-sub">3.1 Sprint 1 (10.08 - 10.18): 核心解析引擎强化与字符计量精准化 ...... 6</div>
  <div class="toc-item toc-item-sub">3.2 Sprint 2 (10.21 - 11.01): GB/T标准库对齐与交互报告研读升级 ..... 8</div>
  <div class="toc-item toc-item-sub">3.3 Sprint 3 (11.04 - 11.15): 涉政合规四维AI审查与红线预警体系 ..... 10</div>
  <div class="toc-item toc-item-sub">3.4 Sprint 4 (11.18 - 11.29): 千篇级并发批量引擎与历史台账检索 ... 12</div>
  <div class="toc-item toc-item-sub">3.5 Sprint 5 (12.02 - 12.13): 计费结算中心、收银台与电子发票闭环 . 14</div>
  <div class="toc-item toc-item-sub">3.6 Sprint 6 (12.16 - 12.31): 驾驶舱测评、信创适配与压测验收上线 . 16</div>
  <div class="toc-item">4. 资源配置、风险预警与应对矩阵 ................................................. 18</div>

  <div class="page-break"></div>

  <h1>1. 路线图编排概述与敏捷管理规约</h1>
  <h2>1.1 编排目标与交付范围</h2>
  <p>为确保“论文智检智能审查管理系统”按期达到全面生产运行和信创验收标准，项目管理办公室(PMO)结合《用户使用手册》、《需求规格说明书》及《需求功能清单》，制定 2026 年第四季度（10 月至 12 月）全生命周期研发与交付路线图。</p>
  <p>本路线图覆盖 6 个双周敏捷冲刺（Sprint 1 至 Sprint 6），涵盖论文长文本解析抽取、GB/T 7714-2015 格式校验、意识形态合规风险审查、千篇级批量自动化任务、统一积分计费收银台、多维统计驾驶舱及信创国产化部署的全部落地工作。</p>

  <h2>1.2 双周敏捷迭代机制 (Sprint Cadence)</h2>
  <div class="highlight-box">
    <b>【双周敏捷节奏标准规范】：</b><br/>
    • <b>周一上午 09:30-11:30：</b>Sprint 启动会与任务认领（Sprint Planning），故事点估算与认领。<br/>
    • <b>每日上午 09:15-09:30：</b>15分钟站立晨会（Daily Standup），同步阻碍与进展。<br/>
    • <b>隔周四下午 15:00-18:00：</b>代码冻结与预发布冒烟测试（Feature Freeze & Smoke Test）。<br/>
    • <b>隔周五下午 14:00-17:00：</b>Sprint 成果演示会（Demo Review）与团队复盘会（Retrospective）。
  </div>

  <h2>1.3 质量与准出标准 (Definition of Done - DoD)</h2>
  <p>每个双周交付物必须严格满足：单元测试覆盖率 ≥ 80%，核心接口 P95 响应时间 ≤ 300ms，大模型解析准出准确率 ≥ 96.5%，并通过静态代码安全扫描且无 High/Critical 级别漏洞方可发布上线。</p>

  <h1>2. 10月-12月 全周期总体里程碑 (Milestones)</h1>
  <table>
    <thead>
      <tr>
        <th style="width: 110px;">里程碑编号</th>
        <th style="width: 140px;">关键节点时间</th>
        <th style="width: 180px;">核心交付成果</th>
        <th>业务目标与验收标志</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="status-badge">MS-1</td>
        <td style="text-align:center;">2026年10月18日</td>
        <td>核心解析与基石闭环</td>
        <td>完成 .docx/.pdf 超长文本精准解析，实现单篇/批量字符智能准确计量。</td>
      </tr>
      <tr>
        <td class="status-badge">MS-2</td>
        <td style="text-align:center;">2026年11月01日</td>
        <td>交互式报告与标准库</td>
        <td>GB/T 7714 参考文献库比对引擎落地，上线双栏报告交互与严重程度筛选。</td>
      </tr>
      <tr>
        <td class="status-badge">MS-3</td>
        <td style="text-align:center;">2026年11月15日</td>
        <td>学术合规大模型体系</td>
        <td>涉政意识形态过滤与学术伦理四维 AI 深度审查通过内部红线验收。</td>
      </tr>
      <tr>
        <td class="status-badge">MS-4</td>
        <td style="text-align:center;">2026年11月29日</td>
        <td>千篇批量与检索台账</td>
        <td>千篇级并发批处理队列平稳运行，全量历史台账秒级模糊检索上线。</td>
      </tr>
      <tr>
        <td class="status-badge">MS-5</td>
        <td style="text-align:center;">2026年12月13日</td>
        <td>商业化计费财务闭环</td>
        <td>微信/支付宝收银台打通，积分流水对账与增值税电子发票功能交付。</td>
      </tr>
      <tr>
        <td class="status-badge">MS-6</td>
        <td style="text-align:center;">2026年12月31日</td>
        <td>驾驶舱测评与终验投产</td>
        <td>统计分析驾驶舱上线，通过等保三级与信创兼容认证，系统正式全网商用。</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h1>3. 双周迭代详细排期与功能任务分解 (Sprint 1 ~ Sprint 6)</h1>

  <h2>3.1 Sprint 1 (2026.10.08 ~ 2026.10.18): 核心解析引擎强化与字符计量精准化</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 100px;">所属模块</th>
        <th style="width: 160px;">需求功能点 / 用户故事</th>
        <th>任务详细工作内容与技术落地</th>
        <th style="width: 80px; text-align:center;">工时(人日)</th>
        <th style="width: 90px; text-align:center;">责任角色</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>规范检测</td>
        <td>长文本智能解析流水线</td>
        <td>基于 Apache Tika 与 Python AST 库重构 .docx 与 .pdf 解析器，自动提取标题、作者、摘要、正文与章节层级。</td>
        <td style="text-align:center;">5</td>
        <td style="text-align:center;">后端/算法</td>
      </tr>
      <tr>
        <td>规范检测</td>
        <td>有效字数精准计量算法</td>
        <td>过滤封面空白行、页眉页脚与纯符号，实现汉字、外文字词与统计数字精确核算。</td>
        <td style="text-align:center;">3</td>
        <td style="text-align:center;">后端工程</td>
      </tr>
      <tr>
        <td>工作台</td>
        <td>工作台数据态势底座</td>
        <td>开发已测总篇数、查出问题数、待处理工单与质量评分实时聚合接口与前端看板。</td>
        <td style="text-align:center;">4</td>
        <td style="text-align:center;">全栈工程</td>
      </tr>
      <tr>
        <td>计费中心</td>
        <td>字数与积分实时换算引擎</td>
        <td>接入字典单价配置（1,600积分/万字），实现客户端拖拽上传后 0.5 秒内自动呈现预估积分。</td>
        <td style="text-align:center;">3</td>
        <td style="text-align:center;">前端/后端</td>
      </tr>
      <tr>
        <td>质量工程</td>
        <td>Sprint 1 集成冒烟测试</td>
        <td>100 篇各类格式论文自动化压测解析准确率与边界异常断言。</td>
        <td style="text-align:center;">3</td>
        <td style="text-align:center;">测试/QA</td>
      </tr>
    </tbody>
  </table>

  <h2>3.2 Sprint 2 (2026.10.21 ~ 2026.11.01): GB/T标准库对齐与交互报告研读升级</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 100px;">所属模块</th>
        <th style="width: 160px;">需求功能点 / 用户故事</th>
        <th>任务详细工作内容与技术落地</th>
        <th style="width: 80px; text-align:center;">工时(人日)</th>
        <th style="width: 90px; text-align:center;">责任角色</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>规范检测</td>
        <td>GB/T 7714 参考文献校验</td>
        <td>内嵌国家标准规则引擎，检测著者、题名、出版项、标点缺失及正文引文标引序号对应关系。</td>
        <td style="text-align:center;">6</td>
        <td style="text-align:center;">NLP算法组</td>
      </tr>
      <tr>
        <td>规范检测</td>
        <td>三线表格与图题标注检查</td>
        <td>针对正文表格顶线/底线/栏目线，以及图片标题位置在下方、图源注记进行自动化比对。</td>
        <td style="text-align:center;">4</td>
        <td style="text-align:center;">算法/后端</td>
      </tr>
      <tr>
        <td>报告研读</td>
        <td>双栏全真排版研读工作区</td>
        <td>重构报告界面，左侧实现 60%~180% 无级平滑缩放原文，右侧实现抽屉式问题列表。</td>
        <td style="text-align:center;">5</td>
        <td style="text-align:center;">前端UI/UX</td>
      </tr>
      <tr>
        <td>报告研读</td>
        <td>【严重程度】分段筛选引擎</td>
        <td>新增【严重/中等/轻微/全部】4 档分段快速过滤按钮，支持与 6 大错误类型多维正交筛选。</td>
        <td style="text-align:center;">3</td>
        <td style="text-align:center;">前端工程</td>
      </tr>
      <tr>
        <td>报告研读</td>
        <td>原文平滑滚动与采纳修改</td>
        <td>点击问题自动平滑滚动并居中原文错误段落，支持一键采纳生成修改后版本。</td>
        <td style="text-align:center;">4</td>
        <td style="text-align:center;">前端工程</td>
      </tr>
    </tbody>
  </table>

  <h2>3.3 Sprint 3 (2026.11.04 ~ 2026.11.15): 涉政合规四维AI审查与红线预警体系</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 100px;">所属模块</th>
        <th style="width: 160px;">需求功能点 / 用户故事</th>
        <th>任务详细工作内容与技术落地</th>
        <th style="width: 80px; text-align:center;">工时(人日)</th>
        <th style="width: 90px; text-align:center;">责任角色</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>风险检测</td>
        <td>涉政意识形态敏感词过滤</td>
        <td>构建权威政治方向词库与大模型上下文审查管道，零容忍排查重大常识与政治瑕疵。</td>
        <td style="text-align:center;">5</td>
        <td style="text-align:center;">安全/算法</td>
      </tr>
      <tr>
        <td>风险检测</td>
        <td>学术伦理与虚构引证排查</td>
        <td>接入学术期刊权威数据库，识别虚构文献、过度引用、篡改数据及学术不端行为。</td>
        <td style="text-align:center;">5</td>
        <td style="text-align:center;">算法组</td>
      </tr>
      <tr>
        <td>风险检测</td>
        <td>公民隐私信息识别与脱敏</td>
        <td>正则与 NER 模型结合，自动识别文中身份证、手机号、涉密课题基金号并打码脱敏。</td>
        <td style="text-align:center;">3</td>
        <td style="text-align:center;">后端工程</td>
      </tr>
      <tr>
        <td>风险检测</td>
        <td>紧急催办与高危标红提醒</td>
        <td>检出重大合规漏洞自动置顶高危预警标识，同步触发指导教师与机构管理员邮件告警。</td>
        <td style="text-align:center;">3</td>
        <td style="text-align:center;">全栈工程</td>
      </tr>
      <tr>
        <td>AI 大屏</td>
        <td>四维学术合规综合体检报告</td>
        <td>大模型自动出具包含政治合规、伦理合规、隐私合规、行文规范的四维体检雷达图与文本。</td>
        <td style="text-align:center;">4</td>
        <td style="text-align:center;">前端/算法</td>
      </tr>
    </tbody>
  </table>

  <h2>3.4 Sprint 4 (2026.11.18 ~ 2026.11.29): 千篇级并发批量引擎与历史台账检索</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 100px;">所属模块</th>
        <th style="width: 160px;">需求功能点 / 用户故事</th>
        <th>任务详细工作内容与技术落地</th>
        <th style="width: 80px; text-align:center;">工时(人日)</th>
        <th style="width: 90px; text-align:center;">责任角色</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>批量检测</td>
        <td>千篇级并发异步调度架构</td>
        <td>基于 Redis Cluster + Celery 构建分布式检测任务队列，支持断点续检与动态限流削峰。</td>
        <td style="text-align:center;">6</td>
        <td style="text-align:center;">后端架构组</td>
      </tr>
      <tr>
        <td>批量检测</td>
        <td>批量导入界面与进度看板</td>
        <td>支持多文件拖拽并发上传、批次进度条实时轮询、批量取消及异常论文自动重试。</td>
        <td style="text-align:center;">4</td>
        <td style="text-align:center;">前端工程</td>
      </tr>
      <tr>
        <td>历史台账</td>
        <td>全量论文台账全文模糊检索</td>
        <td>引入 Elasticsearch/高性能索引，支持基于标题、作者、编号、日期范围的多维组合秒级检索。</td>
        <td style="text-align:center;">5</td>
        <td style="text-align:center;">后端工程</td>
      </tr>
      <tr>
        <td>报告导出</td>
        <td>全量汇总 Excel 与 PDF 批量导出</td>
        <td>服务端异步渲染 PDF 报告及全班/全院多维指标对比 Excel，支持一键 ZIP 打包下载。</td>
        <td style="text-align:center;">4</td>
        <td style="text-align:center;">后端工程</td>
      </tr>
      <tr>
        <td>查重比对</td>
        <td>版本增量比对引擎</td>
        <td>开发前后修订版本自动文本 Diff 引擎，高亮标记增、删、改段落，提升复检审查效率。</td>
        <td style="text-align:center;">4</td>
        <td style="text-align:center;">算法/前端</td>
      </tr>
    </tbody>
  </table>

  <h2>3.5 Sprint 5 (2026.12.02 ~ 2026.12.13): 计费结算中心、收银台与电子发票闭环</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 100px;">所属模块</th>
        <th style="width: 160px;">需求功能点 / 用户故事</th>
        <th>任务详细工作内容与技术落地</th>
        <th style="width: 80px; text-align:center;">工时(人日)</th>
        <th style="width: 90px; text-align:center;">责任角色</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>订单管理</td>
        <td>聚合收银台与微信/支付宝打通</td>
        <td>接入主流移动支付 Native/JSAPI 统一网关，支持扫码安全支付、超时自动关单与状态异步回调。</td>
        <td style="text-align:center;">6</td>
        <td style="text-align:center;">支付/后端</td>
      </tr>
      <tr>
        <td>账户中心</td>
        <td>积分账户流水与对账总账</td>
        <td>构建双流水记账机制（充值流水、扣除流水），杜绝并发超扣与账目不平，支持一键对账。</td>
        <td style="text-align:center;">4</td>
        <td style="text-align:center;">后端工程</td>
      </tr>
      <tr>
        <td>订单发票</td>
        <td>增值税电子普通发票系统</td>
        <td>打通税控电子发票 API，用户可在已支付订单勾选抬头一键开票，支持 PDF 发票原件下载。</td>
        <td style="text-align:center;">4</td>
        <td style="text-align:center;">后端/财务</td>
      </tr>
      <tr>
        <td>系统配置</td>
        <td>动态数字字典维护平台</td>
        <td>管理员界面化配置单价、充值规格、优惠券、系统公告，Redis 缓存秒级热刷新。</td>
        <td style="text-align:center;">3</td>
        <td style="text-align:center;">前端/后端</td>
      </tr>
      <tr>
        <td>个人中心</td>
        <td>工单反馈闭环系统</td>
        <td>用户提交纠错工单、体验建议，客服/研发工单系统闭环流转并推送状态答复。</td>
        <td style="text-align:center;">3</td>
        <td style="text-align:center;">全栈工程</td>
      </tr>
    </tbody>
  </table>

  <h2>3.6 Sprint 6 (2026.12.16 ~ 2026.12.31): 驾驶舱测评、信创适配与压测验收上线</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 100px;">所属模块</th>
        <th style="width: 160px;">需求功能点 / 用户故事</th>
        <th>任务详细工作内容与技术落地</th>
        <th style="width: 80px; text-align:center;">工时(人日)</th>
        <th style="width: 90px; text-align:center;">责任角色</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>数据驾驶舱</td>
        <td>学科院系论文效能测评大屏</td>
        <td>ECharts 多重柱状图、趋势折线图、错误类型环形图，支持学院间论文质量横向穿透测评。</td>
        <td style="text-align:center;">5</td>
        <td style="text-align:center;">前端可视化</td>
      </tr>
      <tr>
        <td>安全审计</td>
        <td>全量防篡改操作日志平台</td>
        <td>全站用户登录、积分消费、论文删除、角色变动全记录，日志落盘哈希签名防篡改。</td>
        <td style="text-align:center;">3</td>
        <td style="text-align:center;">安全工程</td>
      </tr>
      <tr>
        <td>信创适配</td>
        <td>国产环境与信创兼容性认证</td>
        <td>在统信 UOS / 银河麒麟及达梦 DM8 / 人大金仓数据库中部署全量回归，出具信创适配报告。</td>
        <td style="text-align:center;">5</td>
        <td style="text-align:center;">运维/DBA</td>
      </tr>
      <tr>
        <td>性能压测</td>
        <td>2000 并发全链路压力测试</td>
        <td>JMeter 模拟 2,000 在线用户并发上传与检索，调优 JVM、MySQL 连接池及线程队列。</td>
        <td style="text-align:center;">4</td>
        <td style="text-align:center;">性能测试组</td>
      </tr>
      <tr>
        <td>最终投产</td>
        <td>全网发布与生产环境终验切换</td>
        <td>蓝绿灰度发布、全量备份、监控告警阈值上线，完成 2026 年 Q4 终验交付投产。</td>
        <td style="text-align:center;">3</td>
        <td style="text-align:center;">产研全员</td>
      </tr>
    </tbody>
  </table>

  <div class="page-break"></div>

  <h1>4. 资源配置、风险预警与应对矩阵</h1>
  <table>
    <thead>
      <tr>
        <th style="width: 120px;">风险类型</th>
        <th style="width: 180px;">风险场景描述</th>
        <th style="width: 80px; text-align:center;">概率/影响</th>
        <th>预警指标与应急预案 (Mitigation Plan)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>大模型并发推理延迟</td>
        <td>毕业季千篇论文集中送检，GPU 显存打满导致推理响应超时。</td>
        <td style="text-align:center;">中 / 高</td>
        <td>预警指标：队列延迟 > 15秒。<br/>预案：开启动态排队令牌桶限流，启用云端备份算力节点自动横向扩容。</td>
      </tr>
      <tr>
        <td>涉政敏感词误报漏报</td>
        <td>学术专业术语被误判为敏感词，或新增敏感表述未及时覆盖。</td>
        <td style="text-align:center;">低 / 极高</td>
        <td>预警指标：复核争议率 > 2%。<br/>预案：建立专业学术白名单库；引入人机协同双审机制与每日词库增量更新。</td>
      </tr>
      <tr>
        <td>长文本文件解析格式损坏</td>
        <td>学生上传特殊排版宏文档或加密 PDF 导致解析线程挂起。</td>
        <td style="text-align:center;">中 / 中</td>
        <td>预警指标：单文档解析耗时 > 10秒。<br/>预案：引入解析沙箱隔离与 10 秒强制熔断机制，友好提示用户另存为标准 docx。</td>
      </tr>
      <tr>
        <td>支付订单网络丢单掉单</td>
        <td>微信/支付宝异步通知受网络抖动丢失导致积分未实时到账。</td>
        <td style="text-align:center;">低 / 高</td>
        <td>预警指标：待支付订单停留 > 5分钟。<br/>预案：配置服务端主动轮询对账补偿 Job，客户端 3 秒主动状态探测。</td>
      </tr>
    </tbody>
  </table>

  <p style="text-align:center;margin-top:50px;">- 2026 年第四季度双周敏捷排期路线图完 -</p>
</body>
</html>
`;

export const generateRoadmapMarkdown = () => {
  return `# 论文智检智能审查管理系统\n# 需求功能任务排期与敏捷迭代路线图 (2026年10月-12月)\n编制部门：项目管理办公室 (PMO) / 产研敏捷项目组\n发布日期：2026 年 09 月\n\n## 1. 路线图编排概述与双周敏捷规约\n- Sprint 1 (10.08 - 10.18): 核心解析引擎强化与字符计量精准化\n- Sprint 2 (10.21 - 11.01): GB/T标准库对齐与交互报告研读升级\n- Sprint 3 (11.04 - 11.15): 涉政合规四维AI审查与红线预警体系\n- Sprint 4 (11.18 - 11.29): 千篇级并发批量引擎与历史台账检索\n- Sprint 5 (12.02 - 12.13): 计费结算中心、收银台与电子发票闭环\n- Sprint 6 (12.16 - 12.31): 驾驶舱测评、信创适配与压测验收上线\n\n（详细任务工时与对应责任人请参阅导出的 Word 原件）\n`;
};
