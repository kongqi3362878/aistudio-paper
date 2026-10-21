import { useState } from 'react';
import { 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  Receipt, 
  FileText, 
  AlertCircle,
  Eye,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { OrderRecord, PageKey } from '../../types';
import OrderDetailModal from './OrderDetailModal';

interface OrdersViewProps {
  orders: OrderRecord[];
  onRefresh?: () => void;
  onNavigate?: (page: PageKey) => void;
  onApplyInvoice?: (order: OrderRecord) => void;
  onViewInvoice?: (invoiceId?: string) => void;
  onUpdateOrders?: (orders: OrderRecord[]) => void;
}

export default function OrdersView({ 
  orders, 
  onRefresh,
  onNavigate,
  onApplyInvoice,
  onViewInvoice,
  onUpdateOrders
}: OrdersViewProps) {
  const [statusFilter, setStatusFilter] = useState<'全部状态' | '已支付' | '待支付' | '已关闭'>('全部状态');
  const [invoiceFilter, setInvoiceFilter] = useState<'全部开票状态' | '可开票' | '已开票' | '待审核' | '不可开票'>('全部开票状态');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderRecord | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (onRefresh) onRefresh();
    }, 400);
  };

  // Calculate Invoice Metrics across orders
  const paidOrders = orders.filter((o) => o.status === '已支付');
  const totalPaidAmount = paidOrders.reduce((sum, o) => {
    const amt = parseFloat(o.amount.replace(/[^0-9.]/g, '')) || 0;
    return sum + amt;
  }, 0);

  const availableInvoiceAmount = paidOrders
    .filter((o) => (!o.invoicedStatus || o.invoicedStatus === '未开票' || o.invoicedStatus === '已退回') && (o.invoiceableAmount ?? 0) > 0)
    .reduce((sum, o) => sum + (o.invoiceableAmount ?? 0), 0);

  const invoicedAmount = paidOrders
    .filter((o) => o.invoicedStatus === '已开票')
    .reduce((sum, o) => sum + (o.numericAmount || (parseFloat(o.amount.replace(/[^0-9.]/g, '')) || 0)), 0);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== '全部状态' && order.status !== statusFilter) return false;
    if (invoiceFilter !== '全部开票状态') {
      if (invoiceFilter === '可开票') {
        const canInv = order.status === '已支付' && (order.invoiceableAmount ?? 0) > 0 && (!order.invoicedStatus || order.invoicedStatus === '未开票' || order.invoicedStatus === '已退回');
        if (!canInv) return false;
      } else if (invoiceFilter === '已开票' && order.invoicedStatus !== '已开票') {
        return false;
      } else if (invoiceFilter === '待审核' && order.invoicedStatus !== '待审核') {
        return false;
      } else if (invoiceFilter === '不可开票' && (order.status === '已支付' && (order.invoiceableAmount ?? 0) > 0)) {
        return false;
      }
    }
    return true;
  });

  const handleSimulateRefund = (orderNo: string, refundType: 'partial' | 'full') => {
    if (!onUpdateOrders) return;
    const updated = orders.map((o) => {
      if (o.orderNo === orderNo) {
        const rawAmt = parseFloat(o.amount.replace(/[^0-9.]/g, '')) || 0;
        const refAmt = refundType === 'full' ? rawAmt : Math.min(rawAmt, 50.0);
        const remaining = Math.max(0, rawAmt - refAmt);
        return {
          ...o,
          refundStatus: refundType === 'full' ? ('全额退款' as const) : ('部分退款' as const),
          refundAmount: refAmt,
          invoiceableAmount: remaining,
          invoicedStatus: (refundType === 'full' ? '不可开票' : o.invoicedStatus) as any,
        };
      }
      return o;
    });
    onUpdateOrders(updated);
    if (selectedOrderDetail && selectedOrderDetail.orderNo === orderNo) {
      const match = updated.find((u) => u.orderNo === orderNo);
      if (match) setSelectedOrderDetail(match);
    }
  };

  return (
    <div id="orders-view" className="space-y-8 w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto pb-16 font-sans">
      {/* 1. Header with Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">订单与财务记录</h1>
          <p className="text-base text-slate-500 mt-1">查看充值订单支付状态、可开票额度核算与发票申请流转</p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('invoice')}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>进入发票管理</span>
            </button>
          )}

          <button
            id="btn-refresh-orders"
            onClick={handleRefresh}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
            刷新
          </button>
        </div>
      </div>

      {/* 2. Top Stats Banner (Requirement 1: 展示可开票金额与开票入口) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 border border-white/10">
              <Receipt className="w-3.5 h-3.5 text-blue-300" />
              <span>增值税电子普通发票 / 专用发票统一服务</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              发票额度与开票凭证中心
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              基于您的实际付款金额合规开具。支持多订单合并开票，支持企业普票、专用发票与个人抬头；如订单发生退款，系统将自动核减可开额度并按规定进行红字冲销。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm">
            <div>
              <span className="text-xs text-slate-300 block">当前可开票总额</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                ¥{availableInvoiceAmount.toFixed(2)}
              </span>
            </div>
            <div className="w-px h-10 bg-white/15 hidden sm:block"></div>
            <div>
              <span className="text-xs text-slate-300 block">累计已开票金额</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
                ¥{invoicedAmount.toFixed(2)}
              </span>
            </div>
            <div className="w-px h-10 bg-white/15 hidden sm:block"></div>
            <div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('invoice')}
                  className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>立即批量申请开票</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-600">支付状态</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="全部状态">全部支付状态</option>
              <option value="已支付">已支付</option>
              <option value="待支付">待支付</option>
              <option value="已关闭">已关闭</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-600">开票状态</span>
            <select
              value={invoiceFilter}
              onChange={(e) => setInvoiceFilter(e.target.value as any)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="全部开票状态">全部开票状态</option>
              <option value="可开票">仅看可开票订单</option>
              <option value="已开票">仅看已开票订单</option>
              <option value="待审核">仅看开票申请中</option>
              <option value="不可开票">不可开票</option>
            </select>
          </div>
        </div>

        <span className="text-xs sm:text-sm text-slate-400 font-medium">
          共 <strong className="text-slate-800 font-bold">{filteredOrders.length}</strong> 条记录
        </span>
      </div>

      {/* 4. Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="py-4 px-6">订单号</th>
                <th className="py-4 px-6">创建时间</th>
                <th className="py-4 px-6">实付金额</th>
                <th className="py-4 px-6">到账积分</th>
                <th className="py-4 px-6">支付状态</th>
                <th className="py-4 px-6">可开票金额</th>
                <th className="py-4 px-6">开票状态</th>
                <th className="py-4 px-6 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 text-sm">
                    暂无符合条件的订单记录
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const rawAmt = parseFloat(order.amount.replace(/[^0-9.]/g, '')) || 0;
                  const invAmt = order.invoiceableAmount !== undefined 
                    ? order.invoiceableAmount 
                    : (order.status === '已支付' ? rawAmt : 0);
                  const canInvoiceNow = order.status === '已支付' && invAmt > 0 && (!order.invoicedStatus || order.invoicedStatus === '未开票' || order.invoicedStatus === '已退回');

                  return (
                    <tr 
                      key={order.orderNo} 
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      onClick={() => setSelectedOrderDetail(order)}
                    >
                      {/* Order No */}
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-slate-800">
                        <div className="group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                          <span>{order.orderNo}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {order.channel}
                        </div>
                      </td>

                      {/* Time */}
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">
                        {order.createTime}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 font-black text-slate-900 text-sm sm:text-base font-mono">
                        {order.amount}
                        {order.refundAmount && order.refundAmount > 0 && (
                          <span className="block text-[11px] font-bold text-rose-500">
                            退款 -¥{order.refundAmount.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Credits */}
                      <td className="py-4 px-6 font-bold text-indigo-600 text-xs sm:text-sm font-mono">
                        {order.credits}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-6">
                        {order.status === '已支付' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            已支付
                          </span>
                        )}
                        {order.status === '待支付' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            待支付
                          </span>
                        )}
                        {order.status === '已关闭' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            <XCircle className="w-3 h-3 text-slate-400" />
                            已关闭
                          </span>
                        )}
                      </td>

                      {/* Invoiceable Amount */}
                      <td className="py-4 px-6 font-mono font-bold">
                        {order.status === '已支付' ? (
                          invAmt > 0 ? (
                            <span className="text-amber-600">¥{invAmt.toFixed(2)}</span>
                          ) : (
                            <span className="text-slate-400">¥0.00</span>
                          )
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>

                      {/* Invoiced Status */}
                      <td className="py-4 px-6">
                        {order.invoicedStatus === '已开票' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            已开票
                          </span>
                        )}
                        {order.invoicedStatus === '待审核' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            审核中
                          </span>
                        )}
                        {order.invoicedStatus === '已退回' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200" title="申请被退回，可修改重提">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            已退回
                          </span>
                        )}
                        {(!order.invoicedStatus || order.invoicedStatus === '未开票') && order.status === '已支付' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            未开票
                          </span>
                        )}
                        {order.status !== '已支付' && (
                          <span className="text-[11px] text-slate-400">不可开票</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {canInvoiceNow && (
                            <button
                              onClick={() => {
                                if (onApplyInvoice) {
                                  onApplyInvoice(order);
                                } else if (onNavigate) {
                                  onNavigate('invoice');
                                }
                              }}
                              className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                              title="基于此订单申请开具发票"
                            >
                              申请开票
                            </button>
                          )}

                          {order.invoicedStatus === '已开票' && (
                            <button
                              onClick={() => {
                                if (onViewInvoice) onViewInvoice(order.invoiceId);
                              }}
                              className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-bold transition-all cursor-pointer"
                              title="查看已开具的电子发票"
                            >
                              查看发票
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedOrderDetail(order)}
                            className="px-2.5 py-1 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
                          >
                            详情
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-slate-500">
          <span>显示第 1 至 {filteredOrders.length} 项，共 {filteredOrders.length} 项</span>
          <div className="flex items-center gap-2">
            <button disabled className="p-2 rounded-xl border border-slate-200 bg-white text-slate-300 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3.5 py-1.5 rounded-xl border border-indigo-600 bg-indigo-50 text-indigo-600 font-bold">
              1
            </button>
            <button disabled className="p-2 rounded-xl border border-slate-200 bg-white text-slate-300 cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrderDetail}
        isOpen={!!selectedOrderDetail}
        onClose={() => setSelectedOrderDetail(null)}
        onApplyInvoice={(ord) => {
          setSelectedOrderDetail(null);
          if (onApplyInvoice) {
            onApplyInvoice(ord);
          } else if (onNavigate) {
            onNavigate('invoice');
          }
        }}
        onViewInvoice={(invId) => {
          setSelectedOrderDetail(null);
          if (onViewInvoice) onViewInvoice(invId);
        }}
      />
    </div>
  );
}
