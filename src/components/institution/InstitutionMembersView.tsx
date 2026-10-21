import React, { useState, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Upload, 
  Trash2, 
  Search, 
  Download, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  KeyRound, 
  CreditCard, 
  Sparkles, 
  Edit2, 
  Lock, 
  FileSpreadsheet,
  Check,
  UserPlus
} from 'lucide-react';
import { TrialMemberItem } from '../../data/adminMockData';

interface InstitutionMembersViewProps {
  managedCollege: string;
  members: TrialMemberItem[];
  onUpdateMembers: (updated: TrialMemberItem[]) => void;
  onOpenAllocateQuotaToMember?: (memberName: string) => void;
  onOpenAllocateTrialToMember?: (memberName: string) => void;
}

export default function InstitutionMembersView({
  managedCollege,
  members,
  onUpdateMembers,
  onOpenAllocateQuotaToMember,
  onOpenAllocateTrialToMember,
}: InstitutionMembersViewProps) {
  // 4 Sub-Tabs as specified by User: 成员列表 | 新增成员 | 批量导入 | 删除等
  const [activeSubTab, setActiveSubTab] = useState<'membersList' | 'addMember' | 'batchImport' | 'deleteOps'>('membersList');
  const [searchQuery, setSearchQuery] = useState('');
  const [identityFilter, setIdentityFilter] = useState<'全部' | '学生' | '老师'>('全部');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Modals & form state
  const [editingMember, setEditingMember] = useState<TrialMemberItem | null>(null);
  const [resetPwdMember, setResetPwdMember] = useState<TrialMemberItem | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('123456');
  const [confirmDeleteMember, setConfirmDeleteMember] = useState<TrialMemberItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Single Add Member Form
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    identity: '学生' as '学生' | '老师',
    gender: '男' as '男' | '女',
    phone: '',
    account: '',
    password: '••••••',
    initialCredits: 2000,
    initialTrial: 2,
  });

  // Batch Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importPreviewList, setImportPreviewList] = useState<{
    name: string;
    identity: '学生' | '老师';
    gender: '男' | '女';
    phone: string;
    account: string;
    credits: number;
    trial: number;
  }[]>([]);

  // Only display members belonging to this college
  const collegeMembers = members.filter(m => m.department === managedCollege);

  const filteredMembers = collegeMembers.filter(m => {
    if (identityFilter !== '全部' && m.identity !== identityFilter) return false;
    if (searchQuery && !m.name.includes(searchQuery) && !m.phone.includes(searchQuery) && !(m.account || '').includes(searchQuery)) return false;
    return true;
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.name.trim() || !newMemberForm.phone.trim()) return;

    const newMember: TrialMemberItem = {
      id: `mem-${Date.now().toString().slice(-6)}`,
      name: newMemberForm.name.trim(),
      phone: newMemberForm.phone.trim(),
      gender: newMemberForm.gender,
      department: managedCollege,
      identity: newMemberForm.identity,
      account: newMemberForm.account.trim() || newMemberForm.phone.trim(),
      password: '••••••',
      passwordStatus: '已设置',
      joinBasis: '手动添加',
      relationStatus: '已加入',
      availablePapers: Number(newMemberForm.initialTrial) || 2,
      usedPapers: 0,
      credits: Number(newMemberForm.initialCredits) || 2000,
      role: newMemberForm.identity,
      email: `${newMemberForm.account.trim() || 'user'}@whu.edu.cn`,
      status: '正常',
      createTime: new Date().toISOString().slice(0, 10),
      papersCount: 0,
    };

    onUpdateMembers([newMember, ...members]);
    showToast(`已成功为【${managedCollege}】添加${newMember.identity}：${newMember.name}（手机：${newMember.phone}）！`);
    setActiveSubTab('membersList');
    setNewMemberForm({
      name: '',
      identity: '学生',
      gender: '男',
      phone: '',
      account: '',
      password: '••••••',
      initialCredits: 2000,
      initialTrial: 2,
    });
  };

  const handleSimulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    // Preset demo preview data parsed from template
    setImportPreviewList([
      { name: '赵子涵', identity: '学生', gender: '女', phone: '13800138901', account: '202320140101', credits: 2000, trial: 2 },
      { name: '钱文博', identity: '学生', gender: '男', phone: '13800138902', account: '202320140102', credits: 2000, trial: 2 },
      { name: '孙逸凡', identity: '学生', gender: '男', phone: '13800138903', account: '202320140103', credits: 2000, trial: 2 },
      { name: '李青松', identity: '老师', gender: '男', phone: '13900138904', account: 'TEA-2019088', credits: 5000, trial: 3 },
    ]);
  };

  const handleExecuteImport = () => {
    if (importPreviewList.length === 0) return;

    const importedMembers: TrialMemberItem[] = importPreviewList.map((p, idx) => ({
      id: `mem-import-${Date.now()}-${idx}`,
      name: p.name,
      phone: p.phone,
      gender: p.gender,
      department: managedCollege,
      identity: p.identity,
      account: p.account,
      password: '••••••',
      passwordStatus: '已设置',
      joinBasis: '学校导入',
      relationStatus: '已加入',
      availablePapers: p.trial,
      usedPapers: 0,
      credits: p.credits,
      role: p.identity,
      email: `${p.account}@whu.edu.cn`,
      status: '正常',
      createTime: new Date().toISOString().slice(0, 10),
      papersCount: 0,
    }));

    onUpdateMembers([...importedMembers, ...members]);
    showToast(`成功批量导入 ${importedMembers.length} 名师生成员到【${managedCollege}】！`);
    setImportPreviewList([]);
    setImportFileName('');
    setActiveSubTab('membersList');
  };

  const handleExecuteBatchDelete = () => {
    if (selectedMemberIds.length === 0) return;
    onUpdateMembers(members.filter(m => !selectedMemberIds.includes(m.id)));
    showToast(`已成功批量移除 ${selectedMemberIds.length} 名成员！`);
    setSelectedMemberIds([]);
  };

  const handleSingleDelete = () => {
    if (!confirmDeleteMember) return;
    onUpdateMembers(members.filter(m => m.id !== confirmDeleteMember.id));
    showToast(`已成功移除成员《${confirmDeleteMember.name}》！`);
    setConfirmDeleteMember(null);
  };

  const handleSaveResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPwdMember) return;
    showToast(`已为成员【${resetPwdMember.name}】重置登录密码为：${newPasswordValue}！`);
    setResetPwdMember(null);
  };

  const handleDownloadTemplate = () => {
    const csvContent = "姓名,身份,性别,手机号,学号或工号,初始额度,初始试用\n张三,学生,男,13800130001,202320140001,2000,2\n李四,老师,女,13900130002,TEA-2020001,5000,3";
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${managedCollege}_师生成员导入模板.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('导入模板下载成功！');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header & Sub-Tabs Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>{managedCollege} · 二级学院师生管理专属中心</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>成员管理</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {activeSubTab === 'membersList' ? '成员列表' : 
                 activeSubTab === 'addMember' ? '新增成员' : 
                 activeSubTab === 'batchImport' ? '批量导入' : '删除等批量管理'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              学院管理员专属权限：添加本学院学生和老师，分配机构下拨的正式额度与试用篇数，支持批量Excel导入与账号维护。
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setActiveSubTab('addMember')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>新增学生/老师</span>
            </button>
            <button
              onClick={() => setActiveSubTab('batchImport')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs sm:text-sm font-bold cursor-pointer flex items-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>批量导入</span>
            </button>
          </div>
        </div>

        {/* 4 Secondary Sub-Tabs as specified by User */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('membersList')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'membersList'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>成员列表</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
              {collegeMembers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('addMember')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'addMember'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>新增成员</span>
          </button>

          <button
            onClick={() => setActiveSubTab('batchImport')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'batchImport'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>批量导入</span>
          </button>

          <button
            onClick={() => setActiveSubTab('deleteOps')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'deleteOps'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>删除等批量管理</span>
            {selectedMemberIds.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                已选 {selectedMemberIds.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. SUB-TAB 1: 成员列表 */}
      {activeSubTab === 'membersList' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索学生姓名、工号/学号或手机号..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['全部', '学生', '老师'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => setIdentityFilter(role)}
                    className={`px-3 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                      identityFilter === role ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-slate-400 font-mono text-xs">
              在册师生共 <strong className="text-slate-800 font-bold">{filteredMembers.length}</strong> 人
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">成员姓名 / 性别</th>
                    <th className="py-3.5 px-6">身份角色</th>
                    <th className="py-3.5 px-6">登录账号 / 学工号</th>
                    <th className="py-3.5 px-6">绑定手机号</th>
                    <th className="py-3.5 px-6">正式检测额度</th>
                    <th className="py-3.5 px-6">校方试用篇数</th>
                    <th className="py-3.5 px-6">已检测论文</th>
                    <th className="py-3.5 px-6 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {m.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{m.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{m.gender} · {m.joinBasis || '在校在籍'}</div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          m.identity === '老师' 
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {m.identity}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-700">
                        {m.account || m.phone}
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-600">
                        {m.phone}
                      </td>

                      <td className="py-4 px-6 font-mono">
                        <span className="font-bold text-indigo-900">{(m.credits && m.credits < 100 ? m.credits : Math.floor((m.credits || 2000) / 100)).toLocaleString()} 次</span>
                      </td>

                      <td className="py-4 px-6 font-mono">
                        <span className="font-bold text-amber-600">{m.availablePapers} 篇剩余</span>
                        <div className="text-[10px] text-slate-400">已消耗 {m.usedPapers} 篇</div>
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-700">
                        {m.papersCount || m.usedPapers || 0} 篇
                      </td>

                      <td className="py-4 px-6 text-right space-x-1.5">
                        <button
                          onClick={() => onOpenAllocateQuotaToMember && onOpenAllocateQuotaToMember(m.name)}
                          className="px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer transition-colors inline-flex items-center gap-1"
                          title="为该成员划拨正式检测额度"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>分额度</span>
                        </button>

                        <button
                          onClick={() => onOpenAllocateTrialToMember && onOpenAllocateTrialToMember(m.name)}
                          className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-700 font-bold text-xs cursor-pointer transition-colors inline-flex items-center gap-1"
                          title="为该成员划拨校方试用篇数"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>发试用</span>
                        </button>

                        <button
                          onClick={() => setResetPwdMember(m)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-xs cursor-pointer"
                          title="重置该成员登录密码"
                        >
                          密码
                        </button>

                        <button
                          onClick={() => setConfirmDeleteMember(m)}
                          className="px-2.5 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 font-medium text-xs cursor-pointer"
                          title="移出学院"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUB-TAB 2: 新增成员 */}
      {activeSubTab === 'addMember' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-2xl animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-600" />
              <span>添加本院学生或教师</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">添加后将自动归属于【{managedCollege}】，成员可登录进行学术论文规范检测</p>
          </div>

          <form onSubmit={handleCreateMember} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">成员姓名 *</label>
                <input
                  type="text"
                  required
                  value={newMemberForm.name}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                  placeholder="例如：李明"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">身份角色 *</label>
                <select
                  value={newMemberForm.identity}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, identity: e.target.value as '学生' | '老师' })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-bold"
                >
                  <option value="学生">在读学生 (本科/硕博)</option>
                  <option value="老师">指导教师 / 专任教师</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">手机号码 (用于接收验证码/登录) *</label>
                <input
                  type="text"
                  required
                  value={newMemberForm.phone}
                  onChange={(e) => setNewMemberForm(prev => ({
                    ...prev,
                    phone: e.target.value,
                    account: prev.account || e.target.value,
                  }))}
                  placeholder="例如：13800138888"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">学号或工号</label>
                <input
                  type="text"
                  value={newMemberForm.account}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, account: e.target.value })}
                  placeholder="例如：202320140088"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-3">
              <div className="text-xs font-bold text-indigo-900">初始额度与试用批复 (从学院池划拨)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">初始正式额度 (点)</label>
                  <input
                    type="number"
                    value={newMemberForm.initialCredits}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, initialCredits: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">初始试用篇数 (篇)</label>
                  <input
                    type="number"
                    value={newMemberForm.initialTrial}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, initialTrial: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold text-amber-600"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('membersList')}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>确认添加成员</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. SUB-TAB 3: 批量导入 */}
      {activeSubTab === 'batchImport' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 max-w-3xl animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              <span>批量导入本院师生成员 (Excel / CSV)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">下载标准表格模板，填入本院学生学号或教师工号后一键上传完成批量开通</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-indigo-600 flex items-center justify-center shadow-2xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">第一步：下载标准模板</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                表格已预设规范表头：姓名、身份 (学生/老师)、手机号、学号或工号、初始额度、试用篇数。
              </p>
              <button
                onClick={handleDownloadTemplate}
                className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>下载标准表格模板.csv</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-slate-700 flex items-center justify-center shadow-2xs">
                <Upload className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">第二步：上传文件解析</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                支持 .csv, .xlsx, .xls 文件格式，系统自动校验手机号与学号格式。
              </p>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleSimulateFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>选择文件并上传</span>
                </button>
              </div>
            </div>
          </div>

          {/* Import Preview Area */}
          {importPreviewList.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">解析数据预览 ({importFileName})</h4>
                  <p className="text-xs text-emerald-600 mt-0.5 font-bold">
                    已成功解析出 {importPreviewList.length} 条师生成员记录，点击确认入库即可立即生效
                  </p>
                </div>
                <button
                  onClick={handleExecuteImport}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>确认一键导入入库</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4">姓名</th>
                      <th className="py-2.5 px-4">身份</th>
                      <th className="py-2.5 px-4">手机号</th>
                      <th className="py-2.5 px-4">学号/工号</th>
                      <th className="py-2.5 px-4">划拨额度</th>
                      <th className="py-2.5 px-4">划拨试用</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importPreviewList.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{p.name}</td>
                        <td className="py-2.5 px-4">{p.identity}</td>
                        <td className="py-2.5 px-4 font-mono">{p.phone}</td>
                        <td className="py-2.5 px-4 font-mono">{p.account}</td>
                        <td className="py-2.5 px-4 font-mono text-indigo-700">{p.credits} 点</td>
                        <td className="py-2.5 px-4 font-mono text-amber-600">{p.trial} 篇</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. SUB-TAB 4: 删除等批量管理 */}
      {activeSubTab === 'deleteOps' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-600" />
                <span>批量移除与状态维护</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">支持按需勾选离校或已毕业成员进行批量移出，或锁定密码</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setSelectedMemberIds(collegeMembers.map(m => m.id))}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                全选本院 ({collegeMembers.length})
              </button>
              <button
                onClick={() => setSelectedMemberIds([])}
                className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                清空勾选
              </button>
              <button
                onClick={handleExecuteBatchDelete}
                disabled={selectedMemberIds.length === 0}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  selectedMemberIds.length > 0 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>批量移出 ({selectedMemberIds.length})</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5 w-10">选择</th>
                  <th className="py-3 px-5">成员姓名</th>
                  <th className="py-3 px-5">身份</th>
                  <th className="py-3 px-5">手机号 / 账号</th>
                  <th className="py-3 px-5">剩余额度 / 试用</th>
                  <th className="py-3 px-5">状态</th>
                  <th className="py-3 px-5 text-right">单项移除</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {collegeMembers.map(m => {
                  const isChecked = selectedMemberIds.includes(m.id);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedMemberIds(selectedMemberIds.filter(id => id !== m.id));
                            } else {
                              setSelectedMemberIds([...selectedMemberIds, m.id]);
                            }
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-5 font-bold text-slate-900">{m.name}</td>
                      <td className="py-3 px-5 text-slate-600">{m.identity}</td>
                      <td className="py-3 px-5 font-mono text-slate-600">{m.phone}</td>
                      <td className="py-3 px-5 font-mono">
                        <span className="text-slate-800">{m.credits || 2000} 点</span> · <span className="text-amber-600">{m.availablePapers} 篇</span>
                      </td>
                      <td className="py-3 px-5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold">
                          正常
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <button
                          onClick={() => setConfirmDeleteMember(m)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-bold cursor-pointer"
                        >
                          移出
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: 重置密码 */}
      {resetPwdMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-purple-600" />
                <span>重置成员登录密码</span>
              </h3>
              <button onClick={() => setResetPwdMember(null)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResetPassword} className="space-y-4 text-xs">
              <p className="text-slate-600">
                为成员 <strong className="text-slate-900 font-bold">{resetPwdMember.name}</strong> ({resetPwdMember.phone}) 设置新的登录密码：
              </p>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">新密码</label>
                <input
                  type="text"
                  required
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetPwdMember(null)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  确认重置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: 单人删除确认 */}
      {confirmDeleteMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2.5 text-rose-600">
              <AlertCircle className="w-5 h-5" />
              <h4 className="font-black text-slate-900 text-base">确认移出成员</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              确定要将成员 <strong className="text-slate-900 font-bold">《{confirmDeleteMember.name}》</strong> 从当前学院中移出吗？移出后其所属的学院额度与试用篇数将回收至学院池。
            </p>
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setConfirmDeleteMember(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-xl font-bold text-slate-600"
              >
                取消
              </button>
              <button
                onClick={handleSingleDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold"
              >
                确认移出
              </button>
            </div>
          </div>
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
