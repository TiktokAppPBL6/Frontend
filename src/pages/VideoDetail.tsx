import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { videosApi } from '@/api/videos.api';
import { commentsApi } from '@/api/comments.api';
import { socialApi } from '@/api/social.api';
import { UniversalVideoPlayer } from '@/components/video/UniversalVideoPlayer';
import { VideoInfoSection } from '@/components/video/VideoInfoSection';
import { VideoCommentSection } from '@/components/video/VideoCommentSection';
import { Button } from '@/components/ui/button';
import { getAvatarUrl } from '@/lib/utils';
import { useAuthStore } from '@/app/store/auth';
import toast from 'react-hot-toast';

export function VideoDetail() {
  const { id } = useParams<{ id: string }>();
  const videoId = parseInt(id || '0');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
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

  // Normalize comments data - API returns { comments: [], total: number }
  const commentsList = commentsData?.comments || [];

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
    <div className="bg-black min-h-screen relative">
      {/* Video Section - Full screen */}
      <div className="h-screen">
        <UniversalVideoPlayer
          video={video}
          mode="detail"
          externalIsMuted={isMuted}
          externalIsDubbing={isDubbing}
          externalSubtitleLanguage={subtitleLanguage}
          onMuteChange={setIsMuted}
          onDubbingChange={setIsDubbing}
          onSubtitleChange={setSubtitleLanguage}
          externalIsFollowing={isFollowing}
          onFollowClick={handleFollowClick}
          isFollowPending={followMutation.isPending}
        />
      </div>

      {/* Content Section - Scroll to see */}
      <div className="bg-[#121212] min-h-screen">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          {/* User Info & Description */}
          <VideoInfoSection
            video={video}
            ownerId={ownerId}
            ownerUsername={ownerUsername}
            ownerFullName={ownerFullName}
            ownerAvatar={ownerAvatar}
            isOwnVideo={isOwnVideo}
            isFollowing={isFollowing}
            onFollowClick={handleFollowClick}
            isFollowPending={followMutation.isPending}
          />

          {/* Comments Section */}
          <VideoCommentSection
            videoId={videoId}
            comments={commentsList}
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  );
}
