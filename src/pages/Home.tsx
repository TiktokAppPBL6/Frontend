import { useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { videosApi } from '@/api/videos.api';
import { FeedVideo } from '@/components/video/FeedVideo';
import { VideoSkeleton } from '@/components/ui/skeleton';
import { InfiniteScroll } from '@/components/common/InfiniteScroll';

export function Home() {
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['videos', 'feed'],
    queryFn: ({ pageParam = 1 }) => videosApi.getVideos({ page: pageParam, pageSize: 10, sort: 'createdAt', order: 'desc' }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const allVideos = data?.pages.flatMap((page) => page.videos) || [];

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
        ) : (
          <InfiniteScroll
            onLoadMore={fetchNextPage}
            hasMore={!!hasNextPage}
            isLoading={isFetchingNextPage}
          >
            <div className="snap-y snap-mandatory">
              {allVideos.map((video) => (
                <FeedVideo
                  key={video.id}
                  video={video}
                  isInView={currentVideoId === video.id}
                  onVideoInView={handleVideoInView}
                />
              ))}
            </div>
            {isFetchingNextPage && (
              <div className="py-8">
                <VideoSkeleton />
              </div>
            )}
          </InfiniteScroll>
        )}

        {!isLoading && allVideos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">Chưa có video nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
