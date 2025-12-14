import { Link } from 'react-router-dom';
import { Avatar } from '@/components/common/Avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Video, Heart, MessageCircle, Play } from 'lucide-react';
import { formatNumber, getMediaUrl, getAvatarUrl } from '@/lib/utils';

interface SearchVideoGridProps {
  videos: any[];
  isLoading: boolean;
}

export function SearchVideoGrid({ videos, isLoading }: SearchVideoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="aspect-[9/16] rounded-lg" />
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-32">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gray-800 mb-4">
            <Video className="h-12 w-12 text-gray-500" />
          </div>
        </div>
        <p className="text-white text-2xl font-bold mb-3">
          Không tìm thấy video
        </p>
        <p className="text-gray-400 text-base">
          Thử tìm kiếm với từ khóa khác
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {videos.map((video: any) => (
        <Link
          key={video.id}
          to={`/video/${video.id}`}
          className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-900 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
        >
          {/* Thumbnail */}
          <img
            src={getMediaUrl(video.thumbUrl ?? video.thumb_url)}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          
          {/* Play Icon Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-12 w-12 text-white fill-white" />
            </div>
          </div>

          {/* Stats Overlay - Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
            <p className="text-white text-sm font-medium line-clamp-2 mb-2">
              {video.title}
            </p>
            <div className="flex items-center gap-3 text-white text-xs">
              <div className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 fill-current" />
                <span>{formatNumber(video.likes_count ?? video.likesCount ?? 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{formatNumber(video.comments_count ?? video.commentsCount ?? 0)}</span>
              </div>
            </div>
          </div>

          {/* User Info - Top Right */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
            <Avatar 
              src={getAvatarUrl(video.avatarUrl ?? video.avatar_url)} 
              alt={video.username ?? video.user_name}
              size="sm"
              className="w-5 h-5"
            />
            <span className="text-white text-xs font-medium max-w-[80px] truncate">
              {video.username ?? video.user_name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
