import React from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2, 
  Database, 
  Server, 
  Cpu, 
  HardDrive, 
  Activity, 
  Coins, 
  Clock, 
  RefreshCw 
} from 'lucide-react';
import { AdminSubPageKey } from '../../../types';

interface DevopsViewProps {
  onNavigateSubPage: (subPage: AdminSubPageKey) => void;
}

export default function DevopsView({ onNavigateSubPage }: DevopsViewProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. 待处理告警 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">待处理告警</span>
            <span className="text-xs text-slate-400">当前</span>
          </div>
          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center font-mono">
            2
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {/* Alert 1 */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900">33 篇论文检测失败</span>
                <span className="text-slate-400 text-xs ml-2 font-mono">状态 FAILED</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateSubPage('papers')}
              className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>论文管理</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Alert 2 */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50/50 border border-amber-100 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900">1964 个审查任务失败</span>
                <span className="text-slate-400 text-xs ml-2 font-mono">状态 FAILED</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateSubPage('queue')}
              className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>队列监控</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 服务状态 & 基础设施 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-900">服务状态</h3>
            <span className="text-xs font-mono text-slate-400">9895bd848e41</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              正常
            </span>
            <button
              onClick={() => onNavigateSubPage('queue')}
              className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
            >
              队列监控 →
            </button>
          </div>
        </div>

        {/* 基础设施 */}
        <div className="pt-2">
          <div className="text-xs text-slate-400 mb-2 font-medium">基础设施 · 当前</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-xs font-bold text-slate-700">MYSQL</div>
                  <div className="text-sm font-black text-slate-900 font-mono">0 ms <span className="text-xs font-normal text-slate-400">探测延迟</span></div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                正常
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-xs font-bold text-slate-700">REDIS</div>
                  <div className="text-sm font-black text-slate-900 font-mono">0 ms <span className="text-xs font-normal text-slate-400">探测延迟</span></div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                正常
              </span>
            </div>
          </div>
        </div>

        {/* 主机资源 */}
        <div className="pt-2">
          <div className="text-xs text-slate-400 mb-2 font-medium">主机资源 · 近 15 分钟</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CPU */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-slate-500" /> 宿主机 CPU
                </span>
                <span className="text-base font-black text-emerald-600 font-mono">0.0%</span>
              </div>
              <div className="h-6 w-full flex items-end">
                <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M 0 18 Q 30 18, 50 15 T 80 18 L 100 18" fill="none" stroke="#6366F1" strokeWidth="2" />
                </svg>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                峰值 1.1% · 均值 0.4% · 本服务 0.0%
              </div>
            </div>

            {/* RAM */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-slate-500" /> 应用内存
                </span>
                <span className="text-base font-black text-emerald-600 font-mono">25.7%</span>
              </div>
              <div className="h-6 w-full flex items-end">
                <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M 0 12 L 60 12 L 80 10 L 100 12" fill="none" stroke="#3B82F6" strokeWidth="2" />
                </svg>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                峰值 45.8% · 均值 26.3% · 284.1 MB / 1.1 GB
              </div>
            </div>

            {/* Disk */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-slate-500" /> 系统盘
                </span>
                <span className="text-base font-black text-amber-600 font-mono">52.9%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '52.9%' }} />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                峰值 52.9% · 均值 52.9% · 20.6 GB / 39.0 GB
              </div>
            </div>
          </div>
        </div>

        {/* 运行态 */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">运行态 · 近 15 分钟</span>
            <span className="text-indigo-600 cursor-pointer hover:underline">详情</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-600">检测论文</span>
              <span className="font-mono font-bold text-slate-900">0</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-600">运行任务</span>
              <span className="font-mono font-bold text-slate-900">0</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-600">队列积压</span>
              <span className="font-mono font-bold text-slate-900">0</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-600">租约过期</span>
              <span className="font-mono font-bold text-slate-900">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 4 KPI Cards (新增论文, 检测完成, 失败论文, Token合计) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500 font-medium">新增论文</div>
          <div className="text-3xl font-black text-slate-900 font-mono">3</div>
          <div className="text-[11px] text-slate-400">今天</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500 font-medium">检测完成</div>
          <div className="text-3xl font-black text-emerald-600 font-mono">3</div>
          <div className="text-[11px] text-slate-400">今天</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500 font-medium">失败论文</div>
          <div className="text-3xl font-black text-slate-900 font-mono">0</div>
          <div className="text-[11px] text-slate-400">今天</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-1">
          <div className="text-xs text-slate-500 font-medium">Token 合计</div>
          <div className="text-3xl font-black text-indigo-600 font-mono">13.8M</div>
          <div className="text-[11px] text-slate-400 font-mono">今天 · 12.3M 入 · 1.6M 出</div>
        </div>
      </div>

      {/* 4. 负载趋势 & 各模块 Token 用量 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">负载趋势</h3>
            <span className="text-xs text-slate-400 font-mono">2026/10/09 00:00 — 13:53 · 按小时</span>
          </div>
          <div className="h-36 w-full flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
              <path d="M 0 95 L 350 95 Q 400 30, 430 30 T 470 95 L 500 95" fill="none" stroke="#6366F1" strokeWidth="2.5" />
            </svg>
          </div>
          <div className="text-right text-xs font-mono text-slate-400">
            成功率 100% · 448 / 448
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">各模块 Token 用量</h3>
            <span className="text-xs text-slate-400">今天 · 按检测类型拆分</span>
          </div>
          <div className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 font-mono">
                <span>academic_text_main (qwen3.5-plus)</span>
                <span className="font-bold text-indigo-600">8.9M</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 font-mono">
                <span>reference_extract (qwen3-max)</span>
                <span className="font-bold text-blue-500">2.6M</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '22%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 font-mono">
                <span>image_proofread (qwen3.5-plus)</span>
                <span className="font-bold text-emerald-500">1.8M</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '13%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
