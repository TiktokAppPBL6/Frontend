/**
 * Empty Messages State - TikTok Style
 * Hiển thị gợi ý follower/following khi chưa có tin nhắn
 */
import { MessageCircle, Users, UserPlus, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { followsApi } from '@/api/follows.api';
import { Avatar } from '@/components/common/Avatar';
import { getAvatarUrl } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface EmptyMessagesStateProps {
  onSelectUser: (userId: number) => void;
}

export function EmptyMessagesState({ onSelectUser }: EmptyMessagesStateProps) {
  const navigate = useNavigate();

  // Get following list (only following available for now)
  const { data: following } = useQuery({
    queryKey: ['following'],
    queryFn: () => followsApi.getFollowing(),
  });

  // Show following users as suggestions
  const suggestedUsers = (following || []).slice(0, 5);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/5 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md">
        {/* Icon with gradient */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse" />
          <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
          Bắt đầu trò chuyện
          <Sparkles className="w-5 h-5 text-yellow-500" />
        </h3>
        
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Kết nối với bạn bè và chia sẻ những khoảnh khắc tuyệt vời
        </p>

        {/* Suggested Users */}
        {suggestedUsers.length > 0 ? (
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Gợi ý nhắn tin
              </h4>
            </div>

            <div className="space-y-2">
              {suggestedUsers.map((user: any) => {
                const userId = user.followeeId || user.followerId;
                const userData = user.followee || user.follower;
                
                return (
                  <button
                    key={userId}
                    onClick={() => onSelectUser(userId)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group border border-transparent hover:border-pink-500/20"
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar
                        src={getAvatarUrl(userData?.avatarUrl)}
                        alt={userData?.username}
                        size="md"
                        className="ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-pink-500/50 transition-all"
                      />
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <MessageCircle className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                        {userData?.fullName || userData?.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        @{userData?.username}
                      </p>
                    </div>

                    {/* Badge */}
                    {user.followee && (
                      <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-full">
                        Following
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/explore')}
            className="w-full py-3 px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Khám phá người dùng
          </button>

          <button
            onClick={() => navigate('/following')}
            className="w-full py-3 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Xem danh sách following
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/10 dark:to-cyan-900/10 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            💡 <span className="font-semibold">Mẹo:</span> Bạn chỉ có thể nhắn tin với người bạn đang theo dõi hoặc người đang theo dõi bạn
          </p>
        </div>
      </div>
    </div>
  );
}
