import React from 'react';
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  BarChart3, 
  Target, 
  Clock, 
  CheckCircle2,
  PieChart as PieIcon,
  TrendingUp,
  RotateCw
} from 'lucide-react';

export default function OverviewView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Time Scope Subtitle */}
      <div className="text-xs text-slate-400 font-mono">
        2026/10/09 00:00 — 2026/10/09 13:51 今天·按小时
      </div>

      {/* 2. Top 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">参与用户</span>
            <Users className="w-4.5 h-4.5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">2</div>
          <p className="text-[11px] text-slate-400 leading-tight">
            统计区间内上传过论文的去重用户
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">完成用户</span>
            <UserCheck className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">3</div>
          <p className="text-[11px] text-slate-400 leading-tight">
            共完成 <span className="font-semibold text-slate-600">4 篇</span> · 占参与用户 150.0%
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">检出问题</span>
            <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">2,095</div>
          <p className="text-[11px] text-slate-400 leading-tight">
            本区间各检测模块检出的问题总数
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">篇均问题数</span>
            <BarChart3 className="w-4.5 h-4.5 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono">523.8</div>
          <p className="text-[11px] text-slate-400 leading-tight">
            基于 4 篇有检出问题的论文
          </p>
        </div>

        {/* Card 5 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">反馈准确率</span>
            <Target className="w-4.5 h-4.5 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-slate-400 font-mono">——</div>
          <p className="text-[11px] text-slate-400 leading-tight">
            尚无用户反馈，准确率暂无参考价值
          </p>
        </div>

        {/* Card 6 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">平均处理耗时</span>
            <Clock className="w-4.5 h-4.5 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono pt-0.5">38m 22s</div>
          <p className="text-[11px] text-slate-400 leading-tight">
            已完成论文从上传到检测完成的平均耗时
          </p>
        </div>
      </div>

      {/* 3. Realtime Status Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/70 text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            今日实时
          </span>
          <div className="text-slate-600 flex items-center gap-4 flex-wrap">
            <span>参与 <strong className="text-slate-900 font-bold">2</strong> 人</span>
            <span className="text-slate-300">|</span>
            <span>完成 <strong className="text-slate-900 font-bold">3</strong> 人 / <strong className="text-slate-900 font-bold">4</strong> 篇</span>
            <span className="text-slate-300">|</span>
            <span>问题 <strong className="text-slate-900 font-bold">2,095</strong> 个</span>
            <span className="text-slate-300">|</span>
            <span>检测中 <strong className="text-amber-600 font-bold">1</strong> 篇</span>
          </div>
        </div>
      </div>

      {/* 4. Middle Row: Distribution & Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 问题类型分布 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">问题类型分布</h3>
            <p className="text-xs text-slate-400 mt-0.5">今天 · 各检测模块检出问题数</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-2">
            {/* Donut graphic */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* 语法错误 57% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#6366F1" strokeWidth="18" strokeDasharray="136 238" strokeDashoffset="0" />
                {/* 引用问题 21% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#60A5FA" strokeWidth="18" strokeDasharray="50 238" strokeDashoffset="-136" />
                {/* 图片问题 14% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10B981" strokeWidth="18" strokeDasharray="33 238" strokeDashoffset="-186" />
                {/* 拼写错误 6% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#FBBF24" strokeWidth="18" strokeDasharray="14 238" strokeDashoffset="-219" />
                {/* 表格问题 3% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F87171" strokeWidth="18" strokeDasharray="7 238" strokeDashoffset="-233" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xl font-black text-slate-900 font-mono">2,095</span>
                <span className="text-[11px] text-slate-400">问题总数</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="space-y-3 w-full max-w-xs text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" />
                  <span className="text-slate-700 font-medium">语法错误</span>
                </div>
                <div className="font-mono text-slate-900">
                  <span className="font-bold">1,188</span>
                  <span className="text-indigo-600 font-bold ml-2">57%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" />
                  <span className="text-slate-700 font-medium">引用问题</span>
                </div>
                <div className="font-mono text-slate-900">
                  <span className="font-bold">432</span>
                  <span className="text-blue-500 font-bold ml-2">21%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <span className="text-slate-700 font-medium">图片问题</span>
                </div>
                <div className="font-mono text-slate-900">
                  <span className="font-bold">287</span>
                  <span className="text-emerald-600 font-bold ml-2">14%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
                  <span className="text-slate-700 font-medium">拼写错误</span>
                </div>
                <div className="font-mono text-slate-900">
                  <span className="font-bold">117</span>
                  <span className="text-amber-500 font-bold ml-2">6%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F87171]" />
                  <span className="text-slate-700 font-medium">表格问题</span>
                </div>
                <div className="font-mono text-slate-900">
                  <span className="font-bold">71</span>
                  <span className="text-red-500 font-bold ml-2">3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: 各类反馈准确率 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">各类反馈准确率</h3>
            <p className="text-xs text-slate-400 mt-0.5">条形长度为问题总数 · 颜色区分用户反馈结论</p>
          </div>

          <div className="space-y-4 pt-1">
            {/* Row 1: 语法错误 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">语法错误</span>
                <span className="font-mono text-slate-400">1,188</span>
              </div>
              <div className="h-5 w-full bg-slate-100 rounded-md overflow-hidden flex">
                <div className="h-full bg-indigo-100 border border-indigo-200/50 w-[100%] pattern-stripes" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #E0E7FF 0, #E0E7FF 6px, #EEF2FF 6px, #EEF2FF 12px)' }} />
              </div>
            </div>

            {/* Row 2: 引用问题 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">引用问题</span>
                <span className="font-mono text-slate-400">432</span>
              </div>
              <div className="h-5 w-full bg-slate-100 rounded-md overflow-hidden flex">
                <div className="h-full bg-indigo-100 border border-indigo-200/50 w-[36%]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #E0E7FF 0, #E0E7FF 6px, #EEF2FF 6px, #EEF2FF 12px)' }} />
              </div>
            </div>

            {/* Row 3: 图片问题 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">图片问题</span>
                <span className="font-mono text-slate-400">287</span>
              </div>
              <div className="h-5 w-full bg-slate-100 rounded-md overflow-hidden flex">
                <div className="h-full bg-indigo-100 border border-indigo-200/50 w-[24%]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #E0E7FF 0, #E0E7FF 6px, #EEF2FF 6px, #EEF2FF 12px)' }} />
              </div>
            </div>

            {/* Row 4: 拼写错误 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">拼写错误</span>
                <span className="font-mono text-slate-400">117</span>
              </div>
              <div className="h-5 w-full bg-slate-100 rounded-md overflow-hidden flex">
                <div className="h-full bg-indigo-100 border border-indigo-200/50 w-[10%]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #E0E7FF 0, #E0E7FF 6px, #EEF2FF 6px, #EEF2FF 12px)' }} />
              </div>
            </div>

            {/* Row 5: 表格问题 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">表格问题</span>
                <span className="font-mono text-slate-400">71</span>
              </div>
              <div className="h-5 w-full bg-slate-100 rounded-md overflow-hidden flex">
                <div className="h-full bg-indigo-100 border border-indigo-200/50 w-[6%]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #E0E7FF 0, #E0E7FF 6px, #EEF2FF 6px, #EEF2FF 12px)' }} />
              </div>
            </div>

            {/* Scale & Legend */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> 准确</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> 存疑</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> 误报</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-200" /> 未反馈</span>
              </div>
              <div className="font-mono flex items-center gap-6">
                <span>0</span>
                <span>300</span>
                <span>600</span>
                <span>1188</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Row: Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Trend: 参与与完成趋势 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">参与与完成趋势</h3>
              <p className="text-xs text-slate-400 mt-0.5">2026/10/09 00:00 — 2026/10/09 13:51 · 按小时</p>
            </div>
            <span className="text-xs font-mono text-slate-400">100%</span>
          </div>

          <div className="h-44 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 140" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeDasharray="4 4" />

              {/* Accuracy benchmark dotted line */}
              <line x1="0" y1="20" x2="500" y2="20" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />

              {/* Area fill for completed */}
              <path
                d="M 0 130 C 50 130, 200 130, 300 130 C 350 130, 360 80, 380 80 C 400 80, 420 130, 450 80 C 470 50, 480 30, 500 130 Z"
                fill="url(#trendGrad)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
              </defs>

              {/* Line 1: 完成论文 */}
              <path
                d="M 0 130 C 50 130, 200 130, 300 130 C 350 130, 360 80, 380 80 C 400 80, 420 130, 450 80 C 470 50, 480 30, 500 130"
                fill="none"
                stroke="#6366F1"
                strokeWidth="2.5"
              />

              {/* Line 2: 参与用户 */}
              <path
                d="M 0 130 C 50 130, 200 130, 300 130 C 340 130, 350 90, 370 90 C 400 90, 420 130, 440 30 C 460 30, 480 130, 500 130"
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-600" /> 参与用户</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-600" /> 完成论文</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-300" /> 反馈准确率</span>
            </div>
            <div className="flex gap-4">
              <span>01:00</span>
              <span>03:00</span>
              <span>05:00</span>
              <span>07:00</span>
              <span>09:00</span>
              <span>11:00</span>
              <span>13:00</span>
            </div>
          </div>
        </div>

        {/* Right Trend: 问题检出趋势 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">问题检出趋势</h3>
              <p className="text-xs text-slate-400 mt-0.5">2026/10/09 00:00 — 2026/10/09 13:51 · 按小时</p>
            </div>
            <span className="text-xs font-mono text-slate-400">峰值 1290</span>
          </div>

          <div className="h-44 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 140" preserveAspectRatio="none">
              <line x1="0" y1="20" x2="500" y2="20" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#F1F5F9" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="500" y2="100" stroke="#F1F5F9" strokeDasharray="4 4" />

              {/* Area fill */}
              <path
                d="M 0 30 Q 30 110, 80 130 T 350 130 Q 420 80, 440 70 T 500 130 Z"
                fill="url(#issueGrad)"
                opacity="0.25"
              />
              <defs>
                <linearGradient id="issueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
              </defs>

              {/* Curve */}
              <path
                d="M 0 30 Q 30 110, 80 130 T 350 130 Q 420 80, 440 70 T 500 130"
                fill="none"
                stroke="#EA580C"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-600" />
              <span className="text-slate-600 font-medium">检出问题</span>
            </div>
            <div className="flex gap-4">
              <span>00:00</span>
              <span>01:00</span>
              <span>02:00</span>
              <span>04:00</span>
              <span>06:00</span>
              <span>08:00</span>
              <span>10:00</span>
              <span>11:00</span>
              <span>13:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
