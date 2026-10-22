import React, { useState } from 'react';
import { 
  GraduationCap, 
  Building2, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Upload, 
  ChevronRight, 
  Eye, 
  Clock, 
  ArrowRight, 
  Download, 
  Users, 
  Award, 
  AlertCircle, 
  BookOpen, 
  Send, 
  Check, 
  Zap, 
  Share2,
  HelpCircle,
  ExternalLink,
  UserCheck
} from 'lucide-react';
import { PageKey, PaperDetectionRecord, UserProfile } from '../../types';
import ThesisComplianceReceiptModal from './ThesisComplianceReceiptModal';

interface InstitutionMemberDashboardViewProps {
  user: UserProfile;
  records: PaperDetectionRecord[];
  onNavigate: (page: PageKey) => void;
  onOpenRecharge: () => void;
  onViewRecord: (record: PaperDetectionRecord) => void;
  onAllocateTrialToStudent?: (studentName: string) => void;
}

export default function InstitutionMemberDashboardView({
  user,
  records,
  onNavigate,
  onOpenRecharge,
  onViewRecord,
}: InstitutionMemberDashboardViewProps) {
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceiptRecord, setSelectedReceiptRecord] = useState<PaperDetectionRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const isTeacher = user.identity === '老师' || user.role === '机构教师';
  const schoolName = user.institution || '武汉大学';
  const collegeName = user.college || (isTeacher ? '电子信息学院' : '计算机学院');
  const studentOrTeacherNo = user.studentNo || (isTeacher ? 'T20190802' : '20242021001');
  const advisorName = user.advisorName || '李教授 (计算机学院)';
  const degreeType = user.degreeType || (isTeacher ? '专任教师 / 硕士生导师' : '工学硕士研究生 (2024级)');

  const availableTrials = user.institutionTrialPapers ?? (isTeacher ? 3 : 2);
  const usedTrials = user.usedInstitutionTrialPapers ?? (isTeacher ? 0 : 1);
  const totalTrials = availableTrials + usedTrials;

  const allocatedQuota = user.allocatedQuota ?? (isTeacher ? 2000 : 1200);
  const usedQuota = user.usedAllocatedQuota ?? (isTeacher ? 0 : 400);

  // Student thesis progress steps
  const [thesisStep, setThesisStep] = useState<number>(3); // Step 3: 导师已审核

  // Teacher advisee students mock data
  const [advisees, setAdvisees] = useState([
    {
      id: 'adv-1',
      name: '周宁',
      studentNo: '20242021001',
      degree: '学术型硕士',
      paperTitle: '0421人工智能赋能产业创新型城市建设的效应与机制研究',
      normScore: 96.5,
      riskLevel: '低风险',
      submitTime: '2026-10-19',
      reviewStatus: '已批准送审',
      trialsUsed: 1,
    },
    {
      id: 'adv-2',
      name: '林晚',
      studentNo: '2023101005',
      degree: '博士研究生',
      paperTitle: '复杂图神经网络在时序拓扑表征中的自适应剪枝策略',
      normScore: 94.0,
      riskLevel: '低风险',
      submitTime: '2026-10-18',
      reviewStatus: '待导师复核',
      trialsUsed: 2,
    },
    {
      id: 'adv-3',
      name: '许知夏',
      studentNo: '2022030114',
      degree: '本科毕业设计',
      paperTitle: '基于多模态大模型的边缘端视觉语义分割优化方案',
      normScore: 91.5,
      riskLevel: '低风险',
      submitTime: '2026-10-15',
      reviewStatus: '已审阅同意',
      trialsUsed: 1,
    },
  ]);

  const handleOpenReceipt = (rec?: PaperDetectionRecord) => {
    setSelectedReceiptRecord(rec || records[0] || null);
    setReceiptModalOpen(true);
  };

  const handlePushToAdvisor = () => {
    showToast(`【已成功推送】已将最新规范检测报告及《送审回执单》推送给指导教师【${advisorName}】`);
  };

  const handleTeacherApprove = (adviseeName: string) => {
    setAdvisees(prev => prev.map(a => a.name === adviseeName ? { ...a, reviewStatus: '已签署准予送审意见' } : a));
    showToast(`【已签署送审回执】已为学生【${adviseeName}】签署学位论文规范审查合格回执单！`);
  };

  const handleTeacherGiveTrial = (adviseeName: string) => {
    showToast(`【额度划拨成功】已成功将 1 篇校方试用额度划拨给学生【${adviseeName}】！`);
  };

  return (
    <div id="institution-member-dashboard" className="space-y-8 w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto pb-16 font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-sm font-medium px-5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Institutional Hero & Affiliation Verification Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 rounded-3xl p-7 sm:p-9 text-white shadow-xl shadow-indigo-950/15 border border-indigo-700/50">
        {/* Background Decorative Crest */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none select-none">
          <GraduationCap className="w-96 h-96 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Institution & College Tags */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs sm:text-sm font-bold border border-white/20">
                <Building2 className="w-4 h-4 text-indigo-300" />
                {schoolName}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs sm:text-sm font-semibold border border-white/15">
                {collegeName}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                高校统一身份认证 (已接入)
              </span>
            </div>

            {/* Greeting */}
            <div className="pt-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight flex items-center gap-3">
                <span>{user.name || user.username}</span>
                <span className="text-sm sm:text-base font-normal px-2.5 py-0.5 rounded-lg bg-indigo-700/60 text-indigo-200 border border-indigo-500/30">
                  {degreeType}
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/90 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>{isTeacher ? '教师工号' : '在籍学号'}：<strong className="text-white font-mono">{studentOrTeacherNo}</strong></span>
                <span>•</span>
                {!isTeacher && <span>指导教师：<strong className="text-white">{advisorName}</strong></span>}
                {!isTeacher && <span>•</span>}
                <span>校方授权有效期至：<strong className="text-white">2026-12-31</strong></span>
              </p>
            </div>
          </div>

          {/* Right Action: Quick Check Receipt / Guidelines */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0">
            <button
              onClick={() => handleOpenReceipt()}
              className="px-5 py-3 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer group hover:-translate-y-0.5"
            >
              <Award className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span>查验校方规范回执单</span>
            </button>

            <button
              onClick={() => onNavigate('detection')}
              className="px-5 py-3 rounded-2xl bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/30 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer group"
            >
              <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              <span>开始学位论文检测</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Institutional Exclusive Benefit Cards (3 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">校方资助与额度权益</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
            自动优选优先扣除：校方试用篇数（¥0自费）→ 学院专款额度 → 个人自备积分
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: 校方专属免费试用篇数 */}
          <div className="bg-white rounded-3xl border-2 border-indigo-100 hover:border-indigo-300 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                  <GraduationCap className="w-3.5 h-3.5" />
                  校方专属试用篇数
                </span>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  校方全额资助
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-indigo-600">
                    {availableTrials}
                  </span>
                  <span className="text-sm font-bold text-slate-500">篇 可用</span>
                  <span className="text-xs text-slate-400 ml-auto">
                    已用 {usedTrials} / 共 {totalTrials} 篇
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  可直接用于学位论文格式审查全项检测，含官方防伪回执单，免扣任何自费积分。
                </p>
              </div>
            </div>

            <div className="pt-5 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">扣除优先级：第一顺位</span>
              <button
                onClick={() => onNavigate('detection')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer group-hover:translate-x-0.5 transition-transform"
              >
                <span>立即使用</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: 学院下拨专款额度 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 hover:border-blue-300 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                  <Building2 className="w-3.5 h-3.5" />
                  {collegeName}专项补贴额度
                </span>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                  学院补贴
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-blue-600">
                    {allocatedQuota.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-500">积分 剩余</span>
                  <span className="text-xs text-slate-400 ml-auto">
                    已用 {usedQuota.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  专用于研究生盲审论文深度语法、意识形态与学术规范内容风险审查。
                </p>
              </div>
            </div>

            <div className="pt-5 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">扣除优先级：第二顺位</span>
              <button
                onClick={() => onNavigate('riskDetection')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer group-hover:translate-x-0.5 transition-transform"
              >
                <span>风险审查</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: 个人自备充值积分 */}
          <div className="bg-white rounded-3xl border border-slate-200/80 hover:border-slate-300 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  个人自备积分余额
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  自费充值结余
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    {user.balance.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-slate-500">积分</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  当校方试用篇数及学院额度用尽时，可使用个人积分自愿抵扣检测。
                </p>
              </div>
            </div>

            <div className="pt-5 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">扣除优先级：最终顺位</span>
              <button
                onClick={onOpenRecharge}
                className="text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1 cursor-pointer group-hover:translate-x-0.5 transition-transform"
              >
                <span>充值 / 开票</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Differentiated Role-Specific Workspace Section */}
      {!isTeacher ? (
        /* ======================================================== */
        /* STUDENT VIEW (周宁 / 林晚 / 许知夏 等校方认证学生)       */
        /* ======================================================== */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* Left Column: Thesis Defense Compliance Timeline (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-indigo-600" />
                    学位论文答辩审查闭环进度
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    《{schoolName}研究生学位论文格式审查与答辩资格认定实施规范》
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold">
                  盲审格式准予通过
                </span>
              </div>

              {/* Progress Milestones */}
              <div className="grid grid-cols-4 gap-2 pt-2 relative">
                {/* Connecting bar */}
                <div className="absolute top-5 left-8 right-8 h-1 bg-slate-100 z-0 hidden sm:block">
                  <div className="h-full bg-indigo-600 w-3/4 rounded-full" />
                </div>

                {/* Step 1 */}
                <div className="relative z-10 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    <Check className="w-5 h-5 stroke-[2.8]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">初稿自查</p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">92分 · 已完成</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative z-10 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    <Check className="w-5 h-5 stroke-[2.8]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">盲审格式检测</p>
                    <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">96.5分 · 达标</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative z-10 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    <Check className="w-5 h-5 stroke-[2.8]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">导师审核签字</p>
                    <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">李教授 · 已确认</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative z-10 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">院系终审归档</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">开题答辩前</p>
                  </div>
                </div>
              </div>

              {/* Current Thesis Details Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide">
                      当前送审定稿论文
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      《0421人工智能赋能产业创新型城市建设的效应与机制研究》
                    </h4>
                  </div>
                  <button
                    onClick={() => handleOpenReceipt()}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-indigo-600 hover:bg-indigo-50 shrink-0 shadow-2xs transition-colors cursor-pointer"
                  >
                    查看合格回执
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                  <div>检测资助：<strong className="text-slate-700">校方试用篇数</strong></div>
                  <div>盲审合规率：<strong className="text-emerald-600 font-bold">98.8%</strong></div>
                  <div>引文规范：<strong className="text-slate-700">GB/T 7714合规</strong></div>
                </div>
              </div>
            </div>

            {/* Advisor Connection Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  指导教师互联与审核回执
                </h3>
                <span className="text-xs text-slate-400">院系教务系统同步数据</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                    李
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{advisorName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      最近反馈：<span className="text-slate-800 font-medium">论文格式与学术规范已审阅，准予按期盲审送审。</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePushToAdvisor}
                  className="px-4 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer self-start sm:self-auto"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>重发报告给导师</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Campus Thesis Guidelines & Downloads (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Campus Guidelines & Notice */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  校方学位论文规范与通知
                </h3>
                <span className="text-xs text-indigo-600 font-semibold cursor-pointer hover:underline">
                  教务公告
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 transition-colors border border-slate-100 space-y-1.5 cursor-pointer group">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      《{schoolName}研究生学位论文撰写规范指南 (2026版)》
                    </span>
                    <span className="text-[10px] text-slate-400">PDF</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    包含封面、中英文摘要、目录结构、图表标注及参考文献排版规则。
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 transition-colors border border-slate-100 space-y-1.5 cursor-pointer group">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      《计算机学院硕士学位论文格式自查与盲审抽检细则》
                    </span>
                    <span className="text-[10px] text-slate-400">DOCX</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    重点检查公式编号、跨页表格表头重复及多级标题连续规范。
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 transition-colors border border-slate-100 space-y-1.5 cursor-pointer group">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                      《学术智能规范检测平台试用额度使用操作指引》
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">校方试用</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    说明试用篇数抵扣流程及答辩回执单防伪查验步骤。
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/80 rounded-3xl p-6 border border-indigo-100 space-y-3.5">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                常用检测入口
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => onNavigate('detection')}
                  className="p-3 bg-white rounded-xl border border-indigo-100 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 font-bold text-left transition-all shadow-2xs cursor-pointer flex items-center justify-between"
                >
                  <span>发起规范检测</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
                <button
                  onClick={() => onNavigate('riskDetection')}
                  className="p-3 bg-white rounded-xl border border-indigo-100 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-bold text-left transition-all shadow-2xs cursor-pointer flex items-center justify-between"
                >
                  <span>发起风险检测</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
                <button
                  onClick={() => handleOpenReceipt()}
                  className="p-3 bg-white rounded-xl border border-indigo-100 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 font-bold text-left transition-all shadow-2xs cursor-pointer flex items-center justify-between"
                >
                  <span>打印盲审回执</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
                <button
                  onClick={() => onNavigate('history')}
                  className="p-3 bg-white rounded-xl border border-indigo-100 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 font-bold text-left transition-all shadow-2xs cursor-pointer flex items-center justify-between"
                >
                  <span>历史检测报告</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* TEACHER VIEW (张宇轩 等校方专任教师/导师)                */
        /* ======================================================== */
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  指导研究生学位论文审查与回执签署工作台
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  查看课题组研究生提交的规范检测报告，一键审核签署盲审送审回执单或划拨专属试用额度
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-indigo-50 text-indigo-700 text-xs font-bold shrink-0">
                <span>当前指导学生：<strong>{advisees.length}</strong> 人</span>
                <span>•</span>
                <span>可用导师机动额度：<strong>{availableTrials}</strong> 篇</span>
              </div>
            </div>

            {/* Advisee Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200/80 text-slate-400 text-xs">
                    <th className="py-3 px-3 font-semibold">学生姓名 / 学号</th>
                    <th className="py-3 px-3 font-semibold">学位层次</th>
                    <th className="py-3 px-3 font-semibold">送审学位论文题名</th>
                    <th className="py-3 px-3 font-semibold">规范评分</th>
                    <th className="py-3 px-3 font-semibold">提交时间</th>
                    <th className="py-3 px-3 font-semibold">导师审核状态</th>
                    <th className="py-3 px-3 font-semibold text-right">导师操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {advisees.map((adv) => (
                    <tr key={adv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-3">
                        <div className="font-bold text-slate-900">{adv.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{adv.studentNo}</div>
                      </td>
                      <td className="py-4 px-3 text-slate-600">
                        {adv.degree}
                      </td>
                      <td className="py-4 px-3 max-w-xs">
                        <div className="font-medium text-slate-800 truncate" title={adv.paperTitle}>
                          {adv.paperTitle}
                        </div>
                        <div className="text-[11px] text-emerald-600 mt-0.5">
                          资助来源：校方试用 (已用 {adv.trialsUsed} 篇)
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="text-base font-black text-indigo-600">
                          {adv.normScore}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">分</span>
                      </td>
                      <td className="py-4 px-3 text-slate-500 font-mono text-xs">
                        {adv.submitTime}
                      </td>
                      <td className="py-4 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          adv.reviewStatus.includes('送审') || adv.reviewStatus.includes('同意')
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {adv.reviewStatus}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTeacherApprove(adv.name)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                            title="签署准予送审意见"
                          >
                            签署回执
                          </button>
                          <button
                            onClick={() => handleTeacherGiveTrial(adv.name)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                            title="从导师可用额度中分配1篇给该学生"
                          >
                            下发试用(+1)
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Receipt Modal */}
      <ThesisComplianceReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        record={selectedReceiptRecord}
        user={user}
      />
    </div>
  );
}
