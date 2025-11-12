import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Edit, Trash2, Lock, Heart, MessageCircle } from 'lucide-react';
import { formatNumber, getMediaUrl } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { videosApi } from '@/api/videos.api';
import toast from 'react-hot-toast';

interface VideoCardProps {
  video: any;
  isOwnVideo?: boolean;
  onEdit?: (video: any) => void;
}

export function VideoCard({ video, isOwnVideo = false, onEdit }: VideoCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => videosApi.deleteVideo(video.id),
    onSuccess: () => {
      toast.success('Đã xóa video');
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: () => {
      toast.error('Không thể xóa video');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc muốn xóa video này?')) {
      deleteMutation.mutate();
    }
    setShowMenu(false);
  };

  const handleEdit = () => {
    onEdit?.(video);
    setShowMenu(false);
  };

  const isPrivate = video.privacy === 'private' || video.is_private === true;

  return (
    <div className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-[#1e1e1e] hover:opacity-90 transition-all cursor-pointer">
      <Link to={`/video/${video.id}`} className="block w-full h-full">
        <img
          src={getMediaUrl(video.thumbUrl ?? video.thumb_url)}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        
        {/* Privacy Badge */}
        {isPrivate && (
          <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Lock className="h-3 w-3" />
          </div>
        )}

        {/* Views Count - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="flex items-center gap-3 text-white text-xs font-semibold">
            <div className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 fill-white text-white" />
              <span>{formatNumber(video.likes_count ?? video.likesCount ?? 0)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5 text-white" />
              <span>{formatNumber(video.comments_count ?? video.commentsCount ?? 0)}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Edit/Delete Menu for own videos */}
      {isOwnVideo && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowMenu(!showMenu);
            }}
            className="w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm hover:bg-black/80 flex items-center justify-center text-white transition-all"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-10 bg-[#1e1e1e] rounded-lg shadow-2xl border border-gray-700 min-w-[160px] py-2 z-20 overflow-hidden">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleEdit();
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Chỉnh sửa</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete();
                  }}
                  disabled={deleteMutation.isPending}
                  className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
