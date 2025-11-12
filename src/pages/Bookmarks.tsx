import { useQuery } from '@tanstack/react-query';
import { socialApi } from '@/api/social.api';
import { Skeleton } from '@/components/ui/skeleton';
import { Bookmark, Heart, MessageCircle, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMediaUrl, formatNumber } from '@/lib/utils';

export function Bookmarks() {
  const { data: bookmarksData, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => socialApi.getMyBookmarks(),
  });

  // API returns array directly or object with videos property
  const videos = Array.isArray(bookmarksData) 
    ? bookmarksData 
    : bookmarksData?.videos ?? (bookmarksData as any)?.items ?? (bookmarksData as any)?.data ?? [];
  const total = videos.length;

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="container mx-auto max-w-6xl pt-20 pb-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FE2C55] to-[#F50057] text-white shadow-lg">
            <Bookmark className="h-7 w-7 fill-current" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Video đã lưu</h1>
            <p className="text-sm text-gray-400 mt-1">
              {total > 0 ? `${total} video đã đánh dấu` : 'Chưa có video nào'}
            </p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="aspect-[9/16] rounded-lg" />
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
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

                {/* Bookmark Badge - Top Right */}
                <div className="absolute top-2 right-2 bg-[#FE2C55] text-white p-1.5 rounded-full shadow-lg">
                  <Bookmark className="h-3.5 w-3.5 fill-current" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gray-800 mb-4">
                <Bookmark className="h-12 w-12 text-gray-500" />
              </div>
            </div>
            <p className="text-white text-2xl font-bold mb-3">
              Chưa có video đã lưu
            </p>
            <p className="text-gray-400 text-base max-w-md mx-auto">
              Các video bạn đánh dấu sẽ xuất hiện ở đây.<br />
              Nhấn vào icon bookmark khi xem video để lưu lại.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
