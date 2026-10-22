import React, { useState, useMemo, useEffect } from 'react';
import {
  Wallet,
  Coins,
  Receipt,
  FileText,
  CreditCard,
  Plus,
  Search,
  RotateCw,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Download,
  Eye,
  FileCheck,
  Send,
  Building2,
  User,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  X,
  Filter,
  Check,
  Gift,
  Info,
  Calculator,
  QrCode,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { 
  OrderRecord, 
  PageKey, 
  UserProfile, 
  InvoiceRecord, 
  InvoiceStatus, 
  RefundAuditItem, 
  BillingPolicyConfig 
} from '../../types';
import { initialBillingPolicy } from '../../data/billingPolicyData';
import InvoicePreviewModal from '../invoice/InvoicePreviewModal';
import OrderDetailModal from './OrderDetailModal';

export type BillingSubPage = 
  | 'overview'            // 费用中心主页 (Screenshot 1: 费用中心)
  | 'recharge'            // 充值入口 (Screenshot 2: 积分充值)
  | 'payment'             // 支付入口 (Screenshot 3: 扫码支付)
  | 'recharge-records'    // 充值记录 (Screenshot 4: 充值明细)
  | 'consumption-records' // 交易记录 / 全部交易 (Screenshot 5: 全部交易)
  | 'invoice-apply'       // 开票申请
  | 'invoice-records'     // 申请记录 (增值税发票流转台账)
  | 'rules-refund'        // 充值与退款规则
  | 'rules-pricing';      // 计费与使用说明

export interface BillingCenterViewProps {
  user: UserProfile;
  orders: OrderRecord[];
  invoices: InvoiceRecord[];
  refundAudits?: RefundAuditItem[];
  onUpdateOrders: (orders: OrderRecord[]) => void;
  onUpdateInvoices: (invoices: InvoiceRecord[]) => void;
  onUpdateRefundAudits?: (audits: RefundAuditItem[]) => void;
  onUpdateUser?: (user: UserProfile) => void;
  onNavigate?: (page: PageKey) => void;
  policy?: BillingPolicyConfig;
  initialTab?: 'overview' | 'recharge' | 'transactions' | 'invoices';
  initialInvoiceSubTab?: 'orders' | 'history';
}

export default function BillingCenterView({
  user,
  orders,
  invoices,
  refundAudits,
  onUpdateOrders,
  onUpdateInvoices,
  onUpdateRefundAudits,
  onUpdateUser,
  onNavigate,
  policy = initialBillingPolicy,
  initialTab = 'overview',
  initialInvoiceSubTab = 'orders',
}: BillingCenterViewProps) {
  // ==========================================================
  // 1. Navigation Stack ("只在一个页面上完成，每个功能都打开新的页面，可以返回上一个页面")
  // ==========================================================
  const [pageStack, setPageStack] = useState<BillingSubPage[]>(() => {
    if (initialTab === 'recharge') return ['overview', 'recharge'];
    if (initialTab === 'transactions') return ['overview', 'consumption-records'];
    if (initialTab === 'invoices') return ['overview', 'consumption-records', 'invoice-apply'];
    return ['overview'];
  });

  const currentPage = pageStack[pageStack.length - 1] || 'overview';

  const pushPage = (page: BillingSubPage) => {
    setPageStack(prev => [...prev, page]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const popPage = () => {
    setPageStack(prev => (prev.length > 1 ? prev.slice(0, -1) : ['overview']));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetToOverview = () => {
    setPageStack(['overview']);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper for page title in breadcrumbs
  const getPageTitle = (page: BillingSubPage): string => {
    switch (page) {
      case 'overview': return '费用中心';
      case 'recharge': return '积分充值';
      case 'payment': return '扫码支付';
      case 'recharge-records': return '充值明细';
      case 'consumption-records': return '全部交易';
      case 'invoice-apply': return '申请发票';
      case 'invoice-records': return '开票申请记录';
      case 'rules-refund': return '充值与退款规则';
      case 'rules-pricing': return '计费与使用说明';
      default: return '费用中心';
    }
  };

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // ==========================================================
  // 2. Recharge & Payment State (Screenshots 2 & 3)
  // ==========================================================
  // Pre-configured tiers
  const rechargeTiers = [
    { id: 1, amount: 50, credits: 6000, paidCredits: 5000, bonusCredits: 1000, bonusText: '含赠 1,000 分', hot: false },
    { id: 2, amount: 100, credits: 12000, paidCredits: 10000, bonusCredits: 2000, bonusText: '含赠 2,000 分', hot: true, badge: '官方力荐' },
    { id: 3, amount: 200, credits: 24000, paidCredits: 20000, bonusCredits: 4000, bonusText: '含赠 4,000 分', hot: false },
  ];

  const [selectedTierId, setSelectedTierId] = useState<number | 'custom'>(2); // Default to ¥100 (官方力荐)
  const [customAmountInput, setCustomAmountInput] = useState<string>('500');
  const [isAgreementCollapsed, setIsAgreementCollapsed] = useState<boolean>(false);
  const [payChannel, setPayChannel] = useState<'wechat' | 'alipay'>('wechat');

  // Calculate current recharge amount & credits
  const currentRechargeInfo = useMemo(() => {
    if (selectedTierId === 'custom') {
      const parsed = parseFloat(customAmountInput) || 0;
      const validAmount = Math.max(0.01, parsed);
      const paidCredits = Math.round(validAmount * 100);
      // Give 20% bonus for custom large recharge
      const bonusCredits = Math.round(paidCredits * 0.2);
      const totalCredits = paidCredits + bonusCredits;
      return {
        amount: validAmount,
        paidCredits,
        bonusCredits,
        totalCredits,
        bonusText: `含赠 ${bonusCredits.toLocaleString()} 分 (20%)`,
      };
    }
    const found = rechargeTiers.find(t => t.id === selectedTierId) || rechargeTiers[1];
    return {
      amount: found.amount,
      paidCredits: found.paidCredits,
      bonusCredits: found.bonusCredits,
      totalCredits: found.credits,
      bonusText: found.bonusText,
    };
  }, [selectedTierId, customAmountInput]);

  // Payment Countdown (59m 57s)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3597); // 59m 57s
  useEffect(() => {
    if (currentPage !== 'payment') return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const countdownHours = String(Math.floor(secondsRemaining / 3600)).padStart(2, '0');
  const countdownMinutes = String(Math.floor((secondsRemaining % 3600) / 60)).padStart(2, '0');
  const countdownSeconds = String(secondsRemaining % 60).padStart(2, '0');

  // Handle Simulation Payment (Adds balance, creates CZ order, redirects to recharge-records)
  const [isSimulatingPay, setIsSimulatingPay] = useState<boolean>(false);
  const handleExecutePayment = () => {
    setIsSimulatingPay(true);
    setTimeout(() => {
      setIsSimulatingPay(false);
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      const newOrderNo = `CZ${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}${Date.now().toString().slice(-8)}`;

      const newOrder: OrderRecord = {
        orderNo: newOrderNo,
        createTime: timeStr,
        payTime: timeStr,
        transactionId: `420000${Date.now().toString().slice(-14)}`,
        type: '充值订单',
        amount: `¥${currentRechargeInfo.amount.toFixed(2)}`,
        numericAmount: currentRechargeInfo.amount,
        credits: `+${currentRechargeInfo.totalCredits.toLocaleString()} 积分`,
        paidCredits: currentRechargeInfo.paidCredits,
        bonusCredits: currentRechargeInfo.bonusCredits,
        channel: payChannel === 'wechat' ? '微信支付' : '支付宝',
        status: '已支付',
        invoicedStatus: '不可开票', // 充值订单以积分呈现，无法开票；消费积分进行论文检查时可开票
        refundStatus: '无退款',
        refundAmount: 0,
        invoiceableAmount: 0,
      };

      onUpdateOrders([newOrder, ...orders]);
      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          balance: (user.balance || 0) + currentRechargeInfo.totalCredits,
          paidCredits: (user.paidCredits ?? 9000) + currentRechargeInfo.paidCredits,
          bonusCredits: (user.bonusCredits ?? 1800) + currentRechargeInfo.bonusCredits,
        });
      }

      showToast(`支付成功！已成功充值到账 +${currentRechargeInfo.totalCredits.toLocaleString()} 积分`);
      pushPage('recharge-records');
    }, 600);
  };

  // ==========================================================
  // 3. Financial Derivations (Paid, Consumption, Invoices)
  // ==========================================================
  // Recharge Orders (充值记录 - CZ...)
  const rechargeOrders = useMemo(() => {
    return orders.filter(o => o.type === '充值订单' || o.orderNo.startsWith('CZ'));
  }, [orders]);

  // Consumption Orders (交易记录 - XF...)
  const consumptionOrders = useMemo(() => {
    return orders.filter(o => o.type === '消费订单' || o.orderNo.startsWith('XF'));
  }, [orders]);

  // Total consumption credits & count
  const totalConsumptionCredits = useMemo(() => {
    return consumptionOrders
      .filter(o => o.status === '已支付')
      .reduce((sum, o) => {
        const val = parseInt(o.credits.replace(/[^0-9]/g, '')) || 0;
        return sum + val;
      }, 0);
  }, [consumptionOrders]);

  const totalInspectionCount = useMemo(() => {
    return consumptionOrders.filter(o => o.status === '已支付').length;
  }, [consumptionOrders]);

  // Selected order for detail modal
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderRecord | null>(null);

  // Invoicable Consumption Orders
  const invoicableOrders = useMemo(() => {
    return consumptionOrders.filter(o => {
      const remainingInv = o.invoiceableAmount ?? 0;
      return o.status === '已支付' && remainingInv > 0 && (!o.invoicedStatus || o.invoicedStatus === '未开票' || o.invoicedStatus === '已退回');
    });
  }, [consumptionOrders]);

  // Selected orders for invoicing
  const [selectedOrderNos, setSelectedOrderNos] = useState<string[]>([]);
  const selectedInvoicableTotalAmount = useMemo(() => {
    return invoicableOrders
      .filter(o => selectedOrderNos.includes(o.orderNo))
      .reduce((sum, o) => sum + (o.invoiceableAmount ?? 0), 0);
  }, [invoicableOrders, selectedOrderNos]);

  // Invoice Form State
  const [applyForm, setApplyForm] = useState({
    titleType: '企业' as '企业' | '个人',
    invoiceType: '增值税普通发票' as '增值税普通发票' | '增值税专用发票',
    title: '',
    taxNumber: '',
    bankName: '',
    bankAccount: '',
    address: '',
    phone: user.phone || '13810248899',
    email: user.email || 'student@whu.edu.cn',
    idCard: '',
    remark: '',
  });

  // Preview Invoice Modal
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(null);

  // Submit Invoice Application
  const handleSubmitInvoiceApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrderNos.length === 0) {
      showToast('请至少勾选一笔可开票的消费订单');
      return;
    }
    if (!applyForm.title.trim()) {
      showToast('请填写发票抬头名称');
      return;
    }
    if (applyForm.titleType === '企业' && (!applyForm.taxNumber.trim() || applyForm.taxNumber.trim().length !== 18)) {
      showToast('企业纳税人识别号须为18位字符');
      return;
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const newId = `INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Date.now().toString().slice(-4)}`;
    const newApplicationNo = `SQ-${Date.now().toString().slice(-10)}`;

    const newInvoice: InvoiceRecord = {
      id: newId,
      applicationNo: newApplicationNo,
      orderNos: selectedOrderNos,
      amount: selectedInvoicableTotalAmount,
      invoiceType: applyForm.invoiceType,
      titleType: applyForm.titleType,
      title: applyForm.title.trim(),
      taxNumber: applyForm.titleType === '企业' ? applyForm.taxNumber.trim().toUpperCase() : undefined,
      bankName: applyForm.bankName.trim() || undefined,
      bankAccount: applyForm.bankAccount.trim() || undefined,
      address: applyForm.address.trim() || undefined,
      phone: applyForm.phone.trim() || undefined,
      email: applyForm.email.trim() || undefined,
      goodsName: '*信息技术服务*论文规范智能审校检测费',
      taxRate: 0.06,
      taxAmount: parseFloat((selectedInvoicableTotalAmount * 0.06 / 1.06).toFixed(2)),
      amountWithoutTax: parseFloat((selectedInvoicableTotalAmount / 1.06).toFixed(2)),
      remark: applyForm.remark.trim() || `关联消费订单 ${selectedOrderNos.join(', ')}`,
      status: '待处理',
      applyTime: timeStr,
      applicantName: user.name || user.username || '当前用户',
      applicantPhone: user.phone || '13810248899',
    };

    // Update orders to 待审核
    const updatedOrders = orders.map(o => {
      if (selectedOrderNos.includes(o.orderNo)) {
        return {
          ...o,
          invoicedStatus: '待审核' as const,
          invoiceId: newId,
        };
      }
      return o;
    });

    onUpdateOrders(updatedOrders);
    onUpdateInvoices([newInvoice, ...invoices]);
    setSelectedOrderNos([]);
    showToast('发票申请提交成功！已进入申请流转台账，财务处理后将生成国家标准电子发票');
    pushPage('invoice-records');
  };

  // Revoke Invoice
  const handleRevokeInvoice = (inv: InvoiceRecord) => {
    if (!window.confirm(`确定要撤销发票申请【${inv.applicationNo}】吗？撤销后关联订单将重新释放为可开票状态。`)) {
      return;
    }
    const updatedInvoices = invoices.map(i => i.id === inv.id ? { ...i, status: '已关闭' as InvoiceStatus } : i);
    const updatedOrders = orders.map(o => {
      if (inv.orderNos.includes(o.orderNo)) {
        return {
          ...o,
          invoicedStatus: '未开票' as const,
          invoiceId: undefined,
        };
      }
      return o;
    });

    onUpdateInvoices(updatedInvoices);
    onUpdateOrders(updatedOrders);
    showToast('已撤销该开票申请，关联订单额度已释放');
  };

  // ==========================================================
  // 4. Account Balance Full Refund State & Handler
  // 规则：可退款金额 =（剩下积分 - 赠送积分）÷ 100
  // ==========================================================
  const [isBalanceRefundModalOpen, setIsBalanceRefundModalOpen] = useState(false);
  const [balanceRefundReason, setBalanceRefundReason] = useState('检测任务已完成/毕业答辩结束，申请清结账户余额');
  const [balanceRefundRemark, setBalanceRefundRemark] = useState('');
  const [isSubmittingBalanceRefund, setIsSubmittingBalanceRefund] = useState(false);

  const refundableYuan = useMemo(() => {
    const paid = user.paidCredits ?? Math.max(0, (user.balance || 0) - (user.bonusCredits || 0));
    return parseFloat((paid / (policy.baseCreditPerYuan || 100)).toFixed(2));
  }, [user, policy]);

  const handleSubmitBalanceRefund = () => {
    setIsSubmittingBalanceRefund(true);
    setTimeout(() => {
      setIsSubmittingBalanceRefund(false);
      const newAudit: RefundAuditItem = {
        id: `REF-${Date.now().toString().slice(-8)}`,
        orderNo: 'ACC-BALANCE-ALL',
        applicant: user.name || user.username || '当前用户',
        phone: user.phone || '13810248899',
        amount: refundableYuan,
        reason: `${balanceRefundReason}${balanceRefundRemark.trim() ? `（说明：${balanceRefundRemark.trim()}）` : ''}【算法结算：(剩下积分${user.balance} - 赠送积分${user.bonusCredits ?? 0}) ÷ 100 = ¥${refundableYuan}】`,
        applyTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        status: '待审核',
        invoiced: false,
        invoiceStatusDesc: '未申请发票',
      };

      if (onUpdateRefundAudits) {
        onUpdateRefundAudits([newAudit, ...(refundAudits || [])]);
      }

      showToast(`账户退款申请已提交！审核通过后将原路返回 ¥${refundableYuan.toFixed(2)}，退款成功后剩余积分清零。`);
      setIsBalanceRefundModalOpen(false);
    }, 450);
  };

  // ==========================================================
  // RENDER SECTIONS
  // ==========================================================
  return (
    <div id="billing-center-main" className="space-y-8 w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto pb-16 font-sans">
      {/* ========================================================== */}
      {/* SUBPAGE HEADER & BREADCRUMBS (Only shown when not on overview) */}
      {/* ========================================================== */}
      {currentPage !== 'overview' && (
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <button
              id="btn-back-to-previous"
              type="button"
              onClick={popPage}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200/80 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 text-sm font-bold shadow-xs transition-all cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>返回上一个页面</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400 font-medium">
              <button 
                type="button"
                onClick={resetToOverview}
                className="hover:text-blue-600 transition-colors cursor-pointer"
              >
                费用中心
              </button>
              {pageStack.slice(1).map((p, idx) => {
                const isLast = idx === pageStack.length - 2;
                return (
                  <React.Fragment key={p + idx}>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    <span className={isLast ? 'font-bold text-slate-900' : 'hover:text-blue-600 cursor-pointer'}>
                      {getPageTitle(p)}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          {currentPage === 'payment' && (
            <button
              type="button"
              onClick={popPage}
              className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="关闭并返回"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/* 1. PAGE: 费用中心 (Screenshot 1: image_92238a17.png)         */}
      {/* ========================================================== */}
      {currentPage === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Page Title & Actions matching Global Standard */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-slate-200/80 pb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                费用中心
              </h1>
              <p className="text-base text-slate-500 mt-1">
                统一管理账户检测积分资产、充值明细、消费交易与增值税发票。
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => pushPage('recharge-records')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 text-sm font-bold shadow-2xs transition-all cursor-pointer"
              >
                充值明细
              </button>
              <button
                type="button"
                onClick={() => pushPage('consumption-records')}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 text-sm font-bold shadow-2xs transition-all cursor-pointer"
              >
                全部交易
              </button>
            </div>
          </div>

          {/* Top Hero Section: Left Balance Card + Right Stats Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Card: Signature Gradient Top Banner + White Bottom Stats */}
            <div className="lg:col-span-6 xl:col-span-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between">
              {/* Upper Banner with Brand Gradient */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 p-7 sm:p-8 text-white flex items-center justify-between relative overflow-hidden">
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-2 text-white/90 text-sm font-bold tracking-wide">
                    <Coins className="w-4 h-4 text-blue-200" />
                    <span>可用余额</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                      {(user.balance || 0).toLocaleString()}
                    </span>
                    <span className="text-base font-bold text-white/90">积分</span>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-100/90 pt-1">
                    上传论文后确认费用，支持直接按次付款或积分抵扣
                  </p>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-col gap-2.5 shrink-0 ml-4 relative z-10">
                  <button
                    id="btn-overview-recharge"
                    type="button"
                    onClick={() => pushPage('recharge')}
                    className="w-28 px-4 py-2.5 bg-white text-blue-600 hover:bg-blue-50 text-sm font-extrabold rounded-xl shadow-sm transition-all text-center cursor-pointer active:scale-95"
                  >
                    充值积分
                  </button>
                  <button
                    id="btn-overview-recharge-records"
                    type="button"
                    onClick={() => pushPage('recharge-records')}
                    className="w-28 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white text-sm font-bold rounded-xl border border-white/20 transition-all text-center cursor-pointer active:scale-95"
                  >
                    充值明细
                  </button>
                </div>
              </div>

              {/* Lower White Section: 付费积分 & 赠送积分 */}
              <div className="p-7 sm:p-8 bg-white grid grid-cols-2 divide-x divide-slate-100">
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-slate-500 font-semibold">付费积分</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {(user.paidCredits ?? Math.max(0, (user.balance || 0) - (user.bonusCredits || 0))).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">长期有效 · 消费后可开发票</div>
                </div>

                <div className="pl-6 sm:pl-8 space-y-1">
                  <div className="text-xs sm:text-sm text-slate-500 font-semibold">赠送积分</div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {(user.bonusCredits ?? 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    {(user.bonusCredits ?? 0) > 0 ? '促销/活动赠送' : '暂无赠送余额'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: 累计消费积分 & 累计检测 */}
            <div className="lg:col-span-6 xl:col-span-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-7 sm:p-8 flex flex-col justify-center">
              <div className="grid grid-cols-2 gap-5 h-full items-center">
                {/* Stat Box 1: 累计消费积分 */}
                <div
                  id="card-stat-consumption"
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 sm:p-8 flex flex-col items-center justify-center text-center h-full transition-all hover:bg-slate-50 hover:border-blue-200"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-600">
                    累计消费积分
                  </span>
                  <div className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {totalConsumptionCredits.toLocaleString()}
                  </div>
                </div>

                {/* Stat Box 2: 累计检测 */}
                <div
                  id="card-stat-inspections"
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-6 sm:p-8 flex flex-col items-center justify-center text-center h-full transition-all hover:bg-slate-50 hover:border-blue-200"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-600">
                    累计检测
                  </span>
                  <div className="mt-3 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {totalInspectionCount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: 近期消费记录 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-7 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">近期消费记录</h2>
                <p className="text-sm text-slate-500 mt-1">展示账户积分消费明细，消费订单可开具发票</p>
              </div>

              <button
                id="btn-overview-all-transactions"
                type="button"
                onClick={() => pushPage('consumption-records')}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>全部交易</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Consumption Table */}
            <div className="rounded-2xl border border-slate-200/80 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 text-xs sm:text-sm font-bold">
                  <tr>
                    <th className="py-4 px-6 font-bold">订单内容</th>
                    <th className="py-4 px-6 font-bold">交易时间</th>
                    <th className="py-4 px-6 font-bold">交易积分</th>
                    <th className="py-4 px-6 font-bold text-right sm:text-left">交易状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {consumptionOrders.slice(0, 4).map((rec) => (
                    <tr 
                      key={rec.orderNo} 
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrderDetail(rec)}
                    >
                      <td className="py-4 px-6 font-medium text-slate-800 max-w-md truncate">
                        {rec.paperTitle ? `《${rec.paperTitle}》` : rec.orderNo}
                      </td>
                      <td className="py-4 px-6 text-slate-500 text-xs sm:text-sm whitespace-nowrap">
                        {rec.createTime}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                        {rec.credits}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-right sm:text-left">
                        <span className={`inline-flex items-center text-xs sm:text-sm font-medium ${
                          rec.status === '已支付' ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {consumptionOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400 text-sm">
                        暂无近期消费记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Section: 充值与退款规则 + 计费与使用说明 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: 充值与退款规则 */}
            <div
              id="card-rules-refund"
              onClick={() => pushPage('rules-refund')}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    充值与退款规则
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">余额退款与赠送额度说明，未消费本金支持全额退款</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Card 2: 计费与使用说明 */}
            <div
              id="card-rules-pricing"
              onClick={() => pushPage('rules-pricing')}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-7 flex items-center justify-between hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    计费与使用说明
                  </h3>
                  <p className="text-sm text-slate-500 mt-0.5">标准检测定价与阶梯优惠说明，透明消费</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 space-y-2 text-xs text-slate-400">
            <div className="space-x-3">
              <button 
                type="button" 
                onClick={() => pushPage('rules-refund')} 
                className="hover:text-slate-600 cursor-pointer underline-offset-2 hover:underline"
              >
                充值与退款说明
              </button>
              <span>·</span>
              <button 
                type="button" 
                onClick={() => pushPage('rules-pricing')} 
                className="hover:text-slate-600 cursor-pointer underline-offset-2 hover:underline"
              >
                优惠规则
              </button>
            </div>
            <div>© 2026 论文智检. 保留所有权利。 | 鄂ICP备2026023941号-2</div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 2. PAGE: 充值入口 (Screenshot 2: image_bcf0499a.png)         */}
      {/* ========================================================== */}
      {currentPage === 'recharge' && (
        <div className="animate-in fade-in duration-200">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 sm:p-10 space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between pb-6 border-b border-slate-100">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  积分充值
                </h1>
                <p className="text-base text-slate-500 mt-1">
                  当前账户可用余额：
                  <span className="font-bold text-blue-600 ml-1">
                    {(user.balance || 0).toLocaleString()} 积分
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={popPage}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Preset Tiers Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {rechargeTiers.map((tier) => {
                const isSelected = selectedTierId === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`relative rounded-2xl p-6 flex flex-col justify-between text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-blue-600 bg-blue-50/20 shadow-md shadow-blue-500/10'
                        : 'border border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-2xs whitespace-nowrap">
                        {tier.badge}
                      </div>
                    )}
                    <div className="space-y-1.5 pt-1">
                      <div className="text-2xl sm:text-3xl font-black text-slate-900">
                        ¥{tier.amount.toFixed(2)}
                      </div>
                      <div className="text-base font-bold text-blue-600">
                        {tier.credits.toLocaleString()} 积分
                      </div>
                      <div className="text-xs font-semibold text-emerald-600">
                        {tier.bonusText}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Tier 4: 其他金额 */}
              <div
                onClick={() => setSelectedTierId('custom')}
                className={`relative rounded-2xl p-6 flex flex-col justify-center items-center text-center transition-all cursor-pointer ${
                  selectedTierId === 'custom'
                    ? 'border-2 border-blue-600 bg-blue-50/20 shadow-md shadow-blue-500/10'
                    : 'border border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="text-lg sm:text-xl font-bold text-slate-800">
                  其他金额
                </div>
                {selectedTierId === 'custom' && (
                  <div className="mt-2 flex items-center justify-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                    <span className="text-sm font-bold text-slate-600">¥</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={customAmountInput}
                      onChange={(e) => setCustomAmountInput(e.target.value)}
                      placeholder="金额"
                      className="w-24 px-2 py-1 border border-blue-400 rounded-lg text-sm font-bold text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                {selectedTierId === 'custom' && (
                  <div className="text-xs font-semibold text-emerald-600 mt-1">
                    {currentRechargeInfo.bonusText}
                  </div>
                )}
              </div>
            </div>

            {/* 充值协议折叠卡片 (Screenshot 2) */}
            <div className="rounded-2xl border border-blue-100/80 bg-blue-50/30 p-5 sm:p-6 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 text-sm font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>充值协议</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAgreementCollapsed(!isAgreementCollapsed)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  {isAgreementCollapsed ? '展开须知' : '收起须知'}
                </button>
              </div>

              {!isAgreementCollapsed && (
                <div className="space-y-2 text-xs sm:text-[13px] text-slate-600 leading-relaxed font-sans border-t border-slate-200/60 pt-3">
                  <p>1. 充值余额中未消耗且未开具发票的本金部分，支持申请全额退款（人民币最小退款金额 0.01 元）。</p>
                  <p>2. 系统赠送的积分不支持折现退款；已消耗金额及已开具发票的金额不支持退款。</p>
                  <p>3. 微信、支付宝支付超过 12 个月的订单，因支付渠道限制，不支持原路退款。</p>
                  <p>4. 计费可能存在延迟，页面展示的可退款金额为系统预估金额，最终退款金额以财务审核确认准。</p>
                  <p>5. 退款申请审核通过后，款项一般会在 5-7 个工作日内按原支付路径退回。</p>
                  <p>6. 同一账号同一时间仅可存在一笔处理中的退款申请。退款成功后，该笔订单对应的所有剩余积分（含赠送）将全部作废清零。</p>
                  <div className="text-xs text-slate-400 pt-1 font-medium">
                    用户支付须知最终解释权归本网站所有。
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="text-slate-700 font-medium text-base">
                实付总额：
                <span className="text-2xl sm:text-3xl font-black text-slate-900 ml-1">
                  ¥{currentRechargeInfo.amount.toFixed(2)}
                </span>
              </div>

              <button
                id="btn-goto-payment"
                type="button"
                onClick={() => pushPage('payment')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-5 h-5" />
                <span>立即支付 ¥{currentRechargeInfo.amount.toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3. PAGE: 支付入口 (Screenshot 3: image_7100b99d.png)         */}
      {/* ========================================================== */}
      {currentPage === 'payment' && (
        <div className="animate-in fade-in duration-200">
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
            {/* Top Light Blue Area with Countdown & Big Price */}
            <div className="bg-gradient-to-b from-blue-50/90 to-slate-50/50 border-b border-slate-200/80 p-8 text-center relative">
              <button
                type="button"
                onClick={popPage}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
                title="关闭"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Countdown Pill */}
              <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200/80 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold text-slate-700 shadow-2xs">
                <span>剩余支付时间</span>
                <span className="text-rose-500 font-bold text-sm ml-1">{countdownHours}</span>
                <span>时</span>
                <span className="text-rose-500 font-bold text-sm">{countdownMinutes}</span>
                <span>分</span>
                <span className="text-rose-500 font-bold text-sm">{countdownSeconds}</span>
                <span>秒</span>
              </div>

              {/* Big Red/Rose Price */}
              <div className="mt-5 text-slate-700 font-medium text-lg">
                请支付 ¥{' '}
                <span className="text-4xl sm:text-5xl font-black text-rose-500 tracking-tight mx-1">
                  {currentRechargeInfo.amount.toFixed(2)}
                </span>{' '}
                元
              </div>
            </div>

            {/* White Body: Select Channel + QR Code Container */}
            <div className="p-7 sm:p-10 space-y-6">
              {/* Payment Method Selector */}
              <div>
                <div className="text-sm font-bold text-slate-700 mb-3">
                  请选择支付方式
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* WeChat */}
                  <button
                    type="button"
                    onClick={() => setPayChannel('wechat')}
                    className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl transition-all cursor-pointer ${
                      payChannel === 'wechat'
                        ? 'border-2 border-blue-500 bg-white text-slate-900 shadow-xs font-bold'
                        : 'border border-slate-200 bg-slate-50/70 text-slate-600 font-medium hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>微信</span>
                  </button>

                  {/* Alipay */}
                  <button
                    type="button"
                    onClick={() => setPayChannel('alipay')}
                    className={`flex items-center justify-center gap-2.5 p-3.5 rounded-2xl transition-all cursor-pointer ${
                      payChannel === 'alipay'
                        ? 'border-2 border-blue-500 bg-white text-slate-900 shadow-xs font-bold'
                        : 'border border-slate-200 bg-slate-50/70 text-slate-600 font-medium hover:bg-slate-100'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                      支
                    </div>
                    <span>支付宝</span>
                  </button>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="border border-slate-200/80 rounded-2xl p-7 text-center space-y-3.5 bg-slate-50/40">
                <div className="text-sm font-semibold text-slate-600">
                  打开{payChannel === 'wechat' ? '微信' : '支付宝'}扫一扫
                </div>

                {/* QR Code Visual */}
                <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center relative">
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                    {/* Simplified high-res decorative QR pattern */}
                    <rect x="5" y="5" width="25" height="25" rx="3" fill="#1e293b" />
                    <rect x="9" y="9" width="17" height="17" rx="2" fill="white" />
                    <rect x="13" y="13" width="9" height="9" rx="1" fill="#1e293b" />

                    <rect x="70" y="5" width="25" height="25" rx="3" fill="#1e293b" />
                    <rect x="74" y="9" width="17" height="17" rx="2" fill="white" />
                    <rect x="78" y="13" width="9" height="9" rx="1" fill="#1e293b" />

                    <rect x="5" y="70" width="25" height="25" rx="3" fill="#1e293b" />
                    <rect x="9" y="74" width="17" height="17" rx="2" fill="white" />
                    <rect x="13" y="78" width="9" height="9" rx="1" fill="#1e293b" />

                    {/* Data modules */}
                    <rect x="35" y="8" width="6" height="6" fill="#1e293b" />
                    <rect x="45" y="14" width="6" height="6" fill="#1e293b" />
                    <rect x="55" y="8" width="6" height="6" fill="#1e293b" />
                    <rect x="38" y="24" width="6" height="6" fill="#1e293b" />
                    <rect x="48" y="24" width="6" height="6" fill="#1e293b" />
                    <rect x="58" y="24" width="6" height="6" fill="#1e293b" />

                    <rect x="8" y="38" width="6" height="6" fill="#1e293b" />
                    <rect x="18" y="48" width="6" height="6" fill="#1e293b" />
                    <rect x="28" y="38" width="6" height="6" fill="#1e293b" />

                    <rect x="38" y="38" width="8" height="8" rx="1" fill={payChannel === 'wechat' ? '#10b981' : '#2563eb'} />
                    <rect x="52" y="38" width="6" height="6" fill="#1e293b" />
                    <rect x="62" y="44" width="6" height="6" fill="#1e293b" />
                    <rect x="74" y="38" width="6" height="6" fill="#1e293b" />
                    <rect x="84" y="48" width="6" height="6" fill="#1e293b" />

                    <rect x="38" y="52" width="6" height="6" fill="#1e293b" />
                    <rect x="48" y="60" width="8" height="8" rx="1" fill="#1e293b" />
                    <rect x="62" y="54" width="6" height="6" fill="#1e293b" />

                    <rect x="36" y="74" width="6" height="6" fill="#1e293b" />
                    <rect x="46" y="82" width="6" height="6" fill="#1e293b" />
                    <rect x="58" y="74" width="6" height="6" fill="#1e293b" />
                    <rect x="70" y="80" width="6" height="6" fill="#1e293b" />
                    <rect x="82" y="74" width="6" height="6" fill="#1e293b" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>等待扫码支付</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    请勿重复扫码，页面会自动查询原订单。
                  </p>
                  <div>
                    <button 
                      type="button"
                      onClick={() => pushPage('rules-refund')}
                      className="text-xs text-blue-600 underline hover:text-blue-700 cursor-pointer"
                    >
                      购买即视为同意《用户充值协议》
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulation Testing Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  id="btn-simulate-pay-success"
                  type="button"
                  disabled={isSimulatingPay}
                  onClick={handleExecutePayment}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isSimulatingPay ? '正在校验支付渠道并入账...' : '【模拟】扫码完成支付 (即时到账)'}</span>
                </button>

                <button
                  type="button"
                  onClick={popPage}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  取消并返回上一步
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 4. PAGE: 充值记录 (Screenshot 4: image_62360035.png)         */}
      {/* ========================================================== */}
      {currentPage === 'recharge-records' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200/80 pb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                充值明细
              </h1>
              <p className="text-base text-slate-500 mt-1">
                展示账户充值订单与到账积分流水
              </p>
            </div>

            <button
              id="btn-records-recharge-now"
              type="button"
              onClick={() => pushPage('recharge')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>立即充值</span>
            </button>
          </div>

          {/* Table Container (Screenshot 4) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 text-xs sm:text-sm font-bold">
                  <tr>
                    <th className="py-4 px-6 font-bold">订单号</th>
                    <th className="py-4 px-6 font-bold">交易时间</th>
                    <th className="py-4 px-6 font-bold">支付渠道</th>
                    <th className="py-4 px-6 font-bold">金额</th>
                    <th className="py-4 px-6 font-bold">积分变动</th>
                    <th className="py-4 px-6 font-bold text-center">状态</th>
                    <th className="py-4 px-6 font-bold text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rechargeOrders.map((rec) => (
                    <tr 
                      key={rec.orderNo} 
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrderDetail(rec)}
                    >
                      <td className="py-5 px-6 font-mono text-xs sm:text-sm font-medium text-slate-800">
                        {rec.orderNo}
                      </td>
                      <td className="py-5 px-6 text-slate-500 font-mono text-xs sm:text-sm whitespace-nowrap">
                        {rec.createTime}
                      </td>
                      <td className="py-5 px-6 text-slate-700 text-sm whitespace-nowrap">
                        {rec.channel}
                      </td>
                      <td className="py-5 px-6 font-bold font-mono text-slate-900 whitespace-nowrap">
                        {rec.amount}
                      </td>
                      <td className="py-5 px-6 font-bold font-mono text-emerald-600 whitespace-nowrap">
                        {rec.credits}
                      </td>
                      <td className="py-5 px-6 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          rec.status === '已支付'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-slate-100 text-slate-500 border border-slate-200/60'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrderDetail(rec);
                          }}
                          className="px-3.5 py-1.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                        >
                          详情
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rechargeOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                        暂无充值明细记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 5. PAGE: 交易记录 / 全部交易 (Screenshot 5: image_f39199d6.png) */}
      {/* ========================================================== */}
      {currentPage === 'consumption-records' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Main Card (Screenshot 5) */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 sm:p-9 space-y-6">
            {/* Header: 全部交易 (Left) + 开发票 (Right) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  全部交易
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  论文审校消费明细，消费订单可开具发票
                </p>
              </div>

              <button
                id="btn-goto-apply-invoice"
                type="button"
                onClick={() => pushPage('invoice-apply')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95 flex items-center gap-2 self-start sm:self-auto"
              >
                <FileText className="w-4 h-4" />
                <span>开发票</span>
              </button>
            </div>

            {/* Table (Screenshot 5) */}
            <div className="rounded-2xl border border-slate-200/80 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 text-xs sm:text-sm font-bold">
                  <tr>
                    <th className="py-4 px-6 font-bold">订单内容</th>
                    <th className="py-4 px-6 font-bold">交易时间</th>
                    <th className="py-4 px-6 font-bold">交易积分</th>
                    <th className="py-4 px-6 font-bold text-right sm:text-left">交易状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {consumptionOrders.map((rec) => (
                    <tr 
                      key={rec.orderNo} 
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrderDetail(rec)}
                    >
                      <td className="py-4 px-6 font-medium text-slate-800 max-w-md truncate">
                        {rec.paperTitle ? `《${rec.paperTitle}》` : rec.orderNo}
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-mono text-xs sm:text-sm whitespace-nowrap">
                        {rec.createTime}
                      </td>
                      <td className="py-4 px-6 font-bold font-mono text-slate-900 whitespace-nowrap">
                        {rec.credits}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap text-right sm:text-left">
                        <span className={`inline-flex items-center text-xs sm:text-sm font-medium ${
                          rec.status === '已支付' ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {consumptionOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                        暂无交易记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 6. PAGE: 开票申请 (invoice-apply)                           */}
      {/* ========================================================== */}
      {currentPage === 'invoice-apply' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200/80 pb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                增值税发票申请
              </h1>
              <p className="text-base text-slate-500 mt-1">
                消费订单支持合并开票，充值订单以积分呈现无法开票
              </p>
            </div>

            <button
              id="btn-goto-invoice-records"
              type="button"
              onClick={() => pushPage('invoice-records')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>查看开票申请记录</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Form Container */}
          <form onSubmit={handleSubmitInvoiceApplication} className="space-y-6">
            {/* Step 1: Select Orders */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-base font-bold text-slate-900">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                  <span>选择可开票消费订单</span>
                </div>
                <div className="text-sm text-slate-500">
                  已选 <strong className="text-blue-600 font-mono text-base">{selectedOrderNos.length}</strong> 笔，合计金额：
                  <strong className="text-rose-600 font-mono text-lg ml-1">¥{selectedInvoicableTotalAmount.toFixed(2)}</strong>
                </div>
              </div>

              {invoicableOrders.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-sm bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  暂无可开票消费订单。检测论文消费积分后将自动释放开票额度。
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200/80 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 text-xs font-bold">
                      <tr>
                        <th className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={selectedOrderNos.length === invoicableOrders.length && invoicableOrders.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrderNos(invoicableOrders.map(o => o.orderNo));
                              } else {
                                setSelectedOrderNos([]);
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-3.5 px-4">消费订单内容</th>
                        <th className="py-3.5 px-4">交易时间</th>
                        <th className="py-3.5 px-4">消费积分</th>
                        <th className="py-3.5 px-4 text-right">可开票金额</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {invoicableOrders.map(o => {
                        const isChecked = selectedOrderNos.includes(o.orderNo);
                        return (
                          <tr 
                            key={o.orderNo} 
                            onClick={() => {
                              setSelectedOrderNos(prev => 
                                prev.includes(o.orderNo) ? prev.filter(x => x !== o.orderNo) : [...prev, o.orderNo]
                              );
                            }}
                            className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${isChecked ? 'bg-blue-50/30' : ''}`}
                          >
                            <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedOrderNos(prev => [...prev, o.orderNo]);
                                  } else {
                                    setSelectedOrderNos(prev => prev.filter(x => x !== o.orderNo));
                                  }
                                }}
                                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-800 max-w-xs truncate">
                              {o.paperTitle ? `《${o.paperTitle}》` : o.orderNo}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                              {o.createTime}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                              {o.credits}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-blue-600 text-right whitespace-nowrap">
                              ¥{(o.invoiceableAmount ?? 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Step 2: Invoice Info Form */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 sm:p-8 space-y-6">
              <div className="flex items-center gap-2.5 text-base font-bold text-slate-900">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>填写发票抬头与接收信息</span>
              </div>

              {/* Title Type */}
              <div className="flex items-center gap-4">
                <label className="text-xs sm:text-sm font-semibold text-slate-600">抬头类型：</label>
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="titleType"
                      checked={applyForm.titleType === '企业'}
                      onChange={() => setApplyForm({ ...applyForm, titleType: '企业' })}
                      className="text-blue-600"
                    />
                    <span>企业 / 高校单位</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-800 cursor-pointer font-medium">
                    <input
                      type="radio"
                      name="titleType"
                      checked={applyForm.titleType === '个人'}
                      onChange={() => setApplyForm({ ...applyForm, titleType: '个人' })}
                      className="text-blue-600"
                    />
                    <span>个人</span>
                  </label>
                </div>
              </div>

              {/* Grid inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    发票抬头名称 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={applyForm.titleType === '企业' ? '如：武汉大学 或 某某网络技术有限公司' : '如：严志秀'}
                    value={applyForm.title}
                    onChange={(e) => setApplyForm({ ...applyForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {applyForm.titleType === '企业' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      统一社会信用代码 <span className="text-rose-500">* (18位)</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={18}
                      placeholder="如：91420100MA4KLLXXXX"
                      value={applyForm.taxNumber}
                      onChange={(e) => setApplyForm({ ...applyForm, taxNumber: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 uppercase transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    电子发票接收邮箱 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="如：student@whu.edu.cn"
                    value={applyForm.email}
                    onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    联系电话
                  </label>
                  <input
                    type="tel"
                    placeholder="如：13810248899"
                    value={applyForm.phone}
                    onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  发票项目：*信息技术服务*论文规范智能审校检测费（税率 6%）
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={popPage}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    id="btn-submit-invoice"
                    type="submit"
                    disabled={selectedOrderNos.length === 0}
                    className="px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>确认申请发票 (¥{selectedInvoicableTotalAmount.toFixed(2)})</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================== */}
      {/* 7. PAGE: 开票申请记录 / 发票台账 (invoice-records)          */}
      {/* ========================================================== */}
      {currentPage === 'invoice-records' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200/80 pb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                发票申请记录
              </h1>
              <p className="text-base text-slate-500 mt-1">
                实时追踪增值税电子发票审核、开具与下载全流转
              </p>
            </div>

            <button
              id="btn-goto-apply-new-invoice"
              type="button"
              onClick={() => pushPage('invoice-apply')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>申请新发票</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 text-xs sm:text-sm font-bold">
                  <tr>
                    <th className="py-4 px-6 font-bold">申请单号</th>
                    <th className="py-4 px-6 font-bold">发票抬头</th>
                    <th className="py-4 px-6 font-bold">申请金额</th>
                    <th className="py-4 px-6 font-bold">申请时间</th>
                    <th className="py-4 px-6 font-bold text-center">状态</th>
                    <th className="py-4 px-6 font-bold text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs sm:text-sm font-medium text-slate-800">
                        {inv.applicationNo}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-800 max-w-xs truncate">
                        {inv.title}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                        ¥{inv.amount.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-slate-500 font-mono text-xs sm:text-sm whitespace-nowrap">
                        {inv.applyTime}
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          inv.status === '已开票'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : inv.status === '待处理'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                            : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewInvoice(inv)}
                            className="px-3.5 py-1.5 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                          >
                            预览发票
                          </button>
                          {inv.status === '待处理' && (
                            <button
                              type="button"
                              onClick={() => handleRevokeInvoice(inv)}
                              className="px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                            >
                              撤销
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {invoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                        暂无开票申请记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 8. PAGE: 充值与退款规则 (rules-refund)                       */}
      {/* ========================================================== */}
      {currentPage === 'rules-refund' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
          <div className="border-b border-slate-200/80 pb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              充值与余额退款规则
            </h1>
            <p className="text-base text-slate-500 mt-1">
              保障用户合法资金安全，算法严格清结未消耗本金
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 sm:p-9 space-y-7">
            {/* Algorithm Box */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2.5 text-blue-900 font-bold text-base">
                <Calculator className="w-5 h-5 text-blue-600" />
                <span>余额退款结算公式</span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-blue-100 font-mono text-sm sm:text-base font-bold text-blue-800 shadow-2xs">
                可退款金额 =（剩下积分 - 赠送积分）÷ 100
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-xs sm:text-sm text-slate-700">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-slate-400 block text-xs">当前总积分</span>
                  <strong className="text-slate-900 font-mono text-lg mt-0.5 block">{(user.balance || 0).toLocaleString()}</strong>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-slate-400 block text-xs">活动赠送积分</span>
                  <strong className="text-emerald-600 font-mono text-lg mt-0.5 block">{(user.bonusCredits || 0).toLocaleString()}</strong>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
                  <span className="text-slate-400 block text-xs">核算可退本金</span>
                  <strong className="text-rose-600 font-mono text-lg mt-0.5 block">¥{refundableYuan.toFixed(2)}</strong>
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsBalanceRefundModalOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  申请账户余额全额清结退款
                </button>
              </div>
            </div>

            {/* Clauses */}
            <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
              <h3 className="font-bold text-slate-900 text-base">详细条款须知：</h3>
              <ul className="space-y-2.5 list-disc pl-5 text-slate-600">
                <li>充值余额中未消耗且未开具发票的本金部分，支持随时申请原路退款。</li>
                <li>系统通过活动或促销额外赠送的积分，仅用于平台内服务抵扣，不支持折现退款。</li>
                <li>已消耗用于论文规范/风险检测的积分，以及已开具发票对应的金额不支持退款。</li>
                <li>由于第三方支付渠道（微信支付/支付宝）风控限制，付款时间超过12个月的订单不支持原路退回，需人工银行转账。</li>
                <li>财务审核通过后，款项将在 5-7 个工作日内按原充值路径退回。</li>
                <li>退款成功后，对应账户的全部剩余积分（含赠送积分）将自动注销清零。</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 9. PAGE: 计费与使用说明 (rules-pricing)                     */}
      {/* ========================================================== */}
      {currentPage === 'rules-pricing' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
          <div className="border-b border-slate-200/80 pb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              计费与使用说明
            </h1>
            <p className="text-base text-slate-500 mt-1">
              公开透明的学术论文检测规范收费标准与计费细则
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-7 sm:p-9 space-y-7">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-center space-y-1.5">
                <div className="text-xs text-slate-500 font-bold">短稿尝鲜</div>
                <div className="text-2xl font-black font-mono text-slate-900">800 起</div>
                <div className="text-xs text-slate-400">万字以内单篇检测</div>
              </div>
              <div className="p-6 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-center space-y-1.5">
                <div className="text-xs text-blue-600 font-bold">标准毕业论文</div>
                <div className="text-2xl font-black font-mono text-blue-700">1,200 ~ 2,400</div>
                <div className="text-xs text-blue-500">本硕3~6万字常规论文</div>
              </div>
              <div className="p-6 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-center space-y-1.5">
                <div className="text-xs text-indigo-600 font-bold">硕博大论文/专著</div>
                <div className="text-2xl font-black font-mono text-indigo-700">1,600 / 万字</div>
                <div className="text-xs text-indigo-500">限时 8 折特惠活动</div>
              </div>
            </div>

            <div className="space-y-3.5 text-sm text-slate-600 leading-relaxed">
              <h3 className="font-bold text-slate-900 text-base">计费与扣减顺位说明：</h3>
              <p>1. 上传论文后，系统智能解析字符数、图表数与参考文献数，并在检测前明确提示本次扣除积分数，确认后扣款。</p>
              <p>2. 扣款优先扣除付费积分，若账户有活动赠送积分，系统将自动按配比抵扣。</p>
              <p>3. 每次检测生成的格式规范报告与内容合规报告支持反复查阅并终身导出 HTML 索引及 PDF。</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* FLOATING TOAST NOTIFICATION                                */}
      {/* ========================================================== */}
      {toastMsg && (
        <div 
          id="billing-center-toast"
          className="fixed bottom-8 right-8 z-50 bg-slate-900/95 backdrop-blur text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/80 animate-in fade-in slide-in-from-bottom-5 duration-200 max-w-md"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-xs sm:text-sm font-medium text-slate-100">
            {toastMsg}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: ORDER DETAIL (OrderDetailModal)                     */}
      {/* ========================================================== */}
      <OrderDetailModal
        order={selectedOrderDetail}
        isOpen={!!selectedOrderDetail}
        onClose={() => setSelectedOrderDetail(null)}
        onApplyInvoice={(order) => {
          setSelectedOrderDetail(null);
          setSelectedOrderNos([order.orderNo]);
          pushPage('invoice-apply');
        }}
      />

      {/* ========================================================== */}
      {/* MODAL: NATIONAL ELECTRONIC INVOICE PREVIEW                 */}
      {/* ========================================================== */}
      {previewInvoice && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
        />
      )}

      {/* ========================================================== */}
      {/* MODAL: ACCOUNT FULL BALANCE REFUND APPLICATION             */}
      {/* ========================================================== */}
      {isBalanceRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">申请账户余额退款</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBalanceRefundModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-1">
              <div className="text-xs text-blue-700 font-semibold">核算可退本金：</div>
              <div className="text-2xl font-black font-mono text-blue-950">
                ¥{refundableYuan.toFixed(2)}
              </div>
              <div className="text-[11px] text-blue-600">
                公式：(剩下总积分 {(user.balance || 0).toLocaleString()} - 赠送积分 {(user.bonusCredits || 0).toLocaleString()}) ÷ 100
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">退款原因</label>
                <select
                  value={balanceRefundReason}
                  onChange={(e) => setBalanceRefundReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                >
                  <option value="检测任务已完成/毕业答辩结束，申请清结账户余额">检测任务已完成/毕业答辩结束，申请清结账户余额</option>
                  <option value="多充值了额度，申请退回部分">多充值了额度，申请退回部分</option>
                  <option value="转为使用学校机构通道，不再需要个人自费额度">转为使用学校机构通道，不再需要个人自费额度</option>
                  <option value="其他原因">其他原因</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">补充说明 (选填)</label>
                <textarea
                  rows={2}
                  value={balanceRefundRemark}
                  onChange={(e) => setBalanceRefundRemark(e.target.value)}
                  placeholder="可填写银行卡号或特殊财务退款要求..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 resize-none"
                />
              </div>
            </div>

            <div className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200/80 leading-relaxed">
              ⚠️ 注意：退款审核通过后，款项将在5-7个工作日内原路退回，退款完成后账户剩余积分将全部作废清零。
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsBalanceRefundModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isSubmittingBalanceRefund || refundableYuan <= 0}
                onClick={handleSubmitBalanceRefund}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingBalanceRefund ? '正在提交...' : '确认申请退款'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
