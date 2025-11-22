import { useQuery } from '@tanstack/react-query';
import { videosApi } from '@/api/videos.api';
import { VideoFeed } from '@/components/video/VideoFeed';
import { EmptyState } from '@/components/video/EmptyState';
import { VideoSkeleton } from '@/components/ui/skeleton';
import { UserPlus } from 'lucide-react';

export function Following() {
  const { data: videosData, isLoading } = useQuery({
    queryKey: ['videos', 'following'],
    queryFn: () => videosApi.getFollowingFeed({ page: 1, pageSize: 20 }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes to prevent refetch flicker
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const videos = videosData?.videos || [];

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {isLoading ? (
        <div className="h-screen flex items-center justify-center">
          <VideoSkeleton />
        </div>
      ) : (
        <VideoFeed
          videos={videos}
          emptyState={
            <EmptyState
              icon={UserPlus}
              title="Chưa có video"
              description="Video từ những tài khoản bạn theo dõi sẽ xuất hiện tại đây"
              primaryAction={{ label: "Khám phá video", href: "/home" }}
            />
          }
        />
      )}
    </div>
  );
}
