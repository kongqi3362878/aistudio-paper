import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  AlertCircle, 
  Check, 
  Copy, 
  Download, 
  Search,
  Sparkles,
  ChevronDown,
  Layers,
  Info,
  Filter,
  Printer,
  Eye,
  BookOpen
} from 'lucide-react';
import { PaperDetectionRecord, IssueDetailItem } from '../../types';
import { defaultIssuesList } from '../../data/reportIssuesData';
import { downloadDocFile } from '../../data/downloadableDocs';
import { 
  downloadFile, 
  generateStandardReportIndexHtml 
} from '../../utils/reportExportUtils';

interface ReportDetailViewProps {
  record: PaperDetectionRecord;
  onBack: () => void;
}

type FilterCategory = '全部' | '错别字' | '病句' | '目录' | '图片' | '表格' | '参考文献';
type SeverityFilter = '全部' | '严重' | '中等' | '轻微';

export default function ReportDetailView({ record, onBack }: ReportDetailViewProps) {
  // View states
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('全部');
  const [activeSeverity, setActiveSeverity] = useState<SeverityFilter>('全部');
  const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
  const [showIssueDrawer, setShowIssueDrawer] = useState<boolean>(true);
  const [exportToast, setExportToast] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'paper' | 'text'>('paper');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [wordDocumentMode, setWordDocumentMode] = useState<'print' | 'web'>('print');
  const [showWordMarkup, setShowWordMarkup] = useState<boolean>(true);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Print paper preview directly
  const handlePrintPaper = () => {
    window.print();
  };

  // Issues summary calculations based on current record
  const summary = record.issuesSummary || {
    typos: 24,
    grammar: 185,
    images: 103,
    tables: 25,
    citations: 0,
    catalog: 0,
  };

  const typosCount = summary.typos ?? 24;
  const grammarCount = summary.grammar ?? 185;
  const imagesCount = summary.images ?? 103;
  const tablesCount = summary.tables ?? 25;
  const citationsCount = summary.citations ?? 0;
  const catalogCount = summary.catalog ?? 0;
  const totalCount = record.issuesCount || (typosCount + grammarCount + imagesCount + tablesCount + citationsCount + catalogCount);

  // Filter issues based on Category and Severity options
  const filteredIssues = defaultIssuesList.filter((item) => {
    const matchesCategory = activeFilter === '全部' || item.type === activeFilter;
    const matchesSeverity = activeSeverity === '全部' || item.severity === activeSeverity;
    return matchesCategory && matchesSeverity;
  });

  // Category-specific issues for calculating dynamic severity counts
  const categoryIssues = defaultIssuesList.filter((item) => {
    if (activeFilter === '全部') return true;
    return item.type === activeFilter;
  });

  const severeCount = categoryIssues.filter((i) => i.severity === '严重').length;
  const mediumCount = categoryIssues.filter((i) => i.severity === '中等').length;
  const minorCount = categoryIssues.filter((i) => i.severity === '轻微').length;
  const totalSeverityCount = categoryIssues.length;

  // Handle Zoom
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 180));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 60));
  const handleResetZoom = () => setZoomLevel(100);

  // Handle Copy Suggestion
  const handleCopySuggestion = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Scroll to issue in preview
  const scrollToIssue = (issue: IssueDetailItem) => {
    setSelectedIssueId(issue.id);
    if (issue.elementId) {
      const elem = document.getElementById(issue.elementId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Export handlers
  const handleExportIndexHtml = () => {
    const html = generateStandardReportIndexHtml(record, defaultIssuesList);
    const filename = 'index.html';
    downloadFile(filename, html, 'text/html;charset=utf-8;');
    setExportToast(`已成功下载导出「${filename}」离线规范审查报告！`);
    setShowExportMenu(false);
    setTimeout(() => setExportToast(null), 4000);
  };

  const handleExportIssuesCsv = () => {
    let csv = '\uFEFFIndex编号,分类,严重等级,原句/问题摘要,修改建议,规范依据,所在页码位置\n';
    defaultIssuesList.forEach(item => {
      const esc = (t?: string) => `"${(t || '').replace(/"/g, '""')}"`;
      csv += `${esc('#' + item.id)},${esc(item.type)},${esc(item.severity)},${esc(item.originalText)},${esc(item.suggestion)},${esc(item.reason)},${esc(item.location)}\n`;
    });
    const filename = `${record.filename}_勘误索引清单.csv`;
    downloadFile(filename, csv, 'text/csv;charset=utf-8;');
    setExportToast(`已成功导出「${filename}」！Excel 兼容中文显示。`);
    setShowExportMenu(false);
    setTimeout(() => setExportToast(null), 4000);
  };

  const handleExportWordDoc = () => {
    const wordHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${record.title} 规范审查报告</title></head>
      <body>
        <h1>${record.title} 学术规范性审查报告 (标注原件)</h1>
        <p><b>文件名：</b>${record.filename} | <b>时间：</b>${record.uploadTime} | <b>问题总数：</b>${totalCount}</p>
        <hr/>
        <h2>勘误详细清单</h2>
        <ul>
          ${defaultIssuesList.map(i => `<li><b>[#${i.id} - ${i.type}]</b> (${i.severity}) ${i.originalText} <br/> 建议：${i.suggestion} (依据：${i.reason}，位置：${i.location})</li>`).join('')}
        </ul>
      </body>
      </html>
    `;
    const filename = `${record.filename}_规范审查标注原件.doc`;
    downloadFile(filename, wordHtml, 'application/msword;charset=utf-8;');
    setExportToast(`已成功导出「${filename}」Word 规范审查报告！`);
    setShowExportMenu(false);
    setTimeout(() => setExportToast(null), 4000);
  };

  // Severity indicator color
  const getSeverityBadge = (severity: '严重' | '中等' | '轻微') => {
    switch (severity) {
      case '严重':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-red-600">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            严重
          </span>
        );
      case '中等':
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            中等
          </span>
        );
      case '轻微':
      default:
        return (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            轻微
          </span>
        );
    }
  };

  // Type badge style matching screenshot
  const getTypeTag = (type: string) => {
    switch (type) {
      case '图片':
        return <span className="text-xs px-2.5 py-0.5 rounded font-medium bg-purple-50 text-purple-600">图片</span>;
      case '病句':
        return <span className="text-xs px-2.5 py-0.5 rounded font-medium bg-blue-50 text-blue-600">病句</span>;
      case '错别字':
        return <span className="text-xs px-2.5 py-0.5 rounded font-medium bg-rose-50 text-rose-600">错别字</span>;
      case '表格':
        return <span className="text-xs px-2.5 py-0.5 rounded font-medium bg-emerald-50 text-emerald-600">表格</span>;
      case '参考文献':
        return <span className="text-xs px-2.5 py-0.5 rounded font-medium bg-orange-50 text-orange-600">参考文献</span>;
      case '目录':
        return <span className="text-xs px-2.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600">目录</span>;
      default:
        return <span className="text-xs px-2.5 py-0.5 rounded font-medium bg-slate-100 text-slate-600">{type}</span>;
    }
  };

  return (
    <div className={`min-h-screen bg-[#F6F8FC] flex flex-col font-sans text-slate-800 ${isFullScreen ? 'fixed inset-0 z-50 overflow-hidden' : ''}`}>
      {/* 1. Top Header Bar (1:1 with Screenshot) */}
      <header className="bg-white border-b border-slate-200/90 px-6 sm:px-10 py-4 shrink-0 shadow-2xs">
        <div className="w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Back Button + Title + Meta Information */}
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              id="report-back-btn"
              className="mt-1 w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              title="返回"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                检测详情
              </h1>

              {/* Line 1: Filename, Detection Time, Cost, Issues count */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs sm:text-sm text-slate-500 font-normal">
                <span className="font-medium text-slate-700">“{record.filename}”</span>
                <span>检测时间：{record.uploadTime}</span>
                <span>扣除 <strong className="font-semibold text-slate-700">{record.cost.toLocaleString()}</strong> 积分</span>
                <span>问题总数：<strong className="font-semibold text-slate-800">{totalCount}</strong></span>
              </div>

              {/* Line 2: All · Typos · Grammar · Images · Tables · Citations · Catalog */}
              <div className="flex flex-wrap items-center gap-x-2 text-xs sm:text-sm text-slate-600 font-medium">
                <span>全部 <strong className="text-slate-900">{totalCount}</strong></span>
                <span className="text-slate-300">·</span>
                <span>错别字 <strong className="text-slate-900">{typosCount}</strong></span>
                <span className="text-slate-300">·</span>
                <span>病句 <strong className="text-slate-900">{grammarCount}</strong></span>
                <span className="text-slate-300">·</span>
                <span>图片 <strong className="text-slate-900">{imagesCount}</strong></span>
                <span className="text-slate-300">·</span>
                <span>表格 <strong className="text-slate-900">{tablesCount}</strong></span>
                <span className="text-slate-300">·</span>
                <span>参考文献 <strong className="text-slate-900">{citationsCount}</strong></span>
                <span className="text-slate-300">·</span>
                <span>目录 <strong className="text-slate-900">{catalogCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 self-end lg:self-center">
            {/* Toggle Issues Drawer */}
            <button
              onClick={() => setShowIssueDrawer(!showIssueDrawer)}
              id="report-toggle-issues-btn"
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                showIssueDrawer 
                  ? 'bg-slate-50 border-slate-300 text-slate-700 shadow-2xs' 
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
              }`}
            >
              <Info className="w-4 h-4 text-slate-500" />
              <span>问题列表</span>
            </button>

            {/* Quick 1-click Download: 下载导出 index 形式 */}
            <button
              id="report-quick-download-index-btn"
              onClick={handleExportIndexHtml}
              className="px-4 py-2 rounded-xl text-sm font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 border border-purple-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 cursor-pointer group"
              title="一键下载 index 形式离线规范审查报告 (index.html)"
            >
              <Download className="w-4 h-4 text-purple-700 group-hover:translate-y-0.5 transition-transform" />
              <span>下载导出 index 形式</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-purple-200/90 text-purple-900 font-mono font-bold">
                .html
              </span>
            </button>

            {/* Export Report (Vibrant Purple Button) */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                id="report-export-btn"
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#9333EA] shadow-md shadow-purple-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.2]" />
                <span>导出报告选项</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-80" />
              </button>

              {/* Export Dropdown */}
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 text-sm animate-in fade-in zoom-in-95 space-y-1">
                  <div className="px-4 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    规范 Index 导出格式
                  </div>

                  <button
                    onClick={handleExportIndexHtml}
                    className="w-full px-4 py-2.5 text-left text-slate-800 hover:bg-purple-50/70 hover:text-purple-700 font-medium flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5 text-purple-900">
                        <span>离线交互报告 (index.html)</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-200 text-purple-800 font-bold">推荐</span>
                      </div>
                      <div className="text-xs text-slate-400 group-hover:text-purple-600/70 mt-0.5">
                        全量勘误索引与审查明细，离线自包含单页
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={handleExportIssuesCsv}
                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-purple-600 font-medium flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">问题勘误清单 (index.csv)</div>
                      <div className="text-xs text-slate-400 mt-0.5">Excel 兼容，按序号条目索引</div>
                    </div>
                  </button>

                  <button
                    onClick={handleExportWordDoc}
                    className="w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 hover:text-purple-600 font-medium flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">标注版 Word 原件 (.doc)</div>
                      <div className="text-xs text-slate-400 mt-0.5">完整排版与批注原样</div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setShowExportMenu(false);
                      window.print();
                    }}
                    className="w-full px-4 py-2 text-left text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium flex items-center justify-between cursor-pointer"
                  >
                    <span>直接打印 / 保存为 PDF</span>
                    <Printer className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Content Workspace */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto p-4 sm:p-6 flex gap-6 overflow-hidden">
        {/* Left: Paper Preview Card */}
        <section className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col overflow-hidden min-w-0">
          {/* Preview Toolbar (Word 1:1 Layout & Controls) */}
          <div className="px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between bg-[#F9FAFB] shrink-0 gap-3">
            {/* Left title & Word Mode Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                <div className="w-6 h-6 rounded-md bg-[#2B579A] text-white flex items-center justify-center font-serif font-black text-xs shadow-xs">
                  W
                </div>
                <span>论文原版排版</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-800 font-semibold border border-blue-200">
                Word 1:1 标准 A4 · 2.54cm 边距
              </span>
            </div>

            {/* Middle & Right Controls */}
            <div className="flex items-center gap-3">
              {/* Word Markup Toggle */}
              {viewMode === 'paper' && (
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-500 font-medium">审阅修订标记:</span>
                  <button
                    type="button"
                    onClick={() => setShowWordMarkup(!showWordMarkup)}
                    className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      showWordMarkup 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {showWordMarkup ? '显示批注高亮' : '隐藏标记(纯净原件)'}
                  </button>
                </div>
              )}

              {/* Switch to parsed text */}
              <button
                onClick={() => setViewMode(viewMode === 'paper' ? 'text' : 'paper')}
                id="toggle-view-mode-btn"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{viewMode === 'paper' ? '结构化勘误清单' : 'Word 原版页面'}</span>
              </button>

              {/* Print Paper Directly */}
              <button
                type="button"
                onClick={handlePrintPaper}
                className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                title="打印原稿"
              >
                <Printer className="w-4 h-4" />
              </button>

              {/* Zoom Controls */}
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
                  title="重置 100%"
                  className="px-1.5 text-xs font-mono font-bold text-slate-700 hover:text-blue-600 cursor-pointer flex items-center gap-1"
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

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                title={isFullScreen ? '退出全屏' : '全屏展示'}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Word Ruler Line (1:1 Word Feature) */}
          {viewMode === 'paper' && (
            <div className="h-4 bg-[#EDEBE9] border-b border-slate-300 px-8 flex items-center justify-between text-[9px] font-mono text-slate-500 select-none overflow-hidden shrink-0">
              <div className="flex items-center gap-6">
                <span>[ 边距 2.54cm ]</span>
                <div className="flex items-center gap-2">
                  <span>|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|···|</span>
                </div>
              </div>
              <span>标准 A4 页面宽 210mm × 297mm · 纵向</span>
            </div>
          )}

          {/* Preview Scrollable Body */}
          <div 
            ref={previewContainerRef}
            className="flex-1 overflow-y-auto p-6 lg:p-12 bg-slate-100/60 flex justify-center items-start scroll-smooth"
          >
            {viewMode === 'paper' ? (
              /* Paper Mock Layout (1:1 with Chinese University Master Thesis Cover & Content) */
              <div 
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                className="transition-transform duration-150 ease-out space-y-12"
              >
                {/* PAGE 1: Thesis Cover */}
                <div 
                  id="thesis-page-1"
                  className="w-[820px] min-h-[1140px] bg-white shadow-xl rounded-sm p-16 sm:p-20 relative text-slate-900 font-serif border border-slate-200/80 flex flex-col justify-between select-text"
                >
                  {/* Top Header metadata */}
                  <div className="flex justify-between text-base font-medium tracking-wider">
                    <div className="space-y-3">
                      <div>
                        分类号<span className="inline-block border-b-2 border-slate-800 w-32 ml-1 text-center font-sans font-bold">G40-058</span>
                      </div>
                      <div>
                        <span className="tracking-[0.45em]">UDC</span>
                        <span className="inline-block border-b-2 border-slate-800 w-32 ml-1 text-center font-sans font-bold">37.014</span>
                      </div>
                    </div>
                    <div className="space-y-3 text-right">
                      <div>
                        密级<span className="inline-block border-b-2 border-slate-800 w-32 ml-1 text-center font-sans font-bold">公开</span>
                      </div>
                      <div>
                        编号<span className="inline-block border-b-2 border-slate-800 w-32 ml-1 text-center font-sans font-bold">202611029</span>
                      </div>
                    </div>
                  </div>

                  {/* University Name in Calligraphy Style */}
                  <div className="text-center pt-8 space-y-6">
                    <div className="inline-block">
                      <h2 className="text-5xl sm:text-6xl font-black tracking-[0.25em] text-slate-900 font-serif drop-shadow-xs">
                        華中師範大學
                      </h2>
                      <p className="text-xs uppercase tracking-[0.45em] text-slate-400 mt-2 font-sans font-semibold">
                        CENTRAL CHINA NORMAL UNIVERSITY
                      </p>
                    </div>

                    <div className="pt-6">
                      <h3 className="text-4xl sm:text-5xl font-extrabold tracking-[0.3em] text-slate-900">
                        硕士学位论文
                      </h3>
                      <p className="text-sm font-sans tracking-[0.2em] text-slate-500 mt-2 font-medium">
                        MASTER'S DEGREE THESIS
                      </p>
                    </div>
                  </div>

                  {/* Title Block with double underline styling */}
                  <div className="text-center py-12 px-6">
                    <div className="space-y-4">
                      <div className="border-b-2 border-slate-900 pb-2">
                        <h4 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-wide font-sans leading-tight">
                          “双减”背景下 Z 县小学生
                        </h4>
                      </div>
                      <div className="border-b-2 border-slate-900 pb-2">
                        <h4 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-wide font-sans leading-tight">
                          家庭教育投入问题研究
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Metadata fields */}
                  <div className="max-w-md mx-auto w-full space-y-4 text-base font-medium font-sans pb-10">
                    <div className="flex items-center">
                      <span className="w-32 text-slate-700 tracking-widest text-right pr-4 font-serif">研究生姓名：</span>
                      <span className="flex-1 border-b border-slate-400 pb-1 font-bold text-slate-900 text-center">高 可</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-slate-700 tracking-widest text-right pr-4 font-serif">指导教师：</span>
                      <span className="flex-1 border-b border-slate-400 pb-1 font-bold text-slate-900 text-center">张某某 教授</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-slate-700 tracking-widest text-right pr-4 font-serif">学科专业：</span>
                      <span className="flex-1 border-b border-slate-400 pb-1 font-bold text-slate-900 text-center">教育经济与管理</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-slate-700 tracking-widest text-right pr-4 font-serif">研究方向：</span>
                      <span className="flex-1 border-b border-slate-400 pb-1 font-bold text-slate-900 text-center">基础教育均衡发展与家庭投入</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32 text-slate-700 tracking-widest text-right pr-4 font-serif">完成日期：</span>
                      <span className="flex-1 border-b border-slate-400 pb-1 font-bold text-slate-900 text-center">2026 年 5 月</span>
                    </div>
                  </div>

                  {/* Page bottom footnote */}
                  <div className="text-center text-xs text-slate-400 font-sans border-t border-slate-100 pt-4">
                    华中师范大学学位评定委员会办公室印制
                  </div>
                </div>

                {/* PAGE 2: Chinese Abstract (With Typo Highlights) */}
                <div 
                  id="thesis-page-2"
                  className="w-[820px] min-h-[1140px] bg-white shadow-xl rounded-sm p-16 sm:p-20 relative text-slate-900 font-serif border border-slate-200/80 space-y-8 select-text"
                >
                  <div className="text-center space-y-2 border-b border-slate-200 pb-6">
                    <h3 className="text-2xl font-bold tracking-[0.4em]">摘 要</h3>
                  </div>

                  <div className="text-base leading-loose text-justify indent-8 space-y-6 font-serif">
                    <p>
                      自 2021 年国家出台“双减”政策以来，基础教育生态迎来了系统性重塑。家庭作为教育投入的关键主体，其在课外辅导支出、陪伴时间及教育期望方面的投入逻辑受到广泛关注。本研究立足于中部某省 Z 县，通过对 8 所小学共 1,260 份有效学生家长问卷进行深入实证分析，探讨“双减”后县域小学生家庭教育投入的结构性变化。
                    </p>

                    <p>
                      在理论研究层面，本研究对国内外家庭资本积累机制与代际传递路径进行了梳理。特别是
                      <span 
                        id="issue-elem-10"
                        onClick={() => setSelectedIssueId(10)}
                        className="mx-1 px-1 bg-rose-50 text-rose-700 border-b-2 border-rose-500 font-sans cursor-pointer hover:bg-rose-100 transition-colors inline-flex items-center gap-1 group relative"
                        title="点击查看修改建议"
                      >
                        <span className="line-through decoration-rose-500">对前沿步播态进行量化分析</span>
                        <span className="text-xs bg-rose-600 text-white rounded-full px-1.5 py-0.2 scale-90">错别字</span>
                      </span>
                      ，探明政策落地对家长教育焦虑的缓冲机理。同时，研究指出，应积极
                      <span 
                        id="issue-elem-11"
                        onClick={() => setSelectedIssueId(11)}
                        className="mx-1 px-1 bg-amber-50 text-amber-700 border-b-2 border-amber-500 font-sans cursor-pointer hover:bg-amber-100 transition-colors inline-flex items-center gap-1"
                        title="点击查看修改建议"
                      >
                        <span>推动县域教育的高质量内函式发展</span>
                        <span className="text-xs bg-amber-600 text-white rounded-full px-1.5 py-0.2 scale-90">字词错用</span>
                      </span>
                      ，促进优质教育资源向农村及薄弱校倾斜。
                    </p>
                  </div>

                  <div className="pt-8 border-t border-slate-100 text-sm">
                    <span className="font-bold">关键词：</span>
                    <span>双减政策；家庭教育投入；县域教育；教育资本；教育公平</span>
                  </div>
                </div>

                {/* PAGE 3: English Abstract (Contains exact items 2~9 from screenshot) */}
                <div 
                  id="thesis-page-3"
                  className="w-[820px] min-h-[1140px] bg-white shadow-xl rounded-sm p-16 sm:p-20 relative text-slate-900 font-serif border border-slate-200/80 space-y-8 select-text"
                >
                  <div className="text-center space-y-2 border-b border-slate-200 pb-6 font-sans">
                    <h3 className="text-2xl font-bold tracking-widest">ABSTRACT</h3>
                  </div>

                  <div className="text-base leading-relaxed text-justify space-y-6 font-serif">
                    <p className="indent-8">
                      In recent years,{' '}
                      {/* Issue 2: 冠词缺失: development of economy */}
                      <span
                        id="issue-elem-2"
                        onClick={() => setSelectedIssueId(2)}
                        className="bg-blue-50 text-blue-800 px-1 py-0.5 rounded border-b-2 border-blue-500 cursor-pointer hover:bg-blue-100 transition-colors font-medium"
                      >
                        with development of economy
                      </span>
                      , the educational investment pattern of Chinese families has undergone significant transformations.{' '}
                      {/* Issue 3: 语域不当: And */}
                      <span
                        id="issue-elem-3"
                        onClick={() => setSelectedIssueId(3)}
                        className="bg-blue-50 text-blue-800 px-1 py-0.5 rounded border-b-2 border-blue-500 cursor-pointer hover:bg-blue-100 transition-colors font-medium"
                      >
                        And
                      </span>{' '}
                      in the context of "Double Reduction" policy, reducing children's excessive academic burden and family financial stress has become a prominent national agenda.
                    </p>

                    <p className="indent-8">
                      This paper attempts to{' '}
                      {/* Issue 4: 搭配错误 */}
                      <span
                        id="issue-elem-4"
                        onClick={() => setSelectedIssueId(4)}
                        className="bg-amber-50 text-amber-800 px-1 py-0.5 rounded border-b-2 border-amber-500 cursor-pointer hover:bg-amber-100 transition-colors font-medium"
                      >
                        take the social capital theory as the theoretical basis
                      </span>
                      . Based on empirical survey data{' '}
                      {/* Issue 5: 大小写错误 */}
                      <span
                        id="issue-elem-5"
                        onClick={() => setSelectedIssueId(5)}
                        className="bg-blue-50 text-blue-800 px-1 py-0.5 rounded border-b-2 border-blue-500 cursor-pointer hover:bg-blue-100 transition-colors font-medium"
                      >
                        investigated in county Z
                      </span>
                      , we analyzed the changes in economic and emotional investments across elementary school households.
                    </p>

                    <p className="indent-8">
                      The findings reveal that although off-campus tutoring expenses have decreased markedly, rural{' '}
                      {/* Issue 6: 用词不当/搭配错误: much */}
                      <span
                        id="issue-elem-6"
                        onClick={() => setSelectedIssueId(6)}
                        className="bg-amber-50 text-amber-800 px-1 py-0.5 rounded border-b-2 border-amber-500 cursor-pointer hover:bg-amber-100 transition-colors font-medium"
                      >
                        families invested much educational expenditure
                      </span>{' '}
                      into cultural reading materials and extracurricular talent training. Furthermore, the{' '}
                      {/* Issue 8: 语法错误 */}
                      <span
                        id="issue-elem-8"
                        onClick={() => setSelectedIssueId(8)}
                        className="bg-blue-50 text-blue-800 px-1 py-0.5 rounded border-b-2 border-blue-500 cursor-pointer hover:bg-blue-100 transition-colors font-medium"
                      >
                        influences of motherhood
                      </span>{' '}
                      remained decisive in companion time. Finally, based on{' '}
                      {/* Issue 9: 限定词冗余 */}
                      <span
                        id="issue-elem-9"
                        onClick={() => setSelectedIssueId(9)}
                        className="bg-blue-50 text-blue-800 px-1 py-0.5 rounded border-b-2 border-blue-500 cursor-pointer hover:bg-blue-100 transition-colors font-medium"
                      >
                        these following
                      </span>{' '}
                      findings, constructive suggestions are provided to promote regional educational equity.
                    </p>
                  </div>

                  <div className="pt-8 border-t border-slate-100 text-sm font-sans">
                    <span className="font-bold">Keywords:</span>{' '}
                    <span>"Double Reduction" Policy; Family Educational Investment; County Education; Educational Capital</span>
                  </div>
                </div>

                {/* PAGE 4: Body with Chart Issues 1 & 7 and Table Issues 12 & 13 */}
                <div 
                  id="thesis-page-4"
                  className="w-[820px] min-h-[1140px] bg-white shadow-xl rounded-sm p-16 sm:p-20 relative text-slate-900 font-serif border border-slate-200/80 space-y-10 select-text"
                >
                  <h4 className="text-xl font-bold font-sans text-center border-b border-slate-100 pb-4">
                    第二章 Z 县小学生家庭教育投入现状分析
                  </h4>

                  {/* Chart with Issue 1: Missing standard title/number */}
                  <div 
                    id="issue-elem-1"
                    onClick={() => setSelectedIssueId(1)}
                    className="p-6 rounded-2xl border-2 border-dashed border-red-400 bg-red-50/20 hover:bg-red-50/40 transition-all cursor-pointer space-y-4 group relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-1 rounded bg-red-600 text-white font-sans font-bold flex items-center gap-1.5 shadow-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        【图题与编号缺失】严重规范缺陷
                      </span>
                      <span className="text-xs text-red-600 font-sans font-medium">点击定位审查建议</span>
                    </div>

                    {/* Chart Graphic Mock */}
                    <div className="h-56 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 space-y-3">
                      <div className="w-full flex items-end justify-center gap-10 h-36 border-b border-slate-300 pb-2">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-xs font-sans text-slate-500 font-medium">42.8%</span>
                          <div className="w-14 bg-indigo-500 rounded-t-md h-32"></div>
                          <span className="text-xs font-sans text-slate-600 font-bold">2021 (双减前)</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-xs font-sans text-slate-500 font-medium">21.3%</span>
                          <div className="w-14 bg-blue-500 rounded-t-md h-16"></div>
                          <span className="text-xs font-sans text-slate-600 font-bold">2023 (双减后)</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-xs font-sans text-slate-500 font-medium">17.5%</span>
                          <div className="w-14 bg-teal-500 rounded-t-md h-12"></div>
                          <span className="text-xs font-sans text-slate-600 font-bold">2025 (近期)</span>
                        </div>
                      </div>
                      <p className="text-xs text-red-500 italic font-sans">
                        [此处缺失规范居中的图名与图序号，例如应为：“图 1-1 Z县家庭课外辅导支出占比趋势”]
                      </p>
                    </div>
                  </div>

                  {/* Table with Issues 12 & 13 */}
                  <div 
                    id="issue-elem-12"
                    onClick={() => setSelectedIssueId(12)}
                    className="p-6 rounded-2xl border-2 border-dashed border-emerald-400 bg-emerald-50/20 hover:bg-emerald-50/40 transition-all cursor-pointer space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2.5 py-1 rounded bg-emerald-600 text-white font-sans font-bold">
                        表 2-1 调研样本家庭收入与年教育支出分布
                      </span>
                      <span className="text-xs text-emerald-700 font-sans font-medium">三线表规范缺陷</span>
                    </div>

                    <table className="w-full text-xs font-sans text-center border-collapse">
                      <thead>
                        <tr className="border-t-2 border-b border-slate-800">
                          <th className="py-2.5">年家庭收入 (缺少单位)</th>
                          <th className="py-2.5">样本量 (N)</th>
                          <th className="py-2.5">年教育平均支出</th>
                          <th className="py-2.5">所占比重 (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-2">5 万元以下</td>
                          <td>312</td>
                          <td>0.86 万元</td>
                          <td>18.2%</td>
                        </tr>
                        <tr>
                          <td className="py-2">5-10 万元</td>
                          <td>540</td>
                          <td>1.45 万元</td>
                          <td>19.3%</td>
                        </tr>
                        <tr className="border-b-2 border-slate-800">
                          <td className="py-2">10 万元以上</td>
                          <td>408</td>
                          <td>2.88 万元</td>
                          <td>22.5%</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-xs text-slate-400 italic font-sans text-right">
                      注：数据来源为课题组 2026 年实地问卷调查汇总。
                    </p>
                  </div>
                </div>

                {/* PAGE 5: References (GB/T 7714-2015 Standard Word Page) */}
                <div 
                  id="thesis-page-5"
                  className="w-[820px] min-h-[1140px] bg-white shadow-xl rounded-sm p-16 sm:p-20 relative text-slate-900 font-serif border border-slate-200/80 space-y-8 select-text"
                >
                  <div className="text-center space-y-2 border-b border-slate-200 pb-6">
                    <h3 className="text-2xl font-bold tracking-[0.4em]">参考文献</h3>
                    <p className="text-xs text-slate-400 font-sans">（遵循中华人民共和国国家标准 GB/T 7714-2015 信息与文献 参考文献著录规则）</p>
                  </div>

                  <div className="text-sm font-serif leading-loose space-y-4">
                    <p className="pl-8 -indent-8">
                      [1] 中华人民共和国教育部. 关于进一步减轻义务教育阶段学生作业负担和校外培训负担的意见[Z]. 中办发〔2021〕40号, 2021-07-24.
                    </p>
                    <p className="pl-8 -indent-8">
                      [2] 庞丽娟, 洪秀敏. “双减”背景下我国基础教育高质量发展的战略路径[J]. 教育研究, 2022, 43(3): 14-25.
                    </p>
                    <p className="pl-8 -indent-8">
                      [3] BOURDIEU P. The Forms of Capital[M]// RICHARDSON J G. Handbook of Theory and Research for the Sociology of Education. New York: Greenwood Press, 1986: 241-258.
                    </p>
                    <p className="pl-8 -indent-8">
                      [4] COLEMAN J S. Social Capital in the Creation of Human Capital[J]. American Journal of Sociology, 1988, 94: S95-S120.
                    </p>
                    <p className="pl-8 -indent-8">
                      [5] 薛海平. 走向普及的中国影子教育: 现状、特征与学生发展[J]. 北京大学教育评论, 2021, 19(2): 112-138.
                    </p>
                    <p className="pl-8 -indent-8">
                      [6] 郑磊, 邱晓菲. 县域基础教育资源配置失衡与家庭教育投入补偿机制[J]. 清华大学教育研究, 2023, 44(4): 78-89.
                    </p>
                  </div>

                  <div className="pt-8 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-sans">
                    <span>华中师范大学硕士学位论文</span>
                    <span>- 第 5 页 -</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Parsed Text Structured View */
              <div className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900">论文解析文本与高亮勘误表</h3>
                    <p className="text-xs text-slate-500">按章节提取文本，直观对比识别问题点与修复方案</p>
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold">
                    共解析 10,347 字符
                  </span>
                </div>

                <div className="space-y-4 font-mono text-sm">
                  {defaultIssuesList.map((issue) => (
                    <div 
                      key={issue.id}
                      onClick={() => setSelectedIssueId(issue.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                        selectedIssueId === issue.id 
                          ? 'border-blue-500 bg-blue-50/40 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSeverityBadge(issue.severity)}
                          <span className="font-bold text-slate-900 font-sans">{issue.title}</span>
                        </div>
                        <span className="text-xs text-slate-400">{issue.location}</span>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 border border-slate-100 text-xs sm:text-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-slate-400 shrink-0 font-sans">原文片段：</span>
                          <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded font-sans font-medium line-through decoration-red-400">
                            {issue.originalText}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-700 shrink-0 font-sans font-bold">推荐修改：</span>
                          <span className="text-slate-900 font-sans font-semibold">
                            {issue.suggestion}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-sans">
                        <span>规则依据：{issue.reason}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (issue.suggestion) {
                              handleCopySuggestion(issue.suggestion, issue.id);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === issue.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedId === issue.id ? '已复制' : '复制建议'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right: Issues List Sidebar (1:1 with Screenshot) */}
        {showIssueDrawer && (
          <aside 
            id="report-issue-sidebar"
            className="w-full lg:w-[420px] 2xl:w-[460px] bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col shrink-0 overflow-hidden"
          >
            {/* Header: ⓘ 问题列表 · 337 个问题 */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-slate-600" />
                <h3 className="text-base font-bold text-slate-900">问题列表</h3>
              </div>
              <span className="text-sm text-slate-400 font-medium">
                {filteredIssues.length} 个问题
              </span>
            </div>

            {/* 1. Severity Level Filter Option Buttons (严重、中等、轻微) */}
            <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <span>严重程度</span>
                  <span className="text-[11px] text-slate-400 font-normal">（点击按级别筛选）</span>
                </div>
                {activeSeverity !== '全部' && (
                  <button
                    type="button"
                    onClick={() => setActiveSeverity('全部')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    显示全部级别
                  </button>
                )}
              </div>

              {/* 4 Segmented Severity Option Buttons */}
              <div className="grid grid-cols-4 gap-1.5 bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs">
                {/* 选项: 全部 */}
                <button
                  type="button"
                  id="filter-severity-all"
                  onClick={() => setActiveSeverity('全部')}
                  className={`py-1.5 px-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    activeSeverity === '全部'
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span>全部</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                    activeSeverity === '全部' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {totalSeverityCount}
                  </span>
                </button>

                {/* 选项: 严重 */}
                <button
                  type="button"
                  id="filter-severity-severe"
                  onClick={() => setActiveSeverity(activeSeverity === '严重' ? '全部' : '严重')}
                  className={`py-1.5 px-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeSeverity === '严重'
                      ? 'bg-red-600 text-white shadow-xs font-bold ring-2 ring-red-200'
                      : 'text-slate-700 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    activeSeverity === '严重' ? 'bg-white animate-pulse' : 'bg-red-500'
                  }`} />
                  <span>严重</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeSeverity === '严重' ? 'bg-red-700 text-white' : 'bg-red-100 text-red-700'
                  }`}>
                    {severeCount}
                  </span>
                </button>

                {/* 选项: 中等 */}
                <button
                  type="button"
                  id="filter-severity-medium"
                  onClick={() => setActiveSeverity(activeSeverity === '中等' ? '全部' : '中等')}
                  className={`py-1.5 px-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeSeverity === '中等'
                      ? 'bg-amber-500 text-white shadow-xs font-bold ring-2 ring-amber-200'
                      : 'text-slate-700 hover:bg-amber-50 hover:text-amber-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    activeSeverity === '中等' ? 'bg-white' : 'bg-amber-500'
                  }`} />
                  <span>中等</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeSeverity === '中等' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {mediumCount}
                  </span>
                </button>

                {/* 选项: 轻微 */}
                <button
                  type="button"
                  id="filter-severity-minor"
                  onClick={() => setActiveSeverity(activeSeverity === '轻微' ? '全部' : '轻微')}
                  className={`py-1.5 px-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    activeSeverity === '轻微'
                      ? 'bg-emerald-600 text-white shadow-xs font-bold ring-2 ring-emerald-200'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    activeSeverity === '轻微' ? 'bg-white' : 'bg-emerald-500'
                  }`} />
                  <span>轻微</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeSeverity === '轻微' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {minorCount}
                  </span>
                </button>
              </div>
            </div>

            {/* 2. Filter Pills (All 337, Typos 24, Grammar 185, Images 103, Tables 25, Citations 0, Catalog 0) */}
            <div className="p-3.5 border-b border-slate-100 bg-white shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">问题类型</span>
                {activeFilter !== '全部' && (
                  <button
                    type="button"
                    onClick={() => setActiveFilter('全部')}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    显示全部类型
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {/* 1. 全部 */}
                <button
                  onClick={() => setActiveFilter('全部')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === '全部'
                      ? 'bg-[#1D4ED8] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  全部 {totalCount}
                </button>

                {/* 2. 错别字 */}
                <button
                  onClick={() => setActiveFilter('错别字')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeFilter === '错别字'
                      ? 'bg-[#1D4ED8] text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  错别字 {typosCount}
                </button>

                {/* 3. 病句 */}
                <button
                  onClick={() => setActiveFilter('病句')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeFilter === '病句'
                      ? 'bg-[#1D4ED8] text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  病句 {grammarCount}
                </button>

                {/* 4. 目录 */}
                <button
                  onClick={() => setActiveFilter('目录')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeFilter === '目录'
                      ? 'bg-[#1D4ED8] text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  目录 {catalogCount}
                </button>

                {/* 5. 图片 */}
                <button
                  onClick={() => setActiveFilter('图片')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeFilter === '图片'
                      ? 'bg-[#1D4ED8] text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  图片 {imagesCount}
                </button>

                {/* 6. 表格 */}
                <button
                  onClick={() => setActiveFilter('表格')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeFilter === '表格'
                      ? 'bg-[#1D4ED8] text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  表格 {tablesCount}
                </button>

                {/* 7. 参考文献 */}
                <button
                  onClick={() => setActiveFilter('参考文献')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeFilter === '参考文献'
                      ? 'bg-[#1D4ED8] text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  参考文献 {citationsCount}
                </button>
              </div>
            </div>

            {/* Scrollable Issues List (1:1 exact card styling with screenshot) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredIssues.map((issue) => {
                const isSelected = selectedIssueId === issue.id;

                return (
                  <div
                    key={issue.id}
                    onClick={() => scrollToIssue(issue)}
                    id={`issue-card-${issue.id}`}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/30 shadow-md ring-1 ring-blue-500/30'
                        : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row: Severity indicator on left, Type Tag on right */}
                    <div className="flex items-center justify-between">
                      <div>{getSeverityBadge(issue.severity)}</div>
                      <div>{getTypeTag(issue.type)}</div>
                    </div>

                    {/* Title Text */}
                    <p className="text-sm font-bold text-slate-800 leading-snug">
                      {issue.title}
                    </p>

                    {/* Expanded Detail (when selected) */}
                    {isSelected && (
                      <div className="pt-2 border-t border-slate-100 space-y-2 text-xs animate-in fade-in duration-150">
                        {issue.originalText && (
                          <div className="text-slate-500">
                            <span className="font-semibold text-slate-700">原文：</span>
                            <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded ml-1 font-mono">
                              {issue.originalText}
                            </span>
                          </div>
                        )}
                        {issue.suggestion && (
                          <div className="text-slate-800">
                            <span className="font-bold text-emerald-700">建议：</span>
                            <span className="ml-1 font-medium">{issue.suggestion}</span>
                          </div>
                        )}
                        {issue.reason && (
                          <p className="text-slate-400 italic">依据：{issue.reason}</p>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-slate-400 font-mono">{issue.location}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (issue.suggestion) {
                                handleCopySuggestion(issue.suggestion, issue.id);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === issue.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === issue.id ? '已复制修改建议' : '复制修改建议'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredIssues.length === 0 && (
                <div className="py-16 text-center text-slate-400 space-y-3 px-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Filter className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">暂无匹配的问题项</p>
                    <p className="text-xs text-slate-400 mt-1">
                      当前条件：
                      {activeFilter !== '全部' && <span className="text-blue-600 font-medium">【{activeFilter}】</span>}
                      {activeSeverity !== '全部' && <span className="text-amber-600 font-medium">【{activeSeverity}级别】</span>}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFilter('全部');
                      setActiveSeverity('全部');
                    }}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>重置所有筛选条件</span>
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}
      </main>

      {/* 3. Global Footer (Exact matching screenshot) */}
      <footer className="py-3 text-center border-t border-slate-200/80 text-xs text-slate-400 bg-white shrink-0">
        © 2026 论文智检. 保留所有权利。 | 鄂ICP备2026023941号-2
      </footer>

      {/* Floating Toast Notification */}
      {exportToast && (
        <div 
          id="report-export-toast"
          className="fixed bottom-8 right-8 z-50 bg-slate-900/95 backdrop-blur text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 border border-slate-700/80 animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-md"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold shrink-0">
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-xs sm:text-sm font-medium leading-relaxed text-slate-100">
            {exportToast}
          </div>
        </div>
      )}
    </div>
  );
}
