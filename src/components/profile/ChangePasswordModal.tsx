import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/auth.api';
import { Button } from '@/components/ui/button';
import { X, Lock, Eye, EyeOff } from 'lucide-react';
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
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
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
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className={`w-full px-4 py-3 pr-12 bg-[#1E1E1E] border-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE2C55]/20 transition-all placeholder:text-gray-500 ${
                  errors.currentPassword ? 'border-red-500' : 'border-gray-800 focus:border-[#FE2C55]'
                }`}
                placeholder="Nhập mật khẩu hiện tại"
                disabled={changePasswordMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-red-400 mt-1">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className={`w-full px-4 py-3 pr-12 bg-[#1E1E1E] border-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE2C55]/20 transition-all placeholder:text-gray-500 ${
                  errors.newPassword ? 'border-red-500' : 'border-gray-800 focus:border-[#FE2C55]'
                }`}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                disabled={changePasswordMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-400 mt-1">{errors.newPassword}</p>
            )}
            {formData.newPassword && formData.newPassword.length < 6 && (
              <p className="text-xs text-gray-400 mt-1">
                {formData.newPassword.length}/6 ký tự
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full px-4 py-3 pr-12 bg-[#1E1E1E] border-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE2C55]/20 transition-all placeholder:text-gray-500 ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-800 focus:border-[#FE2C55]'
                }`}
                placeholder="Nhập lại mật khẩu mới"
                disabled={changePasswordMutation.isPending}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-400 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

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
