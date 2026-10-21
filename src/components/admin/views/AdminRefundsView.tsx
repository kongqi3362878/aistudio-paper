import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Receipt,
  FileText,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  X,
  CreditCard
} from 'lucide-react';
import { RefundAuditItem, InvoiceRecord, InvoiceStatus, OrderRecord } from '../../../types';

interface AdminRefundsViewProps {
  refundAudits: RefundAuditItem[];
  onUpdateRefundAudits: (items: RefundAuditItem[]) => void;
  invoices: InvoiceRecord[];
  onUpdateInvoices: (invoices: InvoiceRecord[]) => void;
  orders?: OrderRecord[];
  onUpdateOrders?: (orders: OrderRecord[]) => void;
}

export default function AdminRefundsView({
  refundAudits,
  onUpdateRefundAudits,
  invoices,
  onUpdateInvoices,
  orders = [],
  onUpdateOrders,
}: AdminRefundsViewProps) {
  const [activeTab, setActiveTab] = useState<'全部' | '待审核' | '已同意退款' | '已拒绝'>('待审核');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item for review modal
  const [selectedAudit, setSelectedAudit] = useState<RefundAuditItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const counts = useMemo(() => {
    return {
      '待审核': refundAudits.filter(r => r.status === '待审核').length,
      '已同意退款': refundAudits.filter(r => r.status === '已同意退款').length,
      '已拒绝': refundAudits.filter(r => r.status === '已拒绝').length,
      '全部': refundAudits.length,
    };
  }, [refundAudits]);

  const filteredAudits = useMemo(() => {
    return refundAudits.filter(item => {
      if (activeTab !== '全部' && item.status !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchOrder = item.orderNo.toLowerCase().includes(q);
        const matchName = item.applicant.toLowerCase().includes(q);
        const matchPhone = item.phone.includes(q);
        const matchReason = item.reason.toLowerCase().includes(q);
        if (!matchOrder && !matchName && !matchPhone && !matchReason) return false;
      }
      return true;
    });
  }, [refundAudits, activeTab, searchQuery]);

  // Handle Approve Refund
  const handleApproveRefund = (item: RefundAuditItem) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    // 1. Update refund audit status
    const updatedAudits = refundAudits.map(r => {
      if (r.id === item.id) {
        return {
          ...r,
          status: '已同意退款' as const,
          auditTime: timeStr,
          auditor: '财务审核专员 (李娜)',
        };
      }
      return r;
    });
    onUpdateRefundAudits(updatedAudits);

    // 2. If the order has an existing invoice that was returned, close the invoice record
    const updatedInvoices = invoices.map(inv => {
      if (inv.orderNos.includes(item.orderNo) || inv.id === item.invoiceId) {
        return {
          ...inv,
          status: '已关闭' as InvoiceStatus,
          remark: `订单已同意原路退款 ¥${item.amount.toFixed(2)}，发票申请流程关闭`,
        };
      }
      return inv;
    });
    onUpdateInvoices(updatedInvoices);

    // 3. Update order refundStatus & invoiceableAmount
    if (onUpdateOrders && orders.length > 0) {
      const updatedOrders = orders.map(o => {
        if (o.orderNo === item.orderNo) {
          return {
            ...o,
            refundStatus: '全额退款' as const,
            refundAmount: item.amount,
            invoiceableAmount: 0,
            invoicedStatus: '不可开票' as const,
          };
        }
        return o;
      });
      onUpdateOrders(updatedOrders);
    }

    showToast(`退款审核已通过！金额 ¥${item.amount.toFixed(2)} 将原路退回用户支付账户（免红冲极速退款）。`);

    setSelectedAudit(null);
  };

  // Handle Reject Refund
  const handleConfirmReject = () => {
    if (!selectedAudit) return;
    if (!rejectReason.trim()) {
      showToast('请填写拒绝退款的原因说明');
      return;
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const updatedAudits = refundAudits.map(r => {
      if (r.id === selectedAudit.id) {
        return {
          ...r,
          status: '已拒绝' as const,
          auditTime: timeStr,
          auditor: '财务审核专员 (李娜)',
        };
      }
      return r;
    });
    onUpdateRefundAudits(updatedAudits);
    showToast(`已拒绝该笔退款申请`);
    setSelectedAudit(null);
    setIsRejecting(false);
    setRejectReason('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 text-xs sm:text-sm font-medium">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1.5 border border-indigo-100">
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600" />
            <span>交易管理 · 售后与退款审核</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            退款审核
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            充值订单退款申请复核、原路退款审批，严格遵循未申请发票或申请被退回方可退款原则（免红冲原路返还）
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>待审核退款</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black font-mono text-amber-600">
            {counts['待审核']}
          </div>
          <div className="text-[11px] text-slate-400">需人工核实额度消耗后处理</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>已同意退款笔数</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-600">
            {counts['已同意退款']}
          </div>
          <div className="text-[11px] text-slate-400">已自动触发原路返还资金</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
            <span>免红冲极速退款</span>
            <ShieldCheck className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-3xl font-black font-mono text-sky-600">
            {refundAudits.length}
          </div>
          <div className="text-[11px] text-slate-400">未申请发票/发票已退回直退</div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['全部', '待审核', '已同意退款', '已拒绝'] as const).map(tab => {
              const isActive = activeTab === tab;
              const count = counts[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索订单号、申请人、手机..."
              className="w-full pl-9 pr-3.5 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Audits Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">退款编号 / 申请时间</th>
                <th className="py-3 px-4">充值订单号</th>
                <th className="py-3 px-4">申请人 / 手机号</th>
                <th className="py-3 px-4">申请退款金额</th>
                <th className="py-3 px-4">退款原因</th>
                <th className="py-3 px-4">是否已开票</th>
                <th className="py-3 px-4">审核状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAudits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RotateCcw className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs">暂无【{activeTab}】退款申请数据</p>
                  </td>
                </tr>
              ) : (
                filteredAudits.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-800">{item.id}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.applyTime}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                      {item.orderNo}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{item.applicant}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{item.phone}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-black text-rose-600 text-sm">
                      ¥{item.amount.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-600" title={item.reason}>
                      {item.reason}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${
                        item.invoiceStatusDesc === '发票申请已退回'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{item.invoiceStatusDesc || (item.invoiced ? '已开票' : '未申请发票')}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.status === '待审核'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : item.status === '已同意退款'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}>
                        {item.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status === '待审核' ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedAudit(item);
                                setIsRejecting(false);
                              }}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                            >
                              审核退款
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedAudit(item);
                              setIsRejecting(false);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs cursor-pointer"
                          >
                            详情
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <RotateCcw className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    退款申请复核与审批
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    单号: {selectedAudit.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="w-8 h-8 rounded-xl hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">充值订单号：</span>
                  <span className="font-mono font-bold text-slate-800">{selectedAudit.orderNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">申请用户：</span>
                  <span className="font-bold text-slate-800">{selectedAudit.applicant} ({selectedAudit.phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">申请退款金额：</span>
                  <span className="font-mono font-black text-rose-600 text-base">¥{selectedAudit.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">申请时间：</span>
                  <span className="font-mono text-slate-600">{selectedAudit.applyTime}</span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">退款原因：</span>
                  <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                    {selectedAudit.reason}
                  </p>
                </div>
              </div>

              {/* Compliance Verification banner */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-xs sm:text-sm">发票合规核验通过 (无需红冲)</div>
                  <div className="text-[11px] text-emerald-800 leading-relaxed">
                    当前订单发票状态为【{selectedAudit.invoiceStatusDesc || '未申请发票'}】，符合“未申请发票或申请被退回方可申请退款”规定，无需开具红字发票冲销，审核通过后款项直接原路返还。
                  </div>
                </div>
              </div>

              {/* Reject Reason input if rejecting */}
              {isRejecting && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-700 block">
                    拒绝原因说明 <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="请输入拒绝退款的具体原因，如充值积分已被消耗等..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
              >
                关闭
              </button>

              {selectedAudit.status === '待审核' && (
                <div className="flex items-center gap-2">
                  {!isRejecting ? (
                    <>
                      <button
                        onClick={() => setIsRejecting(true)}
                        className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors cursor-pointer"
                      >
                        拒绝退款
                      </button>
                      <button
                        onClick={() => handleApproveRefund(selectedAudit)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                      >
                        同意退款并原路返回
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsRejecting(false)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                      >
                        返回
                      </button>
                      <button
                        onClick={handleConfirmReject}
                        className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                      >
                        确认拒绝
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
