import { useState } from 'react';
import { X, CheckCircle2, QrCode, ShieldCheck, Gift, Info } from 'lucide-react';
import { OrderRecord, BillingPolicyConfig } from '../../types';
import { initialBillingPolicy } from '../../data/billingPolicyData';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  policy?: BillingPolicyConfig;
  onSuccess: (amount: number, credits: number, newOrder: OrderRecord, paidCredits: number, bonusCredits: number) => void;
}

export default function RechargeModal({
  isOpen,
  onClose,
  currentBalance,
  policy = initialBillingPolicy,
  onSuccess,
}: RechargeModalProps) {
  // Use enabled packages from policy, or fallback
  const activePackages = policy.packages?.filter(p => p.enabled) || initialBillingPolicy.packages;

  const [selectedPkg, setSelectedPkg] = useState(
    activePackages.find(p => p.amount === 100) || activePackages[1] || activePackages[0]
  );
  const [payChannel, setPayChannel] = useState<'wechat' | 'alipay'>('wechat');
  const [isPaying, setIsPaying] = useState(false);
  const [showTerms, setShowTerms] = useState(true);

  if (!isOpen) return null;

  const handlePay = () => {
    setIsPaying(true);
    setTimeout(() => {
      const now = new Date();
      const orderNo = `CZ${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${Math.floor(100000 + Math.random() * 900000)}`;
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const newOrder: OrderRecord = {
        orderNo,
        createTime: timeStr,
        payTime: timeStr,
        type: '充值订单',
        transactionId: `42000024${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`,
        amount: `¥${selectedPkg.amount.toFixed(2)}`,
        numericAmount: selectedPkg.amount,
        credits: `+${selectedPkg.totalCredits.toLocaleString()} 积分`,
        paidCredits: selectedPkg.paidCredits,
        bonusCredits: selectedPkg.bonusCredits,
        channel: payChannel === 'wechat' ? '微信支付' : '支付宝',
        status: '已支付',
        invoicedStatus: '不可开票', // 充值订单无法开发票，消费时按消耗付费积分开票
        refundStatus: '无退款',
        refundAmount: 0,
        invoiceableAmount: 0,
      };

      onSuccess(
        selectedPkg.amount,
        selectedPkg.totalCredits,
        newOrder,
        selectedPkg.paidCredits,
        selectedPkg.bonusCredits
      );
      setIsPaying(false);
      onClose();
    }, 700);
  };

  const terms = policy.noticeTerms || initialBillingPolicy.noticeTerms;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        id="recharge-modal-card"
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">积分充值</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 flex items-center gap-1">
                <Gift className="w-3 h-3 text-emerald-600" />
                充值立赠20% (比例 5:1)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              当前账户可用余额：<span className="font-bold text-blue-600 font-mono">{currentBalance.toLocaleString()}</span> 积分
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-2xl hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1">
          {/* Packages selection */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
              选择充值规格 (固定比例 5:1 · 充 100 送 20 元)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {activePackages.map((pkg) => {
                const isSelected = selectedPkg.id === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg)}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-600/30'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs bg-white'
                    }`}
                  >
                    {pkg.popular && (
                      <span className="absolute -top-2.5 right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                        官方力荐
                      </span>
                    )}
                    <div>
                      <div className="text-lg font-black text-slate-900 font-mono">¥{pkg.amount.toFixed(2)}</div>
                      <div className="text-xs text-blue-600 font-black mt-1 font-mono">
                        {pkg.totalCredits.toLocaleString()} 积分
                      </div>
                      <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                        含赠 {pkg.bonusCredits.toLocaleString()} 分
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 pt-1.5 border-t border-slate-100 font-medium">
                      {pkg.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Breakdown Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-sky-50/60 to-indigo-50/50 border border-blue-200/80 text-xs space-y-2">
            <div className="flex items-center justify-between text-blue-950 font-bold">
              <span>到账情况明细（花 ¥{selectedPkg.amount} 到账 {selectedPkg.totalCredits.toLocaleString()} 积分）</span>
              <span className="font-mono text-blue-600">比例 5:1</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                <span className="text-slate-500 block">付费本金积分：</span>
                <span className="font-mono font-bold text-slate-900 text-xs">
                  {selectedPkg.paidCredits.toLocaleString()} 分
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">价值 ¥{selectedPkg.amount.toFixed(2)}，支持退款及开票</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                <span className="text-slate-500 block">系统赠送积分：</span>
                <span className="font-mono font-bold text-emerald-600 text-xs">
                  +{selectedPkg.bonusCredits.toLocaleString()} 分
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">系统按 5:1 自动抵扣，不折现退款</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              支付通道
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayChannel('wechat')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  payChannel === 'wechat'
                    ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 text-emerald-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    微
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900">微信支付</p>
                    <p className="text-[10px] text-slate-400">微信扫码快捷支付</p>
                  </div>
                </div>
                {payChannel === 'wechat' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setPayChannel('alipay')}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  payChannel === 'alipay'
                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500 text-blue-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    支
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900">支付宝支付</p>
                    <p className="text-[10px] text-slate-400">支付宝扫码快捷支付</p>
                  </div>
                </div>
                {payChannel === 'alipay' && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            </div>
          </div>

          {/* User Terms Notice (6 points) */}
          <div className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/80 text-xs space-y-2.5">
            <div 
              className="flex items-center justify-between font-bold text-slate-800 cursor-pointer select-none"
              onClick={() => setShowTerms(!showTerms)}
            >
              <div className="flex items-center gap-1.5 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>用户充值与退款须知（重要准则）</span>
              </div>
              <span className="text-[11px] text-blue-600 font-medium">
                {showTerms ? '收起须知' : '展开查看 6 条须知'}
              </span>
            </div>

            {showTerms && (
              <ol className="list-decimal list-outside pl-4 space-y-1.5 text-[11px] text-slate-600 leading-relaxed pt-1 border-t border-slate-200/60">
                {terms.map((item, idx) => (
                  <li key={idx} className="pl-1">
                    {item}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-500">
            <span>实付总额：</span>
            <span className="text-2xl font-black text-slate-900 font-mono ml-1">
              ¥{selectedPkg.amount.toFixed(2)}
            </span>
          </div>

          <button
            onClick={handlePay}
            disabled={isPaying}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPaying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>正在发起支付...</span>
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>立即支付 ¥{selectedPkg.amount.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
