import React, { useState } from 'react';
import { Search, User, Mail, Smartphone, Building2, Image as ImageIcon, Calendar } from 'lucide-react';
import { initialUserFeedbacks, UserFeedbackItem } from '../../../data/adminMockData';

export default function UserFeedbackView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbacks, setFeedbacks] = useState<UserFeedbackItem[]>(initialUserFeedbacks);

  const filtered = feedbacks.filter((f) => {
    if (
      searchQuery &&
      !f.content.includes(searchQuery) &&
      !f.username.includes(searchQuery) &&
      !f.contact.includes(searchQuery)
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans">
      {/* 1. Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">反馈管理</h2>
        <p className="text-xs text-slate-400 mt-0.5">用户反馈列表</p>
      </div>

      {/* 2. Search Bar matching Screenshot 9 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索反馈内容/联系方式/用户名..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs cursor-pointer transition-all">
            搜索
          </button>
        </div>

        <div className="text-slate-400 font-mono text-xs">
          共 <strong className="text-slate-700 font-bold">{filtered.length}</strong> 条反馈
        </div>
      </div>

      {/* 3. Feedback Cards List matching Screenshot 9 */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-2xs space-y-4 hover:border-indigo-200 transition-all"
          >
            {/* Top Row: User & Role & Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.username}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      item.role === '教师'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {item.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.time}</span>
              </div>
            </div>

            {/* Feedback Content */}
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {item.content}
            </p>

            {/* Attachment preview if any (Screenshot 9) */}
            {item.hasAttachment && (
              <div className="pt-1">
                <div className="inline-flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100/60 text-indigo-600 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">反馈截图附件</span>
                    <span className="text-[10px] text-slate-400">大图预览 · PNG (1.2MB)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Contact Details */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-400">
              {item.contact && (
                <div className="flex items-center gap-1.5 font-mono">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.contact}</span>
                </div>
              )}
              {item.email && (
                <div className="flex items-center gap-1.5 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.email}</span>
                </div>
              )}
              {item.institution && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.institution}</span>
                </div>
              )}
              <div className="text-slate-400 ml-auto font-mono text-[11px]">
                来源: {item.source}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
