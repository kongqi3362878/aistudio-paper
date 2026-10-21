import React, { useState } from 'react';
import { Search, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { initialPaymentOrders, PaymentOrderItem } from '../../../data/adminMockData';

export default function OrdersView() {
  const [orders, setOrders] = useState<PaymentOrderItem[]>(initialPaymentOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('全部渠道');
  const [statusFilter, setStatusFilter] = useState('全部状态');
  const [onlyTimeout, setOnlyTimeout] = useState(false);

  const filtered = orders.filter((o) => {
    if (channelFilter !== '全部渠道' && o.channel !== channelFilter) return false;
    if (statusFilter !== '全部状态' && o.platformStatus !== statusFilter) return false;
    if (onlyTimeout && o.platformStatus !== '待支付') return false;
    if (searchQuery && !o.orderNo.includes(searchQuery) && !o.username.includes(searchQuery) && !o.phone.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* 1. Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">收款订单</h2>
        <p className="text-xs text-slate-400 mt-0.5">积分充值订单 · 平台状态与渠道状态 (中文+原始码) 并列展示</p>
      </div>

      {/* 2. Filter Bar matching Screenshot 11 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索订单号、三方单号..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700"
          >
            <option>全部渠道</option>
            <option>微信支付</option>
            <option>支付宝</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700"
          >
            <option>全部状态</option>
            <option>已支付</option>
            <option>已关闭</option>
            <option>待支付</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
            <input
              type="checkbox"
              checked={onlyTimeout}
              onChange={(e) => setOnlyTimeout(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>仅超时待支付</span>
          </label>

          <select className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700">
            <option>创建时间</option>
            <option>支付时间</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="年/月/日"
              className="w-24 px-3 py-2 border border-slate-200 rounded-xl font-mono text-center"
            />
            <span className="text-slate-400">至</span>
            <input
              type="text"
              placeholder="年/月/日"
              className="w-24 px-3 py-2 border border-slate-200 rounded-xl font-mono text-center"
            />
          </div>

          <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all ml-auto">
            搜索
          </button>

          <span className="text-slate-400 font-mono text-xs">
            共 <strong className="text-slate-700 font-bold">21</strong> 单
          </span>
        </div>
      </div>

      {/* 3. Orders Table matching Screenshot 11 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">订单号</th>
                <th className="py-3 px-5">用户</th>
                <th className="py-3 px-5">机构</th>
                <th className="py-3 px-5">渠道</th>
                <th className="py-3 px-5">平台状态</th>
                <th className="py-3 px-5">渠道状态</th>
                <th className="py-3 px-5">到账积分</th>
                <th className="py-3 px-5">金额</th>
                <th className="py-3 px-5 text-right">支付时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-mono font-bold text-slate-800">{ord.orderNo}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{ord.productName}</div>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-800">{ord.username}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{ord.phone}</div>
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 max-w-[140px] truncate" title={ord.institution}>
                    {ord.institution}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 font-medium">
                    {ord.channel}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      ord.platformStatus === '已支付'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {ord.platformStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono">
                    <span className="text-slate-700 text-xs">{ord.channelStatus}</span>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-indigo-600">
                    {ord.credits.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 font-mono font-black text-slate-900">
                    ¥{ord.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-slate-400 text-right">
                    {ord.payTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <select className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white">
              <option>每页 10 条</option>
              <option>每页 20 条</option>
            </select>
            <span>第 1 / 3 页，共 21 条</span>
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
