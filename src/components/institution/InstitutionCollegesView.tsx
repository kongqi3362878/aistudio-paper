import React, { useState } from 'react';
import { 
  School, 
  Plus, 
  Edit2, 
  ShieldCheck, 
  KeyRound, 
  CreditCard, 
  Sparkles, 
  Users, 
  Search, 
  Download, 
  CheckCircle2, 
  X, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Layers,
  Phone,
  UserCheck
} from 'lucide-react';
import { CollegeItem } from './types';
import { TrialMemberItem } from '../../data/adminMockData';

interface InstitutionCollegesViewProps {
  currentSchool: string;
  colleges: CollegeItem[];
  members: TrialMemberItem[];
  onUpdateColleges: (updated: CollegeItem[]) => void;
  onOpenCollegePerspective: (collegeName: string) => void;
  onOpenAllocateQuota: (collegeName: string) => void;
  onOpenAllocateTrial: (collegeName: string) => void;
}

export default function InstitutionCollegesView({
  currentSchool,
  colleges,
  members,
  onUpdateColleges,
  onOpenCollegePerspective,
  onOpenAllocateQuota,
  onOpenAllocateTrial,
}: InstitutionCollegesViewProps) {
  // 4 Sub-Tabs as specified: 学院列表 | 新增学院 | 学院管理员 | 学院额度
  const [activeSubTab, setActiveSubTab] = useState<'collegesList' | 'addCollege' | 'collegeAdmins' | 'collegeQuotas'>('collegesList');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / forms
  const [editingCollege, setEditingCollege] = useState<CollegeItem | null>(null);
  const [assigningAdminCollege, setAssigningAdminCollege] = useState<CollegeItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // New College Form
  const [newCollegeForm, setNewCollegeForm] = useState({
    name: '',
    code: '',
    category: '信息科学学部',
    description: '',
    adminName: '',
    adminAccount: '',
    adminPhone: '',
    adminPassword: '',
    initialQuota: 30000,
    initialTrial: 10,
  });

  // Assign Admin Form
  const [adminForm, setAdminForm] = useState({
    adminName: '',
    adminAccount: '',
    adminPhone: '',
    adminPassword: '',
  });

  const handleCreateCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollegeForm.name.trim() || !newCollegeForm.code.trim()) return;

    const newId = `col-${Date.now().toString().slice(-6)}`;
    const newCollege: CollegeItem = {
      id: newId,
      name: newCollegeForm.name.trim(),
      code: newCollegeForm.code.trim().toUpperCase(),
      category: newCollegeForm.category,
      description: newCollegeForm.description.trim() || '重点学科与创新人才培养示范基地',
      createTime: new Date().toISOString().slice(0, 10),
      status: '正常',
      adminName: newCollegeForm.adminName.trim() || '学院管理员',
      adminAccount: newCollegeForm.adminAccount.trim() || `${newCollegeForm.code.toLowerCase()}_admin`,
      adminPhone: newCollegeForm.adminPhone.trim() || '13800000000',
      adminPassword: newCollegeForm.adminPassword.trim() || '123456',
      allocatedQuota: Number(newCollegeForm.initialQuota) || 30000,
      usedQuota: 0,
      allocatedTrialPapers: Number(newCollegeForm.initialTrial) || 10,
      usedTrialPapers: 0,
      studentsCount: 25,
      teachersCount: 4,
    };

    onUpdateColleges([...colleges, newCollege]);
    showToast(`学院【${newCollege.name}】及管理员账号【${newCollege.adminAccount}】已创建成功！`);
    setActiveSubTab('collegesList');
    setNewCollegeForm({
      name: '',
      code: '',
      category: '信息科学学部',
      description: '',
      adminName: '',
      adminAccount: '',
      adminPhone: '',
      adminPassword: '',
      initialQuota: 30000,
      initialTrial: 10,
    });
  };

  const handleSaveEditCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollege) return;

    onUpdateColleges(
      colleges.map(c => c.id === editingCollege.id ? editingCollege : c)
    );
    showToast(`学院【${editingCollege.name}】信息已更新！`);
    setEditingCollege(null);
  };

  const openAssignAdminModal = (col: CollegeItem) => {
    setAssigningAdminCollege(col);
    setAdminForm({
      adminName: col.adminName || '',
      adminAccount: col.adminAccount || `${col.code.toLowerCase()}_admin`,
      adminPhone: col.adminPhone || '',
      adminPassword: '',
    });
  };

  const handleSaveAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningAdminCollege) return;

    onUpdateColleges(
      colleges.map(c => {
        if (c.id === assigningAdminCollege.id) {
          return {
            ...c,
            adminName: adminForm.adminName.trim(),
            adminAccount: adminForm.adminAccount.trim(),
            adminPhone: adminForm.adminPhone.trim(),
            ...(adminForm.adminPassword.trim() ? { adminPassword: adminForm.adminPassword.trim() } : {}),
          };
        }
        return c;
      })
    );

    showToast(`已为【${assigningAdminCollege.name}】委任管理员：${adminForm.adminName}（账号：${adminForm.adminAccount}）！`);
    setAssigningAdminCollege(null);
  };

  const filteredColleges = colleges.filter(c => 
    !searchQuery || 
    c.name.includes(searchQuery) || 
    c.code.includes(searchQuery) || 
    c.adminName.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header & Sub-Tabs Navigation */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold">
              <School className="w-3.5 h-3.5" />
              <span>机构院系二级管理专属中心</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>学院管理</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {activeSubTab === 'collegesList' ? '学院列表' : 
                 activeSubTab === 'addCollege' ? '新增学院' : 
                 activeSubTab === 'collegeAdmins' ? '学院管理员' : '学院额度'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              机构总管理员专属权限：维护全校二级学院架构、指派学院管理员，并在学院维度监控正式额度与试用批复。
            </p>
          </div>

          <button
            onClick={() => setActiveSubTab('addCollege')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>新增学院与管理员</span>
          </button>
        </div>

        {/* 4 Secondary Sub-Tabs as specified by User */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('collegesList')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'collegesList'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <School className="w-4 h-4" />
            <span>学院列表</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white">
              {colleges.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('addCollege')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'addCollege'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>新增学院</span>
          </button>

          <button
            onClick={() => setActiveSubTab('collegeAdmins')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'collegeAdmins'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>学院管理员</span>
          </button>

          <button
            onClick={() => setActiveSubTab('collegeQuotas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === 'collegeQuotas'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>学院额度</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-TAB 1: 学院列表 */}
      {activeSubTab === 'collegesList' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索学院名称、代码或管理员姓名..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="text-slate-400 text-xs">
              共计 <strong className="text-slate-800 font-bold">{filteredColleges.length}</strong> 所二级学院
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">学院名称 / 代号</th>
                    <th className="py-3.5 px-6">学部门类</th>
                    <th className="py-3.5 px-6">学院管理员 (账号)</th>
                    <th className="py-3.5 px-6">师生规模</th>
                    <th className="py-3.5 px-6">已划拨额度 / 消耗</th>
                    <th className="py-3.5 px-6">试用篇数 / 剩余</th>
                    <th className="py-3.5 px-6">运行状态</th>
                    <th className="py-3.5 px-6 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredColleges.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          <School className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>{c.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">代码: {c.code}</div>
                      </td>

                      <td className="py-4 px-6 text-slate-600">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-medium">
                          {c.category}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{c.adminName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          账号: {c.adminAccount} · {c.adminPhone}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800">
                          {c.studentsCount + c.teachersCount} 人
                        </div>
                        <div className="text-[11px] text-slate-400">
                          学生 {c.studentsCount} · 教师 {c.teachersCount}
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono">
                        <div className="font-bold text-slate-800">{c.allocatedQuota.toLocaleString()} 点</div>
                        <div className="text-[11px] text-slate-400">已用 {c.usedQuota.toLocaleString()} 点</div>
                      </td>

                      <td className="py-4 px-6 font-mono">
                        <div className="font-bold text-amber-600">{c.allocatedTrialPapers} 篇</div>
                        <div className="text-[11px] text-slate-400">剩余 {c.allocatedTrialPapers - c.usedTrialPapers} 篇</div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          正常运行
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right space-x-1.5">
                        <button
                          onClick={() => onOpenCollegePerspective(c.name)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-all border border-indigo-200/80"
                          title="以该学院管理员视角进入学院工作台"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>进入学院工作台</span>
                        </button>

                        <button
                          onClick={() => openAssignAdminModal(c)}
                          className="px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-700 font-bold text-xs cursor-pointer transition-all inline-flex items-center gap-1"
                          title="委任或修改学院管理员账号"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          <span>委任管理员</span>
                        </button>

                        <button
                          onClick={() => setEditingCollege(c)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs cursor-pointer transition-all"
                        >
                          编辑
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

      {/* 3. SUB-TAB 2: 新增学院 */}
      {activeSubTab === 'addCollege' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-3xl animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>新增二级学院与指派初始管理员</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">创建新的学院后，被授权的学院管理员可登录前端自主维护该学院师生</p>
          </div>

          <form onSubmit={handleCreateCollege} className="space-y-5 text-xs sm:text-sm">
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs text-indigo-700 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5" />
                <span>学院基本信息</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">学院名称 *</label>
                  <input
                    type="text"
                    required
                    value={newCollegeForm.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewCollegeForm(prev => ({
                        ...prev,
                        name: val,
                        code: prev.code || (val.includes('外语') ? 'SFL' : val.includes('法') ? 'LAW' : val.slice(0, 3).toUpperCase()),
                      }));
                    }}
                    placeholder="例如：外国语学院"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">学院代号 (英文大写) *</label>
                  <input
                    type="text"
                    required
                    value={newCollegeForm.code}
                    onChange={(e) => setNewCollegeForm({ ...newCollegeForm, code: e.target.value.toUpperCase() })}
                    placeholder="例如：SFL"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">所属学部</label>
                  <select
                    value={newCollegeForm.category}
                    onChange={(e) => setNewCollegeForm({ ...newCollegeForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option value="信息科学学部">信息科学学部</option>
                    <option value="工学部">工学部</option>
                    <option value="理学部">理学部</option>
                    <option value="人文社会科学部">人文社会科学部</option>
                    <option value="医学部">医学部</option>
                    <option value="交叉综合学部">交叉综合学部</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">学科方向简介</label>
                  <input
                    type="text"
                    value={newCollegeForm.description}
                    onChange={(e) => setNewCollegeForm({ ...newCollegeForm, description: e.target.value })}
                    placeholder="例如：英语语言文学、翻译硕士专业"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 学院管理员配置 */}
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-purple-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>指派学院管理员（用于登录学院工作台）</span>
                </h4>
                <span className="text-[10px] text-purple-700 font-bold bg-white px-2 py-0.5 rounded-full border border-purple-200">
                  可管理本院学生与老师
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">管理员真实姓名 *</label>
                  <input
                    type="text"
                    required
                    value={newCollegeForm.adminName}
                    onChange={(e) => setNewCollegeForm({ ...newCollegeForm, adminName: e.target.value })}
                    placeholder="例如：李主任"
                    className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">管理员登录账号 *</label>
                  <input
                    type="text"
                    required
                    value={newCollegeForm.adminAccount}
                    onChange={(e) => setNewCollegeForm({ ...newCollegeForm, adminAccount: e.target.value })}
                    placeholder="例如：whu_sfl_admin"
                    className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">管理员联系手机 *</label>
                  <input
                    type="text"
                    required
                    value={newCollegeForm.adminPhone}
                    onChange={(e) => setNewCollegeForm({ ...newCollegeForm, adminPhone: e.target.value })}
                    placeholder="例如：13800139903"
                    className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-xs">初始密码</label>
                  <input
                    type="text"
                    value={newCollegeForm.adminPassword || '123456'}
                    onChange={(e) => setNewCollegeForm({ ...newCollegeForm, adminPassword: e.target.value })}
                    placeholder="默认：123456"
                    className="w-full px-3.5 py-2 bg-white border border-purple-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 初始划拨额度与试用 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">首批划拨正式额度 (点)</label>
                <input
                  type="number"
                  value={newCollegeForm.initialQuota}
                  onChange={(e) => setNewCollegeForm({ ...newCollegeForm, initialQuota: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">首批划拨试用篇数 (篇)</label>
                <input
                  type="number"
                  value={newCollegeForm.initialTrial}
                  onChange={(e) => setNewCollegeForm({ ...newCollegeForm, initialTrial: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold text-amber-600"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('collegesList')}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>确认新增学院并保存</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. SUB-TAB 3: 学院管理员 */}
      {activeSubTab === 'collegeAdmins' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>各二级学院管理员配置与授权明细</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">机构总管可在此委任、更换管理员或重置密码；学院管理员有权添加本院师生并分配额度与试用</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {colleges.map(c => (
                <div key={c.id} className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:border-purple-200 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                      <School className="w-4 h-4 text-purple-600" />
                      <span>{c.name}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                      {c.code}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">管理员:</span>
                      <strong className="text-slate-900">{c.adminName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">登录账号:</span>
                      <strong className="text-indigo-900">{c.adminAccount}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">联系电话:</span>
                      <span className="text-slate-700">{c.adminPhone}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => onOpenCollegePerspective(c.name)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>进入该院工作台</span>
                    </button>
                    <button
                      onClick={() => openAssignAdminModal(c)}
                      className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                    >
                      修改/更换
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. SUB-TAB 4: 学院额度 */}
      {activeSubTab === 'collegeQuotas' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <span>各学院正式额度与校方试用配额看板</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">机构总管可对任意二级学院进行正式充值额度追加或试用篇数划拨</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {colleges.map(c => (
                <div key={c.id} className="p-5 rounded-2xl border border-slate-200/80 bg-white shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-extrabold text-slate-900 text-base">{c.name}</div>
                    <span className="text-[10px] text-slate-400 font-mono">管理员: {c.adminName}</span>
                  </div>

                  {/* Formal Quota bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600 flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                        <span>正式额度</span>
                      </span>
                      <span className="font-mono text-indigo-900">
                        {c.allocatedQuota.toLocaleString()} 点 (已用 {c.usedQuota.toLocaleString()})
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${Math.round((c.usedQuota / c.allocatedQuota) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Trial papers bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>校方试用</span>
                      </span>
                      <span className="font-mono text-amber-600">
                        {c.allocatedTrialPapers} 篇 (剩余 {c.allocatedTrialPapers - c.usedTrialPapers} 篇)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.round((c.usedTrialPapers / c.allocatedTrialPapers) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenAllocateQuota(c.name)}
                      className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs cursor-pointer transition-colors text-center"
                    >
                      分配正式额度
                    </button>
                    <button
                      onClick={() => onOpenAllocateTrial(c.name)}
                      className="flex-1 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl font-bold text-xs cursor-pointer transition-colors text-center"
                    >
                      下发试用篇数
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: 委任/修改学院管理员 */}
      {assigningAdminCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">委任学院管理员</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{assigningAdminCollege.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setAssigningAdminCollege(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdmin} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">管理员姓名 *</label>
                <input
                  type="text"
                  required
                  value={adminForm.adminName}
                  onChange={(e) => setAdminForm({ ...adminForm, adminName: e.target.value })}
                  placeholder="例如：张主任"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">管理员登录账号 *</label>
                <input
                  type="text"
                  required
                  value={adminForm.adminAccount}
                  onChange={(e) => setAdminForm({ ...adminForm, adminAccount: e.target.value })}
                  placeholder="例如：whu_cs_admin"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block text-xs">管理员联系手机 *</label>
                <input
                  type="text"
                  required
                  value={adminForm.adminPhone}
                  onChange={(e) => setAdminForm({ ...adminForm, adminPhone: e.target.value })}
                  placeholder="例如：13800139901"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block text-xs">重置密码</label>
                  <button
                    type="button"
                    onClick={() => setAdminForm({ ...adminForm, adminPassword: '123456' })}
                    className="text-[11px] text-indigo-600 hover:underline font-bold"
                  >
                    一键重置为 123456
                  </button>
                </div>
                <input
                  type="text"
                  value={adminForm.adminPassword}
                  onChange={(e) => setAdminForm({ ...adminForm, adminPassword: e.target.value })}
                  placeholder="留空则保持当前密码不变"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAssigningAdminCollege(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  确认委任授权
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: 编辑学院信息 */}
      {editingCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">编辑二级学院信息</h3>
              <button onClick={() => setEditingCollege(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCollege} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">学院名称</label>
                <input
                  type="text"
                  required
                  value={editingCollege.name}
                  onChange={(e) => setEditingCollege({ ...editingCollege, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">学院英文代码</label>
                  <input
                    type="text"
                    required
                    value={editingCollege.code}
                    onChange={(e) => setEditingCollege({ ...editingCollege, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">所属学部</label>
                  <input
                    type="text"
                    value={editingCollege.category}
                    onChange={(e) => setEditingCollege({ ...editingCollege, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">简介说明</label>
                <textarea
                  rows={3}
                  value={editingCollege.description}
                  onChange={(e) => setEditingCollege({ ...editingCollege, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCollege(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold"
                >
                  保存修改
                </button>
              </div>
            </form>
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
