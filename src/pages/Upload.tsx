import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/common/FormInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { videosApi } from '@/api/videos.api';
import { Upload as UploadIcon, Video } from 'lucide-react';
import toast from 'react-hot-toast';

export function Upload() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public' as 'public' | 'hidden',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const uploadMutation = useMutation({
    mutationFn: videosApi.uploadVideo,
    onSuccess: (video) => {
      toast.success('Video đã được tải lên thành công!');
      navigate(`/video/${video.id}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Tải video thất bại');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('video/')) {
        setErrors({ file: 'Vui lòng chọn file video' });
        return;
      }

      // Validate file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        setErrors({ file: 'File quá lớn. Kích thước tối đa 100MB' });
        return;
      }

      // Validate video duration (max 120 seconds)
      const videoUrl = URL.createObjectURL(selectedFile);
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoUrl);
        
        if (video.duration > 120) {
          setErrors({ file: 'Video quá dài. Độ dài tối đa 120 giây (2 phút)' });
          return;
        }

        // All validations passed
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setErrors({});
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(videoUrl);
        setErrors({ file: 'Không thể đọc thông tin video' });
      };

      video.src = videoUrl;
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }

    if (!file) {
      newErrors.file = 'Vui lòng chọn video để tải lên';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    uploadMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      file: file!,
      visibility: formData.visibility,
    });
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-8">
      <div className="container mx-auto max-w-2xl px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <UploadIcon className="h-6 w-6" />
              Tải video lên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Video</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#FE2C55] transition-colors">
                  {preview ? (
                    <div className="space-y-4">
                      <video
                        src={preview}
                        controls
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                        }}
                      >
                        Chọn video khác
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Video className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">Chọn video để tải lên</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="video-upload"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById('video-upload')?.click()}
                      >
                        Chọn video
                      </Button>
                    </>
                  )}
                </div>
                {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
              </div>

              {/* Title */}
              <FormInput
                label="Tiêu đề"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={errors.title}
                placeholder="Nhập tiêu đề video..."
                required
              />

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE2C55]"
                  placeholder="Mô tả video của bạn..."
                />
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Hiển thị</label>
                <select
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData({ ...formData, visibility: e.target.value as 'public' | 'hidden' })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE2C55]"
                >
                  <option value="public">Công khai</option>
                  <option value="hidden">Riêng tư</option>
                </select>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? 'Đang tải lên...' : 'Đăng video'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
