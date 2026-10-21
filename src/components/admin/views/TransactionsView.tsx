import React from 'react';
import { Wallet, Coins, RotateCw, Clock, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { AdminSubPageKey } from '../../../types';

interface TransactionsViewProps {
  onNavigateSubPage?: (page: AdminSubPageKey) => void;
}

export default function TransactionsView({ onNavigateSubPage }: TransactionsViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* 1. Header with Range Picker matching Screenshot 10 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">交易总览</h2>
          <p className="text-xs text-slate-400 mt-0.5">按支付成功订单统计，非渠道到账/财务对账口径</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            <option>近 7 天</option>
            <option>今天</option>
            <option>近 30 天</option>
          </select>
          <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-600 cursor-pointer">
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Top 4 Metric Cards matching Screenshot 10 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">收款金额</span>
            <Wallet className="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
            ¥250.00
          </div>
          <div className="text-[11px] text-slate-400">
            2 笔已支付
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">到账积分</span>
            <Coins className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 font-mono tracking-tight">
            26,100
          </div>
          <div className="text-[11px] text-slate-400">
            含加赠 1,100
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">支付成功率</span>
            <RotateCw className="w-4.5 h-4.5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
            100.0%
          </div>
          <div className="text-[11px] text-slate-400">
            创建 2 / 已付 2
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">当前超时待支付</span>
            <Clock className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 font-mono tracking-tight">
            1
          </div>
          <div className="text-[11px] text-slate-400">
            全局 PENDING 且已过期
          </div>
        </div>
      </div>

      {/* 3. Middle 2 Cards matching Screenshot 10 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: 渠道拆分 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">渠道拆分 (按支付成功)</h3>
          <div className="pt-2 flex items-center justify-between text-xs py-3 border-b border-slate-100">
            <span className="font-medium text-slate-700">微信支付</span>
            <span className="font-mono text-slate-900 font-bold">¥250.00 · 2 笔</span>
          </div>
        </div>

        {/* Right: 待处理事项 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">待处理事项</h3>
          <div className="space-y-3 pt-1 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700">超时待支付 (建议人工同步)</span>
              <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">1</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>开票申请待审核与核验</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">1</span>
                {onNavigateSubPage && (
                  <button
                    onClick={() => onNavigateSubPage('invoices')}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    处理 →
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-700 flex items-center gap-1.5 text-rose-600">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> 异常通知次数
                </span>
                <span className="font-mono font-bold text-slate-900">0</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                异常通知为时间窗内验签失败或处理失败的次数，不是未解决工单数。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
