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
  isDubbing: boolean;
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
  isDubbing,
  subtitleLanguage,
  transcriptData,
  onVideoClick,
}: VideoPlayerWithSubtitlesProps) {
  return (
    <div className="relative">
      <VideoCore
        video={video}
        videoRef={videoRef}
        audioRef={audioRef}
        isMuted={isMuted}
        isDubbing={isDubbing}
        onVideoClick={onVideoClick}
      />

      {/* Subtitles - Smart positioning to avoid UI overlap */}
      {subtitleLanguage !== 'off' && transcriptData?.timestamps && (
        <SubtitleDisplay
          timestamps={transcriptData.timestamps}
          currentTimeRef={currentTimeRef}
          language={subtitleLanguage}
          className="bottom-16"
        />
      )}

      {/* Bottom Gradient Overlay for better text readability */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-3xl pointer-events-none z-0" />
    </div>
  );
}
