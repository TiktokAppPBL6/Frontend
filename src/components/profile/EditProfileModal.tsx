import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/app/store/auth';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/common/FormInput';
import { getMediaUrl } from '@/lib/utils';
import { Camera, X } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
      });
    }
  }, [user, isOpen]);

  // Cleanup preview URL on unmount or close
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      let result = user;
      // Verify current password first by re-login
      if (!user?.email) throw new Error('Thiếu thông tin email');
      if (!currentPassword) {
        setPasswordError('Vui lòng nhập mật khẩu để xác thực');
        throw new Error('Thiếu mật khẩu');
      }
      // Verify password via dedicated endpoint
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
      onClose();
    },
    onError: (error: any) => {
      console.error('Update failed:', error.response?.data || error.message);
      toast.error(error.response?.data?.detail || passwordError || 'Không thể cập nhật hồ sơ');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Chỉnh sửa hồ sơ</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <p className="text-sm font-medium mb-3">Ảnh hồ sơ</p>
            <div className="relative inline-block">
              <Avatar src={previewUrl || getMediaUrl(user?.avatarUrl)} alt={user?.username} size="xl" className="h-24 w-24" />
              <label htmlFor="modal-avatar-upload" className="absolute bottom-0 right-0 p-2 bg-[#FE2C55] rounded-full cursor-pointer hover:bg-[#FE2C55]/90 transition-colors">
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
            <p className="text-xs text-gray-500 mt-2">Định dạng: JPG, PNG. Tối đa 5MB</p>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="rounded-md border p-3 bg-gray-50">
              <p className="text-sm font-medium mb-2">Xác thực bảo mật</p>
              <FormInput
                label="Mật khẩu hiện tại"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu để xác thực"
                disabled={updateMutation.isPending}
              />
              {passwordError && (
                <p className="text-xs text-red-600 mt-1">{passwordError}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">Vì lý do bảo mật, bạn cần nhập mật khẩu để thay đổi thông tin hồ sơ.</p>
            </div>
            <FormInput
              label="Tên hiển thị"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Nhập tên của bạn"
              disabled={updateMutation.isPending}
            />
            <FormInput
              label="Tên người dùng"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="username"
              disabled={updateMutation.isPending}
            />
            <FormInput label="Email" value={user?.email || ''} disabled className="bg-gray-100" />
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
            Hủy
          </Button>
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || !currentPassword}>
            {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </div>
      </div>
    </div>
  );
}
