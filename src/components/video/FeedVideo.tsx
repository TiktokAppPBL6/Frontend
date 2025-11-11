import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '@/types';
import { VideoActions } from './VideoActions';
import { useAuthStore } from '@/app/store/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getMediaUrl } from '@/lib/utils';
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
  const currentUser = useAuthStore((s) => s.user);
  
  // Owner info: API returns username, fullName, avatarUrl directly at video level
  const v: any = video;
  const ownerId = v.ownerId ?? v.owner_id ?? (v.owner as any)?.id ?? null;
  const ownerUsername: string = v.username ?? v.user_name ?? (v.owner as any)?.username ?? '';
  const ownerFullName: string = v.fullName ?? v.full_name ?? (v.owner as any)?.fullName ?? '';
  const ownerAvatar: string = getMediaUrl(v.avatarUrl ?? v.avatar_url ?? (v.owner as any)?.avatarUrl ?? '');
  const isOwnVideo = currentUser?.id === ownerId;
  
  // Follow state from video data
  const initialFollow = v.is_following ?? v.isFollowing ?? (v.owner as any)?.is_following ?? false;
  const [isFollowing, setIsFollowing] = useState<boolean>(!!initialFollow);
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!ownerId) return;
      if (isFollowing) return socialApi.unfollowUser(ownerId);
      return socialApi.followUser(ownerId);
    },
    onSuccess: () => {
      setIsFollowing((prev) => !prev);
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      if (ownerId) queryClient.invalidateQueries({ queryKey: ['user', ownerId] });
      toast.success(!isFollowing ? 'Đã theo dõi' : 'Đã bỏ theo dõi');
    },
    onError: () => {
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
      className="relative w-full max-w-[600px] mx-auto mb-4 snap-start"
      style={{ minHeight: '100vh' }}
    >
      {/* Video Container */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 100px)' }}>
        <video
          ref={videoRef}
          src={getMediaUrl(video.hlsUrl || video.url)}
          poster={getMediaUrl(video.thumbUrl)}
          className="w-full h-full object-contain cursor-pointer"
          loop
          muted={isMuted}
          playsInline
          onClick={handleVideoClick}
        />

        {/* Overlay Controls */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Right Side - Avatar with Follow Button + Actions (TikTok Style) */}
          <div className="absolute right-2 bottom-10 pointer-events-auto">
            <div className="flex flex-col items-center gap-3">
              {/* Avatar with + button */}
              <div className="relative w-12 pb-1">
                <button
                  onClick={() => navigate(`/user/${ownerId}`)}
                  className="block transition-transform hover:scale-105"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shadow-lg">
                    <img
                      src={ownerAvatar}
                      alt={ownerUsername}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>
                {/* Follow/Unfollow button like TikTok: + when not following, ✓ when following */}
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
              
              {/* Action Buttons incl. menu */}
              <VideoActions
                video={video}
                onCommentClick={() => setShowComments(true)}
                isMuted={isMuted}
                onMuteToggle={toggleMute}
              />
            </div>
          </div>

          {/* Bottom - User Info & Title */}
          <div className="absolute bottom-3 left-3 right-14 pointer-events-auto">
            {/* User Info & Title */}
            <div className="flex-1 min-w-0">
              <div className="inline-block bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 max-w-[80%]">
                <div className="text-white text-xs font-bold truncate">
                  {ownerFullName || ownerUsername}
                  {isOwnVideo && (
                    <span className="ml-1 text-[10px] px-1 py-0.5 bg-white/20 rounded">(Bạn)</span>
                  )}
                </div>
                <p className="text-white/90 text-[11px] truncate">
                  @{ownerUsername}
                </p>
                <p className="text-white text-xs line-clamp-1 leading-tight mt-0.5 font-medium">
                  {video.title}
                </p>
                {video.description && (
                  <div className="text-white/90 text-[11px] leading-snug mt-0.5">
                    {showFullDesc || video.description.length <= 50 ? (
                      <>
                        <p className="whitespace-pre-wrap break-words">{video.description}</p>
                        {video.description.length > 50 && (
                          <button onClick={(e)=>{e.stopPropagation(); setShowFullDesc(false);}} className="underline font-medium">rút gọn</button>
                        )}
                      </>
                    ) : (
                      <button onClick={(e)=>{e.stopPropagation(); setShowFullDesc(true);}} className="underline font-medium">
                        {video.description.slice(0,50)}... xem thêm
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showComments && (
        <CommentsModal videoId={video.id} onClose={() => setShowComments(false)} />
      )}
    </div>
  );
}
