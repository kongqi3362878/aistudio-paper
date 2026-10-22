export type PageKey = 
  | 'landing'
  | 'login'
  | 'dashboard'
  | 'overview'
  | 'detection'
  | 'riskDetection'
  | 'history'
  | 'feedback'
  | 'orders'
  | 'invoice'
  | 'profile'
  | 'help'
  | 'quota'
  | 'trial'
  | 'members'
  | 'colleges'
  | 'adminPlatform'
  | 'institutionPortal'
  | 'collegePortal'
  | 'terms'
  | 'privacy';

export type AdminSubPageKey = 
  | 'overview'
  | 'devops'
  | 'costs'
  | 'queue'
  | 'papers'
  | 'detectionFeedback'
  | 'institutions'
  | 'universityTrial'
  | 'users'
  | 'feedback'
  | 'transactions'
  | 'orders'
  | 'pricingPolicy'
  | 'invoices'
  | 'refunds';

export type DetectionTab = 'single' | 'batch';
export type HistoryTab = 'all' | 'batch';
export type HistoryType = 'paper' | 'risk';

export interface UserProfile {
  username: string;
  name?: string;
  email: string;
  role: string; // '普通用户' | '机构学生' | '机构教师' | '机构管理员' | '学院管理员' | '平台管理员'
  institution: string; // 如 '武汉大学'
  college?: string; // 如 '计算机学院'
  identity?: '学生' | '老师'; // 机构内具体身份
  studentNo?: string; // 学号 / 工号 (如 20242021001 / T20190802)
  advisorName?: string; // 指导教师姓名 (学生账号)
  title?: string; // 教师职称 (如 副教授 / 硕士生导师)
  degreeType?: string; // 学位层次 (如 硕士研究生 / 博士生 / 本科生)
  avatarLetter: string;
  joinDate: string;
  balance: number; // 总剩余积分 = paidCredits + bonusCredits (个人积分)
  paidCredits?: number; // 付费本金积分（可退款/开票基数）
  bonusCredits?: number; // 系统赠送积分（不折现、不开发票）
  usedBalance: number; // 累计消耗总积分
  usedPaidCredits?: number; // 累计消耗付费积分
  usedBonusCredits?: number; // 累计消耗赠送积分
  phone?: string;
  password?: string;
  // 机构师生专属权益属性
  isInstitutionMember?: boolean; // 是否为高校/科研机构认证下的学生或老师
  institutionTrialPapers?: number; // 校方免费试用可用篇数 (如 2 篇)
  usedInstitutionTrialPapers?: number; // 校方试用已用篇数 (如 1 篇)
  allocatedQuota?: number; // 学院划拨专款额度积分 (如 1200 积分)
  usedAllocatedQuota?: number; // 学院划拨已用积分 (如 400 积分)
  authMethod?: 'carsi' | 'sso' | 'schoolPhone'; // 认证来源
}

export interface PaperDetectionRecord {
  id: string;
  type?: 'paper' | 'risk';
  title: string;
  filename: string;
  author: string;
  uploadTime: string;
  status: '已完成' | '检测中' | '排队中';
  issuesCount: number;
  cost: number;
  riskLevel?: '低风险' | '中风险' | '高风险' | '安全';
  issuesSummary?: {
    typos: number;
    grammar: number;
    images: number;
    tables: number;
    citations: number;
    catalog?: number;
    political?: number;
    academic?: number;
    leakage?: number;
  };
}

export interface IssueDetailItem {
  id: number;
  type: '图片' | '病句' | '错别字' | '表格' | '参考文献' | '目录';
  severity: '严重' | '中等' | '轻微';
  title: string;
  originalText?: string;
  suggestion?: string;
  reason?: string;
  location?: string;
  pageNumber?: number;
  elementId?: string;
}

export interface BatchTask {
  id: string;
  type?: 'paper' | 'risk';
  title: string;
  createTime: string;
  totalPapers: number;
  completedPapers: number;
  waiting: number;
  processing: number;
  failed: number;
  progress: number;
  duration: string;
  canDownloadZip: boolean;
}

export interface OrderRecord {
  orderNo: string;
  createTime: string;
  type?: '充值订单' | '消费订单'; // 充值订单（以积分呈现，无法开发票） vs 消费订单（消费积分进行论文检查，可以开发票）
  paperTitle?: string; // 消费订单对应的检测论文名称
  amount: string;
  credits: string;
  paidCredits?: number; // 付费积分
  bonusCredits?: number; // 赠送积分
  channel: string;
  status: '已关闭' | '已支付' | '待支付';
  payTime?: string;
  transactionId?: string;
  numericAmount?: number;
  invoiceableAmount?: number;
  invoicedStatus?: '未开票' | '已开票' | '待审核' | '已退回' | '不可开票';
  refundStatus?: '全额退款' | '部分退款' | '无退款' | '审核中';
  refundAmount?: number;
  invoiceId?: string;
  paymentMethod?: string;
  paidAt?: string;
}

export type InvoiceStatus = 
  | '待处理' 
  | '开票中' 
  | '已开票' 
  | '已退回' 
  | '已关闭';

export interface InvoiceRecord {
  id: string;
  applicationNo: string;
  orderNos: string[];
  amount: number;
  invoiceType: '增值税普通发票' | '增值税专用发票';
  titleType: '企业' | '个人' | '个人/事业单位';
  title: string;
  taxNumber?: string;
  bankName?: string;
  bankAccount?: string;
  address?: string;
  phone?: string;
  idCard?: string;
  email?: string;
  goodsName: string;
  taxRate: number; // e.g. 6% = 0.06
  taxAmount: number;
  amountWithoutTax: number;
  remark?: string;
  status: InvoiceStatus;
  applyTime: string;
  applicantName: string;
  applicantPhone: string;
  auditTime?: string;
  auditor?: string;
  rejectReason?: string;
  invoiceNo?: string;
  invoiceCode?: string;
  invoicedDate?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: 'pdf' | 'image';
  redInvoiceNo?: string;
  redReason?: string;
  redDate?: string;
  redFileUrl?: string;
}

export interface RefundAuditItem {
  id: string;
  orderNo: string;
  applicant: string;
  phone: string;
  amount: number;
  reason: string;
  applyTime: string;
  status: '待审核' | '已同意退款' | '已拒绝';
  auditTime?: string;
  auditor?: string;
  invoiced: boolean;
  invoiceId?: string;
  invoiceStatusDesc?: '未申请发票' | '发票申请已退回';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface RechargePackageConfig {
  id: number;
  amount: number; // 充值金额，如 100 元
  bonusAmount: number; // 赠送金额，如 20 元 (5:1)
  paidCredits: number; // 付费积分，如 10000
  bonusCredits: number; // 赠送积分，如 2000
  totalCredits: number; // 总到账积分，如 12000
  ratioText: string; // "5:1"
  label: string; // 如 "超值推荐"
  bonusTag: string; // 如 "赠送2000积分"
  popular?: boolean;
  enabled: boolean;
}

export interface BillingPolicyConfig {
  baseCreditPerYuan: number; // 基础比例：1元 = 100付费积分
  bonusRatioText: string; // "5:1"
  bonusRatioPercent: number; // 赠送比例：20% (充值100元送20元)
  costPerTenThousandWords: number; // 多少积分/万有效字：默认 1000 积分/万字
  deductionRatioPaid: number; // 扣费拆分比例-付费：5
  deductionRatioBonus: number; // 扣费拆分比例-赠送：1
  refundFormulaText: string; // 可退款金额 =（剩下积分 - 赠送积分）÷ 100
  noticeTerms: string[]; // 用户充值与退款须知6条
  packages: RechargePackageConfig[];
}
