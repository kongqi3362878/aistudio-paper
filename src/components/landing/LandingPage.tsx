import { useState, useRef } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Type, 
  Image as ImageIcon, 
  Table, 
  BookOpen, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  GraduationCap, 
  BookMarked, 
  Building2, 
  Users, 
  ShieldAlert,
  Edit3,
  X,
  ExternalLink,
  Eye,
  AlertTriangle,
  User
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';
import { PageKey, PaperDetectionRecord } from '../../types';
import { initialRecords } from '../../data/mockData';

interface LandingPageProps {
  onEnterApp: (targetPage?: PageKey, portal?: 'personal' | 'institution') => void;
  onViewSampleReport?: (record: PaperDetectionRecord) => void;
}

export default function LandingPage({ onEnterApp, onViewSampleReport }: LandingPageProps) {
  const [activeNav, setActiveNav] = useState('features');
  const [showSamplePopup, setShowSamplePopup] = useState(false);
  const [activeCaseTab, setActiveCaseTab] = useState<'typo' | 'grammar' | 'figure' | 'table'>('typo');
  const [heroSeverityFilter, setHeroSeverityFilter] = useState<'全部' | '严重' | '中等' | '轻微'>('全部');
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleBadgeMouseEnter = () => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    setShowSamplePopup(true);
  };

  const handleBadgeMouseLeave = () => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    popupTimerRef.current = setTimeout(() => {
      setShowSamplePopup(false);
    }, 350);
  };

  const handlePopupMouseEnter = () => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
  };

  const handlePopupMouseLeave = () => {
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    popupTimerRef.current = setTimeout(() => {
      setShowSamplePopup(false);
    }, 300);
  };

  const scrollToSection = (id: string) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 selection:bg-indigo-100 selection:text-indigo-800 relative overflow-x-hidden font-sans">
      {/* Cinematic Flowing Ambient Gradient Lights (Background) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Flowing Gradient Orb 1 */}
        <div 
          className="absolute -top-[25%] -left-[10%] w-[65vw] h-[65vw] rounded-full opacity-40 blur-[130px] animate-mesh"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.45) 0%, rgba(168, 85, 247, 0.25) 45%, transparent 70%)',
          }}
        />
        {/* Flowing Gradient Orb 2 */}
        <div 
          className="absolute top-[20%] -right-[15%] w-[60vw] h-[60vw] rounded-full opacity-35 blur-[140px] animate-float-slow"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(99, 102, 241, 0.2) 50%, transparent 70%)',
          }}
        />
        {/* Flowing Gradient Orb 3 */}
        <div 
          className="absolute top-[60%] left-[15%] w-[55vw] h-[55vw] rounded-full opacity-25 blur-[120px] animate-pulse-glow"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, rgba(56, 189, 248, 0.25) 50%, transparent 70%)',
          }}
        />
      </div>

      {/* 1. Top Navbar (Enlarged & Glassmorphic) */}
      <nav id="landing-navbar" className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 h-22 px-6 sm:px-10 lg:px-16 transition-all shadow-xs">
        <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto h-full flex items-center justify-between">
          <BrandLogo onClick={() => onEnterApp('dashboard')} className="scale-105 origin-left" />

          {/* Center Navigation Links (Larger font & smooth hover pills) */}
          <div className="hidden md:flex items-center gap-10 text-base font-medium text-slate-600">
            <button 
              id="nav-link-features"
              onClick={() => scrollToSection('features-section')}
              className={`py-2 px-3 rounded-xl transition-all hover:text-indigo-600 hover:bg-indigo-50/50 cursor-pointer ${
                activeNav === 'features' ? 'text-indigo-600 font-semibold bg-indigo-50/70' : ''
              }`}
            >
              功能特性
            </button>
            <button 
              id="nav-link-process"
              onClick={() => scrollToSection('process-section')}
              className={`py-2 px-3 rounded-xl transition-all hover:text-indigo-600 hover:bg-indigo-50/50 cursor-pointer ${
                activeNav === 'process' ? 'text-indigo-600 font-semibold bg-indigo-50/70' : ''
              }`}
            >
              使用流程
            </button>
            <button 
              id="nav-link-scenarios"
              onClick={() => scrollToSection('scenarios-section')}
              className={`py-2 px-3 rounded-xl transition-all hover:text-indigo-600 hover:bg-indigo-50/50 cursor-pointer ${
                activeNav === 'scenarios' ? 'text-indigo-600 font-semibold bg-indigo-50/70' : ''
              }`}
            >
              应用场景
            </button>
          </div>

          {/* Right Auth Buttons with Dual Entrances */}
          <div className="flex items-center gap-3">
            <button 
              id="landing-btn-login-personal"
              onClick={() => onEnterApp('login', 'personal')}
              className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3.5 py-2.5 rounded-xl hover:bg-slate-100/70 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>个人登录</span>
            </button>
            <button 
              id="landing-btn-login-institution"
              onClick={() => onEnterApp('login', 'institution')}
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-200/60 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>机构师生登录</span>
            </button>
            <button 
              id="landing-btn-start"
              onClick={() => onEnterApp('detection')}
              className="relative group overflow-hidden bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#3B82F6] hover:from-[#4338CA] hover:to-[#2563EB] text-white text-sm sm:text-base font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                开始检测
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section (Enlarged Scale, Flowing Gradients, Float Animations) */}
      <section className="relative z-30 pt-16 pb-24 px-6 sm:px-10 lg:px-16 w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-8">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-sm font-semibold shadow-xs backdrop-blur-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              已为超过 10,000+ 篇论文提供检测服务
            </div>

            {/* Huge Headline with Flowing Cinematic Gradient */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                学术论文
              </h1>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#4F46E5] via-[#8B5CF6] to-[#2563EB] animate-gradient-flow leading-[1.12]">
                规范性智能检测
              </h1>
            </div>

            {/* Subtitle (Larger & generous line height) */}
            <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-3xl font-normal">
              为研究生、学者提供专业论文规范检测，精准识别文本、图表、引用问题，助力学术成果发表。
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                id="hero-btn-login-start"
                onClick={() => onEnterApp('login', 'institution')}
                className="group relative overflow-hidden bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#3B82F6] hover:from-[#4338CA] hover:to-[#2563EB] text-white px-7 py-4 rounded-2xl font-bold text-base sm:text-lg flex items-center gap-2.5 shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 active:translate-y-0 transition-all cursor-pointer"
              >
                <GraduationCap className="w-5 h-5 shrink-0" />
                <span>机构师生登录 (享校方试用)</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
              <button 
                id="hero-btn-personal-login"
                onClick={() => onEnterApp('login', 'personal')}
                className="border-2 border-slate-200/90 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 hover:bg-white/80 px-6 py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all hover:-translate-y-0.5 shadow-xs cursor-pointer flex items-center gap-2"
              >
                <User className="w-5 h-5 text-slate-400" />
                <span>个人自费入口</span>
              </button>
            </div>

            {/* Feature Bullets (Enlarged & interactive hover) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-200/80 text-sm sm:text-base font-medium text-slate-700">
              <div className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <CheckCircle className="w-5 h-5 text-[#5454E6] shrink-0" />
                <span>智能错别字检测</span>
              </div>
              <div className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <CheckCircle className="w-5 h-5 text-[#5454E6] shrink-0" />
                <span>病句语法分析</span>
              </div>
              <div className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <CheckCircle className="w-5 h-5 text-[#5454E6] shrink-0" />
                <span>图表规范审查</span>
              </div>
              <div className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <CheckCircle className="w-5 h-5 text-[#5454E6] shrink-0" />
                <span>参考文献校验</span>
              </div>
            </div>
          </div>

          {/* Right Floating Hero Card Mockup (Larger Scale & Smooth Float) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[560px] xl:max-w-[620px] animate-float-slow">
              {/* Dynamic Flowing Glow Behind Card */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl opacity-70 animate-pulse-glow" />

              {/* Card Container */}
              <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-100 p-7 space-y-6 hover:shadow-indigo-500/15 hover:border-indigo-100 transition-all">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">检测报告</h3>
                      <p className="text-xs text-slate-400">全维度学术规范智能审查</p>
                    </div>
                  </div>
                  <span 
                    id="hero-preview-badge"
                    onMouseEnter={handleBadgeMouseEnter}
                    onMouseLeave={handleBadgeMouseLeave}
                    onClick={() => setShowSamplePopup(!showSamplePopup)}
                    className="group/badge relative text-xs px-3.5 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 font-bold tracking-wide cursor-pointer transition-all flex items-center gap-1.5 shadow-2xs border border-indigo-100/90 hover:border-indigo-600 select-none"
                    title="鼠标悬停查看论文检测结果详情案例"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover/badge:bg-white animate-ping shrink-0" />
                    <span>实时预览 · 悬停看案例</span>
                  </span>

                  {/* 鼠标移置弹出的论文检测结果详情案例 */}
                  {showSamplePopup && (
                    <div 
                      id="hero-detection-case-popup"
                      onMouseEnter={handlePopupMouseEnter}
                      onMouseLeave={handlePopupMouseLeave}
                      className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[420px] sm:w-[520px] max-w-[calc(100vw-2rem)] bg-white/98 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_-10px_rgba(79,70,229,0.22),0_10px_25px_-5px_rgba(15,23,42,0.12)] border border-slate-200/90 p-4.5 sm:p-5 flex flex-col max-h-[min(510px,calc(100vh-140px))] animate-in fade-in zoom-in-95 duration-200 text-left font-sans"
                    >
                      {/* Pointer arrow connecting badge to popup */}
                      <div className="absolute -top-2 right-12 w-3.5 h-3.5 bg-white border-t border-l border-slate-200/90 transform rotate-45 z-10" />

                      {/* Top Bar with Title and Close Button (Pinned Header) */}
                      <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-slate-100 shrink-0 relative z-20">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                                论文检测结果详情案例
                              </h4>
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/80">
                                样本实录
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                              基于国家学术论文编写规范与大模型智能纠错
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowSamplePopup(false)}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="关闭"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Scrollable Middle Body */}
                      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1 custom-scrollbar text-xs">
                        {/* Paper Meta Card */}
                        <div className="bg-slate-50/95 rounded-xl p-2.5 sm:p-3 border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-slate-800 truncate" title="“双减”背景下Z县小学生家庭教育投入问题研究_高可.pdf">
                              📄 《“双减”背景下Z县小学生家庭教育投入问题研究》
                            </p>
                            <span className="text-[10px] font-semibold text-emerald-600 shrink-0 bg-emerald-50 px-2 py-0.5 rounded-md">
                              已完成 · 耗时 42s
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                            <span>总字数：38,520 字</span>
                            <span>•</span>
                            <span>发现规范问题：<strong className="text-red-600 font-bold">337 处</strong></span>
                          </div>
                        </div>

                        {/* 4 Categorical Tabs */}
                        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-semibold gap-1">
                          <button
                            type="button"
                            onClick={() => setActiveCaseTab('typo')}
                            className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                              activeCaseTab === 'typo'
                                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>错别字</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-700 font-bold">24</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveCaseTab('grammar')}
                            className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                              activeCaseTab === 'grammar'
                                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>病句</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700 font-bold">185</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveCaseTab('figure')}
                            className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                              activeCaseTab === 'figure'
                                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>图片规范</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-bold">103</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveCaseTab('table')}
                            className={`flex-1 py-1.5 px-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                              activeCaseTab === 'table'
                                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>表格规范</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 font-bold">25</span>
                          </button>
                        </div>

                        {/* Case Detail Box Based on Selected Tab */}
                        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                          {activeCaseTab === 'typo' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-700">
                                  严重问题 · 形近同音字误用
                                </span>
                                <span className="text-slate-400 text-[10px]">位置：第 3 页 · 第 2 自然段</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                                <div className="text-slate-500 font-medium text-[11px]">原句内容：</div>
                                <p className="text-slate-700 leading-relaxed text-xs">
                                  “...在各级学校教育资<span className="bg-red-100 text-red-700 font-bold px-1 py-0.5 rounded underline decoration-wavy">原</span>分配中，乡村学校仍面临优质师资不足的困境...”
                                </p>
                              </div>
                              <div className="bg-emerald-50/90 p-2.5 rounded-lg border border-emerald-200/80 space-y-0.5">
                                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>智能纠错建议：</span>
                                </div>
                                <p className="text-emerald-900 font-medium pl-5 text-xs">
                                  替换为：“<strong className="underline font-bold">资源</strong>”（形近字同音误写，学术出版规范需修正）
                                </p>
                              </div>
                            </div>
                          )}

                          {activeCaseTab === 'grammar' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">
                                  严重问题 · 介词掩盖主语（病句）
                                </span>
                                <span className="text-slate-400 text-[10px]">位置：第 12 页 · 第 1 自然段</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                                <div className="text-slate-500 font-medium text-[11px]">原句内容：</div>
                                <p className="text-slate-700 leading-relaxed text-xs">
                                  “...<span className="bg-amber-100 text-amber-800 font-bold px-1 py-0.5 rounded">通过对问卷调查结果的梳理与统计，使得</span>不同收入群体的家庭教育支出差异明显显现...”
                                </p>
                              </div>
                              <div className="bg-emerald-50/90 p-2.5 rounded-lg border border-emerald-200/80 space-y-0.5">
                                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>智能纠错建议：</span>
                                </div>
                                <p className="text-emerald-900 font-medium pl-5 text-xs">
                                  建议修改为：“通过对问卷调查结果的梳理与统计，不同收入群体的家庭教育支出差异明显显现。”（删除“使得”，恢复主句主干）
                                </p>
                              </div>
                            </div>
                          )}

                          {activeCaseTab === 'figure' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">
                                  中等问题 · 分辨率不足与前文呼应缺失
                                </span>
                                <span className="text-slate-400 text-[10px]">位置：第 18 页 · 图 3-2</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                                <div className="text-slate-500 font-medium text-[11px]">检测发现：</div>
                                <p className="text-slate-700 leading-relaxed text-xs">
                                  图 3-2（问卷样本结构分布图）采样分辨率仅为 96 DPI，低于国家期刊标准 300 DPI 印刷门槛；且前置正文中缺少“如图 3-2 所示”的前呼对应段落。
                                </p>
                              </div>
                              <div className="bg-emerald-50/90 p-2.5 rounded-lg border border-emerald-200/80 space-y-0.5">
                                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>智能纠错建议：</span>
                                </div>
                                <p className="text-emerald-900 font-medium pl-5 text-xs">
                                  建议使用矢量图重新导出，并在正文相关阐述后追加引用说明：“具体分布如图 3-2 所示”。
                                </p>
                              </div>
                            </div>
                          )}

                          {activeCaseTab === 'table' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-700">
                                  轻微问题 · 非科技标准三线表
                                </span>
                                <span className="text-slate-400 text-[10px]">位置：第 26 页 · 表 4-1</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                                <div className="text-slate-500 font-medium text-[11px]">检测发现：</div>
                                <p className="text-slate-700 leading-relaxed text-xs">
                                  表 4-1（回归分析结果表）包含多余纵向实线与斜线，且表头物理量缺少规范单位标注（万元/年）。
                                </p>
                              </div>
                              <div className="bg-emerald-50/90 p-2.5 rounded-lg border border-emerald-200/80 space-y-0.5">
                                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span>智能纠错建议：</span>
                                </div>
                                <p className="text-emerald-900 font-medium pl-5 text-xs">
                                  建议按 GB/T 7713 规范修改为顶线 1.5pt、底线 1.5pt、栏目线 0.75pt 的标准三线表，并在表头补充计量单位。
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons in Popup (Pinned at Bottom, Never Clipped) */}
                      <div className="flex items-center gap-2.5 pt-2.5 border-t border-slate-100 shrink-0 bg-white/95">
                        <button
                          type="button"
                          onClick={() => {
                            if (onViewSampleReport && initialRecords[0]) {
                              onViewSampleReport(initialRecords[0]);
                            } else {
                              onEnterApp('dashboard');
                            }
                          }}
                          className="flex-1 py-2.5 px-3.5 text-xs font-bold text-center text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>查看完整在线批注报告</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onEnterApp('detection')}
                          className="py-2.5 px-3.5 text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                        >
                          立即检测我的论文
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5 Stats Pill Row (Larger boxes) */}
                <div className="grid grid-cols-5 gap-2 text-center">
                  <div className="bg-slate-50 p-2.5 rounded-xl hover:bg-red-50/50 transition-colors">
                    <span className="text-[11px] text-slate-400 block">错别字</span>
                    <span className="text-sm font-extrabold text-red-600">11</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl hover:bg-amber-50/50 transition-colors">
                    <span className="text-[11px] text-slate-400 block">病句</span>
                    <span className="text-sm font-extrabold text-amber-600">1</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl hover:bg-blue-50/50 transition-colors">
                    <span className="text-[11px] text-slate-400 block">图片</span>
                    <span className="text-sm font-extrabold text-blue-600">28</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl hover:bg-indigo-50/50 transition-colors">
                    <span className="text-[11px] text-slate-400 block">表格</span>
                    <span className="text-sm font-extrabold text-indigo-600">10</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl hover:bg-purple-50/50 transition-colors">
                    <span className="text-[11px] text-slate-400 block">引用</span>
                    <span className="text-sm font-extrabold text-purple-600">1</span>
                  </div>
                </div>

                {/* Issues preview list with Severity Option Buttons */}
                <div className="space-y-2.5 text-xs sm:text-sm">
                  {/* Severity Option Buttons */}
                  <div className="flex items-center bg-slate-100/90 p-1 rounded-xl text-xs font-semibold gap-1">
                    <button
                      type="button"
                      id="hero-filter-severity-all"
                      onClick={() => setHeroSeverityFilter('全部')}
                      className={`flex-1 py-1.5 px-1 rounded-lg transition-all cursor-pointer text-center ${
                        heroSeverityFilter === '全部'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      全部 (3)
                    </button>
                    <button
                      type="button"
                      id="hero-filter-severity-severe"
                      onClick={() => setHeroSeverityFilter('严重')}
                      className={`flex-1 py-1.5 px-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        heroSeverityFilter === '严重'
                          ? 'bg-red-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-red-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${heroSeverityFilter === '严重' ? 'bg-white animate-pulse' : 'bg-red-500'}`} />
                      <span>严重 (1)</span>
                    </button>
                    <button
                      type="button"
                      id="hero-filter-severity-medium"
                      onClick={() => setHeroSeverityFilter('中等')}
                      className={`flex-1 py-1.5 px-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        heroSeverityFilter === '中等'
                          ? 'bg-amber-500 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-amber-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${heroSeverityFilter === '中等' ? 'bg-white' : 'bg-amber-500'}`} />
                      <span>中等 (1)</span>
                    </button>
                    <button
                      type="button"
                      id="hero-filter-severity-minor"
                      onClick={() => setHeroSeverityFilter('轻微')}
                      className={`flex-1 py-1.5 px-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        heroSeverityFilter === '轻微'
                          ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-emerald-700'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${heroSeverityFilter === '轻微' ? 'bg-white' : 'bg-emerald-500'}`} />
                      <span>轻微 (1)</span>
                    </button>
                  </div>

                  {/* Filtered Issue Items */}
                  {(heroSeverityFilter === '全部' || heroSeverityFilter === '严重') && (
                    <div className="p-3 rounded-2xl border border-red-100 bg-red-50/40 hover:bg-red-50/70 transition-colors flex items-start gap-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-100 text-red-700 shrink-0">
                        严重
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-800 font-semibold">错别字：对前沿步播态表述存在错误</p>
                        <p className="text-slate-500 text-xs mt-0.5">建议修改为：“传播态”</p>
                      </div>
                    </div>
                  )}

                  {(heroSeverityFilter === '全部' || heroSeverityFilter === '中等') && (
                    <div className="p-3 rounded-2xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50/70 transition-colors flex items-start gap-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-700 shrink-0">
                        中等
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-800 font-semibold">图片：图文内容标注不一致</p>
                        <p className="text-slate-500 text-xs mt-0.5">图 3-1 缺少数据采集年份说明</p>
                      </div>
                    </div>
                  )}

                  {(heroSeverityFilter === '全部' || heroSeverityFilter === '轻微') && (
                    <div className="p-3 rounded-2xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50/70 transition-colors flex items-start gap-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-700 shrink-0">
                        轻微
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-800 font-semibold">表格：表格标题格式问题</p>
                        <p className="text-slate-500 text-xs mt-0.5">表题应置于表格上方居中</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom preview button */}
                <button
                  onClick={() => onEnterApp('dashboard')}
                  className="w-full py-3.5 text-sm font-bold text-center text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs cursor-pointer"
                >
                  进入系统查看全部报告
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stats Bar (Expanded & Elevated) */}
      <section 
        id="landing-stats-section"
        className="relative z-10 bg-white/70 backdrop-blur-md border-t border-b border-slate-200/80 py-16 px-6 sm:px-10 lg:px-16"
      >
        <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          <div className="group hover:-translate-y-1 transition-transform">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              96.5%
            </div>
            <div className="text-sm sm:text-base font-semibold text-slate-500 mt-2">检测准确率</div>
          </div>
          <div className="group hover:-translate-y-1 transition-transform">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              10min
            </div>
            <div className="text-sm sm:text-base font-semibold text-slate-500 mt-2">平均检测时间</div>
          </div>
          <div className="group hover:-translate-y-1 transition-transform">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              50+
            </div>
            <div className="text-sm sm:text-base font-semibold text-slate-500 mt-2">检测规则类型</div>
          </div>
          <div className="group hover:-translate-y-1 transition-transform">
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
              10,000+
            </div>
            <div className="text-sm sm:text-base font-semibold text-slate-500 mt-2">累计检测论文</div>
          </div>
        </div>
      </section>

      {/* 4. Section: 按需要选择检测 (Large interactive cards with hover lift) */}
      <section id="detection-choice-section" className="relative z-10 py-24 px-6 sm:px-10 lg:px-16 w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">按需要选择检测</h2>
          <p className="text-slate-500 text-base sm:text-lg">
            查错别字、图表和引用，用规范检测；查内容风险与传播，用内容风险检测。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {/* Card 1: 论文规范检测 */}
          <div 
            onClick={() => onEnterApp('detection')}
            className="p-10 lg:p-12 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:border-indigo-300 hover:-translate-y-1.5 transition-all bg-white flex flex-col justify-between space-y-8 cursor-pointer group"
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#5454E6] flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                <Edit3 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                论文规范检测
              </h3>
              <p className="text-slate-600 text-base lg:text-lg leading-relaxed">
                错别字、病句、图表与参考文献，一次上传检出可修改的问题报告。
              </p>
            </div>
            <div className="inline-flex items-center gap-2.5 text-base font-bold text-[#5454E6] group-hover:text-[#3730A3]">
              <span>进入规范检测</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </div>
          </div>

          {/* Card 2: 内容风险检测 */}
          <div 
            onClick={() => onEnterApp('riskDetection')}
            className="p-10 lg:p-12 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:border-blue-300 hover:-translate-y-1.5 transition-all bg-white flex flex-col justify-between space-y-8 cursor-pointer group"
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                内容风险检测
              </h3>
              <p className="text-slate-600 text-base lg:text-lg leading-relaxed">
                面向发表与传播场景，识别文中的内容风险并生成检测报告。
              </p>
            </div>
            <div className="inline-flex items-center gap-2.5 text-base font-bold text-blue-600 group-hover:text-blue-800">
              <span>进入内容风险检测</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: 全面的检测能力 */}
      <section id="features-section" className="relative z-10 py-24 px-6 sm:px-10 lg:px-16 bg-slate-50/60 border-t border-slate-200/60">
        <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto space-y-20">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">全面的检测能力</h2>
            <p className="text-slate-500 text-base sm:text-lg">
              覆盖论文写作中的各类规范问题，从文字到图表，从格式到引用，一站式解决。
            </p>
          </div>

          {/* Capability Cards Grid (3 top, 2 bottom) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 1. 错别字检测 */}
            <div className="bg-white p-8 lg:p-10 rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Type className="w-6 h-6" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                错别字检测
              </h3>
              <p className="text-slate-600 text-base leading-relaxed">
                基于深度学习的中文错别字识别，覆盖同音字、形近字、专业术语等常见错误类型。
              </p>
            </div>

            {/* 2. 病句检测 */}
            <div className="bg-white p-8 lg:p-10 rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                病句检测
              </h3>
              <p className="text-slate-600 text-base leading-relaxed">
                智能分析句法结构，识别语法错误、搭配不当、逻辑混乱等病句问题。
              </p>
            </div>

            {/* 3. 图片规范性 */}
            <div className="bg-white p-8 lg:p-10 rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-xl hover:border-teal-200 hover:-translate-y-1 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                图片规范性
              </h3>
              <p className="text-slate-600 text-base leading-relaxed">
                检测图片标注、分辨率、图文一致性，确保图表符合学术出版要求。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl lg:max-w-6xl mx-auto">
            {/* 4. 表格规范性 */}
            <div className="bg-white p-8 lg:p-10 rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Table className="w-6 h-6" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                表格规范性
              </h3>
              <p className="text-slate-600 text-base leading-relaxed">
                审查表格格式、数据一致性、表文对应关系，规范学术表达。
              </p>
            </div>

            {/* 5. 参考文献 */}
            <div className="bg-white p-8 lg:p-10 rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                参考文献
              </h3>
              <p className="text-slate-600 text-base leading-relaxed">
                校验引用格式、文献信息完整性，支持多种引用规范标准。
              </p>
            </div>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-10 border-t border-slate-200/80 text-center">
            <div className="space-y-3 group hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 mx-auto flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">智能精准</h4>
              <p className="text-sm text-slate-500">基于大语言模型的智能分析引擎</p>
            </div>

            <div className="space-y-3 group hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">安全可靠</h4>
              <p className="text-sm text-slate-500">论文内容加密存储，检测结果稳定可追踪</p>
            </div>

            <div className="space-y-3 group hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">快速高效</h4>
              <p className="text-sm text-slate-500">分钟级检测速度，即时获取报告</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: 简单四步，完成检测 */}
      <section id="process-section" className="relative z-10 py-24 px-6 sm:px-10 lg:px-16 w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">简单四步，完成检测</h2>
          <p className="text-slate-500 text-base sm:text-lg">
            无需复杂操作，上传即可获取专业的规范性检测报告。
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1.5 transition-all space-y-4 relative group">
            <div className="text-4xl font-black text-indigo-200 group-hover:text-indigo-500 transition-colors">01</div>
            <h4 className="text-xl font-bold text-slate-900">上传论文</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              当前支持 DOCX 格式上传，自动读取解析文档内容。
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1.5 transition-all space-y-4 relative group">
            <div className="text-4xl font-black text-indigo-200 group-hover:text-indigo-500 transition-colors">02</div>
            <h4 className="text-xl font-bold text-slate-900">AI 智能分析</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              多维度规范性检测，全面扫描文字、语法与格式问题。
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1.5 transition-all space-y-4 relative group">
            <div className="text-4xl font-black text-indigo-200 group-hover:text-indigo-500 transition-colors">03</div>
            <h4 className="text-xl font-bold text-slate-900">生成报告</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              详细标注问题位置和修改建议，直观可视化呈现。
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1.5 transition-all space-y-4 relative group">
            <div className="text-4xl font-black text-indigo-200 group-hover:text-indigo-500 transition-colors">04</div>
            <h4 className="text-xl font-bold text-slate-900">修改完善</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              根据建议逐一修正，提升质量，顺利通过审核。
            </p>
          </div>
        </div>
      </section>

      {/* 7. Section: 多元应用场景 */}
      <section id="scenarios-section" className="relative z-10 py-24 px-6 sm:px-10 lg:px-16 bg-slate-50/60 border-t border-slate-200/60">
        <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto space-y-20">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">多元应用场景</h2>
            <p className="text-slate-500 text-base sm:text-lg">
              无论你是学生、学者还是学术机构，我们都能提供专业的检测服务。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Scenario 1 */}
            <div className="p-8 lg:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1 transition-all space-y-4 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900">学位论文</h4>
                  <span className="text-xs sm:text-sm font-semibold text-indigo-600">适用于：研究生、博士生</span>
                </div>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                硕士、博士学位论文的规范性自查，确保顺利通过学校审查和答辩。
              </p>
            </div>

            {/* Scenario 2 */}
            <div className="p-8 lg:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all space-y-4 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookMarked className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900">期刊投稿</h4>
                  <span className="text-xs sm:text-sm font-semibold text-blue-600">适用于：学术研究人员</span>
                </div>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                投稿前的论文质量把控，提高稿件被录用的概率。
              </p>
            </div>

            {/* Scenario 3 */}
            <div className="p-8 lg:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-teal-200 hover:-translate-y-1 transition-all space-y-4 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900">机构审核</h4>
                  <span className="text-xs sm:text-sm font-semibold text-teal-600">适用于：学术机构</span>
                </div>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                高校、研究院所的论文批量审核，提升审核效率和一致性。
              </p>
            </div>

            {/* Scenario 4 */}
            <div className="p-8 lg:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 transition-all space-y-4 group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900">导师指导</h4>
                  <span className="text-xs sm:text-sm font-semibold text-purple-600">适用于：研究生导师</span>
                </div>
              </div>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                辅助导师快速定位学生论文问题，提供针对性修改指导。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Larger font & cleaner spacing) */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white pt-16 pb-12 px-6 sm:px-10 lg:px-16 text-slate-600 text-sm">
        <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 pb-14 border-b border-slate-100">
          <div className="md:col-span-2 space-y-4">
            <BrandLogo />
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              专业论文规范性智能检测系统，助力学术写作规范化。
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-base mb-4">产品</h5>
            <ul className="space-y-3 text-slate-500">
              <li><button onClick={() => scrollToSection('features-section')} className="hover:text-indigo-600 transition-colors">功能介绍</button></li>
              <li><button onClick={() => scrollToSection('process-section')} className="hover:text-indigo-600 transition-colors">使用流程</button></li>
              <li><button onClick={() => scrollToSection('detection-choice-section')} className="hover:text-indigo-600 transition-colors">内容风险检测</button></li>
              <li><button onClick={() => onEnterApp('login')} className="hover:text-indigo-600 transition-colors">登录控制</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-base mb-4">支持</h5>
            <ul className="space-y-3 text-slate-500">
              <li><button onClick={() => onEnterApp('help')} className="hover:text-indigo-600 transition-colors">帮助中心</button></li>
              <li><button onClick={() => onEnterApp('help')} className="hover:text-indigo-600 transition-colors">常见问题</button></li>
              <li><button onClick={() => onEnterApp('feedback')} className="hover:text-indigo-600 transition-colors">意见反馈</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-slate-900 text-base mb-4">关于</h5>
            <ul className="space-y-3 text-slate-500">
              <li><button onClick={() => onEnterApp('landing')} className="hover:text-indigo-600 transition-colors">系统首页</button></li>
              <li><button onClick={() => onEnterApp('terms')} className="hover:text-indigo-600 transition-colors">用户服务协议</button></li>
              <li><button onClick={() => onEnterApp('privacy')} className="hover:text-indigo-600 transition-colors">隐私政策</button></li>
              <li><button onClick={() => onEnterApp('login')} className="hover:text-indigo-600 transition-colors">登录入口</button></li>
            </ul>
          </div>
        </div>

        {/* Sub-footer */}
        <div className="w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400 text-xs sm:text-sm">
          <div className="flex items-center gap-4">
            <span>产品能力</span>
            <span>·</span>
            <button onClick={() => onEnterApp('terms')} className="hover:text-slate-600 cursor-pointer">用户服务协议</button>
            <span>·</span>
            <button onClick={() => onEnterApp('privacy')} className="hover:text-slate-600 cursor-pointer">隐私政策</button>
            <span>·</span>
            <button onClick={() => onEnterApp('login')} className="hover:text-slate-600 cursor-pointer">登录入口</button>
          </div>
          <div>
            © 2026 论文智检. 保留所有权利。 | 鄂ICP备2026023941号-2
          </div>
        </div>
      </footer>
    </div>
  );
}
