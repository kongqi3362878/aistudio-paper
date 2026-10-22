import { useState } from 'react';
import { PageKey, PaperDetectionRecord, BatchTask, OrderRecord, UserProfile, InvoiceRecord, RefundAuditItem, BillingPolicyConfig } from './types';
import { initialUser, initialRecords, initialBatchTasks, initialOrders } from './data/mockData';
import { initialInvoices, initialRefundAudits } from './data/invoiceMockData';
import { initialBillingPolicy } from './data/billingPolicyData';

// Components
import LandingPage from './components/landing/LandingPage';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import RechargeModal from './components/common/RechargeModal';
import ReportDetailView from './components/report/ReportDetailView';
import RiskReportDetailView from './components/risk/RiskReportDetailView';
import LoginView from './components/auth/LoginView';

// Views
import DashboardView from './components/dashboard/DashboardView';
import DetectionView from './components/detection/DetectionView';
import RiskDetectionView from './components/risk/RiskDetectionView';
import HistoryView from './components/history/HistoryView';
import FeedbackView from './components/feedback/FeedbackView';
import BillingCenterView from './components/orders/BillingCenterView';
import OrdersView from './components/orders/OrdersView';
import ProfileView from './components/profile/ProfileView';
import HelpView from './components/help/HelpView';
import LegalDocumentView from './components/legal/LegalDocumentView';
import AdminPlatformView from './components/admin/AdminPlatformView';
import InstitutionPortalView from './components/admin/views/InstitutionPortalView';
import InstitutionMemberDashboardView from './components/institution/InstitutionMemberDashboardView';
import { initialInstitutions, InstitutionItem } from './data/adminMockData';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('landing');
  const [loginPortal, setLoginPortal] = useState<'personal' | 'institution'>('personal');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [selectedRecordForReport, setSelectedRecordForReport] = useState<PaperDetectionRecord | null>(null);
  const [historyDefaultType, setHistoryDefaultType] = useState<'paper' | 'risk'>('paper');

  // Institution Perspective Context
  const [currentInstitutionName, setCurrentInstitutionName] = useState<string>('武汉大学');
  const [currentInstitutionAdmin, setCurrentInstitutionAdmin] = useState<string>('王老师');
  const [currentInstitutionAdminRole, setCurrentInstitutionAdminRole] = useState<'总管理员' | '学院管理员'>('总管理员');
  const [currentInstitutionCollege, setCurrentInstitutionCollege] = useState<string>('全校');
  const [institutionSection, setInstitutionSection] = useState<'dashboard' | 'quota' | 'trial' | 'members' | 'colleges'>('dashboard');

  // Application State
  const [user, setUser] = useState<UserProfile>(initialUser);
  const [records, setRecords] = useState<PaperDetectionRecord[]>(initialRecords);
  const [batchTasks, setBatchTasks] = useState<BatchTask[]>(initialBatchTasks);
  const [orders, setOrders] = useState<OrderRecord[]>(initialOrders);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(initialInvoices);
  const [refundAudits, setRefundAudits] = useState<RefundAuditItem[]>(initialRefundAudits);
  const [institutions, setInstitutions] = useState<InstitutionItem[]>(initialInstitutions);
  const [policy, setPolicy] = useState<BillingPolicyConfig>(initialBillingPolicy);

  // Handlers
  const handleRechargeSuccess = (
    amount: number,
    credits: number,
    newOrder: OrderRecord,
    paidPart?: number,
    bonusPart?: number
  ) => {
    const baseCreditPerYuan = policy.baseCreditPerYuan || 100;
    const paid = paidPart !== undefined ? paidPart : amount * baseCreditPerYuan;
    const bonus = bonusPart !== undefined ? bonusPart : Math.max(0, credits - paid);

    setUser((prev) => ({
      ...prev,
      balance: prev.balance + credits,
      paidCredits: (prev.paidCredits ?? 9000) + paid,
      bonusCredits: (prev.bonusCredits ?? 1800) + bonus,
    }));
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleDetectionComplete = (newRecord: PaperDetectionRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
    setUser((prev) => {
      const cost = newRecord.cost;
      const ratioPaid = policy.deductionRatioPaid || 5;
      const ratioBonus = policy.deductionRatioBonus || 1;
      const totalRatio = ratioPaid + ratioBonus;
      // 5:1 internal deduction split
      const deductPaid = Math.round(cost * (ratioPaid / totalRatio));
      const deductBonus = cost - deductPaid;

      const curPaid = prev.paidCredits ?? 9000;
      const curBonus = prev.bonusCredits ?? 1800;

      return {
        ...prev,
        balance: Math.max(0, prev.balance - cost),
        paidCredits: Math.max(0, curPaid - deductPaid),
        bonusCredits: Math.max(0, curBonus - deductBonus),
        usedBalance: prev.usedBalance + cost,
        usedPaidCredits: (prev.usedPaidCredits ?? 1000) + deductPaid,
        usedBonusCredits: (prev.usedBonusCredits ?? 200) + deductBonus,
      };
    });

    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const cost = newRecord.cost;
    const ratioPaid = policy.deductionRatioPaid || 5;
    const ratioBonus = policy.deductionRatioBonus || 1;
    const totalRatio = ratioPaid + ratioBonus;
    const deductPaid = Math.round(cost * (ratioPaid / totalRatio));
    const deductBonus = cost - deductPaid;
    const invoiceableYuan = Number((deductPaid / 100).toFixed(2));

    const newConsumptionOrder: OrderRecord = {
      orderNo: `XF${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${Math.floor(100000 + Math.random() * 900000)}`,
      createTime: timeStr,
      payTime: timeStr,
      transactionId: `TX${Date.now().toString().slice(-14)}`,
      type: '消费订单',
      paperTitle: newRecord.title,
      amount: `¥${invoiceableYuan.toFixed(2)}`,
      numericAmount: invoiceableYuan,
      credits: `-${cost.toLocaleString()} 积分`,
      paidCredits: -deductPaid,
      bonusCredits: -deductBonus,
      channel: '积分抵扣',
      status: '已支付',
      invoicedStatus: '未开票', // 消费订单可以开发票
      invoiceableAmount: invoiceableYuan,
      refundStatus: '无退款',
      refundAmount: 0,
    };
    setOrders((prev) => [newConsumptionOrder, ...prev]);

    setSelectedRecordForReport(newRecord);
    setCurrentPage('history');
  };

  const handleBatchCreated = (newBatch: BatchTask) => {
    setBatchTasks((prev) => [newBatch, ...prev]);
    setCurrentPage('history');
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDeleteBatch = (id: string) => {
    setBatchTasks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans">
      {/* 0. If viewing Report Detail (Risk Report or Normative Report) */}
      {selectedRecordForReport ? (
        selectedRecordForReport.type === 'risk' ? (
          <RiskReportDetailView
            record={selectedRecordForReport}
            onBack={() => setSelectedRecordForReport(null)}
          />
        ) : (
          <ReportDetailView
            record={selectedRecordForReport}
            onBack={() => setSelectedRecordForReport(null)}
          />
        )
      ) : currentPage === 'landing' ? (
        /* 1. If on Landing Page: render full official website */
        <LandingPage 
          onEnterApp={(target, portal) => {
            if (portal) setLoginPortal(portal);
            setCurrentPage(target || 'dashboard');
          }} 
          onViewSampleReport={(sampleRecord) => setSelectedRecordForReport(sampleRecord)}
        />
      ) : currentPage === 'login' ? (
        /* 2. Standalone Login Page (两个不同入口：个人自费 vs 机构师生) */
        <LoginView
          currentUser={user}
          initialPortal={loginPortal}
          onLoginSuccess={(newUsername, phone, targetPage, instName, adminRole, collegeName, memberDetails) => {
            if (instName) {
              setCurrentInstitutionName(instName);
            }
            if (adminRole === '总管理员' || adminRole === '学院管理员') {
              setCurrentInstitutionAdminRole(adminRole);
            }
            if (collegeName) {
              setCurrentInstitutionCollege(collegeName);
            }

            // 1. Institution Admin Portal
            if (targetPage === 'institutionPortal') {
              const effectiveRole = adminRole === '学院管理员' ? '学院管理员' : '机构管理员';
              setUser((prev) => ({
                ...prev,
                username: newUsername,
                name: newUsername,
                role: effectiveRole,
                institution: instName || '武汉大学',
                college: collegeName || '全校',
                phone: phone || prev.phone,
                avatarLetter: newUsername[0] || '管',
                isInstitutionMember: false,
              }));
              setCurrentInstitutionAdmin(newUsername || (adminRole === '学院管理员' ? '张主任' : '王老师'));
              setCurrentInstitutionAdminRole(adminRole === '学院管理员' ? '学院管理员' : '总管理员');
              if (collegeName) {
                setCurrentInstitutionCollege(collegeName);
              }
              setInstitutionSection('dashboard');
              setCurrentPage('dashboard');
              return;
            }

            // 2. Platform Admin Platform
            if (targetPage === 'adminPlatform') {
              setUser((prev) => ({
                ...prev,
                username: newUsername || 'admin',
                name: newUsername || 'admin',
                role: '平台管理员',
                phone: phone || prev.phone,
                avatarLetter: '管',
                isInstitutionMember: false,
              }));
              setCurrentPage('adminPlatform');
              return;
            }

            // 3. 机构下的学生/老师账号登录
            if (adminRole === '机构学生' || adminRole === '机构教师' || memberDetails?.isInstitutionMember) {
              const isTeacher = adminRole === '机构教师' || memberDetails?.identity === '老师';
              setUser((prev) => ({
                ...prev,
                username: newUsername,
                name: memberDetails?.name || newUsername,
                role: isTeacher ? '机构教师' : '机构学生',
                identity: isTeacher ? '老师' : '学生',
                institution: instName || '武汉大学',
                college: collegeName || (isTeacher ? '电子信息学院' : '计算机学院'),
                studentNo: memberDetails?.studentNo || (isTeacher ? 'T20190802' : '20242021001'),
                advisorName: memberDetails?.advisorName || (isTeacher ? undefined : '李教授 (计算机学院)'),
                degreeType: memberDetails?.degreeType || (isTeacher ? '专任教师 / 硕士生导师' : '工学硕士研究生 (2024级)'),
                institutionTrialPapers: memberDetails?.institutionTrialPapers ?? (isTeacher ? 3 : 2),
                usedInstitutionTrialPapers: memberDetails?.usedInstitutionTrialPapers ?? (isTeacher ? 0 : 1),
                allocatedQuota: memberDetails?.allocatedQuota ?? (isTeacher ? 2000 : 1200),
                usedAllocatedQuota: memberDetails?.usedAllocatedQuota ?? (isTeacher ? 0 : 400),
                isInstitutionMember: true,
                phone: phone || prev.phone,
                avatarLetter: (memberDetails?.name || newUsername)[0] || (isTeacher ? '师' : '生'),
              }));
              setCurrentPage('dashboard');
              return;
            }

            // 4. 个人/自费学生账号登录
            if (newUsername) {
              setUser((prev) => ({
                ...prev,
                username: newUsername,
                name: newUsername,
                role: '普通用户',
                identity: undefined,
                institution: '',
                college: '',
                studentNo: undefined,
                isInstitutionMember: false,
                phone: phone || prev.phone,
                avatarLetter: newUsername[0] || prev.avatarLetter,
              }));
            }
            setCurrentPage(targetPage || 'dashboard');
          }}
          onNavigate={setCurrentPage}
        />
      ) : currentPage === 'adminPlatform' ? (
        /* Standalone System Admin Platform (1:1 with Screenshots) */
        <AdminPlatformView 
          onNavigate={setCurrentPage} 
          institutions={institutions}
          onUpdateInstitutions={setInstitutions}
          invoices={invoices}
          onUpdateInvoices={setInvoices}
          refundAudits={refundAudits}
          onUpdateRefundAudits={setRefundAudits}
          orders={orders}
          onUpdateOrders={setOrders}
          policy={policy}
          onUpdatePolicy={setPolicy}
          onOpenTrialPerspective={(schoolName) => {
            if (schoolName) setCurrentInstitutionName(schoolName);
            setUser((prev) => ({
              ...prev,
              role: '机构管理员',
              institution: schoolName || '武汉大学',
            }));
            setInstitutionSection('dashboard');
            setCurrentPage('dashboard');
          }}
        />
      ) : currentPage === 'terms' || currentPage === 'privacy' ? (
        /* 3. Standalone Legal Agreements (Exact match with Screenshots) */
        <LegalDocumentView
          initialType={currentPage}
          onNavigate={setCurrentPage}
          onBack={() => setCurrentPage('landing')}
        />
      ) : (
        /* 3. Authenticated Admin Platform Shell */
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar
            currentPage={currentPage}
            onNavigate={(page) => {
              if (user.role === '机构管理员' || user.role === '学院管理员' || user.role === '管理员') {
                if (page === 'dashboard' || page === 'quota' || page === 'trial' || page === 'members' || page === 'colleges') {
                  const targetSec = (page === 'trial' ? 'quota' : page === 'colleges' ? 'members' : page) as 'dashboard' | 'members' | 'quota';
                  setInstitutionSection(targetSec);
                  setCurrentPage(targetSec as PageKey);
                  return;
                }
              }
              setCurrentPage(page);
            }}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            userRole={user.role}
            institutionSection={institutionSection}
            onSelectInstitutionSection={(sec) => {
              const targetSec = (sec === 'trial' ? 'quota' : sec === 'colleges' ? 'members' : sec) as 'dashboard' | 'members' | 'quota';
              setInstitutionSection(targetSec);
              setCurrentPage(targetSec as PageKey);
            }}
          />

          {/* Main Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <Header
              user={user}
              onNavigate={setCurrentPage}
              onSearch={() => setCurrentPage('history')}
            />

            {/* Page View Container */}
            <main className="flex-1 p-5 sm:p-7 lg:p-10 xl:p-12 w-full">
              {(user.role === '机构管理员' || user.role === '学院管理员' || user.role === '管理员') ? (
                /* Institutional / College Admin Views (统一工作台架构) */
                <InstitutionPortalView
                  embedded
                  onNavigate={(page) => {
                    if (page === 'login') {
                      setUser((prev) => ({
                        ...prev,
                        role: '普通用户',
                        institution: '',
                      }));
                    }
                    setCurrentPage(page);
                  }}
                  institutionName={currentInstitutionName}
                  adminName={currentInstitutionAdmin}
                  adminRole={currentInstitutionAdminRole}
                  initialManagedDepartment={currentInstitutionCollege}
                  institutions={institutions}
                  onUpdateInstitutions={setInstitutions}
                  activeSection={institutionSection}
                  onChangeSection={(sec) => {
                    setInstitutionSection(sec);
                    setCurrentPage(sec as PageKey);
                  }}
                />
              ) : (
                /* Student / Personal User Views (Same shell, Student Features, without 校方试用) */
                <>
                  {currentPage === 'dashboard' && (
                    user.isInstitutionMember ? (
                      <InstitutionMemberDashboardView
                        user={user}
                        records={records}
                        onNavigate={setCurrentPage}
                        onOpenRecharge={() => setRechargeModalOpen(true)}
                        onViewRecord={(rec) => setSelectedRecordForReport(rec)}
                      />
                    ) : (
                      <DashboardView
                        user={user}
                        records={records}
                        onNavigate={setCurrentPage}
                        onOpenRecharge={() => setRechargeModalOpen(true)}
                        onViewRecord={(rec) => setSelectedRecordForReport(rec)}
                      />
                    )
                  )}

                  {currentPage === 'detection' && (
                    <DetectionView
                      user={user}
                      onDetectionComplete={handleDetectionComplete}
                      onBatchCreated={handleBatchCreated}
                      onOpenRecharge={() => setRechargeModalOpen(true)}
                    />
                  )}

                  {currentPage === 'riskDetection' && (
                    <RiskDetectionView
                      user={user}
                      onDetectionComplete={(record) => {
                        handleDetectionComplete(record);
                        setHistoryDefaultType('risk');
                      }}
                      onBatchCreated={(newBatch) => {
                        handleBatchCreated(newBatch);
                        setHistoryDefaultType('risk');
                      }}
                      onOpenRecharge={() => setRechargeModalOpen(true)}
                      onViewRecord={(rec) => setSelectedRecordForReport(rec)}
                      onNavigateToHistory={(type) => {
                        if (type) setHistoryDefaultType(type);
                        setCurrentPage('history');
                      }}
                    />
                  )}

                  {currentPage === 'history' && (
                    <HistoryView
                      user={user}
                      records={records}
                      batchTasks={batchTasks}
                      initialType={historyDefaultType}
                      onViewRecord={(rec) => setSelectedRecordForReport(rec)}
                      onDeleteRecord={handleDeleteRecord}
                      onDeleteBatch={handleDeleteBatch}
                    />
                  )}

                  {currentPage === 'feedback' && <FeedbackView />}

                  {(currentPage === 'orders' || currentPage === 'invoice') && (
                    <BillingCenterView
                      user={user}
                      orders={orders}
                      invoices={invoices}
                      refundAudits={refundAudits}
                      onUpdateOrders={setOrders}
                      onUpdateInvoices={setInvoices}
                      onUpdateRefundAudits={setRefundAudits}
                      onUpdateUser={handleUpdateUser}
                      onNavigate={setCurrentPage}
                      policy={policy}
                      initialTab={currentPage === 'invoice' ? 'invoices' : 'overview'}
                      initialInvoiceSubTab="orders"
                    />
                  )}

                  {currentPage === 'profile' && (
                    <ProfileView
                      user={user}
                      orders={orders}
                      institutions={institutions}
                      onUpdateUser={handleUpdateUser}
                      onNavigate={setCurrentPage}
                      onOpenRecharge={() => setRechargeModalOpen(true)}
                    />
                  )}

                  {currentPage === 'help' && <HelpView />}
                </>
              )}
            </main>

            {/* Admin Footer */}
            <footer className="py-4 text-center border-t border-slate-100 text-xs text-slate-400 bg-white">
              © 2026 论文智检. 保留所有权利。 | 鄂ICP备2026023941号-2
            </footer>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <RechargeModal
        isOpen={rechargeModalOpen}
        onClose={() => setRechargeModalOpen(false)}
        currentBalance={user.balance}
        policy={policy}
        onSuccess={handleRechargeSuccess}
      />
    </div>
  );
}
