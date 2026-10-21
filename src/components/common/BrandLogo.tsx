interface BrandLogoProps {
  onClick?: () => void;
  collapsed?: boolean;
  className?: string;
  theme?: 'light' | 'dark';
}

export default function BrandLogo({ onClick, collapsed = false, className = '' }: BrandLogoProps) {
  return (
    <div 
      id="brand-logo-container"
      onClick={onClick} 
      className={`flex items-center gap-2.5 cursor-pointer select-none ${className}`}
    >
      {/* Icon */}
      <div 
        id="brand-logo-icon"
        className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5856D6] to-[#7B79FF] flex items-center justify-center shadow-sm text-white shrink-0"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <polyline points="9 15 11 17 15 13" />
        </svg>
      </div>

      {/* Brand Text */}
      {!collapsed && (
        <div id="brand-logo-text-block" className="flex flex-col">
          <div className="flex items-center gap-1 leading-tight">
            <span className="text-xl font-bold tracking-tight text-slate-900">论文</span>
            <span className="text-xl font-bold tracking-tight text-[#4F46E5]">智检</span>
          </div>
          <span className="text-[11px] font-medium text-slate-400 tracking-wider -mt-0.5">
            readypaper.cn
          </span>
        </div>
      )}
    </div>
  );
}
