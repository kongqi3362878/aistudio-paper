import React, { useState } from 'react';
import { 
  CreditCard, 
  Wallet, 
  Plus, 
  RotateCcw, 
  Search, 
  FileCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  School, 
  Users, 
  Coins, 
  FileSpreadsheet, 
  ShieldCheck,
  Send
} from 'lucide-react';
import { CollegeItem, CollegeQuotaAllocationItem, MemberQuotaAllocationItem, QuotaFlowItem } from './types';
import { TrialMemberItem } from '../../data/adminMockData';

interface InstitutionQuotaViewProps {
  adminLevel: '总管理员' | '学院管理员';
  currentSchool: string;
  managedCollege: string;
  colleges: CollegeItem[];
  members: TrialMemberItem[];
  formalTotalCredits: number;
  formalUsedCredits: number;
  collegeQuotaAllocations: CollegeQuotaAllocationItem[];
  memberQuotaAllocations: MemberQuotaAllocationItem[];
  quotaFlowRecords: QuotaFlowItem[];
  onAllocateQuotaToCollege: (collegeName: string, amount: number, reason: string) => void;
  onAllocateQuotaToMember: (memberName: string, amount: number, reason: string) => void;
}

export default function InstitutionQuotaView({
  adminLevel,
  currentSchool,
  managedCollege,
  colleges,
  members,
  formalTotalCredits,
  formalUsedCredits,
  collegeQuotaAllocations,
  memberQuotaAllocations,
  quotaFlowRecords,
  onAllocateQuotaToCollege,
  onAllocateQuotaToMember,
}: InstitutionQuotaViewProps) {
  // 4 Sub-Tabs as specified by User:
  // For 机构工作台: 机构额度 | 分配记录 | 额度流水 | 分配额度
  // For 学院工作台: 学院额度 | 分配记录 | 额度流水 | 分配额度
  const [activeSubTab, setActiveSubTab] = useState<'mainQuota' | 'records' | 'flow' | 'allocate'>('mainQuota');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Target college in college admin mode
  const targetCollege = colleges.find(c => c.name === managedCollege) || colleges[0];
  const collegeTotalQuota = targetCollege ? targetCollege.allocatedQuota : 60000;
  const collegeUsedQuota = targetCollege ? targetCollege.usedQuota : 18200;

  // Filter members for college admin
  const collegeMembers = members.filter(m => m.department === managedCollege);

  // Form for Allocate Quota
  const [targetCollegeName, setTargetCollegeName] = useState(colleges[0]?.name || '计算机学院');
  const [allocCollegeAmount, setAllocCollegeAmount] = useState('10000');
  const [allocCollegeReason, setAllocCollegeReason] = useState('2026秋季学期研究生论文预答辩配额划拨');

  const [targetMemberName, setTargetMemberName] = useState(collegeMembers[0]?.name || '周宁');
  const [allocMemberAmount, setAllocMemberAmount] = useState('2000');
  const [allocMemberReason, setAllocMemberReason] = useState('硕士学位论文格式排版自查正式额度');

  // Submit allocation to college (机构管理员)
  const handleSubmitAllocateCollege = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(allocCollegeAmount) || 0;
    if (amount <= 0) return;

    onAllocateQuotaToCollege(targetCollegeName, amount, allocCollegeReason);
    showToast(`已成功为【${targetCollegeName}】划拨 ${amount.toLocaleString()} 次检测额度！`);
    setActiveSubTab('records');
  };

  // Submit allocation to member (学院管理员)
  const handleSubmitAllocateMember = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(allocMemberAmount) || 0;
    if (amount <= 0) return;

    onAllocateQuotaToMember(targetMemberName, amount, allocMemberReason);
    showToast(`已成功为成员【${targetMemberName}】分配 ${amount.toLocaleString()} 次检测额度！`);
    setActiveSubTab('records');
  };

  // Filtered allocation records
  const filteredCollegeRecords = collegeQuotaAllocations.filter(r => 
    !searchQuery || r.collegeName.includes(searchQuery) || r.reason.includes(searchQuery)
  );
  const filteredMemberRecords = memberQuotaAllocations.filter(r => 
    !searchQuery || r.memberName.includes(searchQuery) || r.reason.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header & Sub-Tabs Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
              <CreditCard className="w-3.5 h-3.5" />
              <span>{adminLevel === '总管理员' ? '机构正式签约商业配额资产' : `${managedCollege} · 学院正式资产池`}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>额度管理</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {activeSubTab === 'mainQuota' ? (adminLevel === '总管理员' ? '机构额度' : '学院额度') : 
                 activeSubTab === 'records' ? '分配记录' : 
                 activeSubTab === 'flow' ? '额度流水' : '分配额度'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {adminLevel === '总管理员'
                ? '机构总管理员管理全校充值正式额度资产总包，向下属学院分配额度，实时监控全校额度流水。'
                : `学院管理员管理机构划拨至【${managedCollege}】的正式额度，向本院学生或老师分配额度。`}
            </p>
          </div>

          <button
            onClick={() => setActiveSubTab('allocate')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Send className="w-4 h-4" />
            <span>{adminLevel === '总管理员' ? '分配额度至学院' : '分配额度至师生'}</span>
          </button>
        </div>

        {/* 4 Secondary Sub-Tabs as specified by User */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('mainQuota')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'mainQuota'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{adminLevel === '总管理员' ? '机构额度' : '学院额度'}</span>
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
            onClick={() => setActiveSubTab('flow')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'flow'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>额度流水</span>
          </button>

          <button
            onClick={() => setActiveSubTab('allocate')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'allocate'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>分配额度</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-TAB 1: 机构额度 / 学院额度 */}
      {activeSubTab === 'mainQuota' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Asset Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-900 rounded-3xl p-6 text-white shadow-md space-y-3">
              <div className="flex items-center justify-between text-blue-200 text-xs font-bold">
                <span>{adminLevel === '总管理员' ? '机构正式采购额度总包' : '学院获配额度资产'}</span>
                <Wallet className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black font-mono">
                {adminLevel === '总管理员' ? formalTotalCredits.toLocaleString() : collegeTotalQuota.toLocaleString()}
                <span className="text-sm font-normal text-blue-200 ml-1">点</span>
              </div>
              <div className="pt-2 border-t border-white/20 text-[11px] text-blue-100 flex items-center justify-between">
                <span>{adminLevel === '总管理员' ? '对公银行签约采购' : '机构总池批复下发'}</span>
                <span className="font-bold">永久有效</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>{adminLevel === '总管理员' ? '全校已分配至学院额度' : '本院已分配至师生额度'}</span>
                <Coins className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-3xl font-black font-mono text-slate-900">
                {adminLevel === '总管理员'
                  ? colleges.reduce((sum, c) => sum + c.allocatedQuota, 0).toLocaleString()
                  : collegeMembers.reduce((sum, m) => sum + (m.credits || 0), 0).toLocaleString()
                }
                <span className="text-sm font-normal text-slate-400 ml-1">点</span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                {adminLevel === '总管理员' ? `已覆盖 ${colleges.length} 个二级学院` : `已覆盖 ${collegeMembers.length} 名师生`}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                <span>{adminLevel === '总管理员' ? '机构剩余可用未分配池' : '学院可用自留机动池'}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black font-mono text-emerald-600">
                {adminLevel === '总管理员'
                  ? Math.max(0, formalTotalCredits - colleges.reduce((sum, c) => sum + c.allocatedQuota, 0)).toLocaleString()
                  : Math.max(0, collegeTotalQuota - collegeMembers.reduce((sum, m) => sum + (m.credits || 0), 0)).toLocaleString()
                }
                <span className="text-sm font-normal text-slate-400 ml-1">点</span>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-bold">
                可随时进行下步划拨分配
              </div>
            </div>
          </div>

          {/* Allocation Breakdown Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <CreditCard className="w-4.5 h-4.5 text-indigo-600" />
                <span>{adminLevel === '总管理员' ? '各学院额度配额与使用详情' : '本院师生成员额度明细'}</span>
              </h3>
              <button
                onClick={() => setActiveSubTab('allocate')}
                className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>立即分配额度</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-5">{adminLevel === '总管理员' ? '学院名称' : '师生姓名'}</th>
                    <th className="py-3 px-5">{adminLevel === '总管理员' ? '管理员姓名' : '身份角色'}</th>
                    <th className="py-3 px-5">分配正式额度</th>
                    <th className="py-3 px-5">已实际检测消耗</th>
                    <th className="py-3 px-5">当前结余额度</th>
                    <th className="py-3 px-5 text-right">额度占比</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminLevel === '总管理员' ? (
                    colleges.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-5 font-bold text-slate-900">{c.name}</td>
                        <td className="py-3.5 px-5 text-slate-600 font-medium">{c.adminName}</td>
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-800">{c.allocatedQuota.toLocaleString()} 点</td>
                        <td className="py-3.5 px-5 font-mono text-slate-500">{c.usedQuota.toLocaleString()} 点</td>
                        <td className="py-3.5 px-5 font-mono font-bold text-emerald-600">{(c.allocatedQuota - c.usedQuota).toLocaleString()} 点</td>
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-700">
                          {Math.round((c.allocatedQuota / formalTotalCredits) * 100)}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    collegeMembers.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-5 font-bold text-slate-900">{m.name}</td>
                        <td className="py-3.5 px-5 text-slate-600 font-medium">{m.identity}</td>
                        <td className="py-3.5 px-5 font-mono font-bold text-slate-800">{(m.credits || 2000).toLocaleString()} 点</td>
                        <td className="py-3.5 px-5 font-mono text-slate-500">{((m.usedPapers || 0) * 800).toLocaleString()} 点</td>
                        <td className="py-3.5 px-5 font-mono font-bold text-emerald-600">{Math.max(0, (m.credits || 2000) - ((m.usedPapers || 0) * 800)).toLocaleString()} 点</td>
                        <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-700">
                          {Math.round(((m.credits || 2000) / collegeTotalQuota) * 100)}%
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
                <span>{adminLevel === '总管理员' ? '机构正式额度划拨学院历史明细' : '学院额度分配给师生历史记录'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">记录每一次额度划拨时间、操作人员、审批单号与划拨缘由</p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索接收对象或划拨缘由..."
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">流水单号</th>
                  <th className="py-3 px-5">分配时间</th>
                  <th className="py-3 px-5">{adminLevel === '总管理员' ? '目标学院' : '接收师生 (身份)'}</th>
                  <th className="py-3 px-5">分配检测次数</th>
                  <th className="py-3 px-5">操作管理员</th>
                  <th className="py-3 px-5">审批备注与依据</th>
                  <th className="py-3 px-5 text-right">划拨状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminLevel === '总管理员' ? (
                  filteredCollegeRecords.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-5 font-mono text-slate-500">{r.id}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-600">{r.time}</td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">{r.collegeName}</td>
                      <td className="py-3.5 px-5 font-mono font-bold text-indigo-700">+{r.amount.toLocaleString()} 点</td>
                      <td className="py-3.5 px-5 text-slate-700">{r.operator}</td>
                      <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate" title={r.reason}>{r.reason}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          已到账生效
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredMemberRecords.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-5 font-mono text-slate-500">{r.id}</td>
                      <td className="py-3.5 px-5 font-mono text-slate-600">{r.time}</td>
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {r.memberName} <span className="text-[10px] text-slate-400 font-normal">({r.role})</span>
                      </td>
                      <td className="py-3.5 px-5 font-mono font-bold text-indigo-700">+{r.amount.toLocaleString()} 点</td>
                      <td className="py-3.5 px-5 text-slate-700">{r.operator}</td>
                      <td className="py-3.5 px-5 text-slate-600 max-w-xs truncate" title={r.reason}>{r.reason}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          已分配到位
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

      {/* 4. SUB-TAB 3: 额度流水 */}
      {activeSubTab === 'flow' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <RotateCcw className="w-4.5 h-4.5 text-indigo-600" />
              <span>全局正式额度资金点数进出流水</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">全透明追溯额度流入（对公充值/机构划拨）与额度流出（下发/检测抵扣/回收）</p>
          </div>

          <div className="border border-slate-200/80 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">发生时间</th>
                  <th className="py-3 px-5">业务类型</th>
                  <th className="py-3 px-5">流水变动</th>
                  <th className="py-3 px-5">变动对象 / 用途</th>
                  <th className="py-3 px-5">操作经办人</th>
                  <th className="py-3 px-5 text-right">变动后余额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotaFlowRecords.map(f => (
                  <tr key={f.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-5 font-mono text-slate-500">{f.time}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        f.type === '机构充值' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        f.type === '学院下拨' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        f.type === '成员分配' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {f.type}
                      </span>
                    </td>
                    <td className={`py-3.5 px-5 font-mono font-extrabold ${f.change.startsWith('+') ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {f.change} 点
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-800">{f.target}</td>
                    <td className="py-3.5 px-5 text-slate-600">{f.operator}</td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-900">{f.balanceAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 4: 分配额度 */}
      {activeSubTab === 'allocate' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-2xl animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" />
              <span>{adminLevel === '总管理员' ? '向二级学院划拨正式额度' : '向本院学生或老师分配额度'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {adminLevel === '总管理员'
                ? '划拨后扣减机构可用总池，对应二级学院可用资产增加，学院管理员可进一步向其师生分配。'
                : `从【${managedCollege}】额度池中划拨，直接增加学生或老师个人积分账户余额用于长文检测。`}
            </p>
          </div>

          {adminLevel === '总管理员' ? (
            <form onSubmit={handleSubmitAllocateCollege} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">选择目标二级学院 *</label>
                <select
                  value={targetCollegeName}
                  onChange={(e) => setTargetCollegeName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-bold text-slate-900"
                >
                  {colleges.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} · 当前已分配: {c.allocatedQuota.toLocaleString()} 点 (管理员: {c.adminName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">划拨正式积分额度 (点) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={allocCollegeAmount}
                  onChange={(e) => setAllocCollegeAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold text-base text-indigo-900"
                />
                <div className="text-[11px] text-slate-400">
                  当前机构总池剩余可用：<strong className="text-emerald-600">{(formalTotalCredits - colleges.reduce((sum, c) => sum + c.allocatedQuota, 0)).toLocaleString()}</strong> 点
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">审批单号与划拨缘由</label>
                <input
                  type="text"
                  value={allocCollegeReason}
                  onChange={(e) => setAllocCollegeReason(e.target.value)}
                  placeholder="例如：2026届硕博学位论文预答辩首批划拨"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('mainQuota')}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>确认划拨额度</span>
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
                      {m.name} ({m.identity} · {m.phone}) · 当前额度: {(m.credits || 2000).toLocaleString()} 点
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">分配正式积分额度 (点) *</label>
                <input
                  type="number"
                  required
                  min="500"
                  step="500"
                  value={allocMemberAmount}
                  onChange={(e) => setAllocMemberAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold text-base text-indigo-900"
                />
                <div className="text-[11px] text-slate-400">
                  当前学院池剩余可用：<strong className="text-emerald-600">{(collegeTotalQuota - collegeMembers.reduce((sum, m) => sum + (m.credits || 0), 0)).toLocaleString()}</strong> 点
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">分配说明与备注</label>
                <input
                  type="text"
                  value={allocMemberReason}
                  onChange={(e) => setAllocMemberReason(e.target.value)}
                  placeholder="例如：毕业论文初稿格式规范检测支持"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('mainQuota')}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>确认分配给师生</span>
                </button>
              </div>
            </form>
          )}
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
