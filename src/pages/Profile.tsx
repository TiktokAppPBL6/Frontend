import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { videosApi } from '@/api/videos.api';
import { socialApi } from '@/api/social.api';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { formatNumber, getMediaUrl } from '@/lib/utils';
import { useAuthStore } from '@/app/store/auth';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

export function Profile() {
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

  // Get follow status from API (check both snake_case and camelCase)
  const isFollowing = user ? ((user as any).is_following ?? user.isFollowing ?? false) : false;

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
    <div className="min-h-screen bg-white pt-20 pb-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-lg p-8 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar src={user.avatarUrl} alt={user.username} size="xl" className="h-24 w-24" />
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1">
                {user.fullName || user.username}
              </h1>
              <p className="text-gray-500 mb-4">@{user.username}</p>
              
              <div className="flex gap-6 justify-center md:justify-start mb-4">
                <div>
                  <span className="font-bold text-lg">{formatNumber(user.followingCount || 0)}</span>
                  <span className="text-gray-500 ml-1">Đang Follow</span>
                </div>
                <div>
                  <span className="font-bold text-lg">{formatNumber(user.followersCount || 0)}</span>
                  <span className="text-gray-500 ml-1">Người theo dõi</span>
                </div>
                <div>
                  <span className="font-bold text-lg">{formatNumber(user.videosCount || 0)}</span>
                  <span className="text-gray-500 ml-1">Video</span>
                </div>
              </div>

              {isOwnProfile ? (
                <Link to="/settings">
                  <Button variant="outline">Chỉnh sửa hồ sơ</Button>
                </Link>
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
          <h2 className="text-xl font-bold mb-4">Video</h2>
          
          {videosLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-[9/16]" />
              ))}
            </div>
          ) : videosData?.videos && videosData.videos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {videosData.videos.map((video) => (
                <Link
                  key={video.id}
                  to={`/video/${video.id}`}
                  className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-200 hover:ring-2 hover:ring-[#FE2C55] transition-all"
                >
                  <img
                    src={getMediaUrl(video.thumbUrl)}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="font-semibold text-sm line-clamp-2">{video.title}</p>
                    <p className="text-xs mt-1">
                      {formatNumber(video.viewCount || 0)} lượt xem
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <p>Chưa có video nào</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
