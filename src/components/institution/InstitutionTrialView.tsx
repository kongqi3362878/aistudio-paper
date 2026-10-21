import React, { useState } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Search, 
  FileCheck, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  School, 
  Users, 
  Send,
  Trash2,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { CollegeItem, CollegeTrialAllocationItem, MemberTrialAllocationItem, DetectionConsumptionItem } from './types';
import { TrialMemberItem } from '../../data/adminMockData';

interface InstitutionTrialViewProps {
  adminLevel: '总管理员' | '学院管理员';
  currentSchool: string;
  managedCollege: string;
  colleges: CollegeItem[];
  members: TrialMemberItem[];
  trialTotalLimit: number;
  trialUsedPapers: number;
  trialAvailablePapers: number;
  collegeTrialAllocations: CollegeTrialAllocationItem[];
  memberTrialAllocations: MemberTrialAllocationItem[];
  detectionConsumptionRecords: DetectionConsumptionItem[];
  onAllocateTrialToCollege: (collegeName: string, papers: number, validity: string, reason: string) => void;
  onAllocateTrialToMember: (memberName: string, papers: number, reason: string) => void;
  onRecycleTrialFromCollege: (collegeName: string, papers: number) => void;
  onRecycleTrialFromMember: (memberName: string, papers: number) => void;
}

export default function InstitutionTrialView({
  adminLevel,
  currentSchool,
  managedCollege,
  colleges,
  members,
  trialTotalLimit,
  trialUsedPapers,
  trialAvailablePapers,
  collegeTrialAllocations,
  memberTrialAllocations,
  detectionConsumptionRecords,
  onAllocateTrialToCollege,
  onAllocateTrialToMember,
  onRecycleTrialFromCollege,
  onRecycleTrialFromMember,
}: InstitutionTrialViewProps) {
  // 5 Sub-Tabs as specified by User:
  // For 机构工作台: 试用额度 | 分配记录 | 学院分配试用 | 检测消耗 | 额度回收
  // For 学院工作台: 试用额度 | 分配记录 | 成员分配试用 | 检测消耗 | 额度回收
  const [activeSubTab, setActiveSubTab] = useState<'trialQuota' | 'records' | 'allocate' | 'consumption' | 'recycle'>('trialQuota');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Target college in college admin mode
  const targetCollege = colleges.find(c => c.name === managedCollege) || colleges[0];
  const collegeTrialLimit = targetCollege ? targetCollege.allocatedTrialPapers : 15;
  const collegeTrialUsed = targetCollege ? targetCollege.usedTrialPapers : 5;
  const collegeTrialAvailable = collegeTrialLimit - collegeTrialUsed;

  // Filter members for college admin
  const collegeMembers = members.filter(m => m.department === managedCollege);

  // Form for Allocate Trial
  const [targetCollegeName, setTargetCollegeName] = useState(colleges[0]?.name || '计算机学院');
  const [allocCollegePapers, setAllocCollegePapers] = useState('5');
  const [allocCollegeValidity, setAllocCollegeValidity] = useState('2026-12-31');
  const [allocCollegeReason, setAllocCollegeReason] = useState('2026开题答辩校方免费试用批复');

  const [targetMemberName, setTargetMemberName] = useState(collegeMembers[0]?.name || '周宁');
  const [allocMemberPapers, setAllocMemberPapers] = useState('1');
  const [allocMemberReason, setAllocMemberReason] = useState('毕业论文初稿格式规范自查试用');

  // Recycle states
  const [recycleCollegeName, setRecycleCollegeName] = useState(colleges[0]?.name || '计算机学院');
  const [recycleCollegePapers, setRecycleCollegePapers] = useState('2');
  const [recycleMemberName, setRecycleMemberName] = useState(collegeMembers[0]?.name || '周宁');
  const [recycleMemberPapers, setRecycleMemberPapers] = useState('1');

  // Submit allocation to college (机构总管)
  const handleSubmitAllocateCollege = (e: React.FormEvent) => {
    e.preventDefault();
    const papers = parseInt(allocCollegePapers) || 0;
    if (papers <= 0) return;

    onAllocateTrialToCollege(targetCollegeName, papers, allocCollegeValidity, allocCollegeReason);
    showToast(`已成功为【${targetCollegeName}】批复下发 ${papers} 篇校方试用配额！`);
    setActiveSubTab('records');
  };

  // Submit allocation to member (学院管理员)
  const handleSubmitAllocateMember = (e: React.FormEvent) => {
    e.preventDefault();
    const papers = parseInt(allocMemberPapers) || 0;
    if (papers <= 0) return;

    onAllocateTrialToMember(targetMemberName, papers, allocMemberReason);
    showToast(`已成功为师生成员【${targetMemberName}】发放 ${papers} 篇试用论文！`);
    setActiveSubTab('records');
  };

  // Submit recycle
  const handleSubmitRecycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLevel === '总管理员') {
      const papers = parseInt(recycleCollegePapers) || 0;
      if (papers <= 0) return;
      onRecycleTrialFromCollege(recycleCollegeName, papers);
      showToast(`已成功从【${recycleCollegeName}】回收 ${papers} 篇试用额度回流机构总池！`);
    } else {
      const papers = parseInt(recycleMemberPapers) || 0;
      if (papers <= 0) return;
      onRecycleTrialFromMember(recycleMemberName, papers);
      showToast(`已成功从成员【${recycleMemberName}】回收 ${papers} 篇试用额度返还学院池！`);
    }
    setActiveSubTab('trialQuota');
  };

  // Filtered consumptions
  const scopedConsumptions = adminLevel === '学院管理员'
    ? detectionConsumptionRecords.filter(c => c.department === managedCollege)
    : detectionConsumptionRecords;

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header & Sub-Tabs Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{adminLevel === '总管理员' ? `${currentSchool} · 校方免费试用配额大屏` : `${managedCollege} · 学院试用配额中心`}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>试用管理</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {activeSubTab === 'trialQuota' ? '试用额度' : 
                 activeSubTab === 'records' ? '分配记录' : 
                 activeSubTab === 'allocate' ? (adminLevel === '总管理员' ? '学院分配试用' : '成员分配试用') : 
                 activeSubTab === 'consumption' ? '检测消耗' : '额度回收'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {adminLevel === '总管理员'
                ? '机构总管理员管理全校试用篇数总包，向各二级学院分配试用，监控全校检测消耗与执行额度回收。'
                : `学院管理员向本院学生或教师发放试用篇数，查看检测报告与真实消耗，支持回收未用试用。`}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveSubTab('allocate')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{adminLevel === '总管理员' ? '学院分配试用' : '成员分配试用'}</span>
            </button>
            <button
              onClick={() => setActiveSubTab('recycle')}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs sm:text-sm font-bold cursor-pointer flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>额度回收</span>
            </button>
          </div>
        </div>

        {/* 5 Secondary Sub-Tabs as specified by User */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('trialQuota')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'trialQuota'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>试用额度</span>
          </button>

          <button
            onClick={() => setActiveSubTab('records')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'records'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>分配记录</span>
          </button>

          <button
            onClick={() => setActiveSubTab('allocate')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'allocate'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{adminLevel === '总管理员' ? '学院分配试用' : '成员分配试用'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('consumption')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'consumption'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>检测消耗</span>
          </button>

          <button
            onClick={() => setActiveSubTab('recycle')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'recycle'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>额度回收</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-TAB 1: 试用额度 */}
      {activeSubTab === 'trialQuota' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-200/90 space-y-3">
              <div className="flex items-center justify-between text-amber-900 text-xs font-bold">
                <span>{adminLevel === '总管理员' ? '机构获批试用总篇数' : '学院获配试用总篇数'}</span>
                <Sparkles className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black font-mono text-amber-950">
                {adminLevel === '总管理员' ? trialTotalLimit : collegeTrialLimit}
                <span className="text-sm font-normal text-amber-800 ml-1">篇</span>
              </div>
              <div className="pt-2 border-t border-amber-200/60 text-[11px] text-amber-700 flex justify-between">
                <span>学术规范示范季专项支持</span>
                <span className="font-bold">免费扶持</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>{adminLevel === '总管理员' ? '已下拨至学院总篇数' : '已发放至师生总篇数'}</span>
                <School className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black font-mono text-slate-900">
                {adminLevel === '总管理员' 
                  ? colleges.reduce((sum, c) => sum + c.allocatedTrialPapers, 0)
                  : collegeMembers.reduce((sum, m) => sum + m.availablePapers, 0)
                }
                <span className="text-sm font-normal text-slate-400 ml-1">篇</span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                {adminLevel === '总管理员' ? `已覆盖 ${colleges.length} 个二级学院` : `已覆盖 ${collegeMembers.length} 名师生`}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>{adminLevel === '总管理员' ? '机构剩余未分配试用篇数' : '学院结余可用试用篇数'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black font-mono text-emerald-600">
                {adminLevel === '总管理员' ? trialAvailablePapers : collegeTrialAvailable}
                <span className="text-sm font-normal text-slate-400 ml-1">篇</span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-bold">
                可随时进行下步发放划拨
              </div>
            </div>
          </div>

          {/* Allocation Overview Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                <span>{adminLevel === '总管理员' ? '各学院校方试用配额与消耗一览' : '本院师生试用篇数持有与消耗详情'}</span>
              </h3>
            </div>

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5">{adminLevel === '总管理员' ? '学院名称' : '师生姓名'}</th>
                    <th className="py-3 px-5">{adminLevel === '总管理员' ? '学院管理员' : '身份'}</th>
                    <th className="py-3 px-5">获配试用篇数</th>
                    <th className="py-3 px-5">已消耗篇数</th>
                    <th className="py-3 px-5">当前结余可用</th>
                    <th className="py-3 px-5 text-right">消耗进度</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminLevel === '总管理员' ? (
                    colleges.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-5 font-bold text-slate-900">{c.name}</td>
                        <td className="py-3.5 px-5 text-slate-600">{c.adminName}</td>
                        <td className="py-3.5 px-5 font-mono font-bold text-amber-600">{c.allocatedTrialPapers} 篇</td>
                        <td className="py-3.5 px-5 font-mono text-slate-500">{c.usedTrialPapers} 篇</td>
                        <td className="py-3.5 px-5 font-mono font-bold text-emerald-600">{c.allocatedTrialPapers - c.usedTrialPapers} 篇</td>
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-700">
                          {Math.round((c.usedTrialPapers / c.allocatedTrialPapers) * 100)}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    collegeMembers.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-5 font-bold text-slate-900">{m.name}</td>
                        <td className="py-3.5 px-5 text-slate-600">{m.identity}</td>
                        <td className="py-3.5 px-5 font-mono font-bold text-amber-600">{m.availablePapers + m.usedPapers} 篇</td>
                        <td className="py-3.5 px-5 font-mono text-slate-500">{m.usedPapers} 篇</td>
                        <td className="py-3.5 px-5 font-mono font-bold text-emerald-600">{m.availablePapers} 篇</td>
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-700">
                          {Math.round((m.usedPapers / (m.availablePapers + m.usedPapers || 1)) * 100)}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-TAB 2: 分配记录 */}
      {activeSubTab === 'records' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <FileCheck className="w-4.5 h-4.5 text-indigo-600" />
                <span>{adminLevel === '总管理员' ? '机构分配试用至二级学院明细' : '学院分配试用至师生明细'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">记录每一次试用篇数下达时间、操作管理员、批复依据与有效截止期</p>
            </div>
          </div>

          <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">批复单号</th>
                  <th className="py-3 px-5">划拨时间</th>
                  <th className="py-3 px-5">{adminLevel === '总管理员' ? '目标学院' : '接收师生'}</th>
                  <th className="py-3 px-5">批复试用篇数</th>
                  <th className="py-3 px-5">操作经办人</th>
                  <th className="py-3 px-5">审批备注与依据</th>
                  <th className="py-3 px-5 text-right">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminLevel === '总管理员' ? (
                  collegeTrialAllocations.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-5 font-mono text-slate-500">{r.id}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-600">{r.time}</td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">{r.collegeName}</td>
                      <td className="py-3.5 px-5 font-mono font-bold text-amber-600">+{r.papers} 篇</td>
                      <td className="py-3.5 px-5 text-slate-700">{r.operator}</td>
                      <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate" title={r.reason}>{r.reason}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          已生效到院
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  memberTrialAllocations.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-5 font-mono text-slate-500">{r.id}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-600">{r.time}</td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {r.memberName} <span className="text-[10px] text-slate-400 font-normal">({r.role})</span>
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-amber-600">+{r.papers} 篇</td>
                      <td className="py-3.5 px-5 text-slate-700">{r.operator}</td>
                      <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate" title={r.reason}>{r.reason}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          已发放可用
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. SUB-TAB 3: 学院分配试用 / 成员分配试用 */}
      {activeSubTab === 'allocate' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-2xl animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              <span>{adminLevel === '总管理员' ? '向二级学院批复划拨试用篇数' : '向本院师生发放试用篇数'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {adminLevel === '总管理员'
                ? '从全校批复试用池扣减，划拨到二级学院试用池中。'
                : `从【${managedCollege}】试用池中划拨，直接赋予学生或老师账号免额度检测次数。`}
            </p>
          </div>

          {adminLevel === '总管理员' ? (
            <form onSubmit={handleSubmitAllocateCollege} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">选择接收试用学院 *</label>
                <select
                  value={targetCollegeName}
                  onChange={(e) => setTargetCollegeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-bold text-slate-900"
                >
                  {colleges.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} · 当前已获试用: {c.allocatedTrialPapers} 篇 (剩余 {c.allocatedTrialPapers - c.usedTrialPapers} 篇)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">下发试用篇数 (篇) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={allocCollegePapers}
                    onChange={(e) => setAllocCollegePapers(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold text-base text-amber-600"
                  />
                  <div className="text-[11px] text-slate-400">
                    当前全校试用池剩余可用：<strong className="text-emerald-600">{trialAvailablePapers}</strong> 篇
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">有效截止期</label>
                  <input
                    type="date"
                    value={allocCollegeValidity}
                    onChange={(e) => setAllocCollegeValidity(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">批复依据与说明</label>
                <input
                  type="text"
                  value={allocCollegeReason}
                  onChange={(e) => setAllocCollegeReason(e.target.value)}
                  placeholder="例如：2026学年开题学术规范自检专项批复"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('trialQuota')}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>确认下发学院试用</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitAllocateMember} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">选择接收师生成员 *</label>
                <select
                  value={targetMemberName}
                  onChange={(e) => setTargetMemberName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-bold text-slate-900"
                >
                  {collegeMembers.map(m => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.identity} · {m.phone}) · 当前剩余试用: {m.availablePapers} 篇
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">发放试用篇数 (篇) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={allocMemberPapers}
                  onChange={(e) => setAllocMemberPapers(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold text-base text-amber-600"
                />
                <div className="text-[11px] text-slate-400">
                  当前学院池剩余可用：<strong className="text-emerald-600">{collegeTrialAvailable}</strong> 篇
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">发放说明</label>
                <input
                  type="text"
                  value={allocMemberReason}
                  onChange={(e) => setAllocMemberReason(e.target.value)}
                  placeholder="例如：硕士开题初稿排版自检试用"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('trialQuota')}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>确认发放给师生</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 5. SUB-TAB 4: 检测消耗 */}
      {activeSubTab === 'consumption' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-indigo-600" />
              <span>{adminLevel === '总管理员' ? '全校学位论文试用篇数真实检测消耗流水' : `${managedCollege}师生检测消耗明细`}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">每篇论文由学生或老师提交检测，完成规范排版质检并扣除试用或额度</p>
          </div>

          <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">检测流水号</th>
                  <th className="py-3 px-5">送检论文题目</th>
                  <th className="py-3 px-5">作者 (学工号)</th>
                  <th className="py-3 px-5">所属院系</th>
                  <th className="py-3 px-5">抵扣方式 / 篇数</th>
                  <th className="py-3 px-5">检测时间</th>
                  <th className="py-3 px-5 text-right">质检结果</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scopedConsumptions.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-5 font-mono text-slate-500">{c.id}</td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 max-w-sm truncate" title={c.title}>
                      {c.title}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-800">{c.author}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.studentNo}</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">{c.department}</td>
                    <td className="py-3.5 px-5 font-mono">
                      <span className="text-amber-700 font-bold">{c.costAmount}</span>
                      <div className="text-[10px] text-slate-400">{c.costType}</div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-600">{c.time}</td>
                    <td className="py-3.5 px-5 text-right font-bold text-emerald-600 font-mono">
                      {c.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. SUB-TAB 5: 额度回收 */}
      {activeSubTab === 'recycle' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-2xl animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <span>{adminLevel === '总管理员' ? '从二级学院回收未使用的试用篇数' : '从成员回收长期未用的试用篇数'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {adminLevel === '总管理员'
                ? '若某学院答辩已结束且有多余未消耗篇数，机构管理员可将其回收回机构机动总池，用于其他急需学院。'
                : `若某位学生或老师长期未消耗试用，学院管理员可将其回收回学院总池，重新统筹分配给其他同学。`}
            </p>
          </div>

          <form onSubmit={handleSubmitRecycle} className="space-y-4 text-xs sm:text-sm">
            {adminLevel === '总管理员' ? (
              <>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">选择回收来源学院 *</label>
                  <select
                    value={recycleCollegeName}
                    onChange={(e) => setRecycleCollegeName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-bold"
                  >
                    {colleges.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name} · 当前剩余未用试用: {c.allocatedTrialPapers - c.usedTrialPapers} 篇
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">回收篇数 (篇) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={recycleCollegePapers}
                    onChange={(e) => setRecycleCollegePapers(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold text-base text-rose-600"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">选择回收来源师生 *</label>
                  <select
                    value={recycleMemberName}
                    onChange={(e) => setRecycleMemberName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-bold"
                  >
                    {collegeMembers.map(m => (
                      <option key={m.id} value={m.name}>
                        {m.name} ({m.identity} · {m.phone}) · 结余试用: {m.availablePapers} 篇
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">回收篇数 (篇) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={recycleMemberPapers}
                    onChange={(e) => setRecycleMemberPapers(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold text-base text-rose-600"
                  />
                </div>
              </>
            )}

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>回收操作将扣减目标对象的可用试用篇数，并即时返还至上级池，已消耗的试用记录不受影响。</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('trialQuota')}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>确认回收返还</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
