import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { videosApi } from '@/api/videos.api';
import { commentsApi } from '@/api/comments.api';
import { socialApi } from '@/api/social.api';
import { VideoActions } from '@/components/video/VideoActions';
import { SubtitleDisplay } from '@/components/video/SubtitleDisplay';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { formatDate, getMediaUrl, getAvatarUrl } from '@/lib/utils';
import { useAuthStore } from '@/app/store/auth';
import toast from 'react-hot-toast';

export function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const videoId = parseInt(id || '0');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTimeRef = useRef<number>(0);
  
  const [comment, setComment] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [avatarError, setAvatarError] = useState(false);
  const [subtitleLanguage, setSubtitleLanguage] = useState<'off' | 'en' | 'vi'>('off');
  const [isDubbing, setIsDubbing] = useState(false);

  const { data: video, isLoading: videoLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => videosApi.getVideo(videoId),
    enabled: !!videoId,
  });

  // Extract owner info from video data (API trả về trực tiếp trong video object)
  const ownerId = video?.ownerId ?? (video as any)?.owner_id ?? null;
  const ownerUsername = video?.username ?? (video as any)?.user_name ?? '';
  const ownerFullName = video?.fullName ?? (video as any)?.full_name ?? '';
  const ownerAvatar = getAvatarUrl(video?.avatarUrl ?? (video as any)?.avatar_url ?? '');
  const isOwnVideo = currentUser?.id === ownerId;

  // Update follow state when video data changes
  useEffect(() => {
    if (video) {
      const followingStatus = (video as any).is_following ?? false;
      setIsFollowing(followingStatus);
    }
  }, [video]);

  const { data: commentsData } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: () => commentsApi.getVideoComments(videoId),
    enabled: !!videoId,
  });

  // Fetch video transcript/subtitles
  const { data: transcriptData } = useQuery({
    queryKey: ['video-transcript', videoId],
    queryFn: () => videosApi.getVideoTranscript(videoId),
    enabled: subtitleLanguage !== 'off' && !!videoId,
    staleTime: 5 * 60 * 1000,
  });

  // Normalize comments data - API returns { comments: [], total: number }
  const commentsList = commentsData?.comments || [];

  // Update progress bar
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress || 0);
      currentTimeRef.current = video.currentTime;
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
    
    if (newIsDubbing) {
      // Switch to dubbing: mute video, play audio
      videoEl.muted = true;
      audioEl.currentTime = videoEl.currentTime;
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

  const commentMutation = useMutation({
    mutationFn: commentsApi.createComment,
    onMutate: async (newComment) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comments', videoId] });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(['comments', videoId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['comments', videoId], (old: any) => {
        const oldComments = old?.comments || [];
        const optimisticComment = {
          id: Date.now(),
          content: newComment.content,
          createdAt: new Date().toISOString(),
          userId: currentUser?.id,
          username: currentUser?.username,
          fullName: currentUser?.fullName,
          avatarUrl: currentUser?.avatarUrl,
        };
        return {
          comments: [optimisticComment, ...oldComments],
          total: (old?.total || 0) + 1,
        };
      });

      return { previousComments };
    },
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      toast.success('Đã thêm bình luận');
    },
    onError: (_err, _newComment, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', videoId], context.previousComments);
      }
      toast.error('Không thể thêm bình luận');
    },
  });

  const followMutation = useMutation({
    mutationFn: () => {
      if (!ownerId) throw new Error('Invalid user ID');
      return isFollowing ? socialApi.unfollowUser(ownerId) : socialApi.followUser(ownerId);
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Đã bỏ theo dõi' : 'Đã theo dõi');
      queryClient.invalidateQueries({ queryKey: ['video', videoId] });
    },
    onError: () => {
      toast.error('Không thể thực hiện hành động này');
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      commentMutation.mutate({ videoId, content: comment.trim() });
    }
  };

  const handleFollowClick = () => {
    if (!ownerId || followMutation.isPending) return;
    followMutation.mutate();
  };

  if (videoLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <p className="text-white">Đang tải...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Không tìm thấy video</p>
          <Button onClick={() => navigate('/home')}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black">
      {/* Fixed Header - Transparent overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/70 to-transparent">
        <div className="px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            size="sm"
            className="text-white hover:bg-white/10 text-xs backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Button>
        </div>
      </div>

      {/* Video Section - Full screen */}
      <div className="h-screen flex items-center justify-center bg-black relative">
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
              autoPlay
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

            {/* User Info & Title - Compact, elegant at bottom */}
            <div className="absolute bottom-6 left-4 right-4 pointer-events-auto z-10">
              <div className="flex items-start gap-3">
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
                </div>
              </div>
            </div>
          </div>

          {/* Actions Column - Next to video, aligned with video bottom */}
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
              {!isOwnVideo && ownerId && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!followMutation.isPending) handleFollowClick();
                  }}
                  disabled={followMutation.isPending}
                  aria-label={isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FE2C55] text-white flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-white hover:brightness-110 disabled:opacity-70 transition-all cursor-pointer"
                >
                  {isFollowing ? '✓' : '+'}
                </button>
              )}
            </div>

            <VideoActions
              video={video}
              onCommentClick={() => {
                const el = document.getElementById('comments-section');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              isMuted={isMuted}
              onMuteToggle={toggleMute}
              subtitleLanguage={subtitleLanguage}
              onSubtitleChange={setSubtitleLanguage}
              isDubbing={isDubbing}
              onDubbingToggle={toggleDubbing}
            />
          </div>
        </div>
      </div>

      {/* Content Section - Scroll to see */}
      <div className="bg-[#121212] min-h-screen">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          {/* User Info & Description */}
          <div className="bg-[#1E1E1E] rounded-2xl p-6 mb-6 border border-gray-800">
            <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <button
              onClick={() => navigate(`/user/${ownerId}`)}
              className="flex-shrink-0"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 ring-2 ring-gray-700 hover:ring-[#FE2C55] transition-all">
                <img
                  src={avatarError ? '/avatar.jpg' : ownerAvatar}
                  alt={ownerUsername}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              </div>
            </button>

            {/* User Info - Căn trái */}
            <div className="flex-1 min-w-0">
              <button
                onClick={() => navigate(`/user/${ownerId}`)}
                className="block hover:underline text-left"
              >
                <h2 className="text-white font-bold text-lg truncate">
                  {ownerFullName || ownerUsername}
                </h2>
                <p className="text-gray-400 text-sm">@{ownerUsername}</p>
              </button>
            </div>

            {/* Visibility Badge */}
            <div className="flex-shrink-0">
              {video.visibility === 'hidden' ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-full border border-gray-700">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" strokeWidth="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
                  </svg>
                  <span className="text-gray-400 text-xs font-medium">Riêng tư</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FE2C55]/10 rounded-full border border-[#FE2C55]/20">
                  <svg className="w-4 h-4 text-[#FE2C55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[#FE2C55] text-xs font-medium">Công khai</span>
                </div>
              )}
            </div>

            {/* Follow Button - Chỉ hiển thị nếu không phải chính chủ */}
            {!isOwnVideo && ownerId && (
              <Button
                onClick={handleFollowClick}
                disabled={followMutation.isPending}
                className={`px-6 flex-shrink-0 ${
                  isFollowing
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white'
                }`}
              >
                {followMutation.isPending ? 'Đang xử lý...' : isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
              </Button>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h1 className="text-white text-xl font-bold">{video.title}</h1>
            {video.description && (
              <div className="text-gray-300 text-sm">{showFullDescription || (video.description?.length || 0) <= 150 ? (
                  <>
                    <p className="whitespace-pre-wrap">{video.description}</p>
                    {(video.description?.length || 0) > 150 && (
                      <button
                        onClick={() => setShowFullDescription(false)}
                        className="text-gray-400 hover:text-white mt-1 font-semibold"
                      >
                        Rút gọn
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap">{video.description.slice(0, 150)}...</p>
                    <button
                      onClick={() => setShowFullDescription(true)}
                      className="text-gray-400 hover:text-white font-semibold"
                    >
                      Xem thêm
                    </button>
                  </>
                )}
              </div>
            )}
            <p className="text-gray-500 text-xs">{formatDate(video.createdAt)}</p>
          </div>
          </div>

          {/* Comments Section */}
          <div id="comments-section" className="bg-[#1E1E1E] rounded-2xl p-6 border border-gray-800">
            <h3 className="text-white text-lg font-bold mb-4">
            Bình luận ({commentsList?.length || 0})
          </h3>

          {/* Comment Input */}
          {currentUser ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                  <img
                    src={getAvatarUrl(currentUser.avatarUrl)}
                    alt={currentUser.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Thêm bình luận..."
                    className="flex-1 bg-[#121212] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-[#FE2C55] focus:outline-none"
                  />
                  <Button
                    type="submit"
                    disabled={!comment.trim() || commentMutation.isPending}
                    className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-4 bg-[#121212] rounded-lg border border-gray-800">
              <p className="text-gray-400 text-center">
                <button
                  onClick={() => navigate('/login')}
                  className="text-[#FE2C55] hover:underline font-semibold"
                >
                  Đăng nhập
                </button>
                {' '}để bình luận
              </p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {commentsList && commentsList.length > 0 ? (
              commentsList.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <button
                    onClick={() => navigate(`/user/${comment.user?.id || comment.userId}`)}
                    className="flex-shrink-0"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                      <img
                        src={getAvatarUrl(comment.user?.avatarUrl || comment.avatarUrl)}
                        alt={comment.user?.username || comment.username || 'User'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </button>
                  <div className="flex-1">
                    <div className="bg-[#121212] rounded-lg px-4 py-2">
                      <button
                        onClick={() => navigate(`/user/${comment.user?.id || comment.userId}`)}
                        className="font-semibold text-white text-sm hover:underline"
                      >
                        {comment.user?.username || comment.username || 'Unknown User'}
                      </button>
                      <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                    </div>
                    <p className="text-gray-500 text-xs mt-1 ml-4">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Chưa có bình luận nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
