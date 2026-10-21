import { useState } from 'react';
import {
  Sliders,
  Coins,
  Percent,
  Gift,
  FileText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  Check,
  Calculator,
  ShieldCheck,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { BillingPolicyConfig, RechargePackageConfig } from '../../../types';

interface PricingPolicyViewProps {
  policy: BillingPolicyConfig;
  onUpdatePolicy: (newPolicy: BillingPolicyConfig) => void;
}

export default function PricingPolicyView({ policy, onUpdatePolicy }: PricingPolicyViewProps) {
  // Local editable state
  const [formData, setFormData] = useState<BillingPolicyConfig>({ ...policy });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Simulator state
  const [simRechargeAmt, setSimRechargeAmt] = useState<number>(100);
  const [simDetectCost, setSimDetectCost] = useState<number>(1200);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSavePolicy = () => {
    onUpdatePolicy(formData);
    showToast('计费与定价策略配置已保存并全站生效！用户端充值、扣费拆分与退款算法已同步更新。');
  };

  const handleResetDefaults = () => {
    setFormData({
      baseCreditPerYuan: 100,
      bonusRatioText: '5:1',
      bonusRatioPercent: 20,
      costPerTenThousandWords: 1000,
      deductionRatioPaid: 5,
      deductionRatioBonus: 1,
      refundFormulaText: '可退款金额 =（剩下积分 - 赠送积分）÷ 100',
      noticeTerms: [
        '充值余额中未消耗且未开具发票的本金部分，支持申请全额退款（人民币最小退款金额 0.01 元）。',
        '系统赠送的积分不支持折现退款；已消耗金额及已开具发票的金额不支持退款。',
        '微信、支付宝支付超过 12 个月的订单，因支付渠道限制，不支持原路退款。',
        '计费可能存在延迟，页面展示的可退款金额为系统预估金额，最终退款金额以财务审核确认为准。',
        '退款申请审核通过后，款项一般会在 5-7 个工作日内按原支付路径退回。',
        '同一账号同一时间仅可存在一笔处理中的退款申请。退款成功后，该笔订单对应的所有剩余积分（含赠送）将全部作废清零。',
      ],
      packages: [
        {
          id: 1,
          amount: 50,
          bonusAmount: 10,
          paidCredits: 5000,
          bonusCredits: 1000,
          totalCredits: 6000,
          ratioText: '5:1',
          label: '单次轻量尝鲜',
          bonusTag: '赠1000积分 (20%)',
          popular: false,
          enabled: true,
        },
        {
          id: 2,
          amount: 100,
          bonusAmount: 20,
          paidCredits: 10000,
          bonusCredits: 2000,
          totalCredits: 12000,
          ratioText: '5:1',
          label: '标准毕业答辩',
          bonusTag: '赠2000积分 · 官方力荐',
          popular: true,
          enabled: true,
        },
        {
          id: 3,
          amount: 200,
          bonusAmount: 40,
          paidCredits: 20000,
          bonusCredits: 4000,
          totalCredits: 24000,
          ratioText: '5:1',
          label: '本硕学期畅享',
          bonusTag: '赠4000积分 · 性价比首选',
          popular: false,
          enabled: true,
        },
        {
          id: 4,
          amount: 500,
          bonusAmount: 100,
          paidCredits: 50000,
          bonusCredits: 10000,
          totalCredits: 60000,
          ratioText: '5:1',
          label: '硕博高频全检',
          bonusTag: '赠10000积分 · 团队共享',
          popular: false,
          enabled: true,
        },
      ],
    });
    showToast('已恢复为平台出厂标准策略配置（5:1赠送与扣费比例）');
  };

  // Package management
  const handleTogglePackage = (pkgId: number) => {
    setFormData(prev => ({
      ...prev,
      packages: prev.packages.map(p => p.id === pkgId ? { ...p, enabled: !p.enabled } : p)
    }));
  };

  const handleDeletePackage = (pkgId: number) => {
    if (formData.packages.length <= 1) {
      showToast('至少保留一个有效的充值档位');
      return;
    }
    setFormData(prev => ({
      ...prev,
      packages: prev.packages.filter(p => p.id !== pkgId)
    }));
    showToast('充值档位已移除');
  };

  const handleAddPackage = () => {
    const nextAmount = (formData.packages[formData.packages.length - 1]?.amount || 500) + 100;
    const bonus = Math.round(nextAmount * (formData.bonusRatioPercent / 100));
    const paid = nextAmount * formData.baseCreditPerYuan;
    const bonusCreds = bonus * formData.baseCreditPerYuan;

    const newPkg: RechargePackageConfig = {
      id: Date.now(),
      amount: nextAmount,
      bonusAmount: bonus,
      paidCredits: paid,
      bonusCredits: bonusCreds,
      totalCredits: paid + bonusCreds,
      ratioText: formData.bonusRatioText,
      label: '自定义专享档位',
      bonusTag: `赠${bonusCreds}积分`,
      popular: false,
      enabled: true,
    };

    setFormData(prev => ({
      ...prev,
      packages: [...prev.packages, newPkg]
    }));
    showToast(`已新增 ¥${nextAmount} 充值规格`);
  };

  // Simulator calculations
  const simPaidArrival = simRechargeAmt * formData.baseCreditPerYuan;
  const simBonusArrival = Math.round(simRechargeAmt * (formData.bonusRatioPercent / 100) * formData.baseCreditPerYuan);
  const simTotalArrival = simPaidArrival + simBonusArrival;

  const simRatioTotal = formData.deductionRatioPaid + formData.deductionRatioBonus;
  const simDeductPaid = Math.round(simDetectCost * (formData.deductionRatioPaid / simRatioTotal));
  const simDeductBonus = simDetectCost - simDeductPaid;

  const simInvoiceableAmt = (simDeductPaid / formData.baseCreditPerYuan).toFixed(2);

  const simRemainTotal = Math.max(0, simTotalArrival - simDetectCost);
  const simRemainPaid = Math.max(0, simPaidArrival - simDeductPaid);
  const simRemainBonus = Math.max(0, simBonusArrival - simDeductBonus);
  const simRefundAmt = (simRemainPaid / formData.baseCreditPerYuan).toFixed(2);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 font-sans pb-16">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in text-sm font-medium">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner with Action Buttons */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-extrabold border border-blue-100">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>核心财务机制 · 充值与计费策略引擎</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            充值比例、消费扣费拆分与退款开票策略
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
            配置全平台用户充值赠送比例（默认5:1）、积分折算率、检测扣费内部拆分逻辑、发票可开额度核算原则及全额退款清零机制。
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            恢复默认策略
          </button>
          <button
            onClick={handleSavePolicy}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>保存并全站生效</span>
          </button>
        </div>
      </div>

      {/* Key Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>基础充值比例</span>
            <Coins className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            1 元 = {formData.baseCreditPerYuan} 付费积分
          </div>
          <div className="text-xs text-slate-500">本金计费与发票核算基准汇率</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>充值赠送比例模式</span>
            <Gift className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">
            {formData.bonusRatioText} (赠送 {formData.bonusRatioPercent}%)
          </div>
          <div className="text-xs text-slate-500">充 100 元赠送 20 元（到账 12,000 积分）</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>扣费拆分机制</span>
            <Percent className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600 font-mono">
            {formData.deductionRatioPaid} : {formData.deductionRatioBonus}
          </div>
          <div className="text-xs text-slate-500">每消耗 1200 分 = 扣 1000 付费 + 200 赠送</div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>检测定价标准</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {formData.costPerTenThousandWords} 积分 / 万字
          </div>
          <div className="text-xs text-slate-500">折合 10 元/万字，按字数等比核减</div>
        </div>
      </div>

      {/* 2. Parameters Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Core Rates & Ratio Settings */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">核心比例与计算公式配置</h3>
              <p className="text-xs text-slate-400">控制全站各充值档位与扣除流程的算法系数</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. Base credit ratio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>基础充值比例（1元折算付费积分数）</span>
                <span className="text-blue-600 font-mono font-bold">1 元 = {formData.baseCreditPerYuan} 积分</span>
              </label>
              <input
                type="number"
                min={10}
                max={1000}
                step={10}
                value={formData.baseCreditPerYuan}
                onChange={(e) => {
                  const val = Number(e.target.value) || 100;
                  setFormData(prev => ({
                    ...prev,
                    baseCreditPerYuan: val,
                    packages: prev.packages.map(p => {
                      const paid = p.amount * val;
                      const bonus = Math.round(p.amount * (prev.bonusRatioPercent / 100) * val);
                      return {
                        ...p,
                        paidCredits: paid,
                        bonusCredits: bonus,
                        totalCredits: paid + bonus,
                      };
                    })
                  }));
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 2. Bonus Gift Ratio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>充值赠送比例模式（固定赠送比例）</span>
                <span className="text-emerald-600 font-mono font-bold">{formData.bonusRatioText} (比例 {formData.bonusRatioPercent}%)</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { text: '5:1 (赠20%)', percent: 20 },
                  { text: '4:1 (赠25%)', percent: 25 },
                  { text: '10:1 (赠10%)', percent: 10 },
                  { text: '不赠送 (0%)', percent: 0 },
                ].map(item => (
                  <button
                    key={item.text}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        bonusRatioText: item.text.split(' ')[0],
                        bonusRatioPercent: item.percent,
                        packages: prev.packages.map(p => {
                          const paid = p.amount * prev.baseCreditPerYuan;
                          const bonusAmt = Math.round(p.amount * (item.percent / 100));
                          const bonus = bonusAmt * prev.baseCreditPerYuan;
                          return {
                            ...p,
                            bonusAmount: bonusAmt,
                            bonusCredits: bonus,
                            totalCredits: paid + bonus,
                            ratioText: item.text.split(' ')[0],
                            bonusTag: item.percent > 0 ? `赠${bonus}积分 (${item.percent}%)` : '无赠送',
                          };
                        })
                      }));
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                      formData.bonusRatioPercent === item.percent
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Cost per 10k words */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>论文检测计费定价（每万有效字所需积分）</span>
                <span className="text-amber-600 font-mono font-bold">{formData.costPerTenThousandWords} 积分 / 万字</span>
              </label>
              <input
                type="number"
                min={100}
                max={5000}
                step={100}
                value={formData.costPerTenThousandWords}
                onChange={(e) => setFormData(prev => ({ ...prev, costPerTenThousandWords: Number(e.target.value) || 1000 }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 4. Deduction Split Ratio */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">扣费拆分权重-付费本金</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={formData.deductionRatioPaid}
                  onChange={(e) => setFormData(prev => ({ ...prev, deductionRatioPaid: Number(e.target.value) || 5 }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">扣费拆分权重-赠送积分</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={formData.deductionRatioBonus}
                  onChange={(e) => setFormData(prev => ({ ...prev, deductionRatioBonus: Number(e.target.value) || 1 }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Formula Preview Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span>退款金额结算公式（固化）</span>
              </div>
              <div className="font-mono bg-white p-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold">
                {formData.refundFormulaText}
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                依据规定：用户申请退款时，系统自动扣除全部赠送积分份额，仅对未消耗的本金付费积分按 1元=100分 结算退款；赠送积分自动清零作废。
              </p>
            </div>
          </div>
        </div>

        {/* Right: Interactive Lifecycle Simulator */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">“充值-消费-开票-退款”全流程实时演算模拟</h3>
              <p className="text-xs text-slate-400">实时代入当前参数验证拆分与核算准确性</p>
            </div>
          </div>

          <div className="space-y-5 text-xs">
            {/* Step 1: Recharge */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
              <div className="flex items-center justify-between font-bold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white inline-flex items-center justify-center text-[10px]">1</span>
                  用户充值模拟
                </span>
                <span className="font-mono text-xs">充值金额：¥{simRechargeAmt}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={50}
                  max={1000}
                  step={50}
                  value={simRechargeAmt}
                  onChange={(e) => setSimRechargeAmt(Number(e.target.value))}
                  className="flex-1 accent-blue-600"
                />
                <span className="font-mono font-bold text-slate-900 w-16 text-right">¥{simRechargeAmt}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-200/80 font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">实际到账总额：</span>
                  <span className="font-bold text-slate-900">{simTotalArrival.toLocaleString()} 积分</span>
                </div>
                <div className="flex justify-between text-[11px] text-blue-700">
                  <span>- 付费本金积分：</span>
                  <span>{simPaidArrival.toLocaleString()} 分（折合 ¥{simRechargeAmt}）</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700">
                  <span>- 赠送积分 (5:1)：</span>
                  <span>{simBonusArrival.toLocaleString()} 分（折合 ¥{(simBonusArrival / 100).toFixed(2)}）</span>
                </div>
              </div>
            </div>

            {/* Step 2: Consumption */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-600 text-white inline-flex items-center justify-center text-[10px]">2</span>
                  用户检测扣费拆分 (5:1)
                </span>
                <span className="font-mono text-xs">扣除：{simDetectCost} 积分</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={600}
                  max={6000}
                  step={600}
                  value={simDetectCost}
                  onChange={(e) => setSimDetectCost(Number(e.target.value))}
                  className="flex-1 accent-amber-600"
                />
                <span className="font-mono font-bold text-slate-900 w-16 text-right">{simDetectCost} 分</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-200/80 font-mono space-y-1">
                <div className="flex justify-between text-blue-800">
                  <span>（1）扣除付费积分：</span>
                  <span className="font-bold">{simDeductPaid.toLocaleString()} 分（价值 ¥{(simDeductPaid / 100).toFixed(2)}）</span>
                </div>
                <div className="flex justify-between text-emerald-800">
                  <span>（2）扣除赠送积分：</span>
                  <span className="font-bold">{simDeductBonus.toLocaleString()} 分（价值 ¥{(simDeductBonus / 100).toFixed(2)}）</span>
                </div>
              </div>
            </div>

            {/* Step 3: Invoicing */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-indigo-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white inline-flex items-center justify-center text-[10px]">3</span>
                  该笔检测可开票金额
                </span>
                <span className="font-mono font-black text-amber-600 text-sm">¥{simInvoiceableAmt}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-indigo-200/80 text-[11px] text-slate-600 leading-relaxed">
                <strong>页面提示提示语：</strong>“您的账户包含赠送积分，系统已为您按比例自动抵扣。仅按实际消耗的付费金额开具发票。”
              </div>
            </div>

            {/* Step 4: Refund */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-2">
              <div className="flex items-center justify-between font-bold text-rose-900">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-rose-600 text-white inline-flex items-center justify-center text-[10px]">4</span>
                  剩余积分退款核算
                </span>
                <span className="font-mono font-black text-rose-700 text-sm">退款金额：¥{simRefundAmt}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-rose-200/80 font-mono text-[11px] space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>剩余总积分：</span>
                  <span>{simRemainTotal.toLocaleString()} 分（付费 {simRemainPaid.toLocaleString()} + 赠送 {simRemainBonus.toLocaleString()}）</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold border-t border-slate-100 pt-1">
                  <span>计算公式代入：</span>
                  <span>({simRemainTotal.toLocaleString()} - {simRemainBonus.toLocaleString()}) ÷ 100 = ¥{simRefundAmt}</span>
                </div>
                <div className="text-[10px] text-slate-400 pt-0.5">
                  注：退款成功后，剩余 {simRemainBonus.toLocaleString()} 赠送积分全部清零作废。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recharge Packages Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900">用户端充值规格档位列表</h3>
            <p className="text-xs text-slate-400">展示于“积分充值”弹窗与“费用中心”界面的预设充值选项</p>
          </div>
          <button
            onClick={handleAddPackage}
            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>新增充值规格</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">充值实付</th>
                <th className="py-3 px-4">赠送额度</th>
                <th className="py-3 px-4">付费本金积分</th>
                <th className="py-3 px-4">系统赠送积分</th>
                <th className="py-3 px-4">实得总积分</th>
                <th className="py-3 px-4">赠送比例</th>
                <th className="py-3 px-4">推荐标签</th>
                <th className="py-3 px-4 text-center">启用状态</th>
                <th className="py-3 px-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {formData.packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-4 font-mono font-black text-slate-900 text-base">
                    ¥{pkg.amount.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-600">
                    +¥{pkg.bonusAmount.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-700">
                    {pkg.paidCredits.toLocaleString()} 分
                  </td>
                  <td className="py-4 px-4 font-mono text-emerald-600 font-bold">
                    +{pkg.bonusCredits.toLocaleString()} 分
                  </td>
                  <td className="py-4 px-4 font-mono font-black text-blue-600 text-base">
                    {pkg.totalCredits.toLocaleString()} 分
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
                      {pkg.ratioText}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-medium">
                    {pkg.label}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleTogglePackage(pkg.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                        pkg.enabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {pkg.enabled ? '已启用' : '已停用'}
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="删除此规格"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Terms and Compliance (6 Rules) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">《用户充值与退款须知》（前台统一呈现标准）</h3>
            <p className="text-xs text-slate-400">展示于充值弹窗、费用中心充值页面及退款确认界面</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {formData.noticeTerms.map((term, index) => (
            <div key={index} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold shrink-0 flex items-center justify-center text-[10px]">
                {index + 1}
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">{term}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
