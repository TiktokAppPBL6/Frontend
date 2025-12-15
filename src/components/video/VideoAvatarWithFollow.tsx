import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface VideoAvatarWithFollowProps {
  ownerId: number | null;
  ownerAvatar: string;
  ownerUsername: string;
  isOwnVideo: boolean;
  isFollowing: boolean;
  onFollowClick: () => void;
  isFollowPending: boolean;
}

export function VideoAvatarWithFollow({
  ownerId,
  ownerAvatar,
  ownerUsername,
  isOwnVideo,
  isFollowing,
  onFollowClick,
  isFollowPending,
}: VideoAvatarWithFollowProps) {
  const navigate = useNavigate();
  const [avatarError, setAvatarError] = useState(false);

  return (
    <div className="relative w-12 pb-2" style={{ pointerEvents: 'auto' }}>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          navigate(`/user/${ownerId}`);
        }}
        className="block transition-transform hover:scale-105 cursor-pointer"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shadow-lg ring-2 ring-black/20">
          <img
            src={avatarError ? '/avatar.jpg' : ownerAvatar}
            alt={ownerUsername}
            className="w-full h-full object-cover"
            onError={() => setAvatarError(true)}
          />
        </div>
      </button>
      {/* Follow/Unfollow button */}
      {!isOwnVideo && ownerId && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isFollowPending) onFollowClick();
          }}
          disabled={isFollowPending}
          aria-label={isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FE2C55] text-white flex items-center justify-center text-sm font-bold shadow-lg ring-2 ring-white hover:brightness-110 disabled:opacity-70 transition-all cursor-pointer"
        >
          {isFollowing ? '✓' : '+'}
        </button>
      )}
    </div>
  );
}
