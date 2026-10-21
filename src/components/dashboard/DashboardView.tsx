import { 
  Zap, 
  Upload, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight,
  Eye,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { PageKey, PaperDetectionRecord, UserProfile } from '../../types';

interface DashboardViewProps {
  user: UserProfile;
  records: PaperDetectionRecord[];
  onNavigate: (page: PageKey) => void;
  onOpenRecharge: () => void;
  onViewRecord: (record: PaperDetectionRecord) => void;
}

export default function DashboardView({
  user,
  records,
  onNavigate,
  onOpenRecharge,
  onViewRecord,
}: DashboardViewProps) {
  const recentRecords = records.slice(0, 5);
  const total = user.balance + user.usedBalance;
  const usedPercent = total > 0 ? ((user.usedBalance / total) * 100).toFixed(1) : '2.7';

  return (
    <div id="dashboard-view" className="space-y-8 w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto pb-16 font-sans">
      {/* 1. Greeting */}
      <div className="space-y-1.5">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          欢迎回来，{user.username}
        </h1>
        <p className="text-base text-slate-500">
          今天是 2026/09/22
        </p>
      </div>

      {/* 2. 积分余额 Card (Enlarged & Elevated) */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-9 shadow-sm hover:shadow-md transition-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs sm:text-sm font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              积分余额
            </div>
            <div className="text-lg sm:text-xl text-slate-700 font-medium">
              已用 <span className="font-bold text-slate-900">{user.usedBalance.toLocaleString()}</span> · 余额 <span className="text-2xl font-black text-blue-600">{user.balance.toLocaleString()}</span> 积分
            </div>
          </div>

          <button
            id="btn-recharge-credits"
            onClick={onOpenRecharge}
            className="self-start sm:self-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white px-7 py-3.5 rounded-2xl text-base font-bold shadow-md shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <Zap className="w-5 h-5 fill-current" />
            充值积分
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.max(3, Math.min(100, Number(usedPercent)))}%` }}
            />
          </div>
          <div className="flex justify-between text-xs sm:text-sm text-slate-400 font-medium">
            <span>额度消耗率 {usedPercent}%</span>
            <span>可用余额充裕</span>
          </div>
        </div>
      </div>

      {/* 3. 常用操作 */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">常用操作</h2>
          <p className="text-sm text-slate-400 mt-1">选择下一步要处理的论文工作</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: 开始规范检测 */}
          <button
            id="quick-action-new-detection"
            onClick={() => onNavigate('detection')}
            className="group p-7 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all text-left flex items-start gap-5 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                规范检测
              </h3>
              <p className="text-sm text-slate-400 mt-1">错别字、病句与格式审查</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all mt-1" />
          </button>

          {/* Card 2: 风险检测 (New) */}
          <button
            id="quick-action-risk-detection"
            onClick={() => onNavigate('riskDetection')}
            className="group p-7 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-xl hover:-translate-y-1 transition-all text-left flex items-start gap-5 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                内容风险检测
              </h3>
              <p className="text-sm text-slate-400 mt-1">敏感信息与合规安全检测</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all mt-1" />
          </button>

          {/* Card 3: 查看历史 */}
          <button
            id="quick-action-view-history"
            onClick={() => onNavigate('history')}
            className="group p-7 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all text-left flex items-start gap-5 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Clock className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                查看历史
              </h3>
              <p className="text-sm text-slate-400 mt-1">检测记录与报告</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all mt-1" />
          </button>

          {/* Card 4: 学习指南 */}
          <button
            id="quick-action-help-guide"
            onClick={() => onNavigate('help')}
            className="group p-7 rounded-3xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all text-left flex items-start gap-5 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-600 group-hover:text-white group-hover:bg-indigo-600 flex items-center justify-center shrink-0 transition-all">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                学习指南
              </h3>
              <p className="text-sm text-slate-400 mt-1">规范与使用流程</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all mt-1" />
          </button>
        </div>
      </div>

      {/* 4. 最近检测 Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">最近检测</h2>
          <button
            id="btn-view-all-history"
            onClick={() => onNavigate('history')}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm sm:text-base">
            <thead className="bg-slate-50/80 text-slate-500 text-xs sm:text-sm font-bold border-b border-slate-100">
              <tr>
                <th className="py-4 px-8">论文标题</th>
                <th className="py-4 px-8">检测时间</th>
                <th className="py-4 px-8">问题数</th>
                <th className="py-4 px-8">状态</th>
                <th className="py-4 px-8 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRecords.map((item) => (
                <tr 
                  key={item.id}
                  onClick={() => onViewRecord(item)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-5 px-8 font-semibold text-slate-900 max-w-lg truncate group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </td>
                  <td className="py-5 px-8 text-slate-500 text-sm font-mono">
                    {item.uploadTime.split(' ')[0]}
                  </td>
                  <td className="py-5 px-8 font-bold text-slate-900">
                    {item.issuesCount}
                  </td>
                  <td className="py-5 px-8">
                    <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      已完成
                    </span>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewRecord(item);
                      }}
                      className="px-3.5 py-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold cursor-pointer"
                      title="查看报告"
                    >
                      <Eye className="w-4 h-4" />
                      <span>查看</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
