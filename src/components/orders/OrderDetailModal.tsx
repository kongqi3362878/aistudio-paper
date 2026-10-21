import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  Copy, 
  Check, 
  CreditCard, 
  Coins, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { OrderRecord } from '../../types';

interface OrderDetailModalProps {
  order: OrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyInvoice?: (order: OrderRecord) => void;
  onViewInvoice?: (invoiceId?: string) => void;
}

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onApplyInvoice,
  onViewInvoice,
}: OrderDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const isConsumption = order.type === '消费订单' || order.orderNo.startsWith('XF');
  const rawAmt = parseFloat(order.amount.replace(/[^0-9.]/g, '')) || 0;
  const invAmt = order.invoiceableAmount !== undefined ? order.invoiceableAmount : (isConsumption ? rawAmt : 0);
  const canInvoiceNow = isConsumption && order.status === '已支付' && invAmt > 0 && (!order.invoicedStatus || order.invoicedStatus === '未开票' || order.invoicedStatus === '已退回');

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
              isConsumption ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {isConsumption ? <Sparkles className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">订单详情</h3>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${
                  isConsumption 
                    ? 'bg-purple-50 text-purple-700 border-purple-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {isConsumption ? '消费订单' : '充值订单'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">流水凭证与税务发票核验信息</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
          {/* Status banner */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div>
              <div className="text-xs text-slate-400 font-medium">订单状态</div>
              <div className="text-base font-bold text-slate-800 mt-0.5">
                {order.status === '已支付' && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> 交易成功
                  </span>
                )}
                {order.status === '待支付' && (
                  <span className="inline-flex items-center gap-1.5 text-amber-600">
                    <Clock className="w-4 h-4" /> 待支付
                  </span>
                )}
                {order.status === '已关闭' && (
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <XCircle className="w-4 h-4" /> 订单已关闭
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">
                {isConsumption ? '消耗付费金额 (价值)' : '实付充值金额'}
              </div>
              <div className="text-xl font-black font-mono text-slate-900">
                {order.amount}
              </div>
            </div>
          </div>

          {/* Paper Title (if consumption order) */}
          {isConsumption && order.paperTitle && (
            <div className="p-3.5 bg-purple-50/70 border border-purple-100 rounded-2xl flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="text-purple-900 font-bold block">检测论文名称：</span>
                <span className="text-slate-800 font-medium mt-0.5 block leading-relaxed">
                  《{order.paperTitle}》
                </span>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <div className="text-slate-400 font-medium">订单编号</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="font-mono font-semibold text-slate-800 truncate" title={order.orderNo}>
                  {order.orderNo}
                </span>
                <button
                  onClick={() => handleCopy(order.orderNo)}
                  className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  title="复制订单号"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <div className="text-slate-400 font-medium">交易时间</div>
              <div className="flex items-center gap-1.5 mt-1 font-mono text-slate-700 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {order.createTime}
              </div>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <div className="text-slate-400 font-medium">{isConsumption ? '扣除积分数' : '到账总积分'}</div>
              <div className="flex items-center gap-1.5 mt-1 font-mono font-bold text-sm">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span className={isConsumption ? 'text-rose-600' : 'text-emerald-600'}>
                  {order.credits}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <div className="text-slate-400 font-medium">扣款 / 支付渠道</div>
              <div className="mt-1 font-medium text-slate-800">
                {order.channel}
              </div>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <div className="text-slate-400 font-medium">发票状态</div>
              <div className="mt-1">
                {!isConsumption ? (
                  <span className="text-slate-400 font-medium text-xs">充值订单无法开发票</span>
                ) : (
                  <>
                    {order.invoicedStatus === '已开票' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <ShieldCheck className="w-3.5 h-3.5" /> 已开电子发票
                      </span>
                    )}
                    {order.invoicedStatus === '待审核' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                        <Clock className="w-3.5 h-3.5" /> 开票审核中
                      </span>
                    )}
                    {order.invoicedStatus === '已退回' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        <AlertCircle className="w-3.5 h-3.5" /> 申请已退回
                      </span>
                    )}
                    {(!order.invoicedStatus || order.invoicedStatus === '未开票') && (
                      <span className="text-blue-600 font-bold text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        可申请开票
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <div className="text-slate-400 font-medium">可开票金额</div>
              <div className="mt-1 font-mono font-bold text-slate-800">
                {!isConsumption ? (
                  <span className="text-slate-400">¥0.00 (充值不开发票)</span>
                ) : (
                  <span className="text-amber-600 font-black">¥{invAmt.toFixed(2)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Invoicing Rule Explanation Banner */}
          {!isConsumption ? (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">充值订单开票与退款规则说明：</span>
                充值时包含系统赠送积分（比例 5:1）。因未发生实际服务交付且含有赠送积分，<strong className="text-blue-950">充值订单无法直接开具发票</strong>。当积分用于论文检测消费时，系统将自动按扣除的“付费积分”生成对应的可开票消费订单。若账户余额未消耗且未开票，可在【账户概览】统一申请账户余额退款。
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">消费订单开票说明：</span>
                “您的账户包含赠送积分，系统已为您按比例自动抵扣。仅按实际消耗的付费金额开具发票。”该笔检测扣除总计 {order.credits}，其中付费积分抵扣折合金额 <strong className="text-amber-700 font-mono">¥{invAmt.toFixed(2)}</strong>，支持开具增值税发票。
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            关闭
          </button>

          <div className="flex items-center gap-2">
            {order.invoicedStatus === '已开票' && onViewInvoice && (
              <button
                onClick={() => onViewInvoice(order.invoiceId)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                查看电子发票
              </button>
            )}

            {canInvoiceNow && onApplyInvoice && (
              <button
                onClick={() => onApplyInvoice(order)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                申请开具发票 (¥{invAmt.toFixed(2)})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
