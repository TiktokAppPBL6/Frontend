import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { PasswordInput } from './PasswordInput';
import { X, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      // Validate
      const newErrors: Record<string, string> = {};
      
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Mật khẩu phải có ít nhất 6 ký tự';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error('Validation failed');
      }
      
      setErrors({});
      
      // Call API to change password
      await authApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
    },
    onSuccess: () => {
      toast.success('Đã thay đổi mật khẩu thành công');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || error.response?.data?.message || 'Không thể thay đổi mật khẩu';
      toast.error(message);
      if (message.includes('hiện tại') || message.includes('current')) {
        setErrors({ currentPassword: 'Mật khẩu hiện tại không đúng' });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePasswordMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#121212] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FE2C55] to-[#F50057] flex items-center justify-center">
              <Lock className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Đổi mật khẩu</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            disabled={changePasswordMutation.isPending}
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <PasswordInput
            label="Mật khẩu hiện tại"
            value={formData.currentPassword}
            onChange={(value) => setFormData({ ...formData, currentPassword: value })}
            placeholder="Nhập mật khẩu hiện tại"
            error={errors.currentPassword}
            disabled={changePasswordMutation.isPending}
          />

          <PasswordInput
            label="Mật khẩu mới"
            value={formData.newPassword}
            onChange={(value) => setFormData({ ...formData, newPassword: value })}
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            error={errors.newPassword}
            disabled={changePasswordMutation.isPending}
            showCharCount
          />

          <PasswordInput
            label="Xác nhận mật khẩu mới"
            value={formData.confirmPassword}
            onChange={(value) => setFormData({ ...formData, confirmPassword: value })}
            placeholder="Nhập lại mật khẩu mới"
            error={errors.confirmPassword}
            disabled={changePasswordMutation.isPending}
          />

          {/* Info Box */}
          <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-4">
            <p className="text-sm text-blue-400">
              <span className="font-semibold">Lưu ý:</span> Mật khẩu phải có ít nhất 6 ký tự. 
              Nên sử dụng kết hợp chữ cái, số và ký tự đặc biệt để tăng độ bảo mật.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-800 text-white hover:bg-gray-800"
              disabled={changePasswordMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white font-semibold"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
