import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { videosApi } from '@/api/videos.api';
import { socialApi } from '@/api/social.api';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { formatNumber, getAvatarUrl, cn } from '@/lib/utils';
import { useAuthStore } from '@/app/store/auth';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { EditVideoModal } from '@/components/profile/EditVideoModal';
import { FollowersModal } from '@/components/profile/FollowersModal';
import { VideoCard } from '@/components/profile/VideoCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export function Profile() {
  const [editOpen, setEditOpen] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');
  const [videoTab, setVideoTab] = useState<'public' | 'private'>('public');
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const userId = parseInt(id || '0');
  const isOwnProfile = currentUser?.id === userId;

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getUser(userId),
    enabled: !!userId,
  });

  const { data: videosData, isLoading: videosLoading } = useQuery({
    queryKey: ['videos', 'user', userId],
    queryFn: () => videosApi.getUserVideos(userId, { page: 1, pageSize: 20 }),
    enabled: !!userId,
  });

  // Filter videos by privacy for own profile
  const publicVideos = useMemo(() => {
    if (!videosData?.videos) return [];
    return videosData.videos.filter((v: any) => {
      // Public videos: not private, not hidden
      const isPrivate = v.privacy === 'private' || v.is_private === true;
      const isHidden = v.visibility === 'hidden';
      return !isPrivate && !isHidden;
    });
  }, [videosData]);

  const privateVideos = useMemo(() => {
    if (!videosData?.videos || !isOwnProfile) return [];
    return videosData.videos.filter((v: any) => {
      // Private videos: marked as private OR hidden
      const isPrivate = v.privacy === 'private' || v.is_private === true;
      const isHidden = v.visibility === 'hidden';
      return isPrivate || isHidden;
    });
  }, [videosData, isOwnProfile]);

  const displayVideos = isOwnProfile 
    ? (videoTab === 'public' ? publicVideos : privateVideos)
    : publicVideos;

  // Get follow status from API (check both snake_case and camelCase)
  const isFollowing = user ? ((user as any).is_following ?? user.isFollowing ?? false) : false;

  // Normalize counts from API: prefer snake_case then camelCase, fallback to 0 or videosData
  const followersCount = user ? ((user as any).followers_count ?? (user as any).followersCount ?? 0) : 0;
  const followingCount = user ? ((user as any).following_count ?? (user as any).followingCount ?? 0) : 0;
  const videosCount = user
    ? ((user as any).videos_count ?? (user as any).videosCount ?? (videosData as any)?.total ?? videosData?.videos?.length ?? 0)
    : ((videosData as any)?.total ?? videosData?.videos?.length ?? 0);

  const followMutation = useMutation({
    mutationFn: () => 
      isFollowing ? socialApi.unfollowUser(userId) : socialApi.followUser(userId),
    onSuccess: () => {
      toast.success(isFollowing ? 'Đã bỏ theo dõi' : 'Đã theo dõi');
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-8">
        <div className="container mx-auto max-w-4xl px-4">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Không tìm thấy người dùng</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-[#121212] pt-20 pb-8">
      <div className="container mx-auto max-w-5xl px-4">
        {/* Profile Header - TikTok Style */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <Avatar 
                src={getAvatarUrl(user.avatarUrl)} 
                alt={user.username} 
                size="xl" 
                className="h-28 w-28 ring-2 ring-gray-800"
              />
            </div>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-white truncate mb-1">
                    {user.username}
                  </h1>
                  <p className="text-lg text-gray-400">
                    {user.fullName || user.username}
                  </p>
                </div>
                
                {/* Action Buttons */}
                {isOwnProfile ? (
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => setEditOpen(true)} 
                      className="bg-[#1e1e1e] border border-gray-700 text-white hover:bg-gray-800 px-6"
                    >
                      Sửa hồ sơ
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    className={
                      isFollowing
                        ? 'bg-[#1e1e1e] border border-gray-700 hover:bg-gray-800 text-white px-8'
                        : 'bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white px-8'
                    }
                  >
                    {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </Button>
                )}
              </div>

              {/* Stats - TikTok Style */}
              <div className="flex items-center gap-6 mb-6">
                <button
                  onClick={() => {
                    setFollowersModalTab('following');
                    setFollowersModalOpen(true);
                  }}
                  className="group"
                >
                  <span className="font-bold text-xl text-white group-hover:text-gray-300 transition-colors">
                    {formatNumber(followingCount)}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">Đang follow</span>
                </button>
                <button
                  onClick={() => {
                    setFollowersModalTab('followers');
                    setFollowersModalOpen(true);
                  }}
                  className="group"
                >
                  <span className="font-bold text-xl text-white group-hover:text-gray-300 transition-colors">
                    {formatNumber(followersCount)}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">Follower</span>
                </button>
                <div>
                  <span className="font-bold text-xl text-white">{formatNumber(videosCount)}</span>
                  <span className="text-gray-400 text-sm ml-2">Thích</span>
                </div>
              </div>

              {/* Bio (if exists) */}
              {user.bio && (
                <p className="text-white text-sm leading-relaxed mb-4">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div>
          {/* Tabs for own profile - TikTok Style */}
          {isOwnProfile && (
            <div className="flex items-center border-b border-gray-800 mb-6">
              <button
                onClick={() => setVideoTab('public')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-4 px-4 text-base font-semibold transition-all relative',
                  videoTab === 'public'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                )}
              >
                <Globe className="h-5 w-5" />
                <span>Công khai</span>
                {videoTab === 'public' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                )}
              </button>
              <button
                onClick={() => setVideoTab('private')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-4 px-4 text-base font-semibold transition-all relative',
                  videoTab === 'private'
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                )}
              >
                <Lock className="h-5 w-5" />
                <span>Riêng tư</span>
                {videoTab === 'private' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                )}
              </button>
            </div>
          )}

          {!isOwnProfile && (
            <div className="border-b border-gray-800 mb-6">
              <div className="flex items-center justify-center gap-2 py-4 relative">
                <Globe className="h-5 w-5 text-white" />
                <span className="text-base font-semibold text-white">Video</span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-white"></div>
              </div>
            </div>
          )}
          
          {videosLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="aspect-[9/16] rounded-lg bg-gray-800" />
              ))}
            </div>
          ) : displayVideos && displayVideos.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {displayVideos.map((video: any) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isOwnVideo={isOwnProfile}
                  onEdit={setEditingVideo}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#1e1e1e] mb-6">
                {isOwnProfile && videoTab === 'private' ? (
                  <Lock className="h-12 w-12 text-gray-600" />
                ) : (
                  <Globe className="h-12 w-12 text-gray-600" />
                )}
              </div>
              <p className="text-gray-400 font-medium text-lg mb-2">
                {isOwnProfile 
                  ? (videoTab === 'private' ? 'Chưa có video riêng tư' : 'Chưa có video công khai')
                  : 'Người dùng này chưa có video công khai'
                }
              </p>
              <p className="text-gray-500 text-sm mb-6">
                {isOwnProfile ? 'Tải video lên để chia sẻ với mọi người' : 'Quay lại sau khi họ đăng video mới'}
              </p>
              {isOwnProfile && (
                <Link to="/upload">
                  <Button className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white px-8 py-6 text-base">
                    Tải video lên
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
    {editingVideo && (
      <EditVideoModal
        video={editingVideo}
        onClose={() => setEditingVideo(null)}
      />
    )}
    {followersModalOpen && (
      <FollowersModal
        userId={userId}
        initialTab={followersModalTab}
        onClose={() => setFollowersModalOpen(false)}
      />
    )}
    </>
  );
}
