import { Link } from 'react-router-dom';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { getAvatarUrl } from '@/lib/utils';

interface VideoUserInfoProps {
  userId: number;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  isFollowing?: boolean;
  isOwnVideo?: boolean;
  onFollowToggle?: () => void;
  compact?: boolean;
}

export function VideoUserInfo({
  userId,
  username,
  fullName,
  avatarUrl,
  isFollowing = false,
  isOwnVideo = false,
  onFollowToggle,
  compact = false,
}: VideoUserInfoProps) {

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <Link to={`/profile/${userId}`}>
          <Avatar
            src={getAvatarUrl(avatarUrl || '')}
            alt={username}
            size="md"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to={`/profile/${userId}`}
            className="font-semibold text-white hover:underline block truncate"
          >
            {username}
          </Link>
          {fullName && (
            <p className="text-sm text-gray-300 truncate">{fullName}</p>
          )}
        </div>
        {!isOwnVideo && onFollowToggle && (
          <Button
            variant={isFollowing ? 'outline' : 'default'}
            size="sm"
            onClick={onFollowToggle}
            className={
              isFollowing
                ? 'border-gray-600 text-white hover:bg-gray-800'
                : 'bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white'
            }
          >
            {isFollowing ? 'Đang follow' : 'Follow'}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link to={`/profile/${userId}`}>
        <Avatar
          src={getAvatarUrl(avatarUrl || '')}
          alt={username}
          size="lg"
        />
      </Link>
      <div className="flex-1">
        <Link
          to={`/profile/${userId}`}
          className="font-bold text-white text-lg hover:underline block"
        >
          {username}
        </Link>
        {fullName && (
          <p className="text-gray-300 text-sm">{fullName}</p>
        )}
      </div>
      {!isOwnVideo && onFollowToggle && (
        <Button
          variant={isFollowing ? 'outline' : 'default'}
          size="default"
          onClick={onFollowToggle}
          className={
            isFollowing
              ? 'border-gray-600 text-white hover:bg-gray-800'
              : 'bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white'
          }
        >
          {isFollowing ? 'Đang follow' : 'Follow'}
        </Button>
      )}
    </div>
  );
}
