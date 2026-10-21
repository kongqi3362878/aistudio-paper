import { PaperDetectionRecord } from '../../types';
import ReportDetailView from '../report/ReportDetailView';

interface ReportDetailModalProps {
  record: PaperDetectionRecord | null;
  onClose: () => void;
}

export default function ReportDetailModal({ record, onClose }: ReportDetailModalProps) {
  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
      <ReportDetailView record={record} onBack={onClose} />
    </div>
  );
}
