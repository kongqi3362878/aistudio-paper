import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  Upload,
  ArrowRight,
  RotateCw,
  Building2,
  User,
  ShieldCheck,
  Send,
  Calendar,
  AlertCircle,
  X,
  FileCheck,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import { InvoiceRecord, InvoiceStatus, OrderRecord } from '../../../types';
import InvoicePreviewModal from '../../invoice/InvoicePreviewModal';
import { amountToChinese } from '../../../data/invoiceMockData';

interface AdminInvoicesViewProps {
  invoices: InvoiceRecord[];
  onUpdateInvoices: (invoices: InvoiceRecord[]) => void;
  orders?: OrderRecord[];
  onUpdateOrders?: (orders: OrderRecord[]) => void;
}

export default function AdminInvoicesView({
  invoices,
  onUpdateInvoices,
  orders = [],
  onUpdateOrders,
}: AdminInvoicesViewProps) {
  // Tabs: 待处理 | 开票中 | 已开票 | 已退回 | 全部
  const [activeTab, setActiveTab] = useState<'待处理' | '开票中' | '已开票' | '已退回' | '全部'>('待处理');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'全部类型' | '增值税普通发票' | '增值税专用发票'>('全部类型');
  const [titleTypeFilter, setTitleTypeFilter] = useState<'全部' | '企业' | '个人/事业单位'>('全部');

  // Modals state
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(null);
  const [detailInvoice, setDetailInvoice] = useState<InvoiceRecord | null>(null);
  
  // Return / Reject Modal
  const [rejectModalInvoice, setRejectModalInvoice] = useState<InvoiceRecord | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');

  // Invoicing & Upload Modal (线下开票录入)
  const [invoicingModalInvoice, setInvoicingModalInvoice] = useState<InvoiceRecord | null>(null);
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNo: '',
    invoiceCode: '011002300111',
    invoicedDate: new Date().toISOString().slice(0, 10),
    fileName: '',
    fileSize: '356 KB',
    fileType: 'pdf' as 'pdf' | 'image',
  });

  // Toast message
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Status counts for badge
  const counts = useMemo(() => {
    return {
      '待处理': invoices.filter(i => i.status === '待处理').length,
      '开票中': invoices.filter(i => i.status === '开票中').length,
      '已开票': invoices.filter(i => i.status === '已开票').length,
      '已退回': invoices.filter(i => i.status === '已退回').length,
      '全部': invoices.length,
    };
  }, [invoices]);

  // Financial Stats
  const stats = useMemo(() => {
    const pendingAmount = invoices.filter(i => i.status === '待处理').reduce((s, i) => s + i.amount, 0);
    const processingAmount = invoices.filter(i => i.status === '开票中').reduce((s, i) => s + i.amount, 0);
    const invoicedAmount = invoices.filter(i => i.status === '已开票').reduce((s, i) => s + i.amount, 0);
    const returnedAmount = invoices.filter(i => i.status === '已退回').reduce((s, i) => s + i.amount, 0);
    return { pendingAmount, processingAmount, invoicedAmount, returnedAmount };
  }, [invoices]);

  // Filtered List
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (activeTab !== '全部' && inv.status !== activeTab) {
        return false;
      }
      if (typeFilter !== '全部类型' && inv.invoiceType !== typeFilter) {
        return false;
      }
      if (titleTypeFilter !== '全部' && inv.titleType !== titleTypeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = inv.title.toLowerCase().includes(q);
        const matchAppNo = inv.applicationNo.toLowerCase().includes(q);
        const matchInvNo = (inv.invoiceNo || '').toLowerCase().includes(q);
        const matchTax = (inv.taxNumber || '').toLowerCase().includes(q);
        const matchPhone = (inv.applicantPhone || '').includes(q);
        const matchOrder = inv.orderNos.some(o => o.toLowerCase().includes(q));
        if (!matchTitle && !matchAppNo && !matchInvNo && !matchTax && !matchPhone && !matchOrder) {
          return false;
        }
      }
      return true;
    });
  }, [invoices, activeTab, typeFilter, titleTypeFilter, searchQuery]);

  // ==========================================
  // Action Handlers
  // ==========================================

  // 1. Audit Pass -> Move to '开票中' (线下找财务开票)
  const handleApproveToProcessing = (inv: InvoiceRecord) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const updated = invoices.map(i => {
      if (i.id === inv.id) {
        return {
          ...i,
          status: '开票中' as InvoiceStatus,
          auditTime: timeStr,
          auditor: '财务审核专员 (李娜)',
        };
      }
      return i;
    });

    onUpdateInvoices(updated);
    showToast(`申请【${inv.applicationNo}】审核通过！状态已转为【开票中】，请线下联系财务开票后录入发票号。`);
    if (detailInvoice && detailInvoice.id === inv.id) {
      setDetailInvoice(null);
    }
  };

  // 2. Return / Reject -> Move to '已退回' (退回补充，让用户修改重提)
  const handleOpenRejectModal = (inv: InvoiceRecord) => {
    setRejectModalInvoice(inv);
    setRejectReasonInput('纳税人识别号格式有误，现行企业统一社会信用代码应为18位且需在国税系统可查，请核对企业营业执照后修改重新提交。');
  };

  const handleConfirmReject = () => {
    if (!rejectModalInvoice) return;
    if (!rejectReasonInput.trim()) {
      showToast('请填写退回补充的具体原因');
      return;
    }

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const updated = invoices.map(i => {
      if (i.id === rejectModalInvoice.id) {
        return {
          ...i,
          status: '已退回' as InvoiceStatus,
          auditTime: timeStr,
          auditor: '财务审核专员 (李娜)',
          rejectReason: rejectReasonInput.trim(),
        };
      }
      return i;
    });

    // Also update order invoicedStatus to '已退回'
    if (onUpdateOrders && orders.length > 0) {
      const updatedOrders = orders.map(o => {
        if (rejectModalInvoice.orderNos.includes(o.orderNo)) {
          return {
            ...o,
            invoicedStatus: '已退回' as const,
          };
        }
        return o;
      });
      onUpdateOrders(updatedOrders);
    }

    onUpdateInvoices(updated);
    showToast(`开票申请已退回补充！用户可在 C 端【费用中心 - 申请记录】中查看退回原因并修改重提。`);
    setRejectModalInvoice(null);
    if (detailInvoice && detailInvoice.id === rejectModalInvoice.id) {
      setDetailInvoice(null);
    }
  };

  // 3. Open Upload & Invoicing Modal
  const handleOpenInvoicingModal = (inv: InvoiceRecord) => {
    setInvoicingModalInvoice(inv);
    const randomSuffix = Math.floor(1000000000 + Math.random() * 9000000000);
    setInvoiceForm({
      invoiceNo: `2611200000${randomSuffix}`,
      invoiceCode: '011002300111',
      invoicedDate: new Date().toISOString().slice(0, 10),
      fileName: `电子发票_${inv.title}_${inv.amount.toFixed(2)}元.pdf`,
      fileSize: '356 KB',
      fileType: 'pdf',
    });
  };

  // 4. Confirm Invoicing -> Move to '已开票'
  const handleConfirmInvoicing = () => {
    if (!invoicingModalInvoice) return;
    if (!invoiceForm.invoiceNo.trim()) {
      showToast('请填写发票号码');
      return;
    }
    if (!invoiceForm.invoicedDate) {
      showToast('请选择开票日期');
      return;
    }

    const updated = invoices.map(i => {
      if (i.id === invoicingModalInvoice.id) {
        return {
          ...i,
          status: '已开票' as InvoiceStatus,
          invoiceNo: invoiceForm.invoiceNo.trim(),
          invoiceCode: invoiceForm.invoiceCode.trim(),
          invoicedDate: invoiceForm.invoicedDate,
          fileName: invoiceForm.fileName.trim() || `电子发票_${i.title}_${i.amount.toFixed(2)}元.pdf`,
          fileSize: invoiceForm.fileSize || '356 KB',
          fileType: invoiceForm.fileType,
          auditor: i.auditor || '财务审核专员 (李娜)',
        };
      }
      return i;
    });

    // Update associated orders to '已开票'
    if (onUpdateOrders && orders.length > 0) {
      const updatedOrders = orders.map(o => {
        if (invoicingModalInvoice.orderNos.includes(o.orderNo)) {
          return {
            ...o,
            invoicedStatus: '已开票' as const,
          };
        }
        return o;
      });
      onUpdateOrders(updatedOrders);
    }

    onUpdateInvoices(updated);
    showToast(`开票成功！发票号码【${invoiceForm.invoiceNo}】已录入并标记【已开票】。`);
    setInvoicingModalInvoice(null);
    if (detailInvoice && detailInvoice.id === invoicingModalInvoice.id) {
      setDetailInvoice(null);
    }
  };

  // Export invoices to CSV
  const handleExportCSV = () => {
    const headers = '申请编号,发票号码,发票抬头,税号,发票类型,金额,税率,税额,状态,申请时间,开票日期,申请人,手机号';
    const rows = filteredInvoices.map(i => {
      return `"${i.applicationNo}","${i.invoiceNo || '-'}","${i.title}","${i.taxNumber || '-'}","${i.invoiceType}","¥${i.amount.toFixed(2)}","${(i.taxRate * 100).toFixed(0)}%","¥${i.taxAmount.toFixed(2)}","${i.status}","${i.applyTime}","${i.invoicedDate || '-'}","${i.applicantName}","${i.applicantPhone}"`;
    });
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `发票管理明细表_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('发票数据已导出 CSV 文件');
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

      {/* 1. Header with Title & Stats Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1.5 border border-indigo-100">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>交易管理 · 发票管理工作台</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            发票管理
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            专票/普票申请审核、线下财务开票回填、电子发票文件上传与归档全生命周期管理
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>导出开票明细</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 待审核 */}
        <div 
          onClick={() => setActiveTab('待处理')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === '待处理' 
              ? 'bg-amber-50/70 border-amber-300 shadow-xs ring-2 ring-amber-400/20' 
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>待处理申请</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-amber-600">
              {counts['待处理']}
            </span>
            <span className="text-xs text-slate-400">笔待审核</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            涉及金额 ¥{stats.pendingAmount.toFixed(2)}
          </div>
        </div>

        {/* Card 2: 开票中 */}
        <div 
          onClick={() => setActiveTab('开票中')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === '开票中' 
              ? 'bg-blue-50/70 border-blue-300 shadow-xs ring-2 ring-blue-400/20' 
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>开票中 (线下找财务)</span>
            <RotateCw className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-blue-600">
              {counts['开票中']}
            </span>
            <span className="text-xs text-slate-400">笔待回填</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            待上传发票 ¥{stats.processingAmount.toFixed(2)}
          </div>
        </div>

        {/* Card 3: 已开票 */}
        <div 
          onClick={() => setActiveTab('已开票')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === '已开票' 
              ? 'bg-emerald-50/70 border-emerald-300 shadow-xs ring-2 ring-emerald-400/20' 
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>已成功开票</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-emerald-600">
              {counts['已开票']}
            </span>
            <span className="text-xs text-slate-400">笔已交付</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            累计开具 ¥{stats.invoicedAmount.toFixed(2)}
          </div>
        </div>

        {/* Card 4: 已退回 */}
        <div 
          onClick={() => setActiveTab('已退回')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === '已退回' 
              ? 'bg-rose-50/70 border-rose-300 shadow-xs ring-2 ring-rose-400/20' 
              : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>申请已退回</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-rose-600">
              {counts['已退回']}
            </span>
            <span className="text-xs text-slate-400">笔退回可重新申请/退款</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            退回金额 ¥{stats.returnedAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 3. Sub-tabs Navigation Bar */}
      {/* 待处理 | 开票中 | 已开票 | 已退回 | 全部 */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['待处理', '开票中', '已开票', '已退回', '全部'] as const).map(tab => {
              const isActive = activeTab === tab;
              const count = counts[tab];
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : (tab === '待处理' ? 'bg-amber-100 text-amber-700' : tab === '已退回' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700')
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-400">
            当前筛选共 <strong className="text-slate-800 font-bold">{filteredInvoices.length}</strong> 条记录
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索抬头、申请编号、发票号、税号、手机..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option>全部类型</option>
            <option>增值税普通发票</option>
            <option>增值税专用发票</option>
          </select>

          <select
            value={titleTypeFilter}
            onChange={(e) => setTitleTypeFilter(e.target.value as any)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700 cursor-pointer"
          >
            <option>全部</option>
            <option>企业</option>
            <option>个人/事业单位</option>
          </select>

          {(searchQuery || typeFilter !== '全部类型' || titleTypeFilter !== '全部') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('全部类型');
                setTitleTypeFilter('全部');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold ml-auto cursor-pointer"
            >
              重置筛选
            </button>
          )}
        </div>
      </div>

      {/* 4. Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">申请编号 / 时间</th>
                <th className="py-3.5 px-5">发票抬头 / 税号</th>
                <th className="py-3.5 px-5">发票类型</th>
                <th className="py-3.5 px-5">开票金额</th>
                <th className="py-3.5 px-5">申请人 / 联系电话</th>
                <th className="py-3.5 px-5">当前状态</th>
                <th className="py-3.5 px-5">发票号码 / 开票日期</th>
                <th className="py-3.5 px-5 text-right">后台操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs">暂无符合条件的【{activeTab}】发票申请记录</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Application No & Time */}
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-bold text-slate-800">{inv.applicationNo}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{inv.applyTime}</div>
                      </td>

                      {/* Title & Tax No */}
                      <td className="py-3.5 px-5 max-w-[240px]">
                        <div className="font-bold text-slate-800 truncate" title={inv.title}>
                          {inv.title}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {inv.taxNumber ? `税号: ${inv.taxNumber}` : `类型: ${inv.titleType}`}
                        </div>
                      </td>

                      {/* Invoice Type */}
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          inv.invoiceType === '增值税专用发票'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {inv.invoiceType}
                        </span>
                      </td>

                      {/* Amount & Tax */}
                      <td className="py-3.5 px-5">
                        <div className="font-mono font-black text-slate-900 text-sm">
                          ¥{inv.amount.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          不含税: ¥{inv.amountWithoutTax.toFixed(2)} (税6%: ¥{inv.taxAmount.toFixed(2)})
                        </div>
                      </td>

                      {/* Applicant & Contact */}
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <span>{inv.applicantName}</span>
                          <span className="text-[11px] text-slate-400 font-mono font-normal">({inv.applicantPhone})</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                          inv.status === '已开票'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : inv.status === '待处理'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : inv.status === '开票中'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                            : inv.status === '已退回'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {inv.status === '待处理' && <Clock className="w-3 h-3" />}
                          {inv.status === '开票中' && <RotateCw className="w-3 h-3" />}
                          {inv.status === '已开票' && <CheckCircle2 className="w-3 h-3" />}
                          {inv.status === '已退回' && <XCircle className="w-3 h-3" />}
                          <span>{inv.status}</span>
                        </span>
                        {inv.rejectReason && (
                          <div className="text-[10px] text-rose-600 mt-0.5 max-w-[140px] truncate" title={inv.rejectReason}>
                            退回: {inv.rejectReason}
                          </div>
                        )}
                      </td>

                      {/* Invoice No & Date */}
                      <td className="py-3.5 px-5 font-mono">
                        {inv.invoiceNo ? (
                          <div>
                            <div className="font-bold text-indigo-700 text-xs">{inv.invoiceNo}</div>
                            <div className="text-[10px] text-slate-400">{inv.invoicedDate || '-'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">尚未录入</span>
                        )}
                      </td>

                      {/* Operations */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Detail button */}
                          <button
                            onClick={() => setDetailInvoice(inv)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold transition-colors cursor-pointer"
                          >
                            审核详情
                          </button>

                          {/* 2. Actions for 待处理: 审核通过 (开票中) / 退回补充 */}
                          {inv.status === '待处理' && (
                            <>
                              <button
                                onClick={() => handleApproveToProcessing(inv)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-2xs cursor-pointer"
                              >
                                审核通过
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(inv)}
                                className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors cursor-pointer"
                              >
                                退回补充
                              </button>
                            </>
                          )}

                          {/* 3. Action for 开票中: 上传发票 & 回填发票号 (标记已开票) */}
                          {inv.status === '开票中' && (
                            <button
                              onClick={() => handleOpenInvoicingModal(inv)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>上传并开票</span>
                            </button>
                          )}

                          {/* 4. Action for 已开票: 查看发票 / 下载发票 */}
                          {inv.status === '已开票' && (
                            <button
                              onClick={() => setPreviewInvoice(inv)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>查验发票</span>
                            </button>
                          )}
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

      {/* ======================================================== */}
      {/* MODAL 1: 审核详情 Modal                                   */}
      {/* ======================================================== */}
      {detailInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col my-auto overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    发票申请信息审核详情
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    申请编号: {detailInvoice.applicationNo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailInvoice(null)}
                className="w-8 h-8 rounded-xl hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* Current Status banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 font-medium">当前开票状态：</span>
                  <span className="font-bold text-sm text-slate-900 ml-1">{detailInvoice.status}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">申请时间：</span>
                  <span className="font-mono text-slate-700 font-bold">{detailInvoice.applyTime}</span>
                </div>
              </div>

              {/* Title & Info */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">
                  1. 开票抬头与企业纳税资质
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block">发票抬头名称</span>
                    <strong className="text-slate-800 font-bold text-sm block mt-0.5">{detailInvoice.title}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">抬头类型</span>
                    <span className="text-slate-700 font-medium block mt-0.5">{detailInvoice.titleType} · {detailInvoice.invoiceType}</span>
                  </div>
                  {detailInvoice.taxNumber && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block">纳税人识别号 / 统一社会信用代码</span>
                      <strong className="text-indigo-600 font-mono font-bold text-sm block mt-0.5">{detailInvoice.taxNumber}</strong>
                    </div>
                  )}
                  {detailInvoice.bankName && (
                    <div>
                      <span className="text-slate-400 block">开户银行</span>
                      <span className="text-slate-700 font-medium block mt-0.5">{detailInvoice.bankName}</span>
                    </div>
                  )}
                  {detailInvoice.bankAccount && (
                    <div>
                      <span className="text-slate-400 block">银行账号</span>
                      <span className="text-slate-700 font-mono font-bold block mt-0.5">{detailInvoice.bankAccount}</span>
                    </div>
                  )}
                  {detailInvoice.address && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block">企业注册地址 / 电话</span>
                      <span className="text-slate-700 font-medium block mt-0.5">{detailInvoice.address} {detailInvoice.phone ? `(${detailInvoice.phone})` : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">
                  2. 开票金额与货物服务项目
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 block">货物或应税劳务名称</span>
                    <span className="text-slate-800 font-medium block mt-0.5">{detailInvoice.goodsName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">税率</span>
                    <span className="text-slate-800 font-mono font-bold block mt-0.5">{(detailInvoice.taxRate * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">价税合计总额</span>
                    <strong className="text-emerald-600 font-mono font-black text-base block mt-0.5">¥{detailInvoice.amount.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">不含税金额</span>
                    <span className="text-slate-700 font-mono font-bold block mt-0.5">¥{detailInvoice.amountWithoutTax.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">税额</span>
                    <span className="text-slate-700 font-mono font-bold block mt-0.5">¥{detailInvoice.taxAmount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">大写金额</span>
                    <span className="text-slate-600 font-medium block mt-0.5">{amountToChinese(detailInvoice.amount)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block">关联充值订单号 ({detailInvoice.orderNos.length}笔)：</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {detailInvoice.orderNos.map(no => (
                      <span key={no} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                        {no}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Delivery & Applicant Info */}
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80">
                <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">
                  3. 接收人与联系方式
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block">申请人</span>
                    <span className="text-slate-800 font-bold block mt-0.5">{detailInvoice.applicantName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">联系电话</span>
                    <span className="text-slate-800 font-mono block mt-0.5">{detailInvoice.applicantPhone}</span>
                  </div>
                </div>
                {detailInvoice.remark && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block">申请备注说明：</span>
                    <span className="text-slate-700 font-medium block mt-0.5">{detailInvoice.remark}</span>
                  </div>
                )}
              </div>

              {/* If already invoiced, show invoice info */}
              {detailInvoice.invoiceNo && (
                <div className="space-y-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                  <h4 className="font-bold text-emerald-900 text-xs border-b border-emerald-100 pb-2">
                    4. 已录入电子发票信息
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-emerald-700 block">发票号码</span>
                      <strong className="text-slate-900 font-mono font-black text-sm block mt-0.5">{detailInvoice.invoiceNo}</strong>
                    </div>
                    <div>
                      <span className="text-emerald-700 block">开票日期</span>
                      <span className="text-slate-800 font-mono font-bold block mt-0.5">{detailInvoice.invoicedDate}</span>
                    </div>
                    {detailInvoice.fileName && (
                      <div className="col-span-2">
                        <span className="text-emerald-700 block">发票版式文件</span>
                        <span className="text-indigo-600 font-medium block mt-0.5 underline cursor-pointer" onClick={() => setPreviewInvoice(detailInvoice)}>
                          {detailInvoice.fileName} ({detailInvoice.fileSize || '356 KB'})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => setDetailInvoice(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                关闭
              </button>

              <div className="flex items-center gap-2">
                {detailInvoice.status === '待处理' && (
                  <>
                    <button
                      onClick={() => handleOpenRejectModal(detailInvoice)}
                      className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors cursor-pointer"
                    >
                      退回补充
                    </button>
                    <button
                      onClick={() => handleApproveToProcessing(detailInvoice)}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                    >
                      审核通过 (转为开票中)
                    </button>
                  </>
                )}
                {detailInvoice.status === '开票中' && (
                  <button
                    onClick={() => handleOpenInvoicingModal(detailInvoice)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>上传发票并完成开票</span>
                  </button>
                )}
                {detailInvoice.status === '已开票' && (
                  <button
                    onClick={() => {
                      setPreviewInvoice(detailInvoice);
                      setDetailInvoice(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>查验预览发票凭证</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: 退回补充 Modal (Reject Reason)                   */}
      {/* ======================================================== */}
      {rejectModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    退回补充发票申请
                  </h3>
                  <p className="text-xs text-slate-400">
                    发票申请将被退回给用户，提示其修改信息后重新提交
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRejectModalInvoice(null)}
                className="w-8 h-8 rounded-xl hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                <div>申请编号：<strong className="text-slate-900 font-mono">{rejectModalInvoice.applicationNo}</strong></div>
                <div>发票抬头：<strong className="text-slate-900">{rejectModalInvoice.title}</strong></div>
                <div>申请金额：<strong className="text-emerald-600 font-mono">¥{rejectModalInvoice.amount.toFixed(2)}</strong></div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  退回补充原因说明 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={rejectReasonInput}
                  onChange={(e) => setRejectReasonInput(e.target.value)}
                  placeholder="请输入退回补充的具体原因，如税号位数不符、发票抬头包含特殊字符、非当前单位等..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-rose-500 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 block">常用快捷原因模板：</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '纳税人识别号有误，请核实营业执照18位税号后重提',
                    '请补充单位完整全称，勿使用简称',
                    '专用发票请务必补充开户行及账号和注册地址',
                    '非本校报销抬头，请重新核实开票信息',
                  ].map(tmpl => (
                    <button
                      key={tmpl}
                      type="button"
                      onClick={() => setRejectReasonInput(tmpl)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] transition-colors cursor-pointer text-left"
                    >
                      {tmpl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setRejectModalInvoice(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all shadow-xs cursor-pointer"
              >
                确认退回补充
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: 上传发票与录入发票号 Modal (步骤 7, 8, 9)          */}
      {/* ======================================================== */}
      {invoicingModalInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    录入发票信息并标记【已开票】
                  </h3>
                  <p className="text-xs text-slate-400">
                    线下找财务开具发票后，回填发票号码并上传电子版式文件
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInvoicingModalInvoice(null)}
                className="w-8 h-8 rounded-xl hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Target info card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">申请编号：</span>
                  <span className="font-mono font-bold text-slate-800">{invoicingModalInvoice.applicationNo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">发票抬头：</span>
                  <span className="font-bold text-slate-800">{invoicingModalInvoice.title}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">发票金额：</span>
                  <span className="font-mono font-black text-emerald-600 text-sm">¥{invoicingModalInvoice.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    发票号码 (20位全国统一番号) <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={invoiceForm.invoiceNo}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNo: e.target.value })}
                      placeholder="如 26112000000192837123"
                      className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const randomSuffix = Math.floor(1000000000 + Math.random() * 9000000000);
                        setInvoiceForm({ ...invoiceForm, invoiceNo: `2611200000${randomSuffix}` });
                      }}
                      className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] whitespace-nowrap cursor-pointer"
                    >
                      随机规范生成
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    发票代码 (可选)
                  </label>
                  <input
                    type="text"
                    value={invoiceForm.invoiceCode}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceCode: e.target.value })}
                    placeholder="011002300111"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    开票日期 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={invoiceForm.invoicedDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoicedDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* File Upload / Generate */}
                <div className="col-span-2 space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    上传发票文件 (PDF / 图片)
                  </label>
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center gap-2 text-center hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">
                        {invoiceForm.fileName || '电子发票_版式文件.pdf'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        大小约 356 KB · 符合国税统一电子发票版式标准
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <label className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold cursor-pointer shadow-2xs">
                        <span>更换本地文件</span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setInvoiceForm({
                                ...invoiceForm,
                                fileName: file.name,
                                fileSize: `${Math.round(file.size / 1024)} KB`,
                                fileType: file.type.includes('image') ? 'image' : 'pdf',
                              });
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setInvoiceForm({
                            ...invoiceForm,
                            fileName: `全国统一电子发票_${invoicingModalInvoice.title}_${invoicingModalInvoice.amount.toFixed(2)}元.pdf`,
                            fileSize: '356 KB',
                            fileType: 'pdf',
                          });
                          showToast('已自动生成标准版式电子发票凭证');
                        }}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        生成标准发票文件
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setInvoicingModalInvoice(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleConfirmInvoicing}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>确认开票并通知用户</span>
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ======================================================== */}
      {/* MODAL 5: 真实电子发票查验预览器 (1:1 国家税务总局规范版式)       */}
      {/* ======================================================== */}
      {previewInvoice && (
        <InvoicePreviewModal
          invoice={previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          onDownload={(inv) => {
            showToast(`已成功下载【${inv.title}】的电子发票凭证`);
          }}
        />
      )}
    </div>
  );
}
