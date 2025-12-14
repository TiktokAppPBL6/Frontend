import { forwardRef, RefObject, useEffect } from 'react';
import { Video } from '@/types';

interface VideoCoreProps {
  video: Video;
  videoRef: RefObject<HTMLVideoElement>;
  audioRef: RefObject<HTMLAudioElement>;
  isMuted: boolean;
  isDubbing: boolean;
  className?: string;
  onVideoClick?: () => void;
}

/**
 * VideoCore - Pure video/audio element wrapper
 * Handles video and audio elements with proper lifecycle
 * No business logic - just rendering and basic event forwarding
 */
export const VideoCore = forwardRef<HTMLDivElement, VideoCoreProps>(
  ({ video, videoRef, audioRef, isMuted, isDubbing, className, onVideoClick }, ref) => {
    // Sync muted state with video element
    useEffect(() => {
      if (videoRef.current) {
        videoRef.current.muted = isDubbing ? true : isMuted;
      }
    }, [videoRef, isMuted, isDubbing]);

    // Sync muted state with audio element
    useEffect(() => {
      if (audioRef.current && isDubbing) {
        audioRef.current.muted = isMuted;
      }
    }, [audioRef, isMuted, isDubbing]);

    const videoUrl = (video as any).videoUrl || (video as any).video_url || '';
    const audioViUrl = (video as any).audioVi || (video as any).audio_vi || '';
    const thumbnailUrl = (video as any).thumbnailUrl || (video as any).thumbnail_url || '';

    return (
      <div
        ref={ref}
        className={className}
        onClick={onVideoClick}
      >
        {/* Main Video Element */}
        <video
          ref={videoRef}
          src={videoUrl}
          poster={thumbnailUrl}
          className="w-full h-full object-contain"
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          onError={(e) => {
            console.error('Video load error:', videoUrl);
          }}
        />

        {/* Audio Element for Dubbing */}
        {audioViUrl && (
          <audio
            ref={audioRef}
            src={audioViUrl}
            preload="metadata"
            crossOrigin="anonymous"
            onError={(e) => {
              // Gracefully handle CORS errors - app will continue without dubbing
              if (audioRef.current) {
                audioRef.current.src = ''; // Clear failed source
              }
            }}
          />
        )}
      </div>
    );
  }
);

VideoCore.displayName = 'VideoCore';
