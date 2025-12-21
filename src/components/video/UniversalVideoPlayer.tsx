import { useRef, useState, memo, useEffect } from 'react';
import { Video } from '@/types';
import { VideoActions } from './VideoActions';
import { VideoProgressBar } from './VideoProgressBar';
import { VideoAvatarWithFollow } from './VideoAvatarWithFollow';
import { VideoFeedInfo } from './VideoFeedInfo';
import { VideoPlayerWithSubtitles } from './VideoPlayerWithSubtitles';
import { useAuthStore } from '@/app/store/auth';
import { useQuery } from '@tanstack/react-query';
import { CommentsModal } from '@/components/comments/CommentsModal';
import { videosApi } from '@/api/videos.api';
import { getVideoOwnerInfo } from '@/lib/videoUtils';
import { useVideoSync } from '@/hooks/useVideoSync';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useVideoControls } from '@/hooks/useVideoControls';
import { useVideoAutoplay } from '@/hooks/useVideoAutoplay';
import { useVideoFollow } from '@/hooks/useVideoFollow';

type VideoPlayerMode = 'feed' | 'detail';

interface UniversalVideoPlayerProps {
  video: Video;
  mode?: VideoPlayerMode;
  isInView?: boolean;
  onVideoInView?: (videoId: number, inView: boolean) => void;
  
  // Detail mode props - external control
  externalIsMuted?: boolean;
  externalIsDubbing?: boolean;
  externalSubtitleLanguage?: 'off' | 'en' | 'vi';
  onMuteChange?: (muted: boolean) => void;
  onDubbingChange?: (dubbing: boolean) => void;
  onSubtitleChange?: (lang: 'off' | 'en' | 'vi') => void;
  
  // Detail mode - external follow control
  externalIsFollowing?: boolean;
  onFollowClick?: () => void;
  isFollowPending?: boolean;
}

function UniversalVideoPlayerComponent({
  video,
  mode = 'feed',
  onVideoInView,
  externalIsMuted,
  externalIsDubbing,
  externalSubtitleLanguage,
  onMuteChange,
  onDubbingChange,
  onSubtitleChange,
  externalIsFollowing,
  onFollowClick,
  isFollowPending,
}: UniversalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<number>(0);
  
  const [showComments, setShowComments] = useState(false);
  
  // Internal states for feed mode
  const [internalSubtitleLanguage, setInternalSubtitleLanguage] = useState<'off' | 'en' | 'vi'>('off');
  
  const currentUser = useAuthStore((s) => s.user);
  
  // Extract owner info from video
  const { ownerId, ownerUsername, ownerAvatar, initialFollow } = getVideoOwnerInfo(video);
  const isOwnVideo = currentUser?.id === ownerId;
  
  // Use external or internal control based on mode
  const isFeedMode = mode === 'feed';
  const subtitleLanguage = isFeedMode ? internalSubtitleLanguage : (externalSubtitleLanguage || 'off');
  
  // Video controls - uses internal state but can be controlled externally
  const { isMuted, isDubbing, toggleMute, toggleDubbing, handleVideoClick, setIsMuted, setIsDubbing } = useVideoControls({
    videoRef,
    audioRef,
  });
  
  // Sync external state to internal state for detail mode
  // IMPORTANT: Only update internal state directly, don't call toggle functions
  // Toggle functions are called from handleMuteToggle/handleDubbingToggle
  useEffect(() => {
    if (!isFeedMode && externalIsMuted !== undefined && externalIsMuted !== isMuted) {
      setIsMuted(externalIsMuted);
    }
  }, [isFeedMode, externalIsMuted, isMuted, setIsMuted]);
  
  useEffect(() => {
    if (!isFeedMode && externalIsDubbing !== undefined && externalIsDubbing !== isDubbing) {
      setIsDubbing(externalIsDubbing);
    }
  }, [isFeedMode, externalIsDubbing, isDubbing, setIsDubbing]);
  
  // Use internal states for both modes (synced from external in detail mode)
  const effectiveIsMuted = isMuted;
  const effectiveIsDubbing = isDubbing;

  // Progress bar
  const {
    progress,
    handleProgressClick,
    handleProgressMouseDown,
    handleProgressMouseMove,
    handleProgressMouseUp,
  } = useVideoProgress({
    videoRef,
    audioRef,
    currentTimeRef,
    isDubbing: effectiveIsDubbing,
  });

  // Sync audio with video
  useVideoSync({ videoRef, audioRef, isDubbing: effectiveIsDubbing });

  // Autoplay (only in feed mode)
  useVideoAutoplay({
    videoRef,
    audioRef,
    containerRef,
    videoId: video.id,
    isDubbing: effectiveIsDubbing,
    onVideoInView: isFeedMode ? onVideoInView : undefined,
  });

  // Follow logic (only for feed mode - detail mode uses external)
  const { isFollowing: internalIsFollowing, handleFollowClick: internalHandleFollowClick } = useVideoFollow({
    ownerId,
    initialFollow,
  });
  
  const effectiveIsFollowing = isFeedMode ? internalIsFollowing : (externalIsFollowing ?? false);
  const effectiveHandleFollowClick = isFeedMode ? internalHandleFollowClick : (onFollowClick || (() => {}));
  const effectiveIsFollowPending = isFeedMode ? false : (isFollowPending ?? false);

  // Fetch video transcript/subtitles
  const { data: transcriptData } = useQuery({
    queryKey: ['video-transcript', video.id],
    queryFn: () => videosApi.getVideoTranscript(video.id),
    enabled: subtitleLanguage !== 'off',
    staleTime: 5 * 60 * 1000,
  });

  // Handle control changes
  const handleMuteToggle = () => {
    // Always execute the actual logic (toggleMute handles sync immediately)
    toggleMute();
    
    // Notify parent about the NEW state (after toggle)
    if (!isFeedMode) {
      onMuteChange?.(!isMuted); // Will be the new state after toggle
    }
  };

  const handleDubbingToggle = () => {
    // Always execute the actual logic (toggleDubbing handles audio sync)
    toggleDubbing();
    
    // Notify parent about the NEW state (after toggle)
    if (!isFeedMode) {
      onDubbingChange?.(!isDubbing); // Will be the new state after toggle
    }
  };

  const handleSubtitleChange = (lang: 'off' | 'en' | 'vi') => {
    if (isFeedMode) {
      setInternalSubtitleLanguage(lang);
    } else {
      onSubtitleChange?.(lang);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Full Screen Video Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        <VideoPlayerWithSubtitles
          video={video}
          videoRef={videoRef}
          audioRef={audioRef}
          currentTimeRef={currentTimeRef}
          isMuted={effectiveIsMuted}
          isDubbing={effectiveIsDubbing}
          subtitleLanguage={subtitleLanguage}
          transcriptData={transcriptData}
          onVideoClick={handleVideoClick}
        />

        {/* Progress Bar - Bottom of screen */}
        <VideoProgressBar
          progress={progress}
          onProgressClick={handleProgressClick}
          onProgressMouseDown={handleProgressMouseDown}
          onProgressMouseMove={handleProgressMouseMove}
          onProgressMouseUp={handleProgressMouseUp}
        />

        {/* Video Info - Bottom Left */}
        <VideoFeedInfo
          video={video}
          ownerUsername={ownerUsername}
          isOwnVideo={isOwnVideo}
        />

        {/* Actions Column - Absolute positioned on right side */}
        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-3 z-50" style={{ pointerEvents: 'auto' }}>
          <VideoAvatarWithFollow
            ownerId={ownerId}
            ownerAvatar={ownerAvatar}
            ownerUsername={ownerUsername}
            isOwnVideo={isOwnVideo}
            isFollowing={effectiveIsFollowing}
            onFollowClick={effectiveHandleFollowClick}
            isFollowPending={effectiveIsFollowPending}
          />
          
          <VideoActions
            video={video}
            onCommentClick={() => setShowComments(true)}
            isMuted={effectiveIsMuted}
            onMuteToggle={handleMuteToggle}
            subtitleLanguage={subtitleLanguage}
            onSubtitleChange={handleSubtitleChange}
            isDubbing={effectiveIsDubbing}
            onDubbingToggle={handleDubbingToggle}
          />
        </div>
      </div>
      {showComments && (
        <CommentsModal videoId={video.id} onClose={() => setShowComments(false)} />
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export const UniversalVideoPlayer = memo(UniversalVideoPlayerComponent, (prevProps, nextProps) => {
  // Re-render if video ID changes or mode changes
  if (prevProps.video.id !== nextProps.video.id) return false;
  if (prevProps.mode !== nextProps.mode) return false;
  
  // For feed mode, check isInView
  if (nextProps.mode === 'feed') {
    if (prevProps.isInView !== nextProps.isInView) return false;
  }
  
  // For detail mode, check external control states
  if (nextProps.mode === 'detail') {
    if (prevProps.externalIsMuted !== nextProps.externalIsMuted) return false;
    if (prevProps.externalIsDubbing !== nextProps.externalIsDubbing) return false;
    if (prevProps.externalSubtitleLanguage !== nextProps.externalSubtitleLanguage) return false;
    if (prevProps.externalIsFollowing !== nextProps.externalIsFollowing) return false;
    if (prevProps.isFollowPending !== nextProps.isFollowPending) return false;
  }
  
  return true; // Don't re-render
});
