import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/app/store/auth';
import { socialApi } from '@/api/social.api';
import { videosApi } from '@/api/videos.api';
import { FeedVideo } from '@/components/video/FeedVideo';
import { VideoSkeleton } from '@/components/ui/skeleton';

export function Following() {
  const user = useAuthStore((state) => state.user);
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);

  // Get following list
  const { data: followingData } = useQuery({
    queryKey: ['following', user?.id],
    queryFn: () => socialApi.getFollowing(user!.id),
    enabled: !!user,
  });

  // Get videos from followed users
  const { data: videosData, isLoading } = useQuery({
    queryKey: ['videos', 'following', user?.id],
    queryFn: async () => {
      if (!followingData?.following.length) {
        return { videos: [], total: 0 };
      }
      
      // Fetch videos from each followed user
      const videoPromises = followingData.following.map((followedUser) =>
        videosApi.getUserVideos(followedUser.id, { page: 1, pageSize: 5 })
      );
      
      const results = await Promise.all(videoPromises);
      const allVideos = results.flatMap((r) => r.videos);
      
      // Sort by createdAt descending
      allVideos.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return { videos: allVideos, total: allVideos.length };
    },
    enabled: !!user && !!followingData,
  });

  const handleVideoInView = (videoId: number, inView: boolean) => {
    if (inView) {
      setCurrentVideoId(videoId);
    }
  };

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto max-w-[600px] pt-20 pb-8">
        {isLoading ? (
          <div className="space-y-8">
            <VideoSkeleton />
            <VideoSkeleton />
          </div>
        ) : videosData?.videos && videosData.videos.length > 0 ? (
          <div className="snap-y snap-mandatory overflow-y-auto">
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
            <p className="text-white text-lg mb-4">
              Bạn chưa theo dõi ai
            </p>
            <p className="text-gray-400">
              Hãy theo dõi người dùng để xem video của họ ở đây
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
