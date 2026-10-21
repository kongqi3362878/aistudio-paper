export interface CollegeItem {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  createTime: string;
  status: '正常' | '暂停';
  adminName: string;
  adminAccount: string;
  adminPhone: string;
  adminPassword?: string;
  allocatedQuota: number;
  usedQuota: number;
  allocatedTrialPapers: number;
  usedTrialPapers: number;
  studentsCount: number;
  teachersCount: number;
}

export interface CollegeQuotaAllocationItem {
  id: string;
  collegeName: string;
  amount: number;
  time: string;
  operator: string;
  reason: string;
  type: '机构下拨' | '额度回收';
}

export interface MemberQuotaAllocationItem {
  id: string;
  memberName: string;
  role: '学生' | '老师';
  department: string;
  amount: number;
  time: string;
  operator: string;
  reason: string;
}

export interface CollegeTrialAllocationItem {
  id: string;
  collegeName: string;
  papers: number;
  time: string;
  operator: string;
  validity: string;
  reason: string;
  type: '试用划拨' | '试用回收';
}

export interface MemberTrialAllocationItem {
  id: string;
  memberName: string;
  role: '学生' | '老师';
  department: string;
  papers: number;
  time: string;
  operator: string;
  reason: string;
  type: '试用发放' | '试用回收';
}

export interface QuotaFlowItem {
  id: string;
  time: string;
  type: '机构充值' | '学院下拨' | '成员分配' | '检测消耗' | '额度回收';
  change: string;
  target: string;
  operator: string;
  balanceAfter: string;
}

export interface DetectionConsumptionItem {
  id: string;
  title: string;
  author: string;
  studentNo: string;
  department: string;
  identity: '学生' | '老师';
  time: string;
  costType: '校方试用抵扣' | '学院额度扣减' | '个人充值抵扣';
  costAmount: string;
  status: string;
  issuesCount: number;
}
