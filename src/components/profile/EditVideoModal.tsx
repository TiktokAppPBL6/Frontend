import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { videosApi } from '@/api/videos.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface EditVideoModalProps {
  video: any;
  onClose: () => void;
}

export function EditVideoModal({ video, onClose }: EditVideoModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(video.title || '');
  const [description, setDescription] = useState(video.description || '');
  
  // Determine initial privacy: private if privacy='private' OR visibility='hidden'
  const isInitiallyPrivate = 
    video.privacy === 'private' || 
    video.is_private === true || 
    video.visibility === 'hidden';
  const [privacy, setPrivacy] = useState<'public' | 'private'>(
    isInitiallyPrivate ? 'private' : 'public'
  );

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => videosApi.updateVideo(video.id, data),
    onSuccess: () => {
      toast.success('Đã cập nhật video');
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video', video.id] });
      onClose();
    },
    onError: () => {
      toast.error('Không thể cập nhật video');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }
    updateMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      privacy,
      visibility: privacy === 'private' ? 'hidden' : 'public',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-gray-900 font-bold text-lg">Chỉnh sửa video</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề video..."
              maxLength={150}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/150</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả video của bạn..."
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE2C55]/20 focus:border-[#FE2C55] resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Quyền riêng tư</label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setPrivacy('public')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                  privacy === 'public'
                    ? 'border-[#FE2C55] bg-[#FE2C55]/5'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  privacy === 'public' ? 'border-[#FE2C55]' : 'border-gray-300'
                )}>
                  {privacy === 'public' && (
                    <div className="w-3 h-3 rounded-full bg-[#FE2C55]" />
                  )}
                </div>
                <Globe className={cn('h-5 w-5', privacy === 'public' ? 'text-[#FE2C55]' : 'text-gray-500')} />
                <div className="flex-1 text-left">
                  <p className={cn('font-semibold text-sm', privacy === 'public' ? 'text-gray-900' : 'text-gray-700')}>
                    Công khai
                  </p>
                  <p className="text-xs text-gray-500">Mọi người có thể xem</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPrivacy('private')}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all',
                  privacy === 'private'
                    ? 'border-[#FE2C55] bg-[#FE2C55]/5'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                  privacy === 'private' ? 'border-[#FE2C55]' : 'border-gray-300'
                )}>
                  {privacy === 'private' && (
                    <div className="w-3 h-3 rounded-full bg-[#FE2C55]" />
                  )}
                </div>
                <Lock className={cn('h-5 w-5', privacy === 'private' ? 'text-[#FE2C55]' : 'text-gray-500')} />
                <div className="flex-1 text-left">
                  <p className={cn('font-semibold text-sm', privacy === 'private' ? 'text-gray-900' : 'text-gray-700')}>
                    Riêng tư
                  </p>
                  <p className="text-xs text-gray-500">Chỉ mình bạn xem được</p>
                </div>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={updateMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
