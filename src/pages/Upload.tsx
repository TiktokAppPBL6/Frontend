import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/common/FormInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { videosApi } from '@/api/videos.api';
import { Upload as UploadIcon, Video, Languages, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function Upload() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public' as 'public' | 'hidden',
    enableDubbing: false,
    speakerId: 'id_1' as 'id_1' | 'id_2' | 'id_3' | 'id_4',
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
    } else if (formData.title.length > 150) {
      newErrors.title = 'Tiêu đề không được vượt quá 150 ký tự';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Mô tả không được vượt quá 500 ký tự';
    }

    if (!file) {
      newErrors.file = 'Vui lòng chọn video để tải lên';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Vui lòng không để trống tiêu đề');
      return;
    }

    uploadMutation.mutate({
      title: formData.title,
      description: formData.description || undefined,
      file: file!,
      visibility: formData.visibility,
      enableDubbing: formData.enableDubbing,
      speakerId: formData.enableDubbing ? formData.speakerId : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] py-6">
      <div className="container mx-auto max-w-2xl px-4">
        <Card className="bg-[#1e1e1e] border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2 text-white">
              <UploadIcon className="h-6 w-6" />
              Tải video lên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Video</label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-[#FE2C55] transition-colors bg-[#121212]">
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
                        className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
                      >
                        Chọn video khác
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Video className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                      <p className="text-gray-400 mb-2">Chọn video để tải lên</p>
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
                        className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white"
                      >
                        Chọn video
                      </Button>
                    </>
                  )}
                </div>
                {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Tiêu đề <span className="text-red-500">*</span></label>
                  <span className={`text-xs transition-colors ${
                    formData.title.length > 150 
                      ? "text-red-500 font-medium" 
                      : formData.title.length > 135 
                        ? "text-yellow-500" 
                        : "text-gray-500"
                  }`}>
                    {formData.title.length}/150
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, title: value });
                    // Realtime validation
                    if (value.length > 150) {
                      setErrors({ ...errors, title: 'Tiêu đề không được vượt quá 150 ký tự' });
                    } else if (errors.title) {
                      const newErrors = { ...errors };
                      delete newErrors.title;
                      setErrors(newErrors);
                    }
                  }}
                  className="w-full rounded-md border border-gray-700 bg-[#121212] text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE2C55] placeholder:text-gray-500"
                  placeholder="Nhập tiêu đề video..."
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                {formData.title.length > 150 && !errors.title && (
                  <p className="text-sm text-red-500 font-medium">Vượt quá giới hạn!</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">Mô tả</label>
                  <span className={`text-xs transition-colors ${
                    formData.description.length > 500 
                      ? "text-red-500 font-medium" 
                      : formData.description.length > 450 
                        ? "text-yellow-500" 
                        : "text-gray-500"
                  }`}>
                    {formData.description.length}/500
                  </span>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({ ...formData, description: value });
                    // Realtime validation
                    if (value.length > 500) {
                      setErrors({ ...errors, description: 'Mô tả không được vượt quá 500 ký tự' });
                    } else if (errors.description) {
                      const newErrors = { ...errors };
                      delete newErrors.description;
                      setErrors(newErrors);
                    }
                  }}
                  className="w-full min-h-[100px] rounded-md border border-gray-700 bg-[#121212] text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE2C55] placeholder:text-gray-500"
                  placeholder="Mô tả video của bạn..."
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                {formData.description.length > 500 && !errors.description && (
                  <p className="text-sm text-red-500 font-medium">Vượt quá giới hạn!</p>
                )}
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Hiển thị</label>
                <select
                  value={formData.visibility}
                  onChange={(e) =>
                    setFormData({ ...formData, visibility: e.target.value as 'public' | 'hidden' })
                  }
                  className="w-full rounded-md border border-gray-700 bg-[#121212] text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE2C55]"
                >
                  <option value="public">Công khai</option>
                  <option value="hidden">Riêng tư</option>
                </select>
              </div>

              {/* Dubbing Section */}
              <div className="space-y-4 p-4 rounded-lg border border-gray-700 bg-[#121212]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#FE2C55] to-[#FF6B9D]">
                    <Languages className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white">Lồng tiếng tự động</h3>
                    <p className="text-xs text-gray-400">Chuyển đổi giọng nói trong video sang tiếng Việt</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, enableDubbing: !formData.enableDubbing })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.enableDubbing ? 'bg-[#FE2C55]' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.enableDubbing ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Voice Selection */}
                {formData.enableDubbing && (
                  <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Chọn giọng đọc
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'id_1', label: 'Giọng nữ trẻ', icon: '👩', desc: 'Tươi trẻ, năng động' },
                        { id: 'id_2', label: 'Giọng nam trẻ', icon: '👨', desc: 'Trẻ trung, rõ ràng' },
                        { id: 'id_3', label: 'Giọng nữ trung niên', icon: '👩‍💼', desc: 'Ấm áp, chuyên nghiệp' },
                        { id: 'id_4', label: 'Giọng nam trung niên', icon: '👨‍💼', desc: 'Trầm ấm, thuyết phục' },
                      ].map((voice) => (
                        <button
                          key={voice.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, speakerId: voice.id as any })}
                          className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                            formData.speakerId === voice.id
                              ? 'border-[#FE2C55] bg-[#FE2C55]/10'
                              : 'border-gray-700 bg-[#1e1e1e] hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-2xl">{voice.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white">{voice.label}</div>
                              <div className="text-xs text-gray-400 mt-0.5">{voice.desc}</div>
                            </div>
                          </div>
                          {formData.speakerId === voice.id && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#FE2C55] flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-blue-300">
                        AI sẽ tự động phát hiện giọng nói trong video và chuyển đổi sang tiếng Việt. Quá trình xử lý có thể mất vài phút.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-transparent border-gray-600 text-white hover:bg-gray-800"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white"
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
