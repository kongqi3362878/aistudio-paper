import { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Eye, 
  Download, 
  Trash2, 
  Clock, 
  ChevronDown,
  FileCheck,
  ShieldAlert,
  AlertTriangle,
  Award
} from 'lucide-react';
import { HistoryTab, HistoryType, PaperDetectionRecord, BatchTask, UserProfile } from '../../types';
import { 
  downloadFile, 
  generateRiskReportIndexHtml, 
  generateStandardReportIndexHtml 
} from '../../utils/reportExportUtils';
import { Check } from 'lucide-react';
import ThesisComplianceReceiptModal from '../institution/ThesisComplianceReceiptModal';

interface HistoryViewProps {
  records: PaperDetectionRecord[];
  batchTasks: BatchTask[];
  onViewRecord: (record: PaperDetectionRecord) => void;
  onDeleteRecord: (id: string) => void;
  onDeleteBatch: (id: string) => void;
  initialTab?: HistoryTab;
  initialType?: HistoryType;
  user?: UserProfile;
}

export default function HistoryView({
  records,
  batchTasks,
  onViewRecord,
  onDeleteRecord,
  onDeleteBatch,
  initialTab = 'all',
  initialType = 'paper',
  user,
}: HistoryViewProps) {
  const [activeTab, setActiveTab] = useState<HistoryTab>(initialTab);
  const [historyType, setHistoryType] = useState<HistoryType>(initialType);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'done'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceiptRecord, setSelectedReceiptRecord] = useState<PaperDetectionRecord | null>(null);

  const handleOpenReceipt = (rec: PaperDetectionRecord) => {
    setSelectedReceiptRecord(rec);
    setReceiptModalOpen(true);
  };

  const handleDownloadItem = (item: PaperDetectionRecord) => {
    if (historyType === 'risk' || item.type === 'risk') {
      const html = generateRiskReportIndexHtml(item);
      downloadFile(`${item.filename}_风险审查_index.html`, html, 'text/html;charset=utf-8;');
      setDownloadToast(`已成功下载《${item.title}》风险审查 index.html 报告！`);
    } else {
      const html = generateStandardReportIndexHtml(item);
      downloadFile(`${item.filename}_规范审查_index.html`, html, 'text/html;charset=utf-8;');
      setDownloadToast(`已成功下载《${item.title}》规范审查 index.html 报告！`);
    }
    setTimeout(() => setDownloadToast(null), 3500);
  };

  const handleDownloadBatch = (batch: BatchTask) => {
    const combinedContent = `批量审查归档清单 - ${batch.title}\n生成时间：${batch.createTime}\n总篇数：${batch.totalPapers}，已完成：${batch.completedPapers}，耗时：${batch.duration}\n\n审查结论：全批次文档已归档完成，详见各篇独立 index.html 报告。\n`;
    downloadFile(`${batch.title}_批量任务归档清单.txt`, combinedContent, 'text/plain;charset=utf-8;');
    setDownloadToast(`已为您下载《${batch.title}》批量任务报告档案！`);
    setTimeout(() => setDownloadToast(null), 3500);
  };

  // Filter records by detection type (paper vs risk)
  const currentCategoryRecords = records.filter((rec) => {
    if (historyType === 'risk') {
      return rec.type === 'risk';
    }
    // 'paper' shows records without type or type === 'paper'
    return !rec.type || rec.type === 'paper';
  });

  // Filter batch tasks by detection type (paper vs risk)
  const currentCategoryBatches = batchTasks.filter((batch) => {
    if (historyType === 'risk') {
      return batch.type === 'risk' || batch.id.includes('risk') || batch.title.includes('风险');
    }
    return (!batch.type || batch.type === 'paper') && !batch.id.includes('risk') && !batch.title.includes('风险');
  });

  // Filtered records by search query
  const filteredRecords = currentCategoryRecords.filter((rec) => {
    const matchesSearch = 
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div id="history-view" className="space-y-8 w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto pb-16 font-sans">
      {/* 1. Header with View Toggle & Type Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">历史记录</h1>
          <p className="text-base text-slate-500 mt-1">
            切换查看规范检测与内容风险检测历史记录。
          </p>
        </div>

        {/* Primary Type Switcher: 规范检测 vs 风险检测 */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              id="tab-history-type-paper"
              type="button"
              onClick={() => setHistoryType('paper')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                historyType === 'paper'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>规范检测</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${historyType === 'paper' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {records.filter(r => !r.type || r.type === 'paper').length}
              </span>
            </button>
            <button
              id="tab-history-type-risk"
              type="button"
              onClick={() => setHistoryType('risk')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                historyType === 'risk'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>风险检测</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${historyType === 'risk' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {records.filter(r => r.type === 'risk').length}
              </span>
            </button>
          </div>

          {/* Sub Tab: 单篇记录 vs 批量任务 (Always visible for both paper and risk detection) */}
          <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              id="tab-all-records"
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>单篇记录</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'all' ? 'bg-slate-100 text-slate-700' : 'bg-slate-200/70 text-slate-500'}`}>
                {currentCategoryRecords.length}
              </span>
            </button>
            <button
              id="tab-batch-tasks"
              type="button"
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'batch'
                  ? 'bg-white text-slate-900 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>批量任务</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'batch' ? 'bg-slate-100 text-slate-700' : 'bg-slate-200/70 text-slate-500'}`}>
                {currentCategoryBatches.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Content: Single Records vs Batch Tasks */}
      {activeTab === 'all' ? (
        <div className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  historyType === 'risk'
                    ? '搜索风险检测文档标题或作者...'
                    : '搜索论文标题或作者...'
                }
                className="w-full pl-12 pr-5 py-3 bg-white border border-slate-200/90 rounded-2xl text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            <button
              type="button"
              onClick={() => {}}
              className={`w-full sm:w-auto text-white px-7 py-3 rounded-2xl text-base font-bold shadow-md transition-all cursor-pointer ${
                historyType === 'risk'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
              }`}
            >
              搜索
            </button>

            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="w-full sm:w-auto flex items-center justify-between gap-3 px-5 py-3 bg-white border border-slate-200/90 rounded-2xl text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span>筛选记录</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-30 text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 cursor-pointer ${statusFilter === 'all' ? 'text-blue-600 font-bold' : 'text-slate-700 font-medium'}`}
                  >
                    全部状态
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('done');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 cursor-pointer ${statusFilter === 'done' ? 'text-blue-600 font-bold' : 'text-slate-700 font-medium'}`}
                  >
                    已完成
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm sm:text-base">
                <thead className="bg-slate-50/80 text-slate-500 text-xs sm:text-sm font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-7">
                      {historyType === 'risk' ? '文档标题' : '论文标题'}
                    </th>
                    <th className="py-4 px-7">文件名</th>
                    <th className="py-4 px-5 text-center">作者</th>
                    <th className="py-4 px-7">上传时间</th>
                    <th className="py-4 px-5">状态</th>
                    {historyType === 'risk' && <th className="py-4 px-5">风险等级</th>}
                    <th className="py-4 px-7">
                      {historyType === 'risk' ? '风险点数' : '问题数'}
                    </th>
                    <th className="py-4 px-7 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={historyType === 'risk' ? 8 : 7} className="py-16 text-center text-slate-400 text-sm">
                        未找到符合条件的{historyType === 'risk' ? '风险检测' : '规范检测'}记录
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((item) => (
                      <tr 
                        key={item.id} 
                        className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                        onClick={() => onViewRecord(item)}
                      >
                        <td className="py-5 px-7 font-bold text-slate-900 max-w-sm truncate group-hover:text-blue-600 transition-colors">
                          <div className="flex items-center gap-2">
                            {historyType === 'risk' && (
                              <span className="shrink-0 p-1 rounded-md bg-emerald-50 text-emerald-700">
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </span>
                            )}
                            <span className="truncate">{item.title}</span>
                          </div>
                        </td>
                        <td className="py-5 px-7 text-slate-500 text-xs sm:text-sm max-w-xs truncate font-mono">
                          {item.filename}
                        </td>
                        <td className="py-5 px-5 text-slate-400 text-xs sm:text-sm text-center">
                          {item.author}
                        </td>
                        <td className="py-5 px-7 text-slate-500 text-xs sm:text-sm font-mono whitespace-nowrap">
                          {item.uploadTime}
                        </td>
                        <td className="py-5 px-5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            已完成
                          </span>
                        </td>
                        {historyType === 'risk' && (
                          <td className="py-5 px-5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md ${
                              item.riskLevel === '高风险'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : item.riskLevel === '中风险'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : item.riskLevel === '低风险'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {item.riskLevel === '高风险' && <AlertTriangle className="w-3 h-3 text-red-600" />}
                              {item.riskLevel || '安全'}
                            </span>
                          </td>
                        )}
                        <td className="py-5 px-7 whitespace-nowrap">
                          <span className="font-extrabold text-slate-900">{item.issuesCount}</span>
                          <span className="text-slate-400 text-xs sm:text-sm ml-1.5 font-medium">
                            {user?.isInstitutionMember ? (
                              <span className="inline-flex items-center text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded-md border border-indigo-200/60 text-xs">
                                校方资助 · 试用抵扣
                              </span>
                            ) : (
                              `/ 扣除 ${item.cost.toLocaleString()} 积分`
                            )}
                          </span>
                        </td>
                        <td className="py-5 px-7 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2.5" onClick={(e) => e.stopPropagation()}>
                            {user?.isInstitutionMember && (
                              <button
                                type="button"
                                onClick={() => handleOpenReceipt(item)}
                                className="p-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all hover:scale-110 cursor-pointer"
                                title="查验校方学位论文规范回执单"
                              >
                                <Award className="w-4.5 h-4.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onViewRecord(item)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110 cursor-pointer"
                              title="查看详情"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadItem(item)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110 cursor-pointer"
                              title="下载报告 (index 形式)"
                            >
                              <Download className="w-4.5 h-4.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`确定要删除《${item.title}》的检测记录吗？`)) {
                                  onDeleteRecord(item.id);
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 cursor-pointer"
                              title="删除记录"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* 3. Content: Batch Tasks List */
        <div className="space-y-6">
          {currentCategoryBatches.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-16 text-center text-slate-400 text-sm">
              暂无{historyType === 'risk' ? '风险检测' : '规范检测'}批量任务，您可以在{historyType === 'risk' ? '风险检测' : '规范检测'}中通过「批量上传」创建。
            </div>
          ) : (
            currentCategoryBatches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 space-y-6 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      已完成
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {batch.duration}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {batch.title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {batch.createTime}
                  </p>
                </div>

                {/* Right percentage */}
                <div className="text-right sm:text-right">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                    {batch.progress}%
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400">处理进度</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${batch.progress}%` }}
                />
              </div>

              {/* Stats & Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div>
                    <span className="text-slate-400">总篇数:</span>{' '}
                    <span className="font-bold text-slate-800">{batch.totalPapers}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">已完成:</span>{' '}
                    <span className="font-bold text-emerald-600">{batch.completedPapers}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">处理中:</span>{' '}
                    <span className="font-bold text-blue-600">{batch.processing}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">等待中:</span>{' '}
                    <span className="font-bold text-slate-500">{batch.waiting}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleDownloadBatch(batch)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-sm font-bold transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>下载批量报告清单</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`确定要删除批量任务《${batch.title}》吗？`)) {
                        onDeleteBatch(batch.id);
                      }
                    }}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    title="删除任务"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            </div>
          )))
        }
        </div>
      )}

      {/* Floating Toast Notification */}
      {downloadToast && (
        <div 
          id="history-download-toast"
          className="fixed bottom-8 right-8 z-50 bg-slate-900/95 backdrop-blur text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3.5 border border-slate-700/80 animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-md"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-xs sm:text-sm font-medium leading-relaxed text-slate-100">
            {downloadToast}
          </div>
        </div>
      )}

      {/* Thesis Compliance Receipt Modal */}
      {user && (
        <ThesisComplianceReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          record={selectedReceiptRecord}
          user={user}
        />
      )}
    </div>
  );
}
