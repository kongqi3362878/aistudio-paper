import React, { useState, useRef, useEffect } from 'react';
import { Download, FileText, Check, ChevronDown, BookOpen, ShieldCheck, ListChecks, Sparkles, Calendar, Eye } from 'lucide-react';
import { ALL_SYSTEM_DOCS, downloadDocFile, SystemDocFile } from '../../data/downloadableDocs';
import WordDocumentPreviewModal from './WordDocumentPreviewModal';

export default function DocumentDownloadDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [downloadSuccessDoc, setDownloadSuccessDoc] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<SystemDocFile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = (doc: SystemDocFile, format: 'doc' | 'md') => {
    if (format === 'doc') {
      const html = doc.getWordHtml();
      downloadDocFile(doc.filenameDoc, html, 'application/msword;charset=utf-8;');
    } else {
      const md = doc.getMarkdown();
      downloadDocFile(doc.filenameMd, md, 'text/markdown;charset=utf-8;');
    }

    setDownloadSuccessDoc(`${doc.id}-${format}`);
    setTimeout(() => setDownloadSuccessDoc(null), 2500);
  };

  const handleDownloadAll = () => {
    ALL_SYSTEM_DOCS.forEach((doc, idx) => {
      setTimeout(() => {
        const html = doc.getWordHtml();
        downloadDocFile(doc.filenameDoc, html, 'application/msword;charset=utf-8;');
      }, idx * 400);
    });

    setDownloadSuccessDoc('all');
    setTimeout(() => setDownloadSuccessDoc(null), 3000);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        id="btn-header-download-docs"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50/90 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-700 text-sm font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        title="下载系统工程规范文档"
      >
        <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
          <Download className="w-3.5 h-3.5" />
        </div>
        <span className="hidden sm:inline">下载系统文档</span>
        <ChevronDown className={`w-4 h-4 text-indigo-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id="header-download-docs-menu"
          className="absolute right-0 mt-3 w-88 sm:w-[440px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Menu Title */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                标准软工文档中心
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">选择并下载系统文档</h4>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono">4 份原件</span>
          </div>

          {/* Doc List */}
          <div className="py-2.5 space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {ALL_SYSTEM_DOCS.map((doc) => {
              const Icon = doc.id === 'manual' ? BookOpen : doc.id === 'srs' ? ShieldCheck : doc.id === 'features' ? ListChecks : Calendar;

              return (
                <div 
                  key={doc.id}
                  className="p-3 rounded-2xl bg-slate-50/70 hover:bg-indigo-50/40 border border-slate-100 hover:border-indigo-100 transition-all space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{doc.name}</span>
                        <span className="text-[10px] font-semibold text-slate-400">{doc.version}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{doc.dept}</p>
                    </div>
                  </div>

                  {/* Download Action Buttons */}
                  <div className="flex items-center gap-2 pt-1 pl-11 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewDoc(doc);
                        setIsOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-50/80 border border-blue-200 hover:border-blue-400 hover:bg-blue-100/70 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="在网页中以 1:1 Word 视图预览排版原貌"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>1:1 Word 预览</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(doc, 'doc')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      {downloadSuccessDoc === `${doc.id}-doc` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">已下载</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                          <span>Word 原件 (.doc)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownload(doc, 'md')}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      {downloadSuccessDoc === `${doc.id}-md` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">已下载</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>Markdown (.md)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom batch download */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">含封面、正规宋体/黑体与用例表</span>
            <button
              type="button"
              onClick={handleDownloadAll}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              {downloadSuccessDoc === 'all' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>全部已下载</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>一键打包下载全部 Word</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Word 1:1 Preview Modal */}
      {previewDoc && (
        <WordDocumentPreviewModal 
          doc={previewDoc} 
          onClose={() => setPreviewDoc(null)} 
        />
      )}
    </div>
  );
}
