import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store/auth';
import { usersApi } from '@/api/users.api';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/common/FormInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/common/Avatar';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export function Settings() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
  });
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      let result = user;
      
      // POST /users/me/avatar - Upload avatar first if selected
      if (selectedAvatar) {
        console.log('📤 POST /users/me/avatar - Uploading avatar...');
        result = await usersApi.uploadAvatar(selectedAvatar);
      }
      
      // PUT /users/me - Update profile info if changed
      const hasProfileChanges = 
        formData.fullName !== user?.fullName || 
        formData.username !== user?.username;
      
      if (hasProfileChanges) {
        console.log('📝 PUT /users/me - Updating profile info...');
        result = await usersApi.updateMe(formData);
      }
      
      return result;
    },
    onSuccess: (updatedUser) => {
      if (updatedUser) {
        updateUser(updatedUser);
      }
      toast.success('Đã cập nhật hồ sơ');
      // Clear preview after successful upload
      setSelectedAvatar(null);
      setPreviewUrl(null);
    },
    onError: (error: any) => {
      console.error('Update failed:', error.response?.data || error.message);
      toast.error(error.response?.data?.detail || 'Không thể cập nhật hồ sơ');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File ảnh quá lớn (tối đa 5MB)');
        return;
      }
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setSelectedAvatar(file);
      toast.success('Ảnh đã được chọn. Nhấn "Lưu thay đổi" để cập nhật.');
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-white pt-20 pb-8">
      <div className="container mx-auto max-w-2xl px-4">
        <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ảnh đại diện</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar 
                  src={previewUrl || user?.avatarUrl} 
                  alt={user?.username} 
                  size="xl" 
                  className="h-24 w-24" 
                />
                {previewUrl && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white" 
                    title="Ảnh mới đã chọn"
                  />
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 p-2 bg-[#FE2C55] rounded-full cursor-pointer hover:bg-[#FE2C55]/90 transition-colors"
                >
                  <Camera className="h-4 w-4 text-white" />
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={updateMutation.isPending}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Click vào biểu tượng camera để thay đổi ảnh đại diện
                </p>
                <p className="text-xs text-gray-500">
                  Định dạng: JPG, PNG. Kích thước tối đa: 5MB
                </p>
                {selectedAvatar && (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    ✓ Đã chọn: {selectedAvatar.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <FormInput
                label="Email"
                value={user?.email || ''}
                disabled
                className="bg-gray-100"
              />

              <Button
                type="submit"
                className="w-full"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
