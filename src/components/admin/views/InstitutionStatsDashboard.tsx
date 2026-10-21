import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Users,
  Coins,
  FileCheck,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  PieChart,
  BarChart3,
  Layers,
  FileText,
  UserCheck,
  UserX,
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  Check,
  Send,
  Eye,
  SlidersHorizontal,
  Bell
} from 'lucide-react';
import { TrialMemberItem } from '../../../data/adminMockData';

// Types for the Dashboard
export type TimeRangeType = '7d' | '30d' | 'semester' | 'custom';
export type GranularityType = 'day' | 'week' | 'month';
export type ChartStyleType = 'line' | 'bar';
export type RoleFilterType = 'all' | '老师' | '学生';
export type BatchFilterType = 'all' | '2026秋季开题全检批次' | '2026硕士预答辩批次' | '2026博士盲审初检批次' | '日常送检批次';
export type RiskLevelType = 'all' | '高风险' | '中风险' | '低风险' | '安全';

export interface InstitutionStatsDashboardProps {
  adminLevel: '总管理员' | '学院管理员';
  currentSchool?: string;
  managedCollege?: string;
  onNavigateSection?: (section: 'members' | 'quota') => void;
  onSwitchAdminLevel?: (level: '总管理员' | '学院管理员', college?: string) => void;
}

// College stats structure
interface CollegeStatDetail {
  id: string;
  name: string;
  code: string;
  membersCount: number;
  detectionCount: number;
  creditsConsumed: number;
  creditsBalance: number;
  trialBalance: number;
  activeRate: number; // percentage 0-100
  adminName: string;
  riskCount: number;
  allocatedQuota: number;
  allocatedTrial: number;
  usedTrial: number;
}

// High risk paper item
interface RiskPaperItem {
  id: string;
  title: string;
  college: string;
  author: string;
  role: '老师' | '学生';
  riskLevel: '高风险' | '中风险' | '低风险' | '安全';
  issuesCount: number;
  sensitiveHitCount: number;
  privacyHitCount: number;
  detectTime: string;
  status: '待复核' | '已复核' | '已驳回';
}

// Active member item
interface MemberActivityItem {
  id: string;
  name: string;
  phone: string;
  college: string;
  role: '老师' | '学生';
  detectionCount: number;
  creditsConsumed: number;
  lastActiveTime: string;
  status: '正常' | '待审核' | '已退出' | '已禁用';
}

export default function InstitutionStatsDashboard({
  adminLevel = '总管理员',
  currentSchool = '武汉大学',
  managedCollege = '计算机学院',
  onNavigateSection,
  onSwitchAdminLevel,
}: InstitutionStatsDashboardProps) {
  // Current active view mode & drill-down college
  const [drilledCollege, setDrilledCollege] = useState<string | null>(
    adminLevel === '学院管理员' ? managedCollege : null
  );

  // Filters State
  const [timeRange, setTimeRange] = useState<TimeRangeType>('30d');
  const [collegeFilter, setCollegeFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilterType>('all');
  const [batchFilter, setBatchFilter] = useState<BatchFilterType>('all');

  // Usage Trends State
  const [trendGranularity, setTrendGranularity] = useState<GranularityType>('day');
  const [trendChartType, setTrendChartType] = useState<ChartStyleType>('line');

  // Refresh State
  const [lastUpdated, setLastUpdated] = useState<string>('今天 10:45:20');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // College Distribution Table Filter & Sort
  const [collegeSearch, setCollegeSearch] = useState('');
  const [collegeSortField, setCollegeSortField] = useState<keyof CollegeStatDetail>('detectionCount');
  const [collegeSortOrder, setCollegeSortOrder] = useState<'asc' | 'desc'>('desc');

  // Member Activity Table Filter
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState<'all' | '老师' | '学生'>('all');
  const [memberStatusFilter, setMemberStatusFilter] = useState<'all' | '正常' | '待审核' | '已退出' | '已禁用'>('all');
  const [memberPage, setMemberPage] = useState(1);

  // Risk Table Filter
  const [riskLevelFilter, setRiskLevelFilter] = useState<RiskLevelType>('all');
  const [riskCollegeFilter, setRiskCollegeFilter] = useState('all');
  const [selectedRiskPaper, setSelectedRiskPaper] = useState<RiskPaperItem | null>(null);

  // Points & Quota Action Modal State
  const [quotaActionModal, setQuotaActionModal] = useState<{
    type: 'allocate' | 'recycle' | 'statement' | 'remind';
    collegeName: string;
    isOpen: boolean;
  }>({
    type: 'allocate',
    collegeName: '',
    isOpen: false,
  });
  const [actionQuotaValue, setActionQuotaValue] = useState(100);

  // Pending items approval state
  const [pendingMembers, setPendingMembers] = useState([
    { id: 'app-01', name: '罗景天', college: '计算机学院', role: '学生', phone: '138****3911', time: '10分钟前', reason: '2026级博士研究生开题送审申请' },
    { id: 'app-02', name: '顾晓兰', college: '经济与管理学院', role: '老师', phone: '139****5820', time: '35分钟前', reason: '青年学者课题组集中检测入驻' },
    { id: 'app-03', name: '谭德华', college: '电子信息学院', role: '学生', phone: '137****9941', time: '2小时前', reason: '硕士预答辩开题检测' },
  ]);

  const [pendingInspections, setPendingInspections] = useState([
    { id: 'sub-01', title: '《大模型在分布式车载网联通信中的优化实证研究》', college: '计算机学院', author: '张宇轩 (老师)', words: 86400, reason: '字数超出单篇8万字上限审核' },
    { id: 'sub-02', title: '《国际贸易争端多边裁决案例库实证分析 (2018-2025)》', college: '法学院', author: '马宇晴 (学生)', words: 92000, reason: '重点项目专项批次核准' },
  ]);

  const [pendingQuotas, setPendingQuotas] = useState([
    { id: 'qapp-01', college: '电子信息学院', applicant: '陈主任', requestCredits: 150, reason: '本硕毕业开题人数超出学期预算，申请追加检测额度' },
    { id: 'qapp-02', college: '文学院', applicant: '李老师', requestCredits: 80, reason: '汉语言古典文献全真比对排版专项' },
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `今天 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      setLastUpdated(timeStr);
      setIsRefreshing(false);
      showToast('统计数据已同步更新至最新状态');
    }, 600);
  };

  // Base College Stats Data (单位：检测次数/篇次)
  const baseCollegesData: CollegeStatDetail[] = [
    {
      id: 'col-cs',
      name: '计算机学院',
      code: 'CS',
      membersCount: 142,
      detectionCount: 1280,
      creditsConsumed: 1280,
      creditsBalance: 220,
      trialBalance: 14,
      activeRate: 84.5,
      adminName: '张主任',
      riskCount: 3,
      allocatedQuota: 1500,
      allocatedTrial: 20,
      usedTrial: 6,
    },
    {
      id: 'col-sem',
      name: '经济与管理学院',
      code: 'SEM',
      membersCount: 98,
      detectionCount: 840,
      creditsConsumed: 840,
      creditsBalance: 160,
      trialBalance: 9,
      activeRate: 78.6,
      adminName: '刘院长',
      riskCount: 2,
      allocatedQuota: 1000,
      allocatedTrial: 15,
      usedTrial: 6,
    },
    {
      id: 'col-eis',
      name: '电子信息学院',
      code: 'EIS',
      membersCount: 86,
      detectionCount: 590,
      creditsConsumed: 590,
      creditsBalance: 210,
      trialBalance: 12,
      activeRate: 72.1,
      adminName: '陈主任',
      riskCount: 1,
      allocatedQuota: 800,
      allocatedTrial: 15,
      usedTrial: 3,
    },
    {
      id: 'col-cla',
      name: '文学院',
      code: 'CLA',
      membersCount: 65,
      detectionCount: 380,
      creditsConsumed: 380,
      creditsBalance: 120,
      trialBalance: 5,
      activeRate: 66.2,
      adminName: '李老师',
      riskCount: 1,
      allocatedQuota: 500,
      allocatedTrial: 10,
      usedTrial: 5,
    },
    {
      id: 'col-law',
      name: '法学院',
      code: 'LAW',
      membersCount: 54,
      detectionCount: 210,
      creditsConsumed: 210,
      creditsBalance: 190,
      trialBalance: 8,
      activeRate: 59.3,
      adminName: '赵老师',
      riskCount: 0,
      allocatedQuota: 400,
      allocatedTrial: 10,
      usedTrial: 2,
    },
    {
      id: 'col-bio',
      name: '生命科学学院',
      code: 'BIO',
      membersCount: 45,
      detectionCount: 128,
      creditsConsumed: 128,
      creditsBalance: 72,
      trialBalance: 7,
      activeRate: 53.3,
      adminName: '高主任',
      riskCount: 1,
      allocatedQuota: 200,
      allocatedTrial: 10,
      usedTrial: 3,
    },
  ];

  // Base Risk Papers
  const [riskPapers, setRiskPapers] = useState<RiskPaperItem[]>([
    {
      id: 'RP-001',
      title: '《基于联邦学习与边缘节点协同的智慧医疗隐私保护方案》',
      college: '计算机学院',
      author: '周宁',
      role: '学生',
      riskLevel: '高风险',
      issuesCount: 38,
      sensitiveHitCount: 4,
      privacyHitCount: 3,
      detectTime: '2026-10-15 16:20',
      status: '待复核',
    },
    {
      id: 'RP-002',
      title: '《国际高新材料供应链关键技术自主可控路径评估》',
      college: '经济与管理学院',
      author: '陈思涵',
      role: '学生',
      riskLevel: '高风险',
      issuesCount: 42,
      sensitiveHitCount: 6,
      privacyHitCount: 2,
      detectTime: '2026-10-14 11:35',
      status: '待复核',
    },
    {
      id: 'RP-003',
      title: '《新一代毫米波阵列雷达射频前端电路涉密仿真测试》',
      college: '电子信息学院',
      author: '程家睿',
      role: '学生',
      riskLevel: '高风险',
      issuesCount: 29,
      sensitiveHitCount: 3,
      privacyHitCount: 4,
      detectTime: '2026-10-13 09:40',
      status: '待复核',
    },
    {
      id: 'RP-004',
      title: '《中国近代汉口开埠商贸金融契约文献考释》',
      college: '文学院',
      author: '吴梓萱',
      role: '学生',
      riskLevel: '中风险',
      issuesCount: 24,
      sensitiveHitCount: 1,
      privacyHitCount: 0,
      detectTime: '2026-10-12 14:15',
      status: '已复核',
    },
    {
      id: 'RP-005',
      title: '《数字法治视域下算法解释权与司法裁判公正性实证研究》',
      college: '法学院',
      author: '赵云舒',
      role: '学生',
      riskLevel: '低风险',
      issuesCount: 16,
      sensitiveHitCount: 0,
      privacyHitCount: 0,
      detectTime: '2026-10-11 15:50',
      status: '已复核',
    },
    {
      id: 'RP-006',
      title: '《微藻生物质定向发酵高附加值化工产品工艺优化》',
      college: '生命科学学院',
      author: '高雨萱',
      role: '学生',
      riskLevel: '中风险',
      issuesCount: 21,
      sensitiveHitCount: 2,
      privacyHitCount: 1,
      detectTime: '2026-10-10 10:20',
      status: '已复核',
    },
    {
      id: 'RP-007',
      title: '《量子纠缠态在深空通信编解码中的抗干扰鲁棒性分析》',
      college: '物理科学与技术学院',
      author: '黄彦民',
      role: '老师',
      riskLevel: '安全',
      issuesCount: 4,
      sensitiveHitCount: 0,
      privacyHitCount: 0,
      detectTime: '2026-10-09 17:05',
      status: '已复核',
    },
  ]);

  // Base Members Data
  const baseMembersData: MemberActivityItem[] = [
    { id: 'm-1', name: '周宁', phone: '13800132031', college: '计算机学院', role: '学生', detectionCount: 4, creditsConsumed: 1200, lastActiveTime: '2小时前', status: '正常' },
    { id: 'm-2', name: '张宇轩', phone: '13900132032', college: '计算机学院', role: '老师', detectionCount: 9, creditsConsumed: 4500, lastActiveTime: '昨天', status: '正常' },
    { id: 'm-3', name: '陈思涵', phone: '13700132033', college: '经济与管理学院', role: '学生', detectionCount: 3, creditsConsumed: 900, lastActiveTime: '3小时前', status: '正常' },
    { id: 'm-4', name: '董向华', phone: '13612345604', college: '经济与管理学院', role: '老师', detectionCount: 6, creditsConsumed: 3200, lastActiveTime: '2天前', status: '正常' },
    { id: 'm-5', name: '程家睿', phone: '13912345602', college: '电子信息学院', role: '学生', detectionCount: 2, creditsConsumed: 600, lastActiveTime: '4天前', status: '正常' },
    { id: 'm-6', name: '吴梓萱', phone: '13611446677', college: '文学院', role: '学生', detectionCount: 3, creditsConsumed: 1000, lastActiveTime: '3天前', status: '正常' },
    { id: 'm-7', name: '谢梦如', phone: '13312345607', college: '文学院', role: '老师', detectionCount: 5, creditsConsumed: 2600, lastActiveTime: '1周前', status: '正常' },
    { id: 'm-8', name: '赵云舒', phone: '13500138920', college: '法学院', role: '学生', detectionCount: 2, creditsConsumed: 500, lastActiveTime: '5天前', status: '正常' },
    { id: 'm-9', name: '高雨萱', phone: '13712345603', college: '生命科学学院', role: '学生', detectionCount: 3, creditsConsumed: 1100, lastActiveTime: '1周前', status: '正常' },
    { id: 'm-10', name: '黄彦民', phone: '13311779900', college: '物理科学与技术学院', role: '老师', detectionCount: 4, creditsConsumed: 2800, lastActiveTime: '昨天', status: '正常' },
    { id: 'm-11', name: '王浩', phone: '13811223344', college: '机械工程学院', role: '学生', detectionCount: 0, creditsConsumed: 0, lastActiveTime: '未检测', status: '正常' },
    { id: 'm-12', name: '李悦心', phone: '13911224455', college: '外国语学院', role: '学生', detectionCount: 1, creditsConsumed: 300, lastActiveTime: '2周前', status: '正常' },
    { id: 'm-13', name: '罗景天', phone: '13811993911', college: '计算机学院', role: '学生', detectionCount: 0, creditsConsumed: 0, lastActiveTime: '未检测', status: '待审核' },
    { id: 'm-14', name: '顾晓兰', phone: '13911885820', college: '经济与管理学院', role: '老师', detectionCount: 0, creditsConsumed: 0, lastActiveTime: '未检测', status: '待审核' },
    { id: 'm-15', name: '刘振江', phone: '13511776655', college: '法学院', role: '学生', detectionCount: 0, creditsConsumed: 0, lastActiveTime: '未检测', status: '已禁用' },
    { id: 'm-16', name: '唐国峰', phone: '13712345610', college: '机械工程学院', role: '学生', detectionCount: 0, creditsConsumed: 0, lastActiveTime: '未检测', status: '已退出' },
  ];

  // Effective scope: if drilled down or college admin, only show that college
  const activeCollegeScope = drilledCollege || (collegeFilter !== 'all' ? collegeFilter : null);

  // Compute Core Metrics
  const coreMetrics = useMemo(() => {
    let relevantColleges = baseCollegesData;
    if (activeCollegeScope) {
      relevantColleges = baseCollegesData.filter(c => c.name === activeCollegeScope);
    }

    const totalDetection = relevantColleges.reduce((sum, c) => sum + c.detectionCount, 0);
    const monthlyDetection = Math.round(totalDetection * 0.28);
    const totalCreditsConsumed = relevantColleges.reduce((sum, c) => sum + c.creditsConsumed, 0);
    const creditsBalance = relevantColleges.reduce((sum, c) => sum + c.creditsBalance, 0);
    const activeMembers = Math.round(relevantColleges.reduce((sum, c) => sum + c.membersCount, 0) * 0.78);
    const coveredColleges = activeCollegeScope ? 1 : relevantColleges.length;
    const trialBalance = relevantColleges.reduce((sum, c) => sum + c.trialBalance, 0);
    const newMembersThisMonth = Math.round(relevantColleges.reduce((sum, c) => sum + c.membersCount, 0) * 0.12);
    const activeThisMonth = activeMembers;

    return {
      totalDetection,
      monthlyDetection,
      totalCreditsConsumed,
      creditsBalance,
      activeMembers,
      coveredColleges,
      trialBalance,
      newMembersThisMonth,
      activeThisMonth,
    };
  }, [activeCollegeScope]);

  // Usage Trends Data (Daily, Weekly, Monthly)
  const trendsData = useMemo(() => {
    if (trendGranularity === 'day') {
      return [
        { label: '10-09', detection: 65, credits: 65, newMembers: 4, activeMembers: 42 },
        { label: '10-10', detection: 88, credits: 88, newMembers: 7, activeMembers: 58 },
        { label: '10-11', detection: 115, credits: 115, newMembers: 9, activeMembers: 74 },
        { label: '10-12', detection: 142, credits: 142, newMembers: 12, activeMembers: 92 },
        { label: '10-13', detection: 130, credits: 130, newMembers: 8, activeMembers: 86 },
        { label: '10-14', detection: 168, credits: 168, newMembers: 15, activeMembers: 118 },
        { label: '10-15', detection: 195, credits: 195, newMembers: 18, activeMembers: 135 },
      ];
    } else if (trendGranularity === 'week') {
      return [
        { label: '第37周', detection: 420, credits: 420, newMembers: 32, activeMembers: 180 },
        { label: '第38周', detection: 560, credits: 560, newMembers: 45, activeMembers: 220 },
        { label: '第39周', detection: 690, credits: 690, newMembers: 58, activeMembers: 275 },
        { label: '第40周', detection: 820, credits: 820, newMembers: 64, activeMembers: 310 },
        { label: '第41周', detection: 946, credits: 946, newMembers: 48, activeMembers: 345 },
      ];
    } else {
      return [
        { label: '5月', detection: 320, credits: 320, newMembers: 25, activeMembers: 140 },
        { label: '6月', detection: 580, credits: 580, newMembers: 48, activeMembers: 210 },
        { label: '7月', detection: 210, credits: 210, newMembers: 15, activeMembers: 85 },
        { label: '8月', detection: 180, credits: 180, newMembers: 12, activeMembers: 76 },
        { label: '9月', detection: 912, credits: 912, newMembers: 92, activeMembers: 360 },
        { label: '10月', detection: 946, credits: 946, newMembers: 76, activeMembers: 412 },
      ];
    }
  }, [trendGranularity]);

  // Filtered & Sorted Colleges Table Data
  const filteredColleges = useMemo(() => {
    return baseCollegesData
      .filter(c => {
        if (activeCollegeScope && c.name !== activeCollegeScope) return false;
        if (!collegeSearch.trim()) return true;
        return c.name.includes(collegeSearch) || c.code.toLowerCase().includes(collegeSearch.toLowerCase());
      })
      .sort((a, b) => {
        const valA = a[collegeSortField] as number;
        const valB = b[collegeSortField] as number;
        return collegeSortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [activeCollegeScope, collegeSearch, collegeSortField, collegeSortOrder]);

  // Filtered Members Table Data
  const filteredMembers = useMemo(() => {
    return baseMembersData.filter(m => {
      if (activeCollegeScope && m.college !== activeCollegeScope) return false;
      if (memberRoleFilter !== 'all' && m.role !== memberRoleFilter) return false;
      if (memberStatusFilter !== 'all' && m.status !== memberStatusFilter) return false;
      if (memberSearch.trim()) {
        const query = memberSearch.toLowerCase();
        return m.name.toLowerCase().includes(query) || m.phone.includes(query) || m.college.includes(query);
      }
      return true;
    });
  }, [activeCollegeScope, memberRoleFilter, memberStatusFilter, memberSearch]);

  // Filtered Risk Papers
  const filteredRiskPapers = useMemo(() => {
    return riskPapers.filter(p => {
      if (activeCollegeScope && p.college !== activeCollegeScope) return false;
      if (riskCollegeFilter !== 'all' && p.college !== riskCollegeFilter) return false;
      if (riskLevelFilter !== 'all' && p.riskLevel !== riskLevelFilter) return false;
      return true;
    });
  }, [activeCollegeScope, riskCollegeFilter, riskLevelFilter, riskPapers]);

  // High Risk papers list (top urgency)
  const highRiskList = useMemo(() => {
    return riskPapers.filter(p => p.riskLevel === '高风险');
  }, [riskPapers]);

  // Six problem types breakdown
  const problemTypeStats = [
    { type: '参考文献格式', count: 2450, percentage: 31.4, color: 'bg-indigo-600' },
    { type: '错别字误写', count: 1840, percentage: 23.6, color: 'bg-sky-600' },
    { type: '语法病句', count: 1230, percentage: 15.8, color: 'bg-blue-600' },
    { type: '目录标号差异', count: 960, percentage: 12.3, color: 'bg-amber-500' },
    { type: '图片分辨率/编号', count: 820, percentage: 10.5, color: 'bg-emerald-600' },
    { type: '三线表规范', count: 500, percentage: 6.4, color: 'bg-rose-500' },
  ];

  // Helper for rendering SVG Trend Lines
  const renderTrendSvg = (dataKey: 'detection' | 'credits' | 'newMembers' | 'activeMembers', strokeColor: string, fillColor: string) => {
    const values = trendsData.map(d => d[dataKey]);
    const maxVal = Math.max(...values, 10);
    const height = 140;
    const width = 360;
    const padding = 20;

    const points = values.map((val, idx) => {
      const x = padding + (idx / (values.length - 1)) * (width - padding * 2);
      const y = height - padding - (val / maxVal) * (height - padding * 2);
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const areaD = `${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = height - padding - ratio * (height - padding * 2);
          return (
            <line
              key={idx}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill={`url(#grad-${dataKey})`} />

        {/* Line stroke */}
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {values.map((val, idx) => {
          const x = padding + (idx / (values.length - 1)) * (width - padding * 2);
          const y = height - padding - (val / maxVal) * (height - padding * 2);
          return (
            <g key={idx} className="group cursor-pointer">
              <circle cx={x} cy={y} r="3.5" fill="#ffffff" stroke={strokeColor} strokeWidth="2" />
              <circle cx={x} cy={y} r="6" fill={strokeColor} opacity="0" className="group-hover:opacity-20 transition-opacity" />
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                fontSize="10"
                fill="#334155"
                fontWeight="bold"
                className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
              >
                {val.toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* X Axis labels */}
        {trendsData.map((d, idx) => {
          const x = padding + (idx / (values.length - 1)) * (width - padding * 2);
          return (
            <text key={idx} x={x} y={height - 4} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="500">
              {d.label}
            </text>
          );
        })}
      </svg>
    );
  };

  // Helper for rendering SVG Bar Chart
  const renderTrendBarSvg = (dataKey: 'detection' | 'credits' | 'newMembers' | 'activeMembers', barColor: string) => {
    const values = trendsData.map(d => d[dataKey]);
    const maxVal = Math.max(...values, 10);
    const height = 140;
    const width = 360;
    const padding = 20;
    const barWidth = Math.max(14, (width - padding * 2) / (values.length * 2.2));

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = height - padding - ratio * (height - padding * 2);
          return (
            <line
              key={idx}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#e2e8f0"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          );
        })}

        {/* Bars */}
        {values.map((val, idx) => {
          const step = (width - padding * 2) / values.length;
          const x = padding + idx * step + (step - barWidth) / 2;
          const barHeight = (val / maxVal) * (height - padding * 2);
          const y = height - padding - barHeight;

          return (
            <g key={idx} className="group cursor-pointer">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="4"
                fill={barColor}
                className="transition-all opacity-85 group-hover:opacity-100"
              />
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="10"
                fill="#334155"
                fontWeight="bold"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {val.toLocaleString()}
              </text>
              <text x={x + barWidth / 2} y={height - 4} textAnchor="middle" fontSize="9" fill="#94a3b8" fontWeight="500">
                {trendsData[idx].label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs sm:text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Drill-down Breadcrumb Notification Banner when inside a specific college view */}
      {drilledCollege && (
        <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-blue-50 border border-sky-200/80 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/20">
              <Building2 className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-700">
                <span>{currentSchool} 全景看板</span>
                <ChevronRight className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-slate-900 bg-white px-2 py-0.5 rounded-md border border-sky-100">
                  {drilledCollege} 学院看板模式
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                当前数据已自动下钻限定为【{drilledCollege}】；展示本学院师生送审指标、额度消耗与审批任务。
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setDrilledCollege(null);
              setCollegeFilter('all');
              if (onSwitchAdminLevel) onSwitchAdminLevel('总管理员');
            }}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>返回机构全景看板</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 0. 顶部筛选区 (四维联动: 时间、学院、角色、批次 + 刷新与导出)             */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{currentSchool}</span>
              <span>·</span>
              <span className="text-sky-600 font-bold">
                {drilledCollege ? `${drilledCollege} 统计看板` : '机构统一统计概览看板'}
              </span>
              <span>·</span>
              <span className="text-slate-400">
                刷新频率：准实时 / 每小时自动同步
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
              <span>机构学位论文检测与资产统计监控大屏</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-100">
                {adminLevel}视角
              </span>
            </h1>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Last updated and refresh button */}
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mr-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>更新时间: {lastUpdated}</span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              title="立即拉取最新检测数据与额度变动"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? '同步中...' : '立即刷新'}</span>
            </button>

            {/* Export full report button */}
            <button
              onClick={() => showToast('已成功导出《机构学位论文检测与资产合规分析总表.csv》')}
              className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-sky-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出看板报表</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: 时间范围 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>时间范围:</span>
            </span>
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs">
              {(
                [
                  { key: '7d', label: '近7天' },
                  { key: '30d', label: '近30天' },
                  { key: 'semester', label: '本学期' },
                  { key: 'custom', label: '自定义' },
                ] as const
              ).map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTimeRange(t.key)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    timeRange === t.key ? 'bg-white text-sky-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. 第一个区域：顶部核心指标区 (六张核心卡片 + 三张补充指标)              */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            01. 核心指标区 (Key Metrics)
          </div>
          <span className="text-xs text-slate-500">口径去重 · 实时汇总</span>
        </div>

        {/* 6 Core Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Card 1: 累计检测量 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:border-sky-200 transition-all">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>累计检测量</span>
              <FileCheck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {coreMetrics.totalDetection.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">篇</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>提交去重后论文数</span>
              <span className="text-emerald-600 font-bold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +24.8%
              </span>
            </div>
          </div>

          {/* Card 2: 本月检测量 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:border-sky-200 transition-all">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>本月检测量</span>
              <Calendar className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tight">
              {coreMetrics.monthlyDetection.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">篇</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>自然月当月累计</span>
              <span className="text-emerald-600 font-bold flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +18.5%
              </span>
            </div>
          </div>

          {/* Card 3: 累计检测消耗 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:border-sky-200 transition-all">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>累计检测消耗</span>
              <Coins className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {coreMetrics.totalCreditsConsumed.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">次</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              含正式额度与试用篇数折抵
            </div>
          </div>

          {/* Card 4: 检测额度余额 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:border-sky-200 transition-all">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>检测额度余额</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
              {coreMetrics.creditsBalance.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-400">次</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              含机构总池与各学院已划拨未用
            </div>
          </div>

          {/* Card 5: 参与成员数 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:border-sky-200 transition-all">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>参与成员数</span>
              <UserCheck className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {coreMetrics.activeMembers}{' '}
              <span className="text-xs font-normal text-slate-400">人</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              口径：完成过一次完整检测
            </div>
          </div>

          {/* Card 6: 覆盖学院数 */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:border-sky-200 transition-all">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>覆盖学院数</span>
              <Building2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight">
              {coreMetrics.coveredColleges}{' '}
              <span className="text-xs font-normal text-slate-400">院</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              已开通且入驻检测成员
            </div>
          </div>
        </div>

        {/* 3 Supplementary Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">试用剩余篇数 (平台专项支持)</div>
              <div className="text-lg font-black text-amber-600 mt-0.5">
                {coreMetrics.trialBalance} <span className="text-xs font-normal text-slate-400">篇可用</span>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-amber-500 opacity-80" />
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">本月新增成员数 (注册或批量导入)</div>
              <div className="text-lg font-black text-slate-900 mt-0.5">
                +{coreMetrics.newMembersThisMonth} <span className="text-xs font-normal text-slate-400">人</span>
              </div>
            </div>
            <Users className="w-5 h-5 text-sky-500 opacity-80" />
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">本月活跃成员数 (近30天内有检测)</div>
              <div className="text-lg font-black text-indigo-600 mt-0.5">
                {coreMetrics.activeThisMonth} <span className="text-xs font-normal text-slate-400">人活跃</span>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-500 opacity-80" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. 第二个区域：使用趋势区 (4张趋势图，按日、周、月展示)                   */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              02. 使用趋势区 (Usage Trends)
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              全周期检测量、额度消耗与成员演进趋势
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Day / Week / Month Granularity */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
              {(
                [
                  { key: 'day', label: '按日' },
                  { key: 'week', label: '按周' },
                  { key: 'month', label: '按月' },
                ] as const
              ).map(g => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setTrendGranularity(g.key)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    trendGranularity === g.key ? 'bg-white text-sky-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Line / Bar chart toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setTrendChartType('line')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  trendChartType === 'line' ? 'bg-white text-sky-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="切换为平滑折线走势图"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTrendChartType('bar')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  trendChartType === 'bar' ? 'bg-white text-sky-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="切换为柱状分布图"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Trends Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Trend 1: 检测量趋势 */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">检测量趋势</div>
                <div className="text-[11px] text-slate-400">提交送检论文篇数波动</div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-600">篇次</span>
            </div>
            {trendChartType === 'line'
              ? renderTrendSvg('detection', '#0284c7', '#38bdf8')
              : renderTrendBarSvg('detection', '#0284c7')}
          </div>

          {/* Trend 2: 额度消耗趋势 */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">额度消耗趋势</div>
                <div className="text-[11px] text-slate-400">全校实际抵扣次数走势</div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-600">次数</span>
            </div>
            {trendChartType === 'line'
              ? renderTrendSvg('credits', '#d97706', '#f59e0b')
              : renderTrendBarSvg('credits', '#d97706')}
          </div>

          {/* Trend 3: 新增成员趋势 */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">新增成员趋势</div>
                <div className="text-[11px] text-slate-400">新注册与导入师生规模</div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600">人次</span>
            </div>
            {trendChartType === 'line'
              ? renderTrendSvg('newMembers', '#4f46e5', '#818cf8')
              : renderTrendBarSvg('newMembers', '#4f46e5')}
          </div>

          {/* Trend 4: 活跃成员趋势 */}
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">活跃成员趋势</div>
                <div className="text-[11px] text-slate-400">产生检测动作的活跃师生</div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600">活跃人</span>
            </div>
            {trendChartType === 'line'
              ? renderTrendSvg('activeMembers', '#059669', '#34d399')
              : renderTrendBarSvg('activeMembers', '#059669')}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. 第三个区域：学院分布区 (排行榜、分布图 + 学院综合表格与下钻)            */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              03. 学院分布区 (College Distribution & Drill-Down)
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              各二级学院检测量、额度消耗与活跃度分布
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              可直接在表格中点击学院名称或“进入学院看板”进行下钻深度追踪
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('已成功导出《各二级学院检测与额度分配明细.csv》')}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>导出学院表</span>
            </button>
          </div>
        </div>

        {/* 3 Visual Cards: 检测量排行、额度消耗排行、成员数环形分布 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card A: 各学院检测量排行 */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-slate-800">各学院检测量排行</div>
              <span className="text-[11px] text-slate-400">降序排列</span>
            </div>
            <div className="space-y-2.5">
              {[...baseCollegesData]
                .sort((a, b) => b.detectionCount - a.detectionCount)
                .map((c, idx) => {
                  const maxCount = 1280;
                  const pct = Math.round((c.detectionCount / maxCount) * 100);
                  return (
                    <div key={c.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-black ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-800'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-700'
                                : idx === 2
                                ? 'bg-orange-100 text-orange-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-slate-800 font-bold">{c.name}</span>
                        </span>
                        <span className="font-mono text-slate-600 font-bold">{c.detectionCount} 篇</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-600 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Card B: 各学院额度消耗排行 */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-slate-800">各学院额度消耗排行</div>
              <span className="text-[11px] text-slate-400">实耗次数</span>
            </div>
            <div className="space-y-2.5">
              {[...baseCollegesData]
                .sort((a, b) => b.creditsConsumed - a.creditsConsumed)
                .map((c, idx) => {
                  const maxConsumed = 1280;
                  const pct = Math.round((c.creditsConsumed / maxConsumed) * 100);
                  return (
                    <div key={c.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px] font-mono">#{idx + 1}</span>
                          <span className="text-slate-800 font-bold">{c.name}</span>
                        </span>
                        <span className="font-mono text-amber-600 font-bold">{c.creditsConsumed.toLocaleString()} 次</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Card C: 学院活跃度热力分布 */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-slate-800">各学院活跃率分布</div>
              <span className="text-[11px] text-slate-400">参测比率</span>
            </div>
            <div className="space-y-2.5">
              {[...baseCollegesData]
                .sort((a, b) => b.activeRate - a.activeRate)
                .map((c) => (
                  <div key={c.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-800 font-bold">{c.name}</span>
                      <span className="font-mono font-bold text-emerald-600">{c.activeRate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          c.activeRate >= 80 ? 'bg-emerald-500' : c.activeRate >= 65 ? 'bg-sky-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${c.activeRate}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* College Comprehensive Table */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
                placeholder="搜索学院名称或代码..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div className="text-xs text-slate-400 font-medium">
              共 <strong>{filteredColleges.length}</strong> 所学院 · 点击行或按钮下钻至学院看板
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">学院名称</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-slate-900"
                      onClick={() => {
                        setCollegeSortField('membersCount');
                        setCollegeSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
                      }}
                    >
                      在册成员数 ↕
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-slate-900"
                      onClick={() => {
                        setCollegeSortField('detectionCount');
                        setCollegeSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
                      }}
                    >
                      累计检测量 ↕
                    </th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-slate-900"
                      onClick={() => {
                        setCollegeSortField('creditsConsumed');
                        setCollegeSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
                      }}
                    >
                      额度消耗 ↕
                    </th>
                    <th className="py-3 px-4">剩余额度</th>
                    <th className="py-3 px-4">试用剩余</th>
                    <th
                      className="py-3 px-4 cursor-pointer hover:text-slate-900"
                      onClick={() => {
                        setCollegeSortField('activeRate');
                        setCollegeSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
                      }}
                    >
                      活跃率 ↕
                    </th>
                    <th className="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredColleges.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-sky-50/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        setDrilledCollege(c.name);
                        setCollegeFilter(c.name);
                        showToast(`已下钻切换至【${c.name}】学院统计看板`);
                      }}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
                        <span>{c.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 font-normal">({c.code})</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{c.membersCount} 人</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{c.detectionCount} 篇</td>
                      <td className="py-3.5 px-4 font-bold text-amber-600">{c.creditsConsumed.toLocaleString()} 次</td>
                      <td className="py-3.5 px-4 font-medium text-emerald-600">{c.creditsBalance.toLocaleString()} 次</td>
                      <td className="py-3.5 px-4 text-slate-600">{c.trialBalance} 篇</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{c.activeRate}%</span>
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.activeRate}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDrilledCollege(c.name);
                            setCollegeFilter(c.name);
                            showToast(`已下钻切换至【${c.name}】学院看板`);
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>下钻学院看板</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. 第四个区域：成员活跃区 (活跃/沉默统计、分布图 + 成员表格)               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              04. 成员活跃区 (Member Engagement)
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              全校师生活跃状态、角色构成与使用明细
            </h2>
          </div>

          <button
            onClick={() => showToast('已成功导出《成员论文检测与额度消耗使用明细.csv》')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>导出成员明细</span>
          </button>
        </div>

        {/* 3 Activity Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: 活跃成员数 (含学生、教师角色构成) */}
          <div className="p-5 bg-slate-50/70 rounded-3xl border border-slate-100 flex flex-col justify-between space-y-4 shadow-2xs">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">活跃成员数</div>
                <div className="text-3xl font-black text-emerald-600 mt-1 flex items-baseline gap-2">
                  <span>265</span>
                  <span className="text-xs font-normal text-slate-400">人</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  口径：近7天或近30天内有检测行为
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100">
                活跃率 64.3%
              </div>
            </div>

            {/* 成员角色：学生、教师展示 */}
            <div className="pt-3 border-t border-slate-200/70 space-y-2.5">
              <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                <span>成员角色构成</span>
                <span className="font-mono text-slate-400">活跃共 265 人</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between shadow-2xs">
                  <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                    <span>学生</span>
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono">202人</span>
                    <span className="text-[10px] text-slate-400 ml-1 font-semibold">(76.2%)</span>
                  </div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between shadow-2xs">
                  <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span>教师</span>
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 font-mono">63人</span>
                    <span className="text-[10px] text-slate-400 ml-1 font-semibold">(23.8%)</span>
                  </div>
                </div>
              </div>
              {/* 学生/教师 占比进度条 */}
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden flex">
                  <div className="bg-sky-500 h-full transition-all" style={{ width: '76.2%' }} title="学生 202人 (76.2%)" />
                  <div className="bg-amber-500 h-full transition-all" style={{ width: '23.8%' }} title="教师 63人 (23.8%)" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium px-0.5">
                  <span className="text-sky-600">学生 76.2%</span>
                  <span className="text-amber-600">教师 23.8%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: 沉默成员数 */}
          <div className="p-5 bg-slate-50/70 rounded-3xl border border-slate-100 flex flex-col justify-between space-y-4 shadow-2xs">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">沉默成员数</div>
                <div className="text-3xl font-black text-slate-700 mt-1 flex items-baseline gap-2">
                  <span>89</span>
                  <span className="text-xs font-normal text-slate-400">人</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  口径：注册或学校名单导入后尚未发起检测
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200">
                占比 21.6%
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/70 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between text-[11px]">
                <span>建议举措:</span>
                <span className="text-sky-600 font-bold">可统一发放试用配额</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-[11px] text-slate-500">
                通过【额度管理】批量配发 1 篇免费试用即可有效激活
              </div>
            </div>
          </div>

          {/* Card 3: 本月新增成员数 */}
          <div className="p-5 bg-slate-50/70 rounded-3xl border border-slate-100 flex flex-col justify-between space-y-4 shadow-2xs">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500">本月新增成员数</div>
                <div className="text-3xl font-black text-sky-600 mt-1 flex items-baseline gap-2">
                  <span>+48</span>
                  <span className="text-xs font-normal text-slate-400">人</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  秋季集中开题学生名单批量入驻
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs border border-sky-100">
                环比 +18.2%
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/70 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between text-[11px]">
                <span>名单来源:</span>
                <span className="text-slate-700 font-bold">表格批量导入入驻</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-[11px] text-slate-500">
                全校 6 个二级学院全部完成账号激活建档
              </div>
            </div>
          </div>
        </div>



        {/* Members Usage Detail Table */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center flex-wrap gap-2.5">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="搜索姓名、手机或学院..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-1.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              {/* Role filter */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
                {(['all', '学生', '老师'] as const).map(rf => (
                  <button
                    key={rf}
                    type="button"
                    onClick={() => setMemberRoleFilter(rf)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      memberRoleFilter === rf ? 'bg-white text-sky-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {rf === 'all' ? '全部角色' : rf}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <select
                value={memberStatusFilter}
                onChange={(e) => setMemberStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:bg-white cursor-pointer"
              >
                <option value="all">全部账号状态</option>
                <option value="正常">正常</option>
                <option value="待审核">待审核</option>
                <option value="已退出">已退出</option>
                <option value="已禁用">已禁用</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              共 <strong>{filteredMembers.length}</strong> 位成员明细
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">成员姓名</th>
                    <th className="py-3 px-4">所属学院</th>
                    <th className="py-3 px-4">角色</th>
                    <th className="py-3 px-4">累计检测量</th>
                    <th className="py-3 px-4">消耗检测次数</th>
                    <th className="py-3 px-4">最近检测时间</th>
                    <th className="py-3 px-4 text-right">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.slice((memberPage - 1) * 8, memberPage * 8).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{m.phone}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{m.college}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            m.role === '老师' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
                          }`}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{m.detectionCount} 篇</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-600">{m.detectionCount} 次</td>
                      <td className="py-3 px-4 text-slate-500">{m.lastActiveTime}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            m.status === '正常'
                              ? 'bg-emerald-50 text-emerald-700'
                              : m.status === '待审核'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredMembers.length > 8 && (
              <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  第 {memberPage} / {Math.ceil(filteredMembers.length / 8)} 页
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setMemberPage(prev => Math.max(1, prev - 1))}
                    disabled={memberPage === 1}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40 cursor-pointer"
                  >
                    上一页
                  </button>
                  <button
                    onClick={() => setMemberPage(prev => Math.min(Math.ceil(filteredMembers.length / 8), prev + 1))}
                    disabled={memberPage >= Math.ceil(filteredMembers.length / 8)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-bold disabled:opacity-40 cursor-pointer"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. 第五个区域：风险与合规区 (等级分布、问题类型、敏感词隐私、高风险论文)  */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              05. 风险与合规区 (Risk & Compliance)
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              学术规范质量评级、敏感词排查与重大风险预警
            </h2>
          </div>

          <button
            onClick={() => showToast('已成功导出《全校论文风险排查与学术合规分析报告.pdf》')}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>导出合规报告</span>
          </button>
        </div>

        {/* 4 Stats Grid: 风险等级分布、六类问题类型、敏感词统计、隐私泄密识别 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card A: 风险等级分布 (低风险、中风险、高风险、安全四档) (col-span-4) */}
          <div className="lg:col-span-4 p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-slate-800">论文风险等级分布</div>
              <span className="text-[11px] text-slate-400">四档质量梯队</span>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>安全 (≤5处瑕疵，无敏感词)</span>
                </span>
                <span className="font-bold text-slate-900">2,338 篇 (68.2%)</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '68.2%' }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
                  <span>低风险 (6-15处格式瑕疵)</span>
                </span>
                <span className="font-bold text-slate-900">734 篇 (21.4%)</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500" style={{ width: '21.4%' }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>中风险 (16-30处多项违规)</span>
                </span>
                <span className="font-bold text-slate-900">278 篇 (8.1%)</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: '8.1%' }} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 text-rose-700 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                  <span>高风险 (严重不合规/敏感词)</span>
                </span>
                <span className="font-bold text-rose-600">78 篇 (2.3%)</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-rose-600" style={{ width: '2.3%' }} />
              </div>
            </div>
          </div>

          {/* Card B: 六类问题类型分布 (柱状图展示) (col-span-5) */}
          <div className="lg:col-span-5 p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-slate-800">
                六类高频规范问题类型分布
              </div>
              <span className="text-[11px] text-slate-400">全校检出频次</span>
            </div>

            <div className="space-y-2">
              {problemTypeStats.map((item) => (
                <div key={item.type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{item.type}</span>
                    <span className="font-mono text-slate-900 font-bold">
                      {item.count} 处 ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.percentage * 2.5}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card C: 敏感词与涉密脱敏识别 (col-span-3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                <span>敏感词命中排查</span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-600">
                38 <span className="text-xs font-normal text-rose-800">次命中</span>
              </div>
              <div className="text-[11px] text-rose-700">
                涉及全校 <strong>14 篇</strong> 学位论文，已触发人工审核流程
              </div>
            </div>

            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span>隐私与泄密识别</span>
                <ShieldCheck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-700">
                9 <span className="text-xs font-normal text-amber-800">次预警</span>
              </div>
              <div className="text-[11px] text-amber-800">
                包含身份证号、未脱敏代码密钥与涉密单位内部字段
              </div>
            </div>
          </div>
        </div>



        {/* Risk Papers Table */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="text-xs font-bold text-slate-600">风险等级过滤:</div>
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
                {(['all', '高风险', '中风险', '低风险', '安全'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setRiskLevelFilter(lvl)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      riskLevelFilter === lvl ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {lvl === 'all' ? '全部等级' : lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              展示 <strong>{filteredRiskPapers.length}</strong> 篇已排查送审论文
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">论文题目</th>
                    <th className="py-3 px-4">所属学院</th>
                    <th className="py-3 px-4">送检成员</th>
                    <th className="py-3 px-4">风险评级</th>
                    <th className="py-3 px-4">规范问题数</th>
                    <th className="py-3 px-4">敏感词命中</th>
                    <th className="py-3 px-4">检测时间</th>
                    <th className="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRiskPapers.map((paper) => (
                    <tr key={paper.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate" title={paper.title}>
                        {paper.title}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{paper.college}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800">{paper.author}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({paper.role})</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            paper.riskLevel === '高风险'
                              ? 'bg-rose-50 text-rose-700'
                              : paper.riskLevel === '中风险'
                              ? 'bg-amber-50 text-amber-700'
                              : paper.riskLevel === '低风险'
                              ? 'bg-sky-50 text-sky-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {paper.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{paper.issuesCount} 处</td>
                      <td className="py-3 px-4 font-mono">
                        {paper.sensitiveHitCount > 0 ? (
                          <span className="font-bold text-rose-600">+{paper.sensitiveHitCount} 处</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{paper.detectTime}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedRiskPaper(paper)}
                          className="text-xs font-bold text-sky-600 hover:text-sky-800 cursor-pointer"
                        >
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. 第六个区域：额度与分配区 (汇总指标、到期预警 + 学院分配台账表格)       */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              06. 额度与分配区 (Quota & Allocation)
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              机构商业检测额度与试用篇数池划拨及学院对账
            </h2>
          </div>

          <button
            onClick={() => {
              if (onNavigateSection) onNavigateSection('quota');
            }}
            className="px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-sky-500/20 self-start sm:self-auto"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>前往额度划拨中心</span>
          </button>
        </div>

        {/* 6 Metric Cards: 机构总额、已分配、已使用、可用剩余、试用总额、试用已用/剩余 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-[11px] font-bold text-slate-500">机构检测总额度</div>
            <div className="text-xl font-black text-slate-900">5,000 <span className="text-xs font-normal text-slate-400">次</span></div>
            <div className="text-[10px] text-slate-400">平台分配签约总额度</div>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-[11px] font-bold text-slate-500">已分配给学院</div>
            <div className="text-xl font-black text-indigo-600">4,400 <span className="text-xs font-normal text-slate-400">次</span></div>
            <div className="text-[10px] text-slate-400">已划拨二级学院总额</div>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-[11px] font-bold text-slate-500">全校已使用检测次数</div>
            <div className="text-xl font-black text-amber-600">3,428 <span className="text-xs font-normal text-slate-400">次</span></div>
            <div className="text-[10px] text-slate-400">师生检测已抵扣消耗</div>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-[11px] font-bold text-slate-500">机构总池剩余</div>
            <div className="text-xl font-black text-emerald-600">600 <span className="text-xs font-normal text-slate-400">次</span></div>
            <div className="text-[10px] text-emerald-700 font-medium">可用余额，随时可分</div>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-[11px] font-bold text-slate-500">校方试用总额</div>
            <div className="text-xl font-black text-slate-900">100 <span className="text-xs font-normal text-slate-400">篇</span></div>
            <div className="text-[10px] text-slate-400">平台开题体验赠送</div>
          </div>

          <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-1">
            <div className="text-[11px] font-bold text-slate-500">试用已用 / 剩余</div>
            <div className="text-xl font-black text-blue-600">15 <span className="text-xs font-normal text-slate-400">/ 85 篇</span></div>
            <div className="text-[10px] text-blue-700 font-medium">剩余篇数随时可用</div>
          </div>
        </div>

        {/* Expiration Notice Banner */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-900">到期提醒：</span>
              <span className="text-amber-800">
                本年度秋季集中批次 1,000 次正式检测额度与首批 20 篇试用将于 <strong>2026年12月31日</strong> 到期，建议各学院管理员提醒师生合理安排送检。
              </span>
            </div>
          </div>

          <button
            onClick={() => showToast('已成功向各二级学院管理员推送《额度与试用到期提醒通知》')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shrink-0 cursor-pointer transition-colors shadow-2xs"
          >
            一键群发到期提醒
          </button>
        </div>

        {/* Colleges Allocation Ledger Table */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700">各二级学院检测额度与试用分配台账</div>
          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">学院名称</th>
                    <th className="py-3 px-4">分配额度 (次)</th>
                    <th className="py-3 px-4">已用额度 (次)</th>
                    <th className="py-3 px-4">剩余额度 (次)</th>
                    <th className="py-3 px-4">分配试用</th>
                    <th className="py-3 px-4">已用试用</th>
                    <th className="py-3 px-4">剩余试用</th>
                    <th className="py-3 px-4">到期状态</th>
                    <th className="py-3 px-4 text-right">额度操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {baseCollegesData.map((col) => (
                    <tr key={col.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{col.name}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{col.allocatedQuota.toLocaleString()} 次</td>
                      <td className="py-3.5 px-4 font-mono text-amber-600">{col.creditsConsumed.toLocaleString()} 次</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">{col.creditsBalance.toLocaleString()} 次</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{col.allocatedTrial} 篇</td>
                      <td className="py-3.5 px-4 text-slate-500">{col.usedTrial} 篇</td>
                      <td className="py-3.5 px-4 font-bold text-blue-600">{col.trialBalance} 篇</td>
                      <td className="py-3.5 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          2026/12/31 到期
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setQuotaActionModal({ type: 'allocate', collegeName: col.name, isOpen: true });
                            }}
                            className="text-xs font-bold text-sky-600 hover:text-sky-800 bg-sky-50 px-2 py-1 rounded cursor-pointer"
                          >
                            划拨
                          </button>
                          <button
                            onClick={() => {
                              setQuotaActionModal({ type: 'recycle', collegeName: col.name, isOpen: true });
                            }}
                            className="text-xs font-bold text-amber-600 hover:text-amber-800 bg-amber-50 px-2 py-1 rounded cursor-pointer"
                          >
                            回收
                          </button>
                          <button
                            onClick={() => {
                              showToast(`已导出【${col.name}】2026学年检测额度与试用收支对账单.xlsx`);
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded cursor-pointer"
                          >
                            对账单
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. 第七个区域：待办与提醒区 (待审核、待审批送检、待审批额度、不足预警等)    */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              07. 待办与提醒区 (To-Dos & Alerts)
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
              机构综合治理待办任务与系统异常预警
            </h2>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            共 <strong className="text-rose-600 font-bold">{pendingMembers.length + pendingInspections.length + pendingQuotas.length}</strong> 项待审批任务
          </div>
        </div>

        {/* 6 Category To-Do Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Item 1: 待审核成员 */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                <Users className="w-4 h-4 text-sky-600" />
                <span>待审核成员加入 ({pendingMembers.length})</span>
              </div>
              <span className="text-[11px] text-sky-600 font-bold">身份校准</span>
            </div>

            <div className="space-y-2 text-xs">
              {pendingMembers.length === 0 ? (
                <div className="text-slate-400 py-3 text-center">暂无待审核成员</div>
              ) : (
                pendingMembers.map((m) => (
                  <div key={m.id} className="p-2.5 bg-white rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900">{m.name} ({m.role})</div>
                      <div className="text-[10px] text-slate-400">{m.college} · {m.reason}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setPendingMembers(prev => prev.filter(item => item.id !== m.id));
                          showToast(`已批准【${m.name}】加入机构`);
                        }}
                        className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded font-bold cursor-pointer text-[11px]"
                      >
                        通过
                      </button>
                      <button
                        onClick={() => {
                          setPendingMembers(prev => prev.filter(item => item.id !== m.id));
                          showToast(`已驳回【${m.name}】的加入申请`);
                        }}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded font-bold cursor-pointer text-[11px]"
                      >
                        驳回
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Item 2: 待审批送检 */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>待审批送检任务 ({pendingInspections.length})</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-bold">篇幅超限核准</span>
            </div>

            <div className="space-y-2 text-xs">
              {pendingInspections.map((ins) => (
                <div key={ins.id} className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-1.5">
                  <div className="font-bold text-slate-900 truncate" title={ins.title}>{ins.title}</div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>{ins.college} · {ins.author}</span>
                    <span className="font-mono font-bold text-indigo-600">{(ins.words / 10000).toFixed(1)}万字</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">{ins.reason}</span>
                    <button
                      onClick={() => {
                        setPendingInspections(prev => prev.filter(item => item.id !== ins.id));
                        showToast(`已特批送检任务《${ins.title}》进入检测队列`);
                      }}
                      className="px-2 py-0.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded font-bold cursor-pointer text-[11px]"
                    >
                      核准开闸
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Item 3: 待审批额度 */}
          <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>待审批超额度申请 ({pendingQuotas.length})</span>
              </div>
              <span className="text-[11px] text-amber-600 font-bold">学院追加</span>
            </div>

            <div className="space-y-2 text-xs">
              {pendingQuotas.map((q) => (
                <div key={q.id} className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{q.college}</span>
                    <span className="font-bold font-mono text-amber-600">+{q.requestCredits.toLocaleString()} 次</span>
                  </div>
                  <div className="text-[10px] text-slate-500">申请人：{q.applicant} · {q.reason}</div>
                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setPendingQuotas(prev => prev.filter(item => item.id !== q.id));
                        showToast(`已批复向【${q.college}】下拨 +${q.requestCredits} 次检测额度`);
                      }}
                      className="px-2 py-0.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded font-bold cursor-pointer text-[11px]"
                    >
                      同意划拨
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Item 4: 检测额度不足提醒 (预警) */}
          <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>检测额度不足预警</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded">
                低于阈值 15%
              </span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              <strong>生命科学学院</strong> 检测额度余额仅剩 <strong>72 次</strong>，预计 3 个工作日内即将耗尽。
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  setQuotaActionModal({ type: 'allocate', collegeName: '生命科学学院', isOpen: true });
                }}
                className="w-full py-1.5 bg-white hover:bg-rose-100/50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                为该学院快速划拨额度
              </button>
            </div>
          </div>

          {/* Item 5: 试用到期提醒 */}
          <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>试用即将到期提醒</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                剩余 &lt; 30天
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>文学院</strong>、<strong>法学院</strong> 合计 13 篇校方体验名额即将到期，请提醒指导老师督促学生预审提交。
            </p>
            <div className="pt-2">
              <button
                onClick={() => showToast('已成功向文学院、法学院发送《试用篇数核销提醒》')}
                className="w-full py-1.5 bg-white hover:bg-amber-100/50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                发送使用催告
              </button>
            </div>
          </div>

          {/* Item 6: 高风险论文提醒 */}
          <div className="p-5 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>新增高风险论文告警</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-200 text-rose-900 rounded">
                实时拦截
              </span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              最新提交的《基于联邦学习与边缘节点协同...》检出 4 处涉密代号与多项格式严重缺失。
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSelectedRiskPaper(riskPapers[0])}
                className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-rose-600/20"
              >
                立即进行专家会审
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. 权限与看板视角对比说明 (机构看板 vs 学院看板)                          */}
      {/* ========================================================================= */}
      <div className="bg-slate-50/90 rounded-3xl border border-slate-200/80 p-5 text-xs text-slate-600 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>权限矩阵与看板模式说明</span>
          </div>
          <span className="text-[11px] text-slate-400">系统内置分级RBAC管控机制</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/70 space-y-1.5">
            <div className="font-extrabold text-sky-700 flex items-center justify-between">
              <span>机构统计看板 (本看板当前模式)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold">面向机构总管理员</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong>范围：</strong>本机构及下属所有学院 · <strong>学院分布：</strong>全校对比分析与排行榜 · <strong>成员管理：</strong>全校汇总分析 · <strong>额度分配对象：</strong>各二级学院 · <strong>风险看板：</strong>全机构全量监控 · <strong>审批：</strong>机构级综合事项。
            </p>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/70 space-y-1.5">
            <div className="font-extrabold text-indigo-700 flex items-center justify-between">
              <span>学院统计看板 (点击学院即可下钻进入)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">面向学院管理员</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <strong>范围：</strong>仅限本学院 · <strong>学院分布：</strong>无跨学院对比，聚焦本院系课题组 · <strong>成员管理：</strong>师生明细档案 · <strong>额度分配对象：</strong>学院内部具体师生 · <strong>风险看板：</strong>仅本学院送检论文 · <strong>审批：</strong>学院级流程。
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: Quota Quick Action Modal (Allocate / Recycle)                    */}
      {/* ========================================================================= */}
      {quotaActionModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="font-black text-slate-900 text-base flex items-center gap-2">
                <Coins className="w-5 h-5 text-sky-600" />
                <span>
                  {quotaActionModal.type === 'allocate' ? '向学院划拨额度' : '回收学院留存额度'}
                </span>
              </div>
              <button
                onClick={() => setQuotaActionModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-500 font-bold">目标学院</label>
                <div className="text-sm font-black text-slate-900 mt-1 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  {quotaActionModal.collegeName}
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-bold">
                  {quotaActionModal.type === 'allocate' ? '划拨正式检测次数 (次)' : '回收正式检测次数 (次)'}
                </label>
                <input
                  type="number"
                  value={actionQuotaValue}
                  onChange={(e) => setActionQuotaValue(Number(e.target.value))}
                  step={10}
                  className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="p-3 bg-sky-50 text-sky-800 rounded-xl text-[11px] leading-relaxed">
                {quotaActionModal.type === 'allocate'
                  ? '划拨完成后，该学院管理员可进一步将额度精准分配给本院老师或学生，用于论文全真检测。'
                  : '回收将把该学院尚未消耗的富余机动额度退回至机构总池，随时可调配给其他有需求的学院。'}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setQuotaActionModal(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setQuotaActionModal(prev => ({ ...prev, isOpen: false }));
                  showToast(
                    quotaActionModal.type === 'allocate'
                      ? `已成功向【${quotaActionModal.collegeName}】下拨 ${actionQuotaValue.toLocaleString()} 次检测额度`
                      : `已从【${quotaActionModal.collegeName}】回收 ${actionQuotaValue.toLocaleString()} 次检测额度至机构总池`
                  );
                }}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm shadow-sky-500/20"
              >
                确认执行
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Risk Paper Details Modal                                         */}
      {/* ========================================================================= */}
      {selectedRiskPaper && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="font-black text-slate-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>论文风险排查与合规审计详情</span>
              </div>
              <button
                onClick={() => setSelectedRiskPaper(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <div className="text-[11px] text-slate-400">论文题目</div>
                <div className="font-bold text-slate-900 text-sm leading-snug">
                  {selectedRiskPaper.title}
                </div>
                <div className="text-[11px] text-slate-500 flex gap-3 pt-1">
                  <span>学院：<strong>{selectedRiskPaper.college}</strong></span>
                  <span>送检人：<strong>{selectedRiskPaper.author}</strong> ({selectedRiskPaper.role})</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 bg-rose-50 rounded-xl text-center">
                  <div className="text-[10px] text-rose-800">风险评级</div>
                  <div className="text-sm font-black text-rose-700 mt-0.5">{selectedRiskPaper.riskLevel}</div>
                </div>
                <div className="p-3 bg-slate-100 rounded-xl text-center">
                  <div className="text-[10px] text-slate-500">规范瑕疵数</div>
                  <div className="text-sm font-black text-slate-800 mt-0.5">{selectedRiskPaper.issuesCount} 处</div>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl text-center">
                  <div className="text-[10px] text-amber-800">敏感词命中</div>
                  <div className="text-sm font-black text-amber-700 mt-0.5">{selectedRiskPaper.sensitiveHitCount} 处</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-800">合规审计检出详情：</div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2 text-[11px] text-slate-600">
                  <div className="flex items-start gap-1.5 text-rose-700">
                    <span className="font-bold shrink-0">1. 敏感要素：</span>
                    <span>正文第 14、28 页检出 4 处涉密专项代码未做脱敏代称处理。</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-amber-700">
                    <span className="font-bold shrink-0">2. 隐私信息：</span>
                    <span>附录调查问卷中包含未隐匿的受访人手机号与工作单位全称。</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-600">
                    <span className="font-bold shrink-0">3. 格式规范：</span>
                    <span>参考文献著录格式缺少 12 处出版年份，三线表表头未跨页重复。</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400">检测时间：{selectedRiskPaper.detectTime}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedRiskPaper(null);
                    showToast(`已向作者【${selectedRiskPaper.author}】退回并要求整改脱敏`);
                  }}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  驳回整改
                </button>
                <button
                  onClick={() => {
                    setSelectedRiskPaper(null);
                    showToast(`已将《${selectedRiskPaper.title}》标记为已复核合格`);
                  }}
                  className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm shadow-sky-500/20"
                >
                  复核通过
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
