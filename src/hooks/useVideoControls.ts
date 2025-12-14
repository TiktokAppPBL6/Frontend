import { useState, useCallback, RefObject } from 'react';

interface UseVideoControlsProps {
  videoRef: RefObject<HTMLVideoElement>;
  audioRef: RefObject<HTMLAudioElement>;
}

interface UseVideoControlsReturn {
  isMuted: boolean;
  isDubbing: boolean;
  toggleMute: () => void;
  toggleDubbing: () => void;
  handleVideoClick: () => void;
}

/**
 * Hook to manage video playback controls
 * Handles mute, dubbing toggle, and play/pause
 */
export function useVideoControls({
  videoRef,
  audioRef,
}: UseVideoControlsProps): UseVideoControlsReturn {
  const [isMuted, setIsMuted] = useState(false);
  const [isDubbing, setIsDubbing] = useState(false);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
    if (audioRef.current && isDubbing) {
      audioRef.current.muted = !audioRef.current.muted;
    }
  }, [videoRef, audioRef, isDubbing]);

  const toggleDubbing = useCallback(() => {
    const newIsDubbing = !isDubbing;
    setIsDubbing(newIsDubbing);
    
    const videoEl = videoRef.current;
    const audioEl = audioRef.current;
    
    if (!videoEl || !audioEl) return;
    
    const wasPlaying = !videoEl.paused;
    
    // Always sync audio time to current video position when toggling
    const syncAudioTime = () => {
      // Check if audio source is valid (not CORS blocked)
      if (!audioEl.src || audioEl.error) {
        return false; // Audio unavailable due to CORS or other error
      }
      
      // Need HAVE_CURRENT_DATA (2) or higher to reliably set currentTime
      if (audioEl.readyState >= 2) {
        audioEl.currentTime = videoEl.currentTime;
        return true;
      } else {
        // If not ready, force load and sync
        audioEl.load();
        const syncOnReady = () => {
          if (!audioEl.error) {
            audioEl.currentTime = videoEl.currentTime;
          }
        };
        audioEl.addEventListener('loadedmetadata', syncOnReady, { once: true });
        audioEl.addEventListener('canplay', syncOnReady, { once: true });
        return false;
      }
    };
    
    if (newIsDubbing) {
      // Enable dubbing: mute video, sync and play audio
      videoEl.muted = true;
      audioEl.muted = isMuted;
      
      const isReady = syncAudioTime();
      if (wasPlaying) {
        if (isReady) {
          audioEl.play().catch(() => {});
        } else {
          audioEl.addEventListener('loadedmetadata', () => {
            audioEl.play().catch(() => {});
          }, { once: true });
        }
      }
    } else {
      // Disable dubbing: restore video mute state, pause audio
      videoEl.muted = isMuted;
      audioEl.pause();
      audioEl.currentTime = videoEl.currentTime; // Sync for next time
    }
  }, [videoRef, audioRef, isDubbing, isMuted]);

  const handleVideoClick = useCallback(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      const audio = audioRef.current;
      
      if (video.paused) {
        video.play();
        if (isDubbing && audio && audio.src && !audio.error) {
          // Sync before playing - need readyState >= 2
          if (audio.readyState >= 2) {
            audio.currentTime = video.currentTime;
            audio.play().catch(() => {});
          } else {
            // Wait for audio to be ready
            const playWhenReady = () => {
              if (!audio.error) {
                audio.currentTime = video.currentTime;
                audio.play().catch(() => {});
              }
            };
            audio.addEventListener('canplay', playWhenReady, { once: true });
          }
        }
      } else {
        video.pause();
        if (isDubbing && audio && audio.src && !audio.error) {
          audio.pause();
        }
      }
    }
  }, [videoRef, audioRef, isDubbing]);

  return {
    isMuted,
    isDubbing,
    toggleMute,
    toggleDubbing,
    handleVideoClick,
  };
}
