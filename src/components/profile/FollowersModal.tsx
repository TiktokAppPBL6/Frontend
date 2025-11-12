import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '@/api/social.api';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { X, Users } from 'lucide-react';
import { getAvatarUrl, cn } from '@/lib/utils';
import { useAuthStore } from '@/app/store/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface FollowersModalProps {
  userId: number;
  initialTab?: 'followers' | 'following';
  onClose: () => void;
}

export function FollowersModal({ userId, initialTab = 'followers', onClose }: FollowersModalProps) {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  
  // Kiểm tra xem đây có phải là profile của chính người đăng nhập không
  const isOwnProfile = currentUser?.id === userId;

  // Fetch followers
  const { data: followersData, isLoading: followersLoading } = useQuery({
    queryKey: ['followers', userId],
    queryFn: () => socialApi.getFollowers(userId),
    enabled: activeTab === 'followers' && !!userId,
  });

  // Fetch following
  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['following', userId],
    queryFn: () => socialApi.getFollowing(userId),
    enabled: activeTab === 'following' && !!userId,
  });

  const followMutation = useMutation({
    mutationFn: ({ targetUserId, isFollowing }: { targetUserId: number; isFollowing: boolean }) =>
      isFollowing ? socialApi.unfollowUser(targetUserId) : socialApi.followUser(targetUserId),
    onSuccess: (_, { isFollowing }) => {
      toast.success(isFollowing ? 'Đã bỏ theo dõi' : 'Đã theo dõi');
      queryClient.invalidateQueries({ queryKey: ['followers', userId] });
      queryClient.invalidateQueries({ queryKey: ['following', userId] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: () => {
      toast.error('Không thể thực hiện hành động này');
    },
  });

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const users = activeTab === 'followers' ? followersData?.followers : followingData?.following;
  const total = activeTab === 'followers' ? followersData?.total : followingData?.total;
  const isLoading = activeTab === 'followers' ? followersLoading : followingLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col border border-gray-800">
        {/* Header with Tabs */}
        <div className="border-b border-gray-800">
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-white font-bold text-lg">Danh sách</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="hover:bg-gray-800 rounded-full text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => setActiveTab('followers')}
              className={cn(
                'flex-1 py-3 text-sm font-semibold transition-colors relative',
                activeTab === 'followers' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              Người theo dõi
              {activeTab === 'followers' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={cn(
                'flex-1 py-3 text-sm font-semibold transition-colors relative',
                activeTab === 'following' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              Đang theo dõi
              {activeTab === 'following' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          </div>
        </div>

        {/* User List */}
        <div className={cn('flex-1 overflow-y-auto p-4', isLoading && 'opacity-60')}>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#121212] rounded-lg p-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-gray-800" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-800 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-800 rounded w-24" />
                  </div>
                  <div className="h-8 w-20 bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user: any) => {
                // API trả về followerId (cho followers) hoặc followeeId (cho following)
                const targetUserId = activeTab === 'followers' ? user.followerId : user.followeeId;
                const username = user.username ?? user.user_name ?? '';
                const fullName = user.fullName ?? user.full_name ?? '';
                const avatar = getAvatarUrl(user.avatarUrl ?? user.avatar_url);
                const isFollowing = user.checkfollow ?? user.is_following ?? user.isFollowing ?? false;
                const isCurrentUser = currentUser?.id === targetUserId;
                
                // Logic hiển thị nút Follow:
                // - Không hiển thị nếu là chính mình
                // - Nếu xem profile của mình (isOwnProfile = true):
                //   + Tab "Người theo dõi": hiển thị nút
                //   + Tab "Đang theo dõi": KHÔNG hiển thị (đã follow rồi)
                // - Nếu xem profile người khác (isOwnProfile = false):
                //   + Hiển thị nút ở CẢ 2 tab
                const shouldShowFollowButton = !isCurrentUser && (
                  activeTab === 'followers' || !isOwnProfile
                );

                return (
                  <div
                    key={targetUserId}
                    className="flex items-center gap-3 bg-[#121212] rounded-lg p-3 hover:bg-gray-800 transition-all border border-gray-800/50 group"
                  >
                    <button
                      onClick={() => {
                        navigate(`/user/${targetUserId}`);
                        onClose();
                      }}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <Avatar src={avatar} alt={username} size="md" className="ring-2 ring-gray-800 group-hover:ring-gray-700 transition-all" />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-white text-sm font-bold truncate">{fullName || username}</p>
                        <p className="text-gray-400 text-xs truncate">@{username}</p>
                      </div>
                    </button>

                    {shouldShowFollowButton && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          followMutation.mutate({ targetUserId, isFollowing });
                        }}
                        disabled={followMutation.isPending}
                        className={cn(
                          'px-4 h-8 text-xs font-semibold rounded-md transition-all',
                          isFollowing
                            ? 'bg-transparent border border-gray-700 text-gray-300 hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/10'
                            : 'bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white border-none'
                        )}
                      >
                        {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="w-20 h-20 rounded-full bg-[#121212] flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-sm font-medium">
                {activeTab === 'followers' ? 'Chưa có người theo dõi' : 'Chưa theo dõi ai'}
              </p>
            </div>
          )}
        </div>

        {/* Footer with count */}
        {total !== undefined && total > 0 && (
          <div className="border-t border-gray-800 px-5 py-3 bg-[#1e1e1e]">
            <p className="text-gray-500 text-xs text-center">
              Tổng cộng: <span className="font-semibold text-gray-300">{total}</span> người
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
