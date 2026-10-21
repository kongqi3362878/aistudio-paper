import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { faqList } from '../../data/mockData';

export default function HelpView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div id="help-view" className="space-y-8 w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto pb-16 font-sans">
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">常见问题</h1>
        <p className="text-base text-slate-500 mt-1">常见规范检测使用与计费问题答疑</p>
      </div>

      {/* 2. FAQ List */}
      <div className="space-y-4">
        {faqList.map((faq) => {
          const isOpen = expandedId === faq.id || expandedId === null; // Keep open or expandable

          return (
            <div
              key={faq.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 hover:shadow-md transition-all"
            >
              <button
                onClick={() => toggleExpand(faq.id)}
                className="w-full flex items-center justify-between gap-5 text-left group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="mt-4 pt-4 border-t border-slate-100 pl-13 text-sm sm:text-base text-slate-600 leading-relaxed animate-in fade-in duration-150">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Helper Note */}
      <div className="bg-slate-50/80 rounded-3xl p-8 border border-slate-200/80 text-center space-y-2">
        <p className="text-base sm:text-lg font-bold text-slate-800">没有找到您要的答案？</p>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          您可以前往意见反馈页面向我们提出建议或疑问，技术支持团队将在 24 小时内跟进答复。
        </p>
      </div>
    </div>
  );
}
