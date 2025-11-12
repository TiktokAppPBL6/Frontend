import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { videosApi } from '@/api/videos.api';
import { FeedVideo } from '@/components/video/FeedVideo';
import { VideoSkeleton } from '@/components/ui/skeleton';
import { UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {isLoading ? (
        <div className="space-y-8 p-4">
          <VideoSkeleton />
          <VideoSkeleton />
        </div>
      ) : videosData?.videos && videosData.videos.length > 0 ? (
        <div className="w-full">
          {videosData.videos.map((video) => (
            <div key={video.id} className="h-screen snap-start snap-always">
              <FeedVideo
                video={video}
                isInView={currentVideoId === video.id}
                onVideoInView={handleVideoInView}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="h-screen flex flex-col items-center justify-center px-4">
          <div className="text-center max-w-sm">
            {/* Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-800">
                <UserPlus className="w-16 h-16 text-gray-400" strokeWidth={1.5} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-3">
              Chưa có video
            </h2>

            {/* Description */}
            <p className="text-gray-400 text-base mb-8 leading-relaxed">
              Video từ những tài khoản bạn theo dõi sẽ xuất hiện tại đây
            </p>

            {/* CTA Button */}
            <Link 
              to="/home"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white font-semibold rounded-lg transition-colors"
            >
              Khám phá video
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
