import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { videosApi } from '@/api/videos.api';
import { Upload as UploadIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { FileUploadArea } from '@/components/upload/FileUploadArea';
import { VideoTitleInput } from '@/components/upload/VideoTitleInput';
import { VideoDescriptionInput } from '@/components/upload/VideoDescriptionInput';
import { VisibilitySelect } from '@/components/upload/VisibilitySelect';
import { DubbingSettings } from '@/components/upload/DubbingSettings';

export function Upload() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public' as 'public' | 'hidden',
    enableDubbing: true,
    speakerId: 'id_1' as 'id_1' | 'id_2' | 'id_3' | 'id_4',
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const uploadMutation = useMutation({
    mutationFn: videosApi.uploadVideo,
    onSuccess: () => {
      // Reset form
      setFormData({
        title: '',
        description: '',
        visibility: 'public',
        enableDubbing: true,
        speakerId: 'id_1',
      });
      setFile(null);
      setPreview(null);
      setErrors({});
      
      // Show notification
      toast.success('Video đang được xử lý, sẽ có thông báo sau', {
        duration: 4000,
        icon: '⏳',
      });
      
      // Navigate to home feed
      navigate('/home', { replace: true });
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

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setErrors({});
  };

  const handleTitleChange = (value: string) => {
    setFormData({ ...formData, title: value });
    // Realtime validation
    if (value.length > 150) {
      setErrors({ ...errors, title: 'Tiêu đề không được vượt quá 150 ký tự' });
    } else if (errors.title) {
      const newErrors = { ...errors };
      delete newErrors.title;
      setErrors(newErrors);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value });
    // Realtime validation
    if (value.length > 500) {
      setErrors({ ...errors, description: 'Mô tả không được vượt quá 500 ký tự' });
    } else if (errors.description) {
      const newErrors = { ...errors };
      delete newErrors.description;
      setErrors(newErrors);
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

    // Show uploading message
    toast.success('Video đang được tải lên và xử lý, sẽ có thông báo sau', {
      duration: 4000,
      icon: '⏳',
    });

    // Redirect to home immediately
    navigate('/home', { replace: true });

    // Upload in background
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
              <FileUploadArea
                preview={preview}
                file={file}
                error={errors.file}
                onFileChange={handleFileChange}
                onRemove={handleRemoveFile}
              />

              {/* Title */}
              <VideoTitleInput
                value={formData.title}
                error={errors.title}
                onChange={handleTitleChange}
              />

              {/* Description */}
              <VideoDescriptionInput
                value={formData.description}
                error={errors.description}
                onChange={handleDescriptionChange}
              />

              {/* Visibility */}
              <VisibilitySelect
                value={formData.visibility}
                onChange={(value) => setFormData({ ...formData, visibility: value })}
              />

              {/* Dubbing Settings */}
              <DubbingSettings
                enableDubbing={formData.enableDubbing}
                speakerId={formData.speakerId}
                onEnableChange={(enabled) => setFormData({ ...formData, enableDubbing: enabled })}
                onSpeakerChange={(speakerId) => setFormData({ ...formData, speakerId })}
              />

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
