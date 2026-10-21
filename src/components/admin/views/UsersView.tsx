import React, { useState } from 'react';
import { Search, Edit2, X, CheckCircle2, Building2 } from 'lucide-react';
import { initialAdminUsers, AdminUserItem, initialInstitutions, InstitutionItem } from '../../../data/adminMockData';

interface UsersViewProps {
  institutions?: InstitutionItem[];
}

export default function UsersView({ institutions: propInstitutions }: UsersViewProps = {}) {
  const availableInstitutions = propInstitutions && propInstitutions.length > 0 ? propInstitutions : initialInstitutions;

  const [users, setUsers] = useState<AdminUserItem[]>(initialAdminUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('全部状态');
  const [institutionFilter, setInstitutionFilter] = useState('全部机构');
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);

  // Form for Editing User (Screenshot 8 + 关联机构)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    institution: '',
    role: '教师' as '教师' | '学生' | '管理员',
    status: '正常' as '正常' | '禁用',
    totalCredits: 0,
    usedCredits: 0,
  });

  const openEditModal = (u: AdminUserItem) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      phone: u.phone,
      institution: u.institution || '',
      role: u.role,
      status: u.status,
      totalCredits: u.totalCredits,
      usedCredits: u.usedCredits,
    });
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUsers((prev) =>
      prev.map((item) =>
        item.id === editingUser.id
          ? {
              ...item,
              name: editForm.name,
              phone: editForm.phone,
              institution: editForm.institution,
              role: editForm.role,
              status: editForm.status,
              totalCredits: editForm.totalCredits,
              usedCredits: editForm.usedCredits,
            }
          : item
      )
    );
    setEditingUser(null);
  };

  const filtered = users.filter((u) => {
    if (statusFilter !== '全部状态' && u.status !== statusFilter) return false;
    if (institutionFilter !== '全部机构' && u.institution !== institutionFilter) return false;
    if (
      searchQuery &&
      !u.username.includes(searchQuery) &&
      !u.name.includes(searchQuery) &&
      !u.phone.includes(searchQuery) &&
      !u.institution.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* 1. Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">用户管理</h2>
        <p className="text-xs text-slate-400 mt-0.5">全站用户列表与额度维护</p>
      </div>

      {/* 2. Search Bar matching Screenshot 8 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索账号/姓名/手机号..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700"
          >
            <option>全部状态</option>
            <option>正常</option>
            <option>禁用</option>
          </select>

          <select
            value={institutionFilter}
            onChange={(e) => setInstitutionFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium text-slate-700 max-w-[160px] truncate"
          >
            <option>全部机构</option>
            {availableInstitutions.map((inst) => (
              <option key={inst.id} value={inst.name}>
                {inst.name}
              </option>
            ))}
          </select>

          <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all">
            搜索
          </button>
        </div>

        <div className="text-slate-400 font-mono text-xs">
          共 <strong className="text-slate-700 font-bold">146</strong> 人
        </div>
      </div>

      {/* 3. Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">账号</th>
                <th className="py-3 px-5">姓名</th>
                <th className="py-3 px-5">机构</th>
                <th className="py-3 px-5">角色</th>
                <th className="py-3 px-5">状态</th>
                <th className="py-3 px-5">额度</th>
                <th className="py-3 px-5 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-bold font-mono text-slate-800">
                    {u.username}
                  </td>
                  <td className="py-3.5 px-5 text-slate-700 font-medium">
                    {u.name}
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 max-w-[160px] truncate" title={u.institution}>
                    {u.institution}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    {u.role}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono">
                    <span className="font-bold text-indigo-600">{u.usedCredits.toLocaleString()}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-slate-800">{u.totalCredits.toLocaleString()}</span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => openEditModal(u)}
                      className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold inline-flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>编辑</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>第 1 / 15 页，共 146 条</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">
              上一页
            </button>
            <button className="px-3 py-1.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-medium">
              下一页
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: 编辑用户 (1:1 with Screenshot 8)                  */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-bold text-slate-900">编辑用户</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {editingUser.username} · 调整额度与资料
                </p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">姓名</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">手机号</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
              </div>

              {/* 所在机构 (联动「机构管理」名录) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>所在机构</span>
                  </label>
                  <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    联动「机构管理」名录 · 共 {availableInstitutions.length} 所
                  </span>
                </div>
                <select
                  value={editForm.institution}
                  onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white font-medium text-slate-800"
                >
                  <option value="">-- 未分配机构（个人用户） --</option>
                  {availableInstitutions.map((inst) => (
                    <option key={inst.id} value={inst.name}>
                      {inst.name} ({inst.type} · 状态:{inst.status})
                    </option>
                  ))}
                  {editForm.institution && !availableInstitutions.some((i) => i.name === editForm.institution) && (
                    <option value={editForm.institution}>
                      {editForm.institution} (现有自定义)
                    </option>
                  )}
                </select>
                <p className="text-[11px] text-slate-400">
                  用户的所属机构将直接决定其论文检测时自动套用的学位规范审查与格式标准
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">角色</label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option>教师</option>
                    <option>学生</option>
                    <option>管理员</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">状态</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                  >
                    <option>正常</option>
                    <option>禁用</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">总额度</label>
                  <input
                    type="number"
                    value={editForm.totalCredits}
                    onChange={(e) => setEditForm({ ...editForm, totalCredits: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">已用额度</label>
                  <input
                    type="number"
                    value={editForm.usedCredits}
                    onChange={(e) => setEditForm({ ...editForm, usedCredits: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono font-bold"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                额度单位为「积分」(1元 = 100 积分)；分配请使用整数。
              </p>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
