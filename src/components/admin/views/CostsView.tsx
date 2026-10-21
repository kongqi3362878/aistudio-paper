import React, { useState } from 'react';
import { RotateCw, DollarSign, Cpu, CheckSquare, Zap, Clock } from 'lucide-react';
import { initialCostTasks, CostTaskItem } from '../../../data/adminMockData';

export default function CostsView() {
  const [reviewType, setReviewType] = useState<'normative' | 'risk'>('normative');
  const [cacheHit, setCacheHit] = useState<'ignore' | 'consider'>('ignore');
  const [activeTab, setActiveTab] = useState<'overview' | 'papers' | 'length' | 'pricing'>('overview');

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* 1. Header Filters matching Screenshot 3 */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        {/* Left Sub-tabs */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            成本概览
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'papers'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            论文明细
          </button>
          <button
            onClick={() => setActiveTab('length')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'length'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            篇幅分析
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            单价设置
          </button>
        </div>

        {/* Right Toggle options */}
        <div className="flex items-center gap-3 text-xs">
          {/* Review Type Pill */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setReviewType('normative')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                reviewType === 'normative' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              规范审查
            </button>
            <button
              onClick={() => setReviewType('risk')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                reviewType === 'risk' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600'
              }`}
            >
              内容风险
            </button>
          </div>

          {/* Cache hit */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setCacheHit('ignore')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                cacheHit === 'ignore' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              完全不考虑命中
            </button>
            <button
              onClick={() => setCacheHit('consider')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                cacheHit === 'consider' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              考虑命中
            </button>
          </div>

          {/* Time range select */}
          <span className="text-slate-400">统计区间</span>
          <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700">
            <option>近 7 天</option>
            <option>今天</option>
            <option>近 30 天</option>
          </select>
        </div>
      </div>

      <div className="text-xs text-slate-400 font-mono">
        规范审查 · 当前单价 · 完全不考虑命中 · 4 模型
      </div>

      {/* 2. Top 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs text-slate-400 font-medium">估算费用</div>
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
            ¥84.6986
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs text-slate-400 font-medium">Token</div>
          <div className="text-3xl font-black text-indigo-600 font-mono tracking-tight">
            65.4M
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs text-slate-400 font-medium">审查任务</div>
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
            9,188
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs text-slate-400 font-medium">平均每任务</div>
          <div className="text-3xl font-black text-emerald-600 font-mono tracking-tight">
            ¥0.0092
          </div>
        </div>
      </div>

      {/* 3. 任务核算表格 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">任务核算</h3>
            <p className="text-xs text-slate-400 mt-0.5">规范审查 · 按任务 × 模型分行 · 当前单价</p>
          </div>
          <div className="text-xs font-mono font-bold text-slate-700">
            合计 <span className="text-indigo-600 font-black">¥84.6986</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">任务</th>
                <th className="py-3 px-5">模型</th>
                <th className="py-3 px-5">次数</th>
                <th className="py-3 px-5">入TOKEN</th>
                <th className="py-3 px-5">出TOKEN</th>
                <th className="py-3 px-5">费用</th>
                <th className="py-3 px-5">占比</th>
                <th className="py-3 px-5">耗时</th>
                <th className="py-3 px-5 text-right">失败</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {initialCostTasks.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-sans font-bold text-slate-800">
                    {t.task}
                  </td>
                  <td className="py-3.5 px-5 text-indigo-600 font-medium">
                    {t.model}
                  </td>
                  <td className="py-3.5 px-5 text-slate-700">
                    {t.count.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {t.inToken}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {t.outToken}
                  </td>
                  <td className="py-3.5 px-5 font-bold text-slate-900">
                    ¥{t.cost.toFixed(4)}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {t.percentage}
                  </td>
                  <td className="py-3.5 px-5 text-slate-500">
                    {t.duration}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    {t.failCount > 0 ? (
                      <span className="font-bold text-rose-600">{t.failCount}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
