import { 
  LayoutDashboard, 
  Search, 
  ShieldAlert, 
  History, 
  MessageSquare, 
  Receipt, 
  User, 
  HelpCircle, 
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  School,
  ChevronLeft, 
  ChevronRight, 
  Globe
} from 'lucide-react';
import { PageKey } from '../../types';
import BrandLogo from './BrandLogo';

interface SidebarProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole?: string;
  institutionSection?: 'dashboard' | 'quota' | 'trial' | 'members' | 'colleges';
  onSelectInstitutionSection?: (section: 'dashboard' | 'quota' | 'trial' | 'members' | 'colleges') => void;
}

export default function Sidebar({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  userRole,
  institutionSection = 'dashboard',
  onSelectInstitutionSection,
}: SidebarProps) {
  const isInstitutionAdmin = userRole === '机构管理员' || userRole === '管理员';
  const isCollegeAdmin = userRole === '学院管理员';

  // Regular/Student user menu items (Student accounts do NOT have 校方试用)
  const studentMenuItems: { id: PageKey; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: '工作台', icon: LayoutDashboard },
    { id: 'detection', label: '规范检测', icon: Search },
    { id: 'riskDetection', label: '风险检测', icon: ShieldAlert },
    { id: 'history', label: '历史记录', icon: History },
    { id: 'feedback', label: '意见反馈', icon: MessageSquare },
    { id: 'orders', label: '费用中心', icon: Receipt },
    { id: 'profile', label: '个人中心', icon: User },
    ...(userRole === 'admin' || userRole === '平台管理员' ? [{ id: 'adminPlatform' as PageKey, label: '管理后台', icon: ShieldCheck }] : []),
    { id: 'help', label: '帮助中心', icon: HelpCircle },
  ];

  // 机构工作台菜单 (概览、学员管理、额度管理)
  const institutionMenuItems = [
    { id: 'dashboard' as const, label: '概览', icon: LayoutDashboard },
    { id: 'members' as const, label: '学员管理', icon: Users },
    { id: 'quota' as const, label: '额度管理', icon: CreditCard },
  ];

  // 学院工作台菜单 (概览、学员管理、额度管理)
  const collegeMenuItems = [
    { id: 'dashboard' as const, label: '概览', icon: LayoutDashboard },
    { id: 'members' as const, label: '学员管理', icon: Users },
    { id: 'quota' as const, label: '额度管理', icon: CreditCard },
  ];

  return (
    <aside 
      id="app-sidebar" 
      className={`bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 z-30 shrink-0 h-screen sticky top-0 shadow-xs ${
        collapsed ? 'w-22' : 'w-72'
      }`}
    >
      {/* Top Logo & Menu */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className={`h-22 flex items-center border-b border-slate-100 ${collapsed ? 'justify-center px-2' : 'px-7'}`}>
          <BrandLogo 
            collapsed={collapsed} 
            onClick={() => onNavigate('dashboard')} 
          />
        </div>

        {/* Navigation List */}
        <nav id="sidebar-nav" className="mt-5 px-3.5 space-y-1.5">
          {(isInstitutionAdmin || isCollegeAdmin) ? (
            (isCollegeAdmin ? collegeMenuItems : institutionMenuItems).map((item) => {
              const Icon = item.icon;
              const isActive = (currentPage === item.id) || (institutionSection === item.id);
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    if (onSelectInstitutionSection) {
                      onSelectInstitutionSection(item.id);
                    }
                    onNavigate(item.id);
                  }}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-base font-normal rounded-2xl transition-all text-left group cursor-pointer ${
                    isActive
                      ? 'bg-sky-50 text-sky-600 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 hover:translate-x-1'
                  }`}
                >
                  <Icon 
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`} 
                    strokeWidth={1.9}
                  />
                  {!collapsed && <span className="tracking-tight">{item.label}</span>}
                </button>
              );
            })
          ) : (
            studentMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = (currentPage === item.id) || (item.id === 'orders' && currentPage === 'invoice');
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-base font-normal rounded-2xl transition-all text-left group cursor-pointer ${
                    isActive
                      ? 'bg-blue-50/90 text-blue-600 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80 hover:translate-x-1'
                  }`}
                >
                  <Icon 
                    className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`} 
                    strokeWidth={1.9}
                  />
                  {!collapsed && <span className="tracking-tight">{item.label}</span>}
                </button>
              );
            })
          )}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-100 space-y-1.5">
        {/* Return to website link */}
        <button
          id="btn-return-to-landing"
          onClick={() => onNavigate('landing')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/60 rounded-xl transition-all cursor-pointer ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="返回官网首页"
        >
          <Globe className="w-4.5 h-4.5 text-slate-400 shrink-0" />
          {!collapsed && <span className="font-medium">返回官网首页</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          id="btn-collapse-sidebar"
          onClick={onToggleCollapse}
          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer ${
            collapsed ? 'justify-center px-0' : ''
          }`}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 text-slate-400" />
              <span>收起侧栏</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
