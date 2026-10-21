import React, { useState } from 'react';
import { 
  Building2, 
  School, 
  TrendingUp, 
  Layers, 
  AlertCircle, 
  CreditCard, 
  Sparkles, 
  Users, 
  FileCheck, 
  Award, 
  BarChart3, 
  PieChart, 
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { CollegeItem } from './types';
import { TrialMemberItem } from '../../data/adminMockData';

interface InstitutionOverviewViewProps {
  adminLevel: '总管理员' | '学院管理员';
  currentSchool: string;
  managedCollege: string;
  colleges: CollegeItem[];
  members: TrialMemberItem[];
  formalTotalCredits: number;
  formalUsedCredits: number;
  trialTotalLimit: number;
  trialUsedPapers: number;
  trialAvailablePapers: number;
  onNavigateSubTab?: (section: string) => void;
}

export default function InstitutionOverviewView({
  adminLevel,
  currentSchool,
  managedCollege,
  colleges,
  members,
  formalTotalCredits,
  formalUsedCredits,
  trialTotalLimit,
  trialUsedPapers,
  trialAvailablePapers,
  onNavigateSubTab,
}: InstitutionOverviewViewProps) {
  // 4 secondary sub-tabs as specified: 机构看板/学院看板 | 检测统计 | 额度概览 | 试用概览
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'detectionStats' | 'quotaOverview' | 'trialOverview'>('dashboard');
  const [trendRange, setTrendRange] = useState<'近7天' | '近30天' | '本学期'>('近30天');

  // Filter members based on role perspective
  const scopedMembers = adminLevel === '学院管理员'
    ? members.filter(m => m.department === managedCollege)
    : members;

  // Active college for college admin perspective
  const targetCollege = colleges.find(c => c.name === managedCollege) || colleges[0];

  // College-level metrics when in College Admin mode
  const collegeTotalQuota = targetCollege ? targetCollege.allocatedQuota : 60000;
  const collegeUsedQuota = targetCollege ? targetCollege.usedQuota : 18200;
  const collegeTrialLimit = targetCollege ? targetCollege.allocatedTrialPapers : 15;
  const collegeTrialUsed = targetCollege ? targetCollege.usedTrialPapers : 5;
  const collegeTrialAvailable = collegeTrialLimit - collegeTrialUsed;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header Banner & Sub-Tabs Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
              {adminLevel === '总管理员' ? <Building2 className="w-3.5 h-3.5" /> : <School className="w-3.5 h-3.5" />}
              <span>{adminLevel === '总管理员' ? `${currentSchool} · 机构总控大屏` : `${managedCollege} · 学院学术看板`}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{adminLevel === '总管理员' ? '机构工作台概览' : `${managedCollege}工作台概览`}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {activeSubTab === 'dashboard' ? (adminLevel === '总管理员' ? '机构看板' : '学院看板') : 
                 activeSubTab === 'detectionStats' ? '检测统计' : 
                 activeSubTab === 'quotaOverview' ? '额度概览' : '试用概览'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {adminLevel === '总管理员'
                ? '全校论文送审态势、学术规范合格率、各二级学院额度下拨与校方试用消耗全景监控。'
                : `【${managedCollege}】师生送检论文态势、本院额度结余与校方试用篇数实时统计。`}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 self-start md:self-auto text-xs font-bold">
            {(['近7天', '近30天', '本学期'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTrendRange(range)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  trendRange === range ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-tab Navigation (4 Items Required by User) */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {adminLevel === '总管理员' ? <Building2 className="w-4 h-4" /> : <School className="w-4 h-4" />}
            <span>{adminLevel === '总管理员' ? '机构看板' : '学院看板'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('detectionStats')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'detectionStats'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>检测统计</span>
          </button>

          <button
            onClick={() => setActiveSubTab('quotaOverview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'quotaOverview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>额度概览</span>
          </button>

          <button
            onClick={() => setActiveSubTab('trialOverview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'trialOverview'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>试用概览</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-TAB 1: 机构看板 / 学院看板 */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 4 Core Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold">{adminLevel === '总管理员' ? '全校送检论文' : '本院送检论文'}</span>
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileCheck className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {adminLevel === '总管理员' ? '2,842' : '820'} <span className="text-xs text-slate-400 font-normal">篇</span>
              </div>
              <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-2 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>较上月提升 28.4%</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold">学术规范合格率</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {adminLevel === '总管理员' ? '95.2%' : '96.8%'}
              </div>
              <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-2 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>平均瑕疵 ≤ 3.2 处</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold">{adminLevel === '总管理员' ? '下属二级学院' : '在籍师生成员'}</span>
                <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  {adminLevel === '总管理员' ? <School className="w-4.5 h-4.5" /> : <Users className="w-4.5 h-4.5" />}
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {adminLevel === '总管理员' ? `${colleges.length} 所` : `${scopedMembers.length} 人`}
              </div>
              <div className="text-[11px] text-purple-700 mt-2 font-bold">
                {adminLevel === '总管理员' ? '已全覆盖管理员配置' : `包含 ${scopedMembers.filter(m => m.identity === '老师').length} 位专任教师`}
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold">{adminLevel === '总管理员' ? '可用校方试用' : '本院可用试用'}</span>
                <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                {adminLevel === '总管理员' ? trialAvailablePapers : collegeTrialAvailable} <span className="text-xs text-slate-400 font-normal">篇</span>
              </div>
              <div className="text-[11px] text-amber-600 mt-2 font-bold">
                {adminLevel === '总管理员' ? `已累计批复 ${trialTotalLimit} 篇` : `学院池剩余 ${collegeTrialAvailable} 篇`}
              </div>
            </div>
          </div>

          {/* Quick Perspective Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <BarChart3 className="w-4.5 h-4.5 text-indigo-600" />
                    <span>{adminLevel === '总管理员' ? '各学院论文检测活跃度与达标走势' : '本院各专业/年级送检论文分布'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">统计开题、中期检查与答辩论文提交数据</p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-xl font-bold font-mono">
                  {trendRange}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {(adminLevel === '总管理员' ? colleges : [
                  { id: 'cs-ai', name: '人工智能与机器学习方向 (硕博)', allocatedQuota: 28000, usedQuota: 9500, studentsCount: 45, teachersCount: 6 },
                  { id: 'cs-se', name: '软件工程与分布式系统 (本科/学硕)', allocatedQuota: 22000, usedQuota: 6200, studentsCount: 68, teachersCount: 8 },
                  { id: 'cs-cs', name: '计算机科学与前沿理论 (本科)', allocatedQuota: 10000, usedQuota: 2500, studentsCount: 29, teachersCount: 4 },
                ]).map((item, idx) => {
                  const percent = Math.min(100, Math.round(((item as any).usedQuota / (item as any).allocatedQuota) * 100)) || (idx === 0 ? 76 : idx === 1 ? 58 : 34);
                  return (
                    <div key={item.id} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-indigo-100 text-indigo-700 text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span>{item.name}</span>
                          {(item as any).adminName && (
                            <span className="text-[10px] font-medium text-slate-400">
                              (管理员: {(item as any).adminName})
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-slate-600">
                          {(item as any).usedQuota?.toLocaleString()} / {(item as any).allocatedQuota?.toLocaleString()} 点 ({percent}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Academic Quality & Risk Monitor */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                    <span>学术规范与格式质检监测</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">高频排版格式瑕疵分类拦截</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {[
                  { title: '参考文献国标格式规范与年份缺失', count: 1420, rate: '49.8%', level: '高发' },
                  { title: '三线表跨页断表与图表题注编号不符', count: 980, rate: '34.5%', level: '常见' },
                  { title: '中英文摘要关键词半角全角符号混用', count: 620, rate: '21.8%', level: '格式' },
                  { title: '奇偶页页眉排版与封面盲审格式差异', count: 480, rate: '16.9%', level: '排版' },
                  { title: '目录三级标题页码与正文标题不一致', count: 350, rate: '12.3%', level: '轻度' },
                ].map((issue, idx) => (
                  <div key={idx} className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-800">{issue.title}</div>
                      <div className="text-[11px] text-slate-400">检出 {issue.count} 次 · 占比 {issue.rate}</div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-white border border-slate-200 font-bold text-slate-600">
                      {issue.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-TAB 2: 检测统计 */}
      {activeSubTab === 'detectionStats' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <span>{adminLevel === '总管理员' ? '全校学位论文规范检测详细统计' : `${managedCollege}送检论文统计报告`}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">综合分析盲审前各批次送检论文初检、复检与规范合格率</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">统计周期：</span>
                <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-xl font-bold font-mono">
                  2026年秋季学期
                </span>
              </div>
            </div>

            {/* 3 Overview Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                <div className="text-xs font-bold text-indigo-900">首次送检初筛合格率</div>
                <div className="text-3xl font-black text-indigo-950 font-mono">88.6%</div>
                <p className="text-[11px] text-indigo-700">首次送审即达到≤5处格式瑕疵标准的论文比例</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                <div className="text-xs font-bold text-emerald-900">复检达标通过率</div>
                <div className="text-3xl font-black text-emerald-950 font-mono">99.2%</div>
                <p className="text-[11px] text-emerald-700">经针对性修改并二次检测后完全达到答辩要求的比例</p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                <div className="text-xs font-bold text-purple-900">平均单篇检测耗时</div>
                <div className="text-3xl font-black text-purple-950 font-mono">38.4 <span className="text-sm font-normal text-purple-700">秒</span></div>
                <p className="text-[11px] text-purple-700">全篇万字论文AI规范排版质检与多维度合规秒级核验</p>
              </div>
            </div>

            {/* Department Comparison Table */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-900 text-sm">
                {adminLevel === '总管理员' ? '各二级学院送检篇数与合格率排行' : '本院专业方向送检统计明细'}
              </h4>
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">学院 / 专业</th>
                      <th className="py-3 px-5">送检论文总篇数</th>
                      <th className="py-3 px-5">一次合格率</th>
                      <th className="py-3 px-5">复审达标率</th>
                      <th className="py-3 px-5">平均格式瑕疵</th>
                      <th className="py-3 px-5 text-right">状态评估</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {colleges.map((col, idx) => (
                      <tr key={col.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-500 text-[10px] flex items-center justify-center font-bold">
                            {idx + 1}
                          </span>
                          <span>{col.name}</span>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-700">
                          {col.usedTrialPapers * 10 + idx * 80 + 120} 篇
                        </td>
                        <td className="py-3.5 px-5 font-mono text-emerald-600 font-bold">
                          {92 - idx * 2}%
                        </td>
                        <td className="py-3.5 px-5 font-mono text-indigo-600 font-bold">
                          {99 - Math.floor(idx / 2)}%
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-600">
                          {(2.1 + idx * 0.4).toFixed(1)} 处/篇
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            规范优良
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB 3: 额度概览 */}
      {activeSubTab === 'quotaOverview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <span>{adminLevel === '总管理员' ? '机构正式充值额度总池与学院占用概览' : `${managedCollege}额度资产与成员分配概览`}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">正式采购商业点数，充值划拨记账，永不过期</p>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-2 shadow-sm">
                <div className="text-xs text-indigo-200 font-bold">
                  {adminLevel === '总管理员' ? '机构正式签约总额度' : '学院获拨正式额度'}
                </div>
                <div className="text-3xl font-black font-mono">
                  {adminLevel === '总管理员' ? formalTotalCredits.toLocaleString() : collegeTotalQuota.toLocaleString()}
                  <span className="text-xs font-normal text-indigo-300 ml-1">点</span>
                </div>
                <div className="text-[11px] text-indigo-300">
                  {adminLevel === '总管理员' ? '对公合同签署统一保障' : '来自机构总池划拨'}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="text-xs font-bold text-slate-500">
                  {adminLevel === '总管理员' ? '已划拨学院总额度' : '已分配师生额度'}
                </div>
                <div className="text-3xl font-black text-slate-900 font-mono">
                  {adminLevel === '总管理员' 
                    ? colleges.reduce((sum, c) => sum + c.allocatedQuota, 0).toLocaleString()
                    : (scopedMembers.reduce((sum, m) => sum + (m.credits || 0), 0) || 12000).toLocaleString()
                  }
                  <span className="text-xs font-normal text-slate-400 ml-1">点</span>
                </div>
                <div className="text-[11px] text-slate-400">已明确归属下级账户的额度</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="text-xs font-bold text-slate-500">
                  {adminLevel === '总管理员' ? '机构机动结余可用' : '学院自留可用机动池'}
                </div>
                <div className="text-3xl font-black text-emerald-600 font-mono">
                  {adminLevel === '总管理员'
                    ? Math.max(0, formalTotalCredits - colleges.reduce((sum, c) => sum + c.allocatedQuota, 0)).toLocaleString()
                    : Math.max(0, collegeTotalQuota - (scopedMembers.reduce((sum, m) => sum + (m.credits || 0), 0) || 12000)).toLocaleString()
                  }
                  <span className="text-xs font-normal text-slate-400 ml-1">点</span>
                </div>
                <div className="text-[11px] text-emerald-700">可随时继续下拨分配</div>
              </div>
            </div>

            {/* Quota distribution list */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">
                {adminLevel === '总管理员' ? '各学院额度配额分布' : '本院师生成员额度明细'}
              </h4>
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">{adminLevel === '总管理员' ? '学院名称' : '师生姓名'}</th>
                      <th className="py-3 px-5">{adminLevel === '总管理员' ? '院系代号' : '身份'}</th>
                      <th className="py-3 px-5">已获得正式额度</th>
                      <th className="py-3 px-5">已消耗额度</th>
                      <th className="py-3 px-5">当前结余</th>
                      <th className="py-3 px-5 text-right">消耗进度</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminLevel === '总管理员' ? (
                      colleges.map(c => {
                        const rate = Math.round((c.usedQuota / c.allocatedQuota) * 100) || 0;
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/60">
                            <td className="py-3.5 px-5 font-bold text-slate-900">{c.name}</td>
                            <td className="py-3.5 px-5 font-mono text-slate-500">{c.code}</td>
                            <td className="py-3.5 px-5 font-mono font-bold text-slate-800">{c.allocatedQuota.toLocaleString()} 点</td>
                            <td className="py-3.5 px-5 font-mono text-slate-500">{c.usedQuota.toLocaleString()} 点</td>
                            <td className="py-3.5 px-5 font-mono font-bold text-emerald-600">{(c.allocatedQuota - c.usedQuota).toLocaleString()} 点</td>
                            <td className="py-3.5 px-5 text-right">
                              <span className="font-mono text-slate-600 font-bold">{rate}%</span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      scopedMembers.map(m => (
                        <tr key={m.id} className="hover:bg-slate-50/60">
                          <td className="py-3.5 px-5 font-bold text-slate-900">{m.name}</td>
                          <td className="py-3.5 px-5 text-slate-500">{m.identity}</td>
                          <td className="py-3.5 px-5 font-mono font-bold text-slate-800">{(m.credits || 2000).toLocaleString()} 点</td>
                          <td className="py-3.5 px-5 font-mono text-slate-500">{((m.usedPapers || 0) * 800).toLocaleString()} 点</td>
                          <td className="py-3.5 px-5 font-mono font-bold text-emerald-600">{Math.max(0, (m.credits || 2000) - ((m.usedPapers || 0) * 800)).toLocaleString()} 点</td>
                          <td className="py-3.5 px-5 text-right">
                            <span className="font-mono text-slate-600 font-bold">{Math.round((((m.usedPapers || 0) * 800) / (m.credits || 2000)) * 100)}%</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 4: 试用概览 */}
      {activeSubTab === 'trialOverview' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>{adminLevel === '总管理员' ? '校方免费试用篇数与各学院消耗概览' : `${managedCollege}校方试用配额与师生使用概览`}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">按篇计费，不扣减充值积分额度，助力毕业开题答辩季试点</p>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-200/80 space-y-2">
                <div className="text-xs font-bold text-amber-900">
                  {adminLevel === '总管理员' ? '平台批复试用总篇数' : '学院获配试用总篇数'}
                </div>
                <div className="text-3xl font-black text-amber-950 font-mono">
                  {adminLevel === '总管理员' ? trialTotalLimit : collegeTrialLimit}
                  <span className="text-xs font-normal text-amber-800 ml-1">篇</span>
                </div>
                <div className="text-[11px] text-amber-700">学术诚信示范建设专项支持</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="text-xs font-bold text-slate-500">
                  {adminLevel === '总管理员' ? '已下发学院试用篇数' : '已发放给师生试用'}
                </div>
                <div className="text-3xl font-black text-slate-900 font-mono">
                  {adminLevel === '总管理员'
                    ? colleges.reduce((sum, c) => sum + c.allocatedTrialPapers, 0)
                    : (scopedMembers.reduce((sum, m) => sum + (m.availablePapers || 0), 0) || 10)
                  }
                  <span className="text-xs font-normal text-slate-400 ml-1">篇</span>
                </div>
                <div className="text-[11px] text-slate-400">已授权给师生账号可随时使用</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="text-xs font-bold text-slate-500">
                  {adminLevel === '总管理员' ? '全校实际已消耗试用' : '本院师生已消耗试用'}
                </div>
                <div className="text-3xl font-black text-rose-600 font-mono">
                  {adminLevel === '总管理员' ? trialUsedPapers : collegeTrialUsed}
                  <span className="text-xs font-normal text-slate-400 ml-1">篇</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  已完成格式检测并生成规范报告
                </div>
              </div>
            </div>

            {/* Trial status cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {colleges.map(c => (
                <div key={c.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{c.name}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                      {c.allocatedTrialPapers} 篇总配额
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>已消耗: <strong className="text-slate-800">{c.usedTrialPapers}</strong> 篇</span>
                    <span>剩余: <strong className="text-emerald-600">{c.allocatedTrialPapers - c.usedTrialPapers}</strong> 篇</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.round((c.usedTrialPapers / c.allocatedTrialPapers) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
