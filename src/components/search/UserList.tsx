import { Link } from 'react-router-dom';
import { Avatar } from '@/components/common/Avatar';
import { User } from 'lucide-react';
import { formatNumber, getAvatarUrl } from '@/lib/utils';

interface UserListProps {
  users: any[];
  isLoading: boolean;
}

export function UserList({ users, isLoading }: UserListProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">Đang tìm kiếm...</div>;
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-32">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gray-800 mb-4">
            <User className="h-12 w-12 text-gray-500" />
          </div>
        </div>
        <p className="text-white text-2xl font-bold mb-3">
          Không tìm thấy người dùng
        </p>
        <p className="text-gray-400 text-base">
          Thử tìm kiếm với từ khóa khác
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user: any) => {
        const followersCount = user.followers_count ?? user.followersCount ?? 0;
        const videosCount = user.videos_count ?? user.videosCount ?? 0;
        
        return (
          <Link
            key={user.id}
            to={`/user/${user.id}`}
            className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-800 transition-colors border border-gray-700"
          >
            <Avatar src={getAvatarUrl(user.avatarUrl)} alt={user.username} size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate text-white">
                {user.fullName || user.username}
              </h3>
              <p className="text-gray-400 text-sm">@{user.username}</p>
              <div className="flex items-center gap-4 text-gray-500 text-sm mt-1">
                <span>{formatNumber(followersCount)} người theo dõi</span>
                <span className="text-gray-600">•</span>
                <span>{formatNumber(videosCount)} video</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
