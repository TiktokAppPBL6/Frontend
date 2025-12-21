import { useState, useCallback, memo, useMemo } from 'react';
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

  // Optimize: Only render videos near the current one to reduce initial load
  // Render current video + 1 before + 2 after (total 4 videos max in DOM)
  const videosToRenderIds = useMemo(() => {
    if (videos.length === 0) return new Set<number>();
    
    const currentIndex = videos.findIndex((v) => v.id === currentVideoId);
    if (currentIndex === -1) {
      // Show first 3 if no current
      return new Set(videos.slice(0, 3).map(v => v.id));
    }
    
    const start = Math.max(0, currentIndex - 1);
    const end = Math.min(videos.length, currentIndex + 3);
    
    return new Set(videos.slice(start, end).map(v => v.id));
  }, [videos, currentVideoId]);

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
      {videos.map((video) => {
        // Check if this video should be rendered
        const shouldRender = videosToRenderIds.has(video.id);
        
        return (
          <div key={video.id} className="h-screen snap-start snap-always">
            {shouldRender ? (
              <UniversalVideoPlayer
                video={video}
                mode="feed"
                isInView={currentVideoId === video.id}
                onVideoInView={handleVideoInView}
              />
            ) : (
              // Placeholder to maintain scroll position
              <div className="w-full h-full bg-black flex items-center justify-center">
                <VideoSkeleton />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders when navigating between pages
export const VideoFeed = memo(VideoFeedComponent);
