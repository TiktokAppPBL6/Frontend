import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface VideoInfoSectionProps {
  video: any;
  ownerId: number | null;
  ownerUsername: string;
  ownerFullName: string;
  ownerAvatar: string;
  isOwnVideo: boolean;
  isFollowing: boolean;
  onFollowClick: () => void;
  isFollowPending: boolean;
}

export function VideoInfoSection({
  video,
  ownerId,
  ownerUsername,
  ownerFullName,
  ownerAvatar,
  isOwnVideo,
  isFollowing,
  onFollowClick,
  isFollowPending,
}: VideoInfoSectionProps) {
  const navigate = useNavigate();
  const [avatarError, setAvatarError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <div className="bg-[#1E1E1E] rounded-2xl p-6 mb-6 border border-gray-800">
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <button
          onClick={() => navigate(`/user/${ownerId}`)}
          className="flex-shrink-0"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700 ring-2 ring-gray-700 hover:ring-[#FE2C55] transition-all">
            <img
              src={avatarError ? '/avatar.jpg' : ownerAvatar}
              alt={ownerUsername}
              className="w-full h-full object-cover"
              onError={() => setAvatarError(true)}
            />
          </div>
        </button>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <button
            onClick={() => navigate(`/user/${ownerId}`)}
            className="block hover:underline text-left"
          >
            <h2 className="text-white font-bold text-lg truncate">
              {ownerFullName || ownerUsername}
            </h2>
            <p className="text-gray-400 text-sm">@{ownerUsername}</p>
          </button>
        </div>

        {/* Visibility Badge */}
        <div className="flex-shrink-0">
          {video.visibility === 'hidden' ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 rounded-full border border-gray-700">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" strokeWidth="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
              </svg>
              <span className="text-gray-400 text-xs font-medium">Riêng tư</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FE2C55]/10 rounded-full border border-[#FE2C55]/20">
              <svg className="w-4 h-4 text-[#FE2C55]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[#FE2C55] text-xs font-medium">Công khai</span>
            </div>
          )}
        </div>

        {/* Follow Button */}
        {!isOwnVideo && ownerId && (
          <Button
            onClick={onFollowClick}
            disabled={isFollowPending}
            className={`px-6 flex-shrink-0 ${
              isFollowing
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white'
            }`}
          >
            {isFollowPending ? 'Đang xử lý...' : isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
          </Button>
        )}
      </div>

      {/* Title & Description */}
      <div className="space-y-2">
        <h1 className="text-white text-xl font-bold">{video.title}</h1>
        {video.description && (
          <div className="text-gray-300 text-sm">
            {showFullDescription || (video.description?.length || 0) <= 150 ? (
              <>
                <p className="whitespace-pre-wrap">{video.description}</p>
                {(video.description?.length || 0) > 150 && (
                  <button
                    onClick={() => setShowFullDescription(false)}
                    className="text-gray-400 hover:text-white mt-1 font-semibold"
                  >
                    Rút gọn
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="whitespace-pre-wrap">{video.description.slice(0, 150)}...</p>
                <button
                  onClick={() => setShowFullDescription(true)}
                  className="text-gray-400 hover:text-white font-semibold"
                >
                  Xem thêm
                </button>
              </>
            )}
          </div>
        )}
        <p className="text-gray-500 text-xs">{formatDate(video.createdAt)}</p>
      </div>
    </div>
  );
}
