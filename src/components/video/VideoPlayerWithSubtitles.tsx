import { MutableRefObject } from 'react';
import { SubtitleDisplay } from './SubtitleDisplay';
import { VideoCore } from './VideoCore';
import type { Video } from '@/types';

interface VideoPlayerWithSubtitlesProps {
  video: Video;
  videoRef: React.RefObject<HTMLVideoElement>;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTimeRef: MutableRefObject<number>;
  isMuted: boolean;
  subtitleLanguage: 'off' | 'en' | 'vi';
  transcriptData: any;
  onVideoClick: () => void;
}

export function VideoPlayerWithSubtitles({
  video,
  videoRef,
  audioRef,
  currentTimeRef,
  isMuted,
  subtitleLanguage,
  transcriptData,
  onVideoClick,
}: VideoPlayerWithSubtitlesProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <VideoCore
        video={video}
        videoRef={videoRef}
        audioRef={audioRef}
        isMuted={isMuted}
        onVideoClick={onVideoClick}
      />

      {/* Subtitles - Centered at bottom with more space */}
      {subtitleLanguage !== 'off' && transcriptData?.timestamps && (
        <SubtitleDisplay
          timestamps={transcriptData.timestamps}
          currentTimeRef={currentTimeRef}
          language={subtitleLanguage}
          className="bottom-24"
        />
      )}

      {/* Bottom Gradient Overlay for better text readability */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-0" />
    </div>
  );
}
