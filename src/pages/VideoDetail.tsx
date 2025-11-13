import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import { videosApi } from '@/api/videos.api';
import { commentsApi } from '@/api/comments.api';
import { socialApi } from '@/api/social.api';
import { VideoActions } from '@/components/video/VideoActions';
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
  
  const [comment, setComment] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [avatarError, setAvatarError] = useState(false);

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

  // Normalize comments data - API returns { comments: [], total: number }
  const commentsList = commentsData?.comments || [];

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
    <div className="min-h-screen bg-[#121212]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#121212]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto max-w-4xl px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-6">
        {/* Video Player */}
        <div className="relative flex items-end justify-center gap-3 mb-6">
          {/* Video Container - Bo tròn, giữ nguyên tỷ lệ khung hình */}
          <div className="relative max-w-[600px] max-h-full flex items-center justify-center">
            <video
              ref={videoRef}
              src={getMediaUrl(video.hlsUrl || video.url)}
              poster={getMediaUrl(video.thumbUrl)}
              className="max-w-full max-h-[75vh] object-contain cursor-pointer rounded-3xl shadow-2xl"
              loop
              playsInline
              muted={isMuted}
              onClick={handleVideoClick}
              autoPlay
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
          </div>

          {/* Video Actions Column */}
          <div className="flex-shrink-0 flex flex-col items-center gap-5 pb-1">
            <VideoActions
              video={video}
              onCommentClick={() => {
                const el = document.getElementById('comments-section');
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              isMuted={isMuted}
              onMuteToggle={toggleMute}
            />
          </div>
        </div>

        {/* User Info & Description */}
        <div className="bg-[#1E1E1E] rounded-2xl p-6 mb-6 border border-gray-800">
          <div className="flex items-center gap-4 mb-4">
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
              <div className="text-gray-300 text-sm">
                {showFullDescription || (video.description?.length || 0) <= 150 ? (
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
  );
}
