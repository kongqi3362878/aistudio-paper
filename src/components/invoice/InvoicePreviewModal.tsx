import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { InvoiceRecord } from '../../types';
import { amountToChinese } from '../../data/invoiceMockData';

interface InvoicePreviewModalProps {
  invoice: InvoiceRecord;
  onClose: () => void;
  onDownload?: (invoice: InvoiceRecord) => void;
}

export default function InvoicePreviewModal({
  invoice,
  onClose,
  onDownload,
}: InvoicePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const effectiveInvoiceNo = invoice.invoiceNo || '26112000000189283712';
  const effectiveInvoiceCode = invoice.invoiceCode || '011002300111';
  const effectiveDate = invoice.invoicedDate || invoice.applyTime.slice(0, 10);
  const isRed = false;

  const handleCopyNo = () => {
    navigator.clipboard.writeText(effectiveInvoiceNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTriggerDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      if (onDownload) {
        onDownload(invoice);
      } else {
        // Trigger simulated browser download of an invoice document
        const element = document.createElement('a');
        const fileContent = `国家统一电子发票凭证\n发票号码: ${effectiveInvoiceNo}\n开票日期: ${effectiveDate}\n购买方: ${invoice.title}\n税号: ${invoice.taxNumber || '个人'}\n金额: ¥${invoice.amount.toFixed(2)}\n税额: ¥${invoice.taxAmount.toFixed(2)}\n状态: ${invoice.status}`;
        const file = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = invoice.fileName || `电子发票_${invoice.title}_${invoice.amount}元.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 flex flex-col my-auto max-h-[95vh] overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
              isRed ? 'bg-rose-500' : 'bg-indigo-600'
            }`}>
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-base">
                  电子发票在线查验与凭证预览
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isRed ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {invoice.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                全国增值税发票查验平台认证格式 · 国家税务总局监制
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerDownload}
              disabled={isDownloading}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? '正在打包...' : '下载原件 (PDF)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body Canvas (1:1 Chinese VAT Electronic Invoice) */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100/70 flex justify-center">
          <div className="bg-[#FFFDF9] border-2 border-[#9F7A4A] rounded-xl p-6 sm:p-8 w-full max-w-[820px] shadow-sm relative text-[#6B4E26] font-serif select-text">
            
            {/* Header Titles */}
            <div className="relative text-center pb-5 mb-5 border-b border-[#9F7A4A]/30">
              <div className="text-[11px] font-sans text-slate-500 tracking-wider">国家税务总局全国统一发票监制</div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#8B5A2B] tracking-widest my-1">
                {invoice.invoiceType === '增值税专用发票' ? '电子发票（增值税专用发票）' : '电子发票（增值税普通发票）'}
              </h2>
              <div className="w-48 h-0.5 bg-[#9F7A4A] mx-auto mt-1 mb-0.5"></div>
              <div className="w-40 h-0.5 bg-[#9F7A4A] mx-auto"></div>

              {/* Top Right Invoice Metas */}
              <div className="sm:absolute sm:top-0 sm:right-0 text-left text-xs font-mono font-sans mt-3 sm:mt-0 space-y-1 text-slate-700">
                <div>发票代码：<span className="font-bold text-slate-900">{effectiveInvoiceCode}</span></div>
                <div className="flex items-center gap-1.5">
                  发票号码：<span className="font-bold text-slate-900">{effectiveInvoiceNo}</span>
                  <button 
                    onClick={handleCopyNo}
                    title="复制发票号码" 
                    className="p-0.5 hover:text-indigo-600 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  </button>
                </div>
                <div>开票日期：<span className="font-bold text-slate-900">{effectiveDate}</span></div>
                <div>校验号码：<span className="font-bold text-slate-600">89302 10928 39201 88472</span></div>
              </div>
            </div>

            {/* Buyer and Password Container */}
            <div className="border border-[#9F7A4A] rounded-md grid grid-cols-1 md:grid-cols-12 text-xs divide-y md:divide-y-0 md:divide-x divide-[#9F7A4A] mb-3">
              {/* Buyer Box (Col 1-8) */}
              <div className="md:col-span-8 p-3 space-y-1.5">
                <div className="font-bold text-[#8B5A2B] pb-1 border-b border-[#9F7A4A]/20 flex items-center justify-between">
                  <span>购 买 方 信 息</span>
                  <span className="text-[10px] text-slate-400 font-sans">（受票方）</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 shrink-0 text-slate-500">名　　称：</span>
                  <span className="font-bold text-slate-900">{invoice.title}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 shrink-0 text-slate-500">统一信用代码：</span>
                  <span className="font-mono font-bold text-slate-900">{invoice.taxNumber || '个人消费（免填纳税人识别号）'}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 shrink-0 text-slate-500">地址、电话：</span>
                  <span className="text-slate-800">{invoice.address || '-'} {invoice.phone ? `(${invoice.phone})` : ''}</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 shrink-0 text-slate-500">开户行及账号：</span>
                  <span className="font-mono text-slate-800">{invoice.bankName || '-'} {invoice.bankAccount || ''}</span>
                </div>
              </div>

              {/* Password Area (Col 9-12) */}
              <div className="md:col-span-4 p-3 space-y-1.5 bg-[#FAF6EE]/50">
                <div className="font-bold text-[#8B5A2B] pb-1 border-b border-[#9F7A4A]/20">密 码 区</div>
                <div className="font-mono text-[10px] leading-tight text-slate-600 break-all select-all font-sans p-1">
                  8+93&lt;02/10*9&gt;&gt;8+39201&lt;8847/2*+1092839281726354182938475610293847561029
                </div>
              </div>
            </div>

            {/* Goods and Tax Details Table */}
            <div className="border border-[#9F7A4A] rounded-md overflow-hidden text-xs mb-3">
              <table className="w-full text-center divide-y divide-[#9F7A4A]">
                <thead className="bg-[#FAF6EE] text-[#8B5A2B] font-bold">
                  <tr className="divide-x divide-[#9F7A4A]">
                    <th className="py-2 px-3 text-left">货物或应税劳务、服务名称</th>
                    <th className="py-2 px-2 w-16">规格型号</th>
                    <th className="py-2 px-2 w-12">单位</th>
                    <th className="py-2 px-2 w-12">数量</th>
                    <th className="py-2 px-2 w-20">单价</th>
                    <th className="py-2 px-3 w-24">金额</th>
                    <th className="py-2 px-2 w-14">税率</th>
                    <th className="py-2 px-3 w-24">税额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#9F7A4A]/30 text-slate-800 font-sans">
                  <tr className="divide-x divide-[#9F7A4A]">
                    <td className="py-3 px-3 text-left font-serif font-medium">
                      {invoice.goodsName}
                    </td>
                    <td className="py-3 px-2 text-slate-400">-</td>
                    <td className="py-3 px-2">次</td>
                    <td className="py-3 px-2 font-mono">1</td>
                    <td className="py-3 px-2 font-mono">{(invoice.amountWithoutTax).toFixed(2)}</td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {isRed ? `-${invoice.amountWithoutTax.toFixed(2)}` : invoice.amountWithoutTax.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 font-mono">{(invoice.taxRate * 100).toFixed(0)}%</td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {isRed ? `-${invoice.taxAmount.toFixed(2)}` : invoice.taxAmount.toFixed(2)}
                    </td>
                  </tr>
                  {/* Empty rows to match real invoice form */}
                  <tr className="divide-x divide-[#9F7A4A] text-transparent h-6">
                    <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
                  </tr>
                </tbody>
                {/* Total row */}
                <tfoot className="bg-[#FAF6EE]/70 font-bold border-t border-[#9F7A4A]">
                  <tr className="divide-x divide-[#9F7A4A]">
                    <td className="py-2 px-3 text-left text-[#8B5A2B]">合　　计</td>
                    <td colSpan={4}></td>
                    <td className="py-2 px-3 font-mono text-slate-900">
                      ¥{isRed ? `-${invoice.amountWithoutTax.toFixed(2)}` : invoice.amountWithoutTax.toFixed(2)}
                    </td>
                    <td></td>
                    <td className="py-2 px-3 font-mono text-slate-900">
                      ¥{isRed ? `-${invoice.taxAmount.toFixed(2)}` : invoice.taxAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Total In Chinese & Numeric */}
            <div className="border border-[#9F7A4A] rounded-md p-2.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 bg-[#FAF6EE]/40">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#8B5A2B] shrink-0">价税合计（大写）：</span>
                <span className="font-bold text-slate-900 tracking-wider">
                  {isRed ? '（负数）' : ''} {amountToChinese(invoice.amount)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#8B5A2B]">（小写）：</span>
                <span className="font-mono font-black text-sm text-slate-900">
                  ¥{isRed ? `-${invoice.amount.toFixed(2)}` : invoice.amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Seller & Remarks Container */}
            <div className="border border-[#9F7A4A] rounded-md grid grid-cols-1 md:grid-cols-12 text-xs divide-y md:divide-y-0 md:divide-x divide-[#9F7A4A] mb-4 relative">
              {/* Seller Box (Col 1-8) */}
              <div className="md:col-span-8 p-3 space-y-1.5 relative">
                <div className="font-bold text-[#8B5A2B] pb-1 border-b border-[#9F7A4A]/20 flex items-center justify-between">
                  <span>销 售 方 信 息</span>
                  <span className="text-[10px] text-slate-400 font-sans">（开票方）</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 shrink-0 text-slate-500">名　　称：</span>
                  <span className="font-bold text-slate-900">武汉论文智检信息技术有限公司</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 shrink-0 text-slate-500">统一信用代码：</span>
                  <span className="font-mono font-bold text-slate-900">91420100MA4KXYZ888</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 shrink-0 text-slate-500">地址、电话：</span>
                  <span className="text-slate-800">湖北省武汉市东湖新技术开发区光谷软件园F4栋 027-87654321</span>
                </div>
                <div className="flex items-start">
                  <span className="w-24 shrink-0 text-slate-500">开户行及账号：</span>
                  <span className="font-mono text-slate-800">招商银行武汉光谷科技支行 127908239019283</span>
                </div>

                {/* Simulated Red Official Electronic Invoice Seal */}
                <div className="absolute right-6 -bottom-1 pointer-events-none opacity-85 select-none rotate-[-6deg]">
                  <div className="w-28 h-28 rounded-full border-2 border-red-600 flex flex-col items-center justify-center text-red-600 p-1 bg-red-500/5 backdrop-blur-[0.5px]">
                    <div className="text-[9px] font-sans font-bold text-center leading-tight">武汉论文智检信息技术有限公司</div>
                    <div className="text-xs my-0.5">★</div>
                    <div className="text-[11px] font-sans font-black tracking-widest">发票专用章</div>
                    <div className="font-mono text-[7px] mt-0.5 tracking-tighter">91420100MA4KXYZ888</div>
                  </div>
                </div>
              </div>

              {/* Remarks Area (Col 9-12) */}
              <div className="md:col-span-4 p-3 space-y-1.5 bg-[#FAF6EE]/50">
                <div className="font-bold text-[#8B5A2B] pb-1 border-b border-[#9F7A4A]/20">备　　注</div>
                <div className="text-[11px] text-slate-600 font-sans leading-relaxed">
                  {invoice.remark || '充值服务费发票'}
                  {isRed && (
                    <div className="text-rose-600 font-bold mt-1">
                      对应蓝字发票代码：{invoice.invoiceCode || '011002300111'} 号码：{invoice.invoiceNo}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-400 mt-2">
                    关联订单：{invoice.orderNos.join(', ')}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Issuer Info */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 font-sans pt-1">
              <div>收款人：<strong className="text-slate-800 font-normal">周小琳</strong></div>
              <div>复核人：<strong className="text-slate-800 font-normal">李娜</strong></div>
              <div>开票人：<strong className="text-slate-800 font-normal">{invoice.auditor || '财务专用章 (机打)'}</strong></div>
              <div>销售方：（章）<strong className="text-slate-800 font-normal">已加盖电子公章</strong></div>
            </div>

          </div>
        </div>

        {/* Footer info & Actions */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>发票查验真伪可在全国增值税发票查验平台（inv-veri.chinatax.gov.cn）核验</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
