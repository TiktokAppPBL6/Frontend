import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { videosApi } from '@/api/videos.api';
import { FeedVideo } from '@/components/video/FeedVideo';
import { VideoSkeleton } from '@/components/ui/skeleton';

export function Following() {
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);

  // Get following feed directly from API
  const { data: videosData, isLoading } = useQuery({
    queryKey: ['videos', 'following'],
    queryFn: () => videosApi.getFollowingFeed({ page: 1, pageSize: 20 }),
  });

  const handleVideoInView = useCallback((videoId: number, inView: boolean) => {
    if (inView) {
      setCurrentVideoId(videoId);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-[600px] pt-20 pb-8">
        {isLoading ? (
          <div className="space-y-8">
            <VideoSkeleton />
            <VideoSkeleton />
          </div>
        ) : videosData?.videos && videosData.videos.length > 0 ? (
          <div className="snap-y snap-mandatory">
            {videosData.videos.map((video) => (
              <FeedVideo
                key={video.id}
                video={video}
                isInView={currentVideoId === video.id}
                onVideoInView={handleVideoInView}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="mb-6">
              <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-900 text-xl font-semibold mb-2">
              Chưa có video nào
            </p>
            <p className="text-gray-500 text-sm">
              Hãy theo dõi người dùng để xem video của họ ở đây
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
