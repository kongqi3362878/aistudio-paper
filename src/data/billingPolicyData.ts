import { BillingPolicyConfig } from '../types';

export const initialBillingPolicy: BillingPolicyConfig = {
  baseCreditPerYuan: 100, // 1元 = 100 付费积分
  bonusRatioText: '5:1',
  bonusRatioPercent: 20, // 赠送20%（充100元送20元）
  costPerTenThousandWords: 1000, // 默认 1000 积分 / 万有效字
  deductionRatioPaid: 5, // 扣费拆分：5份付费积分
  deductionRatioBonus: 1, // 扣费拆分：1份赠送积分
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
};
