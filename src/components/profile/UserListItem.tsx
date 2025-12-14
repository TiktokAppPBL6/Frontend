import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { getAvatarUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface UserListItemProps {
  userId: number;
  username: string;
  fullName: string;
  avatarUrl: string;
  isFollowing: boolean;
  isCurrentUser: boolean;
  showFollowButton: boolean;
  onFollowClick: () => void;
  onClose: () => void;
  isPending?: boolean;
}

export function UserListItem({
  userId,
  username,
  fullName,
  avatarUrl,
  isFollowing,
  isCurrentUser,
  showFollowButton,
  onFollowClick,
  onClose,
  isPending,
}: UserListItemProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 bg-[#121212] rounded-lg p-3 hover:bg-gray-800 transition-all border border-gray-800/50 group">
      <button
        onClick={() => {
          navigate(`/user/${userId}`);
          onClose();
        }}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <Avatar 
          src={getAvatarUrl(avatarUrl)} 
          alt={username} 
          size="md" 
          className="ring-2 ring-gray-800 group-hover:ring-gray-700 transition-all" 
        />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-white text-sm font-bold truncate">{fullName || username}</p>
          <p className="text-gray-400 text-xs truncate">@{username}</p>
        </div>
      </button>

      {showFollowButton && !isCurrentUser && (
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onFollowClick();
          }}
          disabled={isPending}
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
}
