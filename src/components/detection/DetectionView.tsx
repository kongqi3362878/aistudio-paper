import { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Layers, 
  CheckCircle2, 
  Type, 
  Image as ImageIcon, 
  Table, 
  BookOpen, 
  AlertCircle,
  Clock,
  Trash2,
  FolderPlus,
  GraduationCap,
  Building2
} from 'lucide-react';
import { DetectionTab, PaperDetectionRecord, BatchTask, UserProfile } from '../../types';

interface DetectionViewProps {
  user: UserProfile;
  onDetectionComplete: (newRecord: PaperDetectionRecord) => void;
  onBatchCreated: (newBatch: BatchTask) => void;
  onOpenRecharge: () => void;
  initialTab?: DetectionTab;
}

export default function DetectionView({
  user,
  onDetectionComplete,
  onBatchCreated,
  onOpenRecharge,
  initialTab = 'single',
}: DetectionViewProps) {
  const [activeTab, setActiveTab] = useState<DetectionTab>(initialTab);
  
  // Single upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');
  const singleFileInputRef = useRef<HTMLInputElement>(null);

  // Batch upload state
  const now = new Date();
  const defaultBatchName = `批量检测任务 ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const [batchName, setBatchName] = useState(defaultBatchName);
  const [batchFiles, setBatchFiles] = useState<{ name: string; size: string; words: number; cost: number }[]>([]);
  const batchFileInputRef = useRef<HTMLInputElement>(null);

  // Single file handler
  const handleSingleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const fileName = file.name;
    const isDocx = fileName.endsWith('.docx');
    const isPdf = fileName.endsWith('.pdf');

    if (!isDocx && !isPdf) {
      alert('请上传 .docx 或 .pdf 格式的论文文档！');
      return;
    }

    setUploading(true);
    setUploadProgress(15);
    setUploadStage('正在解析文档结构与文字...');

    setTimeout(() => {
      setUploadProgress(45);
      setUploadStage('多维度学术规范智能审查 (错别字、病句、图表)...');
    }, 700);

    setTimeout(() => {
      setUploadProgress(80);
      setUploadStage('校验参考文献与格式三线表...');
    }, 1500);

    setTimeout(() => {
      setUploadProgress(100);
      setUploadStage('检测完成，生成报告中...');

      const words = Math.floor(15000 + Math.random() * 25000);
      const cost = Math.floor((words / 10000) * 1600);
      const issues = Math.floor(25 + Math.random() * 80);

      const newRecord: PaperDetectionRecord = {
        id: `rec-${Date.now()}`,
        title: fileName.replace(/\.(docx|pdf)$/i, ''),
        filename: fileName,
        author: '-',
        uploadTime: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
        status: '已完成',
        issuesCount: issues,
        cost: cost,
        issuesSummary: {
          typos: Math.floor(issues * 0.4),
          grammar: Math.floor(issues * 0.2),
          images: Math.floor(issues * 0.2),
          tables: Math.floor(issues * 0.15),
          citations: Math.max(1, Math.floor(issues * 0.05)),
        },
      };

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
        onDetectionComplete(newRecord);
      }, 500);
    }, 2200);
  };

  // Batch file handler
  const handleBatchFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems = Array.from(files).map((f) => {
      const words = Math.floor(12000 + Math.random() * 30000);
      return {
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
        words,
        cost: Math.floor((words / 10000) * 1600),
      };
    });
    setBatchFiles((prev) => [...prev, ...newItems]);
  };

  const handleCreateBatch = () => {
    if (batchFiles.length === 0) {
      alert('请先选择需要批量检测的论文文件');
      return;
    }

    const totalCost = batchFiles.reduce((acc, cur) => acc + cur.cost, 0);
    const newBatch: BatchTask = {
      id: `batch-${Date.now()}`,
      title: batchName || defaultBatchName,
      createTime: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')} 共 ${batchFiles.length} 篇论文`,
      totalPapers: batchFiles.length,
      completedPapers: batchFiles.length,
      waiting: 0,
      processing: 0,
      failed: 0,
      progress: 100,
      duration: '用时 3 分钟',
      canDownloadZip: true,
    };

    onBatchCreated(newBatch);
    setBatchFiles([]);
  };

  const totalBatchCost = batchFiles.reduce((acc, cur) => acc + cur.cost, 0);

  return (
    <div id="detection-view" className="space-y-8 w-full max-w-[1760px] 2xl:max-w-[1920px] mx-auto pb-16 font-sans">
      {/* 1. Header with View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">规范检测</h1>
          <p className="text-base text-slate-500 mt-1">上传论文，查看规范检测结果。</p>
        </div>

        {/* Toggle Pill Buttons */}
        <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 self-start sm:self-auto shadow-2xs">
          <button
            id="tab-single-detection"
            onClick={() => setActiveTab('single')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            单篇检测
          </button>
          <button
            id="tab-batch-detection"
            onClick={() => setActiveTab('batch')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            批量上传
          </button>
        </div>
      </div>

      {/* 2. Content: Single Detection (Screenshot 3) */}
      {activeTab === 'single' ? (
        <div className="space-y-8">
          {/* Main Upload Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 lg:p-14 space-y-10">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                上传您的学术论文
              </h2>
              <p className="text-base text-slate-500">
                支持 DOCX 与 PDF，检查文字、图表和参考文献。
              </p>
              {user.isInstitutionMember ? (
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/80 shadow-2xs">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    校方试用专享：剩余 {user.institutionTrialPapers ?? 2} 篇免费可用
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-2xs">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    {user.college || '计算机学院'}专款：{(user.allocatedQuota ?? 1200).toLocaleString()} 积分
                  </span>
                  <span className="text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full text-xs">
                    优先免自费扣减校方试用 (自付 ¥0.00)
                  </span>
                </div>
              ) : (
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5 text-sm">
                  <span className="text-slate-600">
                    已用 <span className="font-bold text-slate-900">{user.usedBalance.toLocaleString()}</span> · 余额{' '}
                    <span className="font-black text-blue-600">{user.balance.toLocaleString()}</span> 积分
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200/80 font-bold text-xs">
                    8折 · 短稿 800 起
                  </span>
                  <span className="text-slate-400">
                    <span className="line-through">2,000</span> <span className="font-bold text-slate-700">1,600</span> 积分 / 万字
                  </span>
                </div>
              )}
            </div>

            {/* Dashed Dropzone */}
            <input
              type="file"
              ref={singleFileInputRef}
              onChange={(e) => handleSingleFiles(e.target.files)}
              accept=".docx,.pdf"
              className="hidden"
            />

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleSingleFiles(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-3xl p-12 sm:p-16 text-center transition-all flex flex-col items-center justify-center space-y-5 cursor-pointer ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/60 scale-[1.01]'
                  : 'border-slate-200/90 hover:border-blue-500 hover:shadow-lg bg-slate-50/50 hover:bg-white'
              }`}
            >
              {uploading ? (
                <div className="w-full max-w-lg space-y-5 py-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-md">
                    <FileText className="w-8 h-8 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-bold text-slate-800">{uploadStage}</p>
                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-500 font-mono font-semibold">{uploadProgress}%</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-50 to-blue-50 text-indigo-600 flex items-center justify-center shadow-xs">
                    <Upload className="w-10 h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-lg sm:text-xl font-bold text-slate-800">拖拽论文文件到此处</p>
                    <p className="text-sm text-slate-400">或点击此处选择 .docx / .pdf 文件</p>
                  </div>
                  <button
                    id="btn-select-single-file"
                    type="button"
                    onClick={() => singleFileInputRef.current?.click()}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 text-white font-bold text-base px-8 py-3.5 rounded-2xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    选择文件
                  </button>
                </>
              )}
            </div>

            {/* 4 Steps Indicator Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex items-center gap-3 text-slate-700 font-medium">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span>选择 DOCX 或 PDF 文件</span>
              </div>
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex items-center gap-3 text-slate-700 font-medium">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span>校验格式和额度</span>
              </div>
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex items-center gap-3 text-slate-700 font-medium">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span>上传并开始检测</span>
              </div>
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 flex items-center gap-3 text-slate-700 font-medium">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <span>在历史记录查看报告</span>
              </div>
            </div>
          </div>

          {/* 5 Capability Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all text-center space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <Type className="w-5 h-5" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">错别字检测</h4>
              <p className="text-xs text-slate-400 line-clamp-1">形近同音字识别</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all text-center space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">病句检测</h4>
              <p className="text-xs text-slate-400 line-clamp-1">句法逻辑深度分析</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all text-center space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">图片规范</h4>
              <p className="text-xs text-slate-400 line-clamp-1">分辨率与标注审查</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all text-center space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Table className="w-5 h-5" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">表格规范</h4>
              <p className="text-xs text-slate-400 line-clamp-1">三线表与数据对应</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all text-center space-y-2.5 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900">参考文献</h4>
              <p className="text-xs text-slate-400 line-clamp-1">GB/T 规范格式校验</p>
            </div>
          </div>
        </div>
      ) : (
        /* 3. Content: Batch Upload (Screenshot 4) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form, Stats & Dropzone */}
          <div className="lg:col-span-8 space-y-6">
            {/* 批次名称 Card */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <label className="block text-base font-bold text-slate-900">批次名称</label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                className="w-full px-5 py-3 rounded-2xl border border-slate-200 text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-xs sm:text-sm text-slate-400">
                选择 DOCX / PDF 文件后，在这里确认文件清单和额度占用。
              </p>
            </div>

            {/* 4 Stats Bar */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs grid grid-cols-4 divide-x divide-slate-100 text-center">
              <div>
                <p className="text-xs sm:text-sm text-slate-400">已选择论文</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{batchFiles.length}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-400">可上传</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{batchFiles.length}</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-400">异常文件</p>
                <p className="text-2xl font-black text-slate-400 mt-1">0</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-400">预计扣除积分</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{totalBatchCost.toLocaleString()}</p>
              </div>
            </div>

            {/* 确认文件清单 Card & Dropzone */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">确认文件清单</h3>
                <p className="text-sm text-slate-400">先选择一批 DOCX / PDF 文件。</p>
              </div>

              <input
                type="file"
                ref={batchFileInputRef}
                onChange={(e) => handleBatchFiles(e.target.files)}
                multiple
                accept=".docx,.pdf"
                className="hidden"
              />

              {batchFiles.length === 0 ? (
                <div
                  onClick={() => batchFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-3xl p-12 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-white hover:shadow-md flex flex-col items-center justify-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-base sm:text-lg font-bold text-slate-800">选择 DOCX / PDF 文件</p>
                    <p className="text-xs sm:text-sm text-slate-400">支持一次选择多篇论文，单篇不超过 300MB。</p>
                  </div>
                  <button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-xs transition-colors"
                  >
                    选择文件
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-2xl">
                    {batchFiles.map((file, idx) => (
                      <div key={idx} className="p-4 flex items-center justify-between text-sm hover:bg-slate-50">
                        <div className="flex items-center gap-3 truncate max-w-sm">
                          <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                          <span className="text-slate-400 text-xs">({file.size})</span>
                        </div>
                        <div className="flex items-center gap-5 shrink-0">
                          <span className="text-slate-500">约 {file.words.toLocaleString()} 字</span>
                          <span className="font-bold text-blue-600">{file.cost.toLocaleString()} 积分</span>
                          <button
                            onClick={() => setBatchFiles((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => batchFileInputRef.current?.click()}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1.5 font-bold"
                  >
                    + 继续添加文件
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: "创建前确认" Sidebar Panel */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 sticky top-28">
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">创建前确认</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  创建后可在历史记录中查看本批进度，并下载已完成的报告。
                </p>
              </div>

              {/* Financial Calculation */}
              <div className="space-y-3 text-sm text-slate-600 pt-3 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>当前还剩：</span>
                  <span className="font-bold text-slate-900">{user.balance.toLocaleString()} 积分</span>
                </div>
                <div className="flex justify-between">
                  <span>本批预计扣除：</span>
                  <span className="font-bold text-blue-600">{totalBatchCost.toLocaleString()} 积分</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold">
                  <span>创建后还剩：</span>
                  <span className="text-slate-900 font-extrabold">
                    {Math.max(0, user.balance - totalBatchCost).toLocaleString()} 积分
                  </span>
                </div>
              </div>

              {/* Price Tag */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-500 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-bold">积分计费规则</span>
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold">
                    8折优惠
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  <span className="line-through">2,000</span> 1,600 积分 / 万字 · 短稿 800 起
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <button
                  id="btn-create-batch-task"
                  onClick={handleCreateBatch}
                  disabled={batchFiles.length === 0}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 disabled:opacity-50 text-white rounded-2xl text-base font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FolderPlus className="w-5 h-5" />
                  创建批量任务
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => batchFileInputRef.current?.click()}
                    className="py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                  >
                    选择 DOCX / PDF
                  </button>
                  <button
                    onClick={() => setBatchFiles([])}
                    disabled={batchFiles.length === 0}
                    className="py-2.5 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 text-slate-500 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
                  >
                    清空重选
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-400 text-center">
                确认无误后创建批量检测任务。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
