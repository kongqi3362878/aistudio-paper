import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  RotateCw, 
  X, 
  CheckCircle2, 
  Building2, 
  User, 
  FileText, 
  ChevronRight, 
  AlertCircle, 
  GraduationCap,
  ShieldCheck,
  KeyRound,
  Lock,
  Coins,
  Sparkles,
  School,
  ExternalLink,
  Users
} from 'lucide-react';
import { initialInstitutions, InstitutionItem } from '../../../data/adminMockData';

interface InstitutionsViewProps {
  institutions?: InstitutionItem[];
  onUpdateInstitutions?: (updated: InstitutionItem[]) => void;
  onOpenTrialPerspective?: (institutionName: string) => void;
}

export default function InstitutionsView({
  institutions: propInstitutions,
  onUpdateInstitutions,
  onOpenTrialPerspective,
}: InstitutionsViewProps = {}) {
  const [localInstitutions, setLocalInstitutions] = useState<InstitutionItem[]>(initialInstitutions);
  const institutions = propInstitutions || localInstitutions;

  const setInstitutionsState = (updater: (prev: InstitutionItem[]) => InstitutionItem[]) => {
    const updated = updater(institutions);
    if (onUpdateInstitutions) {
      onUpdateInstitutions(updated);
    } else {
      setLocalInstitutions(updated);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  // Drawers and Modals
  const [selectedDetailInst, setSelectedDetailInst] = useState<InstitutionItem | null>(null);
  const [editingInst, setEditingInst] = useState<InstitutionItem | null>(null);
  const [quotaInst, setQuotaInst] = useState<InstitutionItem | null>(null);
  const [trialInst, setTrialInst] = useState<InstitutionItem | null>(null);
  const [adminAccountInst, setAdminAccountInst] = useState<InstitutionItem | null>(null);
  const [showAddInstModal, setShowAddInstModal] = useState(false);

  // Form state for creating new institution & admin account
  const [newInstForm, setNewInstForm] = useState({
    name: '',
    type: '高校',
    contact: '',
    phone: '',
    adminAccount: '',
    adminPassword: '',
    adminName: '',
    adminPhone: '',
    totalCredits: 200000,
    trialLimit: 50,
    notes: '',
  });

  // Form state for editing admin account
  const [adminAccountForm, setAdminAccountForm] = useState({
    adminAccount: '',
    adminName: '',
    adminPhone: '',
    newPassword: '',
    status: '正常' as '正常' | '禁用',
  });

  // Form state for trial papers adjustment
  const [trialAdjustAmount, setTrialAdjustAmount] = useState('30');
  const [trialAdjustReason, setTrialAdjustReason] = useState('学期初校方试用批复');

  const [editingMember, setEditingMember] = useState<{
    instId: string;
    member: { id: string; name: string; email: string; phone: string; role: string; status: string; credits: number; createTime: string; };
  } | null>(null);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<{
    instId: string;
    memberId: string;
    memberName: string;
  } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const [viewingPapersMember, setViewingPapersMember] = useState<{
    name: string;
    institution: string;
    papers: { title: string; time: string; status: string; issues: number }[];
  } | null>(null);

  // Add Member Modal State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '学生',
    status: '正常',
    credits: 2000,
  });

  // Form states for Editing Institution (Screenshot 7)
  const [editForm, setEditForm] = useState({
    name: '',
    type: '高校',
    contact: '',
    phone: '',
    status: '正常' as '正常' | '禁用',
    notes: '',
  });

  // Form states for Quota Allocation (Screenshot 12)
  const [allocAmount, setAllocAmount] = useState('50000');
  const [allocNote, setAllocNote] = useState('秋季试点');

  const openEditModal = (inst: InstitutionItem) => {
    setEditingInst(inst);
    setEditForm({
      name: inst.name,
      type: inst.type,
      contact: inst.contact,
      phone: inst.phone,
      status: inst.status,
      notes: inst.notes,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInst) return;
    setInstitutionsState((prev) =>
      prev.map((item) =>
        item.id === editingInst.id
          ? {
              ...item,
              name: editForm.name,
              type: editForm.type,
              contact: editForm.contact,
              phone: editForm.phone,
              status: editForm.status,
              notes: editForm.notes,
            }
          : item
      )
    );
    if (selectedDetailInst && selectedDetailInst.id === editingInst.id) {
      setSelectedDetailInst((prev) => prev ? {
        ...prev,
        name: editForm.name,
        type: editForm.type,
        contact: editForm.contact,
        phone: editForm.phone,
        status: editForm.status,
        notes: editForm.notes,
      } : null);
    }
    setEditingInst(null);
  };

  const openQuotaModal = (inst: InstitutionItem) => {
    setQuotaInst(inst);
    setAllocAmount('500');
    setAllocNote('秋季批复');
  };

  const handleConfirmQuota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quotaInst) return;
    const addTimes = parseInt(allocAmount) || 0;
    const addCredits = addTimes * 100;
    const nowStr = `${new Date().getMonth() + 1}月${new Date().getDate()}日`;
    
    setInstitutionsState((prev) =>
      prev.map((item) => {
        if (item.id === quotaInst.id) {
          const newTotal = item.totalCredits + addCredits;
          const newLog = {
            time: nowStr,
            operator: '管理员',
            change: addCredits,
            before: item.totalCredits,
            after: newTotal,
            notes: allocNote || '额度分配',
          };
          const updatedInst = {
            ...item,
            totalCredits: newTotal,
            quotaLogs: [newLog, ...(item.quotaLogs || [])],
          };
          if (selectedDetailInst && selectedDetailInst.id === item.id) {
            setSelectedDetailInst(updatedInst);
          }
          return updatedInst;
        }
        return item;
      })
    );
    setQuotaInst(null);
  };

  const openAdminAccountModal = (inst: InstitutionItem) => {
    setAdminAccountInst(inst);
    setAdminAccountForm({
      adminAccount: inst.adminAccount || (inst.name.includes('武汉') ? 'whu_admin' : `${inst.id}_admin`),
      adminName: inst.adminName || inst.contact,
      adminPhone: inst.adminPhone || inst.phone,
      newPassword: '',
      status: inst.status,
    });
  };

  const handleSaveAdminAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminAccountInst) return;

    setInstitutionsState((prev) =>
      prev.map((item) => {
        if (item.id === adminAccountInst.id) {
          const updated: InstitutionItem = {
            ...item,
            adminAccount: adminAccountForm.adminAccount.trim(),
            adminName: adminAccountForm.adminName.trim(),
            adminPhone: adminAccountForm.adminPhone.trim(),
            adminPassword: adminAccountForm.newPassword.trim() ? adminAccountForm.newPassword.trim() : item.adminPassword || '••••••',
            adminPasswordStatus: adminAccountForm.newPassword.trim() ? '已重置' : item.adminPasswordStatus || '已设置',
            status: adminAccountForm.status,
          };
          if (selectedDetailInst && selectedDetailInst.id === item.id) {
            setSelectedDetailInst(updated);
          }
          return updated;
        }
        return item;
      })
    );

    showToast(`机构管理账号【${adminAccountForm.adminAccount}】配置已成功保存！`);
    setAdminAccountInst(null);
  };

  const openTrialModal = (inst: InstitutionItem) => {
    setTrialInst(inst);
    setTrialAdjustAmount('30');
    setTrialAdjustReason('学期校方学术论文试用配额批复');
  };

  const handleSaveTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialInst) return;
    const addedPapers = parseInt(trialAdjustAmount) || 0;

    setInstitutionsState((prev) =>
      prev.map((item) => {
        if (item.id === trialInst.id) {
          const newLimit = (item.trialLimit || 0) + addedPapers;
          const newAvail = (item.trialAvailable || 0) + addedPapers;
          const updated: InstitutionItem = {
            ...item,
            trialLimit: newLimit,
            trialAvailable: newAvail,
          };
          if (selectedDetailInst && selectedDetailInst.id === item.id) {
            setSelectedDetailInst(updated);
          }
          return updated;
        }
        return item;
      })
    );

    showToast(`已成功为【${trialInst.name}】追加 ${addedPapers} 篇试用配额！`);
    setTrialInst(null);
  };

  const handleCreateInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstForm.name.trim()) return;

    const newId = `inst-${Date.now().toString().slice(-6)}`;
    const nowStr = `${new Date().getMonth() + 1}月${new Date().getDate()}日`;
    const credits = Number(newInstForm.totalCredits) || 200000;
    const trials = Number(newInstForm.trialLimit) || 50;

    const newInst: InstitutionItem = {
      id: newId,
      name: newInstForm.name.trim(),
      createTime: `创建于 ${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${String(new Date().getDate()).padStart(2, '0')} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`,
      type: newInstForm.type,
      status: '正常',
      contact: newInstForm.contact.trim() || newInstForm.adminName.trim() || '机构管理员',
      phone: newInstForm.phone.trim() || newInstForm.adminPhone.trim() || '13800000000',
      totalCredits: credits,
      usedCredits: 0,
      trialLimit: trials,
      trialUsed: 0,
      trialAvailable: trials,
      notes: newInstForm.notes.trim() || '系统后台新建机构',
      adminAccount: newInstForm.adminAccount.trim() || `${newId}_admin`,
      adminName: newInstForm.adminName.trim() || newInstForm.contact.trim() || '管理员',
      adminPhone: newInstForm.adminPhone.trim() || newInstForm.phone.trim() || '13800000000',
      adminPassword: newInstForm.adminPassword.trim() || '123456',
      adminPasswordStatus: '已设置',
      collegesCount: 1,
      membersCount: 0,
      quotaLogs: [
        {
          time: nowStr,
          operator: '系统管理员',
          change: credits,
          before: 0,
          after: credits,
          notes: '新建机构初始充值额度',
        },
      ],
      members: [],
    };

    setInstitutionsState((prev) => [newInst, ...prev]);
    showToast(`机构【${newInst.name}】已成功创建！管理账号：${newInst.adminAccount}，初始密码：${newInst.adminPassword}`);
    setShowAddInstModal(false);
    setNewInstForm({
      name: '',
      type: '高校',
      contact: '',
      phone: '',
      adminAccount: '',
      adminPassword: '',
      adminName: '',
      adminPhone: '',
      totalCredits: 200000,
      trialLimit: 50,
      notes: '',
    });
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setInstitutionsState((prev) =>
      prev.map((inst) => {
        if (inst.id === editingMember.instId) {
          const updatedMembers = (inst.members || []).map((m) =>
            m.id === editingMember.member.id ? editingMember.member : m
          );
          const updatedInst = { ...inst, members: updatedMembers };
          if (selectedDetailInst && selectedDetailInst.id === inst.id) {
            setSelectedDetailInst(updatedInst);
          }
          return updatedInst;
        }
        return inst;
      })
    );
    setEditingMember(null);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDetailInst || !newMemberForm.name.trim()) return;
    const newMember = {
      id: `mem-${Date.now()}`,
      name: newMemberForm.name.trim(),
      email: newMemberForm.email.trim() || `${newMemberForm.name}@inst.edu.cn`,
      phone: newMemberForm.phone.trim() || '138****0000',
      role: newMemberForm.role,
      status: newMemberForm.status,
      createTime: new Date().toISOString().slice(0, 10).replace(/-/g, '/'),
      credits: Number(newMemberForm.credits) || 0,
    };
    setInstitutionsState((prev) =>
      prev.map((inst) => {
        if (inst.id === selectedDetailInst.id) {
          const updatedInst = {
            ...inst,
            members: [newMember, ...(inst.members || [])],
          };
          setSelectedDetailInst(updatedInst);
          return updatedInst;
        }
        return inst;
      })
    );
    setShowAddMemberModal(false);
    setNewMemberForm({
      name: '',
      email: '',
      phone: '',
      role: '学生',
      status: '正常',
      credits: 2000,
    });
  };

  const handleRemoveMemberFromInst = (instId: string, memberId: string, memberName: string) => {
    setConfirmRemoveMember({ instId, memberId, memberName });
  };

  const executeRemoveMember = () => {
    if (!confirmRemoveMember) return;
    const { instId, memberId, memberName } = confirmRemoveMember;
    setInstitutionsState((prev) =>
      prev.map((inst) => {
        if (inst.id === instId) {
          const updatedMembers = (inst.members || []).filter((m) => m.id !== memberId);
          const updatedInst = { ...inst, members: updatedMembers };
          if (selectedDetailInst && selectedDetailInst.id === instId) {
            setSelectedDetailInst(updatedInst);
          }
          return updatedInst;
        }
        return inst;
      })
    );
    showToast(`已成功将《${memberName}》移出机构`);
    setConfirmRemoveMember(null);
  };

  const filtered = institutions.filter((inst) => {
    if (
      searchQuery &&
      !inst.name.includes(searchQuery) &&
      !inst.contact.includes(searchQuery) &&
      !inst.phone.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans pb-16 relative">
      {/* 1. Header (Screenshot 1) */}
      <div className="pb-2 border-b border-slate-200/80">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">机构管理</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          机构资料与检测次数额度在此管理；高校试用的成员、发放和用量单独立项。
        </p>
      </div>

      {/* 2. Search Bar matching Screenshot 1 */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索机构名称、管理账号或联系人"
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <button
            onClick={() => {}}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all"
          >
            搜索
          </button>

          <button
            onClick={() => setSearchQuery('')}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-xl transition-all cursor-pointer"
          >
            清除筛选
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-slate-400 font-mono text-xs">
            共 <strong className="text-slate-700 font-bold">{institutions.length}</strong> 家机构
          </div>

          <button
            id="btn-add-institution"
            onClick={() => setShowAddInstModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>新建机构与管理账号</span>
          </button>
        </div>
      </div>

      {/* 3. Table matching Screenshot 1 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">机构 / 类型</th>
                <th className="py-3.5 px-6">机构管理账号</th>
                <th className="py-3.5 px-6">联系人</th>
                <th className="py-3.5 px-6">状态</th>
                <th className="py-3.5 px-6">检测次数额度 / 已用</th>
                <th className="py-3.5 px-6">高校试用</th>
                <th className="py-3.5 px-6 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inst) => {
                const hasTrial = typeof inst.trialLimit === 'number' && inst.trialLimit > 0;
                const totalTimes = Math.floor(inst.totalCredits / 100);
                const usedTimes = Math.floor(inst.usedCredits / 100);
                const remainTimes = Math.max(0, totalTimes - usedTimes);
                return (
                  <tr key={inst.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* 机构 / 类型 */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>{inst.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">{inst.type} · 创建于系统</div>
                    </td>

                    {/* 机构管理账号 */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="font-mono text-indigo-950 font-black">{inst.adminAccount || (inst.id + '_admin')}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-bold">总管</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>管理员: {inst.adminName || inst.contact}</span>
                        <button
                          onClick={() => openAdminAccountModal(inst)}
                          className="text-indigo-600 hover:underline font-bold text-[10px] inline-flex items-center gap-0.5 cursor-pointer"
                          title="配置管理员账号密码与信息"
                        >
                          <KeyRound className="w-3 h-3 text-purple-600" />
                          <span>配置密码</span>
                        </button>
                      </div>
                    </td>

                    {/* 联系人 */}
                    <td className="py-4 px-6 text-slate-700">
                      <div className="font-medium text-slate-800">{inst.contact}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{inst.phone}</div>
                    </td>

                    {/* 状态 */}
                    <td className="py-4 px-6">
                      {inst.status === '正常' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          正常
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          禁用
                        </span>
                      )}
                    </td>

                    {/* 检测次数额度 / 已用 */}
                    <td className="py-4 px-6 font-mono">
                      <div className="font-bold text-slate-800 text-xs">
                        {totalTimes.toLocaleString()} 次
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        已用 {usedTimes.toLocaleString()} 次 · 剩余 <strong className="text-emerald-600">{remainTimes.toLocaleString()}</strong> 次
                      </div>
                    </td>

                    {/* 高校试用 (Screenshot 1) */}
                    <td className="py-4 px-6">
                      {hasTrial ? (
                        <div className="space-y-1">
                          <div className="text-slate-700 text-xs">
                            已使用 <strong className="text-slate-900">{inst.trialUsed || 0}</strong> / 上限 {inst.trialLimit} 篇
                          </div>
                          <div className="text-[11px] text-slate-400">
                            可分配 {inst.trialAvailable ?? (inst.trialLimit! - (inst.trialUsed || 0))} 篇
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </td>

                    {/* 操作 (包含进入工作台、管理账号、充值额度、分配试用、详情、编辑) */}
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          if (onOpenTrialPerspective) {
                            onOpenTrialPerspective(inst.name);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-all border border-indigo-200/80"
                        title="以该机构总管理员身份直接登录进入机构工作台"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>进入工作台</span>
                      </button>

                      <button
                        onClick={() => openAdminAccountModal(inst)}
                        className="px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-700 font-bold text-xs cursor-pointer transition-all inline-flex items-center gap-1"
                        title="管理该机构的总管理账号与登录密码"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                        <span>管理账号</span>
                      </button>

                      <button
                        onClick={() => openQuotaModal(inst)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-all inline-flex items-center gap-1"
                        title="为该机构充值检测次数额度"
                      >
                        <Coins className="w-3.5 h-3.5 text-amber-600" />
                        <span>充值次数</span>
                      </button>

                      <button
                        onClick={() => openTrialModal(inst)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-all inline-flex items-center gap-1"
                        title="批复该机构高校试用篇数"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>分配试用</span>
                      </button>

                      <button
                        onClick={() => setSelectedDetailInst(inst)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs cursor-pointer transition-all"
                      >
                        详情
                      </button>

                      <button
                        onClick={() => openEditModal(inst)}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs cursor-pointer transition-all"
                      >
                        编辑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Footnote matching Screenshot 1 */}
      <p className="text-xs text-slate-400 leading-relaxed pt-2">
        机构检测额度（按次）与按篇试用分别记账。本页的“分配检测额度”按检测次数计算，不会增加试用篇数。
      </p>

      {/* ======================================================== */}
      {/* DRAWER: 机构详情 (参考第一张图)                            */}
      {/* ======================================================== */}
      {selectedDetailInst && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div 
            className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-900">机构详情</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{selectedDetailInst.name}</p>
              </div>
              <button 
                onClick={() => setSelectedDetailInst(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-7 text-xs sm:text-sm">
              {/* Meta Summary Top Section (Screenshot 1) */}
              <div className="space-y-3 pb-5 border-b border-slate-100">
                {/* 机构管理账号专属卡片 */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 to-purple-50/80 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span className="font-extrabold text-slate-900 text-sm">机构管理账号</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold">总管理员</span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono flex items-center gap-2">
                      <span>登录账号: <strong className="text-indigo-900">{selectedDetailInst.adminAccount || (selectedDetailInst.id + '_admin')}</strong></span>
                      <span>·</span>
                      <span>管理员: {selectedDetailInst.adminName || selectedDetailInst.contact}</span>
                      <span>·</span>
                      <span>手机: {selectedDetailInst.adminPhone || selectedDetailInst.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openAdminAccountModal(selectedDetailInst)}
                      className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                      <span>配置账号</span>
                    </button>
                    {onOpenTrialPerspective && (
                      <button
                        onClick={() => onOpenTrialPerspective(selectedDetailInst.name)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>进入工作台</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">联系人 / 电话</span>
                  <span className="font-bold text-slate-800">
                    {selectedDetailInst.contact} / {selectedDetailInst.phone}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">授权检测额度（总额 / 已用）</span>
                  <span className="font-mono font-bold text-slate-900">
                    {Math.floor(selectedDetailInst.totalCredits / 100).toLocaleString()} / {Math.floor(selectedDetailInst.usedCredits / 100).toLocaleString()} 次
                  </span>
                </div>
                {/* 高校试用概览 */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100/90 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span>高校试用（按篇）</span>
                    </div>
                    <div className="text-[11px] text-indigo-700/80 mt-0.5 font-mono">
                      上限 {selectedDetailInst.trialLimit ?? 40} 篇 · 已用 {selectedDetailInst.trialUsed ?? 1} 篇 · 可继续发放 {selectedDetailInst.trialAvailable ?? 38} 篇
                    </div>
                  </div>
                  {onOpenTrialPerspective && (
                    <button
                      onClick={() => onOpenTrialPerspective(selectedDetailInst.name)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <span>校方试用管理</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Section 1: 检测额度分配流水 (按次) */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm">检测额度分配流水 (按次)</h4>
                <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                      <tr>
                        <th className="py-2.5 px-4">时间</th>
                        <th className="py-2.5 px-4">操作人</th>
                        <th className="py-2.5 px-4">新增检测次数</th>
                        <th className="py-2.5 px-4">额度变化</th>
                        <th className="py-2.5 px-4">备注</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDetailInst.quotaLogs && selectedDetailInst.quotaLogs.length > 0 ? (
                        selectedDetailInst.quotaLogs.map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-mono text-slate-500">{log.time}</td>
                            <td className="py-3 px-4 text-slate-700">{log.operator}</td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                              +{(log.change >= 100 ? Math.floor(log.change / 100) : log.change).toLocaleString()} 次
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-500">
                              {Math.floor(log.before / 100).toLocaleString()} 次 → {Math.floor(log.after / 100).toLocaleString()} 次
                            </td>
                            <td className="py-3 px-4 text-slate-600">{log.notes}</td>
                          </tr>
                        ))
                      ) : (
                        <>
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-mono text-slate-500">09月12日</td>
                            <td className="py-3 px-4 text-slate-700">管理员</td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-600">+500 次</td>
                            <td className="py-3 px-4 font-mono text-slate-500">1,500 次 → 2,000 次</td>
                            <td className="py-3 px-4 text-slate-600">秋季批复</td>
                          </tr>
                          <tr className="hover:bg-slate-50/50">
                            <td className="py-3 px-4 font-mono text-slate-500">09月01日</td>
                            <td className="py-3 px-4 text-slate-700">管理员</td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-600">+1,000 次</td>
                            <td className="py-3 px-4 font-mono text-slate-500">500 次 → 1,500 次</td>
                            <td className="py-3 px-4 text-slate-600">授权额度</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Drawer Bottom Actions: 分配检测额度 & 关闭 */}
            <div className="p-5 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div>
                {onOpenTrialPerspective && (
                  <button
                    onClick={() => onOpenTrialPerspective(selectedDetailInst.name)}
                    className="px-4 py-2.5 border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold cursor-pointer text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>以校方视角管理</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openQuotaModal(selectedDetailInst)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer transition-all"
                >
                  分配检测额度
                </button>
                <button
                  onClick={() => setSelectedDetailInst(null)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer transition-all"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 分配检测额度（按次）                                */}
      {/* ======================================================== */}
      {quotaInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">分配检测额度（按次）</h3>
                <p className="text-xs text-slate-400 mt-0.5">{quotaInst.name}</p>
              </div>
              <button onClick={() => setQuotaInst(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmQuota} className="space-y-4 text-xs sm:text-sm">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between font-mono">
                <span className="text-slate-500 font-sans">当前授权总次数</span>
                <span className="font-bold text-slate-800">{Math.floor(quotaInst.totalCredits / 100).toLocaleString()} 次</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">新增授权检测额度（次）</label>
                <input
                  type="number"
                  min="1"
                  value={allocAmount}
                  onChange={(e) => setAllocAmount(e.target.value)}
                  placeholder="例如：500"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">分配备注说明</label>
                <input
                  type="text"
                  value={allocNote}
                  onChange={(e) => setAllocNote(e.target.value)}
                  placeholder="例如：秋季批复、教学科研检测配额"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuotaInst(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  确认增加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 编辑机构 (Screenshot 7)                            */}
      {/* ======================================================== */}
      {editingInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">编辑机构</h3>
                <p className="text-xs text-slate-400 mt-0.5">{editingInst.name}</p>
              </div>
              <button onClick={() => setEditingInst(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">机构名称</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">机构类型</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option>高校</option>
                    <option>科研院所</option>
                    <option>企业</option>
                    <option>出版社</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">联系人</label>
                  <input
                    type="text"
                    value={editForm.contact}
                    onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">联系电话</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">机构状态</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option>正常</option>
                    <option>禁用</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">备注说明</label>
                  <input
                    type="text"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingInst(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 编辑机构成员账号                                   */}
      {/* ======================================================== */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">编辑成员账号</h3>
                <p className="text-xs text-slate-400 mt-0.5">{editingMember.member.name}</p>
              </div>
              <button onClick={() => setEditingMember(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">姓名</label>
                <input
                  type="text"
                  value={editingMember.member.name}
                  onChange={(e) => setEditingMember({
                    ...editingMember,
                    member: { ...editingMember.member, name: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">角色</label>
                  <select
                    value={editingMember.member.role}
                    onChange={(e) => setEditingMember({
                      ...editingMember,
                      member: { ...editingMember.member, role: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option>学生</option>
                    <option>教师</option>
                    <option>机构管理员</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">状态</label>
                  <select
                    value={editingMember.member.status}
                    onChange={(e) => setEditingMember({
                      ...editingMember,
                      member: { ...editingMember.member, status: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option>正常</option>
                    <option>禁用</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">检测次数额度 (次)</label>
                <input
                  type="number"
                  value={editingMember.member.credits}
                  onChange={(e) => setEditingMember({
                    ...editingMember,
                    member: { ...editingMember.member, credits: parseInt(e.target.value) || 0 }
                  })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 查看成员论文记录                                   */}
      {/* ======================================================== */}
      {viewingPapersMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{viewingPapersMember.name} 的送检论文</h3>
                <p className="text-xs text-slate-400 mt-0.5">{viewingPapersMember.institution}</p>
              </div>
              <button onClick={() => setViewingPapersMember(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto text-xs">
              {viewingPapersMember.papers.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="font-bold text-slate-900 text-sm leading-snug">{p.title}</div>
                  <div className="flex items-center justify-between text-slate-500 font-mono text-[11px]">
                    <span>送检时间：{p.time}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60 font-sans">
                      {p.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    检出规范问题：<strong className="text-indigo-600">{p.issues} 处</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewingPapersMember(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 添加机构成员                                       */}
      {/* ======================================================== */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">添加机构成员</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedDetailInst?.name}</p>
              </div>
              <button onClick={() => setShowAddMemberModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">成员姓名</label>
                <input
                  type="text"
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  placeholder="例如：陈梓涵"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">手机号码</label>
                  <input
                    type="text"
                    value={newMemberForm.phone}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, phone: e.target.value })}
                    placeholder="例如：13812345678"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">电子邮箱</label>
                  <input
                    type="email"
                    value={newMemberForm.email}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                    placeholder="可选，便于通知"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">角色身份</label>
                  <select
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option>学生</option>
                    <option>教师</option>
                    <option>机构管理员</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">初始检测额度 (次)</label>
                  <input
                    type="number"
                    value={newMemberForm.credits}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, credits: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
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

      {/* MODAL: 确认移出机构成员 */}
      {confirmRemoveMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">移出机构成员</h4>
                <p className="text-xs text-slate-500 mt-0.5">确认将此成员移出该机构</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              确定要将成员 <strong className="text-slate-900 font-bold">《{confirmRemoveMember.memberName}》</strong> 从当前机构移出吗？移出后其机构专属检测额度将失效。
            </p>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmRemoveMember(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={executeRemoveMember}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/20 cursor-pointer"
              >
                确认移出
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 新建机构与管理账号                                  */}
      {/* ======================================================== */}
      {showAddInstModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">新建机构与管理账号</h3>
                  <p className="text-xs text-slate-400 mt-0.5">为学校或机构开通管理账户，机构管理员可登录配置学院与分配额度</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddInstModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInstitution} className="space-y-4 text-xs sm:text-sm">
              {/* 机构基本资料 */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 text-indigo-700">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>机构基本资料</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">机构名称 *</label>
                    <input
                      type="text"
                      required
                      value={newInstForm.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewInstForm(prev => ({
                          ...prev,
                          name: val,
                          adminAccount: prev.adminAccount || (val ? `${val.slice(0, 3)}_admin` : ''),
                        }));
                      }}
                      placeholder="例如：华中科技大学"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">机构类型</label>
                    <select
                      value={newInstForm.type}
                      onChange={(e) => setNewInstForm({ ...newInstForm, type: e.target.value })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value="高校">高校 (双一流/普通本科)</option>
                      <option value="科研院所">科研院所 (研究所/实验室)</option>
                      <option value="独立学院">独立学院 / 高职高专</option>
                      <option value="企业">教育企业 / 试点单位</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">联系人 / 负责人 *</label>
                    <input
                      type="text"
                      required
                      value={newInstForm.contact}
                      onChange={(e) => setNewInstForm(prev => ({ 
                        ...prev, 
                        contact: e.target.value,
                        adminName: prev.adminName || e.target.value 
                      }))}
                      placeholder="例如：陈老师"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">联系电话 *</label>
                    <input
                      type="text"
                      required
                      value={newInstForm.phone}
                      onChange={(e) => setNewInstForm(prev => ({ 
                        ...prev, 
                        phone: e.target.value,
                        adminPhone: prev.adminPhone || e.target.value 
                      }))}
                      placeholder="例如：13900130312"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 机构管理账号配置 (核心要求) */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-indigo-900 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>机构管理员账号设置 (用于前端登录配置学院与额度)</span>
                  </h4>
                  <span className="text-[10px] text-indigo-700 font-bold bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                    总管理员身份
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">登录管理账号 *</label>
                    <input
                      type="text"
                      required
                      value={newInstForm.adminAccount}
                      onChange={(e) => setNewInstForm({ ...newInstForm, adminAccount: e.target.value })}
                      placeholder="例如：hust_admin"
                      className="w-full px-3.5 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold text-indigo-950"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">初始密码 *</label>
                    <input
                      type="text"
                      required
                      value={newInstForm.adminPassword || '123456'}
                      onChange={(e) => setNewInstForm({ ...newInstForm, adminPassword: e.target.value })}
                      placeholder="默认：123456"
                      className="w-full px-3.5 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">管理员姓名 *</label>
                    <input
                      type="text"
                      required
                      value={newInstForm.adminName}
                      onChange={(e) => setNewInstForm({ ...newInstForm, adminName: e.target.value })}
                      placeholder="例如：陈老师"
                      className="w-full px-3.5 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">管理员手机号 *</label>
                    <input
                      type="text"
                      required
                      value={newInstForm.adminPhone}
                      onChange={(e) => setNewInstForm({ ...newInstForm, adminPhone: e.target.value })}
                      placeholder="用于接收验证码与通知"
                      className="w-full px-3.5 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 初始额度配置 */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 text-amber-700">
                  <Coins className="w-3.5 h-3.5" />
                  <span>初始额度与试用批复</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">初始授权检测额度 (次)</label>
                    <input
                      type="number"
                      value={newInstForm.totalCredits}
                      onChange={(e) => setNewInstForm({ ...newInstForm, totalCredits: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-xs">批复高校试用 (篇数)</label>
                    <input
                      type="number"
                      value={newInstForm.trialLimit}
                      onChange={(e) => setNewInstForm({ ...newInstForm, trialLimit: parseInt(e.target.value) || 0 })}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold text-amber-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">备注说明</label>
                  <input
                    type="text"
                    value={newInstForm.notes}
                    onChange={(e) => setNewInstForm({ ...newInstForm, notes: e.target.value })}
                    placeholder="例如：2026秋季学期采购合同试点"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  创建后即可在前端使用此管理账号登录进入机构工作台
                </span>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddInstModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>确认创建机构</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 管理机构管理员账号 (修改/重置密码)                   */}
      {/* ======================================================== */}
      {adminAccountInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">配置机构管理账号</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{adminAccountInst.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setAdminAccountInst(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminAccount} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">登录管理账号</label>
                <input
                  type="text"
                  required
                  value={adminAccountForm.adminAccount}
                  onChange={(e) => setAdminAccountForm({ ...adminAccountForm, adminAccount: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold text-indigo-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">管理员姓名</label>
                  <input
                    type="text"
                    required
                    value={adminAccountForm.adminName}
                    onChange={(e) => setAdminAccountForm({ ...adminAccountForm, adminName: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">手机号码</label>
                  <input
                    type="text"
                    required
                    value={adminAccountForm.adminPhone}
                    onChange={(e) => setAdminAccountForm({ ...adminAccountForm, adminPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">重置登录密码</label>
                  <button
                    type="button"
                    onClick={() => setAdminAccountForm({ ...adminAccountForm, newPassword: '123456' })}
                    className="text-[11px] text-indigo-600 hover:underline font-bold"
                  >
                    一键重置为 123456
                  </button>
                </div>
                <input
                  type="text"
                  value={adminAccountForm.newPassword}
                  onChange={(e) => setAdminAccountForm({ ...adminAccountForm, newPassword: e.target.value })}
                  placeholder="留空则保持原密码不变"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">账号运行状态</label>
                <select
                  value={adminAccountForm.status}
                  onChange={(e) => setAdminAccountForm({ ...adminAccountForm, status: e.target.value as '正常' | '禁用' })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-bold"
                >
                  <option value="正常">正常使用中</option>
                  <option value="禁用">禁用停用</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {onOpenTrialPerspective && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdminAccountInst(null);
                      onOpenTrialPerspective(adminAccountInst.name);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>免密进入工作台</span>
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAdminAccountInst(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    保存账号配置
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: 分配/批复高校试用篇数                               */}
      {/* ======================================================== */}
      {trialInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">批复高校试用篇数</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{trialInst.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setTrialInst(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTrial} className="space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>当前试用上限:</span>
                  <strong className="text-slate-800">{trialInst.trialLimit || 0} 篇</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>已消耗使用:</span>
                  <strong className="text-slate-800">{trialInst.trialUsed || 0} 篇</strong>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>当前剩余可用:</span>
                  <strong className="text-emerald-600">{trialInst.trialAvailable || 0} 篇</strong>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">本次追加批复篇数 (篇) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={trialAdjustAmount}
                  onChange={(e) => setTrialAdjustAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold text-amber-600 text-base"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">批复依据与说明</label>
                <input
                  type="text"
                  value={trialAdjustReason}
                  onChange={(e) => setTrialAdjustReason(e.target.value)}
                  placeholder="例如：2026学年开题校方免费试用批复"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTrialInst(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  确认批复下发
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
