import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/app/store/auth';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { getAvatarUrl } from '@/lib/utils';
import { Camera, X, Key, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { ChangePasswordModal } from './ChangePasswordModal';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ fullName: '', username: '' });
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
      });
    }
  }, [user, isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      let result = user;
      if (!user?.email) throw new Error('Thiếu thông tin email');
      if (!currentPassword) {
        setPasswordError('Vui lòng nhập mật khẩu để xác thực');
        throw new Error('Thiếu mật khẩu');
      }
      const verify = await authApi.verifyPassword(currentPassword);
      if (!verify.valid) {
        setPasswordError('Mật khẩu không chính xác');
        throw new Error('Invalid password');
      }
      setPasswordError(null);

      if (selectedAvatar) {
        result = await usersApi.uploadAvatar(selectedAvatar);
      }

      const hasProfileChanges =
        formData.fullName !== user?.fullName || formData.username !== user?.username;
      if (hasProfileChanges) {
        result = await usersApi.updateMe(formData);
      }

      return result;
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        updateUser(updatedUser);
        queryClient.invalidateQueries({ queryKey: ['user', updatedUser.id] });
      }
      toast.success('Đã cập nhật hồ sơ');
      setSelectedAvatar(null);
      setPreviewUrl(null);
      setCurrentPassword('');
      onClose();
    },
    onError: (error: any) => {
      console.error('Update profile failed:', error);
      const message = error.response?.data?.detail || error.message || 'Không thể cập nhật hồ sơ';
      if (!passwordError) {
        toast.error(message);
      }
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File ảnh quá lớn (tối đa 5MB)');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedAvatar(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-[#121212] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-800">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Chỉnh sửa hồ sơ</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              disabled={updateMutation.isPending}
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="flex items-center gap-6 pb-6 border-b border-gray-800">
              <div className="relative">
                <Avatar 
                  src={previewUrl || getAvatarUrl(user?.avatarUrl)} 
                  alt={user?.username} 
                  size="xl" 
                  className="h-24 w-24 ring-4 ring-gray-800" 
                />
                <label 
                  htmlFor="modal-avatar-upload" 
                  className="absolute bottom-0 right-0 p-2 bg-gradient-to-br from-[#FE2C55] to-[#F50057] rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg"
                >
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    id="modal-avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={updateMutation.isPending}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">Ảnh đại diện</p>
                <p className="text-xs text-gray-400">Định dạng: JPG, PNG</p>
                <p className="text-xs text-gray-400">Tối đa 5MB</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tên hiển thị
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1E1E1E] border-2 border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE2C55]/20 focus:border-[#FE2C55] transition-all placeholder:text-gray-500"
                  placeholder="Nhập tên của bạn"
                  disabled={updateMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tên người dùng
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1E1E1E] border-2 border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE2C55]/20 focus:border-[#FE2C55] transition-all placeholder:text-gray-500"
                  placeholder="username"
                  disabled={updateMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 bg-[#0A0A0A] border-2 border-gray-800 text-gray-500 rounded-lg cursor-not-allowed"
                />
              </div>

              <div className="bg-amber-950/30 border-2 border-amber-900/50 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Xác thực mật khẩu
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordError(null);
                    }}
                    className={`w-full px-4 py-3 pr-12 bg-[#1E1E1E] border-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all placeholder:text-gray-500 ${
                      passwordError ? 'border-red-500' : 'border-amber-900/50 focus:border-amber-600'
                    }`}
                    placeholder="Nhập mật khẩu để xác nhận thay đổi"
                    disabled={updateMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-sm text-red-400 mt-2">{passwordError}</p>
                )}
                <p className="text-xs text-amber-400/80 mt-2">
                  Vì lý do bảo mật, bạn cần nhập mật khẩu để thay đổi thông tin hồ sơ.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(true)}
                className="flex items-center gap-3 w-full px-4 py-3 bg-[#1E1E1E] hover:bg-[#2A2A2A] border-2 border-gray-800 rounded-lg transition-colors"
                disabled={updateMutation.isPending}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">Đổi mật khẩu</p>
                  <p className="text-xs text-gray-400">Cập nhật mật khẩu của bạn</p>
                </div>
              </button>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-800 text-white hover:bg-gray-800"
                disabled={updateMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white font-semibold"
                disabled={updateMutation.isPending || !currentPassword}
              >
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
    </>
  );
}
