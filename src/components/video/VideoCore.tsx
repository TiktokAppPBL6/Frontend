import { forwardRef, RefObject, useEffect } from 'react';
import { Video } from '@/types';
import { getMediaUrl } from '@/lib/utils';

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

    // Extract URLs from different API response formats
    const v: any = video;
    const videoUrl = v.hlsUrl || v.hls_url || v.url || v.videoUrl || v.video_url || '';
    const audioViUrl = v.audioVi || v.audio_vi || '';
    const thumbnailUrl = v.thumbUrl || v.thumb_url || v.thumbnailUrl || v.thumbnail_url || '';

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
          preload="metadata"
          crossOrigin="anonymous"
          onError={() => {
            console.error('Video load error:', videoUrl);
          }}
        />

        {/* Audio Element for Dubbing */}
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
