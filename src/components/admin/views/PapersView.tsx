import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { initialAdminPapers, AdminPaperItem } from '../../../data/adminMockData';

export default function PapersView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部状态');
  const [typeFilter, setTypeFilter] = useState('全部类型');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPaper, setSelectedPaper] = useState<AdminPaperItem | null>(null);

  const filteredPapers = initialAdminPapers.filter((p) => {
    if (statusFilter !== '全部状态' && p.status !== statusFilter) return false;
    if (typeFilter !== '全部类型' && p.detectionType !== typeFilter) return false;
    if (searchQuery && !p.title.includes(searchQuery) && !p.username.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* 1. Search Bar matching Screenshot 5 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索标题或作者..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700"
          >
            <option>全部状态</option>
            <option>已完成</option>
            <option>失败</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700"
          >
            <option>全部类型</option>
            <option>学位论文检测</option>
            <option>内容风险检测</option>
          </select>

          <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all">
            搜索
          </button>
        </div>

        <div className="text-slate-400 font-mono text-xs">
          共 <strong className="text-slate-700 font-bold">869</strong> 篇
        </div>
      </div>

      {/* 2. Papers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">标题</th>
                <th className="py-3 px-5">上传用户</th>
                <th className="py-3 px-5">机构</th>
                <th className="py-3 px-5">检测类型</th>
                <th className="py-3 px-5">状态</th>
                <th className="py-3 px-5">记录状态</th>
                <th className="py-3 px-5">问题数</th>
                <th className="py-3 px-5">TOKEN 入/出</th>
                <th className="py-3 px-5">上传时间</th>
                <th className="py-3 px-5">完成时间</th>
                <th className="py-3 px-5">检测耗时</th>
                <th className="py-3 px-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPapers.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-800 max-w-[260px] truncate" title={p.title}>
                    {p.title}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {p.username}
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 max-w-[160px] truncate" title={p.institution}>
                    {p.institution}
                  </td>
                  <td className="py-3.5 px-5">
                    {p.detectionType === '内容风险检测' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                        内容风险检测
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        学位论文检测
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      p.status === '已完成'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">
                      {p.recordStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                    {p.issuesCount}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-500">
                    {p.inToken} / {p.outToken}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-400">
                    {p.uploadTime}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-400">
                    {p.finishTime}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-600">
                    {p.duration}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => setSelectedPaper(p)}
                      className="text-indigo-600 hover:underline font-bold cursor-pointer"
                    >
                      详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (Matching Screenshot 5) */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <select className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white">
              <option>每页 10 条</option>
              <option>每页 20 条</option>
              <option>每页 50 条</option>
            </select>
            <span>第 1 / 87 页，共 869 条</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">
              上一页
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* Paper Detail Modal */}
      {selectedPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">论文检测详情</h3>
              <button onClick={() => setSelectedPaper(null)} className="text-slate-400 hover:text-slate-600 text-sm">
                关闭
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">论文标题</span>
                <p className="font-bold text-slate-900 text-sm">{selectedPaper.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 py-2 border-y border-slate-100">
                <div>
                  <span className="text-slate-400">上传用户：</span>
                  <span className="font-medium text-slate-800 ml-1">{selectedPaper.username}</span>
                </div>
                <div>
                  <span className="text-slate-400">所属机构：</span>
                  <span className="font-medium text-slate-800 ml-1">{selectedPaper.institution}</span>
                </div>
                <div>
                  <span className="text-slate-400">检测类型：</span>
                  <span className="font-medium text-slate-800 ml-1">{selectedPaper.detectionType}</span>
                </div>
                <div>
                  <span className="text-slate-400">检出问题：</span>
                  <span className="font-mono font-bold text-indigo-600 ml-1">{selectedPaper.issuesCount} 个</span>
                </div>
                <div>
                  <span className="text-slate-400">Token 消耗：</span>
                  <span className="font-mono text-slate-800 ml-1">{selectedPaper.inToken} / {selectedPaper.outToken}</span>
                </div>
                <div>
                  <span className="text-slate-400">检测耗时：</span>
                  <span className="font-mono text-slate-800 ml-1">{selectedPaper.duration}</span>
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPaper(null)}
                className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs"
              >
                关闭窗口
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
