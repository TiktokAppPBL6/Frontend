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
    
    if (!videoEl || !audioEl) {
      return;
    }
    
    const wasPlaying = !videoEl.paused;
    
    // CRITICAL: Pause video FIRST to capture exact time
    // This prevents video from advancing while we sync audio
    if (wasPlaying) {
      videoEl.pause();
    }
    
    // Capture time AFTER pausing to get exact sync point
    const targetTime = videoEl.currentTime;
    
    console.log('🎵 Toggle dubbing:', { newIsDubbing, targetTime, wasPlaying, audioReadyState: audioEl.readyState });
    
    if (newIsDubbing) {
      // BẬT dubbing: chuyển sang dùng audio dubbing
      
      // Step 1: Mute video audio IMMEDIATELY
      videoEl.muted = true;
      
      // Step 2: Apply mute state to audio dubbing FIRST
      audioEl.muted = isMuted;
      
      // Step 3: Sync audio to exact video position
      const syncAndResume = () => {
        if (!audioEl.error && audioEl.src) {
          console.log('🎵 Syncing audio to:', targetTime, 'current:', audioEl.currentTime);
          
          // Skip seek if already at target (within 50ms)
          if (Math.abs(audioEl.currentTime - targetTime) < 0.05) {
            console.log('🎵 Already at target, resuming...');
            if (wasPlaying) {
              Promise.all([
                videoEl.play().catch(() => {}),
                audioEl.play().catch(() => {})
              ]);
            }
            return;
          }
          
          // Seek audio, wait for completion, then resume both
          const handleAudioSeeked = () => {
            console.log('🎵 Audio seeked to:', audioEl.currentTime);
            if (wasPlaying) {
              // Resume both video and audio together
              Promise.all([
                videoEl.play().catch(() => {}),
                audioEl.play().catch(() => {})
              ]);
            }
          };
          
          audioEl.addEventListener('seeked', handleAudioSeeked, { once: true });
          audioEl.currentTime = targetTime;
        }
      };
      
      // Check if audio has enough data to seek
      if (audioEl.readyState >= 2) {
        syncAndResume();
      } else {
        const handleCanPlay = () => {
          syncAndResume();
        };
        audioEl.addEventListener('canplay', handleCanPlay, { once: true });
        if (audioEl.readyState === 0 && audioEl.src) {
          audioEl.load();
        }
      }
    } else {
      // TẮT dubbing: chuyển về dùng audio gốc video
      
      // Step 1: Stop audio dubbing IMMEDIATELY
      audioEl.pause();
      audioEl.muted = true;
      
      // Step 2: Unmute video to use original audio
      videoEl.muted = isMuted;
      
      // Step 3: Resume video if it was playing
      if (wasPlaying) {
        videoEl.play().catch(() => {});
      }
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
