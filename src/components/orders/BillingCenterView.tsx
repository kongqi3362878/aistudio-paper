import React, { useState, useMemo } from 'react';
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
  Calculator
} from 'lucide-react';
import { OrderRecord, PageKey, UserProfile, InvoiceRecord, InvoiceStatus, RefundAuditItem, BillingPolicyConfig } from '../../types';
import { initialBillingPolicy } from '../../data/billingPolicyData';
import InvoicePreviewModal from '../invoice/InvoicePreviewModal';
import OrderDetailModal from './OrderDetailModal';

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
  // Main Top-level Tabs: 账户概览 | 积分充值 | 交易记录 | 发票管理
  const [activeMainTab, setActiveMainTab] = useState<'overview' | 'recharge' | 'transactions' | 'invoices'>(initialTab);
  
  // Sub-tabs for 发票管理: 可开票订单 | 申请记录
  const [invoiceSubTab, setInvoiceSubTab] = useState<'orders' | 'history'>(initialInvoiceSubTab === 'history' ? 'history' : 'orders');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Filter & Search states
  const [orderTypeFilter, setOrderTypeFilter] = useState<'全部' | '充值订单' | '消费订单'>('全部');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'全部' | '已支付' | '待支付' | '已关闭'>('全部');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  
  // Selected orders for combined invoicing in "可开票订单"
  const [selectedOrderNos, setSelectedOrderNos] = useState<string[]>([]);

  // Selected Order for detail modal
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderRecord | null>(null);

  // Selected Invoice for national electronic invoice preview modal
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(null);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ==========================================
  // Account Balance Full Refund State & Handlers
  // 规则：可退款金额 =（剩下积分 - 赠送积分）÷ 100
  // ==========================================
  const [isBalanceRefundModalOpen, setIsBalanceRefundModalOpen] = useState(false);
  const [balanceRefundReason, setBalanceRefundReason] = useState('检测任务已完成/毕业答辩结束，申请清结账户余额');
  const [balanceRefundRemark, setBalanceRefundRemark] = useState('');
  const [isSubmittingBalanceRefund, setIsSubmittingBalanceRefund] = useState(false);

  const handleSubmitBalanceRefund = () => {
    setIsSubmittingBalanceRefund(true);
    setTimeout(() => {
      setIsSubmittingBalanceRefund(false);
      const paidCredits = user.paidCredits ?? 9000;
      const refundableYuan = parseFloat((paidCredits / (policy.baseCreditPerYuan || 100)).toFixed(2));

      const newAudit: RefundAuditItem = {
        id: `REF-${Date.now().toString().slice(-8)}`,
        orderNo: 'ACC-BALANCE-ALL',
        applicant: user.name || user.username || '当前用户',
        phone: user.phone || '13810248899',
        amount: refundableYuan,
        reason: `${balanceRefundReason}${balanceRefundRemark.trim() ? `（说明：${balanceRefundRemark.trim()}）` : ''}【算法结算：(剩下积分${user.balance} - 赠送积分${user.bonusCredits ?? 1800}) ÷ 100 = ¥${refundableYuan}】`,
        applyTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
        status: '待审核',
        invoiced: false,
        invoiceStatusDesc: '未申请发票',
      };

      if (onUpdateRefundAudits) {
        onUpdateRefundAudits([newAudit, ...(refundAudits || [])]);
      }

      showToast(`账户退款申请已提交！金额 ¥${refundableYuan.toFixed(2)}，财务审核通过后将原路返回，退款成功后剩余积分将全部作废清零。`);
      setIsBalanceRefundModalOpen(false);
    }, 450);
  };

  // ==========================================
  // Recharge Package selection state
  // ==========================================
  const rechargePackages = useMemo(() => {
    if (policy && policy.packages && policy.packages.length > 0) {
      return policy.packages.filter(p => p.enabled).map(p => ({
        id: p.id,
        amount: p.amount,
        paidCredits: p.paidCredits,
        bonusCredits: p.bonusCredits,
        totalCredits: p.totalCredits,
        credits: p.totalCredits,
        times: Math.floor(p.totalCredits / 100),
        label: p.label,
        bonus: p.bonusTag || `赠送${p.bonusCredits}积分 (比例 5:1)`,
        hot: !!p.popular,
      }));
    }
    return [
      { id: 1, amount: 50, paidCredits: 5000, bonusCredits: 1000, totalCredits: 6000, credits: 6000, times: 60, label: '单次轻量尝鲜', bonus: '赠1000积分 (20%)', hot: false },
      { id: 2, amount: 100, paidCredits: 10000, bonusCredits: 2000, totalCredits: 12000, credits: 12000, times: 120, label: '标准毕业答辩', bonus: '赠2000积分 · 官方力荐', hot: true },
      { id: 3, amount: 200, paidCredits: 20000, bonusCredits: 4000, totalCredits: 24000, credits: 24000, times: 240, label: '本硕学期畅享', bonus: '赠4000积分 · 性价比首选', hot: false },
      { id: 4, amount: 500, paidCredits: 50000, bonusCredits: 10000, totalCredits: 60000, credits: 60000, times: 600, label: '硕博科研高频', bonus: '赠10000积分 · 团队共享', hot: false },
    ];
  }, [policy]);

  const [selectedPkg, setSelectedPkg] = useState<number>(100);
  const [payChannel, setPayChannel] = useState<'wechat' | 'alipay'>('wechat');
  const [isPaying, setIsPaying] = useState(false);

  // ==========================================
  // Invoice Application Form State
  // ==========================================
  const [applyForm, setApplyForm] = useState({
    titleType: '企业' as '企业' | '个人',
    invoiceType: '增值税普通发票' as '增值税普通发票' | '增值税专用发票',
    title: '',
    taxNumber: '',
    bankName: '',
    bankAccount: '',
    address: '',
    phone: '',
    idCard: '',
    remark: '',
  });

  // Modal for modifying returned invoice
  const [modifyingInvoice, setModifyingInvoice] = useState<InvoiceRecord | null>(null);
  const [modifyForm, setModifyForm] = useState({
    title: '',
    taxNumber: '',
    bankName: '',
    bankAccount: '',
    address: '',
    phone: '',
    remark: '',
  });

  // Filter for invoice history tab
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'全部' | InvoiceStatus>('全部');
  const [historySearchQuery, setHistorySearchQuery] = useState('');

  // ==========================================
  // Derived Financial Calculations
  // ==========================================
  const paidOrders = useMemo(() => orders.filter(o => o.status === '已支付'), [orders]);

  const totalPaidAmount = useMemo(() => {
    return paidOrders.reduce((sum, o) => {
      const amt = o.numericAmount ?? (parseFloat(o.amount.replace(/[^0-9.]/g, '')) || 0);
      return sum + amt;
    }, 0);
  }, [paidOrders]);

  // Orders that can be invoiced: 消费订单可以开发票，充值订单无法开发票
  const invoicableOrders = useMemo(() => {
    return paidOrders.filter(o => {
      const isConsumption = o.type === '消费订单' || o.orderNo.startsWith('XF');
      const remainingInv = o.invoiceableAmount ?? 0;
      return isConsumption && remainingInv > 0 && (!o.invoicedStatus || o.invoicedStatus === '未开票' || o.invoicedStatus === '已退回');
    });
  }, [paidOrders]);

  const totalInvoicableAmount = useMemo(() => {
    return invoicableOrders.reduce((sum, o) => sum + (o.invoiceableAmount ?? 0), 0);
  }, [invoicableOrders]);

  const totalInvoicedAmount = useMemo(() => {
    return invoices
      .filter(inv => inv.status === '已开票')
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  const totalPendingInvoiceAmount = useMemo(() => {
    return invoices
      .filter(inv => inv.status === '待处理' || inv.status === '开票中')
      .reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  // Calculate selected orders total amount
  const selectedOrdersTotalAmount = useMemo(() => {
    return invoicableOrders
      .filter(o => selectedOrderNos.includes(o.orderNo))
      .reduce((sum, o) => sum + (o.invoiceableAmount ?? 0), 0);
  }, [invoicableOrders, selectedOrderNos]);

  // Filtered orders for Transactions Tab
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const isConsumption = o.type === '消费订单' || o.orderNo.startsWith('XF');
      const orderType = isConsumption ? '消费订单' : '充值订单';
      if (orderTypeFilter !== '全部' && orderType !== orderTypeFilter) return false;
      if (orderStatusFilter !== '全部' && o.status !== orderStatusFilter) return false;
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchNo = o.orderNo.toLowerCase().includes(q);
        const matchTx = (o.transactionId || '').toLowerCase().includes(q);
        const matchPaper = (o.paperTitle || '').toLowerCase().includes(q);
        if (!matchNo && !matchTx && !matchPaper) return false;
      }
      return true;
    });
  }, [orders, orderTypeFilter, orderStatusFilter, orderSearchQuery]);

  // ==========================================
  // Handlers
  // ==========================================

  // 1. Simulate Payment & Recharge (充值订单：以积分呈现，无法开发票)
  const handleExecuteRecharge = () => {
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      const pkg = rechargePackages.find(p => p.amount === selectedPkg) || rechargePackages[2];
      const newOrderNo = `CZ${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}${Date.now().toString().slice(-8)}`;
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

      const newOrder: OrderRecord = {
        orderNo: newOrderNo,
        createTime: timeStr,
        payTime: timeStr,
        transactionId: `420000${Date.now().toString().slice(-14)}`,
        type: '充值订单',
        amount: `¥${pkg.amount.toFixed(2)}`,
        numericAmount: pkg.amount,
        credits: `+${pkg.totalCredits.toLocaleString()} 积分`,
        paidCredits: pkg.paidCredits,
        bonusCredits: pkg.bonusCredits,
        channel: payChannel === 'wechat' ? '微信支付' : '支付宝',
        status: '已支付',
        invoicedStatus: '不可开票', // 充值订单无法开发票，消费时按消耗付费积分开票
        refundStatus: '无退款',
        refundAmount: 0,
        invoiceableAmount: 0,
      };

      onUpdateOrders([newOrder, ...orders]);
      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          balance: (user.balance || 0) + pkg.totalCredits,
          paidCredits: (user.paidCredits ?? 9000) + pkg.paidCredits,
          bonusCredits: (user.bonusCredits ?? 1800) + pkg.bonusCredits,
        });
      }
      showToast(`支付成功！已充值 ¥${pkg.amount}，到账 ${pkg.totalCredits.toLocaleString()} 积分（含 ${pkg.paidCredits.toLocaleString()} 付费 + ${pkg.bonusCredits.toLocaleString()} 赠送）`);
      setActiveMainTab('transactions');
    }, 800);
  };

  // 2. Select order to invoice and open Apply Modal
  const handleProceedToInvoiceForm = (orderNosToUse: string[]) => {
    let targetNos = orderNosToUse;
    if (targetNos.length === 0) {
      if (invoicableOrders.length > 0) {
        targetNos = [invoicableOrders[0].orderNo];
      } else {
        showToast('暂无可开票订单');
        return;
      }
    }
    setSelectedOrderNos(targetNos);
    setIsApplyModalOpen(true);
    // Pre-fill default title if empty
    if (!applyForm.title) {
      if (applyForm.titleType === '企业') {
        setApplyForm(prev => ({
          ...prev,
          title: user.role === '机构管理员' || user.role === '学院管理员' ? (user.institution || '武汉大学科技成果转化中心') : '北京智研启航科技有限公司',
          taxNumber: '91110108MA0192837X',
        }));
      } else {
        setApplyForm(prev => ({
          ...prev,
          title: user.name || user.username || '个人',
          phone: user.phone || '',
        }));
      }
    }
  };

  // 3. Submit invoice application
  const handleSubmitInvoiceApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOrderNos.length === 0) {
      showToast('未关联可开票订单，请从“可开票订单”列表中勾选');
      setIsApplyModalOpen(false);
      setInvoiceSubTab('orders');
      return;
    }
    if (!applyForm.title.trim()) {
      showToast(applyForm.titleType === '企业' ? '请填写企业发票抬头全称' : '请填写个人姓名发票抬头');
      return;
    }
    if (applyForm.titleType === '企业') {
      if (!applyForm.taxNumber.trim()) {
        showToast('企业开票必须填写18位统一社会信用代码/税号');
        return;
      }
      if (applyForm.taxNumber.trim().length !== 18) {
        showToast('统一社会信用代码格式有误，须为18位字符');
        return;
      }
      if (applyForm.invoiceType === '增值税专用发票') {
        if (!applyForm.bankName.trim() || !applyForm.bankAccount.trim()) {
          showToast('增值税专用发票必须填写开户银行和银行账号');
          return;
        }
        if (!applyForm.address.trim() || !applyForm.phone.trim()) {
          showToast('增值税专用发票必须填写企业注册地址和联系电话');
          return;
        }
      }
    }

    const totalAmt = selectedOrdersTotalAmount;
    const isSpecial = applyForm.titleType === '企业' && applyForm.invoiceType === '增值税专用发票';
    const taxRate = isSpecial ? 0.06 : applyForm.titleType === '个人' ? 0.01 : 0.06;
    const amountWithoutTax = parseFloat((totalAmt / (1 + taxRate)).toFixed(2));
    const taxAmount = parseFloat((totalAmt - amountWithoutTax).toFixed(2));
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const newId = `INV-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Date.now().toString().slice(-4)}`;
    const newAppNo = `APP-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Date.now().toString().slice(-3)}`;

    const newInvoice: InvoiceRecord = {
      id: newId,
      applicationNo: newAppNo,
      orderNos: [...selectedOrderNos],
      amount: totalAmt,
      invoiceType: applyForm.titleType === '个人' ? '增值税普通发票' : applyForm.invoiceType,
      titleType: applyForm.titleType,
      title: applyForm.title.trim(),
      taxNumber: applyForm.titleType === '企业' && applyForm.taxNumber.trim() ? applyForm.taxNumber.trim() : undefined,
      bankName: applyForm.bankName.trim() || undefined,
      bankAccount: applyForm.bankAccount.trim() || undefined,
      address: applyForm.address.trim() || undefined,
      phone: applyForm.phone.trim() || undefined,
      idCard: applyForm.idCard.trim() || undefined,
      goodsName: '*信息技术服务*论文规范性检测服务',
      taxRate,
      taxAmount,
      amountWithoutTax,
      remark: applyForm.remark.trim() || `关联充值订单 ${selectedOrderNos.join(', ')}`,
      status: '待处理',
      applyTime: timeStr,
      applicantName: user.username || '当前用户',
      applicantPhone: user.phone || '138****1024',
    };

    // Update associated orders to '待审核'
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
    setIsApplyModalOpen(false);
    showToast('发票申请提交成功！已进入【申请记录】流转台账，财务处理后将生成发票原件');
    setInvoiceSubTab('history');
  };

  // 4. Revoke pending invoice application (待处理 -> 已关闭)
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

  // 5. Open modify modal for returned invoice (已退回)
  const handleOpenModifyModal = (inv: InvoiceRecord) => {
    setModifyingInvoice(inv);
    setModifyForm({
      title: inv.title,
      taxNumber: inv.taxNumber || '',
      bankName: inv.bankName || '',
      bankAccount: inv.bankAccount || '',
      address: inv.address || '',
      phone: inv.phone || '',
      remark: inv.remark || '',
    });
  };

  // 6. Submit modification for returned invoice (已退回 -> 待处理)
  const handleConfirmModifyAndResubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyingInvoice) return;
    if (!modifyForm.title.trim()) {
      showToast('发票抬头名称不能为空');
      return;
    }
    if (modifyingInvoice.titleType === '企业' && (!modifyForm.taxNumber.trim() || modifyForm.taxNumber.trim().length !== 18)) {
      showToast('企业统一社会信用代码必须为18位字符，请核实后重提');
      return;
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const updatedInvoices = invoices.map(i => {
      if (i.id === modifyingInvoice.id) {
        return {
          ...i,
          title: modifyForm.title.trim(),
          taxNumber: modifyingInvoice.titleType === '企业' ? modifyForm.taxNumber.trim() : undefined,
          bankName: modifyForm.bankName.trim() || undefined,
          bankAccount: modifyForm.bankAccount.trim() || undefined,
          address: modifyForm.address.trim() || undefined,
          phone: modifyForm.phone.trim() || undefined,
          remark: modifyForm.remark.trim(),
          status: '待处理' as InvoiceStatus,
          applyTime: `${timeStr} (用户已修改重提)`,
          rejectReason: undefined,
        };
      }
      return i;
    });

    onUpdateInvoices(updatedInvoices);
    setModifyingInvoice(null);
    showToast('发票信息已修改并重新提交审核！状态已转为【待处理】');
  };

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#F0F7FF] -m-5 sm:-m-7 lg:-m-10 xl:-m-12 p-5 sm:p-7 lg:p-10 xl:p-12 font-sans transition-colors">
      <div className="space-y-8 w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto pb-16">
        
        {/* Toast popup */}
        {toastMsg && (
          <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 text-sm font-medium">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ========================================================== */}
        {/* 1. Header with Title & Top Navigation Tabs                 */}
        {/* ========================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-sky-200/60 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              费用中心
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              统一管理账户检测资产、额度充值订单、交易流水明细与增值税发票全流程流转
            </p>
          </div>

          {/* 4 Main Tabs: 账户概览 / 积分充值 / 交易记录 / 发票管理 */}
          <div className="flex items-center gap-1.5 p-1.5 bg-blue-100/60 rounded-2xl border border-blue-200/60 self-start lg:self-auto overflow-x-auto max-w-full">
            {[
              { id: 'overview' as const, label: '账户概览', icon: Wallet },
              { id: 'recharge' as const, label: '积分充值', icon: Coins },
              { id: 'transactions' as const, label: '交易记录', icon: CreditCard },
              { id: 'invoices' as const, label: '发票管理', icon: FileText },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeMainTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-xs shadow-blue-100'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================== */}
        {/* 2. TAB 1: 账户概览 (Account Overview)                       */}
        {/* ========================================================== */}
        {activeMainTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top 4 Financial Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Balance / Credits */}
              <div className="bg-gradient-to-br from-blue-600 via-sky-600 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-600/15 space-y-3">
                <div className="flex items-center justify-between text-blue-100 text-xs font-bold">
                  <span>当前账户可用检测额度</span>
                  <Coins className="w-5 h-5 text-blue-200" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-black font-mono">
                    {(user.balance || 0).toLocaleString()}{' '}
                    <span className="text-xs font-normal text-blue-100">积分</span>
                  </div>
                  <div className="text-xs text-blue-100 flex items-center justify-between pt-1">
                    <span>• 付费: <strong className="text-white font-mono font-bold">{(user.paidCredits ?? 9000).toLocaleString()}</strong> 分</span>
                    <span>• 赠送: <strong className="text-emerald-200 font-mono font-bold">{(user.bonusCredits ?? 1800).toLocaleString()}</strong> 分</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/20 flex items-center justify-between">
                  <button
                    onClick={() => setActiveMainTab('recharge')}
                    className="px-3 py-1.5 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>立即充值</span>
                  </button>
                  <button
                    onClick={() => setIsBalanceRefundModalOpen(true)}
                    className="text-[11px] text-blue-100 hover:text-white underline cursor-pointer"
                  >
                    申请余额退款
                  </button>
                </div>
              </div>

              {/* Card 2: Total Spent Amount */}
              <div className="bg-white rounded-3xl p-6 border border-sky-100/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>累计支付充值总额</span>
                  <Wallet className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                    ¥{totalPaidAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400">
                    全周期累计共 {paidOrders.length} 笔已完成付款订单
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
                  <span>微信/支付宝聚合通道</span>
                  <span className="font-bold text-emerald-600">已对账</span>
                </div>
              </div>

              {/* Card 3: Available Invoice Amount */}
              <div className="bg-white rounded-3xl p-6 border border-sky-100/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>当前可开票总额</span>
                  <Receipt className="w-5 h-5 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-amber-500 font-mono">
                    ¥{totalInvoicableAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400">
                    共 {invoicableOrders.length} 笔订单可勾选开具增值税发票
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveMainTab('invoices');
                      setInvoiceSubTab('orders');
                    }}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>去开票</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-slate-400">支持合并多单</span>
                </div>
              </div>

              {/* Card 4: Invoiced Amount */}
              <div className="bg-white rounded-3xl p-6 border border-sky-100/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>累计已开票总额</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-mono">
                    ¥{totalInvoicedAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {totalPendingInvoiceAmount > 0 ? `另有 ¥${totalPendingInvoiceAmount.toFixed(2)} 审核开票中` : '全部开票申请均已办结'}
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setActiveMainTab('invoices');
                      setInvoiceSubTab('history');
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>查看申请记录</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-slate-400">电子发票</span>
                </div>
              </div>
            </div>

            {/* Account Bonus & Refund Explanation Banner */}
            <div className="bg-white rounded-3xl p-6 border border-sky-200/80 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-base">账户积分构成、扣费拆分与退款开票说明</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                        固定比例 5:1 模式
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 font-medium mt-1">
                      “您的账户包含赠送积分，系统已为您按比例自动抵扣。仅按实际消耗的付费金额开具发票。”
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsBalanceRefundModalOpen(true)}
                    className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>申请账户余额退款 (可退 ¥{(((user.paidCredits ?? 9000)/100)).toFixed(2)})</span>
                  </button>
                </div>
              </div>

              {/* 3-Part Lifecycle Breakdown: 到账拆分 -> 扣费拆分 -> 退款公式 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-slate-400 font-bold text-[11px]">当前账户积分拆分</div>
                  <div className="font-mono text-slate-900 font-black text-sm">
                    {(user.balance || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">总积分</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div>• 付费积分：<strong className="text-blue-700 font-mono">{(user.paidCredits ?? 9000).toLocaleString()}</strong> 分 (价值 ¥{(((user.paidCredits ?? 9000)/100)).toFixed(2)})</div>
                    <div>• 赠送积分：<strong className="text-emerald-700 font-mono">{(user.bonusCredits ?? 1800).toLocaleString()}</strong> 分 (价值 ¥{(((user.bonusCredits ?? 1800)/100)).toFixed(2)})</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-slate-400 font-bold text-[11px]">累计消费内部拆分 (按 5:1)</div>
                  <div className="font-mono text-slate-900 font-black text-sm">
                    {(user.usedBalance || 1200).toLocaleString()} <span className="text-xs font-normal text-slate-500">消耗总分</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div>• 扣除付费积分：<strong className="text-blue-700 font-mono">{(user.usedPaidCredits ?? 1000).toLocaleString()}</strong> 分 (价值 ¥{(((user.usedPaidCredits ?? 1000)/100)).toFixed(2)})</div>
                    <div>• 扣除赠送积分：<strong className="text-emerald-700 font-mono">{(user.usedBonusCredits ?? 200).toLocaleString()}</strong> 分 (价值 ¥{(((user.usedBonusCredits ?? 200)/100)).toFixed(2)})</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="text-slate-400 font-bold text-[11px]">退款结算公式</div>
                  <div className="font-mono text-slate-900 font-black text-sm text-rose-700">
                    可退金额 =（剩下积分 - 赠送积分）÷ 100
                  </div>
                  <div className="text-[11px] text-slate-600 leading-relaxed">
                    ({(user.balance || 0).toLocaleString()} - {(user.bonusCredits ?? 1800).toLocaleString()}) ÷ 100 = <strong className="text-rose-700 font-mono font-bold">¥{(((user.paidCredits ?? 9000)/100)).toFixed(2)}</strong>。退款后赠送积分全部清零。
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Invoice Action Banner */}
            <div className="bg-gradient-to-r from-sky-100/90 via-blue-50 to-indigo-100/70 rounded-3xl p-6 sm:p-8 text-slate-800 border border-sky-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  随时申请电子普通发票与增值税专用发票
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  遵循国家税务规定，仅按实际消耗的付费金额合规开具发票；充值订单为预收积分无法直接开具发票，论文检测消费时自动生成可开票额度。支持多笔消费订单批量合并开票，支持企业/个人抬头。
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    setActiveMainTab('invoices');
                    setInvoiceSubTab('orders');
                  }}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <span>立即去开票 ({invoicableOrders.length}笔订单)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setActiveMainTab('invoices');
                    setInvoiceSubTab('history');
                  }}
                  className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 shadow-2xs transition-all cursor-pointer"
                >
                  查看申请记录
                </button>
              </div>
            </div>

          {/* Recent Orders Overview */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">近期充值与交易订单</h4>
                <p className="text-xs text-slate-400">展示最近提交的支付与消费记录</p>
              </div>
              <button
                onClick={() => setActiveMainTab('transactions')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                <span>查看全部订单 ({orders.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {orders.slice(0, 4).map(o => (
                <div key={o.orderNo} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0 font-mono">
                      ¥
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 font-mono">{o.orderNo}</div>
                      <div className="text-[11px] text-slate-400">{o.createTime} · {o.channel}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <div className="font-black text-slate-900 text-sm font-mono">{o.amount}</div>
                      <div className="text-[11px] text-indigo-600 font-bold">{o.credits}</div>
                    </div>
                    <div className="shrink-0">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        o.status === '已支付' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="shrink-0">
                      <button
                        onClick={() => setSelectedOrderDetail(o)}
                        className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold cursor-pointer"
                      >
                        详情
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 3. TAB 2: 积分充值 (Recharge Package Selection)            */}
      {/* ========================================================== */}
      {activeMainTab === 'recharge' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                充值检测积分与额度包
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                选择适合您的充值套餐，支付完成后自动即时到账，并开通全流程合规增值税发票申请服务。
              </p>
            </div>

            {/* Packages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {rechargePackages.map(pkg => {
                const isSelected = selectedPkg === pkg.amount;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg.amount)}
                    className={`relative rounded-3xl p-6 border-2 transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-md shadow-indigo-600/10'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {pkg.hot && (
                      <span className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black shadow-xs">
                        人气爆款推荐
                      </span>
                    )}

                    <div>
                      <div className="text-xs font-bold text-slate-500">{pkg.label}</div>
                      <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono mt-2">
                        ¥{pkg.amount}
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="text-sm font-bold text-indigo-600 font-mono">
                          {pkg.credits.toLocaleString()} 点积分
                        </div>
                        <div className="text-xs text-slate-500">
                          约 <strong className="text-slate-800">{pkg.times}</strong> 次长篇规范检测
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold">
                        {pkg.bonus}
                      </span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Channel Selection */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs sm:text-sm font-bold text-slate-700 block">
                选择支付方式
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setPayChannel('wechat')}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all cursor-pointer ${
                    payChannel === 'wechat' ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                    微
                  </div>
                  <span>微信安全支付</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayChannel('alipay')}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl border-2 transition-all cursor-pointer ${
                    payChannel === 'alipay' ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                    支
                  </div>
                  <span>支付宝安全支付</span>
                </button>
              </div>
            </div>

            {/* Pay Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 bg-slate-50/60 p-4 rounded-2xl">
              <div className="text-xs text-slate-500">
                <span>实付金额：</span>
                <span className="text-2xl font-black text-slate-900 font-mono ml-1">
                  ¥{selectedPkg.toFixed(2)}
                </span>
                <span className="ml-3 text-slate-400">支付成功后立即生成可开票订单</span>
              </div>

              <button
                onClick={handleExecuteRecharge}
                disabled={isPaying}
                className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isPaying ? <RotateCw className="w-4 h-4 animate-spin" /> : <LockIcon className="w-4 h-4" />}
                <span>{isPaying ? '正在模拟拉起收银台...' : `立即安全支付 ¥${selectedPkg}`}</span>
              </button>
            </div>

            {/* Breakdown & Terms in Recharge Tab */}
            {(() => {
              const currentPkg = rechargePackages.find(p => p.amount === selectedPkg) || rechargePackages[1] || rechargePackages[0];
              return (
                <div className="p-6 rounded-3xl bg-blue-50/60 border border-blue-200/80 space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                        <Gift className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-blue-950 text-sm">
                        所选档位到账拆分明细（比例 5:1 · 充 {currentPkg.amount} 送 {(currentPkg.amount * 0.2).toFixed(0)} 元）
                      </span>
                    </div>
                    <span className="text-blue-700 font-bold font-mono">
                      实付 ¥{currentPkg.amount.toFixed(2)} → 到账 {currentPkg.totalCredits.toLocaleString()} 积分
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-white border border-blue-100">
                      <span className="text-slate-500 block">付费本金积分：</span>
                      <span className="font-mono font-black text-slate-900 text-sm">
                        {currentPkg.paidCredits.toLocaleString()} 分
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">价值 ¥{currentPkg.amount.toFixed(2)}，支持退款及开具发票基准</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-blue-100">
                      <span className="text-slate-500 block">系统赠送积分 (20%)：</span>
                      <span className="font-mono font-black text-emerald-600 text-sm">
                        +{currentPkg.bonusCredits.toLocaleString()} 分
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">按 5:1 扣费抵扣，不折现退款、不开发票</span>
                    </div>
                  </div>

                  {/* 6 Rules */}
                  <div className="pt-3 border-t border-blue-200/60 space-y-2">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>《用户充值提示与退款须知》</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-600 leading-relaxed">
                      {(policy.noticeTerms || initialBillingPolicy.noticeTerms).map((term, i) => (
                        <div key={i} className="flex items-start gap-1.5 bg-white/70 p-2.5 rounded-xl border border-blue-100/70">
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold shrink-0 flex items-center justify-center text-[10px]">
                            {i + 1}
                          </span>
                          <span>{term}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 4. TAB 3: 交易记录 (Transaction Records)                    */}
      {/* ========================================================== */}
      {activeMainTab === 'transactions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Filter Bar */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="搜索订单号 / 论文名称..."
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Order Type Filter: 全部类型 | 充值订单 | 消费订单 */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                {(['全部', '充值订单', '消费订单'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setOrderTypeFilter(t)}
                    className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                      orderTypeFilter === t ? 'bg-white text-indigo-600 shadow-2xs' : 'hover:text-slate-900'
                    }`}
                  >
                    {t === '全部' ? '全部类型' : t}
                  </button>
                ))}
              </div>

              {/* Order Status Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                {(['全部', '已支付', '待支付', '已关闭'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
                      orderStatusFilter === st ? 'bg-white text-indigo-600 shadow-2xs' : 'hover:text-slate-900'
                    }`}
                  >
                    {st === '全部' ? '全部状态' : st}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400">
              共筛选出 <strong className="text-slate-800">{filteredOrders.length}</strong> 笔订单记录
            </div>
          </div>

          {/* Policy Rule Banner for Transaction Types */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-950">
            <div className="flex items-start sm:items-center gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
              <div className="leading-relaxed">
                <span className="font-bold">平台订单状态与开票规则：</span>
                交易记录包含<strong className="text-blue-700">【充值订单】</strong>与<strong className="text-purple-700">【消费订单】</strong>两种类型。充值后以到账积分呈现（含赠送积分），因未发生具体检测服务，<strong className="text-slate-900">充值订单无法开具发票</strong>；进行论文检测时扣除积分生成消费订单，系统按实际消耗的付费金额<strong className="text-amber-700">开具发票</strong>。
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-4 px-5">订单类型</th>
                    <th className="py-4 px-4">订单号</th>
                    <th className="py-4 px-4">业务内容 / 关联论文</th>
                    <th className="py-4 px-4">交易时间</th>
                    <th className="py-4 px-4">支付渠道</th>
                    <th className="py-4 px-4">金额</th>
                    <th className="py-4 px-4">积分变动</th>
                    <th className="py-4 px-4 text-center">状态</th>
                    <th className="py-4 px-4 font-bold">可开票金额</th>
                    <th className="py-4 px-4">发票状态</th>
                    <th className="py-4 px-6 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        暂无符合条件的交易记录
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => {
                      const isConsumption = order.type === '消费订单' || order.orderNo.startsWith('XF');
                      const rawAmt = parseFloat(order.amount.replace(/[^0-9.]/g, '')) || 0;
                      const invAmt = order.invoiceableAmount !== undefined 
                        ? order.invoiceableAmount 
                        : (isConsumption && order.status === '已支付' ? rawAmt : 0);
                      const canInv = isConsumption && order.status === '已支付' && invAmt > 0 && (!order.invoicedStatus || order.invoicedStatus === '未开票' || order.invoicedStatus === '已退回');

                      return (
                        <tr key={order.orderNo} className="hover:bg-slate-50/60 transition-colors">
                          {/* 1. 订单类型 */}
                          <td className="py-4 px-5">
                            {isConsumption ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200/70">
                                <Sparkles className="w-3 h-3 text-purple-600" />
                                消费订单
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/70">
                                <Plus className="w-3 h-3 text-blue-600" />
                                充值订单
                              </span>
                            )}
                          </td>

                          {/* 2. 订单号 */}
                          <td className="py-4 px-4 font-mono font-bold text-slate-900 text-xs">
                            {order.orderNo}
                          </td>

                          {/* 3. 业务内容 / 关联论文 */}
                          <td className="py-4 px-4 max-w-xs">
                            {isConsumption ? (
                              <div className="truncate font-medium text-slate-800 text-xs" title={order.paperTitle || '论文规范性与学术风险检测'}>
                                {order.paperTitle ? `《${order.paperTitle}》` : '论文规范性检测'}
                              </div>
                            ) : (
                              <div className="text-slate-600 text-xs font-medium">
                                积分充值（到账 {order.credits}）
                              </div>
                            )}
                          </td>

                          {/* 4. 交易时间 */}
                          <td className="py-4 px-4 font-mono text-slate-500 text-xs whitespace-nowrap">
                            {order.createTime}
                          </td>

                          {/* 5. 渠道 */}
                          <td className="py-4 px-4 text-slate-700 font-medium whitespace-nowrap">
                            {order.channel}
                          </td>

                          {/* 6. 金额 */}
                          <td className="py-4 px-4 font-black font-mono text-slate-900 whitespace-nowrap">
                            {order.amount}
                          </td>

                          {/* 7. 积分变动 (充值以积分呈现，消费以负分扣除呈现) */}
                          <td className="py-4 px-4 font-mono font-bold whitespace-nowrap">
                            {isConsumption ? (
                              <span className="text-rose-600 font-black">
                                {order.credits.startsWith('-') ? order.credits : `-${order.credits}`}
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-black">
                                {order.credits.startsWith('+') ? order.credits : `+${order.credits}`}
                              </span>
                            )}
                          </td>

                          {/* 8. 状态 */}
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              order.status === '已支付' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {order.status}
                            </span>
                          </td>

                          {/* 9. 可开票金额 (充值订单无法开发票，消费订单可开发票) */}
                          <td className="py-4 px-4 font-mono font-bold whitespace-nowrap">
                            {!isConsumption ? (
                              <span className="text-slate-400 text-xs" title="充值订单无法开发票，消费时按消耗付费金额开票">
                                ¥0.00
                              </span>
                            ) : (
                              <span className="text-amber-600 font-black text-sm">
                                ¥{invAmt.toFixed(2)}
                              </span>
                            )}
                          </td>

                          {/* 10. 开票状态 */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {!isConsumption ? (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-xs font-medium" title="充值订单无法开发票">
                                不可开票
                              </span>
                            ) : (
                              <>
                                {order.invoicedStatus === '已开票' && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                    已开票
                                  </span>
                                )}
                                {order.invoicedStatus === '待审核' && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                                    审核中
                                  </span>
                                )}
                                {order.invoicedStatus === '已退回' && (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                                    已退回
                                  </span>
                                )}
                                {(!order.invoicedStatus || order.invoicedStatus === '未开票') && (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                    未开票
                                  </span>
                                )}
                              </>
                            )}
                          </td>

                          {/* 11. 操作 (取消针对订单号的退款功能，仅保留开票与详情) */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* 消费订单开票操作 */}
                              {canInv && (
                                <button
                                  onClick={() => {
                                    setActiveMainTab('invoices');
                                    handleProceedToInvoiceForm([order.orderNo]);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                                >
                                  申请开票
                                </button>
                              )}

                              {isConsumption && order.invoicedStatus === '已开票' && (
                                <button
                                  onClick={() => {
                                    const matchedInv = invoices.find(inv => inv.orderNos.includes(order.orderNo) || inv.id === order.invoiceId);
                                    if (matchedInv) {
                                      setPreviewInvoice(matchedInv);
                                    } else {
                                      setActiveMainTab('invoices');
                                      setInvoiceSubTab('history');
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                                >
                                  查看发票
                                </button>
                              )}

                              {/* 详情操作 */}
                              <button
                                onClick={() => setSelectedOrderDetail(order)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold cursor-pointer"
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
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 5. TAB 4: 发票管理 (Invoice Management - 2 Subtabs)        */}
      {/* ========================================================== */}
      {activeMainTab === 'invoices' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Subtab Navigation Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-3xl border border-sky-100 shadow-xs">
            <div className="flex items-center gap-2 overflow-x-auto">
              {[
                { id: 'orders' as const, label: '可开票订单', count: invoicableOrders.length },
                { id: 'history' as const, label: '申请记录', count: invoices.length },
              ].map(sub => {
                const isActive = invoiceSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setInvoiceSubTab(sub.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span>{sub.label}</span>
                    {sub.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sub.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-medium px-2">
              可开票余额：<strong className="text-amber-600 font-mono text-sm">¥{totalInvoicableAmount.toFixed(2)}</strong>
            </div>
          </div>

          {/* -------------------------------------------------------- */}
          {/* 5.1 Subtab: 可开票订单 (Invoicable Orders)              */}
          {/* -------------------------------------------------------- */}
          {invoiceSubTab === 'orders' && (
            <div className="space-y-6">
              {/* Mandatory Invoice Notice Banner */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs flex items-center gap-3 text-amber-900 shadow-2xs">
                <Info className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="font-bold leading-relaxed">
                  “您的账户包含赠送积分，系统已为您按比例自动抵扣。仅按实际消耗的付费金额开具发票。”
                </span>
              </div>

              {/* Batch Selection Banner */}
              <div className="bg-sky-50/80 p-4 sm:p-5 rounded-3xl border border-sky-200/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      支持勾选单笔或多笔订单合并开票
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      已选择 <strong className="text-blue-600 font-bold">{selectedOrderNos.length}</strong> 笔订单，合计可开票金额：
                      <strong className="text-amber-600 font-mono font-bold text-sm ml-1">
                        ¥{selectedOrdersTotalAmount.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-auto">
                  <button
                    onClick={() => {
                      if (selectedOrderNos.length === invoicableOrders.map(o => o.orderNo).length) {
                        setSelectedOrderNos([]);
                      } else {
                        setSelectedOrderNos(invoicableOrders.map(o => o.orderNo));
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer transition-colors"
                  >
                    {selectedOrderNos.length === invoicableOrders.length && invoicableOrders.length > 0 ? '取消全选' : '全部全选'}
                  </button>

                  <button
                    onClick={() => handleProceedToInvoiceForm(selectedOrderNos)}
                    disabled={selectedOrderNos.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>申请开票 ({selectedOrderNos.length}笔)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-4 px-4 w-12 text-center">
                          <input
                            type="checkbox"
                            checked={invoicableOrders.length > 0 && selectedOrderNos.length === invoicableOrders.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrderNos(invoicableOrders.map(o => o.orderNo));
                              } else {
                                setSelectedOrderNos([]);
                              }
                            }}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </th>
                        <th className="py-4 px-4">消费订单号</th>
                        <th className="py-4 px-4">关联检测论文</th>
                        <th className="py-4 px-4">检测时间</th>
                        <th className="py-4 px-4">消耗积分</th>
                        <th className="py-4 px-4">可开票金额</th>
                        <th className="py-4 px-4 text-center">状态</th>
                        <th className="py-4 px-6 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoicableOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-16 text-center text-slate-400">
                            暂无可开票的检测消费订单。论文检测消耗积分后，系统将自动按扣除的“付费积分”生成可开票订单。
                          </td>
                        </tr>
                      ) : (
                        invoicableOrders.map(order => {
                          const isChecked = selectedOrderNos.includes(order.orderNo);
                          const invAmt = order.invoiceableAmount ?? 0;

                          return (
                            <tr key={order.orderNo} className={`hover:bg-slate-50/60 transition-colors ${isChecked ? 'bg-blue-50/30' : ''}`}>
                              <td className="py-4 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedOrderNos(prev => [...prev, order.orderNo]);
                                    } else {
                                      setSelectedOrderNos(prev => prev.filter(no => no !== order.orderNo));
                                    }
                                  }}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              </td>
                              <td className="py-4 px-4 font-mono font-bold text-slate-900">
                                {order.orderNo}
                              </td>
                              <td className="py-4 px-4 max-w-xs">
                                <div className="truncate font-medium text-slate-800 text-xs" title={order.paperTitle || '论文规范性检测'}>
                                  {order.paperTitle ? `《${order.paperTitle}》` : '论文规范性检测'}
                                </div>
                              </td>
                              <td className="py-4 px-4 font-mono text-slate-500 text-xs whitespace-nowrap">
                                {order.payTime || order.createTime}
                              </td>
                              <td className="py-4 px-4 font-mono font-bold text-rose-600 whitespace-nowrap">
                                {order.credits}
                              </td>
                              <td className="py-4 px-4 font-mono font-black text-amber-600 text-sm whitespace-nowrap">
                                ¥{invAmt.toFixed(2)}
                              </td>
                              <td className="py-4 px-4 text-center whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  可开票
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right whitespace-nowrap">
                                <button
                                  onClick={() => handleProceedToInvoiceForm([order.orderNo])}
                                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                                >
                                  申请开票
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}



          {/* -------------------------------------------------------- */}
          {/* 5.3 Subtab: 申请记录 (Application History)               */}
          {/* -------------------------------------------------------- */}
          {invoiceSubTab === 'history' && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder="搜索发票抬头、申请单号..."
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl font-bold text-slate-600">
                    {(['全部', '待处理', '开票中', '已开票', '已退回', '已关闭'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => setHistoryStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                          historyStatusFilter === st ? 'bg-white text-indigo-600 shadow-2xs' : 'hover:text-slate-900'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-slate-400 font-medium">
                  共找到 <strong className="text-slate-800">{invoices.length}</strong> 笔开票申请
                </div>
              </div>

              {/* History Table */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-4 px-6">申请单号</th>
                        <th className="py-4 px-4">发票抬头</th>
                        <th className="py-4 px-4">发票种类</th>
                        <th className="py-4 px-4">开票金额</th>
                        <th className="py-4 px-4">申请时间</th>
                        <th className="py-4 px-4">流转状态</th>
                        <th className="py-4 px-6 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoices
                        .filter(i => {
                          if (historyStatusFilter !== '全部' && i.status !== historyStatusFilter) return false;
                          if (historySearchQuery && !i.title.includes(historySearchQuery) && !i.applicationNo.includes(historySearchQuery) && !i.id.includes(historySearchQuery)) return false;
                          return true;
                        })
                        .map(inv => {
                          return (
                            <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-4 px-6">
                                <div className="font-mono font-bold text-slate-900">{inv.applicationNo}</div>
                                <div className="text-[11px] text-slate-400 font-mono">订单: {inv.orderNos.join(', ')}</div>
                              </td>

                              <td className="py-4 px-4">
                                <div className="font-bold text-slate-900">{inv.title}</div>
                                {inv.taxNumber && (
                                  <div className="text-[11px] text-slate-400 font-mono">{inv.taxNumber}</div>
                                )}
                              </td>

                              <td className="py-4 px-4">
                                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                                  inv.invoiceType === '增值税专用发票' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {inv.invoiceType}
                                </span>
                              </td>

                              <td className="py-4 px-4 font-mono font-black text-slate-900">
                                ¥{inv.amount.toFixed(2)}
                              </td>

                              <td className="py-4 px-4 font-mono text-slate-500 text-xs">
                                {inv.applyTime}
                              </td>

                              <td className="py-4 px-4">
                                <div className="space-y-1">
                                  {inv.status === '待处理' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                                      <Clock className="w-3 h-3 text-amber-600" />
                                      待处理 (等待审核)
                                    </span>
                                  )}
                                  {inv.status === '开票中' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                                      <RotateCw className="w-3 h-3 text-blue-600 animate-spin" />
                                      开票中 (财务开具中)
                                    </span>
                                  )}
                                  {inv.status === '已开票' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      已开票 (可下载)
                                    </span>
                                  )}
                                  {inv.status === '已退回' && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                                      <AlertCircle className="w-3 h-3 text-rose-600" />
                                      退回补充
                                    </span>
                                  )}
                                  {inv.status === '已关闭' && (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-xs font-medium">
                                      已关闭
                                    </span>
                                  )}

                                  {inv.rejectReason && (
                                    <div className="text-[11px] text-rose-600 max-w-xs leading-tight">
                                      退回原因：{inv.rejectReason}
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                  {/* Actions based on state */}
                                  {inv.status === '已退回' && (
                                    <button
                                      onClick={() => handleOpenModifyModal(inv)}
                                      className="px-3 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                                    >
                                      修改并重新提交
                                    </button>
                                  )}

                                  {inv.status === '待处理' && (
                                    <button
                                      onClick={() => handleRevokeInvoice(inv)}
                                      className="px-2.5 py-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                                    >
                                      撤销申请
                                    </button>
                                  )}

                                  {inv.status === '已开票' && (
                                    <button
                                      onClick={() => setPreviewInvoice(inv)}
                                      className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-100 flex items-center gap-1 transition-all cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span>查看/下载</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


        </div>
      )}

      {/* ========================================================== */}
      {/* 6. MODAL: 修改已退回申请并重新提交 (已退回 -> 待处理)          */}
      {/* ========================================================== */}
      {modifyingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">修改发票信息并重新提交</h3>
                <p className="text-xs text-slate-400">申请单号：{modifyingInvoice.applicationNo}</p>
              </div>
              <button
                onClick={() => setModifyingInvoice(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rejection Reason Alert */}
            {modifyingInvoice.rejectReason && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>审核人员退回原因说明</span>
                </div>
                <p className="leading-relaxed pl-5">{modifyingInvoice.rejectReason}</p>
              </div>
            )}

            <form onSubmit={handleConfirmModifyAndResubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  发票抬头名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modifyForm.title}
                  onChange={(e) => setModifyForm({ ...modifyForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {modifyingInvoice.titleType === '企业' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    纳税人识别号 / 统一社会信用代码 <span className="text-rose-500">* (18位)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={modifyForm.taxNumber}
                    onChange={(e) => setModifyForm({ ...modifyForm, taxNumber: e.target.value.toUpperCase() })}
                    placeholder="请输入准确的18位企业统一社会信用代码"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">开户银行</label>
                  <input
                    type="text"
                    value={modifyForm.bankName}
                    onChange={(e) => setModifyForm({ ...modifyForm, bankName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">开户账号</label>
                  <input
                    type="text"
                    value={modifyForm.bankAccount}
                    onChange={(e) => setModifyForm({ ...modifyForm, bankAccount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">补充备注说明</label>
                <input
                  type="text"
                  value={modifyForm.remark}
                  onChange={(e) => setModifyForm({ ...modifyForm, remark: e.target.value })}
                  placeholder="如：已核实最新税号，请财务重新审批开票"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModifyingInvoice(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  确认重新提交
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderDetail && (
        <OrderDetailModal
          isOpen={Boolean(selectedOrderDetail)}
          order={selectedOrderDetail}
          onClose={() => setSelectedOrderDetail(null)}
          onApplyInvoice={(ord) => {
            setSelectedOrderDetail(null);
            setActiveMainTab('invoices');
            handleProceedToInvoiceForm([ord.orderNo]);
          }}
          onViewInvoice={() => {
            setSelectedOrderDetail(null);
            setActiveMainTab('invoices');
            setInvoiceSubTab('history');
          }}
        />
      )}

      {/* Apply Invoice Modal (弹窗形式展现，先选抬头类型，再呈现对应内容，无邮箱字段) */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all max-h-[92vh] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">申请开具增值税发票</h3>
                  <p className="text-xs text-slate-500 mt-0.5">请先选择抬头类型，核实开票信息并提交财务审批</p>
                </div>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="w-9 h-9 rounded-2xl hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitInvoiceApplication} className="p-7 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* Mandatory Invoice Prompt Banner */}
              <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900 text-xs">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-bold">
                  “您的账户包含赠送积分，系统已为您按比例自动抵扣。仅按实际消耗的付费金额开具发票。”
                </div>
              </div>

              {/* Order and Amount Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">关联开票订单：</span>
                  <div className="font-mono font-bold text-slate-800 flex flex-wrap gap-1.5 mt-1">
                    {selectedOrderNos.map(no => (
                      <span key={no} className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-900">
                        {no}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-slate-500 block">实际核算可开票金额：</span>
                  <span className="text-2xl font-black text-amber-600 font-mono">
                    ¥{selectedOrdersTotalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* STEP 1: 先选抬头类型 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block uppercase tracking-wider">
                  第一步：选择抬头类型 <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setApplyForm(prev => ({
                      ...prev,
                      titleType: '企业',
                      title: user.role === '机构管理员' || user.role === '学院管理员' ? (user.institution || '武汉大学科技成果转化中心') : '北京智研启航科技有限公司',
                      taxNumber: '91110108MA0192837X',
                    }))}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                      applyForm.titleType === '企业'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className={`w-5 h-5 ${applyForm.titleType === '企业' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">企业单位抬头</div>
                        <div className="text-[11px] text-slate-400">支持增值税普通发票与专用发票</div>
                      </div>
                    </div>
                    {applyForm.titleType === '企业' && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setApplyForm(prev => ({
                      ...prev,
                      titleType: '个人',
                      invoiceType: '增值税普通发票',
                      title: user.name || user.username || '个人',
                      phone: user.phone || '',
                    }))}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                      applyForm.titleType === '个人'
                        ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <User className={`w-5 h-5 ${applyForm.titleType === '个人' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">个人抬头</div>
                        <div className="text-[11px] text-slate-400">仅开具增值税普通发票（电子）</div>
                      </div>
                    </div>
                    {applyForm.titleType === '个人' && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
                  </button>
                </div>
              </div>

              {/* STEP 2: 根据抬头类型呈现后续内容 */}
              {applyForm.titleType === '企业' ? (
                /* 企业单位表单字段 */
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      发票种类 <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['增值税普通发票', '增值税专用发票'] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setApplyForm({ ...applyForm, invoiceType: type })}
                          className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                            applyForm.invoiceType === type
                              ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-500'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        企业发票抬头全称 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={applyForm.title}
                        onChange={(e) => setApplyForm({ ...applyForm, title: e.target.value })}
                        placeholder="如：北京智研启航科技有限公司"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        统一社会信用代码 / 税号 (18位) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={18}
                        value={applyForm.taxNumber}
                        onChange={(e) => setApplyForm({ ...applyForm, taxNumber: e.target.value.toUpperCase() })}
                        placeholder="18位纳税人识别号"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        开户银行 {applyForm.invoiceType === '增值税专用发票' && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type="text"
                        required={applyForm.invoiceType === '增值税专用发票'}
                        value={applyForm.bankName}
                        onChange={(e) => setApplyForm({ ...applyForm, bankName: e.target.value })}
                        placeholder="如：招商银行股份有限公司北京分行"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        银行账号 {applyForm.invoiceType === '增值税专用发票' && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type="text"
                        required={applyForm.invoiceType === '增值税专用发票'}
                        value={applyForm.bankAccount}
                        onChange={(e) => setApplyForm({ ...applyForm, bankAccount: e.target.value })}
                        placeholder="如：110908234910201"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        企业注册地址 {applyForm.invoiceType === '增值税专用发票' && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type="text"
                        required={applyForm.invoiceType === '增值税专用发票'}
                        value={applyForm.address}
                        onChange={(e) => setApplyForm({ ...applyForm, address: e.target.value })}
                        placeholder="营业执照上的登记住所"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        企业注册电话 {applyForm.invoiceType === '增值税专用发票' && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type="text"
                        required={applyForm.invoiceType === '增值税专用发票'}
                        value={applyForm.phone}
                        onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                        placeholder="如：010-88392019"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">补充备注说明 (选填)</label>
                    <input
                      type="text"
                      value={applyForm.remark}
                      onChange={(e) => setApplyForm({ ...applyForm, remark: e.target.value })}
                      placeholder="如：课题项目经费报销 / 学院专项对账"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                /* 个人抬头表单字段 */
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>发票类型：<strong className="text-slate-800">增值税普通发票（电子发票）</strong>，税目为：*信息技术服务*论文规范性检测服务</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      个人姓名 / 发票抬头 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={applyForm.title}
                      onChange={(e) => setApplyForm({ ...applyForm, title: e.target.value })}
                      placeholder="如：张三（请如实填写报销人姓名）"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">身份证号码 (选填)</label>
                      <input
                        type="text"
                        value={applyForm.idCard}
                        onChange={(e) => setApplyForm({ ...applyForm, idCard: e.target.value.toUpperCase() })}
                        placeholder="个人报销备查（选填）"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">手机号码 (选填)</label>
                      <input
                        type="text"
                        value={applyForm.phone}
                        onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                        placeholder="便于接收开票进展通知"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">补充备注说明 (选填)</label>
                    <input
                      type="text"
                      value={applyForm.remark}
                      onChange={(e) => setApplyForm({ ...applyForm, remark: e.target.value })}
                      placeholder="如：毕业论文检测专项开票"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer inside form */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={selectedOrderNos.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>确认提交开票申请 (¥{selectedOrdersTotalAmount.toFixed(2)})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Balance Full Refund Modal (依据公式：可退款金额 =（剩下积分 - 赠送积分）÷ 100) */}
      {isBalanceRefundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all max-h-[92vh] flex flex-col font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">申请账户余额全额退款</h3>
                  <p className="text-xs text-slate-500 mt-0.5">未消耗本金支持全额退还，赠送积分自动清零</p>
                </div>
              </div>
              <button
                onClick={() => setIsBalanceRefundModalOpen(false)}
                className="w-9 h-9 rounded-2xl hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-7 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* Formula & Breakdown Calculation */}
              <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-bold text-rose-950">
                  <span className="flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-rose-600" />
                    退款结算算法与公式
                  </span>
                  <span className="font-mono text-rose-700">比例 100积分 = 1元</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-rose-100 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>当前账户总剩下积分：</span>
                    <span className="font-bold text-slate-900">{(user.balance || 0).toLocaleString()} 分</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>扣除系统赠送积分（不折现）：</span>
                    <span className="font-bold">-{(user.bonusCredits ?? 1800).toLocaleString()} 分</span>
                  </div>
                  <div className="flex justify-between text-blue-700 font-bold border-t border-slate-100 pt-1">
                    <span>有效可退付费本金积分：</span>
                    <span>{(user.paidCredits ?? 9000).toLocaleString()} 分</span>
                  </div>
                  <div className="flex justify-between text-rose-700 font-bold bg-rose-50/80 p-2 rounded-lg mt-1 text-xs">
                    <span>代入公式：({(user.balance || 0).toLocaleString()} - {(user.bonusCredits ?? 1800).toLocaleString()}) ÷ 100</span>
                    <span className="text-base font-black">¥{(((user.paidCredits ?? 9000) / 100)).toFixed(2)}</span>
                  </div>
                </div>

                <p className="text-[11px] text-rose-800 leading-relaxed">
                  提示：退款成功后，该账户对应的全部剩余积分（含 {(user.bonusCredits ?? 1800).toLocaleString()} 赠送积分）将全部作废清零。
                </p>
              </div>

              {/* Refund Reason Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  申请退款原因 <span className="text-rose-500">*</span>
                </label>
                <select
                  value={balanceRefundReason}
                  onChange={(e) => setBalanceRefundReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500"
                >
                  <option value="检测任务已完成/毕业答辩结束，申请清结账户余额">检测任务已完成/毕业答辩结束，申请清结账户余额</option>
                  <option value="课题经费报销口径调整">课题经费报销口径调整</option>
                  <option value="误操作多充值">误操作多充值</option>
                  <option value="学校/机构已统一定向采购，无需个人额度">学校/机构已统一定向采购，无需个人额度</option>
                  <option value="其他原因">其他原因</option>
                </select>
              </div>

              {/* Detail remark */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">补充说明 (选填)</label>
                <textarea
                  rows={2}
                  value={balanceRefundRemark}
                  onChange={(e) => setBalanceRefundRemark(e.target.value)}
                  placeholder="可在此输入经办说明..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:bg-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* 6 Terms Notice */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>《用户充值与退款须知》</span>
                </div>
                <ol className="list-decimal list-outside pl-4 space-y-1 text-[11px] text-slate-600 leading-relaxed">
                  {(policy.noticeTerms || initialBillingPolicy.noticeTerms).map((term, idx) => (
                    <li key={idx} className="pl-1">
                      {term}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
              <button
                type="button"
                onClick={() => setIsBalanceRefundModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isSubmittingBalanceRefund}
                onClick={handleSubmitBalanceRefund}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmittingBalanceRefund ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>提交中...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>确认申请原路退款 ¥{(((user.paidCredits ?? 9000)/100)).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {previewInvoice && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
        />
      )}
      </div>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
