import { useEffect, RefObject } from 'react';

interface UseVideoSyncProps {
  videoRef: RefObject<HTMLVideoElement>;
  audioRef: RefObject<HTMLAudioElement>;
  isDubbing: boolean;
}

/**
 * Hook to sync audio with video when dubbing is enabled
 * Handles play, pause, seeking events
 * NOTE: Initial sync when toggling dubbing is handled by toggleDubbing() in useVideoControls
 */
export function useVideoSync({ videoRef, audioRef, isDubbing }: UseVideoSyncProps) {
  // Sync audio with video during playback events
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    const handleSeeking = () => {
      if (isDubbing && audio) {
        audio.pause();
      }
    };

    const handleSeeked = () => {
      if (isDubbing && audio) {
        const targetTime = video.currentTime;
        const wasPlaying = !video.paused;
        
        const syncAndPlay = () => {
          // Skip if already at target time
          if (Math.abs(audio.currentTime - targetTime) < 0.1) {
            if (wasPlaying) {
              audio.play().catch(() => {});
            }
            return;
          }
          
          // Wait for audio seek to complete before playing
          const handleAudioSeeked = () => {
            if (wasPlaying && !audio.error) {
              audio.play().catch(() => {});
            }
          };
          audio.addEventListener('seeked', handleAudioSeeked, { once: true });
          audio.currentTime = targetTime;
        };
        
        if (audio.readyState >= 2) {
          syncAndPlay();
        } else {
          audio.addEventListener('canplay', syncAndPlay, { once: true });
        }
      }
    };

    const handlePlay = () => {
      if (isDubbing && audio && audio.src && !audio.error) {
        // Only sync and play audio if audio is currently paused
        // This avoids conflict when toggleDubbing already handled the play
        if (audio.paused) {
          const targetTime = video.currentTime;
          
          const syncAndPlay = () => {
            // Skip seek if already at target time
            if (Math.abs(audio.currentTime - targetTime) < 0.1) {
              audio.play().catch(() => {});
              return;
            }
            
            // Wait for audio seek to complete before playing
            const handleAudioSeeked = () => {
              if (!audio.error) {
                audio.play().catch(() => {});
              }
            };
            audio.addEventListener('seeked', handleAudioSeeked, { once: true });
            audio.currentTime = targetTime;
          };
          
          // Sync time before playing
          if (audio.readyState >= 2) {
            syncAndPlay();
          } else {
            audio.addEventListener('canplay', syncAndPlay, { once: true });
          }
        }
      }
    };

    const handlePause = () => {
      if (isDubbing && audio && audio.src && !audio.error) {
        audio.pause();
      }
    };

    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef, audioRef, isDubbing]);
}
