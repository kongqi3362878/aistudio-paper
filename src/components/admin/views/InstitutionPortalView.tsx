import React, { useState, useRef } from 'react';
import { 
  Table,
  LayoutGrid,
  Layers,
  Settings,
  BookOpen,
  Building2, 
  Users, 
  Plus, 
  CheckCircle2, 
  X, 
  Copy, 
  Check, 
  Trash2, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Search,
  Filter,
  Edit2,
  RotateCcw,
  UserPlus,
  GraduationCap,
  LayoutDashboard,
  TrendingUp,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  FileCheck,
  Lock,
  KeyRound,
  FileSpreadsheet,
  Building,
  School,
  Wallet,
  Coins,
  Send,
  HelpCircle,
  FileText,
  Shield,
  ArrowLeftRight,
  UserCheck,
  BadgeCheck,
  UserCog
} from 'lucide-react';
import { PageKey } from '../../../types';
import BrandLogo from '../../common/BrandLogo';
import TreeSelect, { TreeNode } from '../../common/TreeSelect';
import { initialTrialMembers, TrialMemberItem, InstitutionItem } from '../../../data/adminMockData';
import InstitutionStatsDashboard from './InstitutionStatsDashboard';

interface GrantLogItem {
  id: string;
  memberName: string;
  memberPhone: string;
  time: string;
  type: '试用发放' | '检测消耗' | '额度回收' | '初始立项';
  amount: number;
  afterPool: number;
  operator: string;
  reason: string;
}

interface FormalQuotaOrderItem {
  id: string;
  orderNo: string;
  date: string;
  packageName: string;
  credits: number;
  amount: number;
  paymentMethod: '对公银行转账' | '财政专户划拨' | '在线结算';
  status: '已到账生效' | '审核中';
  contractNo: string;
}

export interface CollegeItem {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  createTime: string;
  status: '正常' | '暂停';
  totalQuota?: number;
  usedQuota?: number;
  trialPapers?: number;
  usedTrialPapers?: number;
  adminName?: string;
  adminAccount?: string;
  adminPhone?: string;
  studentsCount?: number;
  teachersCount?: number;
}

export interface CollegeQuotaAllocationRecord {
  id: string;
  collegeName: string;
  amount: number;
  time: string;
  operator: string;
  reason: string;
  status: '已生效';
}

export interface MemberQuotaAllocationRecord {
  id: string;
  memberName: string;
  memberPhone: string;
  department: string;
  role: '学生' | '老师' | '学院管理员';
  amount: number;
  papers?: number;
  time: string;
  operator: string;
  reason: string;
  status?: string;
}

export interface CollegeTrialAllocationRecord {
  id: string;
  collegeName: string;
  papers: number;
  time: string;
  operator: string;
  reason: string;
  validity: string;
}

export interface DetectionConsumptionItem {
  id: string;
  title: string;
  author: string;
  department: string;
  role: '学生' | '老师';
  type: '试用抵扣' | '正式额度';
  cost: string;
  wordCount: number;
  status: '检测完成' | '处理中';
  time: string;
}

export interface QuotaFlowItem {
  id: string;
  time: string;
  type: '机构充值' | '学院下拨' | '成员划拨' | '检测扣减' | '额度回收';
  source: string;
  target: string;
  change: string;
  balanceAfter: number;
  operator: string;
  notes: string;
}

interface DepartmentAllocationItem {
  department: string;
  totalQuota: number;
  usedQuota: number;
  membersCount: number;
  headName: string;
}

interface DepartmentTrialAllocationItem {
  department: string;
  totalTrial: number;
  usedTrial: number;
  membersCount: number;
  headName: string;
}

interface InstitutionPortalViewProps {
  embedded?: boolean;
  onNavigate?: (page: PageKey) => void;
  institutionName?: string;
  adminName?: string;
  adminRole?: '总管理员' | '学院管理员';
  initialManagedDepartment?: string;
  institutions?: InstitutionItem[];
  onUpdateInstitutions?: (updated: InstitutionItem[]) => void;
  activeSection?: 'dashboard' | 'quota' | 'trial' | 'members' | 'colleges';
  onChangeSection?: (section: 'dashboard' | 'quota' | 'trial' | 'members' | 'colleges') => void;
}

export default function InstitutionPortalView({
  embedded = false,
  onNavigate,
  institutionName = '武汉大学',
  adminName = '王老师',
  adminRole = '总管理员',
  initialManagedDepartment = '全校',
  institutions,
  onUpdateInstitutions,
  activeSection: propActiveSection,
  onChangeSection,
}: InstitutionPortalViewProps) {
  const [currentSchool, setCurrentSchool] = useState<string>(institutionName);

  // 1. Admin Hierarchy & Perspective State (总管理员 vs 学院管理员)
  const [adminLevel, setAdminLevel] = useState<'总管理员' | '学院管理员'>(adminRole || '总管理员');
  const [managedCollege, setManagedCollege] = useState<string>(
    initialManagedDepartment && initialManagedDepartment !== '全校' ? initialManagedDepartment : '计算机学院'
  );
  const [currentAdminDisplayName, setCurrentAdminDisplayName] = useState<string>(
    adminRole === '学院管理员' ? (adminName || '张主任') : (adminName || '王老师')
  );

  // 3 distinct sections: 概览 (dashboard) | 学员管理 (members) | 额度管理 (quota - 合并额度与试用)
  const resolveSection = (sec: string): 'dashboard' | 'quota' | 'members' => {
    if (sec === 'trial') return 'quota';
    if (sec === 'colleges') return 'members';
    if (sec === 'members') return 'members';
    if (sec === 'quota') return 'quota';
    return 'dashboard';
  };

  const [internalSection, setInternalSection] = useState<'dashboard' | 'quota' | 'members'>(
    resolveSection(propActiveSection || 'dashboard')
  );
  const activeSection = resolveSection(propActiveSection || internalSection);

  const handleSelectSection = (sec: 'dashboard' | 'quota' | 'trial' | 'members' | 'colleges') => {
    const target = resolveSection(sec);
    setInternalSection(target);
    if (onChangeSection) {
      onChangeSection(target);
    }
  };

  // 2. Members State
  const [members, setMembers] = useState<TrialMemberItem[]>(initialTrialMembers);

  // Members sub-tab: 'all' (全部师生成员)
  const [memberSubTab, setMemberSubTab] = useState<'all'>('all');

  // Search & Filter states for members management
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'全部' | '学生' | '老师'>('全部');
  const [deptFilter, setDeptFilter] = useState<string>('全部');
  const [deptFilters, setDeptFilters] = useState<string[]>([]);

  // 3. Trial Management States (试用配额管理)
  const [trialAvailablePapers, setTrialAvailablePapers] = useState(38);
  const [trialUsedPapers, setTrialUsedPapers] = useState(2);
  const trialTotalLimit = 40;

  // Trial Logs State
  const [trialLogs, setTrialLogs] = useState<GrantLogItem[]>([
    {
      id: 'TRIAL-001',
      memberName: '周宁',
      memberPhone: '13800132031',
      time: '2026/09/22 14:32',
      type: '试用发放',
      amount: 1,
      afterPool: 38,
      operator: '王老师 (总管理员)',
      reason: '2026届硕士开题答辩校方试用发放',
    },
    {
      id: 'TRIAL-002',
      memberName: '周宁',
      memberPhone: '13800132031',
      time: '2026/09/22 16:05',
      type: '检测消耗',
      amount: 1,
      afterPool: 38,
      operator: '周宁 (自主检测)',
      reason: '《基于图神经网络的复杂网络节点分类》规范检测抵扣',
    },
    {
      id: 'TRIAL-003',
      memberName: '张宇轩',
      memberPhone: '13900130312',
      time: '2026/09/18 10:15',
      type: '试用发放',
      amount: 2,
      afterPool: 39,
      operator: '张主任 (学院管理员)',
      reason: '青年骨干教师论文指导示范检测',
    },
    {
      id: 'TRIAL-004',
      memberName: '系统立项',
      memberPhone: '-',
      time: '2026/08/01 09:00',
      type: '初始立项',
      amount: 40,
      afterPool: 40,
      operator: '平台管理员 (审核通过)',
      reason: '2026-2027学年武汉大学校方试用配额立项开通',
    },
  ]);
  const [trialLogFilter, setTrialLogFilter] = useState<'全部' | '试用发放' | '检测消耗' | '额度回收' | '初始立项'>('全部');

  // 4. Quota Management States (额度管理 - 机构正式配额资产，以检测次数呈现)
  const [formalTotalCredits, setFormalTotalCredits] = useState(2000); // 2,000次正式检测额度
  const [formalUsedCredits, setFormalUsedCredits] = useState(485); // 485次已分配
  const [departmentAllocations, setDepartmentAllocations] = useState<DepartmentAllocationItem[]>([
    { department: '计算机学院', totalQuota: 600, usedQuota: 182, membersCount: 142, headName: '张主任 (已设)' },
    { department: '经济与管理学院', totalQuota: 450, usedQuota: 124, membersCount: 98, headName: '刘院长 (已设)' },
    { department: '文学院', totalQuota: 300, usedQuota: 61, membersCount: 65, headName: '待设置' },
    { department: '电子信息学院', totalQuota: 350, usedQuota: 89, membersCount: 88, headName: '待设置' },
    { department: '法学院', totalQuota: 200, usedQuota: 24, membersCount: 42, headName: '待设置' },
    { department: '生命科学学院', totalQuota: 100, usedQuota: 5, membersCount: 30, headName: '待设置' },
  ]);

  const [departmentTrialAllocations, setDepartmentTrialAllocations] = useState<DepartmentTrialAllocationItem[]>([
    { department: '计算机学院', totalTrial: 50, usedTrial: 15, membersCount: 142, headName: '张主任 (已设)' },
    { department: '经济与管理学院', totalTrial: 50, usedTrial: 14, membersCount: 98, headName: '刘院长 (已设)' },
    { department: '文学院', totalTrial: 30, usedTrial: 6, membersCount: 65, headName: '待设置' },
    { department: '电子信息学院', totalTrial: 40, usedTrial: 10, membersCount: 88, headName: '待设置' },
    { department: '法学院', totalTrial: 25, usedTrial: 3, membersCount: 42, headName: '待设置' },
    { department: '生命科学学院', totalTrial: 20, usedTrial: 1, membersCount: 30, headName: '待设置' },
  ]);

  const [formalOrders] = useState<FormalQuotaOrderItem[]>([
    {
      id: 'FO-20260901-01',
      orderNo: 'ORD-WHU-2026-0901',
      date: '2026/09/01 10:20',
      packageName: '高校年度正规学术检测包 (2,000次检测)',
      credits: 2000,
      amount: 18000,
      paymentMethod: '对公银行转账',
      status: '已到账生效',
      contractNo: 'HT-202609-WHU-088',
    },
    {
      id: 'FO-20260301-02',
      orderNo: 'ORD-WHU-2026-0301',
      date: '2026/03/01 15:45',
      packageName: '开题答辩季补充额度包 (500次检测)',
      credits: 500,
      amount: 4800,
      paymentMethod: '财政专户划拨',
      status: '已到账生效',
      contractNo: 'HT-202603-WHU-021',
    },
  ]);

  // Dashboard trend range
  const [trendRange, setTrendRange] = useState<'近7天' | '近30天' | '本学期'>('近30天');

  // Modals States
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberPresetIdentity, setAddMemberPresetIdentity] = useState<'学生' | '老师'>('学生');
  const [editingMember, setEditingMember] = useState<TrialMemberItem | null>(null);
  const [passwordModalMember, setPasswordModalMember] = useState<TrialMemberItem | null>(null);
  const [showGrantTrialModal, setShowGrantTrialModal] = useState(false);
  const [showApplyTrialQuotaModal, setShowApplyTrialQuotaModal] = useState(false);
  const [showAllocateDeptQuotaModal, setShowAllocateDeptQuotaModal] = useState(false);
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<{ id: string; name: string } | null>(null);

  // College Admin Setup Modal
  const [showAssignCollegeAdminModal, setShowAssignCollegeAdminModal] = useState(false);
  const [targetDeptForAdmin, setTargetDeptForAdmin] = useState('文学院');
  const [collegeAdminForm, setCollegeAdminForm] = useState({
    name: '',
    phone: '',
    gender: '男' as '男' | '女',
    teacherId: '', // if selecting from existing teachers
    mode: 'select' as 'select' | 'new',
  });

  // Import Preview & File upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importFileName, setImportFileName] = useState<string>('');
  const [importPreviewData, setImportPreviewData] = useState<{
    phone: string;
    name: string;
    gender: '男' | '女';
    department: string;
    identity: '学生' | '老师';
    credits?: number;
    papers?: number;
  }[]>([]);

  // Add / Edit Member Form
  const [memberFormData, setMemberFormData] = useState({
    name: '',
    phone: '',
    gender: '男' as '男' | '女',
    department: '计算机学院',
    identity: '学生' as '学生' | '老师',
  });

  // 6. Colleges Management States
  const [colleges, setColleges] = useState<CollegeItem[]>([
    {
      id: 'col-cs',
      name: '计算机学院',
      code: 'CS',
      category: '信息科学学部',
      description: '计算机科学与技术、软件工程、人工智能、网络安全特色专业与实验平台',
      createTime: '2023-09-01',
      status: '正常',
      totalQuota: 60000,
      usedQuota: 18200,
      trialPapers: 15,
      usedTrialPapers: 1,
      adminName: '张主任',
      adminAccount: 'whu_cs_admin',
      adminPhone: '138****9901',
      studentsCount: 110,
      teachersCount: 32,
    },
    {
      id: 'col-sem',
      name: '经济与管理学院',
      code: 'SEM',
      category: '人文社会科学部',
      description: '经济学、国际金融、工商管理、市场营销与管理科学前沿交叉学科',
      createTime: '2023-09-01',
      status: '正常',
      totalQuota: 45000,
      usedQuota: 12400,
      trialPapers: 10,
      usedTrialPapers: 1,
      adminName: '刘院长',
      adminAccount: 'whu_sem_admin',
      adminPhone: '139****8820',
      studentsCount: 75,
      teachersCount: 23,
    },
    {
      id: 'col-cla',
      name: '文学院',
      code: 'CLA',
      category: '人文社会科学部',
      description: '中国语言文学、古典文献学、戏剧影视文学与汉语言文化国际传播',
      createTime: '2023-09-01',
      status: '正常',
      totalQuota: 30000,
      usedQuota: 6100,
      trialPapers: 5,
      usedTrialPapers: 0,
      adminName: '李老师',
      adminAccount: 'whu_cla_admin',
      adminPhone: '137****6611',
      studentsCount: 50,
      teachersCount: 15,
    },
    {
      id: 'col-eis',
      name: '电子信息学院',
      code: 'EIS',
      category: '信息科学学部',
      description: '通信工程、电子科学与技术、集成电路设计与微纳电子学重点实验室',
      createTime: '2023-09-01',
      status: '正常',
      totalQuota: 35000,
      usedQuota: 8900,
      trialPapers: 8,
      usedTrialPapers: 0,
      adminName: '待设置',
      adminAccount: 'whu_eis_admin',
      adminPhone: '136****5500',
      studentsCount: 68,
      teachersCount: 20,
    },
    {
      id: 'col-sls',
      name: '生命科学学院',
      code: 'SLS',
      category: '理学部',
      description: '生物科学、生物技术、生态学与现代分子生物医学研究基地',
      createTime: '2023-09-01',
      status: '正常',
      totalQuota: 10000,
      usedQuota: 500,
      trialPapers: 3,
      usedTrialPapers: 0,
      adminName: '待设置',
      adminAccount: 'whu_sls_admin',
      adminPhone: '135****4422',
      studentsCount: 22,
      teachersCount: 8,
    },
    {
      id: 'col-law',
      name: '法学院',
      code: 'LAW',
      category: '人文社会科学部',
      description: '国际法学、民商法学、宪法与行政法学高层次法治人才培育摇篮',
      createTime: '2023-09-01',
      status: '正常',
      totalQuota: 20000,
      usedQuota: 2400,
      trialPapers: 4,
      usedTrialPapers: 0,
      adminName: '待设置',
      adminAccount: 'whu_law_admin',
      adminPhone: '138****3311',
      studentsCount: 32,
      teachersCount: 10,
    },
  ]);

  // Sub-Tab Navigation States matching exact user requested structure
  const [overviewSubTab, setOverviewSubTab] = useState<'board' | 'stats' | 'quotaOverview' | 'trialOverview'>('board');
  const [collegesSubTab, setCollegesSubTab] = useState<'list' | 'add' | 'admins' | 'quota'>('list');
  const [membersSubTab, setMembersSubTab] = useState<'list' | 'add' | 'import' | 'batchDelete'>('list');
  const [quotaSubTab, setQuotaSubTab] = useState<'overview' | 'allocate' | 'records' | 'flow' | 'reclaim'>('overview');
  const [trialSubTab, setTrialSubTab] = useState<'pool' | 'records' | 'allocate' | 'consume' | 'reclaim'>('pool');
  const [quotaRecordFilter, setQuotaRecordFilter] = useState<'全部' | '正式额度' | '试用篇数'>('全部');
  const [allocateTargetMode, setAllocateTargetMode] = useState<'member' | 'college'>('member');
  const [allocateSearch, setAllocateSearch] = useState('');

  // Unified Member Quota & Trial Allocation Modal & Form States (支持给成员分配额度和试用次数)
  const [showAllocateMemberModal, setShowAllocateMemberModal] = useState(false);
  const [allocateModalMember, setAllocateModalMember] = useState<TrialMemberItem | null>(null);
  const [allocateModalForm, setAllocateModalForm] = useState({
    credits: 10,
    papers: 1,
    reason: '毕业学位论文规范性全检开题示范',
  });

  // Page Form in Quota Allocate Subtab
  const [memberAllocateForm, setMemberAllocateForm] = useState({
    memberId: initialTrialMembers[0]?.id || '',
    credits: 10,
    papers: 1,
    reason: '全校开题答辩论文检测专项支持',
  });

  // Allocation Records & Flow States
  const [collegeQuotaAllocations, setCollegeQuotaAllocations] = useState<CollegeQuotaAllocationRecord[]>([
    { id: 'CQA-20260901-01', collegeName: '计算机学院', amount: 600, time: '2026/09/01 10:30', operator: '王老师 (总管理员)', reason: '2026秋季学期开题答辩划拨', status: '已生效' },
    { id: 'CQA-20260901-02', collegeName: '经济与管理学院', amount: 450, time: '2026/09/01 11:00', operator: '王老师 (总管理员)', reason: '本硕学位论文规范全检', status: '已生效' },
    { id: 'CQA-20260902-03', collegeName: '电子信息学院', amount: 350, time: '2026/09/02 09:20', operator: '王老师 (总管理员)', reason: '重点实验室专项额度', status: '已生效' },
    { id: 'CQA-20260902-04', collegeName: '文学院', amount: 300, time: '2026/09/02 14:15', operator: '王老师 (总管理员)', reason: '人文社科重点试点下拨', status: '已生效' },
    { id: 'CQA-20260903-05', collegeName: '法学院', amount: 200, time: '2026/09/03 16:40', operator: '王老师 (总管理员)', reason: '法律硕士毕业论文示范', status: '已生效' },
    { id: 'CQA-20260904-06', collegeName: '生命科学学院', amount: 100, time: '2026/09/04 10:10', operator: '王老师 (总管理员)', reason: '生科交叉课题组检测包', status: '已生效' },
  ]);

  const [memberQuotaAllocations, setMemberQuotaAllocations] = useState<MemberQuotaAllocationRecord[]>([
    { id: 'MQA-020', memberName: '周宁', memberPhone: '13800132031', department: '计算机学院', role: '学生', amount: 12, papers: 1, time: '2026/09/25 15:20', operator: '王老师 (机构管理员)', reason: '硕士论文开题示范额度', status: '已生效' },
    { id: 'MQA-019', memberName: '张宇轩', memberPhone: '13900130312', department: '电子信息学院', role: '老师', amount: 30, papers: 2, time: '2026/09/24 09:40', operator: '王老师 (机构管理员)', reason: '电子系导师组送检指导示范', status: '已生效' },
    { id: 'MQA-018', memberName: '林晚', memberPhone: '13900135628', department: '文学院', role: '学生', amount: 8, papers: 1, time: '2026/09/23 11:10', operator: '王老师 (机构管理员)', reason: '古典文学答辩论文检测配额', status: '已生效' },
    { id: 'MQA-017', memberName: '孙建树', memberPhone: '13711335566', department: '机械工程学院', role: '老师', amount: 35, papers: 4, time: '2026/09/22 14:05', operator: '王老师 (机构管理员)', reason: '工科重点实验室专项配额', status: '已生效' },
    { id: 'MQA-016', memberName: '许知夏', memberPhone: '13700137814', department: '经济与管理学院', role: '学生', amount: 6, papers: 1, time: '2026/09/21 16:30', operator: '王老师 (机构管理员)', reason: 'MBA学位论文规范全检', status: '已生效' },
    { id: 'MQA-015', memberName: '陈思齐', memberPhone: '13600134591', department: '生命科学学院', role: '老师', amount: 15, papers: 2, time: '2026/09/20 10:15', operator: '王老师 (机构管理员)', reason: '生科实验课题论文辅导配额', status: '已生效' },
    { id: 'MQA-014', memberName: '赵云舒', memberPhone: '13500138920', department: '法学院', role: '学生', amount: 5, papers: 1, time: '2026/09/19 13:45', operator: '王老师 (机构管理员)', reason: '法律硕士毕业论文示范', status: '已生效' },
    { id: 'MQA-013', memberName: '王浩', memberPhone: '13811223344', department: '机械工程学院', role: '学生', amount: 8, papers: 2, time: '2026/09/18 11:20', operator: '王老师 (机构管理员)', reason: '机械设计答辩试用专款', status: '已生效' },
    { id: 'MQA-012', memberName: '李悦心', memberPhone: '13911224455', department: '外国语学院', role: '学生', amount: 6, papers: 1, time: '2026/09/17 09:50', operator: '王老师 (机构管理员)', reason: '跨文化交际论文初稿全检', status: '已生效' },
    { id: 'MQA-011', memberName: '黄彦民', memberPhone: '13311779900', department: '物理科学与技术学院', role: '老师', amount: 28, papers: 3, time: '2026/09/16 15:10', operator: '王老师 (机构管理员)', reason: '物理SCI学术论文审核指导', status: '已生效' },
    { id: 'MQA-010', memberName: '吴梓萱', memberPhone: '13611446677', department: '文学院', role: '学生', amount: 10, papers: 1, time: '2026/09/15 16:40', operator: '王老师 (机构管理员)', reason: '现代文学答辩开题配额', status: '已生效' },
    { id: 'MQA-009', memberName: '钱一琛', memberPhone: '13511557788', department: '数学与统计学院', role: '学生', amount: 12, papers: 2, time: '2026/09/14 10:30', operator: '王老师 (机构管理员)', reason: '应用统计毕业课题检测支持', status: '已生效' },
    { id: 'MQA-008', memberName: '冯文婷', memberPhone: '13812345601', department: '外国语学院', role: '老师', amount: 22, papers: 2, time: '2026/09/13 14:25', operator: '王老师 (机构管理员)', reason: '翻译理论学术论文预审', status: '已生效' },
    { id: 'MQA-007', memberName: '程家睿', memberPhone: '13912345602', department: '电子信息学院', role: '学生', amount: 9, papers: 1, time: '2026/09/12 09:15', operator: '王老师 (机构管理员)', reason: '微电子集成论文自检', status: '已生效' },
    { id: 'MQA-006', memberName: '高雨萱', memberPhone: '13712345603', department: '生命科学学院', role: '学生', amount: 11, papers: 1, time: '2026/09/11 11:35', operator: '王老师 (机构管理员)', reason: '分子生物学开题全检支持', status: '已生效' },
    { id: 'MQA-005', memberName: '董向华', memberPhone: '13612345604', department: '经济与管理学院', role: '老师', amount: 32, papers: 3, time: '2026/09/10 15:55', operator: '王老师 (机构管理员)', reason: '国家自然科学基金成果送检', status: '已生效' },
    { id: 'MQA-004', memberName: '梁志恒', memberPhone: '13412345606', department: '计算机学院', role: '学生', amount: 15, papers: 2, time: '2026/09/09 10:20', operator: '王老师 (机构管理员)', reason: '人工智能毕业设计专项配额', status: '已生效' },
    { id: 'MQA-003', memberName: '宋欣怡', memberPhone: '13912345609', department: '数学与统计学院', role: '老师', amount: 30, papers: 3, time: '2026/09/08 14:50', operator: '王老师 (机构管理员)', reason: '青年骨干教师论文检测支持', status: '已生效' },
    { id: 'MQA-002', memberName: '韩柏君', memberPhone: '13512345612', department: '外国语学院', role: '学生', amount: 6, papers: 1, time: '2026/09/07 16:10', operator: '王老师 (机构管理员)', reason: '商务英语学士论文开题', status: '已生效' },
    { id: 'MQA-001', memberName: '张主任', memberPhone: '13800139901', department: '计算机学院', role: '老师', amount: 30, papers: 3, time: '2026/09/06 09:00', operator: '王老师 (机构管理员)', reason: '院系毕业答辩首批体验额度', status: '已生效' },
  ]);

  // Pagination states for Member Management and Quota Management
  const [memberPage, setMemberPage] = useState(1);
  const [quotaMemberPage, setQuotaMemberPage] = useState(1);
  const [recordsPage, setRecordsPage] = useState(1);
  const [selectedQuotaMemberIds, setSelectedQuotaMemberIds] = useState<string[]>([]);
  const [showBatchAllocateModal, setShowBatchAllocateModal] = useState(false);
  const [batchAllocateForm, setBatchAllocateForm] = useState({
    credits: 10,
    papers: 1,
    reason: '全校集中开题答辩统一分配支持',
  });

  const [collegeTrialAllocations, setCollegeTrialAllocations] = useState<CollegeTrialAllocationRecord[]>([
    { id: 'CTA-001', collegeName: '计算机学院', papers: 15, time: '2026/09/01 10:35', operator: '王老师 (总管理员)', reason: '开题答辩首批试用篇数', validity: '2026/12/31' },
    { id: 'CTA-002', collegeName: '经济与管理学院', papers: 10, time: '2026/09/01 11:05', operator: '王老师 (总管理员)', reason: '预答辩试用专款', validity: '2026/12/31' },
    { id: 'CTA-003', collegeName: '电子信息学院', papers: 8, time: '2026/09/02 09:25', operator: '王老师 (总管理员)', reason: '工科试点名额', validity: '2026/12/31' },
    { id: 'CTA-004', collegeName: '文学院', papers: 5, time: '2026/09/02 14:20', operator: '王老师 (总管理员)', reason: '汉语言文学试点', validity: '2026/12/31' },
  ]);

  const [detectionConsumptionLogs, setDetectionConsumptionLogs] = useState<DetectionConsumptionItem[]>([
    { id: 'DET-LOG-01', title: '《基于图神经网络的复杂网络节点分类》', author: '周宁', department: '计算机学院', role: '学生', type: '试用抵扣', cost: '1 篇试用', wordCount: 38200, status: '检测完成', time: '2026/09/22 16:05' },
    { id: 'DET-LOG-02', title: '《数字经济赋能新质生产力的耦合机制研究》', author: '陈思涵', department: '经济与管理学院', role: '学生', type: '试用抵扣', cost: '1 篇试用', wordCount: 42500, status: '检测完成', time: '2026/09/20 14:10' },
    { id: 'DET-LOG-03', title: '《大模型在嵌入式硬件优化的实证分析》', author: '张宇轩', department: '计算机学院', role: '老师', type: '正式额度', cost: '1 次检测', wordCount: 51000, status: '检测完成', time: '2026/09/18 10:30' },
    { id: 'DET-LOG-04', title: '《先秦儒家礼乐思想在当代语境下的传承》', author: '赵若微', department: '文学院', role: '学生', type: '正式额度', cost: '1 次检测', wordCount: 29800, status: '检测完成', time: '2026/09/16 09:45' },
    { id: 'DET-LOG-05', title: '《毫米波雷达与多源传感器融合定位算法》', author: '钱浩', department: '电子信息学院', role: '学生', type: '正式额度', cost: '1 次检测', wordCount: 36400, status: '检测完成', time: '2026/09/15 16:20' },
  ]);

  const [quotaFlowLogs, setQuotaFlowLogs] = useState<QuotaFlowItem[]>([
    { id: 'FLOW-01', time: '2026/09/01 10:20', type: '机构充值', source: '平台对公签约', target: '全校总资产池', change: '+2,000 次', balanceAfter: 2000, operator: '系统管理员', notes: '高校年度正规学术检测包 (2,000次检测)' },
    { id: 'FLOW-02', time: '2026/09/01 10:30', type: '学院下拨', source: '全校总资产池', target: '计算机学院', change: '-600 次', balanceAfter: 1400, operator: '王老师 (总管)', notes: '2026秋季学期开题答辩划拨' },
    { id: 'FLOW-03', time: '2026/09/01 11:00', type: '学院下拨', source: '全校总资产池', target: '经济与管理学院', change: '-450 次', balanceAfter: 950, operator: '王老师 (总管)', notes: '本硕学位论文规范全检' },
    { id: 'FLOW-04', time: '2026/09/02 09:20', type: '学院下拨', source: '全校总资产池', target: '电子信息学院', change: '-350 次', balanceAfter: 600, operator: '王老师 (总管)', notes: '重点实验室专项额度' },
    { id: 'FLOW-05', time: '2026/09/02 14:15', type: '学院下拨', source: '全校总资产池', target: '文学院', change: '-300 次', balanceAfter: 300, operator: '王老师 (总管)', notes: '人文社科重点试点下拨' },
    { id: 'FLOW-06', time: '2026/09/10 15:20', type: '成员划拨', source: '计算机学院', target: '周宁 (学生)', change: '-12 次', balanceAfter: 588, operator: '张主任 (院管)', notes: '硕士论文开题示范额度' },
    { id: 'FLOW-07', time: '2026/09/18 10:30', type: '检测扣减', source: '计算机学院', target: '张宇轩 (老师)', change: '-1 次', balanceAfter: 587, operator: '系统结算', notes: '论文规范性检测自动扣减' },
  ]);

  // Selected members for batch deletion in members management
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const [showAddCollegeModal, setShowAddCollegeModal] = useState(false);
  const [editingCollege, setEditingCollege] = useState<CollegeItem | null>(null);
  const [addCollegeForm, setAddCollegeForm] = useState({
    name: '',
    code: '',
    category: '信息科学学部',
    description: '',
    hasAdmin: false,
    adminMode: 'new' as 'new' | 'select',
    adminTeacherId: '',
    adminName: '',
    adminPhone: '',
    adminGender: '男' as '男' | '女',
    adminPassword: 'Edu@888888',
  });

  const [newCollegeForm, setNewCollegeForm] = useState({
    name: '',
    code: '',
    category: '信息科学学部',
    description: '',
    initialQuota: 20000,
    initialTrial: 20,
    adminName: '',
    adminPhone: '',
  });

  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');
  const [collegeCategoryFilter, setCollegeCategoryFilter] = useState('全部');
  const [collegeAdminStatusFilter, setCollegeAdminStatusFilter] = useState<'全部' | '已设管理员' | '待设管理员'>('全部');
  const [collegeViewMode, setCollegeViewMode] = useState<'cards' | 'table'>('table');

  // Password Management Form
  const [customNewPassword, setCustomNewPassword] = useState('');

  // Grant Trial Papers Form
  const [grantTargetMemberId, setGrantTargetMemberId] = useState(initialTrialMembers[0]?.id || '');
  const [grantAmount, setGrantAmount] = useState(1);
  const [grantNotes, setGrantNotes] = useState('校方论文开题季专项试用');

  // Apply trial quota increase form
  const [applyTrialQuotaForm, setApplyTrialQuotaForm] = useState({
    papers: 20,
    reason: '2026年秋季开题季拟新增硕士生规范检测试点，需追加试用篇数',
  });

  // Department Quota Allocation Form
  const [deptAllocationForm, setDeptAllocationForm] = useState({
    department: '计算机学院',
    addQuota: 10000,
    reason: '学期初开题答辩额度划拨',
  });

  // College Trial Allocation Form
  const [collegeTrialForm, setCollegeTrialForm] = useState({
    department: '计算机学院',
    papers: 5,
    validity: '2026/12/31',
    reason: '开题答辩校方试用批复',
  });

  // Member Quota Allocation Form
  const [memberQuotaForm, setMemberQuotaForm] = useState({
    memberId: initialTrialMembers[0]?.id || '',
    credits: 500,
    reason: '学院导师组课题支持',
  });

  // Reclaim College Trial Form
  const [reclaimCollegeTrialForm, setReclaimCollegeTrialForm] = useState({
    department: '计算机学院',
    papers: 2,
    reason: '答辩结束未用额度回收',
  });

  // Reclaim Member Trial Form
  const [reclaimMemberTrialForm, setReclaimMemberTrialForm] = useState({
    memberId: initialTrialMembers[0]?.id || '',
    papers: 1,
    reason: '学生毕业清退试用篇数',
  });

  // Allocation Handlers
  const handleAllocateCollegeQuota = (collegeName: string, amount: number, reason: string) => {
    if (amount <= 0) {
      showToast('划拨额度必须大于0');
      return;
    }
    const avail = formalTotalCredits - formalUsedCredits;
    if (amount > avail) {
      showToast(`机构可用额度不足！当前仅剩余 ${avail.toLocaleString()} 次`);
      return;
    }
    setDepartmentAllocations(prev => prev.map(d => d.department === collegeName ? { ...d, totalQuota: d.totalQuota + amount } : d));
    setColleges(prev => prev.map(c => c.name === collegeName ? { ...c, totalQuota: (c.totalQuota || 0) + amount } : c));
    setFormalUsedCredits(prev => prev + amount);
    const newId = `CQA-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const timeStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setCollegeQuotaAllocations(prev => [
      { id: newId, collegeName, amount, time: timeStr, operator: `${currentAdminDisplayName} (总管理员)`, reason: reason || '机构下拨正式额度', status: '已生效' },
      ...prev
    ]);
    setQuotaFlowLogs(prev => [
      { id: `FLOW-${Date.now().toString().slice(-4)}`, time: timeStr, type: '学院下拨', source: '全校总资产池', target: collegeName, change: `-${amount.toLocaleString()} 次`, balanceAfter: formalTotalCredits - formalUsedCredits - amount, operator: `${currentAdminDisplayName} (总管)`, notes: reason || '机构下拨学院额度' },
      ...prev
    ]);
    showToast(`成功向【${collegeName}】下拨 ${amount.toLocaleString()} 次！`);
  };

  const handleAllocateMemberQuota = (memberId: string, amount: number, reason: string) => {
    if (amount <= 0) {
      showToast('分配额度必须大于0');
      return;
    }
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, availableCredits: (m.availableCredits || 0) + amount } : m));
    const newId = `MQA-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const timeStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setMemberQuotaAllocations(prev => [
      { id: newId, memberName: targetMember.name, memberPhone: targetMember.phone, department: targetMember.department, role: targetMember.identity, amount, time: timeStr, operator: `${currentAdminDisplayName} (学院管理员)`, reason: reason || '学院分配正式额度', status: '已生效' },
      ...prev
    ]);
    setQuotaFlowLogs(prev => [
      { id: `FLOW-${Date.now().toString().slice(-4)}`, time: timeStr, type: '成员划拨', source: targetMember.department, target: `${targetMember.name} (${targetMember.identity})`, change: `-${amount.toLocaleString()} 次`, balanceAfter: 588, operator: `${currentAdminDisplayName} (院管)`, notes: reason || '学院向成员分配正式额度' },
      ...prev
    ]);
    showToast(`成功向【${targetMember.name}】划拨 ${amount.toLocaleString()} 次！`);
  };

  const handleAllocateCollegeTrial = (collegeName: string, papers: number, reason: string, validity: string) => {
    if (papers <= 0) {
      showToast('试用篇数必须大于0');
      return;
    }
    if (papers > trialAvailablePapers) {
      showToast(`机构可用试用篇数不足！当前仅剩 ${trialAvailablePapers} 篇`);
      return;
    }
    setTrialAvailablePapers(prev => prev - papers);
    setColleges(prev => prev.map(c => c.name === collegeName ? { ...c, trialPapers: (c.trialPapers || 0) + papers } : c));
    setDepartmentTrialAllocations(prev => prev.map(item =>
      item.department === collegeName
        ? { ...item, totalTrial: item.totalTrial + papers }
        : item
    ));
    const now = new Date();
    const timeStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setCollegeTrialAllocations(prev => [
      { id: `CTA-${Date.now().toString().slice(-4)}`, collegeName, papers, time: timeStr, operator: `${currentAdminDisplayName} (总管理员)`, reason: reason || '机构划拨试用篇数', validity: validity || '2026/12/31' },
      ...prev
    ]);
    setTrialLogs(prev => [
      { id: `TRIAL-${Date.now().toString().slice(-4)}`, memberName: `${collegeName} (学院池)`, memberPhone: '-', time: timeStr, type: '试用发放', amount: papers, afterPool: trialAvailablePapers - papers, operator: `${currentAdminDisplayName} (总管理员)`, reason: `向【${collegeName}】下拨开题试用篇数` },
      ...prev
    ]);
    showToast(`成功向【${collegeName}】划拨 ${papers} 篇校方试用！`);
  };

  const handleAllocateMemberTrial = (memberId: string, papers: number, reason: string) => {
    if (papers <= 0) {
      showToast('试用篇数必须大于0');
      return;
    }
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, availablePapers: m.availablePapers + papers } : m));
    setColleges(prev => prev.map(c => c.name === targetMember.department ? { ...c, trialPapers: Math.max(0, (c.trialPapers || 0) - papers) } : c));
    const now = new Date();
    const timeStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setTrialLogs(prev => [
      { id: `TRIAL-${Date.now().toString().slice(-4)}`, memberName: targetMember.name, memberPhone: targetMember.phone, time: timeStr, type: '试用发放', amount: papers, afterPool: trialAvailablePapers, operator: `${currentAdminDisplayName} (学院管理员)`, reason: reason || '本院师生开题试用发放' },
      ...prev
    ]);
    showToast(`成功向【${targetMember.name}】发放 ${papers} 篇试用配额！`);
  };

  // Unified Handler: 同时给成员分配额度(次数)与试用次数(篇数)
  const handleAllocateMemberBoth = (memberId: string, credits: number, papers: number, reason: string) => {
    if (credits <= 0 && papers <= 0) {
      showToast('分配额度次数或试用篇数至少一项需大于0');
      return;
    }
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;

    const availCredits = formalTotalCredits - formalUsedCredits;
    if (credits > 0 && credits > availCredits) {
      showToast(`机构可用正式额度不足！剩余 ${availCredits.toLocaleString()} 次`);
      return;
    }
    if (papers > 0 && papers > trialAvailablePapers) {
      showToast(`机构试用篇数不足！当前仅剩 ${trialAvailablePapers} 篇`);
      return;
    }

    if (credits > 0) {
      setFormalUsedCredits(prev => prev + credits);
    }
    if (papers > 0) {
      setTrialAvailablePapers(prev => prev - papers);
    }

    setMembers(prev => prev.map(m => m.id === memberId ? {
      ...m,
      availableCredits: (m.availableCredits || 0) + credits,
      credits: (m.credits || 0) + credits,
      availablePapers: (m.availablePapers || 0) + papers,
    } : m));

    const now = new Date();
    const timeStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const newId = `MQA-${Date.now().toString().slice(-6)}`;
    setMemberQuotaAllocations(prev => [
      { 
        id: newId, 
        memberName: targetMember.name, 
        memberPhone: targetMember.phone, 
        department: targetMember.department, 
        role: targetMember.identity, 
        amount: credits,
        papers: papers, 
        time: timeStr, 
        operator: `${currentAdminDisplayName} (机构管理员)`, 
        reason: reason || (credits > 0 && papers > 0 ? '机构分配正式额度与试用次数' : credits > 0 ? '机构分配正式额度' : '校方试用发放'), 
        status: '已生效' as const 
      },
      ...prev
    ]);

    if (credits > 0) {
      setQuotaFlowLogs(prev => [
        { id: `FLOW-${Date.now().toString().slice(-4)}`, time: timeStr, type: '成员划拨', source: '机构总池', target: `${targetMember.name} (${targetMember.identity})`, change: `-${credits.toLocaleString()} 次`, balanceAfter: formalTotalCredits - formalUsedCredits - credits, operator: `${currentAdminDisplayName} (机构总管)`, notes: reason || '机构向师生分配额度' },
        ...prev
      ]);
    }

    if (papers > 0) {
      setTrialLogs(prev => [
        { id: `TRIAL-${Date.now().toString().slice(-4)}`, memberName: targetMember.name, memberPhone: targetMember.phone, time: timeStr, type: '试用发放', amount: papers, afterPool: trialAvailablePapers - papers, operator: `${currentAdminDisplayName} (机构管理员)`, reason: reason || '校方试用发放' },
        ...prev
      ]);
    }

    showToast(`成功向【${targetMember.name}】分配 ${credits > 0 ? `${credits.toLocaleString()} 次额度` : ''}${credits > 0 && papers > 0 ? ' + ' : ''}${papers > 0 ? `${papers} 篇试用` : ''}！`);
  };

  const handleConfirmAllocateModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocateModalMember) return;
    handleAllocateMemberBoth(
      allocateModalMember.id,
      Number(allocateModalForm.credits) || 0,
      Number(allocateModalForm.papers) || 0,
      allocateModalForm.reason
    );
    setShowAllocateMemberModal(false);
  };

  const handleBatchAllocateMembers = (credits: number, papers: number, reason: string) => {
    if (selectedQuotaMemberIds.length === 0) {
      showToast('请先选择要分配的成员');
      return;
    }
    if (credits <= 0 && papers <= 0) {
      showToast('分配额度次数或试用篇数至少一项需大于0');
      return;
    }
    const totalCreditsNeeded = credits * selectedQuotaMemberIds.length;
    const totalPapersNeeded = papers * selectedQuotaMemberIds.length;
    const availCredits = formalTotalCredits - formalUsedCredits;
    if (credits > 0 && totalCreditsNeeded > availCredits) {
      showToast(`机构可用正式额度不足！需 ${totalCreditsNeeded.toLocaleString()} 次，当前仅剩 ${availCredits.toLocaleString()} 次`);
      return;
    }
    if (papers > 0 && totalPapersNeeded > trialAvailablePapers) {
      showToast(`机构试用篇数不足！需 ${totalPapersNeeded} 篇，当前仅剩 ${trialAvailablePapers} 篇`);
      return;
    }

    if (credits > 0) setFormalUsedCredits(prev => prev + totalCreditsNeeded);
    if (papers > 0) setTrialAvailablePapers(prev => prev - totalPapersNeeded);

    const now = new Date();
    const timeStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const newRecords: MemberQuotaAllocationRecord[] = [];
    setMembers(prev => prev.map(m => {
      if (selectedQuotaMemberIds.includes(m.id)) {
        newRecords.push({
          id: `MQA-${Date.now().toString().slice(-4)}-${Math.random().toString(36).slice(-4)}`,
          memberName: m.name,
          memberPhone: m.phone,
          department: m.department,
          role: m.identity,
          amount: credits,
          papers: papers,
          time: timeStr,
          operator: `${currentAdminDisplayName} (机构管理员)`,
          reason: reason || '全校集中批量分配',
          status: '已生效',
        });
        return {
          ...m,
          availableCredits: (m.availableCredits || 0) + credits,
          credits: (m.credits || 0) + credits,
          availablePapers: (m.availablePapers || 0) + papers,
        };
      }
      return m;
    }));

    setMemberQuotaAllocations(prev => [...newRecords, ...prev]);
    showToast(`成功为选中的 ${selectedQuotaMemberIds.length} 位成员批量分配资产！`);
    setSelectedQuotaMemberIds([]);
    setShowBatchAllocateModal(false);
  };

  const handleReclaimCollegeTrial = (collegeName: string, papers: number, reason: string) => {
    if (papers <= 0) {
      showToast('回收篇数必须大于0');
      return;
    }
    const college = colleges.find(c => c.name === collegeName);
    const collegePapers = college?.trialPapers || 0;
    if (papers > collegePapers) {
      showToast(`回收数量超过学院持有篇数！该学院目前仅有 ${collegePapers} 篇`);
      return;
    }
    setColleges(prev => prev.map(c => c.name === collegeName ? { ...c, trialPapers: (c.trialPapers || 0) - papers } : c));
    setDepartmentTrialAllocations(prev => prev.map(item =>
      item.department === collegeName
        ? { ...item, totalTrial: Math.max(0, item.totalTrial - papers) }
        : item
    ));
    setTrialAvailablePapers(prev => prev + papers);
    const now = new Date();
    const timeStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setTrialLogs(prev => [
      { id: `TRIAL-${Date.now().toString().slice(-4)}`, memberName: `${collegeName} (学院池)`, memberPhone: '-', time: timeStr, type: '额度回收', amount: papers, afterPool: trialAvailablePapers + papers, operator: `${currentAdminDisplayName} (总管理员)`, reason: reason || '未用校方试用篇数回收归还总池' },
      ...prev
    ]);
    showToast(`已从【${collegeName}】回收 ${papers} 篇试用，返还至机构总池！`);
  };

  const handleReclaimMemberTrial = (memberId: string, papers: number, reason: string) => {
    if (papers <= 0) {
      showToast('回收篇数必须大于0');
      return;
    }
    const targetMember = members.find(m => m.id === memberId);
    if (!targetMember) return;
    if (papers > targetMember.availablePapers) {
      showToast(`回收数量超过成员拥有篇数！该成员当前仅剩 ${targetMember.availablePapers} 篇`);
      return;
    }
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, availablePapers: m.availablePapers - papers } : m));
    setColleges(prev => prev.map(c => c.name === targetMember.department ? { ...c, trialPapers: (c.trialPapers || 0) + papers } : c));
    const now = new Date();
    const timeStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    setTrialLogs(prev => [
      { id: `TRIAL-${Date.now().toString().slice(-4)}`, memberName: targetMember.name, memberPhone: targetMember.phone, time: timeStr, type: '额度回收', amount: papers, afterPool: trialAvailablePapers, operator: `${currentAdminDisplayName} (学院管理员)`, reason: reason || '毕业/答辩结束回收试用篇数' },
      ...prev
    ]);
    showToast(`已成功从【${targetMember.name}】账户回收 ${papers} 篇试用！`);
  };

  const handleBatchDeleteMembers = () => {
    if (selectedMemberIds.length === 0) {
      showToast('请先勾选需要清退的成员');
      return;
    }
    const count = selectedMemberIds.length;
    setMembers(prev => prev.filter(m => !selectedMemberIds.includes(m.id)));
    setSelectedMemberIds([]);
    showToast(`已成功批量清退 ${count} 位成员并注销账户！`);
  };

  // Toast feedback state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Switch between 总管理员 and 学院管理员 perspectives
  const handleSwitchToCollegeAdmin = (college: string = '计算机学院', adminNameStr: string = '张主任') => {
    setAdminLevel('学院管理员');
    setManagedCollege(college);
    setCurrentAdminDisplayName(adminNameStr);
    showToast(`已切换至【${college}管理员（${adminNameStr}）】视角！仅展示与管辖本院师生`);
  };

  const handleSwitchToSuperAdmin = () => {
    setAdminLevel('总管理员');
    setManagedCollege('全校');
    setCurrentAdminDisplayName('王老师');
    showToast('已切换回【机构总管理员（王老师）】视角！拥有全校所有院系统管与管理员任命权限');
  };

  // 1. Download Template (CSV UTF-8 with BOM)
  const handleDownloadTemplate = () => {
    const headers = '手机号,姓名,性别,所属院系,身份,初始额度(次),初始试用篇数';
    const sampleRows = [
      '13800138001,李明,男,计算机学院,学生,5,1',
      '13900138002,张丽,女,计算机学院,老师,10,2',
      '13700138003,王伟,男,经济与管理学院,学生,5,1',
      '13600138004,赵婷,女,文学院,老师,8,2',
      '13500138005,陈建华,男,电子信息学院,学生,5,1',
      '13800138006,周小敏,女,法学院,学生,5,1',
      '13900138007,孙宏伟,男,生命科学学院,老师,12,3',
    ].join('\n');
    const csvContent = '\uFEFF' + headers + '\n' + sampleRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentSchool}_全校成员名单导入模板.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`已下载《${currentSchool}_全校成员名单导入模板.csv》，请按字段填写后上传名单导入`);
  };

  // 2. Handle File Upload & Parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        showToast('上传的文件内容为空或仅包含表头');
        return;
      }

      const parsed: {
        phone: string;
        name: string;
        gender: '男' | '女';
        department: string;
        identity: '学生' | '老师';
        credits?: number;
        papers?: number;
      }[] = [];

      const startIndex = lines[0].includes('手机') || lines[0].includes('姓名') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        if (parts.length >= 2) {
          const phone = parts[0] || `138${Math.floor(10000000 + Math.random() * 90000000)}`;
          const name = parts[1] || `成员${i}`;
          const gender: '男' | '女' = parts[2] === '女' ? '女' : '男';
          const department = parts[3] || '计算机学院';
          const identity: '学生' | '老师' = (parts[4] === '老师' || parts[4] === '教师') ? '老师' : '学生';
          const credits = parts[5] && !isNaN(Number(parts[5])) ? Number(parts[5]) : 10;
          const papers = parts[6] && !isNaN(Number(parts[6])) ? Number(parts[6]) : 1;

          parsed.push({ phone, name, gender, department, identity, credits, papers });
        }
      }

      if (parsed.length === 0) {
        parsed.push(
          { phone: '13812345671', name: '王嘉尔', gender: '男', department: '计算机学院', identity: '学生', credits: 10, papers: 1 },
          { phone: '13912345672', name: '李若彤', gender: '女', department: '文学院', identity: '老师', credits: 20, papers: 2 },
          { phone: '13712345673', name: '张博文', gender: '男', department: '经济与管理学院', identity: '学生', credits: 10, papers: 1 },
        );
      }

      setImportPreviewData(parsed);
      showToast(`已成功解析 ${parsed.length} 条成员数据，可在下方表格核对与编辑后提交`);
    };
    reader.readAsText(file, 'utf-8');
  };

  // Confirm Import
  const handleConfirmImport = () => {
    if (importPreviewData.length === 0) {
      showToast('暂无待导入的成员数据');
      return;
    }

    const newMembers: TrialMemberItem[] = importPreviewData.map((item, idx) => ({
      id: `mem-import-${Date.now()}-${idx}`,
      phone: item.phone,
      name: item.name,
      gender: item.gender,
      department: item.department || '计算机学院',
      identity: item.identity,
      account: item.phone,
      password: '••••••',
      passwordStatus: '初始密码',
      joinBasis: '学校导入',
      relationStatus: '已加入',
      availableCredits: item.credits ?? 10,
      credits: item.credits ?? 10,
      availablePapers: item.papers ?? 1,
      usedPapers: 0,
      role: item.identity === '老师' ? '教师' : '学生',
      status: '正常',
      createTime: new Date().toLocaleDateString('zh-CN'),
      papersCount: 0,
    }));

    setMembers(prev => [...newMembers, ...prev]);
    showToast(`成功导入 ${newMembers.length} 名全校师生，已开通初始额度与试用，初始密码统一为 123456`);
    setShowImportModal(false);
    setImportPreviewData([]);
    setImportFileName('');
  };

  // Open Add Single Member Modal (with preset identity: 学生 or 老师)
  const handleOpenAddMemberModal = (presetIdentity: '学生' | '老师' = '学生') => {
    setAddMemberPresetIdentity(presetIdentity);
    setMemberFormData({
      name: '',
      phone: '',
      gender: '男',
      department: adminLevel === '学院管理员' ? managedCollege : '计算机学院',
      identity: presetIdentity,
    });
    setShowAddMemberModal(true);
  };

  // Add Single Member
  const handleSaveSingleMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberFormData.name.trim() || !memberFormData.phone.trim()) {
      showToast('请完整填写姓名和手机号');
      return;
    }

    const assignedDept = adminLevel === '学院管理员' ? managedCollege : memberFormData.department;

    const newMember: TrialMemberItem = {
      id: `mem-${Date.now()}`,
      phone: memberFormData.phone.trim(),
      name: memberFormData.name.trim(),
      gender: memberFormData.gender,
      department: assignedDept,
      identity: memberFormData.identity,
      account: memberFormData.phone.trim(),
      password: '••••••',
      passwordStatus: '初始密码',
      joinBasis: '手动添加',
      relationStatus: '已加入',
      availablePapers: 0,
      usedPapers: 0,
      role: memberFormData.identity,
      status: '正常',
      createTime: new Date().toLocaleDateString('zh-CN'),
      papersCount: 0,
    };

    setMembers(prev => [newMember, ...prev]);
    showToast(`已成功为【${assignedDept}】添加${newMember.identity}：${newMember.name}！`);
    setShowAddMemberModal(false);
  };

  // Edit Member Information
  const handleSaveEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    setMembers(prev => prev.map(m => {
      if (m.id === editingMember.id) {
        return {
          ...m,
          name: editingMember.name,
          phone: editingMember.phone,
          gender: editingMember.gender,
          department: editingMember.department,
          identity: editingMember.identity,
          role: editingMember.identity,
          account: editingMember.phone,
        };
      }
      return m;
    }));

    showToast(`成员【${editingMember.name}】信息更新成功！`);
    setEditingMember(null);
  };

  // Password Management: Reset to default 123456
  const handleResetPasswordDefault = () => {
    if (!passwordModalMember) return;
    setMembers(prev => prev.map(m => {
      if (m.id === passwordModalMember.id) {
        return {
          ...m,
          password: '••••••',
          passwordStatus: '已重置',
        };
      }
      return m;
    }));
    showToast(`已将【${passwordModalMember.name}】的登录密码重置为系统默认：123456`);
    setPasswordModalMember(null);
  };

  // Password Management: Set custom new password
  const handleSetCustomPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalMember) return;
    if (!customNewPassword.trim() || customNewPassword.length < 6) {
      showToast('密码长度须在6位及以上');
      return;
    }
    setMembers(prev => prev.map(m => {
      if (m.id === passwordModalMember.id) {
        return {
          ...m,
          password: '••••••',
          passwordStatus: '已重置',
        };
      }
      return m;
    }));
    showToast(`已成功为【${passwordModalMember.name}】设置新登录密码！`);
    setCustomNewPassword('');
    setPasswordModalMember(null);
  };

  // Handler for Confirm Add College
  const handleConfirmAddCollege = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = addCollegeForm.name.trim();
    if (!trimmedName) {
      showToast('请输入学院名称');
      return;
    }
    if (colleges.some(c => c.name === trimmedName)) {
      showToast(`学院【${trimmedName}】已存在，请勿重复添加`);
      return;
    }

    const newCollege: CollegeItem = {
      id: `col-${Date.now()}`,
      name: trimmedName,
      code: addCollegeForm.code.trim().toUpperCase() || `COL-${colleges.length + 1}`,
      category: addCollegeForm.category || '信息科学学部',
      description: addCollegeForm.description || '二级教研学院单位',
      createTime: new Date().toISOString().split('T')[0],
      status: '正常',
    };

    setColleges(prev => [newCollege, ...prev]);
    setShowAddCollegeModal(false);
    setAddCollegeForm({
      name: '',
      code: '',
      category: '信息科学学部',
      description: '',
      hasAdmin: false,
      adminMode: 'new',
      adminTeacherId: '',
      adminName: '',
      adminPhone: '',
      adminGender: '男',
      adminPassword: 'Edu@888888',
    });
    showToast(`学院【${trimmedName}】已成功新增！`);
  };

  // Handler for Saving Edited College
  const handleSaveEditCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollege) return;
    const newName = editingCollege.name.trim();
    if (!newName) return;

    const originalCollege = colleges.find(c => c.id === editingCollege.id);
    const oldName = originalCollege ? originalCollege.name : '';

    setColleges(prev => prev.map(c => c.id === editingCollege.id ? editingCollege : c));

    // Cascade rename in members
    if (oldName && oldName !== newName) {
      setMembers(prev => prev.map(m => {
        if (m.department === oldName) {
          return { ...m, department: newName };
        }
        return m;
      }));
      showToast(`学院已重命名为【${newName}】，并同步更新相关师生归属`);
    } else {
      showToast(`学院【${newName}】信息更新成功`);
    }
    setEditingCollege(null);
  };

  // Handler for Deleting College
  const handleDeleteCollege = (college: CollegeItem) => {
    const count = members.filter(m => m.department === college.name).length;
    if (count > 0) {
      alert(`无法删除【${college.name}】：该学院下目前仍有 ${count} 名在册师生。请先在“学员管理”中将师生迁移或移除后再删除学院。`);
      return;
    }
    if (!confirm(`确定要删除学院【${college.name}】吗？此操作不可逆。`)) {
      return;
    }
    setColleges(prev => prev.filter(c => c.id !== college.id));
    showToast(`已删除学院【${college.name}】`);
  };

  // Export Colleges Architecture CSV
  const handleExportColleges = () => {
    const headers = ['学院名称', '学院代号', '所属学部', '状态', '管理模式', '学生人数', '教师人数', '师生总数', '创建时间'];
    const rows = colleges.map(c => {
      const deptMembers = members.filter(m => m.department === c.name);
      const students = deptMembers.filter(m => m.identity === '学生').length;
      const teachers = deptMembers.filter(m => m.identity === '老师').length;
      return [
        c.name,
        c.code,
        c.category,
        c.status,
        '机构统一管理',
        students,
        teachers,
        deptMembers.length,
        c.createTime
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentSchool}_二级学院与管理员架构清单_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('已导出全校学院架构与管理员清单');
  };

  // Handle Remove Member
  const handleConfirmRemove = () => {
    if (!confirmRemoveMember) return;
    setMembers(prev => prev.filter(m => m.id !== confirmRemoveMember.id));
    showToast(`已成功将成员【${confirmRemoveMember.name}】从学校名单中移除`);
    setConfirmRemoveMember(null);
  };

  // Grant Trial Papers
  const handleConfirmGrantTrial = (e: React.FormEvent) => {
    e.preventDefault();
    const target = members.find(m => m.id === grantTargetMemberId);
    if (!target) {
      showToast('请选择发放目标成员');
      return;
    }
    if (grantAmount > trialAvailablePapers) {
      showToast(`发放篇数超过本校剩余可发放数量 (${trialAvailablePapers} 篇)`);
      return;
    }

    setMembers(prev => prev.map(m => {
      if (m.id === grantTargetMemberId) {
        return {
          ...m,
          availablePapers: m.availablePapers + grantAmount,
        };
      }
      return m;
    }));

    setTrialAvailablePapers(prev => Math.max(0, prev - grantAmount));

    const newLog: GrantLogItem = {
      id: `TRIAL-${Date.now().toString().slice(-4)}`,
      memberName: target.name,
      memberPhone: target.phone,
      time: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: '试用发放',
      amount: grantAmount,
      afterPool: trialAvailablePapers - grantAmount,
      operator: `${currentAdminDisplayName} (${adminLevel})`,
      reason: grantNotes || '校方日常试用发放',
    };
    setTrialLogs(prev => [newLog, ...prev]);

    showToast(`已向《${target.name}》成功发放 ${grantAmount} 篇试用！`);
    setShowGrantTrialModal(false);
  };

  // Apply Quota Increase for Trial
  const handleConfirmApplyTrialQuota = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(`已成功提交追加 ${applyTrialQuotaForm.papers} 篇校方试用配额申请，专员将在1个工作日内响应`);
    setShowApplyTrialQuotaModal(false);
  };

  // Department Formal Quota Allocation
  const handleConfirmAllocateDeptQuota = (e: React.FormEvent) => {
    e.preventDefault();
    setDepartmentAllocations(prev => prev.map(d => {
      if (d.department === deptAllocationForm.department) {
        return { ...d, totalQuota: d.totalQuota + deptAllocationForm.addQuota };
      }
      return d;
    }));
    showToast(`已成功为【${deptAllocationForm.department}】追加 ${deptAllocationForm.addQuota.toLocaleString()} 正式检测配额！`);
    setShowAllocateDeptQuotaModal(false);
  };

  // Filtered members list
  // Note: When adminLevel === '学院管理员', strictly scope to their managedCollege!
  const scopedMembers = adminLevel === '学院管理员' 
    ? members.filter(m => m.department === managedCollege)
    : members;

  const allDepartments = Array.from(new Set([...colleges.map(c => c.name), ...members.map(m => m.department)].filter(Boolean)));
  const collegeAdminList: TrialMemberItem[] = [];
  const teacherCandidateList = members.filter(m => m.identity === '老师');

  // Build Department Tree for tree-structured multi-select
  const departmentTreeData: TreeNode[] = [
    {
      id: 'science-engineering',
      label: '理工科学部',
      children: allDepartments
        .filter(d => d.includes('计算机') || d.includes('电子') || d.includes('工程') || d.includes('数学') || d.includes('物理') || d.includes('化学'))
        .map(d => ({
          id: d,
          label: d,
          badge: `${members.filter(m => m.department === d).length}人`,
        })),
    },
    {
      id: 'humanities-social',
      label: '人文社科学部',
      children: allDepartments
        .filter(d => d.includes('经') || d.includes('管') || d.includes('文') || d.includes('法') || d.includes('外国') || d.includes('新闻') || d.includes('哲') || d.includes('历史'))
        .map(d => ({
          id: d,
          label: d,
          badge: `${members.filter(m => m.department === d).length}人`,
        })),
    },
    {
      id: 'medical-life',
      label: '医学与生命学部',
      children: allDepartments
        .filter(d => d.includes('生') || d.includes('医') || d.includes('药') || d.includes('护理'))
        .map(d => ({
          id: d,
          label: d,
          badge: `${members.filter(m => m.department === d).length}人`,
        })),
    },
    {
      id: 'other-departments',
      label: '其他综合院系',
      children: allDepartments
        .filter(d => 
          !d.includes('计算机') && !d.includes('电子') && !d.includes('工程') && !d.includes('数学') && 
          !d.includes('经') && !d.includes('管') && !d.includes('文') && !d.includes('法') && 
          !d.includes('生') && !d.includes('医')
        )
        .map(d => ({
          id: d,
          label: d,
          badge: `${members.filter(m => m.department === d).length}人`,
        })),
    },
  ].filter(group => group.children && group.children.length > 0);

  const filteredMembers = scopedMembers.filter(m => {
    if (roleFilter !== '全部' && m.identity !== roleFilter) return false;
    if (adminLevel === '总管理员') {
      if (deptFilters.length > 0 && !deptFilters.includes(m.department)) {
        return false;
      } else if (deptFilters.length === 0 && deptFilter !== '全部' && m.department !== deptFilter) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchPhone = m.phone.includes(q);
      const matchDept = (m.department || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchDept;
    }
    return true;
  });

  return (
    <div className={embedded ? "w-full space-y-6 animate-in fade-in" : "min-h-screen bg-[#F8FAFD] text-slate-800 font-sans select-none antialiased flex flex-col"}>
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}



      {/* Main Workspace Area */}
      <div className={embedded ? "space-y-6" : "max-w-[1720px] mx-auto w-full px-4 sm:px-8 py-6 space-y-6"}>

        {/* ============================================================ */}
        {/* 栏目一：概览 (activeSection === 'dashboard')                   */}
        {/* ============================================================ */}
        {activeSection === 'dashboard' && (
          <InstitutionStatsDashboard
            adminLevel={adminLevel}
            currentSchool={currentSchool}
            managedCollege={managedCollege}
            onNavigateSection={(sec) => handleSelectSection(sec)}
            onSwitchAdminLevel={(lvl, col) => {
              if (lvl === '学院管理员') {
                handleSwitchToCollegeAdmin(col || '计算机学院');
              } else {
                handleSwitchToSuperAdmin();
              }
            }}
          />
        )}

        {/* ============================================================ */}
        {/* 栏目二：额度管理 (activeSection === 'quota')                   */}
        {/* ============================================================ */}
        {activeSection === 'quota' && (
          <div className="space-y-6 animate-in fade-in">
            {/* 额度管理子导航 */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
                <button
                  id="tab-quota-overview"
                  onClick={() => setQuotaSubTab('overview')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    quotaSubTab === 'overview'
                      ? 'bg-white text-sky-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-sky-500" />
                  <span>资产概览</span>
                </button>
                <button
                  id="tab-quota-allocate"
                  onClick={() => setQuotaSubTab('allocate')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    quotaSubTab === 'allocate'
                      ? 'bg-white text-sky-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Send className="w-3.5 h-3.5 text-sky-500" />
                  <span>分配额度与试用</span>
                </button>
                <button
                  id="tab-quota-records"
                  onClick={() => setQuotaSubTab('records')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    quotaSubTab === 'records'
                      ? 'bg-white text-sky-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>分配记录</span>
                </button>
                <button
                  id="tab-quota-flow"
                  onClick={() => setQuotaSubTab('flow')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    quotaSubTab === 'flow'
                      ? 'bg-white text-sky-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>额度流水</span>
                </button>
              </div>

              <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2.5 py-1 rounded-lg border border-sky-100 font-bold">
                  正式剩余: {(formalTotalCredits - formalUsedCredits).toLocaleString()} 次
                </span>
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100 font-bold">
                  试用剩余: {trialAvailablePapers} 篇
                </span>
              </div>
            </div>

            {/* 子栏目 1: 资产概览 */}
            {quotaSubTab === 'overview' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 text-xs font-bold">
                      <CreditCard className="w-3.5 h-3.5 text-sky-600" />
                      全校额度与试用资产总览
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      全校额度与试用资产概览
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500">
                      统一管理机构正式商业额度与试用篇数资产池。额度与试用是对每个成员直接分配，而不是对学院分配。
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <button
                      onClick={() => setQuotaSubTab('allocate')}
                      className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-sky-500/25 flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>直接给成员分配额度与试用</span>
                    </button>
                    <button
                      onClick={() => setQuotaSubTab('records')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>查看分配记录</span>
                    </button>
                  </div>
                </div>

                {/* 4 Metric Cards: Formal Credits & Trial Assets (2+2) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Formal Total Credits */}
                  <div className="bg-gradient-to-br from-sky-500 via-sky-600 to-blue-600 rounded-3xl p-5 text-white shadow-lg shadow-sky-500/20 space-y-3">
                    <div className="flex items-center justify-between text-sky-100 text-xs font-bold">
                      <span>正式检测总额度池</span>
                      <Wallet className="w-4 h-4 text-sky-200" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-2xl sm:text-3xl font-black">
                        {formalTotalCredits.toLocaleString()}{' '}
                        <span className="text-xs font-normal text-sky-100">次</span>
                      </div>
                      <div className="text-[11px] text-sky-100">
                        包含全校毕业学位论文及日常学术论文规范全检
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/20 text-[11px] text-sky-100 flex justify-between items-center">
                      <span>已分配给成员: {formalUsedCredits.toLocaleString()} 次</span>
                      <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full">学校总池</span>
                    </div>
                  </div>

                  {/* Card 2: Formal Available Credits */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                      <span>正式额度可用余额</span>
                      <Coins className="w-4 h-4 text-sky-500" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-2xl sm:text-3xl font-black text-sky-600">
                        {(formalTotalCredits - formalUsedCredits).toLocaleString()}{' '}
                        <span className="text-xs font-normal text-slate-400">次</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        池中未分配余额，随时可向全校师生分配
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center">
                      <span>可覆盖全校师生</span>
                      <span className="text-sky-600 font-bold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">随时可发</span>
                    </div>
                  </div>

                  {/* Card 3: Trial Total Limit */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                      <span>校方试用总配额</span>
                      <Sparkles className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-2xl sm:text-3xl font-black text-slate-900">
                        {trialTotalLimit}{' '}
                        <span className="text-xs font-normal text-slate-400">篇次</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        平台提供的高校学术规范专项体验名额
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center">
                      <span>已分配/消耗: {trialTotalLimit - trialAvailablePapers} 篇</span>
                      <span className="text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">官方赠送</span>
                    </div>
                  </div>

                  {/* Card 4: Trial Available Balance */}
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                      <span>机构试用池剩余</span>
                      <FileCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                        {trialAvailablePapers}{' '}
                        <span className="text-xs font-normal text-slate-400">篇</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        可随时为学生或老师分配免费试用篇数
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between items-center">
                      <span>试用按成员精准发放</span>
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">实时到账</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Banner */}
                <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50/60 p-5 rounded-3xl border border-sky-100 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">快捷分配：对每个成员分配额度和试用次数</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        额度管理支持直接向每位学生与老师分配正式检测次数与试用篇数，支持单人分配与批量勾选分配，无需对学院划拨。
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setQuotaSubTab('allocate')}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-500/20 cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>进入成员分配列表</span>
                    </button>
                    <button
                      onClick={() => setQuotaSubTab('records')}
                      className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-all"
                    >
                      查看台账记录
                    </button>
                  </div>
                </div>

                {/* Member Allocation Coverage Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
                      <span>全校成员覆盖规模</span>
                      <Users className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className="text-2xl font-black text-slate-900">{members.length} <span className="text-xs font-normal text-slate-400">人</span></div>
                    <div className="text-xs text-slate-500 flex gap-3 pt-2 border-t border-slate-100">
                      <span>学生：<strong className="text-sky-600">{members.filter(m => m.identity === '学生').length}</strong> 人</span>
                      <span>教师：<strong className="text-amber-600">{members.filter(m => m.identity === '老师').length}</strong> 人</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
                      <span>成员持有正式检测额度总计</span>
                      <Coins className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className="text-2xl font-black text-sky-600">
                      {members.reduce((acc, m) => {
                        const c = m.availableCredits ?? m.credits ?? 0;
                        return acc + (c >= 100 ? Math.floor(c / 100) : c);
                      }, 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">次可用</span>
                    </div>
                    <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                      全校师生个人账户中当前可用于论文检测的正式检测额度
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
                    <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
                      <span>成员持有试用篇数总计</span>
                      <Sparkles className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-black text-blue-600">
                      {members.reduce((acc, m) => acc + (m.availablePapers || 0), 0)} <span className="text-xs font-normal text-slate-400">篇可用</span>
                    </div>
                    <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                      累计已消耗检测 {members.reduce((acc, m) => acc + (m.usedPapers || 0), 0)} 篇试用
                    </div>
                  </div>
                </div>

                {/* Recent Member Allocations Activity (Top 5) */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <Clock className="w-4.5 h-4.5 text-sky-600" />
                        最近向成员分配额度与试用动态
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        展示最新向各学院师生直接分配额度与试用次数的流水记录
                      </p>
                    </div>

                    <button
                      onClick={() => setQuotaSubTab('records')}
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer self-start sm:self-auto flex items-center gap-1"
                    >
                      <span>查看全部记录 ({memberQuotaAllocations.length}条)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                          <th className="py-3 px-6">流水单号</th>
                          <th className="py-3 px-4">受配成员</th>
                          <th className="py-3 px-4">所属院系</th>
                          <th className="py-3 px-4">身份</th>
                          <th className="py-3 px-4">正式额度</th>
                          <th className="py-3 px-4">试用次数</th>
                          <th className="py-3 px-4">批复用途</th>
                          <th className="py-3 px-4">时间</th>
                          <th className="py-3 px-6 text-right">状态</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {memberQuotaAllocations.slice(0, 5).map(rec => (
                          <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{rec.id}</td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{rec.memberName}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{rec.memberPhone}</div>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-700">{rec.department}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                rec.role === '老师' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
                              }`}>
                                {rec.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-black text-sky-600 font-mono">
                              {rec.amount > 0 ? `+${rec.amount.toLocaleString()} 次` : '-'}
                            </td>
                            <td className="py-3.5 px-4 font-black text-blue-600 font-mono">
                              {(rec.papers || 0) > 0 ? `+${rec.papers} 篇试用` : '-'}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 text-xs">{rec.reason}</td>
                            <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">{rec.time}</td>
                            <td className="py-3.5 px-6 text-right">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-xs">
                                已生效
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 子栏目 2: 分配额度与试用 (成员列表分配与批量分配) */}
            {quotaSubTab === 'allocate' && (() => {
              // Filtering for Quota Member Table
              const filteredQuotaMembers = members.filter(m => {
                const matchesRole = roleFilter === '全部' || m.identity === roleFilter;
                const matchesSearch = !searchQuery.trim() ||
                  m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  m.phone.includes(searchQuery) ||
                  m.department.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesDept = deptFilter === '全部' || m.department === deptFilter;
                return matchesRole && matchesSearch && matchesDept;
              });

              const pageSize = 8;
              const totalPages = Math.max(1, Math.ceil(filteredQuotaMembers.length / pageSize));
              const currentPage = Math.min(quotaMemberPage, totalPages);
              const startIndex = (currentPage - 1) * pageSize;
              const paginatedQuotaMembers = filteredQuotaMembers.slice(startIndex, startIndex + pageSize);

              const allCurrentPageSelected = paginatedQuotaMembers.length > 0 &&
                paginatedQuotaMembers.every(m => selectedQuotaMemberIds.includes(m.id));

              return (
                <div className="space-y-6 animate-in fade-in">
                  {/* Quota Allocate Header */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 text-xs font-bold">
                        <Coins className="w-3.5 h-3.5 text-sky-600" />
                        对每个成员直接分配额度与试用次数
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        全校成员额度与试用分配表
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500">
                        直接向全校每个成员（学生与老师）分配正式检测额度（次）与试用次数（篇数），而不是对学院分配。支持单人精准分配或勾选批量分配。
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                      {selectedQuotaMemberIds.length > 0 && (
                        <button
                          onClick={() => setShowBatchAllocateModal(true)}
                          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-sky-500/25 flex items-center gap-2 cursor-pointer transition-all animate-in fade-in"
                        >
                          <Send className="w-4 h-4" />
                          <span>批量分配已选 ({selectedQuotaMemberIds.length}人)</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          const target = members[0];
                          if (target) {
                            setAllocateModalMember(target);
                            setAllocateModalForm({
                              credits: 10,
                              papers: 1,
                              reason: '全校开题答辩论文检测配额支持',
                            });
                            setShowAllocateMemberModal(true);
                          }
                        }}
                        className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-sky-500/20 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>新建单人分配</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center flex-wrap gap-3">
                      {/* Search */}
                      <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setQuotaMemberPage(1);
                          }}
                          placeholder="搜索姓名 / 手机号 / 学院..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                        />
                        {searchQuery && (
                          <button onClick={() => { setSearchQuery(''); setQuotaMemberPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Identity Filter */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                        <span className="text-slate-400 px-2">身份:</span>
                        {(['全部', '学生', '老师'] as const).map(role => (
                          <button
                            key={role}
                            onClick={() => {
                              setRoleFilter(role);
                              setQuotaMemberPage(1);
                            }}
                            className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                              roleFilter === role ? 'bg-white text-sky-600 shadow-xs' : 'hover:text-slate-900'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>

                      {/* Department Filter */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <span className="shrink-0 font-bold text-slate-600">院系:</span>
                        <div className="w-56 sm:w-64">
                          <TreeSelect
                            data={departmentTreeData}
                            value={deptFilters}
                            onChange={(selectedIds) => {
                              setDeptFilters(selectedIds);
                              setDeptFilter(selectedIds.length === 1 ? selectedIds[0] : '全部');
                              setQuotaMemberPage(1);
                            }}
                            placeholder="全部学院 (点击展开树状多选)"
                            className="text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                      <span>共找到 <strong className="text-slate-800">{filteredQuotaMembers.length}</strong> 位全校成员</span>
                    </div>
                  </div>

                  {/* Quota Members Table */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                          <tr>
                            <th className="py-3.5 px-4 text-center w-12">
                              <input
                                type="checkbox"
                                checked={allCurrentPageSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    const pageIds = paginatedQuotaMembers.map(m => m.id);
                                    setSelectedQuotaMemberIds(prev => Array.from(new Set([...prev, ...pageIds])));
                                  } else {
                                    const pageIds = paginatedQuotaMembers.map(m => m.id);
                                    setSelectedQuotaMemberIds(prev => prev.filter(id => !pageIds.includes(id)));
                                  }
                                }}
                                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                              />
                            </th>
                            <th className="py-3.5 px-4">成员姓名</th>
                            <th className="py-3.5 px-4">手机号 (登录账号)</th>
                            <th className="py-3.5 px-4">所属院系</th>
                            <th className="py-3.5 px-4">身份类型</th>
                            <th className="py-3.5 px-4">正式额度 (当前剩余次数)</th>
                            <th className="py-3.5 px-4">试用次数 (剩余篇数 / 已用)</th>
                            <th className="py-3.5 px-6 text-right">额度分配操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedQuotaMembers.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-400">
                                暂无符合条件的成员数据
                              </td>
                            </tr>
                          ) : (
                            paginatedQuotaMembers.map((m) => {
                              const isSelected = selectedQuotaMemberIds.includes(m.id);
                              return (
                                <tr key={m.id} className={`hover:bg-slate-50/60 transition-colors ${isSelected ? 'bg-sky-50/40' : ''}`}>
                                  {/* Checkbox */}
                                  <td className="py-4 px-4 text-center">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedQuotaMemberIds(prev => [...prev, m.id]);
                                        } else {
                                          setSelectedQuotaMemberIds(prev => prev.filter(id => id !== m.id));
                                        }
                                      }}
                                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                                    />
                                  </td>

                                  {/* Name & Avatar */}
                                  <td className="py-4 px-4 font-bold text-slate-900">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                                        m.identity === '老师' ? 'bg-amber-600' : 'bg-sky-600'
                                      }`}>
                                        {m.name[0]}
                                      </div>
                                      <div>
                                        <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                          <span>{m.name}</span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-normal">{m.createTime || '2026/08/20'} 注册</div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Phone */}
                                  <td className="py-4 px-4 font-mono font-bold text-slate-700">
                                    {m.phone}
                                  </td>

                                  {/* Department */}
                                  <td className="py-4 px-4 font-medium text-slate-800">
                                    {m.department}
                                  </td>

                                  {/* Identity */}
                                  <td className="py-4 px-4">
                                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl ${
                                      m.identity === '老师'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                                        : 'bg-sky-50 text-sky-700 border border-sky-200/80'
                                    }`}>
                                      {m.identity}
                                    </span>
                                  </td>

                                  {/* Formal Quota Times */}
                                  <td className="py-4 px-4 font-mono">
                                    <span className="font-black text-sky-600 text-sm">
                                      {((m.availableCredits ?? m.credits ?? 0) >= 100 
                                        ? Math.floor((m.availableCredits ?? m.credits ?? 0) / 100) 
                                        : (m.availableCredits ?? m.credits ?? 0)).toLocaleString()}
                                    </span>
                                    <span className="text-[11px] text-slate-400 ml-1">次</span>
                                  </td>

                                  {/* Trial Papers */}
                                  <td className="py-4 px-4">
                                    <span className="font-bold text-blue-600">{m.availablePapers} 篇</span>
                                    <span className="text-slate-400 text-xs"> / 已用 {m.usedPapers} 篇</span>
                                  </td>

                                  {/* Action: Allocate to this member */}
                                  <td className="py-4 px-6 text-right">
                                    <button
                                      onClick={() => {
                                        setAllocateModalMember(m);
                                        setAllocateModalForm({
                                          credits: 10,
                                          papers: 1,
                                          reason: '全校开题答辩论文检测专项支持',
                                        });
                                        setShowAllocateMemberModal(true);
                                      }}
                                      className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-sky-500/20 ml-auto"
                                    >
                                      <Coins className="w-3.5 h-3.5" />
                                      <span>分配额度与试用</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination for Member Quota Table */}
                    {filteredQuotaMembers.length > 0 && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                        <div>
                          显示第 <strong className="text-slate-800">{startIndex + 1}</strong> 到{' '}
                          <strong className="text-slate-800">{Math.min(startIndex + pageSize, filteredQuotaMembers.length)}</strong> 条，
                          共 <strong className="text-slate-800">{filteredQuotaMembers.length}</strong> 位成员
                          <span className="ml-2 text-slate-400">(第 {currentPage} / {totalPages} 页，每页 {pageSize} 条)</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setQuotaMemberPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1 ${
                              currentPage === 1
                                ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 cursor-pointer shadow-2xs'
                            }`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>上一页</span>
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => setQuotaMemberPage(p)}
                              className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                                currentPage === p
                                  ? 'bg-sky-500 text-white shadow-xs'
                                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                              }`}
                            >
                              {p}
                            </button>
                          ))}

                          <button
                            onClick={() => setQuotaMemberPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1 ${
                              currentPage === totalPages
                                ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 cursor-pointer shadow-2xs'
                            }`}
                          >
                            <span>下一页</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 子栏目 3: 分配记录 (支持筛选 全部 / 正式额度 / 试用篇数，多页分页) */}
            {quotaSubTab === 'records' && (() => {
              const filteredRecords = memberQuotaAllocations.filter(rec => {
                if (quotaRecordFilter === '正式额度') return rec.amount > 0;
                if (quotaRecordFilter === '试用篇数') return (rec.papers || 0) > 0;
                return true;
              });

              const recPageSize = 7;
              const recTotalPages = Math.max(1, Math.ceil(filteredRecords.length / recPageSize));
              const recCurrentPage = Math.min(recordsPage, recTotalPages);
              const recStartIndex = (recCurrentPage - 1) * recPageSize;
              const paginatedRecords = filteredRecords.slice(recStartIndex, recStartIndex + recPageSize);

              return (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                          <FileSpreadsheet className="w-5 h-5 text-sky-600" />
                          成员额度与试用分配台账明细
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          记录向全校学生与老师个人分配额度与试用次数的明细记录，对每个成员精准追溯
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Filter pills */}
                        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-xs">
                          {(['全部', '正式额度', '试用篇数'] as const).map(f => (
                            <button
                              key={f}
                              type="button"
                              onClick={() => {
                                setQuotaRecordFilter(f);
                                setRecordsPage(1);
                              }}
                              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                quotaRecordFilter === f
                                  ? 'bg-white text-sky-600 shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setQuotaSubTab('allocate')}
                          className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>新建分配</span>
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                          <tr>
                            <th className="py-3.5 px-6">流水单号</th>
                            <th className="py-3.5 px-4">受配成员</th>
                            <th className="py-3.5 px-4">所属院系</th>
                            <th className="py-3.5 px-4">身份</th>
                            <th className="py-3.5 px-4">划拨正式额度</th>
                            <th className="py-3.5 px-4">赠送试用次数</th>
                            <th className="py-3.5 px-4">批复说明 / 用途</th>
                            <th className="py-3.5 px-4">经办人</th>
                            <th className="py-3.5 px-4">分配时间</th>
                            <th className="py-3.5 px-6 text-right">状态</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {paginatedRecords.length === 0 ? (
                            <tr>
                              <td colSpan={10} className="py-12 text-center text-slate-400">
                                暂无符合条件的分配记录
                              </td>
                            </tr>
                          ) : (
                            paginatedRecords.map(rec => (
                              <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{rec.id}</td>
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-slate-900">{rec.memberName}</div>
                                  <div className="text-[11px] text-slate-400 font-mono">{rec.memberPhone}</div>
                                </td>
                                <td className="py-3.5 px-4 font-medium text-slate-700">{rec.department}</td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                    rec.role === '老师' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
                                  }`}>
                                    {rec.role}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-black text-sky-600 font-mono">
                                  {rec.amount > 0 ? `+${rec.amount.toLocaleString()} 次` : '-'}
                                </td>
                                <td className="py-3.5 px-4 font-black text-blue-600 font-mono">
                                  {(rec.papers || 0) > 0 ? `+${rec.papers} 篇试用` : '-'}
                                </td>
                                <td className="py-3.5 px-4 text-slate-600">{rec.reason}</td>
                                <td className="py-3.5 px-4 text-slate-500">{rec.operator}</td>
                                <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">{rec.time}</td>
                                <td className="py-3.5 px-6 text-right">
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-xs">
                                    已生效
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination for Records Table */}
                    {filteredRecords.length > 0 && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                        <div>
                          显示第 <strong className="text-slate-800">{recStartIndex + 1}</strong> 到{' '}
                          <strong className="text-slate-800">{Math.min(recStartIndex + recPageSize, filteredRecords.length)}</strong> 条，
                          共 <strong className="text-slate-800">{filteredRecords.length}</strong> 条记录
                          <span className="ml-2 text-slate-400">(第 {recCurrentPage} / {recTotalPages} 页)</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setRecordsPage(prev => Math.max(1, prev - 1))}
                            disabled={recCurrentPage === 1}
                            className={`px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1 ${
                              recCurrentPage === 1
                                ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 cursor-pointer shadow-2xs'
                            }`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>上一页</span>
                          </button>

                          {Array.from({ length: recTotalPages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => setRecordsPage(p)}
                              className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                                recCurrentPage === p
                                  ? 'bg-sky-500 text-white shadow-xs'
                                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                              }`}
                            >
                              {p}
                            </button>
                          ))}

                          <button
                            onClick={() => setRecordsPage(prev => Math.min(recTotalPages, prev + 1))}
                            disabled={recCurrentPage === recTotalPages}
                            className={`px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1 ${
                              recCurrentPage === recTotalPages
                                ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 cursor-pointer shadow-2xs'
                            }`}
                          >
                            <span>下一页</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* 子栏目 4: 额度流水 */}
            {quotaSubTab === 'flow' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <Clock className="w-5 h-5 text-sky-600" />
                        额度资产全量收支流水账本
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">记录全校资产划拨与成员检测消耗的每一笔变动审计</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                          <th className="py-3 px-6">流水号</th>
                          <th className="py-3 px-4">交易时间</th>
                          <th className="py-3 px-4">业务类型</th>
                          <th className="py-3 px-4">出账源 / 入账目标</th>
                          <th className="py-3 px-4">变动额度</th>
                          <th className="py-3 px-4">变动后余额</th>
                          <th className="py-3 px-4">操作人</th>
                          <th className="py-3 px-6">说明</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {quotaFlowLogs.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/70">
                            <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{item.id}</td>
                            <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">{item.time}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                item.type === '机构充值' ? 'bg-sky-100 text-sky-700' :
                                item.type === '成员划拨' ? 'bg-sky-50 text-sky-600' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {item.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-medium">
                              {item.source} → {item.target}
                            </td>
                            <td className={`py-3.5 px-4 font-black ${
                              item.change.startsWith('+') ? 'text-sky-600' : 'text-slate-900'
                            }`}>
                              {item.change}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-700">{item.balanceAfter.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-slate-600">{item.operator}</td>
                            <td className="py-3.5 px-6 text-slate-500">{item.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* （试用管理已合并至“额度管理”栏目中统一分配管理） */}

        {/* ============================================================ */}
        {/* 栏目四：学员管理 (activeSection === 'members')                 */}
        {/* ============================================================ */}
        {activeSection === 'members' && (() => {
          const memberPageSize = 8;
          const memberTotalPages = Math.max(1, Math.ceil(filteredMembers.length / memberPageSize));
          const currentMemberPage = Math.min(memberPage, memberTotalPages);
          const memberStartIndex = (currentMemberPage - 1) * memberPageSize;
          const paginatedMembers = filteredMembers.slice(memberStartIndex, memberStartIndex + memberPageSize);

          return (
            <div className="space-y-6 animate-in fade-in">
              {/* Header Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100 text-xs font-bold">
                    <Users className="w-3.5 h-3.5 text-sky-600" />
                    全校在册成员管理（管理学校的所有成员）
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    学员管理（管理学校的所有成员）
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    专门管理全校学生与老师的个人档案、登录账号、密码及账号使用状态。额度与试用次数请前往【额度管理】统一分配。
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center flex-wrap gap-2.5 self-start sm:self-auto">
                  {/* Download Template */}
                  <button
                    id="btn-download-member-template"
                    onClick={handleDownloadTemplate}
                    className="bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shadow-2xs hover:bg-slate-50"
                    title="统一下载包含手机号、姓名、性别、所属院系、身份的标准CSV模板"
                  >
                    <Download className="w-4 h-4 text-sky-600" />
                    <span>下载导入模板</span>
                  </button>

                  {/* Upload Import */}
                  <button
                    id="btn-upload-member-file"
                    onClick={() => setShowImportModal(true)}
                    className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all"
                    title="上传已填写的表格批量导入全校师生名单"
                  >
                    <Upload className="w-4 h-4 text-sky-600" />
                    <span>上传名单导入</span>
                  </button>

                  {/* Add Member */}
                  <button
                    id="btn-add-single-member"
                    onClick={() => handleOpenAddMemberModal('学生')}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-sky-500/20 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>添加学员</span>
                  </button>

                  {/* Batch Delete (放到右上角“添加学员”右边) */}
                  <button
                    id="btn-batch-delete-members"
                    onClick={handleBatchDeleteMembers}
                    className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shadow-2xs ${
                      selectedMemberIds.length > 0
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
                        : 'bg-white hover:bg-red-50 text-red-600 border border-red-200'
                    }`}
                    title={selectedMemberIds.length > 0 ? `批量清退已勾选的 ${selectedMemberIds.length} 位学员` : '批量删除学员（请先在列表中勾选成员）'}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>批量删除{selectedMemberIds.length > 0 ? ` (${selectedMemberIds.length})` : ''}</span>
                  </button>
                </div>
              </div>

              {/* Members Table View */}
              <div className="space-y-6">
                {/* Filter & Search Bar */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center flex-wrap gap-3">
                    {/* Search */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setMemberPage(1);
                        }}
                        placeholder="搜索姓名 / 手机号 / 学院..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                      {searchQuery && (
                        <button onClick={() => { setSearchQuery(''); setMemberPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Identity Filter (Only 全部 / 学生 / 老师) */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
                      <span className="text-slate-400 px-2">身份:</span>
                      {(['全部', '学生', '老师'] as const).map(role => (
                        <button
                          key={role}
                          onClick={() => {
                            setRoleFilter(role);
                            setMemberPage(1);
                          }}
                          className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                            roleFilter === role ? 'bg-white text-sky-600 shadow-xs' : 'hover:text-slate-900'
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>

                    {/* Department Filter (Tree Structure Multi-Select) */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <span className="shrink-0 font-bold text-slate-600">院系筛选:</span>
                      <div className="w-56 sm:w-64">
                        <TreeSelect
                          data={departmentTreeData}
                          value={deptFilters}
                          onChange={(selectedIds) => {
                            setDeptFilters(selectedIds);
                            setDeptFilter(selectedIds.length === 1 ? selectedIds[0] : '全部');
                            setMemberPage(1);
                          }}
                          placeholder="全部学院 (点击展开树状多选)"
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                    <span>共找到 <strong className="text-slate-800">{filteredMembers.length}</strong> 位在册成员</span>
                  </div>
                </div>

                {/* Members Table */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-100">
                        <tr>
                          <th className="py-3.5 px-4 text-center w-12">
                            <input
                              type="checkbox"
                              checked={paginatedMembers.length > 0 && paginatedMembers.every(m => selectedMemberIds.includes(m.id))}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const pageIds = paginatedMembers.map(m => m.id);
                                  setSelectedMemberIds(prev => Array.from(new Set([...prev, ...pageIds])));
                                } else {
                                  const pageIds = paginatedMembers.map(m => m.id);
                                  setSelectedMemberIds(prev => prev.filter(id => !pageIds.includes(id)));
                                }
                              }}
                              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                            />
                          </th>
                          <th className="py-3.5 px-4">姓名</th>
                          <th className="py-3.5 px-4">手机号 (登录账号)</th>
                          <th className="py-3.5 px-4">登录密码</th>
                          <th className="py-3.5 px-4">性别</th>
                          <th className="py-3.5 px-4">所属院系</th>
                          <th className="py-3.5 px-4">身份类型</th>
                          <th className="py-3.5 px-4">账号状态</th>
                          <th className="py-3.5 px-4">加入时间</th>
                          <th className="py-3.5 px-6 text-right">基础信息操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {paginatedMembers.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-12 text-center text-slate-400">
                              暂无符合条件的成员数据，您可以点击右上角“下载导入模板”并“上传名单导入”，或点击“添加成员”
                            </td>
                          </tr>
                        ) : (
                          paginatedMembers.map((m) => {
                            const isSelected = selectedMemberIds.includes(m.id);
                            return (
                              <tr key={m.id} className={`hover:bg-slate-50/60 transition-colors ${isSelected ? 'bg-sky-50/30' : ''}`}>
                                {/* Checkbox */}
                                <td className="py-4 px-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedMemberIds(prev => [...prev, m.id]);
                                      } else {
                                        setSelectedMemberIds(prev => prev.filter(id => id !== m.id));
                                      }
                                    }}
                                    className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                                  />
                                </td>

                                {/* Name & Avatar */}
                                <td className="py-4 px-4 font-bold text-slate-900">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                                      m.identity === '老师' ? 'bg-amber-600' : 'bg-sky-600'
                                    }`}>
                                      {m.name[0]}
                                    </div>
                                    <div>
                                      <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                        <span>{m.name}</span>
                                      </div>
                                      <div className="text-[10px] text-slate-400 font-mono">{m.email || `${m.phone}@whu.edu.cn`}</div>
                                    </div>
                                  </div>
                                </td>

                                {/* Phone / Account */}
                                <td className="py-4 px-4 font-mono font-bold text-slate-700">
                                  {m.phone}
                                </td>

                                {/* Password Status */}
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-xs">
                                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="font-mono text-slate-500">••••••</span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setPasswordModalMember(m);
                                        setCustomNewPassword('');
                                      }}
                                      className="text-[11px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 cursor-pointer transition-colors font-bold"
                                    >
                                      重置密码
                                    </button>
                                  </div>
                                </td>

                                {/* Gender */}
                                <td className="py-4 px-4 text-slate-600 font-medium">
                                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                                    m.gender === '女' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                                  }`}>
                                    {m.gender || '男'}
                                  </span>
                                </td>

                                {/* Department */}
                                <td className="py-4 px-4 font-medium text-slate-800">
                                  {m.department || '计算机学院'}
                                </td>

                                {/* Identity */}
                                <td className="py-4 px-4">
                                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-xl ${
                                    m.identity === '老师' ? 'bg-amber-50 text-amber-700 border border-amber-200/80' : 
                                    'bg-sky-50 text-sky-700 border border-sky-200/80'
                                  }`}>
                                    {m.identity || '学生'}
                                  </span>
                                </td>

                                {/* Account Status Toggle */}
                                <td className="py-4 px-4">
                                  <button
                                    onClick={() => {
                                      const nextStatus = m.status === '禁用' ? '正常' : '禁用';
                                      setMembers(prev => prev.map(item => item.id === m.id ? { ...item, status: nextStatus } : item));
                                      showToast(`已将【${m.name}】账号状态设为：${nextStatus}`);
                                    }}
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                      m.status === '禁用'
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                    }`}
                                  >
                                    {m.status || '正常'}
                                  </button>
                                </td>

                                {/* Join Date */}
                                <td className="py-4 px-4 text-slate-400 font-mono text-xs">
                                  {m.createTime || '2026/08/20'}
                                </td>

                                {/* Action Buttons: Edit, Password, Remove */}
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* 1. Edit Member Info */}
                                    <button
                                      onClick={() => setEditingMember(m)}
                                      className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                                      title="编辑基本信息（手机号、姓名、性别、院系、身份）"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>

                                    {/* 2. Password Management */}
                                    <button
                                      onClick={() => {
                                        setPasswordModalMember(m);
                                        setCustomNewPassword('');
                                      }}
                                      className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                      title="管理账号密码 / 一键重置密码"
                                    >
                                      <KeyRound className="w-4 h-4" />
                                    </button>

                                    {/* 3. Remove Member */}
                                    <button
                                      onClick={() => setConfirmRemoveMember({ id: m.id, name: m.name })}
                                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="从全校名单中移除该成员"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination for Member Management */}
                  {filteredMembers.length > 0 && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                      <div>
                        显示第 <strong className="text-slate-800">{memberStartIndex + 1}</strong> 到{' '}
                        <strong className="text-slate-800">{Math.min(memberStartIndex + memberPageSize, filteredMembers.length)}</strong> 条，
                        共 <strong className="text-slate-800">{filteredMembers.length}</strong> 位在册成员
                        <span className="ml-2 text-slate-400">(第 {currentMemberPage} / {memberTotalPages} 页，每页 {memberPageSize} 条)</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setMemberPage(prev => Math.max(1, prev - 1))}
                          disabled={currentMemberPage === 1}
                          className={`px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1 ${
                            currentMemberPage === 1
                              ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 cursor-pointer shadow-2xs'
                          }`}
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>上一页</span>
                        </button>

                        {Array.from({ length: memberTotalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setMemberPage(p)}
                            className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                              currentMemberPage === p
                                ? 'bg-sky-500 text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                          >
                            {p}
                          </button>
                        ))}

                        <button
                          onClick={() => setMemberPage(prev => Math.min(memberTotalPages, prev + 1))}
                          disabled={currentMemberPage === memberTotalPages}
                          className={`px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1 ${
                            currentMemberPage === memberTotalPages
                              ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 cursor-pointer shadow-2xs'
                          }`}
                        >
                          <span>下一页</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}


        {/* （学院管理员专门维护已按要求移除，由机构账号直接统一管理全校师生成员与额度） */}
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: Upload and Import Members                           */}
      {/* ============================================================ */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {adminLevel === '学院管理员' ? `批量上传导入【${managedCollege}】师生名单` : '批量上传导入学校成员名单'}
                  </h3>
                  <p className="text-xs text-slate-400">支持 CSV / Excel 包含：手机号、姓名、性别、学院、身份类型</p>
                </div>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Download Template reminder */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-indigo-950">步骤一：下载官方导入规范模板</div>
                <div className="text-[11px] text-indigo-700">模板标准列：手机号、姓名、性别（男/女）、学院、身份（学生/老师）</div>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                下载模板.csv
              </button>
            </div>

            {/* Step 2: Upload File Drag & Drop */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">步骤二：选择已填写的表格文件上传</label>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv, .xlsx, .xls, .txt"
                onChange={handleFileChange}
                className="hidden"
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-indigo-50/20"
              >
                <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-800">
                  {importFileName ? `已选择文件：${importFileName}` : '点击选择或拖拽模板文件至此处'}
                </div>
                <div className="text-xs text-slate-400 mt-1">支持 .csv, .xlsx, .txt 格式编码 UTF-8</div>
              </div>
            </div>

            {/* Step 3: Editable Preview Table */}
            {importPreviewData.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800">
                    步骤三：数据解析预览（共 {importPreviewData.length} 条，可直接点击单元格修改）
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">手机号</th>
                        <th className="py-2.5 px-3">姓名</th>
                        <th className="py-2.5 px-3">性别</th>
                        <th className="py-2.5 px-3">学院</th>
                        <th className="py-2.5 px-3">身份</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {importPreviewData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.phone}
                              onChange={(e) => {
                                const val = e.target.value;
                                setImportPreviewData(prev => prev.map((r, i) => i === idx ? { ...r, phone: val } : r));
                              }}
                              className="w-28 bg-transparent border-b border-transparent hover:border-indigo-400 focus:border-indigo-600 focus:outline-none font-mono"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={row.name}
                              onChange={(e) => {
                                const val = e.target.value;
                                setImportPreviewData(prev => prev.map((r, i) => i === idx ? { ...r, name: val } : r));
                              }}
                              className="w-20 bg-transparent border-b border-transparent hover:border-indigo-400 focus:border-indigo-600 focus:outline-none font-bold text-slate-900"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={row.gender}
                              onChange={(e) => {
                                const val = e.target.value as '男' | '女';
                                setImportPreviewData(prev => prev.map((r, i) => i === idx ? { ...r, gender: val } : r));
                              }}
                              className="bg-transparent border-b border-transparent hover:border-indigo-400 focus:outline-none"
                            >
                              <option value="男">男</option>
                              <option value="女">女</option>
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              disabled={adminLevel === '学院管理员'}
                              value={adminLevel === '学院管理员' ? managedCollege : row.department}
                              onChange={(e) => {
                                const val = e.target.value;
                                setImportPreviewData(prev => prev.map((r, i) => i === idx ? { ...r, department: val } : r));
                              }}
                              className="w-28 bg-transparent border-b border-transparent hover:border-indigo-400 focus:border-indigo-600 focus:outline-none disabled:text-slate-400"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={row.identity}
                              onChange={(e) => {
                                const val = e.target.value as '学生' | '老师';
                                setImportPreviewData(prev => prev.map((r, i) => i === idx ? { ...r, identity: val } : r));
                              }}
                              className="bg-transparent border-b border-transparent hover:border-indigo-400 focus:outline-none font-bold text-indigo-600"
                            >
                              <option value="学生">学生</option>
                              <option value="老师">老师</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importPreviewData.length === 0}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
              >
                确认导入 ({importPreviewData.length}人)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: Add Single Member (支持分别添加学生或老师)            */}
      {/* ============================================================ */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    {adminLevel === '学院管理员' 
                      ? `为【${managedCollege}】添加${memberFormData.identity}` 
                      : `添加成员（${memberFormData.identity}）`}
                  </h3>
                  <p className="text-xs text-slate-400">录入基本信息并生成登录账号</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSingleMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">手机号 (登录账号) *</label>
                <input
                  type="text"
                  required
                  placeholder="如 13800138000"
                  value={memberFormData.phone}
                  onChange={(e) => setMemberFormData({ ...memberFormData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">成员姓名 *</label>
                <input
                  type="text"
                  required
                  placeholder="如 李明"
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">性别 *</label>
                  <select
                    value={memberFormData.gender}
                    onChange={(e) => setMemberFormData({ ...memberFormData, gender: e.target.value as '男' | '女' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-bold"
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">身份类型 *</label>
                  <select
                    value={memberFormData.identity}
                    onChange={(e) => setMemberFormData({ ...memberFormData, identity: e.target.value as '学生' | '老师' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-bold text-indigo-600"
                  >
                    <option value="学生">学生</option>
                    <option value="老师">老师</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">所属学院 *</label>
                {adminLevel === '学院管理员' ? (
                  <input
                    type="text"
                    disabled
                    value={managedCollege}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-600"
                  />
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="如 计算机学院"
                    value={memberFormData.department}
                    onChange={(e) => setMemberFormData({ ...memberFormData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none"
                  />
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500">
                💡 添加后该成员默认初始登录密码为：<strong className="text-slate-800 font-mono">123456</strong>，管理员可在管理表格中随时重置。
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: Edit Member Information                             */}
      {/* ============================================================ */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">编辑成员信息</h3>
                  <p className="text-xs text-slate-400">修改手机号、姓名、性别、学院及身份</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">手机号 (登录账号) *</label>
                <input
                  type="text"
                  required
                  value={editingMember.phone}
                  onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">成员姓名 *</label>
                <input
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">性别 *</label>
                  <select
                    value={editingMember.gender || '男'}
                    onChange={(e) => setEditingMember({ ...editingMember, gender: e.target.value as '男' | '女' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-bold"
                  >
                    <option value="男">男</option>
                    <option value="女">女</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">身份 *</label>
                  <select
                    value={editingMember.identity || '学生'}
                    onChange={(e) => setEditingMember({ ...editingMember, identity: e.target.value as '学生' | '老师' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-bold text-sky-600"
                  >
                    <option value="学生">学生</option>
                    <option value="老师">老师</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">所属学院 *</label>
                <input
                  type="text"
                  required
                  disabled={adminLevel === '学院管理员'}
                  value={editingMember.department}
                  onChange={(e) => setEditingMember({ ...editingMember, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: Allocate Quota and Trial Papers to Member           */}
      {/* ============================================================ */}
      {showAllocateMemberModal && allocateModalMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    分配额度与试用次数
                  </h3>
                  <p className="text-xs text-slate-400">
                    为成员【{allocateModalMember.name}】分配正式点数与免费试用篇数
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowAllocateMemberModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Member Info Card */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">成员信息：</span>
                <span className="font-extrabold text-slate-900">
                  {allocateModalMember.name} ({allocateModalMember.identity} · {allocateModalMember.department})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">登录账号 (手机)：</span>
                <span className="font-mono font-bold text-slate-700">{allocateModalMember.phone}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-sky-100">
                <span className="text-slate-500">当前持有资产：</span>
                <span className="font-bold text-sky-700">
                  正式额度 {((allocateModalMember.availableCredits ?? allocateModalMember.credits ?? 0) >= 100 ? Math.floor((allocateModalMember.availableCredits ?? allocateModalMember.credits ?? 0) / 100) : (allocateModalMember.availableCredits ?? allocateModalMember.credits ?? 0))} 次 / 试用 {allocateModalMember.availablePapers} 篇
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmAllocateModal} className="space-y-4">
              {/* 1. Add Credits (Times) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">分配正式检测额度 (次)</label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    机构总池剩余: {(formalTotalCredits - formalUsedCredits).toLocaleString()} 次
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={allocateModalForm.credits}
                  onChange={(e) => setAllocateModalForm({ ...allocateModalForm, credits: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-black text-sky-600 focus:bg-white focus:outline-none focus:border-sky-500 font-mono"
                  placeholder="0 表示不分配正式额度次数"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[0, 5, 10, 20, 50, 100].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAllocateModalForm(prev => ({ ...prev, credits: amt }))}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        allocateModalForm.credits === amt
                          ? 'bg-sky-50 text-sky-700 border-sky-300 font-black'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {amt === 0 ? '不分配' : `+${amt} 次`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Add Trial Papers */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">分配试用次数 (篇数)</label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    机构试用池剩余: {trialAvailablePapers} 篇
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={allocateModalForm.papers}
                  onChange={(e) => setAllocateModalForm({ ...allocateModalForm, papers: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-black text-sky-600 focus:bg-white focus:outline-none focus:border-sky-500 font-mono"
                  placeholder="0 表示不分配试用篇数"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[0, 1, 2, 3, 5].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setAllocateModalForm(prev => ({ ...prev, papers: cnt }))}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        allocateModalForm.papers === cnt
                          ? 'bg-sky-50 text-sky-700 border-sky-300 font-black'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cnt === 0 ? '不分配' : `+${cnt} 篇`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">批复事由与用途说明</label>
                <input
                  type="text"
                  value={allocateModalForm.reason}
                  onChange={(e) => setAllocateModalForm({ ...allocateModalForm, reason: e.target.value })}
                  placeholder="如: 开题答辩论文检测专项支持 / 优秀导师送检示范"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Preview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">分配后资产预计到账:</div>
                <div className="flex justify-between">
                  <span>成员正式额度将达到:</span>
                  <strong className="text-sky-600 font-mono">
                    {(((allocateModalMember.availableCredits ?? allocateModalMember.credits ?? 0) >= 100 ? Math.floor((allocateModalMember.availableCredits ?? allocateModalMember.credits ?? 0) / 100) : (allocateModalMember.availableCredits ?? allocateModalMember.credits ?? 0)) + (Number(allocateModalForm.credits) || 0)).toLocaleString()} 次
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>成员试用篇数将达到:</span>
                  <strong className="text-sky-600 font-mono">
                    {allocateModalMember.availablePapers + (Number(allocateModalForm.papers) || 0)} 篇
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAllocateMemberModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/25 cursor-pointer transition-all"
                >
                  确认立即分配
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4.5: Batch Allocate Quota & Trials to Selected Members */}
      {/* ============================================================ */}
      {showBatchAllocateModal && selectedQuotaMemberIds.length > 0 && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    批量分配额度与试用次数
                  </h3>
                  <p className="text-xs text-slate-400">
                    已选定 <strong className="text-sky-600 font-bold">{selectedQuotaMemberIds.length}</strong> 位全校成员统一配额
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowBatchAllocateModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected members list chip preview */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-slate-700 flex justify-between">
                <span>受配成员列表预览：</span>
                <span className="text-sky-600">共 {selectedQuotaMemberIds.length} 人</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                {members.filter(m => selectedQuotaMemberIds.includes(m.id)).map(m => (
                  <span key={m.id} className="text-[11px] px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                    {m.name} ({m.department})
                  </span>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBatchAllocateMembers(
                  Number(batchAllocateForm.credits) || 0,
                  Number(batchAllocateForm.papers) || 0,
                  batchAllocateForm.reason
                );
              }}
              className="space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">每人分配正式检测额度 (次)</label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    总需: {((Number(batchAllocateForm.credits) || 0) * selectedQuotaMemberIds.length).toLocaleString()} 次
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={batchAllocateForm.credits}
                  onChange={(e) => setBatchAllocateForm({ ...batchAllocateForm, credits: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-black text-sky-600 focus:bg-white focus:outline-none focus:border-sky-500 font-mono"
                  placeholder="0 表示不分配检测额度次数"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[0, 5, 10, 20, 50].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBatchAllocateForm(prev => ({ ...prev, credits: amt }))}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        batchAllocateForm.credits === amt
                          ? 'bg-sky-50 text-sky-700 border-sky-300 font-black'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {amt === 0 ? '不分配' : `每人 +${amt} 次`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">每人分配试用次数 (篇数)</label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    总需: {((Number(batchAllocateForm.papers) || 0) * selectedQuotaMemberIds.length)} 篇
                  </span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={batchAllocateForm.papers}
                  onChange={(e) => setBatchAllocateForm({ ...batchAllocateForm, papers: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-black text-blue-600 focus:bg-white focus:outline-none focus:border-sky-500 font-mono"
                  placeholder="0 表示不分配试用"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[0, 1, 2, 3, 5].map(cnt => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setBatchAllocateForm(prev => ({ ...prev, papers: cnt }))}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        batchAllocateForm.papers === cnt
                          ? 'bg-blue-50 text-blue-700 border-blue-300 font-black'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cnt === 0 ? '不分配' : `每人 +${cnt} 篇`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">分配事由说明 / 批复备注</label>
                <input
                  type="text"
                  value={batchAllocateForm.reason}
                  onChange={(e) => setBatchAllocateForm({ ...batchAllocateForm, reason: e.target.value })}
                  placeholder="如: 全校集中毕业论文检测开题支持"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBatchAllocateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/25 cursor-pointer transition-all"
                >
                  确认批量划拨到 {selectedQuotaMemberIds.length} 位成员
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 5: Password Management & Reset                         */}
      {/* ============================================================ */}
      {passwordModalMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">账号与密码管理</h3>
                  <p className="text-xs text-slate-400">成员：{passwordModalMember.name}（{passwordModalMember.department}）</p>
                </div>
              </div>
              <button 
                onClick={() => setPasswordModalMember(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Account Details */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">登录账号：</span>
                <span className="font-bold text-slate-900 font-mono">{passwordModalMember.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">身份属性：</span>
                <span className="font-bold text-slate-900">{passwordModalMember.identity} ({passwordModalMember.department})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">当前密码状态：</span>
                <span className="font-bold text-amber-600">{passwordModalMember.passwordStatus || '已设置'}</span>
              </div>
            </div>

            {/* Action 1: One-click Reset to Default */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="text-xs font-bold text-amber-900">选项一：一键重置为系统默认密码</div>
              <p className="text-[11px] text-amber-800">
                将该成员的登录密码重置为系统默认密码 <strong className="font-mono font-black text-slate-900">123456</strong>。成员下次登录后可自行在个人中心修改。
              </p>
              <button
                type="button"
                onClick={handleResetPasswordDefault}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>立即重置为默认密码 (123456)</span>
              </button>
            </div>

            {/* Action 2: Set Custom Password */}
            <form onSubmit={handleSetCustomPassword} className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-800">选项二：手动设置自定义新密码</div>
              <input
                type="text"
                placeholder="输入6位以上新密码..."
                value={customNewPassword}
                onChange={(e) => setCustomNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none font-mono"
              />
              <button
                type="submit"
                disabled={!customNewPassword.trim()}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                保存自定义新密码
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 6: Grant Trial Papers                                  */}
      {/* ============================================================ */}
      {showGrantTrialModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">发放校方试用篇数</h3>
                  <p className="text-xs text-slate-400">本校剩余可用试用：{trialAvailablePapers} 篇</p>
                </div>
              </div>
              <button 
                onClick={() => setShowGrantTrialModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmGrantTrial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">选择受赠成员 *</label>
                <select
                  value={grantTargetMemberId}
                  onChange={(e) => setGrantTargetMemberId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-bold"
                >
                  {scopedMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone}) · {m.department} · 当前试用: {m.availablePapers}篇
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">本次发放试用篇数 *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map(num => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setGrantAmount(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        grantAmount === num
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {num} 篇
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">发放事由 / 备注</label>
                <input
                  type="text"
                  value={grantNotes}
                  onChange={(e) => setGrantNotes(e.target.value)}
                  placeholder="如：2026年开题答辩专项试用"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowGrantTrialModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  确认发放
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 7: Apply Increase Trial Quota                          */}
      {/* ============================================================ */}
      {showApplyTrialQuotaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">申请追加校方试用配额</h3>
                  <p className="text-xs text-slate-400">向平台提交新学年/开题答辩试用立项审批</p>
                </div>
              </div>
              <button 
                onClick={() => setShowApplyTrialQuotaModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmApplyTrialQuota} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">拟追加试用篇数 *</label>
                <div className="flex items-center gap-2">
                  {[20, 30, 50].map(cnt => (
                    <button
                      type="button"
                      key={cnt}
                      onClick={() => setApplyTrialQuotaForm({ ...applyTrialQuotaForm, papers: cnt })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        applyTrialQuotaForm.papers === cnt
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      +{cnt} 篇
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">申请原由说明 *</label>
                <textarea
                  rows={3}
                  required
                  value={applyTrialQuotaForm.reason}
                  onChange={(e) => setApplyTrialQuotaForm({ ...applyTrialQuotaForm, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowApplyTrialQuotaModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  提交审批
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 8: Allocate Department Quota                           */}
      {/* ============================================================ */}
      {showAllocateDeptQuotaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">划拨二级学院正式额度</h3>
                  <p className="text-xs text-slate-400">从学校正式配额总包调配</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAllocateDeptQuotaModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAllocateDeptQuota} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">目标学院 *</label>
                <select
                  value={deptAllocationForm.department}
                  onChange={(e) => setDeptAllocationForm({ ...deptAllocationForm, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-bold"
                >
                  {departmentAllocations.map(d => (
                    <option key={d.department} value={d.department}>
                      {d.department} (当前总额度: {d.totalQuota.toLocaleString()}分)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">本次划拨点数 *</label>
                <div className="flex items-center gap-2">
                  {[5000, 10000, 20000].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setDeptAllocationForm({ ...deptAllocationForm, addQuota: val })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        deptAllocationForm.addQuota === val
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      +{val.toLocaleString()}分
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAllocateDeptQuotaModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  确认划拨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 9: Confirm Remove Member                               */}
      {/* ============================================================ */}
      {confirmRemoveMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">确认移除该成员？</h3>
              <p className="text-xs text-slate-500 mt-1">
                即将把【{confirmRemoveMember.name}】移出在册名单。移除后若该成员有名下未使用的试用篇数，将自动回收归还至本校试用公共池。
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmRemoveMember(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 cursor-pointer"
              >
                确认移除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 10: Add New College (新增二级学院及可选委任管理员)       */}
      {/* ============================================================ */}
      {showAddCollegeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <School className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">新增二级学院</h3>
                  <p className="text-xs text-slate-400">建立学院基本档案并设置学科门类与代号</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddCollegeModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAddCollege} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">学院名称 *</label>
                <input
                  type="text"
                  required
                  placeholder="如 人工智能学院 或 外国语学院"
                  value={addCollegeForm.name}
                  onChange={(e) => setAddCollegeForm({ ...addCollegeForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">学院英文代号 / 简称 *</label>
                  <input
                    type="text"
                    required
                    placeholder="如 AI, SFL, CS"
                    value={addCollegeForm.code}
                    onChange={(e) => setAddCollegeForm({ ...addCollegeForm, code: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">所属学部 / 门类 *</label>
                  <select
                    value={addCollegeForm.category}
                    onChange={(e) => setAddCollegeForm({ ...addCollegeForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-medium"
                  >
                    <option value="信息科学学部">信息科学学部</option>
                    <option value="工学部">工学部</option>
                    <option value="理学部">理学部</option>
                    <option value="人文社会科学部">人文社会科学部</option>
                    <option value="医学部">医学部</option>
                    <option value="其他">其他综合学科</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">学院学科方向 / 简介</label>
                <textarea
                  rows={2}
                  placeholder="简要填写学院包含的主要专业、研究方向或办公地点..."
                  value={addCollegeForm.description}
                  onChange={(e) => setAddCollegeForm({ ...addCollegeForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:bg-white focus:outline-none resize-none"
                />
              </div>

              {/* Optional: Appoint College Admin in the same step */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <UserCog className="w-4 h-4 text-indigo-600" />
                    <div>
                      <div className="text-xs font-bold text-slate-900">同时委派该学院管理员</div>
                      <div className="text-[11px] text-slate-400">授权负责人自主添加与管理本院师生名单</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={addCollegeForm.hasAdmin}
                    onChange={(e) => setAddCollegeForm({ ...addCollegeForm, hasAdmin: e.target.checked })}
                    className="w-4.5 h-4.5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {addCollegeForm.hasAdmin && (
                  <div className="mt-3 p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 bg-white/80 p-1 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setAddCollegeForm({ ...addCollegeForm, adminMode: 'new' })}
                        className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                          addCollegeForm.adminMode === 'new' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        直接录入新管理员
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddCollegeForm({ ...addCollegeForm, adminMode: 'select' })}
                        className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                          addCollegeForm.adminMode === 'select' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500'
                        }`}
                      >
                        从在册教师中指定
                      </button>
                    </div>

                    {addCollegeForm.adminMode === 'new' ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">管理员姓名 *</label>
                            <input
                              type="text"
                              required={addCollegeForm.hasAdmin && addCollegeForm.adminMode === 'new'}
                              placeholder="如 赵主任"
                              value={addCollegeForm.adminName}
                              onChange={(e) => setAddCollegeForm({ ...addCollegeForm, adminName: e.target.value })}
                              className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">手机号 (登录账号) *</label>
                            <input
                              type="text"
                              required={addCollegeForm.hasAdmin && addCollegeForm.adminMode === 'new'}
                              placeholder="如 13800139988"
                              value={addCollegeForm.adminPhone}
                              onChange={(e) => setAddCollegeForm({ ...addCollegeForm, adminPhone: e.target.value })}
                              className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">初始登录密码</label>
                          <input
                            type="text"
                            value={addCollegeForm.adminPassword}
                            onChange={(e) => setAddCollegeForm({ ...addCollegeForm, adminPassword: e.target.value })}
                            className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">选择在册教师提拔 *</label>
                        <select
                          required={addCollegeForm.hasAdmin && addCollegeForm.adminMode === 'select'}
                          value={addCollegeForm.adminTeacherId}
                          onChange={(e) => setAddCollegeForm({ ...addCollegeForm, adminTeacherId: e.target.value })}
                          className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                        >
                          <option value="">-- 请选择在册教师 --</option>
                          {teacherCandidateList.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.name} ({t.phone}) · 当前在 {t.department}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCollegeModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  确认新增学院
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 11: Edit College Information                           */}
      {/* ============================================================ */}
      {editingCollege && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">编辑二级学院</h3>
                  <p className="text-xs text-slate-400">修改学院名称、代号及学科门类（将同步更新在籍师生归属）</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingCollege(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCollege} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">学院名称 *</label>
                <input
                  type="text"
                  required
                  value={editingCollege.name}
                  onChange={(e) => setEditingCollege({ ...editingCollege, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">学院英文代号 *</label>
                  <input
                    type="text"
                    required
                    value={editingCollege.code}
                    onChange={(e) => setEditingCollege({ ...editingCollege, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">所属学部 *</label>
                  <select
                    value={editingCollege.category}
                    onChange={(e) => setEditingCollege({ ...editingCollege, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-medium"
                  >
                    <option value="信息科学学部">信息科学学部</option>
                    <option value="工学部">工学部</option>
                    <option value="理学部">理学部</option>
                    <option value="人文社会科学部">人文社会科学部</option>
                    <option value="医学部">医学部</option>
                    <option value="其他">其他综合学科</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">学院学科方向 / 简介</label>
                <textarea
                  rows={3}
                  value={editingCollege.description}
                  onChange={(e) => setEditingCollege({ ...editingCollege, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">学院运行状态</label>
                <select
                  value={editingCollege.status}
                  onChange={(e) => setEditingCollege({ ...editingCollege, status: e.target.value as '正常' | '暂停' })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:bg-white focus:outline-none font-bold text-indigo-600"
                >
                  <option value="正常">正常运行中</option>
                  <option value="暂停">暂停使用</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCollege(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  保存修改
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
