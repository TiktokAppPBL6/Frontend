import { useState } from 'react';
import { Video, VideoTranscript } from '@/types';
import { VideoPlayer } from './VideoPlayer';
import { VideoActions } from './VideoActions';
import { VideoUserInfo } from './VideoUserInfo';

interface SingleVideoPlayerProps {
  video: Video;
  ownerId: number | null;
  ownerUsername: string;
  ownerFullName?: string;
  ownerAvatar: string;
  isOwnVideo: boolean;
  isFollowing: boolean;
  transcript?: VideoTranscript | null;
  onFollowToggle: () => void;
  onCommentClick: () => void;
}

export function SingleVideoPlayer({
  video,
  ownerId,
  ownerUsername,
  ownerFullName,
  ownerAvatar,
  isOwnVideo,
  isFollowing,
  transcript,
  onFollowToggle,
  onCommentClick,
}: SingleVideoPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [subtitleLanguage, setSubtitleLanguage] = useState<'off' | 'en' | 'vi'>('off');

  return (
    <div className="relative w-full h-full bg-black">
      <div className="flex items-center justify-center h-full">
        {/* Video Player */}
        <div className="relative max-w-[800px] h-full">
          <VideoPlayer
            videoUrl={video.hlsUrl || video.url}
            videoId={video.id}
            transcript={transcript}
            selectedLanguage={subtitleLanguage}
            isMuted={isMuted}
            onMutedChange={setIsMuted}
            autoPlay={true}
            loop={true}
            showControls={true}
            className="h-full"
          />

          {/* Bottom Overlay with Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 pb-8">
            {/* User Info */}
            <div className="mb-4">
              <VideoUserInfo
                userId={ownerId || 0}
                username={ownerUsername}
                fullName={ownerFullName}
                avatarUrl={ownerAvatar}
                isFollowing={isFollowing}
                isOwnVideo={isOwnVideo}
                onFollowToggle={onFollowToggle}
                compact={true}
              />
            </div>

            {/* Video Title & Description */}
            <div className="space-y-2">
              <h2 className="text-white font-bold text-lg">{video.title}</h2>
              {video.description && (
                <div className="text-white/90 text-sm">
                  {showFullDesc || video.description.length <= 100 ? (
                    <>
                      <p className="whitespace-pre-wrap">{video.description}</p>
                      {video.description.length > 100 && (
                        <button
                          onClick={() => setShowFullDesc(false)}
                          className="font-semibold text-white/70 hover:text-white mt-1"
                        >
                          Rút gọn
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => setShowFullDesc(true)}
                      className="font-semibold text-white/70 hover:text-white"
                    >
                      {video.description.slice(0, 100)}...{' '}
                      <span className="text-white">xem thêm</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Actions - Right Side */}
        <div className="absolute right-4 bottom-24 flex flex-col items-center gap-4 z-50">
          <VideoActions
            video={video}
            onCommentClick={onCommentClick}
            isMuted={isMuted}
            onMuteToggle={() => setIsMuted(!isMuted)}
            subtitleLanguage={subtitleLanguage}
            onSubtitleChange={setSubtitleLanguage}
          />
        </div>
      </div>
    </div>
  );
}
