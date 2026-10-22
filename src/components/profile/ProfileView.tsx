import React, { useState } from 'react';
import { 
  Mail, 
  Building2, 
  Calendar, 
  Edit3, 
  BarChart3, 
  Receipt, 
  RotateCw, 
  ChevronRight, 
  X,
  Lock,
  Smartphone,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  Wallet,
  Shield,
  FileText,
  KeyRound,
  Check,
  ExternalLink,
  CreditCard,
  Sparkles,
  Info,
  Search,
  CheckCircle,
  School,
  Landmark,
  Building
} from 'lucide-react';
import { UserProfile, OrderRecord, PageKey } from '../../types';
import { initialInstitutions, InstitutionItem } from '../../data/adminMockData';

interface ProfileViewProps {
  user: UserProfile;
  orders: OrderRecord[];
  institutions?: InstitutionItem[];
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onNavigate: (page: PageKey) => void;
  onOpenRecharge: () => void;
}

export default function ProfileView({
  user,
  orders,
  institutions = initialInstitutions,
  onUpdateUser,
  onNavigate,
  onOpenRecharge,
}: ProfileViewProps) {
  // Modal display toggles (Account username and Phone are non-editable as required)
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isSelectingInstitution, setIsSelectingInstitution] = useState(false);

  // Institution Selection Form state
  const [selectedInstTemp, setSelectedInstTemp] = useState(user.institution || '');
  const [instSearchQuery, setInstSearchQuery] = useState('');
  const [instTypeFilter, setInstTypeFilter] = useState('全部');

  // Form states for Email
  const [newEmail, setNewEmail] = useState(user.email);

  // Password Form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Available institutions from backend
  const availableInstitutions = institutions && institutions.length > 0 ? institutions : initialInstitutions;

  // Filter institutions based on search and type
  const filteredInstitutions = availableInstitutions.filter((inst) => {
    if (instTypeFilter !== '全部' && inst.type !== instTypeFilter) return false;
    if (instSearchQuery.trim()) {
      const q = instSearchQuery.trim().toLowerCase();
      const matchName = inst.name.toLowerCase().includes(q);
      const matchContact = (inst.contact || '').toLowerCase().includes(q);
      const matchType = (inst.type || '').toLowerCase().includes(q);
      if (!matchName && !matchContact && !matchType) return false;
    }
    return true;
  });

  // Unique institution types for filter capsule tabs
  const institutionTypes = ['全部', '高校', '科研院所', '企业/机构'];

  // Handler: Confirm Selected Institution
  const handleConfirmSelectInstitution = () => {
    onUpdateUser({ institution: selectedInstTemp });
    setIsSelectingInstitution(false);
    showToast(selectedInstTemp ? `所在机构已成功变更为：${selectedInstTemp}` : '已清除所属机构绑定');
  };

  // Handler: Update Password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('新密码长度不能少于 6 位');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('两次输入的新密码不一致，请重新输入');
      return;
    }
    onUpdateUser({ password: newPassword });
    setIsEditingPassword(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('登录密码已成功更新！请妥善保管新密码');
  };

  // Handler: Update Email
  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newEmail.trim();
    if (!trimmed.includes('@')) {
      showToast('请输入有效的邮箱地址');
      return;
    }
    onUpdateUser({ email: trimmed });
    setIsEditingEmail(false);
    showToast(`安全邮箱已更新为：${trimmed}`);
  };

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '未输入', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 1, label: '较弱', color: 'bg-rose-500' };
    const hasNum = /\d/.test(pass);
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pass);
    if (hasNum && hasLetter && hasSpecial && pass.length >= 8) {
      return { score: 3, label: '极强', color: 'bg-emerald-500' };
    }
    if ((hasNum && hasLetter) || pass.length >= 8) {
      return { score: 2, label: '良好', color: 'bg-amber-500' };
    }
    return { score: 1, label: '较弱', color: 'bg-rose-500' };
  };

  const passStrength = getPasswordStrength(newPassword);

  return (
    <div id="profile-view" className="space-y-8 w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto pb-20 font-sans relative">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header */}
      <div className="pb-3 border-b border-slate-200/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">账户信息</h1>
      </div>

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: User Card & Security Score                  */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Identity Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-7 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3.5">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#4F46E5] to-[#7C3AED] text-white flex items-center justify-center font-black text-4xl shadow-md">
                  {user.avatarLetter || user.username[0] || 'A'}
                </div>
                {/* Verified Lock Badge (Account & Phone immutable) */}
                <div 
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 text-white shadow-md border-2 border-white flex items-center justify-center font-bold"
                  title="实名认证已锁定"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user.username}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                    {user.role}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {user.username === 'admin' ? 'READY-001' : 'READY-882'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Profile Summary */}
            <div className="space-y-3 pt-5 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-slate-400" /> 绑定手机
                </span>
                <span className="font-mono font-medium text-slate-800 flex items-center gap-1.5">
                  {user.phone || '138****8888'}
                  <Lock className="w-3 h-3 text-slate-400" />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" /> 安全邮箱
                </span>
                <span className="font-medium text-slate-800 truncate max-w-[170px]">{user.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" /> 所在机构
                </span>
                <span className="font-medium text-slate-800 truncate max-w-[170px]" title={user.institution}>
                  {user.institution || '未选择所在机构'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> 注册时间
                </span>
                <span className="text-slate-600">{user.joinDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Account Profile Settings                    */}
        {/* ======================================================== */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-7 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">账号资料与密码设置</h3>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              {/* 1. 登录账号 / 用户名 (不可修改) */}
              <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">登录账号 / 用户名</span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      不可修改
                    </span>
                  </div>
                  <p className="text-slate-900 mt-1 font-mono font-semibold text-sm">{user.username}</p>
                </div>
                <div className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100/80 text-slate-500 text-xs font-bold border border-slate-200/80 select-none">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>主账号固定</span>
                </div>
              </div>

              {/* 2. 登录密码 (修改密码) */}
              <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">登录密码</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      安全已保护
                    </span>
                  </div>
                  <p className="text-slate-400 mt-1 font-mono tracking-widest text-sm">••••••••••••</p>
                </div>
                <button
                  id="btn-edit-password"
                  onClick={() => {
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setIsEditingPassword(true);
                  }}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 font-bold transition-all cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs active:scale-95"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>修改密码</span>
                </button>
              </div>

              {/* 3. 绑定手机 (不可修改) */}
              <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">绑定手机号码</span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      不可修改
                    </span>
                  </div>
                  <p className="text-slate-900 mt-1 font-mono font-semibold text-sm">{user.phone || '13800138000'}</p>
                </div>
                <div className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100/80 text-slate-500 text-xs font-bold border border-slate-200/80 select-none">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>实名手机锁定</span>
                </div>
              </div>

              {/* 4. 安全邮箱 */}
              <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800 text-sm">安全邮箱地址</span>
                  <p className="text-slate-900 mt-1 font-mono text-sm">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setNewEmail(user.email);
                    setIsEditingEmail(true);
                  }}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl text-indigo-600 hover:text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 font-bold transition-all cursor-pointer text-xs"
                >
                  换绑邮箱
                </button>
              </div>

              {/* 5. 所在机构 (选择自管理后台机构库) */}
              <div className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">所在机构 / 大学 / 院所</span>
                    {user.institution ? (
                      <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                        已关联后台机构
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        未选择机构
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1.5">
                    <Building2 className="w-4.5 h-4.5 text-indigo-600 shrink-0" />
                    <span className="text-slate-900 font-bold text-sm">
                      {user.institution || <span className="text-slate-400 font-normal">暂未选择所属机构（请点击右侧选择）</span>}
                    </span>
                  </div>
                </div>

                <button
                  id="btn-select-institution"
                  onClick={() => {
                    setSelectedInstTemp(user.institution || '');
                    setInstSearchQuery('');
                    setInstTypeFilter('全部');
                    setIsSelectingInstitution(true);
                  }}
                  className="self-start sm:self-auto px-4.5 py-2.5 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 hover:shadow-md transition-all cursor-pointer text-xs flex items-center gap-2 active:scale-95"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{user.institution ? '切换所在机构' : '选择所在机构'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: 选择所在机构 Modal (数据来源自管理后台机构库)        */}
      {/* ======================================================== */}
      {isSelectingInstitution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">选择所在机构</h3>
                  <p className="text-xs text-slate-400">
                    数据实时来源自系统管理后台机构库（当前共 {availableInstitutions.length} 所机构）
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSelectingInstitution(false)} 
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input & Filters */}
            <div className="space-y-3">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={instSearchQuery}
                  onChange={(e) => setInstSearchQuery(e.target.value)}
                  placeholder="搜索机构名称、类型或对接人关键字（如：华中师范、计算所、工大...）"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
                {instSearchQuery && (
                  <button 
                    onClick={() => setInstSearchQuery('')}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    清空
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold text-slate-600">
                <span className="text-slate-400 text-[11px] shrink-0">机构分类：</span>
                {institutionTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setInstTypeFilter(type)}
                    className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      instTypeFilter === type
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Institutions List Cards */}
            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1 divide-y divide-slate-100">
              {/* Option to clear institution */}
              <div
                onClick={() => setSelectedInstTemp('')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedInstTemp === ''
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-2xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedInstTemp === '' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                  }`}>
                    {selectedInstTemp === '' && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-700">暂不关联任何机构（个人学者模式）</span>
                    <p className="text-[11px] text-slate-400">使用国家学术标准默认检测规则，不套用特定机构规则</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">通用</span>
              </div>

              {/* Filtered Institutions */}
              {filteredInstitutions.map((inst) => {
                const isSelected = selectedInstTemp === inst.name;
                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedInstTemp(inst.name)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-2xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                            {inst.name}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            inst.type === '高校'
                              ? 'bg-blue-50 text-blue-700 border-blue-200/60'
                              : inst.type === '科研院所'
                              ? 'bg-purple-50 text-purple-700 border-purple-200/60'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                          }`}>
                            {inst.type}
                          </span>
                          {inst.status === '正常' && (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                              已接入
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                          {inst.notes || '已配置该单位学术学位论文规范审查与内容风险审查专项细则'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-3">
                      <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">
                        专享规范
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredInstitutions.length === 0 && (
                <div className="py-10 text-center space-y-2">
                  <Building2 className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">未找到符合条件的机构</p>
                  <p className="text-[11px] text-slate-400">
                    可清空搜索词，或由平台管理员在【管理后台 - 机构管理】中添加该机构
                  </p>
                </div>
              )}
            </div>

            {/* Selection Status Preview Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">当前选择机构：</span>
              <span className="font-extrabold text-indigo-700 font-sans">
                {selectedInstTemp ? selectedInstTemp : '暂不关联机构（个人学者）'}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <span className="text-[11px] text-slate-400">
                可在管理后台随时新增、修改机构名单
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSelectingInstitution(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer text-xs"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSelectInstitution}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>确认选择并绑定</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: 修改登录密码 Modal                               */}
      {/* ======================================================== */}
      {isEditingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">修改登录密码</h3>
              </div>
              <button onClick={() => setIsEditingPassword(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">原密码</label>
                <div className="relative flex items-center border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-indigo-500">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="请输入当前密码（默认初始密码为 123456 或 admin）"
                    className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">新密码</label>
                  {newPassword && (
                    <span className="text-[11px] font-bold text-slate-500">
                      强度：<span className={passStrength.score >= 2 ? 'text-emerald-600' : 'text-rose-500'}>{passStrength.label}</span>
                    </span>
                  )}
                </div>
                <div className="relative flex items-center border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-indigo-500">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码（至少 6 位，建议包含字母与数字）"
                    className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Strength bar */}
                {newPassword && (
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1 mt-1">
                    <div className={`h-full flex-1 rounded-full ${passStrength.score >= 1 ? passStrength.color : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 rounded-full ${passStrength.score >= 2 ? passStrength.color : 'bg-slate-200'}`} />
                    <div className={`h-full flex-1 rounded-full ${passStrength.score >= 3 ? passStrength.color : 'bg-slate-200'}`} />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">确认新密码</label>
                <div className="relative flex items-center border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-indigo-500">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
                    className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingPassword(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  确认修改密码
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: 换绑安全邮箱 Modal                               */}
      {/* ======================================================== */}
      {isEditingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">换绑安全邮箱</h3>
              <button onClick={() => setIsEditingEmail(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmail} className="space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">新邮箱地址</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="例如：researcher@university.edu.cn"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  确认更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
