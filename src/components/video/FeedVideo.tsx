import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '@/types';
import { VideoActions } from './VideoActions';
import { useAuthStore } from '@/app/store/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getMediaUrl, getAvatarUrl } from '@/lib/utils';
import { CommentsModal } from '@/components/comments/CommentsModal';
import { socialApi } from '@/api/social.api';
import toast from 'react-hot-toast';

interface FeedVideoProps {
  video: Video;
  isInView?: boolean;
  onVideoInView?: (videoId: number, inView: boolean) => void;
}

export function FeedVideo({ video, isInView = false, onVideoInView }: FeedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false); // Auto-unmute when in view
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [progress, setProgress] = useState(0);
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
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      if (ownerId) queryClient.invalidateQueries({ queryKey: ['user', ownerId] });
      toast.success(isFollowing ? 'Đã bỏ theo dõi' : 'Đã theo dõi');
    },
    onError: (error: any) => {
      console.error('Follow error:', error);
      toast.error('Không thể thực hiện hành động này');
    },
  });

  // Intersection Observer for autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView = entry.isIntersecting && entry.intersectionRatio >= 0.6;
          onVideoInView?.(video.id, inView);

          if (videoRef.current) {
            if (inView) {
              videoRef.current.muted = false; // Auto-unmute when in view
              setIsMuted(false);
              videoRef.current.play().catch((e) => console.log('Play failed:', e));
              setIsPlaying(true);
            } else {
              videoRef.current.pause();
              setIsPlaying(false);
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
  }, [video.id, onVideoInView]);

  // Force play/pause based on isInView prop (for controlling from parent)
  useEffect(() => {
    if (videoRef.current) {
      if (isInView && !isPlaying) {
        videoRef.current.play().catch((e) => console.log('Play failed:', e));
        setIsPlaying(true);
      } else if (!isInView && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isInView]);

  // Update progress bar
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress || 0);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', updateProgress);
    };
  }, []);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    video.currentTime = percentage * video.duration;
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-black"
    >
      {/* Main Container with Video and Actions Side by Side */}
      <div className="relative flex items-end justify-center gap-3 px-4">
        {/* Video Container - Bo tròn, giữ nguyên tỷ lệ khung hình */}
        <div className="relative max-w-[800px] max-h-full flex items-center justify-center">
          <video
            ref={videoRef}
            src={getMediaUrl(video.hlsUrl || video.url)}
            poster={getMediaUrl(video.thumbUrl)}
            className="max-w-full max-h-[calc(100vh-40px)] object-contain cursor-pointer rounded-3xl shadow-2xl"
            loop
            playsInline
            muted={isMuted}
            onClick={handleVideoClick}
          />

          {/* Progress Bar - Interactive, slightly above bottom for rounded corners */}
          <div 
            className="absolute bottom-2 left-2 right-2 h-1 bg-white/20 rounded-full cursor-pointer group hover:h-1.5 transition-all"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-white rounded-full transition-all duration-100 group-hover:bg-[#FE2C55]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Bottom - User Info & Title (inside video) */}
          <div className="absolute bottom-6 left-4 right-4 pointer-events-auto">
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="text-white font-bold text-base drop-shadow-lg">
                    @{ownerUsername}
                    {isOwnVideo && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-white/20 rounded-full">(Bạn)</span>
                    )}
                  </div>
                </div>
                <p className="text-white text-sm font-normal drop-shadow-lg line-clamp-2 leading-tight">
                  {video.title}
                </p>
                {video.description && (
                  <div className="text-white/95 text-sm drop-shadow-lg max-w-[90%]">
                    {showFullDesc || video.description.length <= 100 ? (
                      <>
                        <p className="whitespace-pre-wrap break-words">{video.description}</p>
                        {video.description.length > 100 && (
                          <button onClick={(e)=>{e.stopPropagation(); setShowFullDesc(false);}} className="font-semibold mt-1">
                            Rút gọn
                          </button>
                        )}
                      </>
                    ) : (
                      <button onClick={(e)=>{e.stopPropagation(); setShowFullDesc(true);}} className="font-semibold">
                        {video.description.slice(0,100)}... xem thêm
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions Column - Outside video, aligned with video bottom */}
        <div className="flex-shrink-0 flex flex-col items-center gap-5 pb-1">
          {/* Avatar with Follow Button */}
          <div className="relative w-12 pb-1">
            <button
              onClick={() => navigate(`/user/${ownerId}`)}
              className="block transition-transform hover:scale-105"
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
                  e.stopPropagation();
                  if (!followMutation.isPending) followMutation.mutate();
                }}
                disabled={followMutation.isPending}
                aria-label={isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FE2C55] text-white flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-white hover:brightness-110 disabled:opacity-70 transition-all"
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
          />
        </div>
      </div>
      {showComments && (
        <CommentsModal videoId={video.id} onClose={() => setShowComments(false)} />
      )}
    </div>
  );
}
