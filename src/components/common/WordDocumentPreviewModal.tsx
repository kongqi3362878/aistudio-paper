import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ExternalLink,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Calendar,
  Check
} from 'lucide-react';
import { SystemDocFile, downloadDocFile } from '../../data/downloadableDocs';

interface WordDocumentPreviewModalProps {
  doc: SystemDocFile;
  onClose: () => void;
}

export default function WordDocumentPreviewModal({ doc, onClose }: WordDocumentPreviewModalProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [viewTab, setViewTab] = useState<'pages' | 'raw'>('pages');

  const htmlContent = doc.getWordHtml();

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 160));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 70));
  const handleResetZoom = () => setZoom(100);

  const handleDownloadDoc = () => {
    downloadDocFile(doc.filenameDoc, htmlContent, 'application/msword;charset=utf-8;');
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handlePrint = () => {
    const iframe = document.getElementById('word-doc-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  // Embed custom print / ribbon styles directly into doc HTML to make it look like Word
  const styledHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @page {
            size: A4 portrait;
            margin: 25.4mm;
          }
          body {
            background-color: #525659;
            margin: 0;
            padding: 30px 10px;
            font-family: 'SimSun', '宋体', 'Times New Roman', serif;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .word-page-container {
            background: #ffffff;
            width: 210mm;
            min-height: 297mm;
            padding: 25.4mm;
            box-sizing: border-box;
            box-shadow: 0 4px 16px rgba(0,0,0,0.35);
            margin-bottom: 24px;
            color: #000000;
            font-size: 13pt;
            line-height: 1.8;
            position: relative;
          }
          /* Custom Word header and footer rules */
          .word-page-header {
            position: absolute;
            top: 14mm;
            left: 25.4mm;
            right: 25.4mm;
            border-bottom: 0.75pt solid #888;
            font-size: 9pt;
            color: #666;
            padding-bottom: 2mm;
            display: flex;
            justify-content: space-between;
          }
          .word-page-footer {
            position: absolute;
            bottom: 14mm;
            left: 25.4mm;
            right: 25.4mm;
            border-top: 0.75pt solid #888;
            font-size: 9pt;
            color: #666;
            padding-top: 2mm;
            text-align: center;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 14px 0;
            font-size: 10.5pt;
          }
          th, td {
            border: 1px solid #333;
            padding: 6px 10px;
          }
          th {
            background-color: #f1f5f9;
            font-family: 'SimHei', '黑体', sans-serif;
            font-weight: bold;
          }
          h1 {
            font-family: 'SimHei', '黑体', sans-serif;
            font-size: 18pt;
            border-bottom: 1.5pt solid #000;
            padding-bottom: 4px;
            margin-top: 30px;
          }
          h2 {
            font-family: 'SimHei', '黑体', sans-serif;
            font-size: 14pt;
            margin-top: 24px;
          }
          h3 {
            font-family: 'SimHei', '黑体', sans-serif;
            font-size: 12pt;
            margin-top: 18px;
          }
          p {
            text-indent: 2em;
            margin: 8px 0;
            text-align: justify;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-in fade-in">
      <div className="bg-[#2B579A] w-full max-w-[1440px] h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/60">
        {/* 1. Office Ribbon Top Bar */}
        <div className="h-14 bg-[#2B579A] text-white px-5 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-wide">{doc.name}</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-400/30">
                  Microsoft Word 1:1 预览模式
                </span>
              </div>
              <p className="text-[11px] text-blue-200/80 font-mono">{doc.filenameDoc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="打印"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">打印</span>
            </button>

            <button
              onClick={handleDownloadDoc}
              className="px-4 py-1.5 rounded-lg bg-white text-[#2B579A] hover:bg-blue-50 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">已下载 Word</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>下载 Word 原件 (.doc)</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer ml-2"
              title="关闭预览"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Word Sub-ribbon Toolbar */}
        <div className="h-11 bg-[#F3F4F6] border-b border-slate-300 px-5 flex items-center justify-between text-xs text-slate-700 shrink-0">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-600">版面比例：</span>
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs">
              <button 
                onClick={handleZoomOut} 
                className="hover:text-blue-600 p-0.5 cursor-pointer" 
                title="缩小"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={handleResetZoom} 
                className="font-mono font-bold px-1.5 text-slate-800 hover:text-blue-600 cursor-pointer"
                title="重置"
              >
                {zoom}%
              </button>
              <button 
                onClick={handleZoomIn} 
                className="hover:text-blue-600 p-0.5 cursor-pointer" 
                title="放大"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">纸张：标准 A4 (210mm × 297mm) · 边距 2.54cm · 宋体/黑体</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">{doc.dept} · {doc.date}</span>
          </div>
        </div>

        {/* 3. Document Canvas Area */}
        <div className="flex-1 bg-[#525659] overflow-auto flex justify-center p-6 sm:p-10 relative">
          <div 
            style={{ 
              transform: `scale(${zoom / 100})`, 
              transformOrigin: 'top center',
              width: '100%',
              display: 'flex',
              justifyContent: 'center'
            }}
            className="transition-transform duration-100 ease-out"
          >
            {/* Embedded IFrame with 1:1 Rendering of doc HTML */}
            <iframe
              id="word-doc-iframe"
              srcDoc={styledHtml}
              title="Word Document Preview"
              className="w-[880px] h-[1600px] border-none shadow-2xl bg-[#525659] rounded-sm"
            />
          </div>
        </div>

        {/* 4. Word Status Bar */}
        <div className="h-7 bg-[#2B579A] text-white/90 px-4 flex items-center justify-between text-[11px] font-sans shrink-0 border-t border-blue-900">
          <div className="flex items-center gap-4">
            <span>页码：1/22</span>
            <span>字数：约 18,500 字</span>
            <span>中文(中国)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>页面视图</span>
            <span>缩放：{zoom}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
