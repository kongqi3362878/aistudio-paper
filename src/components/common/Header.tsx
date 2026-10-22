import { useState, useRef, useEffect } from 'react';
import { Search, User, Receipt, Globe, LogOut, ShieldCheck, Building2 } from 'lucide-react';
import { PageKey, UserProfile } from '../../types';
import DocumentDownloadDropdown from './DocumentDownloadDropdown';

interface HeaderProps {
  user: UserProfile;
  onNavigate: (page: PageKey) => void;
  onSearch?: (query: string) => void;
}

export default function Header({ user, onNavigate, onSearch }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    onNavigate('history');
  };

  return (
    <header id="admin-header" className="h-22 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 sm:px-10 lg:px-14 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative w-full max-w-lg lg:max-w-xl">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="global-header-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索论文、历史记录..."
          className="w-full pl-12 pr-5 py-2.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-200/90 rounded-2xl text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-2xs"
        />
      </form>

      {/* User Area */}
      <div className="flex items-center gap-4">
        {/* Document Download Dropdown Button in Top Right */}
        <DocumentDownloadDropdown />

        <div className="relative" ref={dropdownRef}>
          <button
            id="user-profile-menu-button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-2 pr-3.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition-all cursor-pointer group"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4F46E5] to-[#8B5CF6] text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
              {user.avatarLetter || 'a'}
            </div>
            <div className="text-left hidden sm:block">
              {user.isInstitutionMember ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-bold text-slate-800 block leading-tight">{user.username}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {user.institution || '武汉大学'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {user.college || '计算机学院'} · {user.identity === '老师' ? '教师' : '学生'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base font-bold text-slate-800 block leading-tight">{user.username}</span>
                  <span className="text-xs text-slate-400">{user.role}</span>
                </>
              )}
            </div>
          </button>

          {/* User Dropdown */}
          {dropdownOpen && (
            <div 
              id="user-profile-dropdown"
              className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-5 py-2.5 border-b border-slate-100">
                <p className="font-bold text-slate-900 text-base">{user.username}</p>
                <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
              </div>

              {user.isInstitutionMember && (
                <div className="px-5 py-2.5 bg-indigo-50/50 border-b border-indigo-100/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">认证高校：</span>
                    <span className="font-bold text-indigo-900">{user.institution}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">院系身份：</span>
                    <span className="font-semibold text-slate-800">{user.college} · {user.identity === '老师' ? '教师' : '学生'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">校方试用：</span>
                    <span className="font-bold text-emerald-600">{user.institutionTrialPapers ?? 2} 篇 可用</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">学院额度：</span>
                    <span className="font-bold text-blue-600">{(user.allocatedQuota ?? 1200).toLocaleString()} 积分</span>
                  </div>
                </div>
              )}

              {user.role === '机构管理员' ? (
                <div className="py-1">
                  <div className="px-5 py-2 text-xs text-slate-500 font-medium">
                    当前身份：<span className="font-bold text-indigo-600">机构管理员</span>
                  </div>
                  <div className="px-5 py-1 text-xs text-slate-500 font-medium">
                    所属机构：<span className="font-bold text-slate-800">{user.institution || '武汉大学'}</span>
                  </div>
                </div>
              ) : (
                <div className="py-1">
                  <button
                    id="dropdown-profile"
                    onClick={() => {
                      onNavigate('profile');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-5 py-2.5 text-left text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                  >
                    <User className="w-4.5 h-4.5 text-slate-400" />
                    个人中心
                  </button>

                  {(user.role === 'admin' || user.role === '平台管理员') && (
                    <button
                      id="dropdown-admin"
                      onClick={() => {
                        onNavigate('adminPlatform');
                        setDropdownOpen(false);
                      }}
                      className="w-full px-5 py-2.5 text-left text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4.5 h-4.5 text-indigo-500" />
                      管理后台
                    </button>
                  )}

                  <button
                    id="dropdown-orders"
                    onClick={() => {
                      onNavigate('orders');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-5 py-2.5 text-left text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                  >
                    <Receipt className="w-4.5 h-4.5 text-slate-400" />
                    费用中心 (发票/充值)
                  </button>

                  <button
                    id="dropdown-landing"
                    onClick={() => {
                      onNavigate('landing');
                      setDropdownOpen(false);
                    }}
                    className="w-full px-5 py-2.5 text-left text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
                  >
                    <Globe className="w-4.5 h-4.5 text-slate-400" />
                    官网首页
                  </button>
                </div>
              )}

              <div className="my-1 border-t border-slate-100" />

              <button
                id="dropdown-logout"
                onClick={() => {
                  onNavigate('login');
                  setDropdownOpen(false);
                }}
                className="w-full px-5 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2.5 font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5 text-red-500" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
