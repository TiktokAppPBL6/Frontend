import { forwardRef, RefObject, useMemo } from 'react';
import { Video } from '@/types';
import { getMediaUrl } from '@/lib/utils';

interface VideoCoreProps {
  video: Video;
  videoRef: RefObject<HTMLVideoElement>;
  audioRef: RefObject<HTMLAudioElement>;
  isMuted: boolean;
  className?: string;
  onVideoClick?: () => void;
}

/**
 * VideoCore - Pure video/audio element wrapper
 * Handles video and audio elements with proper lifecycle
 * No business logic - just rendering and basic event forwarding
 */
export const VideoCore = forwardRef<HTMLDivElement, VideoCoreProps>(
  ({ video, videoRef, audioRef, className, onVideoClick }, ref) => {
    // NOTE: Muted state is now managed directly in useVideoControls
    // Removed useEffect syncs here to avoid conflicts and ensure immediate response
    // The hooks (useVideoControls, useVideoSync) handle all audio/video state management

    // Extract URLs from different API response formats - memoize to prevent unnecessary re-renders
    const { videoUrl, audioViUrl, thumbnailUrl } = useMemo(() => {
      const v: any = video;
      return {
        videoUrl: v.hlsUrl || v.hls_url || v.url || v.videoUrl || v.video_url || '',
        audioViUrl: v.audioVi || v.audio_vi || '',
        thumbnailUrl: v.thumbUrl || v.thumb_url || v.thumbnailUrl || v.thumbnail_url || '',
      };
    }, [video]);

    return (
      <div
        ref={ref}
        className={`w-full h-full flex items-center justify-center bg-black ${className || ''}`}
        onClick={onVideoClick}
      >
        {/* Main Video Element - Fit screen perfectly without overflow */}
        <video
          ref={videoRef}
          src={getMediaUrl(videoUrl)}
          poster={getMediaUrl(thumbnailUrl)}
          className="max-w-full max-h-full w-auto h-auto"
          style={{ objectFit: 'contain' }}
          playsInline
          preload="auto"
          crossOrigin="anonymous"
          onError={() => {
            console.error('Video load error:', videoUrl);
          }}
        />

        {/* Audio Element for Dubbing - Preload metadata to have it ready */}
        {audioViUrl && (
          <audio
            ref={audioRef}
            src={getMediaUrl(audioViUrl)}
            preload="metadata"
            crossOrigin="anonymous"
            onError={() => {
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
