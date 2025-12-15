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
    <div className="absolute bottom-20 left-4 right-20 pointer-events-none z-10">
      <div className="flex items-start gap-3 pointer-events-auto">
        {/* Compact User Info */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-base drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              @{ownerUsername}
            </span>
            {isOwnVideo && (
              <span className="text-xs px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-white/90">
                Bạn
              </span>
            )}
          </div>
          <p className="text-white text-sm font-medium drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] line-clamp-2 leading-relaxed">
            {video.title}
          </p>
          {video.description && (
            <div className="text-white/95 text-sm drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              {showFullDesc || video.description.length <= 80 ? (
                <>
                  <p className="whitespace-pre-wrap break-words line-clamp-3">
                    {video.description}
                  </p>
                  {video.description.length > 80 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFullDesc(false);
                      }}
                      className="font-semibold text-white/80 hover:text-white transition-colors mt-1"
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
                  className="font-semibold text-white/80 hover:text-white transition-colors"
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
