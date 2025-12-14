import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/common/Avatar';
import { formatNumber, getAvatarUrl } from '@/lib/utils';

interface ProfileHeaderProps {
  user: any;
  isOwnProfile: boolean;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  videosCount: number;
  onEditClick: () => void;
  onFollowClick: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
  isFollowPending: boolean;
}

export function ProfileHeader({
  user,
  isOwnProfile,
  isFollowing,
  followersCount,
  followingCount,
  videosCount,
  onEditClick,
  onFollowClick,
  onFollowersClick,
  onFollowingClick,
  isFollowPending,
}: ProfileHeaderProps) {
  return (
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
                  onClick={onEditClick} 
                  className="bg-[#1e1e1e] border border-gray-700 text-white hover:bg-gray-800 px-6"
                >
                  Sửa hồ sơ
                </Button>
              </div>
            ) : (
              <Button
                onClick={onFollowClick}
                disabled={isFollowPending}
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

          {/* Stats */}
          <div className="flex items-center gap-6 mb-6">
            <button onClick={onFollowersClick} className="group">
              <span className="font-bold text-xl text-white group-hover:text-gray-300 transition-colors">
                {formatNumber(followersCount)}
              </span>
              <span className="text-gray-400 text-sm ml-2">Follower</span>
            </button>
            <button onClick={onFollowingClick} className="group">
              <span className="font-bold text-xl text-white group-hover:text-gray-300 transition-colors">
                {formatNumber(followingCount)}
              </span>
              <span className="text-gray-400 text-sm ml-2">Đang follow</span>
            </button>
            <div>
              <span className="font-bold text-xl text-white">{formatNumber(videosCount)}</span>
              <span className="text-gray-400 text-sm ml-2">Video</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
