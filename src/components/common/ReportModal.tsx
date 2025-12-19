import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'video' | 'comment' | 'user';
  targetId: number;
  targetInfo?: {
    title?: string;
    username?: string;
  };
}

const REPORT_REASONS = {
  video: [
    'Nội dung bạo lực hoặc gây sốc',
    'Nội dung khiêu dâm hoặc nhạy cảm',
    'Spam hoặc lừa đảo',
    'Thông tin sai lệch',
    'Xâm phạm quyền riêng tư',
    'Vi phạm bản quyền',
    'Ngôn ngữ thù hận',
    'Khác',
  ],
  comment: [
    'Spam',
    'Ngôn ngữ thù hận hoặc bắt nạt',
    'Quấy rối',
    'Thông tin sai lệch',
    'Nội dung không phù hợp',
    'Khác',
  ],
  user: [
    'Giả mạo danh tính',
    'Spam hoặc bot',
    'Hành vi quấy rối',
    'Nội dung không phù hợp',
    'Tài khoản lừa đảo',
    'Khác',
  ],
};

export function ReportModal({ isOpen, onClose, targetType, targetId }: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');

  const createReportMutation = useMutation({
    mutationFn: reportsApi.createReport,
    onSuccess: () => {
      toast.success('Báo cáo của bạn đã được gửi. Cảm ơn bạn đã giúp chúng tôi duy trì cộng đồng an toàn!');
      handleClose();
    },
    onError: () => {
      toast.error('Không thể gửi báo cáo. Vui lòng thử lại!');
    },
  });

  const handleClose = () => {
    setSelectedReason('');
    setDescription('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason) {
      toast.error('Vui lòng chọn lý do báo cáo');
      return;
    }

    createReportMutation.mutate({
      targetType,
      targetId,
      reason: selectedReason,
      description: description.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  const reasons = REPORT_REASONS[targetType];
  const targetLabel = {
    video: 'video',
    comment: 'bình luận',
    user: 'người dùng',
  }[targetType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#1e1e1e] rounded-lg shadow-xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#FE2C55]" />
            <h2 className="text-lg font-semibold text-white">
              Báo cáo {targetLabel}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Reasons */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vì sao bạn báo cáo {targetLabel} này? *
              </label>
              <div className="space-y-2">
                {reasons.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedReason === reason
                        ? 'bg-[#FE2C55]/10 border-[#FE2C55]'
                        : 'bg-[#2a2a2a] border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="w-4 h-4 text-[#FE2C55] bg-gray-800 border-gray-700 focus:ring-[#FE2C55] focus:ring-2"
                    />
                    <span className="text-sm text-gray-200">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mô tả chi tiết (tùy chọn)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Thêm thông tin chi tiết để giúp chúng tôi hiểu rõ hơn về vấn đề..."
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FE2C55] resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/500 ký tự
              </p>
            </div>

            {/* Notice */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300">
                💡 <strong>Lưu ý:</strong> Báo cáo của bạn sẽ được giữ bí mật. 
                Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 bg-[#1e1e1e]">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createReportMutation.isPending}
                className="flex-1 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={!selectedReason || createReportMutation.isPending}
                className="flex-1 bg-[#FE2C55] text-white hover:bg-[#FE2C55]/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createReportMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang gửi...</span>
                  </div>
                ) : (
                  'Gửi báo cáo'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
