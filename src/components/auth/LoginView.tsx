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
  GraduationCap
} from 'lucide-react';
import { PageKey, UserProfile } from '../../types';
import BrandLogo from '../common/BrandLogo';

interface LoginViewProps {
  onLoginSuccess: (
    username: string, 
    phone?: string, 
    targetPage?: PageKey, 
    institutionName?: string,
    adminRole?: '总管理员' | '学院管理员',
    collegeName?: string
  ) => void;
  onNavigate: (page: PageKey) => void;
  currentUser?: UserProfile;
}

export default function LoginView({ onLoginSuccess, onNavigate, currentUser }: LoginViewProps) {
  // Tab state: 'sms' (验证码登录) or 'password' (密码登录)
  const [activeTab, setActiveTab] = useState<'sms' | 'password'>('sms');

  // Form states
  const [phone, setPhone] = useState('13800138000');
  const [smsCode, setSmsCode] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [account, setAccount] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  // SMS countdown state
  const [countdown, setCountdown] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleSendCode = () => {
    if (!phone || phone.trim().length < 11) {
      showToast('请输入正确的11位手机号码');
      return;
    }
    const fakeCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSmsCode(fakeCode);
    setCountdown(60);
    showToast(`【论文智检】验证码已发送：${fakeCode}（已为您自动填入）`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'sms') {
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
      // Successful SMS login
      showToast('登录成功，正在进入工作台...');
      setTimeout(() => {
        onLoginSuccess(phone.slice(0, 3) + '****' + phone.slice(-4), phone);
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
      
      // Determine if account is a college administrator
      if (
        trimmedAcc === 'whu_cs_admin' || 
        trimmedAcc === 'cs_admin' || 
        trimmedAcc.includes('张主任') || 
        trimmedAcc.includes('学院管理') ||
        trimmedAcc === '13800139901'
      ) {
        showToast('计算机学院管理员认证成功（武汉大学），正在进入学院管理工作台...');
        setTimeout(() => {
          onLoginSuccess('张主任', '138****9901', 'institutionPortal', '武汉大学', '学院管理员', '计算机学院');
        }, 500);
        return;
      }

      // Determine if account is an institution administrator account
      const isInstitutionAccount = 
        trimmedAcc === 'whu_admin' || 
        trimmedAcc === 'whu' || 
        trimmedAcc === 'ccnu_yjq' || 
        trimmedAcc === 'ccgydxyjs' || 
        trimmedAcc === 'hust_admin' || 
        trimmedAcc === 'hust' || 
        trimmedAcc.includes('机构') || 
        trimmedAcc.includes('school') || 
        trimmedAcc.includes('inst') || 
        trimmedAcc.includes('whu') || 
        trimmedAcc.includes('ccnu') || 
        trimmedAcc.includes('大学') || 
        trimmedAcc.includes('王老师') || 
        trimmedAcc.includes('杨金庆') ||
        trimmedAcc.includes('黄鑫昊') ||
        trimmedAcc === '13800138001';

      if (isInstitutionAccount) {
        let instName = '武汉大学';
        let adminDisplayName = '王老师';

        if (trimmedAcc.includes('ccnu') || trimmedAcc.includes('杨金庆') || trimmedAcc.includes('华中师范')) {
          instName = '华中师范大学';
          adminDisplayName = '杨金庆';
        } else if (trimmedAcc.includes('ccgy') || trimmedAcc.includes('长春工业') || trimmedAcc.includes('黄鑫昊')) {
          instName = '长春工业大学';
          adminDisplayName = '黄鑫昊';
        } else if (trimmedAcc.includes('hust') || trimmedAcc.includes('华中科技') || trimmedAcc.includes('陈老师')) {
          instName = '华中科技大学';
          adminDisplayName = '陈老师';
        }

        showToast(`机构总管理员认证成功（${instName}），正在进入机构管理门户...`);
        setTimeout(() => {
          onLoginSuccess(adminDisplayName, '138****1024', 'institutionPortal', instName, '总管理员');
        }, 500);
        return;
      }

      if (trimmedAcc === 'admin') {
        showToast('平台管理员认证成功，正在进入平台管理后台...');
        setTimeout(() => {
          onLoginSuccess('admin', undefined, 'adminPlatform');
        }, 500);
        return;
      }

      // Default scholar/student user
      showToast('登录成功，正在进入个人/学生工作台（常规学术检测，无校方试用栏目）...');
      setTimeout(() => {
        onLoginSuccess(account.trim(), undefined, 'dashboard');
      }, 500);
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
          {/* LEFT COLUMN: Feature Showcase (1:1 with Screenshot)     */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-8 max-w-xl">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/90 shadow-2xs text-xs sm:text-sm text-slate-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>已为超过 10,000+ 篇论文提供检测服务</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black text-slate-900 tracking-tight leading-[1.18]">
                学术论文
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black text-[#4F46E5] tracking-tight leading-[1.18]">
                规范性智能检测
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              为研究生、学者提供专业论文规范检测；上传、跟踪进度、查看结构化问题报告，在一个工作台完成规范性检查与修改闭环。
            </p>

            {/* 2x2 Feature points */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 max-w-lg pt-1">
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <span className="w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                </span>
                <span>智能错别字检测</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <span className="w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                </span>
                <span>病句语法分析</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <span className="w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                </span>
                <span>图表规范审查</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <span className="w-6 h-6 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                </span>
                <span>参考文献校验</span>
              </div>
            </div>

            {/* Bottom Preview Card (Exact Match) */}
            <div className="pt-2">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md shadow-slate-200/40 max-w-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                      <BarChart2 className="w-3.5 h-3.5" />
                    </span>
                    <span>检测报告预览</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    <span>检测完成</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 divide-x divide-slate-100 text-center pt-1">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">12</div>
                    <div className="text-xs text-slate-400 mt-1">错别字</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">5</div>
                    <div className="text-xs text-slate-400 mt-1">病句</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">3</div>
                    <div className="text-xs text-slate-400 mt-1">图表问题</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Login Card (1:1 with Screenshot)           */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[460px] bg-white rounded-[32px] p-8 sm:p-10 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-6">
              
              {/* Header Titles */}
              <div>
                <h2 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight">
                  {activeTab === 'sms' ? '手机号登录' : '账号密码登录'}
                </h2>
                <p className="text-xs text-slate-400 mt-1.5 leading-normal">
                  {activeTab === 'sms' 
                    ? '未注册的手机号，经短信验证通过后将自动创建账号。'
                    : '使用邮箱或用户名登录，安全管理您的检测记录。'}
                </p>
              </div>

              {/* Segmented Switcher */}
              <div className="bg-[#F1F5F9] p-1.5 rounded-2xl flex items-center">
                <button
                  type="button"
                  id="tab-login-sms"
                  onClick={() => setActiveTab('sms')}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'sms'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  验证码登录
                </button>
                <button
                  type="button"
                  id="tab-login-password"
                  onClick={() => setActiveTab('password')}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'password'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  密码登录
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'sms' ? (
                  <>
                    {/* Phone Number Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        手机号
                      </label>
                      <div className="relative flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                        <Smartphone className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                        <input
                          id="login-phone-input"
                          type="tel"
                          maxLength={11}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="请输入手机号"
                          className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Verification Code Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        验证码
                      </label>
                      <div className="flex items-center gap-2.5">
                        <div className="relative flex-1 flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                          <ShieldCheck className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                          <input
                            id="login-smscode-input"
                            type="text"
                            maxLength={6}
                            value={smsCode}
                            onChange={(e) => setSmsCode(e.target.value)}
                            placeholder="请输入验证码"
                            className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          id="login-send-smscode-btn"
                          disabled={countdown > 0}
                          onClick={handleSendCode}
                          className={`px-4 py-3 text-xs sm:text-sm font-semibold rounded-2xl shrink-0 transition-all cursor-pointer ${
                            countdown > 0
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-indigo-600'
                          }`}
                        >
                          {countdown > 0 ? `${countdown}秒后重新获取` : '获取验证码'}
                        </button>
                      </div>
                    </div>

                    {/* Service Agreement Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-start gap-2.5 text-xs text-slate-500 cursor-pointer select-none">
                        <input
                          id="login-agreement-checkbox"
                          type="checkbox"
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                        />
                        <span>
                          我已阅读并同意
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate('terms');
                            }}
                            className="text-[#4F46E5] hover:underline mx-0.5 font-medium cursor-pointer"
                          >
                            《用户服务协议》
                          </button>
                          和
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              onNavigate('privacy');
                            }}
                            className="text-[#4F46E5] hover:underline mx-0.5 font-medium cursor-pointer"
                          >
                            《隐私政策》
                          </button>
                        </span>
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Account / Email Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        邮箱 / 用户名
                      </label>
                      <div className="relative flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                        <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                        <input
                          id="login-account-input"
                          type="text"
                          value={account}
                          onChange={(e) => setAccount(e.target.value)}
                          placeholder="请输入邮箱或用户名"
                          className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        密码
                      </label>
                      <div className="relative flex items-center bg-[#F8FAFC] border border-slate-200/90 rounded-2xl px-4 py-3 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                        <Lock className="w-4.5 h-4.5 text-slate-400 shrink-0 mr-3" />
                        <input
                          id="login-password-input"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="请输入登录密码"
                          className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                          title={showPassword ? '隐藏密码' : '显示密码'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Quick-fill Account Selector Pills */}
                    <div className="pt-1 pb-1 space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                        <span>体验账号（点击一键填入并测试）：</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setAccount('whu_admin');
                            setPassword('123456');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            account === 'whu_admin' 
                              ? 'border-indigo-500 bg-indigo-50/90 text-indigo-900 font-bold shadow-2xs' 
                              : 'border-slate-200/90 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">机构总管理员 (全校)</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            whu_admin · 王老师(设学院管理)
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAccount('whu_cs_admin');
                            setPassword('123456');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            account === 'whu_cs_admin' 
                              ? 'border-indigo-500 bg-indigo-50/90 text-indigo-900 font-bold shadow-2xs' 
                              : 'border-slate-200/90 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">学院管理员 (计算机)</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            whu_cs_admin · 张主任(可添师生)
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAccount('linwan');
                            setPassword('123456');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            account === 'linwan' 
                              ? 'border-indigo-500 bg-indigo-50/90 text-indigo-900 font-bold shadow-2xs' 
                              : 'border-slate-200/90 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <span className="truncate">个人 / 学生账号</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            linwan · 无校方试用栏目
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAccount('admin');
                            setPassword('123456');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            account === 'admin' 
                              ? 'border-indigo-500 bg-indigo-50/90 text-indigo-900 font-bold shadow-2xs' 
                              : 'border-slate-200/90 hover:border-slate-300 bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                            <span className="truncate">平台管理员</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                            admin · 进入平台总后台
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
                    className="w-full py-3.5 rounded-2xl text-white font-bold text-base transition-all bg-[#5B55EA] hover:bg-[#4E47E5] active:scale-[0.99] shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>登录</span>
                  </button>
                </div>

                {/* Friendly tips */}
                <div className="text-center pt-2">
                  <span className="text-[11px] text-slate-400">
                    默认支持体验账号登录，无需繁琐注册
                  </span>
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
