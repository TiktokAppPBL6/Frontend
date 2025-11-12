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
    <div className="min-h-screen bg-white pt-20 pb-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg p-8 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar src={getAvatarUrl(user.avatarUrl)} alt={user.username} size="xl" className="h-24 w-24" />
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1">
                {user.fullName || user.username}
              </h1>
              <p className="text-gray-500 mb-4">@{user.username}</p>
              
              <div className="flex gap-6 justify-center md:justify-start mb-4">
                <button
                  onClick={() => {
                    setFollowersModalTab('following');
                    setFollowersModalOpen(true);
                  }}
                  className="hover:text-gray-900 transition-colors"
                >
                  <span className="font-bold text-lg">{formatNumber(followingCount)}</span>
                  <span className="text-gray-500 ml-1">Đang Follow</span>
                </button>
                <button
                  onClick={() => {
                    setFollowersModalTab('followers');
                    setFollowersModalOpen(true);
                  }}
                  className="hover:text-gray-900 transition-colors"
                >
                  <span className="font-bold text-lg">{formatNumber(followersCount)}</span>
                  <span className="text-gray-500 ml-1">Người theo dõi</span>
                </button>
                <div>
                  <span className="font-bold text-lg">{formatNumber(videosCount)}</span>
                  <span className="text-gray-500 ml-1">Video</span>
                </div>
              </div>

              {isOwnProfile ? (
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => setEditOpen(true)}>Chỉnh sửa hồ sơ</Button>
                  <Link to="/settings">
                    <Button variant="outline">Cài đặt</Button>
                  </Link>
                </div>
              ) : (
                <Button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  className={
                    isFollowing
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                      : 'bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white'
                  }
                >
                  {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div>
          {/* Tabs for own profile */}
          {isOwnProfile && (
            <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setVideoTab('public')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold transition-all',
                  videoTab === 'public'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Globe className="h-4 w-4" />
                <span>Công khai</span>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  {publicVideos.length}
                </span>
              </button>
              <button
                onClick={() => setVideoTab('private')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold transition-all',
                  videoTab === 'private'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Lock className="h-4 w-4" />
                <span>Riêng tư</span>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  {privateVideos.length}
                </span>
              </button>
            </div>
          )}

          {!isOwnProfile && (
            <h2 className="text-xl font-bold mb-4">Video công khai</h2>
          )}
          
          {videosLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-[9/16]" />
              ))}
            </div>
          ) : displayVideos && displayVideos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                {isOwnProfile && videoTab === 'private' ? (
                  <Lock className="h-8 w-8 text-gray-400" />
                ) : (
                  <Globe className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <p className="text-gray-500 font-medium">
                {isOwnProfile 
                  ? (videoTab === 'private' ? 'Chưa có video riêng tư' : 'Chưa có video công khai')
                  : 'Người dùng này chưa có video công khai'
                }
              </p>
              {isOwnProfile && (
                <Link to="/upload">
                  <Button className="mt-4 bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white">
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
