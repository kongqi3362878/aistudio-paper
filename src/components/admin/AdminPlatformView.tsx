import React, { useState, useMemo } from 'react';
import { 
  Tv2, 
  LayoutDashboard, 
  FileSpreadsheet, 
  Layers, 
  FileText, 
  AlertCircle, 
  Building2, 
  GraduationCap,
  Users, 
  MessageSquare, 
  CreditCard, 
  Inbox, 
  LogOut, 
  RotateCw, 
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  Sliders
} from 'lucide-react';
import { PageKey, AdminSubPageKey, InvoiceRecord, RefundAuditItem, OrderRecord } from '../../types';
import BrandLogo from '../common/BrandLogo';

import { InstitutionItem } from '../../data/adminMockData';
import { initialInvoices, initialRefundAudits } from '../../data/invoiceMockData';
import { initialOrders } from '../../data/mockData';

// Subviews
import OverviewView from './views/OverviewView';
import DevopsView from './views/DevopsView';
import CostsView from './views/CostsView';
import QueueView from './views/QueueView';
import PapersView from './views/PapersView';
import DetectionFeedbackView from './views/DetectionFeedbackView';
import InstitutionsView from './views/InstitutionsView';
import UniversityTrialView from './views/UniversityTrialView';
import UsersView from './views/UsersView';
import UserFeedbackView from './views/UserFeedbackView';
import TransactionsView from './views/TransactionsView';
import OrdersView from './views/OrdersView';
import AdminInvoicesView from './views/AdminInvoicesView';
import AdminRefundsView from './views/AdminRefundsView';
import PricingPolicyView from './views/PricingPolicyView';
import { initialBillingPolicy } from '../../data/billingPolicyData';
import { BillingPolicyConfig } from '../../types';

interface AdminPlatformViewProps {
  onNavigate: (page: PageKey) => void;
  institutions?: InstitutionItem[];
  onUpdateInstitutions?: (updated: InstitutionItem[]) => void;
  onOpenTrialPerspective?: (schoolName: string) => void;
  invoices?: InvoiceRecord[];
  onUpdateInvoices?: (invoices: InvoiceRecord[]) => void;
  refundAudits?: RefundAuditItem[];
  onUpdateRefundAudits?: (audits: RefundAuditItem[]) => void;
  orders?: OrderRecord[];
  onUpdateOrders?: (orders: OrderRecord[]) => void;
  policy?: BillingPolicyConfig;
  onUpdatePolicy?: (policy: BillingPolicyConfig) => void;
}

export default function AdminPlatformView({ 
  onNavigate,
  institutions,
  onUpdateInstitutions,
  onOpenTrialPerspective,
  invoices: propInvoices,
  onUpdateInvoices: propOnUpdateInvoices,
  refundAudits: propRefundAudits,
  onUpdateRefundAudits: propOnUpdateRefundAudits,
  orders: propOrders,
  onUpdateOrders: propOnUpdateOrders,
  policy: propPolicy,
  onUpdatePolicy: propOnUpdatePolicy,
}: AdminPlatformViewProps) {
  // Local state fallbacks if not provided from parent
  const [localInvoices, setLocalInvoices] = useState<InvoiceRecord[]>(initialInvoices);
  const [localRefundAudits, setLocalRefundAudits] = useState<RefundAuditItem[]>(initialRefundAudits);
  const [localOrders, setLocalOrders] = useState<OrderRecord[]>(initialOrders);
  const [localPolicy, setLocalPolicy] = useState<BillingPolicyConfig>(initialBillingPolicy);

  const effectiveInvoices = propInvoices ?? localInvoices;
  const effectiveOnUpdateInvoices = propOnUpdateInvoices ?? setLocalInvoices;

  const effectiveRefundAudits = propRefundAudits ?? localRefundAudits;
  const effectiveOnUpdateRefundAudits = propOnUpdateRefundAudits ?? setLocalRefundAudits;

  const effectiveOrders = propOrders ?? localOrders;
  const effectiveOnUpdateOrders = propOnUpdateOrders ?? setLocalOrders;

  const effectivePolicy = propPolicy ?? localPolicy;
  const effectiveOnUpdatePolicy = propOnUpdatePolicy ?? setLocalPolicy;

  const [activeSubPage, setActiveSubPage] = useState<AdminSubPageKey>('overview');
  const [dateRange, setDateRange] = useState('今天');
  const [timeGranularity, setTimeGranularity] = useState('按小时');

  // Pending counts for badges
  const pendingInvoicesCount = useMemo(() => {
    return effectiveInvoices.filter(i => i.status === '待处理').length;
  }, [effectiveInvoices]);

  const pendingRefundsCount = useMemo(() => {
    return effectiveRefundAudits.filter(r => r.status === '待审核').length;
  }, [effectiveRefundAudits]);

  // Menu Definition exactly matching the 12 screenshots
  const operationsNav = [
    { id: 'overview' as AdminSubPageKey, label: '业务概览', icon: Tv2 },
    { id: 'devops' as AdminSubPageKey, label: '运维仪表盘', icon: LayoutDashboard },
    { id: 'costs' as AdminSubPageKey, label: '运营成本', icon: FileSpreadsheet },
    { id: 'queue' as AdminSubPageKey, label: '队列监控', icon: Layers },
    { id: 'papers' as AdminSubPageKey, label: '论文管理', icon: FileText },
    { id: 'detectionFeedback' as AdminSubPageKey, label: '检测反馈', icon: AlertCircle },
    { id: 'institutions' as AdminSubPageKey, label: '机构管理', icon: Building2 },
    { id: 'universityTrial' as AdminSubPageKey, label: '高校试用', icon: GraduationCap },
    { id: 'users' as AdminSubPageKey, label: '用户管理', icon: Users },
    { id: 'feedback' as AdminSubPageKey, label: '反馈管理', icon: MessageSquare },
  ];

  // 交易与计费管理: 交易总览 | 收款订单 | 充值与计费策略 | 发票管理 | 退款审核
  const transactionNav = [
    { id: 'transactions' as AdminSubPageKey, label: '交易总览', icon: CreditCard },
    { id: 'orders' as AdminSubPageKey, label: '收款订单', icon: Inbox },
    { id: 'pricingPolicy' as AdminSubPageKey, label: '充值与计费策略', icon: Sliders },
    { 
      id: 'invoices' as AdminSubPageKey, 
      label: '发票管理', 
      icon: FileText,
      badge: pendingInvoicesCount > 0 ? pendingInvoicesCount : undefined,
    },
    { 
      id: 'refunds' as AdminSubPageKey, 
      label: '退款审核', 
      icon: RotateCcw,
      badge: pendingRefundsCount > 0 ? pendingRefundsCount : undefined,
    },
  ];

  // Titles and Subtitles
  const titlesMap: Record<AdminSubPageKey, { title: string; subtitle: string }> = {
    overview: { title: '业务概览', subtitle: '用户参与、论文完成、问题检出与反馈质量' },
    devops: { title: '运维仪表盘', subtitle: '服务状态、负载趋势与 Token 统计' },
    costs: { title: '运营成本工作台', subtitle: '运营估算·非财务凭证；费用按当前单价估算' },
    queue: { title: '队列监控', subtitle: '更新于 2026/10/09 13:53' },
    papers: { title: '论文管理', subtitle: '全站论文列表与检测状态' },
    detectionFeedback: { title: '检测反馈', subtitle: '跨论文检测结果反馈审核（只读）。列表条数可能与详情合并展示略有差异。' },
    institutions: { title: '机构管理', subtitle: '机构资料与积分额度在此管理；高校试用的成员、发放和用量单独立项。' },
    universityTrial: { title: '高校试用', subtitle: '管理试点范围、学校发放上限和使用记录。校方可在本校范围内邀请、审核和发放。' },
    users: { title: '用户管理', subtitle: '全站用户列表与额度维护' },
    feedback: { title: '反馈管理', subtitle: '用户反馈列表' },
    transactions: { title: '交易总览', subtitle: '按支付成功订单统计，非渠道到账/财务对账口径' },
    orders: { title: '收款订单', subtitle: '积分充值订单·平台状态与渠道状态 (中文+原始码) 并列展示' },
    pricingPolicy: { title: '充值与计费策略配置', subtitle: '管理充值比例、充值赠送(5:1)、积分/万有效字单价、扣费拆分与退款开票算法' },
    invoices: { title: '发票管理', subtitle: '专票/普票申请审核、线下开票录入与版式文件上传交付' },
    refunds: { title: '退款审核', subtitle: '订单退款审核与原路退款审批，遵循未开票或申请被退回直接退款原则（免红冲）' },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] text-slate-800 flex font-sans select-none antialiased">
      {/* ======================================================== */}
      {/* 1. LEFT ADMIN SIDEBAR (1:1 with Screenshots)             */}
      {/* ======================================================== */}
      <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-2xs z-30">
        <div className="flex flex-col overflow-y-auto">
          {/* Header Brand + 平台管理 Subtitle */}
          <div className="p-6 pb-4 border-b border-slate-100 flex flex-col gap-1">
            <BrandLogo onClick={() => setActiveSubPage('overview')} />
            <span className="text-xs font-bold text-slate-400 pl-1 mt-0.5 tracking-wider">
              平台管理
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-6">
            {/* Section 1: 运营中心 */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 px-3.5 py-1 block">
                运营中心
              </span>
              {operationsNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeSubPage === item.id;
                return (
                  <button
                    key={item.id}
                    id={`admin-nav-${item.id}`}
                    onClick={() => setActiveSubPage(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/90 text-indigo-600 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Section 2: 交易管理 */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 px-3.5 py-1 block">
                交易管理
              </span>
              {transactionNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeSubPage === item.id;
                return (
                  <button
                    key={item.id}
                    id={`admin-nav-${item.id}`}
                    onClick={() => setActiveSubPage(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50/90 text-indigo-600 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Bottom User Area matching Screenshot */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm shadow-2xs">
              A
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block leading-tight">admin</span>
              <span className="text-[11px] text-slate-400 block">平台管理员</span>
            </div>
          </div>

          {/* Return to Workbench Button */}
          <button
            id="admin-exit-to-workbench-btn"
            onClick={() => onNavigate('dashboard')}
            title="退出管理后台，返回工作台"
            className="w-8 h-8 rounded-xl hover:bg-slate-200/70 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT AREA                                     */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <header className="px-8 py-5 border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {titlesMap[activeSubPage].title}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {titlesMap[activeSubPage].subtitle}
            </p>
          </div>

          {/* Right Header Filters (Screenshots 1 & 2) */}
          <div className="flex items-center gap-3 self-start sm:self-auto text-xs">
            {/* Quick return pill */}
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回工作台</span>
            </button>

            {/* Date range capsules */}
            <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl">
              {['今天', '近 7 天', '近 30 天', '近 90 天', '自定义'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDateRange(tab)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    dateRange === tab
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Granularity select */}
            <select
              value={timeGranularity}
              onChange={(e) => setTimeGranularity(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
            >
              <option>按小时</option>
              <option>按天</option>
              <option>按周</option>
            </select>

            <button
              onClick={() => {}}
              title="刷新当前数据"
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Subpage View Container */}
        <main className="flex-1 p-6 sm:p-8 max-w-[1760px] w-full mx-auto">
          {activeSubPage === 'overview' && <OverviewView />}
          {activeSubPage === 'devops' && <DevopsView onNavigateSubPage={setActiveSubPage} />}
          {activeSubPage === 'costs' && <CostsView />}
          {activeSubPage === 'queue' && <QueueView />}
          {activeSubPage === 'papers' && <PapersView />}
          {activeSubPage === 'detectionFeedback' && <DetectionFeedbackView />}
          {activeSubPage === 'institutions' && (
            <InstitutionsView 
              institutions={institutions} 
              onUpdateInstitutions={onUpdateInstitutions} 
              onOpenTrialPerspective={(school) => {
                if (onOpenTrialPerspective) {
                  onOpenTrialPerspective(school);
                } else {
                  onNavigate('institutionPortal');
                }
              }}
            />
          )}
          {activeSubPage === 'universityTrial' && (
            <UniversityTrialView 
              onOpenSchoolPerspective={(school) => {
                if (onOpenTrialPerspective) {
                  onOpenTrialPerspective(school);
                } else {
                  onNavigate('institutionPortal');
                }
              }}
            />
          )}
          {activeSubPage === 'users' && <UsersView institutions={institutions} />}
          {activeSubPage === 'feedback' && <UserFeedbackView />}
          {activeSubPage === 'transactions' && <TransactionsView onNavigateSubPage={setActiveSubPage} />}
          {activeSubPage === 'orders' && <OrdersView />}
          {activeSubPage === 'pricingPolicy' && (
            <PricingPolicyView
              policy={effectivePolicy}
              onUpdatePolicy={effectiveOnUpdatePolicy}
            />
          )}
          {activeSubPage === 'invoices' && (
            <AdminInvoicesView 
              invoices={effectiveInvoices} 
              onUpdateInvoices={effectiveOnUpdateInvoices}
              orders={effectiveOrders}
              onUpdateOrders={effectiveOnUpdateOrders}
            />
          )}
          {activeSubPage === 'refunds' && (
            <AdminRefundsView 
              refundAudits={effectiveRefundAudits}
              onUpdateRefundAudits={effectiveOnUpdateRefundAudits}
              invoices={effectiveInvoices}
              onUpdateInvoices={effectiveOnUpdateInvoices}
              orders={effectiveOrders}
              onUpdateOrders={effectiveOnUpdateOrders}
            />
          )}
        </main>

        {/* Footer matching screenshot */}
        <footer className="py-4 text-center border-t border-slate-100 text-xs text-slate-400 bg-white">
          © 2026 论文智检. 保留所有权利。 | 鄂ICP备2026023941号-2
        </footer>
      </div>
    </div>
  );
}
