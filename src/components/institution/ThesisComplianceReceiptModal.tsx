import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  FileText, 
  QrCode, 
  Copy, 
  Check,
  Calendar,
  UserCheck
} from 'lucide-react';
import { PaperDetectionRecord, UserProfile } from '../../types';

interface ThesisComplianceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: PaperDetectionRecord | null;
  user: UserProfile;
}

export default function ThesisComplianceReceiptModal({
  isOpen,
  onClose,
  record,
  user
}: ThesisComplianceReceiptModalProps) {
  const [copied, setCopied] = React.useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const receiptNo = `WHU-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const paperTitle = record?.title || '0421人工智能赋能产业创新型城市建设的效应与机制研究';
  const authorName = user.name || user.username || '周宁';
  const studentNo = user.studentNo || '20242021001';
  const institution = user.institution || '武汉大学';
  const college = user.college || '计算机学院';
  const advisor = user.advisorName || '李教授';
  const degreeType = user.degreeType || '硕士研究生';
  const detectDate = record?.uploadTime || '2026-10-19 09:28';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(receiptNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Actions */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">校方学位论文规范性检测回执单</h3>
              <p className="text-xs text-slate-400">高校研究生院/学位评定委员会认证证明 · 官方防伪校验</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:border-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印回执单</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Body (Printable Area) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#F8FAFC]">
          <div 
            ref={printRef}
            className="bg-white border-2 border-indigo-900/20 rounded-2xl p-8 sm:p-12 shadow-md relative overflow-hidden space-y-8"
          >
            {/* Watermark background */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
              <Building2 className="w-[500px] h-[500px] text-indigo-950" />
            </div>

            {/* School Header */}
            <div className="text-center space-y-2 border-b-2 border-indigo-900/20 pb-6">
              <div className="inline-flex items-center gap-2 text-indigo-800 font-bold text-sm tracking-widest uppercase">
                <GraduationCap className="w-4 h-4" />
                <span>{institution} 研究生院 · 学位办公室</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                研究生学位论文规范性检测证明
              </h1>
              <p className="text-xs text-slate-400 font-mono tracking-wide">
                THESIS NORMATIVE COMPLIANCE VERIFICATION CERTIFICATE
              </p>
              
              <div className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-500 font-medium">
                <span>防伪编号：<strong className="text-slate-800 font-mono">{receiptNo}</strong></span>
                <span>•</span>
                <span>资助项目：校方统一下发试用专款</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 状态有效
                </span>
              </div>
            </div>

            {/* Student & Paper Info Grid */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/70 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 text-xs block">论文作者</span>
                <span className="font-bold text-slate-800 text-base">{authorName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">学号 / 工号</span>
                <span className="font-bold text-slate-800 font-mono text-base">{studentNo}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">所属院系</span>
                <span className="font-bold text-slate-800">{college}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">学位层次</span>
                <span className="font-semibold text-slate-700">{degreeType}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">指导教师</span>
                <span className="font-semibold text-slate-700">{advisor}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">检测完成时间</span>
                <span className="font-semibold text-slate-700">{detectDate}</span>
              </div>
              <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-200/60">
                <span className="text-slate-400 text-xs block">学位论文题名</span>
                <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                  《{paperTitle}》
                </span>
              </div>
            </div>

            {/* Detection Summary & Verdict */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  规范检测结果与评审结论
                </h4>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  格式审查合格 · 准予盲审送审
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                  <div className="text-xl sm:text-2xl font-black text-indigo-600">96.5</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">规范合规评分</div>
                </div>
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <div className="text-xl sm:text-2xl font-black text-emerald-600">0 处</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">错字存留(已修正)</div>
                </div>
                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                  <div className="text-xl sm:text-2xl font-black text-sky-600">100%</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">图表规范达标</div>
                </div>
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                  <div className="text-xl sm:text-2xl font-black text-purple-600">GB/T 7714</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">引文规范合规</div>
                </div>
              </div>
            </div>

            {/* Certification Footer with Official Stamp and QR */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end relative">
              <div className="space-y-3 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    <QrCode className="w-14 h-14 text-slate-800" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700">扫码查验真伪</p>
                    <p className="text-[11px] text-slate-400">本证明可用于学位申请与档案备查</p>
                    <button
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold text-[11px] cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? '防伪码已复制' : '复制防伪码'}</span>
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  提示：本证明由「论文智检」根据《{institution}研究生学位论文写作规范》自动核验出具，仅代表提交版本之技术性规范检测结论。
                </p>
              </div>

              {/* Red Stamp & Signature Simulation */}
              <div className="text-right space-y-1 relative pr-4">
                <p className="text-xs text-slate-400">核验机构：</p>
                <p className="text-sm font-bold text-slate-800">{institution} 学位评定委员会办公室</p>
                <p className="text-xs text-slate-500 font-mono">日期：2026 年 10 月 20 日</p>

                {/* Circular Red Seal */}
                <div className="absolute right-0 -top-8 w-28 h-28 rounded-full border-2 border-red-600/85 pointer-events-none flex flex-col items-center justify-center text-red-600 select-none rotate-[-12deg] shadow-2xs bg-red-50/20">
                  <div className="text-[9px] font-bold tracking-widest text-center px-1">
                    {institution}
                  </div>
                  <div className="text-xs font-black tracking-widest my-0.5">
                    ★
                  </div>
                  <div className="text-[9px] font-bold tracking-wider text-center">
                    学术规范审查章
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-400">
            支持下载为电子回执单或直接打印装订入学位论文自查袋
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>下载 / 保存回执单 (PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
