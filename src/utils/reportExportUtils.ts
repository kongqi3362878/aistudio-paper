import { PaperDetectionRecord, IssueDetailItem } from '../types';
import { defaultIssuesList } from '../data/reportIssuesData';
import { defaultRiskIssuesList, RiskIssueItem } from '../data/riskIssuesData';

/**
 * Triggers a client-side file download using Blob
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/plain;charset=utf-8;'): void {
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

/**
 * Generates offline index.html for standard paper norm detection report
 */
export function generateStandardReportIndexHtml(
  record: PaperDetectionRecord, 
  customIssues?: IssueDetailItem[]
): string {
  const issues = customIssues || defaultIssuesList;
  const typos = issues.filter(i => i.type === '错别字').length;
  const grammar = issues.filter(i => i.type === '病句').length;
  const images = issues.filter(i => i.type === '图片').length;
  const tables = issues.filter(i => i.type === '表格').length;
  const citations = issues.filter(i => i.type === '参考文献').length;
  const catalogs = issues.filter(i => i.type === '目录').length;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${record.title} - 学术规范性审查报告</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; background: #f8fafc; color: #1e293b; line-height: 1.6; padding: 24px; }
    .container { max-width: 1200px; margin: 0 auto; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); padding: 36px; }
    .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 24px; margin-bottom: 28px; }
    .header h1 { font-size: 26px; color: #0f172a; margin-bottom: 8px; font-weight: 800; }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px; font-size: 13px; color: #64748b; }
    .meta-item strong { color: #334155; }
    .score-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 14px; font-weight: bold; background: #eff6ff; color: #2563eb; }
    .stat-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 28px; }
    .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; text-align: center; }
    .stat-card .num { font-size: 22px; font-weight: 800; color: #1e293b; }
    .stat-card .lbl { font-size: 12px; color: #64748b; margin-top: 2px; }
    .issue-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 14px; }
    .issue-card:hover { border-color: #cbd5e1; }
    .issue-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .issue-title { font-size: 15px; font-weight: 700; color: #0f172a; }
    .tag { font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 6px; }
    .tag-severe { background: #fee2e2; color: #dc2626; }
    .tag-moderate { background: #fef3c7; color: #d97706; }
    .tag-minor { background: #f1f5f9; color: #64748b; }
    .issue-text { font-size: 13px; color: #334155; margin: 6px 0; background: #f8fafc; padding: 8px 12px; border-radius: 6px; font-family: monospace; }
    .issue-suggestion { font-size: 13px; color: #059669; font-weight: 600; margin-top: 6px; }
    .issue-reason { font-size: 12px; color: #64748b; margin-top: 4px; }
    .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>《${record.title}》学术规范审查报告</h1>
      <div class="meta-grid">
        <div class="meta-item">作者：<strong>${record.author || '未署名'}</strong></div>
        <div class="meta-item">文件名：<strong>${record.filename}</strong></div>
        <div class="meta-item">检测字数：<strong>48,500 字</strong></div>
        <div class="meta-item">检测时间：<strong>${record.uploadTime}</strong></div>
        <div class="meta-item">规范评分：<span class="score-badge">92 分</span></div>
      </div>
    </div>

    <div class="stat-cards">
      <div class="stat-card"><div class="num">${issues.length}</div><div class="lbl">问题总数</div></div>
      <div class="stat-card"><div class="num">${typos}</div><div class="lbl">错别字</div></div>
      <div class="stat-card"><div class="num">${grammar}</div><div class="lbl">病句/语域</div></div>
      <div class="stat-card"><div class="num">${images}</div><div class="lbl">图表规范</div></div>
      <div class="stat-card"><div class="num">${tables}</div><div class="lbl">表格规范</div></div>
      <div class="stat-card"><div class="num">${citations}</div><div class="lbl">参考文献</div></div>
      <div class="stat-card"><div class="num">${catalogs}</div><div class="lbl">目录编排</div></div>
    </div>

    <h2>规范勘误详细清单 (${issues.length} 处)</h2>
    <div style="margin-top: 16px;">
      ${issues.map((item, idx) => `
        <div class="issue-card">
          <div class="issue-header">
            <div class="issue-title">#${idx + 1} · [${item.type}] ${item.title}</div>
            <span class="tag ${item.severity === '严重' ? 'tag-severe' : item.severity === '中等' ? 'tag-moderate' : 'tag-minor'}">${item.severity}</span>
          </div>
          ${item.originalText ? `<div class="issue-text">原文片段：${item.originalText}</div>` : ''}
          ${item.suggestion ? `<div class="issue-suggestion">修改建议：${item.suggestion}</div>` : ''}
          ${item.reason ? `<div class="issue-reason">规范依据：${item.reason}</div>` : ''}
          <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">位置：${item.location || '正文'}</div>
        </div>
      `).join('')}
    </div>

    <div class="footer">
      本报告由论文智检学术规范智能检测系统自动生成 · 遵循《学位论文编写规则》(GB/T 7714-2015) · 仅供学术交流与修改参考
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generates offline index.html for content risk detection report
 */
export function generateRiskReportIndexHtml(
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
  <title>${record.title} - 内容安全与意识形态风险审查报告</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; background: #0f172a; color: #e2e8f0; line-height: 1.6; padding: 24px; }
    .container { max-width: 1200px; margin: 0 auto; background: #1e293b; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); padding: 36px; border: 1px solid #334155; }
    .header { border-bottom: 2px solid #334155; padding-bottom: 24px; margin-bottom: 28px; }
    .header h1 { font-size: 26px; color: #f8fafc; margin-bottom: 8px; font-weight: 800; }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 16px; font-size: 13px; color: #94a3b8; }
    .meta-item strong { color: #f1f5f9; }
    .stat-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 28px; }
    .stat-card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 14px; text-align: center; }
    .stat-card .num { font-size: 22px; font-weight: 800; color: #f8fafc; }
    .stat-card .lbl { font-size: 12px; color: #94a3b8; margin-top: 2px; }
    .card-high .num { color: #ef4444; }
    .card-medium .num { color: #f59e0b; }
    .card-low .num { color: #3b82f6; }
    .issue-card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 18px; margin-bottom: 14px; }
    .issue-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .issue-title { font-size: 15px; font-weight: 700; color: #f8fafc; }
    .tag { font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 6px; }
    .tag-high { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
    .tag-medium { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
    .tag-low { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
    .issue-text { font-size: 13px; color: #cbd5e1; margin: 8px 0; background: #1e293b; padding: 10px 14px; border-radius: 6px; border-left: 3px solid #f59e0b; }
    .issue-evidence { font-size: 12px; color: #94a3b8; margin-top: 6px; line-height: 1.5; }
    .tags-container { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .small-tag { font-size: 10px; background: #334155; color: #cbd5e1; padding: 2px 6px; border-radius: 4px; }
    .footer { text-align: center; font-size: 12px; color: #64748b; margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>《${record.title}》内容安全与意识形态风险审查报告</h1>
      <div class="meta-grid">
        <div class="meta-item">作者：<strong>${record.author || '未署名'}</strong></div>
        <div class="meta-item">文件名：<strong>${record.filename}</strong></div>
        <div class="meta-item">检测字数：<strong>48,500 字</strong></div>
        <div class="meta-item">检测时间：<strong>${record.uploadTime}</strong></div>
        <div class="meta-item">安全等级：<strong>${highRisk > 0 ? '建议审慎整改' : mediumRisk > 0 ? '中度预警' : '安全合规'}</strong></div>
      </div>
    </div>

    <div class="stat-cards">
      <div class="stat-card"><div class="num">${issues.length}</div><div class="lbl">风险问题总数</div></div>
      <div class="stat-card card-high"><div class="num">${highRisk}</div><div class="lbl">高风险点</div></div>
      <div class="stat-card card-medium"><div class="num">${mediumRisk}</div><div class="lbl">中风险点</div></div>
      <div class="stat-card card-low"><div class="num">${lowRisk}</div><div class="lbl">低风险点</div></div>
    </div>

    <h2>风险点详细核查清单 (${issues.length} 处)</h2>
    <div style="margin-top: 16px;">
      ${issues.map((item, idx) => `
        <div class="issue-card">
          <div class="issue-header">
            <div class="issue-title">#${idx + 1} · 风险预警段落</div>
            <span class="tag ${item.level === '高风险' ? 'tag-high' : item.level === '中风险' ? 'tag-medium' : 'tag-low'}">${item.level}</span>
          </div>
          <div class="issue-text">敏感/不妥表述：${item.sensitiveText}</div>
          <div class="issue-evidence"><strong>审查研判结论：</strong>${item.auditEvidence}</div>
          <div class="tags-container">
            ${item.tags.map(t => `<span class="small-tag">${t}</span>`).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="footer">
      本报告由论文智检内容安全智能审查引擎自动生成 · 严格遵循国家意识形态与学术出版审查规范 · 仅供内部合规参考
    </div>
  </div>
</body>
</html>`;
}
