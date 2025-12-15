import { useState, useCallback, memo } from 'react';
import { UniversalVideoPlayer } from './UniversalVideoPlayer';
import { VideoSkeleton } from '@/components/ui/skeleton';
import { Video } from '@/types';

interface VideoFeedProps {
  videos: Video[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

function VideoFeedComponent({ videos, isLoading, emptyState }: VideoFeedProps) {
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(
    videos.length > 0 ? videos[0].id : null
  );

  const handleVideoInView = useCallback((videoId: number, inView: boolean) => {
    if (inView) {
      setCurrentVideoId(videoId);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <VideoSkeleton />
      </div>
    );
  }

  if (videos.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="w-full">
      {videos.map((video) => (
        <div key={video.id} className="h-screen snap-start snap-always">
          <UniversalVideoPlayer
            video={video}
            mode="feed"
            isInView={currentVideoId === video.id}
            onVideoInView={handleVideoInView}
          />
        </div>
      ))}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when navigating between pages
export const VideoFeed = memo(VideoFeedComponent);
