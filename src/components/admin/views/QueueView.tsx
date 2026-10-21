import React, { useState } from 'react';
import { Search, RotateCw, X, CheckCircle2, Layers, Cpu } from 'lucide-react';
import { initialQueueTasks, QueueTaskItem } from '../../../data/adminMockData';

interface QueueViewProps {
  onViewPaperDetail?: (title: string) => void;
}

export default function QueueView({ onViewPaperDetail }: QueueViewProps) {
  const [statusFilter, setStatusFilter] = useState('全部');
  const [queueFilter, setQueueFilter] = useState('全部');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPoolModal, setShowPoolModal] = useState(false);

  const statuses = ['全部', '失败', '运行中', '等待中'];
  const queues = ['全部', '文本检测 (含内容风险)', '图片检测', '表格检测', '引用检测', '目录检测'];
  const types = ['全部', '文本LLM检查', '图片检查', '表格检查', '引用检查', '目录检查', '内容风险检测'];

  const filteredTasks = initialQueueTasks.filter((task) => {
    if (statusFilter !== '全部' && task.status !== statusFilter) return false;
    if (searchQuery && !task.paperTitle.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* 1. Filter Section (Exact match with Screenshot 4) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        {/* Row 1: 状态 & 搜索框 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">状态</span>
            <div className="flex items-center gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                    statusFilter === s
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索论文名称"
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Row 2: 队列 */}
        <div className="flex items-center gap-2 text-xs border-t border-slate-100 pt-3 flex-wrap">
          <span className="text-slate-400 font-medium">队列</span>
          <div className="flex items-center gap-1 flex-wrap">
            {queues.map((q) => (
              <button
                key={q}
                onClick={() => setQueueFilter(q)}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  queueFilter === q
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: 审查类型 */}
        <div className="flex items-center gap-2 text-xs border-t border-slate-100 pt-3 flex-wrap">
          <span className="text-slate-400 font-medium">审查类型</span>
          <div className="flex items-center gap-1 flex-wrap">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  typeFilter === t
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 线程池状态 Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-slate-900">线程池全部空闲</div>
          <div className="flex items-center gap-6 mt-2 text-xs">
            <div>
              <span className="text-slate-400 mr-2">运行中</span>
              <strong className="text-emerald-600 font-black font-mono text-base">0</strong>
              <span className="text-slate-400 text-[11px] ml-1">线程处理中</span>
            </div>
            <div>
              <span className="text-slate-400 mr-2">等待排队</span>
              <strong className="text-slate-900 font-black font-mono text-base">0</strong>
              <span className="text-slate-400 text-[11px] ml-1">尚未开始</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowPoolModal(true)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
        >
          线程池详情
        </button>
      </div>

      {/* 3. 审查任务表格 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">审查任务</h3>
            <span className="text-xs text-slate-400">共 57082 条</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">论文</th>
                <th className="py-3 px-5">上传用户</th>
                <th className="py-3 px-5">审查类型</th>
                <th className="py-3 px-5">状态</th>
                <th className="py-3 px-5">执行队列</th>
                <th className="py-3 px-5">任务 ID</th>
                <th className="py-3 px-5">开始</th>
                <th className="py-3 px-5">结束</th>
                <th className="py-3 px-5">耗时</th>
                <th className="py-3 px-5">TOKEN 入/出</th>
                <th className="py-3 px-5">失败原因</th>
                <th className="py-3 px-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-800 max-w-[200px] truncate" title={t.paperTitle}>
                    {t.paperTitle}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {t.user}
                  </td>
                  <td className="py-3.5 px-5 text-slate-700 font-medium">
                    {t.checkType}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {t.queueName}
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-800">
                    {t.taskId}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-400">
                    {t.startTime}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-400">
                    {t.endTime}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-600">
                    {t.duration}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-600">
                    {t.tokenInOut}
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">
                    {t.failReason}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => onViewPaperDetail && onViewPaperDetail(t.paperTitle)}
                      className="text-indigo-600 hover:underline font-bold cursor-pointer"
                    >
                      论文详情
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 线程池详情 Modal */}
      {showPoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">执行线程池配置详情</h3>
              <button onClick={() => setShowPoolModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">核心线程数 (Core Size)</span>
                <span className="font-mono font-bold text-slate-800">16</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">最大线程数 (Max Size)</span>
                <span className="font-mono font-bold text-slate-800">64</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">队列容量 (Queue Capacity)</span>
                <span className="font-mono font-bold text-slate-800">2,000</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-slate-500">KeepAlive 保持时间</span>
                <span className="font-mono font-bold text-slate-800">60 秒</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">拒绝策略 (Reject Policy)</span>
                <span className="font-mono font-bold text-indigo-600">CallerRunsPolicy (调用方执行)</span>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowPoolModal(false)}
                className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
