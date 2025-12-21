import { useInfiniteQuery } from '@tanstack/react-query';
import { videosApi } from '@/api/videos.api';
import { VideoFeed } from '@/components/video/VideoFeed';
import { EmptyState } from '@/components/video/EmptyState';
import { VideoSkeleton } from '@/components/ui/skeleton';
import { Video } from 'lucide-react';

/**
 * VideoFeedContainer - Handles infinite scroll video feed
 * Separated for better maintainability and reusability
 */
export function VideoFeedContainer() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['videos', 'feed'],
    queryFn: ({ pageParam = 1 }) => 
      videosApi.getVideos({ 
        page: pageParam, 
        pageSize: 10, 
        sort: 'createdAt', 
        order: 'desc' 
      }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const allVideos = data?.pages.flatMap((page) => page.videos) || [];

  // Trigger load more when scrolling
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight;
    
    if (scrollPercentage > 0.8 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <VideoSkeleton />
      </div>
    );
  }

  return (
    <div 
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black" 
      onScroll={handleScroll}
    >
      <VideoFeed
        videos={allVideos}
        emptyState={
          <EmptyState
            icon={Video}
            title="Chưa có video nào"
            description="Hãy theo dõi những người bạn thích hoặc khám phá nội dung mới"
            secondaryAction={{ label: "Đang Follow", href: "/following" }}
            primaryAction={{ label: "Tải video lên", href: "/upload" }}
          />
        }
      />
      {isFetchingNextPage && (
        <div className="h-screen snap-start flex items-center justify-center">
          <VideoSkeleton />
        </div>
      )}
    </div>
  );
}
