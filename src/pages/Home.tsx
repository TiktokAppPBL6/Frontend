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
        <div className="h-screen flex flex-col items-center justify-center bg-black px-4">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#1e1e1e] mb-8">
            <svg className="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-white font-bold text-2xl mb-3">Chưa có video nào</h3>
          <p className="text-gray-400 text-base text-center max-w-md mb-8">
            Hãy theo dõi những người bạn thích hoặc khám phá nội dung mới
          </p>
          <div className="flex gap-3">
            <a href="/following" className="px-6 py-3 bg-[#1e1e1e] hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors">
              Đang Follow
            </a>
            <a href="/upload" className="px-6 py-3 bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white rounded-lg font-semibold transition-colors">
              Tải video lên
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
