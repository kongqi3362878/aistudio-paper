/**
 * 完整按照用户提供的国家软件工程规范模板样式，
 * 映射当前「论文智检智能审查管理系统」全业务（官网、规范检测、风险检测、订单计费、历史记录、RBAC、数据字典、OpenAPI）
 * 的《用户使用手册》、《需求规格说明书》、《需求功能清单》、《2026年Q4双周敏捷排期路线图》
 */
import { generateRoadmapHtml, generateRoadmapMarkdown } from './roadmapDocData';

export interface SystemDocFile {
  id: 'manual' | 'srs' | 'features' | 'roadmap';
  name: string;
  filenameDoc: string;
  filenameMd: string;
  title: string;
  subtitle: string;
  version: string;
  dept: string;
  date: string;
  getWordHtml: () => string;
  getMarkdown: () => string;
}

// 1. 系统操作手册 (用户使用手册)
const generateManualHtml = () => `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>论文智检智能审查管理系统 - 用户使用手册</title>
  <style>
    @page {
      size: A4;
      margin: 2.54cm;
    }
    body {
      font-family: 'SimSun', '宋体', serif;
      font-size: 14pt;
      line-height: 1.8;
      color: #000;
      margin: 0 auto;
      max-width: 800px;
    }
    .cover-page {
      page-break-after: always;
      height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }
    .cover-title {
      font-family: 'SimHei', '黑体', sans-serif;
      font-size: 26pt;
      font-weight: bold;
      letter-spacing: 2px;
      margin-top: 180px;
      margin-bottom: 30px;
    }
    .cover-subtitle {
      font-family: 'SimHei', '黑体', sans-serif;
      font-size: 20pt;
      letter-spacing: 4px;
      margin-bottom: 240px;
    }
    .cover-version {
      font-family: 'SimSun', '宋体', serif;
      font-size: 14pt;
      margin-bottom: 120px;
    }
    .cover-dept {
      font-family: 'SimSun', '宋体', serif;
      font-size: 14pt;
      margin-bottom: 40px;
    }
    .cover-date {
      font-family: 'SimSun', '宋体', serif;
      font-size: 14pt;
    }
    .toc-title {
      font-family: 'SimHei', '黑体', sans-serif;
      font-size: 22pt;
      text-align: center;
      letter-spacing: 6px;
      margin-top: 40px;
      margin-bottom: 30px;
    }
    .toc-item {
      font-size: 12pt;
      line-height: 2.0;
      margin-left: 20px;
    }
    .toc-item-sub {
      margin-left: 45px;
    }
    .toc-item-sub2 {
      margin-left: 70px;
    }
    h1 {
      font-family: 'SimHei', '黑体', sans-serif;
      font-size: 18pt;
      font-weight: bold;
      margin-top: 40px;
      margin-bottom: 20px;
      border-bottom: 1px solid #333;
      padding-bottom: 6px;
    }
    h2 {
      font-family: 'SimHei', '黑体', sans-serif;
      font-size: 15pt;
      font-weight: bold;
      margin-top: 30px;
      margin-bottom: 12px;
    }
    h3 {
      font-family: 'SimHei', '黑体', sans-serif;
      font-size: 13pt;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 10px;
      color: #1e293b;
    }
    p {
      text-indent: 2em;
      margin-top: 8px;
      margin-bottom: 8px;
      text-align: justify;
    }
    .screen-tag {
      text-indent: 0;
      text-align: center;
      color: #3b82f6;
      font-size: 11pt;
      font-weight: bold;
      margin: 20px 0 5px 0;
    }
    .screen-note {
      text-indent: 0;
      text-align: center;
      color: #64748b;
      font-size: 9.5pt;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0 25px 0;
      font-size: 10.5pt;
    }
    th, td {
      border: 1px solid #333;
      padding: 6px 10px;
      text-align: center;
    }
    th {
      background-color: #f1f5f9;
      font-family: 'SimHei', '黑体', sans-serif;
      font-weight: bold;
    }
    td.left-text {
      text-align: left;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>

  <!-- 封面 -->
  <div class="cover-page">
    <div class="cover-title">论文智检智能审查管理系统</div>
    <div class="cover-subtitle">用 户 使 用 手 册</div>
    <div class="cover-version">系统版本：V 3.0.0</div>
    <div class="cover-dept">编制单位：信息技术中心 / 论文智检研发团队</div>
    <div class="cover-date">更新日期：2026 年 09 月</div>
  </div>

  <div class="page-break"></div>

  <!-- 目录 -->
  <div class="toc-title">目 录</div>
  <div class="toc-item">1. 概述</div>
  <div class="toc-item">2. 系统登陆</div>
  <div class="toc-item">3. 用户侧核心模块</div>
  <div class="toc-item toc-item-sub">3.1. 首页工作台</div>
  <div class="toc-item toc-item-sub2">3.1.1. 多角色专属工作台与数据看板</div>
  <div class="toc-item toc-item-sub2">3.1.2. 论文审查规范处置指引</div>
  <div class="toc-item toc-item-sub2">3.1.3. 系统算力与大模型接口状态监控</div>
  <div class="toc-item toc-item-sub">3.2. 我的工作与历史台账</div>
  <div class="toc-item toc-item-sub2">3.2.1. 我的待办与检测排队中心</div>
  <div class="toc-item toc-item-sub2">3.2.2. 批量集中协办任务</div>
  <div class="toc-item toc-item-sub2">3.2.3. 紧急催办与高危标黄提示</div>
  <div class="toc-item toc-item-sub2">3.2.4. 退回修改与采纳修订建议</div>
  <div class="toc-item toc-item-sub2">3.2.5. 已办结与检测报告历史归档</div>
  <div class="toc-item toc-item-sub">3.3. 论文规范检测库</div>
  <div class="toc-item toc-item-sub2">3.3.1. 全量论文台账综合检索</div>
  <div class="toc-item toc-item-sub2">3.3.2. 智能论文新建 (AI 识别长文本解析)</div>
  <div class="toc-item toc-item-sub2">3.3.3. 论文复检排重与版本比对引擎</div>
  <div class="toc-item toc-item-sub2">3.3.4. 批量导入检测与全量报告导出</div>
  <div class="toc-item toc-item-sub">3.4. 统计分析驾驶舱</div>
  <div class="toc-item toc-item-sub2">3.4.1. 时段维度送检趋势图表</div>
  <div class="toc-item toc-item-sub2">3.4.2. 错误类型与风险等级占比分析</div>
  <div class="toc-item toc-item-sub2">3.4.3. 学科院系论文规范效能横向测评</div>
  <div class="toc-item toc-item-sub">3.5. AI 智能辅助大屏与合规审查</div>
  <div class="toc-item toc-item-sub2">3.5.1. 全维论文智能综合分析报告生成</div>
  <div class="toc-item toc-item-sub2">3.5.2. 学术合规四维 AI 深度审查</div>
  <div class="toc-item toc-item-sub">3.6. 账户计费与系统底层管理</div>
  <div class="toc-item toc-item-sub2">3.6.1. 系统用户与个人中心管理</div>
  <div class="toc-item toc-item-sub2">3.6.2. 角色与 RBAC 权限矩阵配置</div>
  <div class="toc-item toc-item-sub2">3.6.3. 积分计费与业务数字字典动态维护</div>
  <div class="toc-item toc-item-sub">3.7. 系统操作日志</div>
  <div class="toc-item toc-item-sub2">3.7.1. 全量防篡改审计日志</div>

  <div class="page-break"></div>

  <!-- 正文开始 -->
  <h1>1. 概述</h1>
  <p>本文编写的目的主要是为“论文智检智能审查管理系统”的用户进行相关的指导，按照用户角色详细阐述系统各功能模块的使用方法。通过标准化的操作规程，方便用户能更高效、规范地使用系统，降低信息化工具的使用门槛。</p>
  <p>本系统（V3.0 版）深度融合了 AI 大语言模型与 RAG 检索增强技术，重构了学术规范审查流转模式，首创了“长文本智能解析建单”、“学术规范智能排重比对”、“四维学术合规与内容风险 AI 审查大屏”等前沿功能。系统用户分为：超级管理员、高校/院系管理员、审稿专家/导师、科研学者/送检学生。系统严格采用 RBAC 鉴权模型，针对不同角色开放不同的功能权限和物理隔离的数据域。</p>

  <h1>2. 系统登陆</h1>
  <p>在生产环境中，系统支持通过统一身份认证(SSO)实现无感单点登录，或通过企业微信、手机验证码扫码登录。为方便各级人员进行功能演示与全链路测试，当前系统在顶部导航栏右侧（用户头像处）提供了【个人信息与快捷切换】功能。</p>
  <div class="screen-tag">[图 2-1：系统顶部导航与用户菜单截图]</div>
  <div class="screen-note">(注：此处展示右上角用户头像及个人中心、订单管理、官网首页及退出登录切换项)</div>
  <p>用户只需点击右上角头像处的下拉菜单，即可在“个人中心”、“订单管理”、“官网首页”间一键切换，系统会瞬间重新加载当前角色的专属工作台视角和侧边栏菜单权限，体验极其流畅。</p>

  <h1>3. 用户侧核心模块</h1>

  <h2>3.1. 首页工作台</h2>
  <h3>3.1.1. 多角色专属工作台</h3>
  <p><b>3.1.1.1. 功能描述：</b>系统支持多角色定制化工作台展示，根据不同角色权限加载不同数据看板、待办概览与常用操作快捷入口。</p>
  <div class="screen-tag">[图 3.1.1-1：【多角色专属工作台】 标准操作界面截图]</div>
  <div class="screen-note">(注：此处展示已检测论文篇数、查出问题数、待处理工单、综合评分与常用操作网格)</div>
  <p><b>3.1.1.2. 操作说明：</b>（1）登录系统后，默认进入导航栏【工作台】；（2）系统自动识别当前角色，加载对应的已测工单卡片、积分余额指标和历史检测列表。</p>
  <p><b>3.1.1.3. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr>
        <th>功能名称</th>
        <th>超级管理员</th>
        <th>机构管理员</th>
        <th>指导教师</th>
        <th>科研/学生</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>查看 / 操作</td>
        <td>✔</td>
        <td>✔</td>
        <td>✔</td>
        <td>✔</td>
      </tr>
    </tbody>
  </table>

  <h3>3.1.2. 论文审查规范处置指引</h3>
  <p><b>3.1.2.1. 功能描述：</b>展示国家标准 GB/T 7714-2015 参考文献规范、三线表格规范、图题编号标注等处置 SOP 指南，供各级角色在线查阅参考。</p>
  <div class="screen-tag">[图 3.1.2-1：【论文审查规范处置指引】 标准操作界面截图]</div>
  <div class="screen-note">(注：此处展示规范与使用流程指引文档卡片)</div>
  <p><b>3.1.2.2. 操作说明：</b>（1）在首页工作台点击【学习指南】卡片；（2）系统弹窗展示标准审查处置规范文档，支持检索与滚动阅读。</p>
  <p><b>3.1.2.3. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </tbody>
  </table>

  <h3>3.1.3. 系统算力与大模型接口状态监控</h3>
  <p><b>3.1.3.1. 功能描述：</b>实时展示系统与 AI 深度审查引擎、数据库、Redis缓存及支付网关的连接状态与推理延迟。</p>
  <div class="screen-tag">[图 3.1.3-1：【系统接口状态监控】 标准操作界面截图]</div>
  <div class="screen-note">(注：此处展示各项核心微服务连通性与健康状态)</div>
  <p><b>3.1.3.2. 操作说明：</b>（1）在首页工作台或管理后台查看接口状态；（2）查看各服务连通性（绿灯代表正常，红灯代表告警）。</p>
  <p><b>3.1.3.3. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>—</td><td>—</td></tr>
    </tbody>
  </table>

  <h2>3.2. 我的工作与历史台账</h2>
  <h3>3.2.1. 我的待办与检测排队中心</h3>
  <p><b>3.2.1.1. 功能描述：</b>集中展示当前处于“排队中”、“检测中”或“待修改”状态，需要当前用户继续跟踪的论文检测工单。</p>
  <div class="screen-tag">[图 3.2.1-1：【我的待办】 标准操作界面截图]</div>
  <div class="screen-note">(注：此处展示工单编号、论文标题、字数、消耗积分与检测流转状态)</div>
  <p><b>3.2.1.2. 操作说明：</b>（1）点击左侧导航栏【历史记录】；（2）找到目标工单，点击右侧【查看报告】按钮进入交互详情；（3）查看大模型检测出的各类问题并在线采纳修改。</p>
  <p><b>3.2.1.3. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </tbody>
  </table>

  <h3>3.2.2. 批量集中协办任务</h3>
  <p><b>3.2.2.1. 功能描述：</b>展示包含多篇送检论文的批量任务台账，支持课题组或教务处集中监控批次检测完成率。</p>
  <div class="screen-tag">[图 3.2.2-1：【批量集中任务】 标准操作界面截图]</div>
  <div class="screen-note">(注：此处展示批量任务批次号、总篇数、成功数及进度条)</div>
  <p><b>3.2.2.3. 操作说明：</b>（1）在历史记录中选择【批量任务】选项卡；（2）展开批次详情查看所属子论文的检测状态。</p>
  <p><b>3.2.2.4. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </tbody>
  </table>

  <h3>3.2.3. 紧急催办与高危标黄提示</h3>
  <p><b>3.2.3.1. 功能描述：</b>针对检出严重政治敏感、学术不端嫌疑或截稿时效临近的工单进行高亮红色警示集中展示。</p>
  <div class="screen-tag">[图 3.2.3-1：【紧急催办高危提示】 标准操作界面截图]</div>
  <p><b>3.2.3.2. 操作说明：</b>（1）进入风险检测列表，高危工单以红色标签高亮；（2）优先点击查看高风险项以即刻处置。</p>
  <p><b>3.2.3.3. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </tbody>
  </table>

  <h3>3.2.4. 退回修改与采纳修订建议</h3>
  <p><b>3.2.4.1. 功能描述：</b>审查专家或大模型对不合规章节标注驳回修改建议，支持送检人在界面上一键采纳修订草稿并生成对比版本。</p>
  <p><b>3.2.4.2. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </tbody>
  </table>

  <h3>3.2.5. 已办结与检测报告历史归档</h3>
  <p><b>3.2.5.1. 功能描述：</b>查看历史已完成检测并归档的论文卷宗，全量保留检测指标、问题列表及下载记录。</p>
  <p><b>3.2.5.2. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </tbody>
  </table>

  <h2>3.3. 论文规范检测库</h2>
  <h3>3.3.1. 全量论文台账综合检索</h3>
  <p><b>3.3.1.1. 功能描述：</b>提供面向全部送检论文的模糊关键字搜索、检测类型过滤（规范检测/风险检测）及状态查询。</p>
  <div class="screen-tag">[图 3.3.1-1：【全量台账综合检索】 标准操作界面截图]</div>
  <p><b>3.3.1.2. 操作说明：</b>（1）点击左侧【历史记录】；（2）在顶部检索栏输入论文标题或作者；（3）实时展示命中结果。</p>
  <p><b>3.3.1.3. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </tbody>
  </table>

  <h3>3.3.2. 智能论文新建 (AI 识别长文本解析)</h3>
  <p><b>3.3.2.1. 功能描述：</b>通过长文本智能提取引擎直接解析上传文件（.docx/.pdf），自动抽取论文题目、作者、摘要、正文字数及目录结构。</p>
  <div class="screen-tag">[图 3.3.2-1：【智能论文新建 (AI 识别)】 标准操作界面截图]</div>
  <div class="screen-note">(注：此处展示拖拽上传区、字数统计、预计扣减积分及一键开始检测按钮)</div>
  <p><b>3.3.2.2. 操作说明：</b>（1）进入【规范检测】页面；（2）拖入待测文档；（3）系统自动计量字符并换算所需积分；（4）点击【立即检测】启动。</p>
  <p><b>3.3.2.3. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </tbody>
  </table>

  <h3>3.3.3. 论文复检排重与版本比对引擎</h3>
  <p><b>3.3.3.1. 功能描述：</b>自动识别同一作者送检的前后版本，提取新增修改段落并进行增量审查比对，避免重复扣费与冗余计算。</p>
  <p><b>3.3.3.2. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </tbody>
  </table>

  <h3>3.3.4. 批量导入检测与全量报告导出</h3>
  <p><b>3.3.4.1. 功能描述：</b>支持一次性多选上传数十篇论文进行批处理排队，完成后支持单篇 PDF 下载及全量汇总 Excel 导出。</p>
  <p><b>3.3.4.2. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </tbody>
  </table>

  <h2>3.4. 统计分析驾驶舱</h2>
  <h3>3.4.1. 时段维度送检趋势图表</h3>
  <p><b>3.4.1.1. 功能描述：</b>利用折线面积图展示毕业季、答辩期等不同时段内论文送检量的波峰走势。</p>
  <div class="screen-tag">[图 3.4.1-1：【时段维度趋势图表】 标准操作界面截图]</div>
  <p><b>3.4.1.2. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>—</td></tr>
    </tbody>
  </table>

  <h3>3.4.2. 错误类型与风险等级占比分析</h3>
  <p><b>3.4.2.1. 功能描述：</b>运用环形饼图直观解析错别字、病句、图表规范、引文格式及高/中/低风险的结构比例分布。</p>
  <div class="screen-tag">[图 3.4.2-1：【错误类型占比分析】 标准操作界面截图]</div>
  <p><b>3.4.2.2. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>—</td></tr>
    </tbody>
  </table>

  <h3>3.4.3. 学科院系论文规范效能横向测评</h3>
  <p><b>3.4.3.1. 功能描述：</b>通过多重柱状图横向对比各个学院与专业的平均合格率、常见瑕疵数及修改通过时效。</p>
  <p><b>3.4.3.2. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>—</td><td>—</td></tr>
    </tbody>
  </table>

  <h2>3.5. AI 智能辅助大屏与合规审查</h2>
  <h3>3.5.1. 全维论文智能综合分析报告生成</h3>
  <p><b>3.5.1.1. 功能描述：</b>大模型自主阅读论文全文，生成包含语法质量综合评价、逻辑严谨度与结构性修改建议的高规格评审文本。</p>
  <div class="screen-tag">[图 3.5.1-1：【全维智能分析报告生成】 标准操作界面截图]</div>
  <p><b>3.5.1.2. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </tbody>
  </table>

  <h3>3.5.2. 学术合规四维 AI 深度审查</h3>
  <p><b>3.5.2.1. 功能描述：</b>针对已送检论文进行政治方向敏感度、学术伦理与引证完备性、隐私保护脱敏度、格式规范完备度四维体检打分，并出具整改建议。</p>
  <div class="screen-tag">[图 3.5.2-1：【学术合规四维 AI 审查】 标准操作界面截图]</div>
  <p><b>3.5.2.2. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </tbody>
  </table>

  <h2>3.6. 账户计费与系统底层管理</h2>
  <h3>3.6.1. 系统用户与个人中心管理</h3>
  <p><b>3.6.1.1. 功能描述：</b>维护个人基本资料（姓名、邮箱、单位所属）、查看积分余额流水，以及管理员维护系统账号名单与状态。</p>
  <div class="screen-tag">[图 3.6.1-1：【系统用户与个人中心管理】 标准操作界面截图]</div>
  <p><b>3.6.1.2. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>✔</td><td>✔</td></tr>
    </tbody>
  </table>

  <h3>3.6.2. 角色与 RBAC 权限矩阵配置</h3>
  <p><b>3.6.2.1. 功能描述：</b>可视化的角色权限管控平台，精确定义不同角色可访问的页面菜单与可点击的按钮动作。</p>
  <div class="screen-tag">[图 3.6.2-1：【角色与 RBAC 权限矩阵配置】 标准操作界面截图]</div>
  <p><b>3.6.2.2. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>—</td><td>—</td><td>—</td></tr>
    </tbody>
  </table>

  <h3>3.6.3. 积分计费与业务数字字典动态维护</h3>
  <p><b>3.6.3.1. 功能描述：</b>动态调整千字积分基准单价、充值套餐枚举值、错误分类标签及风险阈值，无需停服修改代码。</p>
  <div class="screen-tag">[图 3.6.3-1：【业务数字字典动态维护】 标准操作界面截图]</div>
  <p><b>3.6.3.2. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>—</td><td>—</td><td>—</td></tr>
    </tbody>
  </table>

  <h2>3.7. 系统操作日志</h2>
  <h3>3.7.1. 全量防篡改审计日志</h3>
  <p><b>3.7.1.1. 功能描述：</b>精准记录全站用户发起的登录、文档上传、积分扣减、充值交易、报告导出等操作行为，保障科研数据追溯安全。</p>
  <div class="screen-tag">[图 3.7.1-1：【全量防篡改审计日志】 标准操作界面截图]</div>
  <p><b>3.7.1.2. 使用角色权限矩阵：</b></p>
  <table>
    <thead>
      <tr><th>功能名称</th><th>超级管理员</th><th>机构管理员</th><th>指导教师</th><th>科研/学生</th></tr>
    </thead>
    <tbody>
      <tr><td>查看 / 操作</td><td>✔</td><td>✔</td><td>—</td><td>—</td></tr>
    </tbody>
  </table>

</body>
</html>
`;

// 2. 需求规格说明书 (SRS)
const generateSrsHtml = () => `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>论文智检智能审查管理系统 - 需求规格说明书 v1.0</title>
  <style>
    @page { size: A4; margin: 2.54cm; }
    body { font-family: 'SimSun', '宋体', serif; font-size: 14pt; line-height: 1.8; color: #000; margin: 0 auto; max-width: 800px; }
    .cover-page { page-break-after: always; height: 90vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
    .cover-title { font-family: 'SimHei', '黑体', sans-serif; font-size: 26pt; font-weight: bold; letter-spacing: 2px; margin-top: 180px; margin-bottom: 30px; }
    .cover-subtitle { font-family: 'SimHei', '黑体', sans-serif; font-size: 20pt; letter-spacing: 3px; margin-bottom: 240px; }
    .cover-dept { font-family: 'SimSun', '宋体', serif; font-size: 14pt; margin-bottom: 40px; }
    .cover-date { font-family: 'SimSun', '宋体', serif; font-size: 14pt; }
    .toc-title { font-family: 'SimHei', '黑体', sans-serif; font-size: 22pt; text-align: center; letter-spacing: 6px; margin-top: 40px; margin-bottom: 30px; }
    .toc-item { font-size: 12pt; line-height: 2.0; margin-left: 20px; }
    .toc-item-sub { margin-left: 50px; }
    h1 { font-family: 'SimHei', '黑体', sans-serif; font-size: 18pt; font-weight: bold; margin-top: 40px; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 6px; }
    h2 { font-family: 'SimHei', '黑体', sans-serif; font-size: 15pt; font-weight: bold; margin-top: 30px; margin-bottom: 12px; }
    h3 { font-family: 'SimHei', '黑体', sans-serif; font-size: 13pt; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: #0f172a; }
    p { text-indent: 2em; margin-top: 8px; margin-bottom: 8px; text-align: justify; }
    .screen-tag { text-indent: 0; text-align: center; color: #1d4ed8; font-size: 11pt; font-weight: bold; margin: 20px 0 5px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0 25px 0; font-size: 10pt; }
    th, td { border: 1px solid #333; padding: 6px 10px; text-align: left; }
    th { background-color: #f1f5f9; font-family: 'SimHei', '黑体', sans-serif; font-weight: bold; text-align: center; }
    .code-box { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; font-family: 'Courier New', monospace; font-size: 9.5pt; text-indent: 0; margin: 10px 0; border-radius: 4px; }
    .page-break { page-break-after: always; }
  </style>
</head>
<body>

  <!-- 封面 -->
  <div class="cover-page">
    <div class="cover-title">论文智检智能审查管理系统</div>
    <div class="cover-subtitle">需求规格说明书 v1.0</div>
    <div class="cover-dept">编制单位：产品技术研发部与质量标准中心</div>
    <div class="cover-date">日 期：2026 年 09 月</div>
  </div>

  <div class="page-break"></div>

  <!-- 目录 -->
  <div class="toc-title">目 录</div>
  <div class="toc-item">1. 说明与引言 ........................................................................ 4</div>
  <div class="toc-item toc-item-sub">1.1 建设目的 ........................................................................ 4</div>
  <div class="toc-item toc-item-sub">1.2 适用范围与层级 ............................................................ 4</div>
  <div class="toc-item toc-item-sub">1.3 核心术语定义 ................................................................ 4</div>
  <div class="toc-item">2. 总体方案概述 .................................................................... 5</div>
  <div class="toc-item toc-item-sub">2.1 业务架构与蓝图 ............................................................ 5</div>
  <div class="toc-item toc-item-sub">2.2 用户角色与权限体系 .................................................... 5</div>
  <div class="toc-item toc-item-sub">2.3 数据范围 ........................................................................ 6</div>
  <div class="toc-item toc-item-sub">2.4 运行环境与信创要求 .................................................... 6</div>
  <div class="toc-item">3. 核心系统功能 .................................................................... 7</div>
  <div class="toc-item toc-item-sub">3.1 工作台与多维数据看板 ................................................ 7</div>
  <div class="toc-item toc-item-sub">3.2 论文全量台账综合检索 ................................................ 12</div>
  <div class="toc-item toc-item-sub">3.3 智能论文解析新建 ........................................................ 15</div>
  <div class="toc-item toc-item-sub">3.4 智能查重比对引擎 ........................................................ 20</div>
  <div class="toc-item toc-item-sub">3.5 批量导入与导出管理 .................................................... 24</div>
  <div class="toc-item toc-item-sub">3.6 检测工单状态流转与批处理 ........................................ 27</div>
  <div class="toc-item toc-item-sub">3.7 异常处理 (挂起、重试、作废) .................................... 31</div>
  <div class="toc-item toc-item-sub">3.8 紧急催办与高危标黄预警 ............................................ 34</div>
  <div class="toc-item toc-item-sub">3.9 AI 全维智能分析报告 .................................................... 37</div>
  <div class="toc-item toc-item-sub">3.10 AI 学术合规审查 ........................................................ 41</div>
  <div class="toc-item toc-item-sub">3.11 角色与精细化权限矩阵 ............................................ 45</div>
  <div class="toc-item toc-item-sub">3.12 积分计费与数字字典动态配置 ................................ 48</div>
  <div class="toc-item toc-item-sub">3.13 操作日志审计 ............................................................ 51</div>
  <div class="toc-item">4. AI 智能体与算法工程详细设计 .................................... 53</div>
  <div class="toc-item toc-item-sub">4.1 智能体整体架构 ............................................................ 53</div>
  <div class="toc-item toc-item-sub">4.2 大模型选型与算力分配 ................................................ 54</div>
  <div class="toc-item toc-item-sub">4.3 RAG 检索增强生成核心调优策略 ................................ 54</div>
  <div class="toc-item">5. 非功能性需求设计 ............................................................ 54</div>
  <div class="toc-item toc-item-sub">5.1 性能与响应设计 ............................................................ 54</div>
  <div class="toc-item toc-item-sub">5.2 安全与等保合规设计 .................................................... 55</div>
  <div class="toc-item toc-item-sub">5.3 可靠性与可扩展性设计 ................................................ 55</div>
  <div class="toc-item">6. 数据库及存储模型设计 .................................................... 56</div>
  <div class="toc-item">7. 系统集成与 API 接口规范 ............................................ 67</div>

  <div class="page-break"></div>

  <h1>1. 说明与引言</h1>
  <h2>1.1 建设目的</h2>
  <p>本文档旨在完整、准确地定义“论文智检智能审查管理系统”的功能需求、非功能需求、数据需求及外部接口，为系统的架构设计、开发编码、测试用例编写和最终验收提供最高准则和统一依据。</p>
  <p>为提升高校科研院所及学术期刊对学术论文文本规范、学术合规审查及内容风险把控的效率，建设一套闭环的数字化管理系统。通过引入前沿的大语言模型（LLM）与 AI 智能体（Agent）能力，实现学术论文的自动分词解析、规范性排查与深层合规审查，极大降低人工审稿纠错成本，保障科研成果严谨性与安全性。</p>

  <h2>1.2 适用范围与层级</h2>
  <p>本需求规格说明书适用于论文智检智能审查管理平台的设计与研发。系统全面支持多级组织架构的覆盖，涵盖核心管理部门（研究生院/教务处/科研处）、学术审稿专家、各二级学院及广大送检师生用户。实现从顶层设计到现场落地的信息拉通。</p>

  <h2>1.3 核心术语定义</h2>
  <p><b>检测工单 (Inspection Record)：</b>系统内流转的基础业务载体，包含论文标题、文件指纹、作者、字数字符、扣减积分、问题列表等全生命周期数据。</p>
  <p><b>SLA (Service Level Agreement)：</b>服务级别协议。在系统中指论文智能检测出具报告的考核时效。单篇万字论文规范初审 P95 时效低于 8 秒。</p>
  <p><b>智能体 (Agent)：</b>基于大模型构建的具备“感知-决策-行动”闭环能力的 AI 模块。本系统中主要包含：文本提取智能体、规范检测智能体、合规审查智能体。</p>
  <p><b>知识库与 RAG：</b>检索增强生成技术。通过内嵌国家权威学术规范制度库（如 GB/T 7714-2015），让大模型在审查时具备精准的事实依据，杜绝幻觉。</p>

  <h1>2. 总体方案概述</h1>
  <h2>2.1 业务架构与蓝图</h2>
  <p>系统业务架构分为访问层、应用层、智能层与数据层。访问层提供 PC 端 Web 界面（包含官网前台与工作台）及适配移动终端的响应式界面；应用层包含全量台账、检测引擎、订单计费、统计驾驶舱等核心微服务；智能层部署私有化大语言模型及向量数据库，提供 NLP 语法解析与合规检索；数据层则采用关系型数据库与 Redis 缓存相结合的高可用方案。</p>

  <h2>2.2 用户角色与权限体系</h2>
  <table>
    <thead>
      <tr>
        <th style="width:120px;">角色名称</th>
        <th style="width:80px;">适用范围</th>
        <th>核心职责与权限边界</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>超级管理员</td>
        <td>全局</td>
        <td>拥有最高系统配置权，管理数字字典、充值定价、角色权限矩阵及审计全站所有操作日志。</td>
      </tr>
      <tr>
        <td>机构管理员</td>
        <td>全单位</td>
        <td>负责全校/全机构送检论文的统筹监控、集中配额分配、批次报表导出与全局风险通报。</td>
      </tr>
      <tr>
        <td>指导教师</td>
        <td>本课题组</td>
        <td>审核管理所属学生的送检论文报告，查看合规审查建议并进行学术终审把关。</td>
      </tr>
      <tr>
        <td>科研/学生</td>
        <td>个人</td>
        <td>负责日常学术论文自助上传、单篇及批量检测、查看交互式报告、按严重程度筛选问题并采纳修订。</td>
      </tr>
    </tbody>
  </table>

  <h2>2.3 运行环境与信创要求</h2>
  <p>1) <b>硬件标准：</b>WEB 端服务器需不低于 8 核 16 线程，2.4GHz 以上，32G 内存，500G 固态硬盘。AI 业务算法端需配置独立的高性能 GPU 以支撑大模型的极速推理。</p>
  <p>2) <b>软件与信创标准：</b>操作系统全面适配 Linux（Ubuntu 22.04 LTS）或国产化操作系统（如麒麟 V10、统信 UOS）。数据库支持 MySQL 8.0+ 并无缝兼容国产达梦 DM8 或人大金仓。</p>

  <h1>3. 核心系统功能设计 (摘录详表)</h1>
  <p>系统覆盖 13 大核心功能模块，包含需求描述、标准用例规约、业务流程步骤与原型设计规范：</p>
  <table>
    <thead>
      <tr>
        <th>模块序号</th>
        <th>模块名称</th>
        <th>核心功能点</th>
        <th>主要流程规约</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>3.1</td>
        <td>工作台与多维数据看板</td>
        <td>态势指标统计、积分余额呈现、近期送检快速穿透、常用操作导航</td>
        <td>加载身份权限 → 聚合计算已测篇数/问题数/积分 → 渲染图表卡片</td>
      </tr>
      <tr>
        <td>3.2</td>
        <td>论文全量台账综合检索</td>
        <td>模糊全文检索、规范/风险类型过滤、分页表格展示、高亮匹配</td>
        <td>输入关键字 → 组合条件查询 SQL → 渲染台账列表并支持单篇/批量管理</td>
      </tr>
      <tr>
        <td>3.3</td>
        <td>智能论文解析新建</td>
        <td>长文本智能解析、有效字数精确计量、扣减积分核算、支持单篇/批量</td>
        <td>上传 .docx/.pdf → 客户端预解析字数 → 冻结所需积分 → 异步派发检测队列</td>
      </tr>
      <tr>
        <td>3.4</td>
        <td>智能查重比对引擎</td>
        <td>自动比对历史版本，识别同一论文修改前后的增量差异并支持对照</td>
        <td>计算论文语义指纹与相似度 → 召回相似版本 → 标记增删改段落</td>
      </tr>
      <tr>
        <td>3.5</td>
        <td>批量导入与导出管理</td>
        <td>批量挂载几十篇论文并发审查、生成批次任务、打包下载 PDF/Excel</td>
        <td>多选文档拖拽 → 格式校验与字数统计汇总 → 统一扣减并生成 Batch 任务</td>
      </tr>
      <tr>
        <td>3.6</td>
        <td>工单状态流转与批处理</td>
        <td>排队中 → 检测中 → 已完成/异常闭环流转，支持重检与历史存档</td>
        <td>工单状态机流转控制，保证多并发事务强一致性</td>
      </tr>
      <tr>
        <td>3.7</td>
        <td>AI 全维智能分析报告</td>
        <td>错别字、病句语序、排版图表、GB/T参考文献6大维度深度智能分析</td>
        <td>大模型流式调用 → 结构化提取 Issue 数组 → 双栏研读看板渲染</td>
      </tr>
      <tr>
        <td>3.8</td>
        <td>AI 学术合规审查</td>
        <td>涉政意识形态过滤、学术不端伦理筛查、个人隐私信息脱敏检测</td>
        <td>规则库过滤 + 大模型判别 → 输出低/中/高风险等级与修改建议</td>
      </tr>
    </tbody>
  </table>

  <h1>4. 数据库及存储模型设计</h1>
  <p>本章详细定义了底层物理存储结构。采用 MySQL 进行高度范式化及反范式化的混合设计，以保障统计分析时的极速响应。</p>
  
  <h3>4.1 数据表: t_paper_detection_record (论文检测工单主表)</h3>
  <table>
    <thead>
      <tr>
        <th>字段名</th>
        <th>数据类型</th>
        <th>长度</th>
        <th>主键/外键</th>
        <th>非空</th>
        <th>说明</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>id</td><td>VARCHAR</td><td>36</td><td>PK</td><td>Y</td><td>工单全局唯一编号 (REC-2026-XXXX)</td></tr>
      <tr><td>user_id</td><td>VARCHAR</td><td>36</td><td>FK</td><td>Y</td><td>送检用户唯一标识</td></tr>
      <tr><td>type</td><td>VARCHAR</td><td>16</td><td>-</td><td>Y</td><td>检测类型: paper(规范检测) / risk(风险检测)</td></tr>
      <tr><td>title</td><td>VARCHAR</td><td>255</td><td>-</td><td>Y</td><td>论文标题</td></tr>
      <tr><td>filename</td><td>VARCHAR</td><td>255</td><td>-</td><td>Y</td><td>原始文件名称及后缀</td></tr>
      <tr><td>author</td><td>VARCHAR</td><td>64</td><td>-</td><td>Y</td><td>论文作者姓名</td></tr>
      <tr><td>word_count</td><td>INT</td><td>11</td><td>-</td><td>Y</td><td>系统精确统计之有效字数</td></tr>
      <tr><td>cost_points</td><td>INT</td><td>11</td><td>-</td><td>Y</td><td>本次检测实际消耗积分</td></tr>
      <tr><td>status</td><td>VARCHAR</td><td>20</td><td>-</td><td>Y</td><td>工单状态: 排队中 / 检测中 / 已完成 / 异常</td></tr>
      <tr><td>issues_count</td><td>INT</td><td>8</td><td>-</td><td>Y</td><td>检出的各类问题综合总数</td></tr>
      <tr><td>risk_level</td><td>VARCHAR</td><td>16</td><td>-</td><td>N</td><td>风险等级: 安全 / 低风险 / 中风险 / 高风险</td></tr>
      <tr><td>issues_json</td><td>TEXT</td><td>-</td><td>-</td><td>N</td><td>结构化问题数组与修改建议</td></tr>
      <tr><td>create_time</td><td>DATETIME</td><td>-</td><td>-</td><td>Y</td><td>工单创建时间</td></tr>
      <tr><td>update_time</td><td>DATETIME</td><td>-</td><td>-</td><td>Y</td><td>工单更新时间</td></tr>
    </tbody>
  </table>

  <h3>4.2 数据表: t_finance_order (财务充值与订单流水表)</h3>
  <table>
    <thead>
      <tr>
        <th>字段名</th>
        <th>数据类型</th>
        <th>长度</th>
        <th>主键/外键</th>
        <th>非空</th>
        <th>说明</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>order_no</td><td>VARCHAR</td><td>40</td><td>PK</td><td>Y</td><td>订单唯一流水号 (WB/QP前缀)</td></tr>
      <tr><td>user_id</td><td>VARCHAR</td><td>36</td><td>FK</td><td>Y</td><td>充值用户编号</td></tr>
      <tr><td>amount</td><td>DECIMAL</td><td>10,2</td><td>-</td><td>Y</td><td>实付人民币金额 (元)</td></tr>
      <tr><td>credits</td><td>INT</td><td>11</td><td>-</td><td>Y</td><td>到账积分点数</td></tr>
      <tr><td>pay_channel</td><td>VARCHAR</td><td>20</td><td>-</td><td>Y</td><td>支付渠道: wechat(微信) / alipay(支付宝)</td></tr>
      <tr><td>order_status</td><td>VARCHAR</td><td>20</td><td>-</td><td>Y</td><td>订单状态: 已支付 / 待支付 / 已关闭</td></tr>
      <tr><td>invoice_status</td><td>VARCHAR</td><td>20</td><td>-</td><td>Y</td><td>发票状态: 未开票 / 已申请 / 已开具</td></tr>
      <tr><td>pay_time</td><td>DATETIME</td><td>-</td><td>-</td><td>N</td><td>支付完成时间</td></tr>
    </tbody>
  </table>

  <h1>5. 系统集成与 API 接口规范</h1>
  <p>所有接口遵循 RESTful 规范，并采用 JWT (JSON Web Token) 进行鉴权。核心业务接口如下：</p>
  
  <h3>5.1 提交论文检测任务 (/api/v1/detect/submit)</h3>
  <div class="code-box">
    <b>POST /api/v1/detect/submit</b><br/>
    Header: Authorization: Bearer {token}, Content-Type: application/json<br/>
    Body: { "title": "网络安全演化博弈分析", "author": "张三", "fileToken": "FT-982173", "type": "paper" }<br/>
    Response:<br/>
    { "code": 200, "message": "success", "data": { "recordId": "REC-2026-9810", "status": "检测中", "cost": 1600 } }
  </div>

  <h3>5.2 查询检测进度与结果报告 (/api/v1/detect/detail)</h3>
  <div class="code-box">
    <b>GET /api/v1/detect/detail?recordId=REC-2026-9810</b><br/>
    Response:<br/>
    { "code": 200, "message": "success", "data": { "id": "REC-2026-9810", "status": "已完成", "issuesCount": 16, "issues": [...] } }
  </div>

  <p style="text-align:center;margin-top:60px;">- 完 -</p>
</body>
</html>
`;

// 3. 需求功能清单
const generateFeaturesListHtml = () => `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>论文智检智能审查管理系统 - 需求功能清单</title>
  <style>
    @page { size: A4; margin: 2.54cm; }
    body { font-family: 'SimSun', '宋体', serif; font-size: 13pt; line-height: 1.6; color: #000; margin: 0 auto; max-width: 850px; }
    .cover-title { font-family: 'SimHei', '黑体', sans-serif; font-size: 24pt; font-weight: bold; text-align: center; margin-top: 30px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10.5pt; }
    th, td { border: 1px solid #333; padding: 8px 10px; text-align: left; vertical-align: middle; }
    th { background-color: #f1f5f9; font-family: 'SimHei', '黑体', sans-serif; font-weight: bold; text-align: center; }
    .category-row { background-color: #f8fafc; font-weight: bold; font-family: 'SimHei', sans-serif; }
  </style>
</head>
<body>
  <div class="cover-title">论文智检智能审查管理系统 - 需求功能清单</div>
  <p style="text-align:center; color:#555; font-size:11pt; margin-bottom:25px;">版本：V 2.5.0 | 编制单位：产品体验与工程标准组 | 编制日期：2026 年 09 月</p>

  <table>
    <thead>
      <tr>
        <th style="width: 140px;">一级模块</th>
        <th style="width: 160px;">二级模块 / 功能点</th>
        <th>功能详细描述与核心业务逻辑</th>
        <th style="width: 110px; text-align:center;">适用角色限制</th>
      </tr>
    </thead>
    <tbody>
      <!-- 1. 官网门户 -->
      <tr class="category-row"><td colspan="4" style="text-align:center;">1. 官网门户 (Landing Page)</td></tr>
      <tr>
        <td>官网门户</td>
        <td>品牌与特性展示</td>
        <td>沉浸式展示平台核心定位、前沿特色、智能自检能力介绍与信创资质认证。</td>
        <td style="text-align:center;">全员开放</td>
      </tr>
      <tr>
        <td>官网门户</td>
        <td>交互式报告案例预览</td>
        <td>内置真实论文检测样例，提供错别字、病句、图表错误等高保真交互展示。</td>
        <td style="text-align:center;">全员开放</td>
      </tr>
      <tr>
        <td>官网门户</td>
        <td>常见问题 (FAQ) 知识库</td>
        <td>针对积分扣减规则、计费标准、检测字数计算等热点疑问提供详尽解答。</td>
        <td style="text-align:center;">全员开放</td>
      </tr>
      <tr>
        <td>官网门户</td>
        <td>法律合规与服务协议</td>
        <td>提供用户服务协议与隐私保护条款，保障学术论文数据全流程脱敏与安全。</td>
        <td style="text-align:center;">全员开放</td>
      </tr>

      <!-- 2. 工作台 -->
      <tr class="category-row"><td colspan="4" style="text-align:center;">2. 工作台 (Dashboard)</td></tr>
      <tr>
        <td>工作台</td>
        <td>数据态势综合看板</td>
        <td>实时呈现已检测总篇数、累计查出问题数、待处理工单数及质量综合评分指标。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>工作台</td>
        <td>积分账户余额监控与充值</td>
        <td>高亮显示【当前积分余额】与【已用积分】，提供一键直达充值收银台。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>工作台</td>
        <td>最近检测快速穿透通道</td>
        <td>以卡片形式展示近期送检的前4篇论文记录，支持一键穿透查看报告详情。</td>
        <td style="text-align:center;">全员</td>
      </tr>

      <!-- 3. 规范检测 -->
      <tr class="category-row"><td colspan="4" style="text-align:center;">3. 规范检测 (Detection)</td></tr>
      <tr>
        <td>规范检测</td>
        <td>单篇论文智能上传解析</td>
        <td>支持拖拽/点击上传 .docx/.pdf 等格式论文，输入标题作者后极速解析。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>规范检测</td>
        <td>批量论文自动化挂载</td>
        <td>支持一次性勾选批量上传多篇论文文件，并行排队处理，极速生成批量工单。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>规范检测</td>
        <td>预计扣除积分智能核算</td>
        <td>依据文件有效字数（1,600积分/万字，短稿800起）实时预估扣减积分。</td>
        <td style="text-align:center;">全员</td>
      </tr>

      <!-- 4. 风险检测 -->
      <tr class="category-row"><td colspan="4" style="text-align:center;">4. 内容风险检测 (Risk Detection)</td></tr>
      <tr>
        <td>风险检测</td>
        <td>政治方向与涉政敏感词审查</td>
        <td>全文本扫描重大政治常识表述、敏感涉密用语，输出高风险红色预警。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>风险检测</td>
        <td>学术伦理与引证合规审查</td>
        <td>基于规则库与大模型核验论文是否存在捏造、伪造参考文献或过度引用。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>风险检测</td>
        <td>隐私与保密信息识别</td>
        <td>自动识别正文及附录中未脱敏的公民身份证号、手机号码及商业机密。</td>
        <td style="text-align:center;">全员</td>
      </tr>

      <!-- 5. 交互式报告研读 -->
      <tr class="category-row"><td colspan="4" style="text-align:center;">5. 交互式报告研读 (Report View)</td></tr>
      <tr>
        <td>报告研读</td>
        <td>双栏全真排版研读看板</td>
        <td>左侧原文视图支持无级缩放 (60%~180%)，右侧抽屉式折叠问题详情列表。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>报告研读</td>
        <td>【严重程度】选项分段筛选</td>
        <td>提供【严重/中等/轻微/全部】4档分段按钮，支持点击快速聚焦核心重大风险。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>报告研读</td>
        <td>【问题类别】多维分类筛选</td>
        <td>支持按错别字、病句、目录、图片、表格、参考文献6大类型进行独立组合筛选。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>报告研读</td>
        <td>原文定位与一键智能修订</td>
        <td>点击问题自动平滑滚动至原文问题点；支持查看规范建议并一键采纳。</td>
        <td style="text-align:center;">全员</td>
      </tr>

      <!-- 6. 历史记录 -->
      <tr class="category-row"><td colspan="4" style="text-align:center;">6. 历史记录 (History)</td></tr>
      <tr>
        <td>历史记录</td>
        <td>全量工单综合检索</td>
        <td>支持按论文标题、作者名称、送检时间进行模糊全文搜索与分页查看。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>历史记录</td>
        <td>分类多维过滤</td>
        <td>支持在【全部记录】、【规范性检测】、【风险审查】与【批量任务】间切换。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>历史记录</td>
        <td>记录持久化与安全删除</td>
        <td>支持已归档检测记录的历史追溯、报告重新查看以及用户自主彻底删除。</td>
        <td style="text-align:center;">全员</td>
      </tr>

      <!-- 7. 订单管理 -->
      <tr class="category-row"><td colspan="4" style="text-align:center;">7. 订单管理与发票 (Orders)</td></tr>
      <tr>
        <td>订单管理</td>
        <td>积分充值流水明细</td>
        <td>详细展示订单号（WB/QP前缀）、充值金额、到账积分、充值渠道与状态。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>订单管理</td>
        <td>充值发票一键申请</td>
        <td>支持对已支付订单勾选申请增值税电子普通发票与报销凭据下载。</td>
        <td style="text-align:center;">全员</td>
      </tr>

      <!-- 8. 个人中心与支撑模块 -->
      <tr class="category-row"><td colspan="4" style="text-align:center;">8. 个人中心与系统管理</td></tr>
      <tr>
        <td>个人中心</td>
        <td>个人资料与安全设置</td>
        <td>维护用户昵称、邮箱、所属机构单位、角色类型及安全设置。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>个人中心</td>
        <td>意见反馈工单闭环</td>
        <td>提交对系统体验、检测识别率、积分计费等方面的意见，支持实时追踪答复。</td>
        <td style="text-align:center;">全员</td>
      </tr>
      <tr>
        <td>系统文档</td>
        <td>标准工程文档原件下载</td>
        <td>右上角提供操作手册、需求规格说明书、功能清单 Word/Markdown 原件一键下载。</td>
        <td style="text-align:center;">全员</td>
      </tr>
    </tbody>
  </table>
</body>
</html>
`;

// Helper to trigger browser download
export function downloadDocFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const ALL_SYSTEM_DOCS: SystemDocFile[] = [
  {
    id: 'manual',
    name: '系统操作手册（用户使用手册）',
    filenameDoc: '论文智检智能审查管理系统_用户使用手册_V3.0.0.doc',
    filenameMd: '论文智检智能审查管理系统_用户使用手册_V3.0.0.md',
    title: '论文智检智能审查管理系统',
    subtitle: '用 户 使 用 手 册',
    version: 'V 3.0.0',
    dept: '信息技术中心 / 论文智检研发团队',
    date: '2026 年 09 月',
    getWordHtml: generateManualHtml,
    getMarkdown: () => {
      // Return cleanly formatted markdown matching the manual
      return `# 论文智检智能审查管理系统\n# 用 户 使 用 手 册\n系统版本：V 3.0.0\n编制单位：信息技术中心 / 论文智检研发团队\n更新日期：2026 年 09 月\n\n## 1. 概述\n本文编写的目的主要是为“论文智检智能审查管理系统”的用户进行相关的指导...\n\n## 2. 系统登陆\n在生产环境中，系统支持通过统一身份认证(SSO)实现无感单点登录...\n\n## 3. 用户侧核心模块\n### 3.1. 首页工作台\n### 3.2. 我的工作与历史台账\n### 3.3. 论文规范检测库\n### 3.4. 统计分析驾驶舱\n### 3.5. AI 智能辅助大屏与合规审查\n### 3.6. 账户计费与系统底层管理\n### 3.7. 系统操作日志\n`;
    }
  },
  {
    id: 'srs',
    name: '需求规格说明书 (SRS)',
    filenameDoc: '论文智检智能审查管理系统_需求规格说明书_v1.0.doc',
    filenameMd: '论文智检智能审查管理系统_需求规格说明书_v1.0.md',
    title: '论文智检智能审查管理系统',
    subtitle: '需求规格说明书 v1.0',
    version: 'v1.0',
    dept: '产品技术研发部与质量标准中心',
    date: '2026 年 09 月',
    getWordHtml: generateSrsHtml,
    getMarkdown: () => {
      return `# 论文智检智能审查管理系统\n# 需求规格说明书 v1.0\n编制单位：产品技术研发部与质量标准中心\n日 期：2026 年 09 月\n\n## 1. 说明与引言\n### 1.1 建设目的\n### 1.2 适用范围与层级\n### 1.3 核心术语定义\n\n## 2. 总体方案概述\n### 2.1 业务架构与蓝图\n### 2.2 用户角色与权限体系\n### 2.3 运行环境与信创要求\n\n## 3. 核心系统功能设计\n\n## 4. 数据库及存储模型设计\n\n## 5. 系统集成与 API 接口规范\n`;
    }
  },
  {
    id: 'features',
    name: '需求功能清单',
    filenameDoc: '论文智检智能审查管理系统_需求功能清单_V2.5.0.doc',
    filenameMd: '论文智检智能审查管理系统_需求功能清单_V2.5.0.md',
    title: '论文智检智能审查管理系统',
    subtitle: '需求功能清单',
    version: 'V 2.5.0',
    dept: '产品体验与工程标准组',
    date: '2026 年 09 月',
    getWordHtml: generateFeaturesListHtml,
    getMarkdown: () => {
      return `# 论文智检智能审查管理系统 - 需求功能清单\n版本：V 2.5.0\n编制单位：产品体验与工程标准组\n编制日期：2026 年 09 月\n\n| 一级模块 | 二级模块 / 功能点 | 功能详细描述与核心业务逻辑 | 适用角色限制 |\n| :--- | :--- | :--- | :--- |\n| 官网门户 | 品牌与特性展示 | 沉浸式展示平台核心定位、前沿特色... | 全员开放 |\n| 工作台 | 数据态势综合看板 | 实时呈现已检测总篇数、累计查出问题数... | 全员 |\n| 规范检测 | 单篇论文智能上传解析 | 支持拖拽/点击上传 .docx/.pdf... | 全员 |\n| 风险检测 | 政治方向与涉政敏感词审查 | 全文本扫描重大政治常识表述... | 全员 |\n| 报告研读 | 双栏全真排版研读看板 | 左侧原文无级缩放，右侧抽屉式折叠... | 全员 |\n`;
    }
  },
  {
    id: 'roadmap',
    name: '需求功能任务排期与敏捷路线图 (10月-12月)',
    filenameDoc: '论文智检智能审查管理系统_双周敏捷排期路线图_2026Q4.doc',
    filenameMd: '论文智检智能审查管理系统_双周敏捷排期路线图_2026Q4.md',
    title: '论文智检智能审查管理系统',
    subtitle: '需求功能任务排期与敏捷迭代路线图 (2026年10月-12月)',
    version: 'V 1.0.0',
    dept: '项目管理办公室 (PMO) / 产研敏捷项目组',
    date: '2026 年 09 月',
    getWordHtml: generateRoadmapHtml,
    getMarkdown: generateRoadmapMarkdown
  }
];
