import { useRef, useEffect, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '@/types';
import { VideoActions } from './VideoActions';
import { SubtitleDisplay } from './SubtitleDisplay';
import { useAuthStore } from '@/app/store/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMediaUrl, getAvatarUrl } from '@/lib/utils';
import { CommentsModal } from '@/components/comments/CommentsModal';
import { socialApi } from '@/api/social.api';
import { videosApi } from '@/api/videos.api';
import toast from 'react-hot-toast';

interface FeedVideoProps {
  video: Video;
  isInView?: boolean;
  onVideoInView?: (videoId: number, inView: boolean) => void;
}

function FeedVideoComponent({ video, isInView = false, onVideoInView }: FeedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<number>(0); // Use ref instead of state
  const hasPlayedOnce = useRef<boolean>(false); // Track if video has been played once
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [subtitleLanguage, setSubtitleLanguage] = useState<'off' | 'en' | 'vi'>('off');
  const [isDubbing, setIsDubbing] = useState(false);
  const currentUser = useAuthStore((s) => s.user);
  
  // Owner info: API returns username, fullName, avatarUrl directly at video level
  const v: any = video;
  const ownerId = v.ownerId ?? v.owner_id ?? (v.owner as any)?.id ?? null;
  const ownerUsername: string = v.username ?? v.user_name ?? (v.owner as any)?.username ?? '';
  const ownerFullName: string = v.fullName ?? v.full_name ?? (v.owner as any)?.fullName ?? '';
  const ownerAvatar: string = getAvatarUrl(v.avatarUrl ?? v.avatar_url ?? (v.owner as any)?.avatarUrl);
  const isOwnVideo = currentUser?.id === ownerId;
  
  // Follow state from video data
  const initialFollow = v.is_following ?? v.isFollowing ?? (v.owner as any)?.is_following ?? false;
  const [isFollowing, setIsFollowing] = useState<boolean>(!!initialFollow);
  const queryClient = useQueryClient();

  // Fetch video transcript/subtitles
  const { data: transcriptData } = useQuery({
    queryKey: ['video-transcript', video.id],
    queryFn: () => videosApi.getVideoTranscript(video.id),
    enabled: subtitleLanguage !== 'off',
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!ownerId) throw new Error('Invalid user ID');
      if (isFollowing) {
        await socialApi.unfollowUser(ownerId);
      } else {
        await socialApi.followUser(ownerId);
      }
    },
    onSuccess: () => {
      setIsFollowing((prev) => !prev);
      // Don't invalidate queries to prevent page refresh
      toast.success(isFollowing ? 'Đã bỏ theo dõi' : 'Đã theo dõi');
    },
    onError: (error: any) => {
      console.error('Follow error:', error);
      toast.error('Không thể thực hiện hành động này');
    },
  });

  // Intersection Observer for autoplay - only triggers once per video
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView = entry.isIntersecting && entry.intersectionRatio >= 0.6;
          onVideoInView?.(video.id, inView);

          if (videoRef.current) {
            if (inView) {
              // Only auto-unmute and play on first view
              if (!hasPlayedOnce.current) {
                videoRef.current.muted = isDubbing ? true : false;
                setIsMuted(false);
                hasPlayedOnce.current = true;
              }
              videoRef.current.play().catch((e) => console.log('Play failed:', e));
              setIsPlaying(true);
              
              // Sync audio if dubbing is enabled
              if (isDubbing && audioRef.current) {
                audioRef.current.currentTime = videoRef.current.currentTime;
                audioRef.current.play().catch((e) => console.log('Audio play failed:', e));
              }
            } else {
              videoRef.current.pause();
              setIsPlaying(false);
              
              // Pause audio if dubbing
              if (isDubbing && audioRef.current) {
                audioRef.current.pause();
              }
            }
          }
        });
      },
      {
        threshold: [0.6],
        rootMargin: '0px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [video.id, onVideoInView, isDubbing]);

  // Update progress bar and current time
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress || 0);
      currentTimeRef.current = video.currentTime; // Update ref, no re-render
    };

    const handleSeeked = () => {
      // Sync audio when video is seeked
      if (isDubbing && audio) {
        audio.currentTime = video.currentTime;
      }
    };

    const handlePlay = () => {
      // Sync audio when video plays
      if (isDubbing && audio) {
        audio.currentTime = video.currentTime;
        audio.play().catch(e => console.log('Audio play failed:', e));
      }
    };

    const handlePause = () => {
      // Pause audio when video pauses
      if (isDubbing && audio) {
        audio.pause();
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', updateProgress);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [isDubbing]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    video.currentTime = percentage * video.duration;
    
    // Sync audio if dubbing
    if (isDubbing && audioRef.current) {
      audioRef.current.currentTime = video.currentTime;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
    if (audioRef.current && isDubbing) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  };

  const toggleDubbing = () => {
    const newIsDubbing = !isDubbing;
    setIsDubbing(newIsDubbing);
    
    const videoEl = videoRef.current;
    const audioEl = audioRef.current;
    
    if (!videoEl || !audioEl) return;
    
    // Always sync audio to current video time
    audioEl.currentTime = videoEl.currentTime;
    
    if (newIsDubbing) {
      // Switch to dubbing: mute video, play audio
      videoEl.muted = true;
      audioEl.muted = isMuted;
      if (!videoEl.paused) {
        audioEl.play().catch(e => console.log('Audio play failed:', e));
      }
    } else {
      // Switch to original: unmute video, pause audio
      videoEl.muted = isMuted;
      audioEl.pause();
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        if (isDubbing && audioRef.current) {
          audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        if (isDubbing && audioRef.current) {
          audioRef.current.pause();
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-black"
    >
      {/* Main Container with Video and Actions Side by Side */}
      <div className="relative flex items-end justify-center gap-4 px-4">
        {/* Video Container - Modern, clean design */}
        <div className="relative max-w-[800px] max-h-full flex items-center justify-center group">
          <video
            ref={videoRef}
            src={getMediaUrl(video.hlsUrl || video.url)}
            poster={getMediaUrl(video.thumbUrl)}
            className="max-w-full max-h-[calc(100vh-40px)] object-contain cursor-pointer rounded-3xl shadow-2xl"
            loop
            playsInline
            muted={isDubbing ? true : isMuted}
            onClick={handleVideoClick}
            style={{ pointerEvents: 'auto' }}
          />

          {/* Audio dubbing track - hidden, synced with video */}
          {video.audio_vi && (
            <audio
              ref={audioRef}
              src={getMediaUrl(video.audio_vi)}
              loop
              style={{ display: 'none' }}
            />
          )}

          {/* Subtitles - Smart positioning to avoid UI overlap */}
          {subtitleLanguage !== 'off' && transcriptData?.timestamps && (
            <SubtitleDisplay
              timestamps={transcriptData.timestamps}
              currentTimeRef={currentTimeRef}
              language={subtitleLanguage}
              className="bottom-5"
            />
          )}

          {/* Progress Bar - Minimal, elegant */}
          <div 
            className="absolute bottom-2 left-2 right-2 h-0.5 bg-white/15 rounded-full cursor-pointer group/progress hover:h-1 transition-all z-10 opacity-0 group-hover:opacity-100"
            onClick={handleProgressClick}
            style={{ pointerEvents: 'auto' }}
          >
            <div 
              className="h-full bg-gradient-to-r from-[#FE2C55] to-[#FF6B9D] rounded-full transition-all duration-100 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Bottom Gradient Overlay for better text readability */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-3xl pointer-events-none" />

          {/* User Info & Title - Compact, elegant */}
          <div className="absolute bottom-6 left-4 right-4 pointer-events-auto z-10">
            <div className="flex items-start gap-3">
              {/* Compact User Info */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    @{ownerUsername}
                  </span>
                  {isOwnVideo && (
                    <span className="text-xs px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded text-white/90">(Bạn)</span>
                  )}
                </div>
                <p className="text-white text-xs sm:text-sm font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] line-clamp-1 leading-tight">
                  {video.title}
                </p>
                {video.description && (
                  <div className="text-white/90 text-xs sm:text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                    {showFullDesc || video.description.length <= 80 ? (
                      <>
                        <p className="whitespace-pre-wrap break-words line-clamp-2">{video.description}</p>
                        {video.description.length > 80 && (
                          <button 
                            onClick={(e)=>{e.stopPropagation(); setShowFullDesc(false);}} 
                            className="font-semibold text-white/70 hover:text-white transition-colors mt-0.5"
                          >
                            Rút gọn
                          </button>
                        )}
                      </>
                    ) : (
                      <button 
                        onClick={(e)=>{e.stopPropagation(); setShowFullDesc(true);}} 
                        className="font-semibold text-white/70 hover:text-white transition-colors"
                      >
                        {video.description.slice(0,80)}... <span className="text-white">xem thêm</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Column - Outside video, aligned with video bottom */}
        <div className="flex-shrink-0 flex flex-col items-center gap-4 pb-1 relative z-50" style={{ pointerEvents: 'auto' }}>
          {/* Avatar with Follow Button */}
          <div className="relative w-12 pb-1" style={{ pointerEvents: 'auto' }}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/user/${ownerId}`);
              }}
              className="block transition-transform hover:scale-105 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shadow-lg">
                <img
                  src={avatarError ? '/avatar.jpg' : ownerAvatar}
                  alt={ownerUsername}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              </div>
            </button>
            {/* Follow/Unfollow button */}
            {!isOwnVideo && ownerId && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!followMutation.isPending) followMutation.mutate();
                }}
                disabled={followMutation.isPending}
                aria-label={isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FE2C55] text-white flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-white hover:brightness-110 disabled:opacity-70 transition-all cursor-pointer"
              >
                {isFollowing ? '✓' : '+'}
              </button>
            )}
          </div>
          
          {/* Video Actions */}
          <VideoActions
            video={video}
            onCommentClick={() => setShowComments(true)}
            isMuted={isMuted}
            onMuteToggle={toggleMute}
            subtitleLanguage={subtitleLanguage}
            onSubtitleChange={setSubtitleLanguage}
            isDubbing={isDubbing}
            onDubbingToggle={toggleDubbing}
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
export const FeedVideo = memo(FeedVideoComponent, (prevProps, nextProps) => {
  // Only re-render if video ID or isInView changes
  return prevProps.video.id === nextProps.video.id && prevProps.isInView === nextProps.isInView;
});
