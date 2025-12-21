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
  setIsMuted: (muted: boolean) => void;
  setIsDubbing: (dubbing: boolean) => void;
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
    
    // IMMEDIATE mute/unmute - no delay
    if (isDubbing && audioEl) {
      // Đang dùng dubbing → mute/unmute audio dubbing NGAY LẬP TỨC
      audioEl.muted = newMuted;
      // Video vẫn luôn muted khi dubbing bật
      videoEl.muted = true;
    } else {
      // Đang dùng audio gốc → mute/unmute video NGAY LẬP TỨC
      videoEl.muted = newMuted;
      // Ensure audio dubbing is muted when not in use
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
    // Use video currentTime as source of truth
    const currentTime = videoEl.currentTime;
    
    if (newIsDubbing) {
      // BẬT dubbing: chuyển sang dùng audio dubbing
      // CRITICAL: Đảm bảo không phát cả 2 audio cùng lúc
      // - Mute video TRƯỚC (tắt audio gốc)
      // - Sync thời gian audio = video (GIỮ ĐÚNG THỜI ĐIỂM)
      // - Nếu video đang play → play audio dubbing
      // - Apply mute state theo isMuted
      
      // Step 1: Mute video audio IMMEDIATELY
      videoEl.muted = true;
      
      // Step 2: Apply mute state to audio dubbing FIRST
      audioEl.muted = isMuted;
      
      // Step 3: Sync audio time to video time (KHÔNG RESTART TỪ ĐẦU)
      // IMPORTANT: Must sync BEFORE playing to avoid restart
      // Capture currentTime NOW before any async operations
      const targetTime = currentTime;
      
      const syncAndPlay = () => {
        if (!audioEl.error && audioEl.src) {
          // Use captured time, not current video time (which might have changed)
          audioEl.currentTime = targetTime;
          if (wasPlaying) {
            // Use requestAnimationFrame to ensure currentTime is applied
            requestAnimationFrame(() => {
              // Check if still should play (user might have paused in the meantime)
              if (!videoEl.paused && !audioEl.error) {
                audioEl.play().catch(() => {
                  // Silently handle play errors (autoplay policy, etc.)
                });
              }
            });
          }
        }
      };
      
      // Check if audio needs to be loaded first (preload="none")
      if (audioEl.readyState === 0 && audioEl.src) {
        // Audio not loaded yet - trigger load first
        // Use only 'canplay' event to ensure we can set currentTime reliably
        const handleCanPlay = () => {
          syncAndPlay();
        };
        audioEl.addEventListener('canplay', handleCanPlay, { once: true });
        audioEl.load();
      } else if (audioEl.readyState >= 2) {
        syncAndPlay();
      } else {
        // Loading in progress - wait for canplay
        audioEl.addEventListener('canplay', syncAndPlay, { once: true });
      }
    } else {
      // TẮT dubbing: chuyển về dùng audio gốc video
      // CRITICAL: Đảm bảo không phát cả 2 audio cùng lúc
      // - Pause và mute audio dubbing TRƯỚC
      // - Sync audio time cho lần sau (GIỮ VỊ TRÍ)
      // - Unmute video để dùng audio gốc
      
      // Step 1: Stop audio dubbing IMMEDIATELY
      audioEl.pause();
      audioEl.muted = true;
      
      // Step 2: Sync audio time for next toggle (GIỮ VỊ TRÍ)
      audioEl.currentTime = currentTime;
      
      // Step 3: Unmute video to use original audio
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
    setIsMuted,
    setIsDubbing,
  };
}
