import { PaperDetectionRecord } from '../types';
import { RiskIssueItem, defaultRiskIssuesList } from '../data/riskIssuesData';

/**
 * Generates semantic HTML report code for content risk inspection
 */
export function generateRiskReportHtml(
  record: PaperDetectionRecord,
  customIssues?: RiskIssueItem[]
): string {
  const issues = customIssues || defaultRiskIssuesList;
  const highRisk = issues.filter(i => i.level === '高风险').length;
  const mediumRisk = issues.filter(i => i.level === '中风险').length;
  const lowRisk = issues.filter(i => i.level === '低风险').length;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${record.title} - 内容风险检测报告</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --danger: #ef4444;
      --warning: #f59e0b;
      --info: #3b82f6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 32px 20px;
    }
    .wrapper {
      max-width: 1200px;
      margin: 0 auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    }
    header {
      border-bottom: 2px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    header h1 {
      font-size: 24px;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 12px;
    }
    .meta-list {
      display: flex;
      flex-wrap: wrap;
      gap: 16px 28px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .meta-list span strong {
      color: #cbd5e1;
    }
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 14px;
      margin-bottom: 32px;
    }
    .stat-box {
      background: #090d16;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .stat-val {
      font-size: 26px;
      font-weight: 800;
      font-family: monospace;
    }
    .stat-lbl {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .val-total { color: #ffffff; }
    .val-high { color: var(--danger); }
    .val-mid { color: var(--warning); }
    .val-low { color: var(--info); }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .issues-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .issue-card {
      background: #0d1322;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      transition: border-color 0.2s;
    }
    .issue-card:hover {
      border-color: #475569;
    }
    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #f1f5f9;
    }
    .badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 6px;
    }
    .badge-high {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .badge-mid {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .badge-low {
      background: rgba(59, 130, 246, 0.15);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .sensitive-block {
      background: #1e293b;
      padding: 12px 16px;
      border-radius: 8px;
      border-left: 4px solid var(--warning);
      font-size: 13px;
      color: #e2e8f0;
      margin: 10px 0;
    }
    .audit-reason {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
      margin-top: 8px;
    }
    .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 12px;
    }
    .tag-item {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 4px;
      background: #1e293b;
      color: #94a3b8;
      border: 1px solid #334155;
    }
    footer {
      text-align: center;
      font-size: 12px;
      color: #64748b;
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <header>
      <h1>《${record.title}》内容风险审查报告</h1>
      <div class="meta-list">
        <span>作者：<strong>${record.author || '未署名'}</strong></span>
        <span>文件名：<strong>${record.filename}</strong></span>
        <span>总字数：<strong>48,500</strong></span>
        <span>审查时间：<strong>${record.uploadTime}</strong></span>
        <span>检测引擎：<strong>论文智检意识形态合规审查系统 v4.2</strong></span>
      </div>
    </header>

    <div class="stats-row">
      <div class="stat-box">
        <div class="stat-val val-total">${issues.length}</div>
        <div class="stat-lbl">检出风险总计</div>
      </div>
      <div class="stat-box">
        <div class="stat-val val-high">${highRisk}</div>
        <div class="stat-lbl">高风险点</div>
      </div>
      <div class="stat-box">
        <div class="stat-val val-mid">${mediumRisk}</div>
        <div class="stat-lbl">中风险点</div>
      </div>
      <div class="stat-box">
        <div class="stat-val val-low">${lowRisk}</div>
        <div class="stat-lbl">低风险点</div>
      </div>
    </div>

    <div class="section-title">
      <span>审查详情与分析研判 (${issues.length} 项)</span>
    </div>

    <div class="issues-list">
      ${issues.map((item, idx) => `
        <div class="issue-card" id="risk-issue-${item.id}">
          <div class="card-top">
            <span class="card-title">#${idx + 1} · 风险预警条目</span>
            <span class="badge ${item.level === '高风险' ? 'badge-high' : item.level === '中风险' ? 'badge-mid' : 'badge-low'}">
              ${item.level}
            </span>
          </div>
          <div class="sensitive-block">
            <strong>检出表述：</strong>${item.sensitiveText}
          </div>
          <div class="audit-reason">
            <strong>研判结论：</strong>${item.auditEvidence}
          </div>
          <div class="tags">
            ${item.tags.map(t => `<span class="tag-item">${t}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <footer>
      本报告由论文智检学术规范与意识形态安全检测引擎自动生成 · 遵循国家学术出版合规标准 · 严格保障内容安全性
    </footer>
  </div>
</body>
</html>`;
}
