import { useState, useRef } from 'react';
import { Info, Upload, CheckCircle2, X } from 'lucide-react';
import TreeSelect, { TreeNode } from '../common/TreeSelect';

const FEEDBACK_CATEGORY_TREE: TreeNode[] = [
  {
    id: 'exp',
    label: '功能与体验',
    children: [
      { id: 'exp-suggestion', label: '功能建议 / 检测体验', description: '操作交互与界面建议' },
      { id: 'exp-batch', label: '批量上传与多文件支持', description: '大批量论文与格式支持' },
      { id: 'exp-ui', label: '页面视觉与移动端适配', description: '样式展示与自适应效果' },
    ],
  },
  {
    id: 'accuracy',
    label: '检测准确率',
    children: [
      { id: 'acc-report', label: '检测识别准确率反馈', description: '重复率及高亮标红偏差' },
      { id: 'acc-citation', label: '引用与参考文献误判', description: '标注被当做正文重复' },
      { id: 'acc-source', label: '对比数据库覆盖度', description: '学术期刊与学位论文收录' },
    ],
  },
  {
    id: 'billing',
    label: '费用与积分结算',
    children: [
      { id: 'bill-calc', label: '充值与积分结算问题', description: '扣点核算与扣减明细' },
      { id: 'bill-invoice', label: '发票开具与对公转账', description: '开票抬头与凭单反馈' },
    ],
  },
  {
    id: 'troubleshoot',
    label: '故障与报错',
    children: [
      { id: 'err-crash', label: '系统故障与异常报错', description: '页面卡顿或服务异常' },
      { id: 'err-download', label: '报告下载与预览失败', description: 'PDF/Word 导出无法下载' },
    ],
  },
  {
    id: 'cooperate',
    label: '合作咨询',
    children: [
      { id: 'coop-inst', label: '院校或机构定制咨询', description: '高校集中采购与专属接入' },
    ],
  },
];

export default function FeedbackView() {
  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(['exp-suggestion']);
  const [selectedCategoryLabels, setSelectedCategoryLabels] = useState<string[]>(['功能建议 / 检测体验']);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const newImgs = files.slice(0, 4 - screenshots.length).map((file) => URL.createObjectURL(file));
    setScreenshots((prev) => [...prev, ...newImgs].slice(0, 4));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitted(true);
    setTimeout(() => {
      setContent('');
      setContact('');
      setScreenshots([]);
      setSubmitted(false);
      alert('感谢您的反馈！我们已收到并将尽快跟进处理。');
    }, 1200);
  };

  return (
    <div id="feedback-view" className="space-y-8 w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto pb-16 font-sans">
      {/* 1. Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">意见反馈</h1>
        <p className="text-base text-slate-500 mt-1">说清问题，我们会更快处理。</p>
      </div>

      {/* 2. Alert Notice */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-5 flex items-start gap-4 shadow-2xs">
        <div className="w-8 h-8 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-4.5 h-4.5" />
        </div>
        <div className="text-sm text-slate-600 space-y-1">
          <p className="font-bold text-slate-800 text-base">遇到问题，或有建议，都可以反馈。</p>
          <p className="text-slate-500">支持 PNG/JPG/WEBP，最多 4 张，单张不超过 5MB。</p>
        </div>
      </div>

      {/* 3. Feedback Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 lg:p-10 space-y-8">
        {/* 反馈内容 */}
        <div className="space-y-2.5">
          <label className="block text-base font-bold text-slate-900">
            反馈内容 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 2000))}
              rows={6}
              placeholder="请说明你遇到的问题、期望效果，或复现步骤..."
              className="w-full p-5 rounded-2xl border border-slate-200 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
            />
            <div className="absolute right-4 bottom-4 text-xs sm:text-sm text-slate-400 font-mono">
              {content.length} / 2000
            </div>
          </div>
        </div>

        {/* 联系方式 & 反馈类型 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <label className="block text-base font-bold text-slate-900">
              联系方式 (选填)
            </label>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="邮箱、手机号或其他联系方式"
              className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-base font-bold text-slate-900">
                反馈类型
              </label>
              <span className="text-xs text-slate-400 font-medium">
                点击展开树状结构 · 支持多选
              </span>
            </div>
            <TreeSelect
              data={FEEDBACK_CATEGORY_TREE}
              value={selectedCategoryIds}
              onChange={(ids, labels) => {
                setSelectedCategoryIds(ids);
                setSelectedCategoryLabels(labels);
              }}
              placeholder="请在树状分类中勾选反馈类型（支持多选）"
            />
          </div>
        </div>

        {/* 上传截图 */}
        <div className="space-y-3">
          <label className="block text-base font-bold text-slate-900">
            上传截图 (选填，最多 4 张)
          </label>
          <div className="flex flex-wrap gap-4 items-center">
            {screenshots.map((src, index) => (
              <div key={index} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 group shadow-xs">
                <img src={src} alt="screenshot" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setScreenshots((prev) => prev.filter((_, i) => i !== index))}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {screenshots.length < 4 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-blue-600 transition-all cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <span className="text-xs font-semibold">添加截图</span>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={submitted || !content.trim()}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:opacity-50 text-white rounded-2xl text-base font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            {submitted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                正在提交...
              </>
            ) : (
              '提交反馈'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
