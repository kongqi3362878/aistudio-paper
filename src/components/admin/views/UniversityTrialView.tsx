import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Settings, 
  Plus, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  ExternalLink,
  RotateCw,
  X,
  ChevronRight
} from 'lucide-react';
import { 
  initialTrialUniversities, 
  initialTrialGrants, 
  initialTrialLogs,
  TrialUniversityItem,
  TrialGrantItem,
  TrialLogItem
} from '../../../data/adminMockData';

interface UniversityTrialViewProps {
  onOpenSchoolPerspective?: (schoolName: string) => void;
}

export default function UniversityTrialView({ onOpenSchoolPerspective }: UniversityTrialViewProps) {
  const [universities, setUniversities] = useState<TrialUniversityItem[]>(initialTrialUniversities);
  const [grants, setGrants] = useState<TrialGrantItem[]>(initialTrialGrants);
  const [logs, setLogs] = useState<TrialLogItem[]>(initialTrialLogs);

  // Modal states
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [showPlatformGrantModal, setShowPlatformGrantModal] = useState(false);
  const [adjustLimitSchool, setAdjustLimitSchool] = useState<TrialUniversityItem | null>(null);
  const [newLimitInput, setNewLimitInput] = useState<number>(40);

  // Forms
  const [addSchoolName, setAddSchoolName] = useState('华中师范大学');
  const [addSchoolLimit, setAddSchoolLimit] = useState(20);

  const [grantRecipient, setGrantRecipient] = useState('');
  const [grantSchool, setGrantSchool] = useState('武汉大学');
  const [grantAmount, setGrantAmount] = useState(1);
  const [grantReason, setGrantReason] = useState('优秀科研团队专项试用支持');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Calculate top metrics
  const totalLimit = 60;
  const totalGranted = universities.reduce((acc, u) => acc + u.grantedPapers, 0);
  const totalUsed = universities.reduce((acc, u) => acc + u.usedPapers, 0);
  const totalAvailable = 58;

  // Handle adjust limit
  const handleSaveAdjustLimit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustLimitSchool) return;
    setUniversities(prev => prev.map(u => {
      if (u.id === adjustLimitSchool.id) {
        const diff = newLimitInput - u.limitPapers;
        return {
          ...u,
          limitPapers: newLimitInput,
          availablePapers: Math.max(0, u.availablePapers + diff),
        };
      }
      return u;
    }));
    showToast(`已成功将《${adjustLimitSchool.institutionName}》发放上限调整为 ${newLimitInput} 篇`);
    setAdjustLimitSchool(null);
  };

  // Handle add school
  const handleAddSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addSchoolName.trim()) return;
    const newSchool: TrialUniversityItem = {
      id: `trial-u-${Date.now()}`,
      institutionName: addSchoolName.trim(),
      limitPapers: addSchoolLimit,
      grantedPapers: 0,
      usedPapers: 0,
      availablePapers: addSchoolLimit,
    };
    setUniversities(prev => [...prev, newSchool]);
    showToast(`已成功添加试点高校《${addSchoolName}》，上限 ${addSchoolLimit} 篇`);
    setShowAddSchoolModal(false);
    setAddSchoolName('');
  };

  // Handle platform grant
  const handlePlatformGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantRecipient.trim()) {
      showToast('请输入收件人姓名或手机号');
      return;
    }
    const newGrant: TrialGrantItem = {
      id: `grant-${Date.now()}`,
      recipient: grantRecipient.trim(),
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      institution: grantSchool,
      granted: grantAmount,
      used: 0,
      revoked: 0,
      source: '平台发放',
      operator: '平台管理员',
      reason: grantReason || '平台特批试用发放',
    };
    setGrants(prev => [newGrant, ...prev]);
    setUniversities(prev => prev.map(u => {
      if (u.institutionName === grantSchool) {
        return {
          ...u,
          grantedPapers: u.grantedPapers + grantAmount,
          availablePapers: Math.max(0, u.availablePapers - grantAmount),
        };
      }
      return u;
    }));
    showToast(`已为《${grantSchool}》的 ${grantRecipient} 定向发放 ${grantAmount} 篇试用`);
    setShowPlatformGrantModal(false);
    setGrantRecipient('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans pb-16">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">高校试用</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            管理试点范围、学校发放上限和使用记录。校方可在本校范围内邀请、审核和发放。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs sm:text-sm shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span>配置试点</span>
          </button>

          <button
            onClick={() => {
              if (onOpenSchoolPerspective) {
                onOpenSchoolPerspective('武汉大学');
              }
            }}
            className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>查看校方试用入口</span>
          </button>
        </div>
      </div>

      {/* 2. Three Metric Cards matching Screenshot 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: 当前试点 (Purple/Indigo Hero Card) */}
        <div className="bg-gradient-to-br from-[#4F46E5] to-[#4338CA] rounded-2xl p-6 text-white shadow-md shadow-indigo-500/10 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-xs text-indigo-200 font-medium">当前试点</span>
            <h3 className="text-2xl font-black tracking-tight">高校试用</h3>
          </div>
          <div className="text-xs text-indigo-100 font-mono mt-4 pt-3 border-t border-indigo-400/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>2026-09-23 至 2026-12-31 · 开放中</span>
          </div>
        </div>

        {/* Card 2: 渠道上限 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500">渠道上限</span>
          <div className="my-2">
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">{totalLimit} 篇</div>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            已发放 {totalGranted} 篇，已使用 {totalUsed} 篇
          </div>
        </div>

        {/* Card 3: 可继续发放 */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500">可继续发放</span>
          <div className="my-2">
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">{totalAvailable} 篇</div>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            退出成员的未使用篇数收回后可再次发放
          </div>
        </div>
      </div>

      {/* 3. Section 1: 参与学校 Table (Screenshot 2) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">参与学校</h3>
          <button
            onClick={() => setShowAddSchoolModal(true)}
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>添加学校</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">机构</th>
                <th className="py-3 px-6">发放上限</th>
                <th className="py-3 px-6">已发放</th>
                <th className="py-3 px-6">已使用</th>
                <th className="py-3 px-6">可继续发放</th>
                <th className="py-3 px-6 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {universities.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-800 text-sm">
                    {u.institutionName}
                  </td>
                  <td className="py-4 px-6 font-mono font-medium text-slate-700">
                    {u.limitPapers} 篇
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-600">
                    {u.grantedPapers} 篇
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-600">
                    {u.usedPapers} 篇
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-indigo-600">
                    {u.availablePapers} 篇
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => {
                        setAdjustLimitSchool(u);
                        setNewLimitInput(u.limitPapers);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium cursor-pointer transition-all"
                    >
                      调整上限
                    </button>
                    <button
                      onClick={() => {
                        if (onOpenSchoolPerspective) {
                          onOpenSchoolPerspective(u.institutionName);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 text-indigo-700 hover:border-indigo-200 font-bold cursor-pointer transition-all inline-flex items-center gap-1"
                    >
                      <span>成员与记录</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Section 2: 最近发放 Table (Screenshot 2) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">最近发放</h3>
          <button
            onClick={() => setShowPlatformGrantModal(true)}
            className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
          >
            <span>平台定向发放</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">收件人 / 时间</th>
                <th className="py-3 px-6">机构</th>
                <th className="py-3 px-6">发放 / 已使用 / 已收回</th>
                <th className="py-3 px-6">来源</th>
                <th className="py-3 px-6">操作人</th>
                <th className="py-3 px-6">原因</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grants.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="font-bold text-slate-800">{g.recipient}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{g.time}</div>
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-700">
                    {g.institution}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-slate-600">
                    <span className="font-bold text-slate-800">{g.granted}</span> / {g.used} / {g.revoked} 篇
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    {g.source}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600">
                    {g.operator}
                  </td>
                  <td className="py-3.5 px-6 text-slate-500">
                    {g.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Section 3: 试用流水 Table (Screenshot 2) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">试用流水</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-6">时间</th>
                <th className="py-3 px-6">用户</th>
                <th className="py-3 px-6">机构</th>
                <th className="py-3 px-6">事件</th>
                <th className="py-3 px-6">变动</th>
                <th className="py-3 px-6">说明</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-mono text-slate-400">
                    {l.time}
                  </td>
                  <td className="py-3.5 px-6 font-bold text-slate-800">
                    {l.user}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-slate-700">
                    {l.institution}
                  </td>
                  <td className="py-3.5 px-6">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                      {l.event}
                    </span>
                  </td>
                  <td className="py-3.5 px-6 font-mono font-bold text-red-600">
                    {l.change}
                  </td>
                  <td className="py-3.5 px-6 text-slate-500">
                    {l.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Footnote matching Screenshot 2 */}
      <p className="text-xs text-slate-400 leading-relaxed pt-2">
        每篇试用额度检测一篇完整论文，不设字数上限。加入机构与获得试用篇数是两次独立操作。本页为本地交互设计稿，真实发放与核销尚未接入服务端。
      </p>

      {/* ======================================================== */}
      {/* MODAL: 调整上限                                           */}
      {/* ======================================================== */}
      {adjustLimitSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">调整高校发放上限</h3>
                <p className="text-xs text-slate-400 mt-0.5">{adjustLimitSchool.institutionName}</p>
              </div>
              <button onClick={() => setAdjustLimitSchool(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustLimit} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">新发放上限（篇）</label>
                <input
                  type="number"
                  min={adjustLimitSchool.grantedPapers}
                  value={newLimitInput}
                  onChange={(e) => setNewLimitInput(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  required
                />
                <span className="text-[11px] text-slate-400">
                  当前已发放 {adjustLimitSchool.grantedPapers} 篇，上限不能低于已发放数。
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAdjustLimitSchool(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  确认调整
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 添加学校                                           */}
      {/* ======================================================== */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">添加试用高校</h3>
                <p className="text-xs text-slate-400 mt-0.5">将高校纳入按篇试用试点范围</p>
              </div>
              <button onClick={() => setShowAddSchoolModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSchool} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">高校名称</label>
                <input
                  type="text"
                  value={addSchoolName}
                  onChange={(e) => setAddSchoolName(e.target.value)}
                  placeholder="例如：华中师范大学"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">初始试用篇数上限</label>
                <input
                  type="number"
                  min="1"
                  value={addSchoolLimit}
                  onChange={(e) => setAddSchoolLimit(parseInt(e.target.value) || 10)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 平台定向发放                                       */}
      {/* ======================================================== */}
      {showPlatformGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">平台定向发放试用篇数</h3>
                <p className="text-xs text-slate-400 mt-0.5">直接给指定高校师生发放试用篇数</p>
              </div>
              <button onClick={() => setShowPlatformGrantModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlatformGrant} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">所属机构</label>
                <select
                  value={grantSchool}
                  onChange={(e) => setGrantSchool(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                >
                  {universities.map(u => (
                    <option key={u.id} value={u.institutionName}>{u.institutionName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">收件人（姓名或手机）</label>
                <input
                  type="text"
                  value={grantRecipient}
                  onChange={(e) => setGrantRecipient(e.target.value)}
                  placeholder="例如：周宁 或 13800138000"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">发放篇数</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">发放来源</label>
                  <input
                    type="text"
                    value="平台发放"
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">发放原因说明</label>
                <input
                  type="text"
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  placeholder="例如：试点名单首批发放"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPlatformGrantModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  确认发放
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 配置试点                                           */}
      {/* ======================================================== */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">配置高校试点参数</h3>
                <p className="text-xs text-slate-400 mt-0.5">调整试点周期与通道额度</p>
              </div>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">试点周期</label>
                <input
                  type="text"
                  defaultValue="2026-09-23 至 2026-12-31"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">全渠道试用总预算篇数</label>
                <input
                  type="number"
                  defaultValue="60"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-500 space-y-1">
                <p className="font-bold text-slate-700">规则说明：</p>
                <p>1. 校方可在分配的上限内自主分配或邀请学生。</p>
                <p>2. 每篇额度检测一篇完整学位论文，不限字数。</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  保存配置
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
