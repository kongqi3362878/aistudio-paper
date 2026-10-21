import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Download, 
  ChevronDown, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  FileText, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Copy, 
  Check, 
  Printer, 
  Layers, 
  ChevronRight,
  Info,
  Globe,
  Code,
  FileCode,
  Tag
} from 'lucide-react';
import { PaperDetectionRecord } from '../../types';
import { defaultRiskIssuesList, RiskIssueItem } from '../../data/riskIssuesData';
import { generateRiskReportHtml } from '../../utils/riskReportHtmlGenerator';

interface RiskReportDetailViewProps {
  record: PaperDetectionRecord;
  onBack: () => void;
}

export default function RiskReportDetailView({ record, onBack }: RiskReportDetailViewProps) {
  const [selectedIssueId, setSelectedIssueId] = useState<number>(1);
  const [activeLevelFilter, setActiveLevelFilter] = useState<'全部' | '高风险' | '中风险' | '低风险'>('全部');
  const [activeTagFilter, setActiveTagFilter] = useState<string>('全部');
  const [searchTag, setSearchTag] = useState<string>('');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [copiedHtmlCode, setCopiedHtmlCode] = useState<boolean>(false);
  
  // View mode: 'html' (Semantic HTML layout), 'paper' (Word/A4), 'source' (HTML code)
  const [viewMode, setViewMode] = useState<'html' | 'paper' | 'source'>('html');
  const [showHtmlTags, setShowHtmlTags] = useState<boolean>(true);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Filter issues
  const filteredIssues = defaultRiskIssuesList.filter((issue) => {
    const matchesLevel = activeLevelFilter === '全部' || issue.level === activeLevelFilter;
    const matchesTag = activeTagFilter === '全部' || issue.tags.includes(activeTagFilter);
    const matchesSearch = !searchTag || 
      issue.title.toLowerCase().includes(searchTag.toLowerCase()) ||
      issue.tags.some(t => t.toLowerCase().includes(searchTag.toLowerCase())) ||
      issue.auditEvidence.toLowerCase().includes(searchTag.toLowerCase());
    return matchesLevel && matchesTag && matchesSearch;
  });

  // Calculate counts
  const highRiskCount = defaultRiskIssuesList.filter(i => i.level === '高风险').length;
  const mediumRiskCount = defaultRiskIssuesList.filter(i => i.level === '中风险').length;
  const lowRiskCount = defaultRiskIssuesList.filter(i => i.level === '低风险').length;
  const totalIssuesCount = defaultRiskIssuesList.length;

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 180));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 60));
  const handleResetZoom = () => setZoomLevel(100);

  // Copy handler
  const handleCopy = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Copy full HTML Code
  const handleCopyHtmlCode = () => {
    const html = generateRiskReportHtml(record, defaultRiskIssuesList);
    navigator.clipboard.writeText(html);
    setCopiedHtmlCode(true);
    setTimeout(() => setCopiedHtmlCode(false), 2000);
  };

  // Export HTML File Download
  const handleExportHtml = () => {
    const htmlContent = generateRiskReportHtml(record, defaultRiskIssuesList);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.title.replace(/[\\/:*?"<>|]/g, '_')}_风险检测报告.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Click on issue item to locate to left text
  const handleSelectIssue = (issue: RiskIssueItem) => {
    setSelectedIssueId(issue.id);
    if (viewMode === 'source') {
      setViewMode('html');
    }
    setTimeout(() => {
      const targetElement = document.getElementById(`doc-risk-paragraph-${issue.id}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const selectedIssue = defaultRiskIssuesList.find(i => i.id === selectedIssueId) || defaultRiskIssuesList[0];
  const fullHtmlCode = generateRiskReportHtml(record, defaultRiskIssuesList);

  return (
    <div className={`min-h-screen bg-[#F6F8FC] flex flex-col font-sans text-slate-800 ${isFullScreen ? 'fixed inset-0 z-50 overflow-hidden' : ''}`}>
      {/* 1. Top Header Bar */}
      <header className="bg-white border-b border-slate-200/90 px-6 sm:px-10 py-4 shrink-0 shadow-2xs">
        <div className="w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Back Button + Title + Meta Information */}
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              id="risk-report-back-btn"
              className="mt-1 w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              title="返回"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  风险检测报告详情
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {record.riskLevel || '中风险'}
                </span>
              </div>

              {/* Line 1: Filename, Detection Time, Cost, Issues count */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs sm:text-sm text-slate-500 font-normal">
                <span className="font-medium text-slate-700">“{record.filename}”</span>
                <span>检测时间：{record.uploadTime}</span>
                <span>扣除 <strong className="font-semibold text-slate-700">{record.cost.toLocaleString()}</strong> 积分</span>
                <span>风险点总数：<strong className="font-semibold text-slate-800">{totalIssuesCount}</strong></span>
              </div>

              {/* Line 2: Levels Breakdown */}
              <div className="flex flex-wrap items-center gap-x-3 text-xs sm:text-sm text-slate-600 font-medium">
                <span>全部 <strong className="text-slate-900">{totalIssuesCount}</strong></span>
                <span className="text-slate-300">·</span>
                <span className="text-red-600">高风险 <strong className="font-bold">{highRiskCount}</strong></span>
                <span className="text-slate-300">·</span>
                <span className="text-amber-600">中风险 <strong className="font-bold">{mediumRiskCount}</strong></span>
                <span className="text-slate-300">·</span>
                <span className="text-blue-600">低风险 <strong className="font-bold">{lowRiskCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 self-end lg:self-center">
            {/* Level Quick Filter Buttons */}
            <div className="hidden sm:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs">
              <button
                onClick={() => setActiveLevelFilter('全部')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeLevelFilter === '全部' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setActiveLevelFilter('高风险')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeLevelFilter === '高风险' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-600 hover:text-red-700'
                }`}
              >
                高风险 ({highRiskCount})
              </button>
              <button
                onClick={() => setActiveLevelFilter('中风险')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeLevelFilter === '中风险' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-amber-700'
                }`}
              >
                中风险 ({mediumRiskCount})
              </button>
              <button
                onClick={() => setActiveLevelFilter('低风险')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeLevelFilter === '低风险' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-blue-700'
                }`}
              >
                低风险 ({lowRiskCount})
              </button>
            </div>

            {/* Export Report */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                id="risk-export-btn"
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-md shadow-orange-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.2]" />
                <span>导出风险报告</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-sm animate-in fade-in zoom-in-95">
                  <button
                    onClick={handleExportHtml}
                    className="w-full px-4 py-2.5 text-left text-amber-800 bg-amber-50/70 hover:bg-amber-100 font-bold flex items-center justify-between cursor-pointer border-b border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-600" />
                      <span>HTML 网页报告 (.html)</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-extrabold">推荐</span>
                  </button>
                  <button
                    onClick={() => {
                      alert(`正在生成《${record.title}》风险审查红头 Word 报告...`);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-amber-600 font-medium flex items-center justify-between cursor-pointer"
                  >
                    <span>风险审查报告 (.docx)</span>
                    <span className="text-xs text-slate-400">Word 原件</span>
                  </button>
                  <button
                    onClick={() => {
                      alert(`正在导出《${record.title}》风险清单 Excel 表格...`);
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-amber-600 font-medium flex items-center justify-between cursor-pointer"
                  >
                    <span>风险复核清单 (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-amber-600 font-medium flex items-center justify-between cursor-pointer"
                  >
                    <span>直接打印 / 保存为 PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main 2-Column Workbench: Left is Text/Paper Document, Right is Risk Issues List */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 sm:p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: 正文内容与高亮定位 (支持 HTML 网页结构 / 仿排版 / HTML源码)   */}
        {/* ========================================================================= */}
        <section 
          id="risk-paper-preview-section"
          className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col overflow-hidden min-w-0"
        >
          {/* Preview Toolbar */}
          <div className="px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between bg-[#F9FAFB] shrink-0 gap-3">
            {/* Left title & Mode Switcher */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <div className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {viewMode === 'html' ? <Globe className="w-3.5 h-3.5" /> : viewMode === 'source' ? <Code className="w-3.5 h-3.5" /> : 'R'}
                </div>
                <span>正文内容与定位</span>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center bg-slate-200/70 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setViewMode('html')}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'html' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'hover:text-slate-900'
                  }`}
                  title="HTML 网页形式结构（自适应现代排版与语义化标签）"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>HTML 结构</span>
                </button>
                <button
                  onClick={() => setViewMode('paper')}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'paper' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'hover:text-slate-900'
                  }`}
                  title="标准仿 Word/A4 纸张排版"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>仿排版</span>
                </button>
                <button
                  onClick={() => setViewMode('source')}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === 'source' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'hover:text-slate-900'
                  }`}
                  title="查看完整 HTML 结构源码与一键复制"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>HTML 源码</span>
                </button>
              </div>

              {/* HTML Tag Labels Toggle */}
              {viewMode === 'html' && (
                <button
                  onClick={() => setShowHtmlTags(!showHtmlTags)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                    showHtmlTags 
                      ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold' 
                      : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
                  }`}
                  title="显示/隐藏 HTML 结构标签提示"
                >
                  <Tag className="w-3 h-3" />
                  <span>{showHtmlTags ? '显示结构标签' : '隐藏结构标签'}</span>
                </button>
              )}

              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                当前聚焦 #{selectedIssue.index}
              </span>
            </div>

            {/* Middle & Right Controls */}
            <div className="flex items-center gap-3">
              {/* Zoom Controls (Active in html & paper modes) */}
              {viewMode !== 'source' && (
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200 text-slate-600 shadow-2xs">
                  <button
                    onClick={handleZoomOut}
                    title="缩小"
                    className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    title="重置缩放"
                    className="px-1.5 text-xs font-mono font-bold text-slate-700 hover:text-blue-600 cursor-pointer"
                  >
                    <span>{zoomLevel}%</span>
                  </button>
                  <button
                    onClick={handleZoomIn}
                    title="放大"
                    className="p-1 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {viewMode === 'source' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyHtmlCode}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    {copiedHtmlCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHtmlCode ? '已复制 HTML 源码' : '复制 HTML 源码'}</span>
                  </button>
                  <button
                    onClick={handleExportHtml}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载 .html 文件</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => window.print()}
                className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                title="打印正文"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? '退出全屏' : '全屏展示'}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sub Header info bar based on mode */}
          {viewMode === 'paper' ? (
            <div className="h-4 bg-[#EDEBE9] border-b border-slate-300 px-8 flex items-center justify-between text-[9px] font-mono text-slate-500 select-none overflow-hidden shrink-0">
              <div className="flex items-center gap-6">
                <span>[ 边距 2.54cm ]</span>
                <div className="flex items-center gap-2">
                  <span>|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|</span>
                </div>
              </div>
              <span>文档正文内容核验区</span>
            </div>
          ) : viewMode === 'html' ? (
            <div className="h-7 bg-slate-50 border-b border-slate-200 px-6 flex items-center justify-between text-xs font-mono text-slate-500 select-none overflow-hidden shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">&lt;article&gt;</span>
                <span>&gt;</span>
                <span className="text-amber-700 font-semibold">&lt;section&gt;</span>
                <span>&gt;</span>
                <span className="text-slate-700 font-medium">&lt;p.risk-paragraph&gt;</span>
                <span>&gt;</span>
                <span className="text-amber-600 font-bold">&lt;mark.risk-highlight&gt;</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>HTML5 语义化网页结构</span>
                <span>·</span>
                <span>点击段落高亮可定位右侧风险项</span>
              </div>
            </div>
          ) : (
            <div className="h-7 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between text-xs font-mono text-slate-400 select-none overflow-hidden shrink-0">
              <div className="flex items-center gap-2 text-slate-300">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>HTML 结构源码视图 (标准 HTML5 + 响应式内嵌 CSS + 交互 JS)</span>
              </div>
              <span className="text-[11px] text-slate-400">可直接嵌入任何网页或离线打开</span>
            </div>
          )}

          {/* Scrollable Document Text Content */}
          <div 
            ref={previewContainerRef}
            className={`flex-1 overflow-auto ${viewMode === 'source' ? 'bg-[#0f172a] p-4 sm:p-6' : 'bg-[#F0F2F5] p-6 sm:p-10'} flex justify-center`}
          >
            {/* 1. HTML Source Code View */}
            {viewMode === 'source' && (
              <div className="w-full max-w-5xl bg-[#1e293b] rounded-xl border border-slate-700/80 p-6 font-mono text-xs text-slate-300 overflow-x-auto shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700 pb-3 text-slate-400 text-xs">
                  <span>HTML Document Structure Preview</span>
                  <span>UTF-8 · HTML5</span>
                </div>
                <pre className="leading-relaxed whitespace-pre-wrap selection:bg-amber-500/30 selection:text-white">
                  <code>{fullHtmlCode}</code>
                </pre>
              </div>
            )}

            {/* 2. HTML Semantic Structure View (HTML 网页形式结构) */}
            {viewMode === 'html' && (
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                }}
                className="w-full max-w-4xl transition-transform duration-100 ease-out"
              >
                <article className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-8 sm:p-14 space-y-8 text-slate-800 font-sans select-text relative">
                  {/* Semantic Top Header */}
                  <header className="text-center space-y-3 pb-6 border-b border-slate-100 relative">
                    {showHtmlTags && (
                      <div className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 mb-1">
                        &lt;header class="report-header"&gt;
                      </div>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                      {record.title}
                    </h1>
                    <div className="text-xs text-slate-400 flex flex-wrap items-center justify-center gap-4 pt-1 font-medium">
                      <span>文档原件：{record.filename}</span>
                      <span>·</span>
                      <span>责任作者：{record.author || '课题组'}</span>
                      <span>·</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                        审查状态：合规复核中
                      </span>
                    </div>
                  </header>

                  {/* Semantic Section */}
                  <section className="space-y-6">
                    <div className="flex items-center gap-2">
                      {showHtmlTags && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold shrink-0">
                          &lt;h2&gt;
                        </span>
                      )}
                      <h2 className="text-lg font-bold text-slate-900 border-l-4 border-amber-500 pl-3">
                        第一章 我国对外话语体系建设与国际传播态势
                      </h2>
                    </div>

                    {/* Paragraph 1 */}
                    <div className="space-y-1 relative">
                      {showHtmlTags && (
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span className="text-blue-500 font-semibold">&lt;p id="doc-risk-paragraph-1"&gt;</span>
                          <span className="text-amber-600 font-semibold">&lt;mark class="risk-highlight"&gt;</span>
                        </div>
                      )}
                      <p 
                        id="doc-risk-paragraph-1"
                        className={`p-4 rounded-xl leading-relaxed text-justify text-slate-700 indent-8 transition-all border ${
                          selectedIssueId === 1 
                            ? 'bg-amber-50/90 border-amber-400 shadow-sm ring-2 ring-amber-400/20' 
                            : 'hover:bg-slate-50/80 border-slate-100'
                        }`}
                      >
                        在当今世界百年未有之大变局背景下，构建具有中国特色、中国风格、中国气派的话语体系已成为文化软实力提升的战略支柱。当前涉外传播实践中，
                        <mark 
                          onClick={() => setSelectedIssueId(1)}
                          className="bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded border-b-2 border-amber-500 cursor-pointer font-medium hover:bg-amber-300 transition-colors inline text-indent-0 font-sans shadow-2xs"
                          title="点击查看问题 #1 详情"
                        >
                          突出表现是政治话语、学术话语、大众话语、国际话语之间存在明显区隔，缺乏融通中外的新概念、新范畴、新表述，要么“宣传味”过浓而“学理性”不够，要么就只能在别人的话语体系里打转转。
                        </mark>
                        针对该现象，学界需要强化自主知识体系建构，从学理性与规范性双重维度突破传统外宣路径依赖。
                      </p>
                    </div>

                    {/* Paragraph 2 */}
                    <div className="space-y-1 relative">
                      {showHtmlTags && (
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span className="text-blue-500 font-semibold">&lt;p id="doc-risk-paragraph-2"&gt;</span>
                          <span className="text-amber-600 font-semibold">&lt;mark class="risk-highlight"&gt;</span>
                        </div>
                      )}
                      <p 
                        id="doc-risk-paragraph-2"
                        className={`p-4 rounded-xl leading-relaxed text-justify text-slate-700 indent-8 transition-all border ${
                          selectedIssueId === 2 
                            ? 'bg-amber-50/90 border-amber-400 shadow-sm ring-2 ring-amber-400/20' 
                            : 'hover:bg-slate-50/80 border-slate-100'
                        }`}
                      >
                        面对复杂多变的地缘政治博弈与大国竞合关系，区域国别研究需紧盯关键盟友与第三世界国家的立场动态。
                        <mark 
                          onClick={() => setSelectedIssueId(2)}
                          className="bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded border-b-2 border-amber-500 cursor-pointer font-medium hover:bg-amber-300 transition-colors inline text-indent-0 font-sans shadow-2xs"
                          title="点击查看问题 #2 详情"
                        >
                          我们要敏锐捕捉和准确把握这些国家对美态度之变，并在对美博弈中妥为利用。
                        </mark>
                        这一战略视角的提出，虽出于维护国家安全战略利益的现实考量，但在外宣和学术文本中应始终立足于平等互利共赢的全球合作愿景。
                      </p>
                    </div>

                    {/* Paragraph 3 */}
                    <div className="space-y-1 relative">
                      {showHtmlTags && (
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span className="text-blue-500 font-semibold">&lt;p id="doc-risk-paragraph-3"&gt;</span>
                          <span className="text-amber-600 font-semibold">&lt;mark class="risk-highlight"&gt;</span>
                        </div>
                      )}
                      <p 
                        id="doc-risk-paragraph-3"
                        className={`p-4 rounded-xl leading-relaxed text-justify text-slate-700 indent-8 transition-all border ${
                          selectedIssueId === 3 
                            ? 'bg-amber-50/90 border-amber-400 shadow-sm ring-2 ring-amber-400/20' 
                            : 'hover:bg-slate-50/80 border-slate-100'
                        }`}
                      >
                        伴随全球南方力量的群体性崛起，世界现代化路径已打破西方唯一中心的单一叙事。
                        <mark 
                          onClick={() => setSelectedIssueId(3)}
                          className="bg-amber-200/90 text-amber-950 px-2 py-0.5 rounded border-b-2 border-amber-500 cursor-pointer font-medium hover:bg-amber-300 transition-colors inline text-indent-0 font-sans shadow-2xs"
                          title="点击查看问题 #3 详情"
                        >
                          完全可以正大光明地引导世界各国的在东与西、南与北的比较鉴别中，对中国和美国所分别代表的现代模式做出评判，将平视美国的心态推广至全世界，引导各国做出符合本国利益的新型道路选择。
                        </mark>
                        该主张需以推动全球文明倡议、尊重各国探索符合自身国情的发展道路为前提。
                      </p>
                    </div>

                    {/* Paragraph 4 */}
                    <div className="space-y-1 relative">
                      {showHtmlTags && (
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span className="text-blue-500 font-semibold">&lt;p id="doc-risk-paragraph-4"&gt;</span>
                          <span className="text-blue-600 font-semibold">&lt;mark class="risk-highlight level-low"&gt;</span>
                        </div>
                      )}
                      <p 
                        id="doc-risk-paragraph-4"
                        className={`p-4 rounded-xl leading-relaxed text-justify text-slate-700 indent-8 transition-all border ${
                          selectedIssueId === 4 
                            ? 'bg-blue-50/90 border-blue-400 shadow-sm ring-2 ring-blue-400/20' 
                            : 'hover:bg-slate-50/80 border-slate-100'
                        }`}
                      >
                        调研发现，
                        <mark 
                          onClick={() => setSelectedIssueId(4)}
                          className="bg-blue-100 text-blue-950 px-2 py-0.5 rounded border-b-2 border-blue-500 cursor-pointer font-medium hover:bg-blue-200 transition-colors inline text-indent-0 font-sans shadow-2xs"
                          title="点击查看问题 #4 详情"
                        >
                          部分基层单位在推进重大政策落地过程中，机械式照搬上级文件指标，导致“指尖上的形式主义”隐形变异。
                        </mark>
                        这提示在数字化转型治理中必须坚持求真务实，切实为基层赋能减负。
                      </p>
                    </div>

                    {/* Paragraph 5 */}
                    <div className="space-y-1 relative">
                      {showHtmlTags && (
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span className="text-blue-500 font-semibold">&lt;p id="doc-risk-paragraph-5"&gt;</span>
                          <span className="text-red-600 font-semibold">&lt;mark class="risk-highlight level-high"&gt;</span>
                        </div>
                      )}
                      <p 
                        id="doc-risk-paragraph-5"
                        className={`p-4 rounded-xl leading-relaxed text-justify text-slate-700 indent-8 transition-all border ${
                          selectedIssueId === 5 
                            ? 'bg-red-50/90 border-red-400 shadow-sm ring-2 ring-red-400/20' 
                            : 'hover:bg-slate-50/80 border-slate-100'
                        }`}
                      >
                        在宏观经济实证分析中，
                        <mark 
                          onClick={() => setSelectedIssueId(5)}
                          className="bg-red-100 text-red-950 px-2 py-0.5 rounded border-b-2 border-red-500 cursor-pointer font-medium hover:bg-red-200 transition-colors inline text-indent-0 font-sans shadow-2xs"
                          title="点击查看问题 #5 详情"
                        >
                          在涉及我国某沿海经济特区产业外迁数据引用中，未经脱敏直接标注某未公开国家级战略课题内部调研编号【ZKB-2025-08-CLASSIFIED】。
                        </mark>
                        此举违反了科研数据保守国家秘密的刚性准则，应立即由作者予以修正撤换。
                      </p>
                    </div>
                  </section>

                  {/* Semantic Footer */}
                  <footer className="pt-8 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      {showHtmlTags && <span>&lt;footer&gt;</span>}
                      <span>内容安全与意识形态风险审查报告 · HTML 网页形式结构</span>
                    </div>
                    <span>Page 1 of 1</span>
                  </footer>
                </article>
              </div>
            )}

            {/* 3. Paper View (仿 Word/A4 纸张排版) */}
            {viewMode === 'paper' && (
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top center',
                }}
                className="transition-transform duration-100 ease-out"
              >
                {/* Standard Document Sheet */}
                <div className="w-[820px] min-h-[1140px] bg-white shadow-xl rounded-sm p-16 sm:p-20 relative text-slate-900 font-serif border border-slate-200/80 space-y-8 select-text">
                  {/* Document Header */}
                  <div className="text-center space-y-3 border-b border-slate-200 pb-6 font-sans">
                    <h2 className="text-2xl font-black text-slate-900">
                      {record.title}
                    </h2>
                    <div className="text-xs text-slate-400 flex items-center justify-center gap-4">
                      <span>文档原件：{record.filename}</span>
                      <span>责任作者：{record.author || '课题组'}</span>
                      <span>审查状态：合规复核中</span>
                    </div>
                  </div>

                  {/* Section 1 */}
                  <div className="space-y-4 font-serif text-base leading-loose text-justify indent-8">
                    <h3 className="text-lg font-bold font-sans indent-0 border-l-4 border-amber-500 pl-3 text-slate-900">
                      第一章 我国对外话语体系建设与国际传播态势
                    </h3>

                    {/* Paragraph with Issue 1 */}
                    <p 
                      id="doc-risk-paragraph-1"
                      className={`p-3 rounded-xl transition-all ${
                        selectedIssueId === 1 
                          ? 'bg-amber-50/70 border-2 border-amber-400 shadow-xs' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      在当今世界百年未有之大变局背景下，构建具有中国特色、中国风格、中国气派的话语体系已成为文化软实力提升的战略支柱。当前涉外传播实践中，
                      <span 
                        onClick={() => setSelectedIssueId(1)}
                        className="bg-amber-100/90 text-amber-950 font-sans px-1.5 py-0.5 rounded border-b-2 border-amber-500 cursor-pointer font-medium hover:bg-amber-200 transition-colors inline-block"
                        title="点击查看问题 #1 详情"
                      >
                        突出表现是政治话语、学术话语、大众话语、国际话语之间存在明显区隔，缺乏融通中外的新概念、新范畴、新表述，要么“宣传味”过浓而“学理性”不够，要么就只能在别人的话语体系里打转转。
                      </span>
                      针对该现象，学界需要强化自主知识体系建构，从学理性与规范性双重维度突破传统外宣路径依赖。
                    </p>

                    {/* Paragraph with Issue 2 */}
                    <p 
                      id="doc-risk-paragraph-2"
                      className={`p-3 rounded-xl transition-all ${
                        selectedIssueId === 2 
                          ? 'bg-amber-50/70 border-2 border-amber-400 shadow-xs' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      面对复杂多变的地缘政治博弈与大国竞合关系，区域国别研究需紧盯关键盟友与第三世界国家的立场动态。
                      <span 
                        onClick={() => setSelectedIssueId(2)}
                        className="bg-amber-100/90 text-amber-950 font-sans px-1.5 py-0.5 rounded border-b-2 border-amber-500 cursor-pointer font-medium hover:bg-amber-200 transition-colors inline-block"
                        title="点击查看问题 #2 详情"
                      >
                        我们要敏锐捕捉和准确把握这些国家对美态度之变，并在对美博弈中妥为利用。
                      </span>
                      这一战略视角的提出，虽出于维护国家安全战略利益的现实考量，但在外宣和学术文本中应始终立足于平等互利共赢的全球合作愿景。
                    </p>

                    {/* Paragraph with Issue 3 */}
                    <p 
                      id="doc-risk-paragraph-3"
                      className={`p-3 rounded-xl transition-all ${
                        selectedIssueId === 3 
                          ? 'bg-amber-50/70 border-2 border-amber-400 shadow-xs' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      伴随全球南方力量的群体性崛起，世界现代化路径已打破西方唯一中心的单一叙事。
                      <span 
                        onClick={() => setSelectedIssueId(3)}
                        className="bg-amber-100/90 text-amber-950 font-sans px-1.5 py-0.5 rounded border-b-2 border-amber-500 cursor-pointer font-medium hover:bg-amber-200 transition-colors inline-block"
                        title="点击查看问题 #3 详情"
                      >
                        完全可以正大光明地引导世界各国的在东与西、南与北的比较鉴别中，对中国和美国所分别代表的现代模式做出评判，将平视美国的心态推广至全世界，引导各国做出符合本国利益的新型道路选择。
                      </span>
                      该主张需以推动全球文明倡议、尊重各国探索符合自身国情的发展道路为前提。
                    </p>

                    {/* Paragraph with Issue 4 */}
                    <p 
                      id="doc-risk-paragraph-4"
                      className={`p-3 rounded-xl transition-all ${
                        selectedIssueId === 4 
                          ? 'bg-blue-50/70 border-2 border-blue-400 shadow-xs' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      调研发现，
                      <span 
                        onClick={() => setSelectedIssueId(4)}
                        className="bg-blue-100/80 text-blue-950 font-sans px-1.5 py-0.5 rounded border-b-2 border-blue-500 cursor-pointer font-medium hover:bg-blue-200 transition-colors inline-block"
                        title="点击查看问题 #4 详情"
                      >
                        部分基层单位在推进重大政策落地过程中，机械式照搬上级文件指标，导致“指尖上的形式主义”隐形变异。
                      </span>
                      这提示在数字化转型治理中必须坚持求真务实，切实为基层赋能减负。
                    </p>

                    {/* Paragraph with Issue 5 */}
                    <p 
                      id="doc-risk-paragraph-5"
                      className={`p-3 rounded-xl transition-all ${
                        selectedIssueId === 5 
                          ? 'bg-red-50/70 border-2 border-red-400 shadow-xs' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      在宏观经济实证分析中，
                      <span 
                        onClick={() => setSelectedIssueId(5)}
                        className="bg-red-100/90 text-red-950 font-sans px-1.5 py-0.5 rounded border-b-2 border-red-500 cursor-pointer font-medium hover:bg-red-200 transition-colors inline-block"
                        title="点击查看问题 #5 详情"
                      >
                        在涉及我国某沿海经济特区产业外迁数据引用中，未经脱敏直接标注某未公开国家级战略课题内部调研编号【ZKB-2025-08-CLASSIFIED】。
                      </span>
                      此举违反了科研数据保守国家秘密的刚性准则，应立即由作者予以修正撤换。
                    </p>
                  </div>

                  {/* Page Footer */}
                  <div className="pt-10 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400 font-sans">
                    <span>内容安全与意识形态风险审查报告 · 内部参考</span>
                    <span>- 第 1 页 -</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: 风险问题列表 (1:1 EXACT MATCH WITH USER SCREENSHOT)         */}
        {/* ========================================================================= */}
        <section 
          id="risk-issues-list-section"
          className="w-full lg:w-[680px] xl:w-[740px] 2xl:w-[820px] bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col shrink-0 overflow-hidden"
        >
          {/* Card Header: 风险问题 | 点击问题可定位到正文高亮 */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              风险问题
            </h2>
            <span className="text-xs text-slate-400 font-normal">
              点击问题可定位到正文高亮
            </span>
          </div>

          {/* Optional Search / Quick Tag Filters */}
          <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 text-xs shrink-0">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                placeholder="搜索敏感词、复核证据、标签..."
                className="bg-transparent border-none text-xs text-slate-700 focus:outline-none w-full"
              />
            </div>
            {searchTag && (
              <button 
                onClick={() => setSearchTag('')}
                className="text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
              >
                清空
              </button>
            )}
          </div>

          {/* Scrollable Risk Cards List (1:1 with Screenshot) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-[#FAFAFA]">
            {filteredIssues.map((issue) => {
              const isSelected = selectedIssueId === issue.id;

              return (
                <article
                  key={issue.id}
                  id={`risk-issue-card-${issue.id}`}
                  onClick={() => handleSelectIssue(issue)}
                  className={`bg-white rounded-xl border p-5 transition-all cursor-pointer space-y-4 shadow-2xs relative ${
                    isSelected
                      ? 'border-l-4 border-l-amber-500 border-t-slate-200 border-r-slate-200 border-b-slate-200 ring-2 ring-amber-400/20 shadow-sm'
                      : 'border-l-4 border-l-amber-400 border-t-slate-200/90 border-r-slate-200/90 border-b-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  {/* Row 1: #Number + Main Statement Title + Risk Level Dot Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 text-slate-900 leading-snug">
                      <span className="font-extrabold text-blue-600 font-sans text-sm shrink-0">
                        #{issue.index}
                      </span>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight leading-relaxed">
                        {issue.title}
                      </h3>
                    </div>

                    {/* Right Risk Level Pill: Orange Dot + 中风险 */}
                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      <span className={`w-2 h-2 rounded-full ${
                        issue.level === '高风险' 
                          ? 'bg-red-600 animate-pulse' 
                          : issue.level === '中风险'
                          ? 'bg-[#E67E22]'
                          : 'bg-blue-600'
                      }`} />
                      <span className={`text-xs font-bold ${
                        issue.level === '高风险'
                          ? 'text-red-700'
                          : issue.level === '中风险'
                          ? 'text-[#E67E22]'
                          : 'text-blue-700'
                      }`}>
                        {issue.level}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Tag Pills (Exact Screenshot Style: Light cyan/gray border rounded pill) */}
                  <div className="flex flex-wrap gap-1.5">
                    {issue.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#EEF2F6] text-[#475569] border border-slate-200/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Box 1: 敏感表述 (Rounded gray border container) */}
                  <div className="rounded-xl border border-slate-200/90 p-4 bg-white space-y-1.5">
                    <div className="text-xs font-bold text-slate-800 tracking-wide">
                      敏感表述
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans select-text">
                      {issue.sensitiveText}
                    </p>
                  </div>

                  {/* Box 2: 复核证据 (Rounded gray border container) */}
                  <div className="rounded-xl border border-slate-200/90 p-4 bg-white space-y-1.5">
                    <div className="text-xs font-bold text-slate-800 tracking-wide">
                      复核证据
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans text-justify select-text">
                      {issue.auditEvidence}
                    </p>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex items-center justify-between pt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <span>段落位置：P.{issue.paragraphIndex || 1}</span>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(issue.auditEvidence, issue.id);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedId === issue.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === issue.id ? '已复制复核证据' : '复制复核证据'}</span>
                    </button>
                  </div>
                </article>
              );
            })}

            {filteredIssues.length === 0 && (
              <div className="py-20 text-center text-slate-400 space-y-3">
                <ShieldAlert className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">未找到符合当前筛选条件的风险问题</p>
                <button
                  onClick={() => {
                    setActiveLevelFilter('全部');
                    setActiveTagFilter('全部');
                    setSearchTag('');
                  }}
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  重置筛选条件
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 3. Global Footer */}
      <footer className="py-3 text-center border-t border-slate-200/80 text-xs text-slate-400 bg-white shrink-0">
        © 2026 论文智检. 保留所有权利。 | 风险合规审查系统
      </footer>
    </div>
  );
}
