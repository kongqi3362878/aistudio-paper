import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Check, 
  BarChart2, 
  Smartphone, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Sparkles,
  CheckCircle2,
  Building2,
  GraduationCap,
  School,
  User,
  Users,
  ChevronDown
} from 'lucide-react';
import { PageKey, UserProfile } from '../../types';
import BrandLogo from '../common/BrandLogo';

export interface MemberLoginDetails {
  name?: string;
  identity?: '学生' | '老师';
  studentNo?: string;
  advisorName?: string;
  degreeType?: string;
  institutionTrialPapers?: number;
  usedInstitutionTrialPapers?: number;
  allocatedQuota?: number;
  usedAllocatedQuota?: number;
  isInstitutionMember?: boolean;
}

interface LoginViewProps {
  onLoginSuccess: (
    username: string, 
    phone?: string, 
    targetPage?: PageKey, 
    institutionName?: string,
    adminRole?: '总管理员' | '学院管理员' | '机构学生' | '机构教师',
    collegeName?: string,
    memberDetails?: MemberLoginDetails
  ) => void;
  onNavigate: (page: PageKey) => void;
  currentUser?: UserProfile;
  initialPortal?: 'personal' | 'institution';
}

export default function LoginView({ 
  onLoginSuccess, 
  onNavigate, 
  currentUser,
  initialPortal = 'personal'
}: LoginViewProps) {
  // 两个不同入口的顶级切换：'personal' (个人/学生入口) vs 'institution' (机构学生/老师专属入口)
  const [portalMode, setPortalMode] = useState<'personal' | 'institution'>(initialPortal);

  // Tab state within portal
  // Personal: 'sms' (验证码登录) or 'password' (密码登录)
  const [personalTab, setPersonalTab] = useState<'sms' | 'password'>('sms');

  // Institution: 'sso' (统一身份认证/学号工号登录) or 'instPhone' (机构预留手机号登录)
  const [institutionTab, setInstitutionTab] = useState<'sso' | 'instPhone'>('sso');

  // Personal form states
  const [phone, setPhone] = useState('13800138000');
  const [smsCode, setSmsCode] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [account, setAccount] = useState('linwan');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  // Institution form states
  const [selectedSchool, setSelectedSchool] = useState('武汉大学');
  const [selectedCollege, setSelectedCollege] = useState('计算机学院');
  const [instAccountNo, setInstAccountNo] = useState('20242021001'); // 学号或工号
  const [instPassword, setInstPassword] = useState('123456');
  const [showInstPassword, setShowInstPassword] = useState(false);
  const [instPhone, setInstPhone] = useState('13800132031');
  const [instSmsCode, setInstSmsCode] = useState('');

  // SMS countdown state
  const [countdown, setCountdown] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const schoolOptions = ['武汉大学', '华中科技大学', '华中师范大学', '长春工业大学'];
  const collegeOptionsMap: Record<string, string[]> = {
    '武汉大学': ['计算机学院', '电子信息学院', '文学院', '经济与管理学院', '法学院'],
    '华中科技大学': ['计算机科学与技术学院', '光学与电子信息学院', '机械科学与工程学院'],
    '华中师范大学': ['教育学院', '文学院', '心理学院'],
    '长春工业大学': ['计算机科学工程学院', '化学与化工学院']
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSendCode = (isInst = false) => {
    const targetPhone = isInst ? instPhone : phone;
    if (!targetPhone || targetPhone.trim().length < 11) {
      showToast('请输入正确的11位手机号码');
      return;
    }
    const fakeCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (isInst) {
      setInstSmsCode(fakeCode);
    } else {
      setSmsCode(fakeCode);
    }
    setCountdown(60);
    showToast(`【论文智检】验证码已发送：${fakeCode}（已为您自动填入）`);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ==========================================
    // 1. 个人/学生账号登录入口
    // ==========================================
    if (portalMode === 'personal') {
      if (personalTab === 'sms') {
        if (!phone.trim()) {
          showToast('请输入手机号码');
          return;
        }
        if (!smsCode.trim()) {
          showToast('请输入验证码（可点击右侧获取验证码）');
          return;
        }
        if (!agreedTerms) {
          showToast('请阅读并勾选《用户服务协议》和《隐私政策》');
          return;
        }
        showToast('个人登录成功，正在进入个人/学生自费工作台...');
        setTimeout(() => {
          onLoginSuccess(
            phone.slice(0, 3) + '****' + phone.slice(-4), 
            phone, 
            'dashboard', 
            '', 
            undefined, 
            '', 
            { isInstitutionMember: false }
          );
        }, 500);
      } else {
        if (!account.trim()) {
          showToast('请输入邮箱或用户名');
          return;
        }
        if (!password.trim()) {
          showToast('请输入密码');
          return;
        }

        const trimmedAcc = account.trim().toLowerCase();

        // Check if admin
        if (trimmedAcc === 'admin') {
          showToast('平台管理员认证成功，正在进入平台管理后台...');
          setTimeout(() => {
            onLoginSuccess('admin', undefined, 'adminPlatform');
          }, 500);
          return;
        }

        // Regular personal student
        showToast('个人自费账号登录成功，正在进入个人工作台（无校方试用栏目）...');
        setTimeout(() => {
          onLoginSuccess(
            account.trim(), 
            undefined, 
            'dashboard', 
            '', 
            undefined, 
            '', 
            { isInstitutionMember: false }
          );
        }, 500);
      }
      return;
    }

    // ==========================================
    // 2. 机构学生/老师专属登录入口
    // ==========================================
    if (portalMode === 'institution') {
      if (institutionTab === 'sso') {
        if (!instAccountNo.trim()) {
          showToast('请输入学号或工号');
          return;
        }
        if (!instPassword.trim()) {
          showToast('请输入密码');
          return;
        }

        const trimmedNo = instAccountNo.trim();

        // 机构总管理员
        if (trimmedNo === 'whu_admin' || trimmedNo.includes('王老师') || trimmedNo === '13800138001') {
          showToast(`机构总管理员认证成功（${selectedSchool}），正在进入机构管理门户...`);
          setTimeout(() => {
            onLoginSuccess('王老师', '138****1024', 'institutionPortal', selectedSchool, '总管理员');
          }, 500);
          return;
        }

        // 学院管理员
        if (trimmedNo === 'whu_cs_admin' || trimmedNo.includes('张主任') || trimmedNo === '13800139901') {
          showToast(`计算机学院管理员认证成功（${selectedSchool}），正在进入学院管理门户...`);
          setTimeout(() => {
            onLoginSuccess('张主任', '138****9901', 'institutionPortal', selectedSchool, '学院管理员', '计算机学院');
          }, 500);
          return;
        }

        // 机构教师 (工号开头 T 或 手机匹配)
        if (trimmedNo.startsWith('T') || trimmedNo.includes('张宇轩') || trimmedNo === '13900130312') {
          showToast(`校方统一认证成功！欢迎【张宇轩】专任教师（${selectedSchool} · 电子信息学院），正在进入教师专属工作台...`);
          setTimeout(() => {
            onLoginSuccess(
              '张宇轩',
              '139****0312',
              'dashboard',
              selectedSchool,
              '机构教师',
              '电子信息学院',
              {
                name: '张宇轩',
                identity: '老师',
                studentNo: 'T20190802',
                degreeType: '副教授 / 硕士生导师',
                institutionTrialPapers: 3,
                usedInstitutionTrialPapers: 0,
                allocatedQuota: 2000,
                usedAllocatedQuota: 0,
                isInstitutionMember: true,
              }
            );
          }, 500);
          return;
        }

        // 机构学生（林晚 文学院）
        if (trimmedNo === '2023101005' || trimmedNo.includes('林晚') || trimmedNo === '13900135628') {
          showToast(`校方统一认证成功！欢迎【林晚】博士生（${selectedSchool} · 文学院），正在进入学生专属工作台...`);
          setTimeout(() => {
            onLoginSuccess(
              '林晚',
              '139****5628',
              'dashboard',
              selectedSchool,
              '机构学生',
              '文学院',
              {
                name: '林晚',
                identity: '学生',
                studentNo: '2023101005',
                advisorName: '程教授 (文学院)',
                degreeType: '文学博士研究生 (2023级)',
                institutionTrialPapers: 1,
                usedInstitutionTrialPapers: 0,
                allocatedQuota: 800,
                usedAllocatedQuota: 0,
                isInstitutionMember: true,
              }
            );
          }, 500);
          return;
        }

        // 机构学生（许知夏 经济与管理学院）
        if (trimmedNo === '2022030114' || trimmedNo.includes('许知夏') || trimmedNo === '13700137814') {
          showToast(`校方统一认证成功！欢迎【许知夏】本科生（${selectedSchool} · 经济与管理学院），正在进入学生工作台...`);
          setTimeout(() => {
            onLoginSuccess(
              '许知夏',
              '137****7814',
              'dashboard',
              selectedSchool,
              '机构学生',
              '经济与管理学院',
              {
                name: '许知夏',
                identity: '学生',
                studentNo: '2022030114',
                advisorName: '赵副教授',
                degreeType: '经济学本科生 (2022级)',
                institutionTrialPapers: 1,
                usedInstitutionTrialPapers: 0,
                allocatedQuota: 600,
                usedAllocatedQuota: 0,
                isInstitutionMember: true,
              }
            );
          }, 500);
          return;
        }

        // 默认匹配 周宁 (计算机学院·硕士生)
        showToast(`校方统一认证成功！欢迎【周宁】硕士研究生（${selectedSchool} · ${selectedCollege}），正在进入机构学生专属工作台...`);
        setTimeout(() => {
          onLoginSuccess(
            '周宁',
            '138****2031',
            'dashboard',
            selectedSchool,
            '机构学生',
            selectedCollege,
            {
              name: '周宁',
              identity: '学生',
              studentNo: trimmedNo || '20242021001',
              advisorName: '李教授 (计算机学院)',
              degreeType: '工学硕士研究生 (2024级)',
              institutionTrialPapers: 2,
              usedInstitutionTrialPapers: 1,
              allocatedQuota: 1200,
              usedAllocatedQuota: 400,
              isInstitutionMember: true,
            }
          );
        }, 500);
      } else {
        // 机构预留手机号验证登录
        if (!instPhone.trim()) {
          showToast('请输入机构预留的手机号码');
          return;
        }
        if (!instSmsCode.trim()) {
          showToast('请输入短信验证码');
          return;
        }

        showToast(`校方预留手机号校验通过！欢迎【周宁】硕士研究生（${selectedSchool}），正在进入学生专属工作台...`);
        setTimeout(() => {
          onLoginSuccess(
            '周宁',
            instPhone,
            'dashboard',
            selectedSchool,
            '机构学生',
            '计算机学院',
            {
              name: '周宁',
              identity: '学生',
              studentNo: '20242021001',
              advisorName: '李教授 (计算机学院)',
              degreeType: '工学硕士研究生 (2024级)',
              institutionTrialPapers: 2,
              usedInstitutionTrialPapers: 1,
              allocatedQuota: 1200,
              usedAllocatedQuota: 400,
              isInstitutionMember: true,
            }
          );
        }, 500);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFD] flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-sm font-medium px-5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Bar */}
      <header className="w-full max-w-[1720px] mx-auto px-6 sm:px-12 py-6 flex items-center justify-between shrink-0">
        <BrandLogo onClick={() => onNavigate('landing')} />

        <button
          id="login-back-to-home-btn"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>返回主页</span>
        </button>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 sm:px-12 py-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Feature Showcase                           */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 space-y-7 max-w-xl">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-xs sm:text-sm text-slate-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>已为 120+ 所高校与 10,000+ 篇学位论文提供权威检测</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-black text-slate-900 tracking-tight leading-[1.18]">
                学术论文
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-black text-[#4F46E5] tracking-tight leading-[1.18]">
                规范性智能检测系统
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              支持个人自费学者与校方签约高校师生双通道登录；提供错别字、病句、图表格式、引文规范与校方官方防伪送审回执单闭环服务。
            </p>

            {/* Dual Entrance Feature Highlight Cards */}
            <div className="space-y-3 pt-1">
              <div className={`p-4 rounded-2xl border transition-all ${
                portalMode === 'institution'
                  ? 'bg-indigo-50/70 border-indigo-200 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm sm:text-base">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span>机构学生 / 老师专属入口</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                    高校/院系通道
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  通过学号/工号或高校统一身份认证登录。<strong>享校方免费试用篇数与学院专款补贴</strong>，可一键生成《校方学位论文规范审查合格回执单》。
                </p>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                portalMode === 'personal'
                  ? 'bg-blue-50/70 border-blue-200 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:border-slate-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 font-bold text-slate-900 text-sm sm:text-base">
                    <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span>个人 / 学生登录入口</span>
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    个人自费
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  适用于常规独立学者、未与平台签约高校的自费研究生。使用个人充值积分进行论文检测与个人发票开具。
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Dual-Entrance Login Card                   */}
          {/* ======================================================== */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="w-full max-w-[500px] bg-white rounded-[32px] p-7 sm:p-9 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
              
              {/* TOP LEVEL DUAL-ENTRANCE SWITCHER (两个不同入口) */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  请选择您的登录身份与入口：
                </div>
                <div className="bg-[#F1F5F9] p-1.5 rounded-2xl grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    id="entrance-btn-personal"
                    onClick={() => setPortalMode('personal')}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      portalMode === 'personal'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>个人 / 学生入口</span>
                  </button>

                  <button
                    type="button"
                    id="entrance-btn-institution"
                    onClick={() => setPortalMode('institution')}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      portalMode === 'institution'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span>机构学生/老师入口</span>
                  </button>
                </div>
              </div>

              {/* Portal Header Titles */}
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  {portalMode === 'personal' ? (
                    <>
                      <User className="w-5 h-5 text-blue-600" />
                      <span>个人 / 自费学生登录</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-5 h-5 text-indigo-600" />
                      <span>机构学生 / 老师专属登录</span>
                    </>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-1 leading-normal">
                  {portalMode === 'personal'
                    ? '适用于独立学者与自费用户，通过个人手机短信或密码登录。'
                    : '高校统一认证通道，已接入校方的学生/老师享免费试用与学院专款。'}
                </p>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* ======================================================== */}
                {/* 1. PERSONAL ENTRANCE FORM BODY                           */}
                {/* ======================================================== */}
                {portalMode === 'personal' ? (
                  <>
                    {/* Sub Switcher for Personal: SMS vs Password */}
                    <div className="flex border-b border-slate-100 pb-2 text-xs font-semibold gap-6">
                      <button
                        type="button"
                        onClick={() => setPersonalTab('sms')}
                        className={`pb-1 cursor-pointer transition-colors ${
                          personalTab === 'sms'
                            ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        手机验证码登录
                      </button>
                      <button
                        type="button"
                        onClick={() => setPersonalTab('password')}
                        className={`pb-1 cursor-pointer transition-colors ${
                          personalTab === 'password'
                            ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        账号密码登录
                      </button>
                    </div>

                    {personalTab === 'sms' ? (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 block">手机号</label>
                          <div className="relative flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <Smartphone className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                            <input
                              type="tel"
                              maxLength={11}
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="请输入手机号"
                              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 block">验证码</label>
                          <div className="flex items-center gap-2.5">
                            <div className="relative flex-1 flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                              <ShieldCheck className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                              <input
                                type="text"
                                maxLength={6}
                                value={smsCode}
                                onChange={(e) => setSmsCode(e.target.value)}
                                placeholder="请输入验证码"
                                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              disabled={countdown > 0}
                              onClick={() => handleSendCode(false)}
                              className="px-3.5 py-3 text-xs font-semibold rounded-2xl shrink-0 bg-slate-100 hover:bg-slate-200/80 text-slate-700 cursor-pointer"
                            >
                              {countdown > 0 ? `${countdown}s` : '获取验证码'}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 block">用户名 / 邮箱</label>
                          <div className="relative flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                            <input
                              type="text"
                              value={account}
                              onChange={(e) => setAccount(e.target.value)}
                              placeholder="请输入用户名"
                              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 block">密码</label>
                          <div className="relative flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <Lock className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="请输入密码"
                              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Terms */}
                    <label className="flex items-start gap-2.5 text-xs text-slate-500 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span>
                        我已阅读并同意
                        <button type="button" onClick={() => onNavigate('terms')} className="text-indigo-600 hover:underline mx-0.5 font-medium">《用户服务协议》</button>
                        和
                        <button type="button" onClick={() => onNavigate('privacy')} className="text-indigo-600 hover:underline mx-0.5 font-medium">《隐私政策》</button>
                      </span>
                    </label>

                    {/* Quick Test Personal Accounts */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400">个人测试账号（点击一键测试）：</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setAccount('linwan');
                            setPassword('123456');
                            setPersonalTab('password');
                          }}
                          className="p-2 rounded-xl border border-slate-200 hover:border-indigo-400 text-left bg-white text-slate-700 cursor-pointer"
                        >
                          <div className="font-bold flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-blue-500" />
                            <span>个人自费学生</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">linwan · 无校方试用</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAccount('admin');
                            setPassword('123456');
                            setPersonalTab('password');
                          }}
                          className="p-2 rounded-xl border border-slate-200 hover:border-purple-400 text-left bg-white text-slate-700 cursor-pointer"
                        >
                          <div className="font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-purple-500" />
                            <span>平台总管理员</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">admin · 平台后台</div>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* ======================================================== */
                  /* 2. INSTITUTION ENTRANCE FORM BODY (高校师生专属通道)     */
                  /* ======================================================== */
                  <>
                    {/* Sub Switcher for Institution: SSO/Student ID vs Campus Phone */}
                    <div className="flex border-b border-slate-100 pb-2 text-xs font-semibold gap-6">
                      <button
                        type="button"
                        onClick={() => setInstitutionTab('sso')}
                        className={`pb-1 cursor-pointer transition-colors ${
                          institutionTab === 'sso'
                            ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        学号 / 工号 / 统一身份认证
                      </button>
                      <button
                        type="button"
                        onClick={() => setInstitutionTab('instPhone')}
                        className={`pb-1 cursor-pointer transition-colors ${
                          institutionTab === 'instPhone'
                            ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        机构预留手机号登录
                      </button>
                    </div>

                    {institutionTab === 'sso' ? (
                      <>
                        {/* School and College Selection */}
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 block">所属高校</label>
                            <select
                              value={selectedSchool}
                              onChange={(e) => {
                                setSelectedSchool(e.target.value);
                                setSelectedCollege(collegeOptionsMap[e.target.value]?.[0] || '计算机学院');
                              }}
                              className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
                            >
                              {schoolOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-700 block">所属学院</label>
                            <select
                              value={selectedCollege}
                              onChange={(e) => setSelectedCollege(e.target.value)}
                              className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
                            >
                              {(collegeOptionsMap[selectedSchool] || ['计算机学院']).map(c => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Student / Teacher ID */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 block">学号 / 教师工号</label>
                          <div className="relative flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <GraduationCap className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                            <input
                              type="text"
                              value={instAccountNo}
                              onChange={(e) => setInstAccountNo(e.target.value)}
                              placeholder="请输入学号（如 20242021001）或教师工号"
                              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 block">校内统一认证密码</label>
                          <div className="relative flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <Lock className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                            <input
                              type={showInstPassword ? 'text' : 'password'}
                              value={instPassword}
                              onChange={(e) => setInstPassword(e.target.value)}
                              placeholder="默认密码：123456"
                              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setShowInstPassword(!showInstPassword)}
                              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                            >
                              {showInstPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 block">机构预留手机号</label>
                          <div className="relative flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                            <Smartphone className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                            <input
                              type="tel"
                              maxLength={11}
                              value={instPhone}
                              onChange={(e) => setInstPhone(e.target.value)}
                              placeholder="输入校方名单导入的预留手机号"
                              className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700 block">验证码</label>
                          <div className="flex items-center gap-2.5">
                            <div className="relative flex-1 flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                              <ShieldCheck className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                              <input
                                type="text"
                                maxLength={6}
                                value={instSmsCode}
                                onChange={(e) => setInstSmsCode(e.target.value)}
                                placeholder="请输入验证码"
                                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              disabled={countdown > 0}
                              onClick={() => handleSendCode(true)}
                              className="px-3.5 py-3 text-xs font-semibold rounded-2xl shrink-0 bg-slate-100 hover:bg-slate-200/80 text-slate-700 cursor-pointer"
                            >
                              {countdown > 0 ? `${countdown}s` : '获取验证码'}
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Quick-fill Institutional Students and Teachers */}
                    <div className="pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="text-[11px] font-bold text-indigo-700 flex items-center justify-between">
                        <span>机构师生体验账号（点击一键填入）：</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {/* Option 1: Student Zhou Ning */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSchool('武汉大学');
                            setSelectedCollege('计算机学院');
                            setInstAccountNo('20242021001');
                            setInstPassword('123456');
                            setInstPhone('13800132031');
                            setInstitutionTab('sso');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            instAccountNo === '20242021001'
                              ? 'border-indigo-600 bg-indigo-50/90 text-indigo-900 font-bold shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1 font-bold">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                            <span>周宁 · 硕士生</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            武大·计算机 (2篇试用+1200积分)
                          </div>
                        </button>

                        {/* Option 2: Teacher Zhang Yuxuan */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSchool('武汉大学');
                            setSelectedCollege('电子信息学院');
                            setInstAccountNo('T20190802');
                            setInstPassword('123456');
                            setInstPhone('13900130312');
                            setInstitutionTab('sso');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            instAccountNo === 'T20190802'
                              ? 'border-indigo-600 bg-indigo-50/90 text-indigo-900 font-bold shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1 font-bold">
                            <Users className="w-3.5 h-3.5 text-indigo-600" />
                            <span>张宇轩 · 专任导师</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            武大·电子 (3篇试用+审查指导)
                          </div>
                        </button>

                        {/* Option 3: Student Lin Wan */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSchool('武汉大学');
                            setSelectedCollege('文学院');
                            setInstAccountNo('2023101005');
                            setInstPassword('123456');
                            setInstPhone('13900135628');
                            setInstitutionTab('sso');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            instAccountNo === '2023101005'
                              ? 'border-indigo-600 bg-indigo-50/90 text-indigo-900 font-bold shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1 font-bold">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                            <span>林晚 · 博士生</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            武大·文学院 (1篇试用+800积分)
                          </div>
                        </button>

                        {/* Option 4: Institution Admin Wang */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSchool('武汉大学');
                            setSelectedCollege('全校');
                            setInstAccountNo('whu_admin');
                            setInstPassword('123456');
                            setInstitutionTab('sso');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            instAccountNo === 'whu_admin'
                              ? 'border-indigo-600 bg-indigo-50/90 text-indigo-900 font-bold shadow-2xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1 font-bold">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>王老师 · 总管理员</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            武大·研究生院 (机构管理后台)
                          </div>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Big Login Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="login-submit-btn"
                    className={`w-full py-3.5 rounded-2xl text-white font-bold text-base transition-all active:scale-[0.99] shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                      portalMode === 'institution'
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-500/25 hover:shadow-lg'
                        : 'bg-[#5B55EA] hover:bg-[#4E47E5] shadow-indigo-500/25 hover:shadow-lg'
                    }`}
                  >
                    <span>
                      {portalMode === 'institution' ? '以机构师生身份登录' : '登录个人工作台'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="py-4 text-center border-t border-slate-100 text-xs text-slate-400 bg-white/60">
        © 2026 论文智检. 保留所有权利。 | 鄂ICP备2026023941号-2
      </footer>
    </div>
  );
}
