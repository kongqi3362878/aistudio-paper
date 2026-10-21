import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { initialDetectionFeedbacks, DetectionFeedbackItem } from '../../../data/adminMockData';

export default function DetectionFeedbackView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackFilter, setFeedbackFilter] = useState('全部已反馈');
  const [typeFilter, setTypeFilter] = useState('全部类型');

  const filteredFeedbacks = initialDetectionFeedbacks.filter((item) => {
    if (feedbackFilter !== '全部已反馈' && item.feedback !== feedbackFilter) return false;
    if (typeFilter !== '全部类型' && item.type !== typeFilter) return false;
    if (searchQuery && !item.paperTitle.includes(searchQuery) && !item.issueContent.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* 1. Filter Bar matching Screenshot 6 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索论文标题或问题内容..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={feedbackFilter}
            onChange={(e) => setFeedbackFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700"
          >
            <option>全部已反馈</option>
            <option>误报</option>
            <option>存疑</option>
            <option>准报</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700"
          >
            <option>全部类型</option>
            <option>语法</option>
            <option>参考文献</option>
            <option>拼写</option>
            <option>图表</option>
          </select>

          <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all">
            搜索
          </button>
        </div>

        <div className="text-slate-400 font-mono text-xs">
          共 <strong className="text-slate-700 font-bold">182</strong> 条
        </div>
      </div>

      {/* 2. Detection Feedback Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">论文</th>
                <th className="py-3 px-5">用户</th>
                <th className="py-3 px-5">类型</th>
                <th className="py-3 px-5">反馈</th>
                <th className="py-3 px-5">问题内容</th>
                <th className="py-3 px-5">更新时间</th>
                <th className="py-3 px-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFeedbacks.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-800 max-w-[220px] truncate" title={f.paperTitle}>
                    {f.paperTitle}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 font-medium">
                    {f.user}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700">
                      {f.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      f.feedback === '误报'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        : f.feedback === '存疑'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    }`}>
                      {f.feedback}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 max-w-[320px] truncate" title={f.issueContent}>
                    {f.issueContent}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-400">
                    {f.updateTime}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button className="text-indigo-600 hover:underline font-bold cursor-pointer">
                      查看论文
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar matching Screenshot 6 */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <select className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white">
              <option>每页 10 条</option>
              <option>每页 20 条</option>
            </select>
            <span>第 1 / 19 页，共 182 条</span>
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
    </div>
  );
}
