import { useState } from 'react';
import type { Video } from '@/types';

interface VideoFeedInfoProps {
  video: Video;
  ownerUsername: string;
  isOwnVideo: boolean;
}

export function VideoFeedInfo({ video, ownerUsername, isOwnVideo }: VideoFeedInfoProps) {
  const [showFullDesc, setShowFullDesc] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-10">
      <div className="flex items-start gap-3 pointer-events-auto">
        {/* Compact User Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              @{ownerUsername}
            </span>
            {isOwnVideo && (
              <span className="text-xs px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded text-white/90">
                (Bạn)
              </span>
            )}
          </div>
          <p className="text-white text-xs sm:text-sm font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] line-clamp-1 leading-tight">
            {video.title}
          </p>
          {video.description && (
            <div className="text-white/90 text-xs sm:text-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
              {showFullDesc || video.description.length <= 80 ? (
                <>
                  <p className="whitespace-pre-wrap break-words line-clamp-2">
                    {video.description}
                  </p>
                  {video.description.length > 80 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFullDesc(false);
                      }}
                      className="font-semibold text-white/70 hover:text-white transition-colors mt-0.5"
                    >
                      Rút gọn
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullDesc(true);
                  }}
                  className="font-semibold text-white/70 hover:text-white transition-colors"
                >
                  {video.description.slice(0, 80)}...{' '}
                  <span className="text-white">xem thêm</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
