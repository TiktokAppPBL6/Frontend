import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { videosApi } from '@/api/videos.api';
import { commentsApi } from '@/api/comments.api';
import { socialApi } from '@/api/social.api';
import { VideoActions } from '@/components/video/VideoActions';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import { formatDate, getMediaUrl } from '@/lib/utils';
import { useAuthStore } from '@/app/store/auth';
import toast from 'react-hot-toast';

export function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const videoId = parseInt(id || '0');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [comment, setComment] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: video, isLoading: videoLoading } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => videosApi.getVideo(videoId),
    enabled: !!videoId,
  });

  // Update follow state when video data changes
  useEffect(() => {
    if (video?.owner) {
      // Check both snake_case (from API) and camelCase (normalized)
      const followingStatus = (video.owner as any).is_following ?? video.owner.isFollowing ?? false;
      console.log('📊 Follow status from API:', { 
        owner: video.owner, 
        is_following: (video.owner as any).is_following,
        isFollowing: video.owner.isFollowing,
        finalStatus: followingStatus 
      });
      setIsFollowing(followingStatus);
    }
  }, [video]);

  const { data: commentsData } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: () => commentsApi.getVideoComments(videoId),
    enabled: !!videoId,
  });

  const commentMutation = useMutation({
    mutationFn: commentsApi.createComment,
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      toast.success('Đã thêm bình luận');
    },
    onError: () => {
      toast.error('Không thể thêm bình luận');
    },
  });

  const followMutation = useMutation({
    mutationFn: (userId: number) =>
      isFollowing ? socialApi.unfollowUser(userId) : socialApi.followUser(userId),
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
    if (!video?.owner?.id) return;
    followMutation.mutate(video.owner.id);
  };

  const isOwnVideo = currentUser?.id === video?.owner?.id;

  if (videoLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 text-xl mb-4">Không tìm thấy video</p>
          <Button onClick={() => navigate('/home')}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-8">
      <div className="container mx-auto max-w-5xl px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-gray-900 hover:bg-gray-100 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Quay lại
        </Button>

        <div className="flex flex-col gap-6">
          {/* Video Player với Actions overlay */}
          <div className="relative bg-black rounded-2xl overflow-hidden shadow-xl max-w-[600px] mx-auto w-full">
            <video
              src={getMediaUrl(video.hlsUrl || video.url)}
              poster={getMediaUrl(video.thumbUrl)}
              controls
              autoPlay
              className="w-full max-h-[75vh] object-contain"
            />
            
            {/* Video Actions - Right Side */}
            <div className="absolute right-4 bottom-20 pointer-events-auto">
              <VideoActions video={video} vertical={true} />
            </div>
          </div>

          {/* Video Info Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 max-w-[600px] mx-auto w-full">
            {/* Avatar + User Info + Follow Button (Same Row) */}
            <div className="flex items-center gap-3 mb-4">
              <Link to={`/profile/${video.owner?.username}`}>
                <Avatar src={video.owner?.avatarUrl} alt={video.owner?.username} size="lg" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/profile/${video.owner?.username}`}>
                  <h2 className="text-gray-900 font-bold hover:underline text-base truncate">
                    {video.owner?.fullName || video.owner?.username}
                  </h2>
                  <p className="text-gray-500 text-sm truncate">@{video.owner?.username}</p>
                </Link>
              </div>
              {!isOwnVideo && (
                <Button
                  onClick={handleFollowClick}
                  disabled={followMutation.isPending}
                  className={
                    isFollowing
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-6 rounded-lg'
                      : 'bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white font-semibold px-6 rounded-lg'
                  }
                >
                  {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                </Button>
              )}
            </div>

            {/* Video Title */}
            <h1 className="text-gray-900 text-lg font-bold mb-2">{video.title}</h1>

            {/* Video Description with "See more" */}
            {video.description && (
              <div className="text-gray-700 text-sm leading-relaxed mb-3">
                {showFullDescription || video.description.length <= 100 ? (
                  <p>{video.description}</p>
                ) : (
                  <p>
                    {video.description.slice(0, 100)}...{' '}
                    <button
                      onClick={() => setShowFullDescription(true)}
                      className="text-gray-900 font-semibold hover:underline"
                    >
                      xem thêm
                    </button>
                  </p>
                )}
                {showFullDescription && video.description.length > 100 && (
                  <button
                    onClick={() => setShowFullDescription(false)}
                    className="text-gray-900 font-semibold hover:underline mt-1"
                  >
                    rút gọn
                  </button>
                )}
              </div>
            )}

            <p className="text-gray-400 text-xs">{formatDate(video.createdAt)}</p>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-[600px] mx-auto w-full">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-gray-900 font-bold text-base">
                Bình luận ({commentsData?.total || 0})
              </h3>
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
              {commentsData?.comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar src={comment.user?.avatarUrl} alt={comment.user?.username} size="sm" />
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm font-semibold">
                      {comment.user?.username}
                    </p>
                    <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                    <p className="text-gray-400 text-xs mt-1">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
              ))}

              {!commentsData?.comments.length && (
                <p className="text-gray-400 text-center py-12">Chưa có bình luận nào</p>
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-gray-100">
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <Input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Thêm bình luận..."
                  className="flex-1 bg-gray-50 border-gray-200"
                  disabled={commentMutation.isPending}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!comment.trim() || commentMutation.isPending}
                  className="bg-[#FE2C55] hover:bg-[#FE2C55]/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
