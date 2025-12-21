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
    const videoEl = videoRef.current;
    const audioEl = audioRef.current;
    
    if (!videoEl) return;
    
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    
    if (isDubbing && audioEl) {
      // Đang dùng dubbing → mute/unmute audio dubbing
      audioEl.muted = newMuted;
      // Video vẫn luôn muted khi dubbing bật
      videoEl.muted = true;
    } else {
      // Đang dùng audio gốc → mute/unmute video
      videoEl.muted = newMuted;
      // Audio không được dùng
      if (audioEl) audioEl.muted = true;
    }
  }, [videoRef, audioRef, isDubbing, isMuted]);

  const toggleDubbing = useCallback(() => {
    const newIsDubbing = !isDubbing;
    setIsDubbing(newIsDubbing);
    
    const videoEl = videoRef.current;
    const audioEl = audioRef.current;
    
    if (!videoEl || !audioEl) return;
    
    const wasPlaying = !videoEl.paused;
    const currentTime = videoEl.currentTime;
    
    // Always sync audio time to current video position when toggling
    const syncAudioTime = () => {
      // Check if audio source is valid (not CORS blocked)
      if (!audioEl.src || audioEl.error) {
        return false; // Audio unavailable due to CORS or other error
      }
      
      // Need HAVE_CURRENT_DATA (2) or higher to reliably set currentTime
      if (audioEl.readyState >= 2) {
        audioEl.currentTime = currentTime;
        return true;
      } else {
        // If not ready, force load and sync
        audioEl.load();
        const syncOnReady = () => {
          if (!audioEl.error) {
            audioEl.currentTime = currentTime;
          }
        };
        audioEl.addEventListener('loadedmetadata', syncOnReady, { once: true });
        audioEl.addEventListener('canplay', syncOnReady, { once: true });
        return false;
      }
    };
    
    if (newIsDubbing) {
      // BẬT dubbing: chuyển sang dùng audio dubbing
      // - Mute video (không dùng audio gốc nữa)
      // - Unmute/mute audio theo trạng thái isMuted hiện tại
      // - Sync thời gian audio = video
      // - Nếu video đang play → play audio
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
      // TẮT dubbing: chuyển về dùng audio gốc video
      // - Pause audio dubbing
      // - Unmute/mute video theo trạng thái isMuted hiện tại
      // - Sync audio time cho lần sau (nếu bật lại)
      audioEl.pause();
      audioEl.currentTime = currentTime;
      videoEl.muted = isMuted;
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
