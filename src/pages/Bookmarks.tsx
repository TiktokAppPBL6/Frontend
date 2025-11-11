import { useQuery } from '@tanstack/react-query';
import { socialApi } from '@/api/social.api';
import { VideoCard } from '@/components/profile/VideoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Bookmark } from 'lucide-react';
import { useState } from 'react';
import { EditVideoModal } from '@/components/profile/EditVideoModal';
import { useAuthStore } from '@/app/store/auth';

export function Bookmarks() {
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const currentUser = useAuthStore((state) => state.user);

  const { data: bookmarksData, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => socialApi.getMyBookmarks(),
  });

  // Normalize response - handle various API formats
  const videos = bookmarksData?.videos ?? (bookmarksData as any)?.items ?? (bookmarksData as any)?.data ?? [];
  const total = bookmarksData?.total ?? (bookmarksData as any)?.total_count ?? (bookmarksData as any)?.count ?? videos.length ?? 0;

  return (
    <>
      <div className="min-h-screen bg-white pt-20 pb-8">
        <div className="container mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg">
              <Bookmark className="h-6 w-6 fill-current" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Video đã lưu</h1>
              <p className="text-sm text-gray-500">
                {total > 0 ? `${total} video` : 'Chưa có video nào'}
              </p>
            </div>
          </div>

          {/* Videos Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-[9/16]" />
              ))}
            </div>
          ) : videos && videos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videos.map((video: any) => {
                // Check if this is user's own video
                const isOwnVideo = currentUser?.id === (video.ownerId ?? video.owner_id ?? video.userId ?? video.user_id);
                return (
                  <VideoCard
                    key={video.id}
                    video={video}
                    isOwnVideo={isOwnVideo}
                    onEdit={setEditingVideo}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <Bookmark className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-xl text-gray-900 font-semibold mb-2">
                Chưa có video đã lưu
              </p>
              <p className="text-gray-500">
                Nhấn vào biểu tượng dấu trang để lưu video yêu thích của bạn
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Video Modal */}
      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
        />
      )}
    </>
  );
}
