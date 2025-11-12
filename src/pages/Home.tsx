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
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {isLoading ? (
        <div className="space-y-8 p-4">
          <VideoSkeleton />
          <VideoSkeleton />
        </div>
      ) : (
        <InfiniteScroll
          onLoadMore={fetchNextPage}
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
        >
          <div className="w-full">
            {allVideos.map((video) => (
              <div key={video.id} className="h-screen snap-start snap-always">
                <FeedVideo
                  video={video}
                  isInView={currentVideoId === video.id}
                  onVideoInView={handleVideoInView}
                />
              </div>
            ))}
          </div>
          {isFetchingNextPage && (
            <div className="h-screen snap-start flex items-center justify-center">
              <VideoSkeleton />
            </div>
          )}
        </InfiniteScroll>
      )}

      {!isLoading && allVideos.length === 0 && (
        <div className="h-screen flex items-center justify-center">
          <p className="text-white text-lg">Chưa có video nào</p>
        </div>
      )}
    </div>
  );
}
