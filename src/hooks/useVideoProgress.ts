import { useState, useEffect, useCallback, MutableRefObject, RefObject } from 'react';

interface UseVideoProgressProps {
  videoRef: RefObject<HTMLVideoElement>;
  audioRef: RefObject<HTMLAudioElement>;
  currentTimeRef: MutableRefObject<number>;
  isDubbing: boolean;
}

interface UseVideoProgressReturn {
  progress: number;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  handleProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleProgressMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleProgressMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleProgressMouseUp: () => void;
}

/**
 * Hook to manage video progress bar interactions
 * Handles clicking, dragging, and syncing with audio when dubbing
 */
export function useVideoProgress({
  videoRef,
  audioRef,
  currentTimeRef,
  isDubbing,
}: UseVideoProgressProps): UseVideoProgressReturn {
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Update progress from video/audio time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      // Wait until video has enough data to get duration
      if (video.readyState < 1) {
        setProgress(0);
        currentTimeRef.current = 0;
        return;
      }

      let duration = video.duration;

      if (!Number.isFinite(duration) || duration <= 0) {
        if (video.seekable && video.seekable.length > 0) {
          duration = video.seekable.end(video.seekable.length - 1);
        }
      }

      if (duration && duration > 0) {
        // Always use video.currentTime as source of truth for subtitle sync
        // Audio time is only used as fallback reference when debugging sync issues
        const currentTime = video.currentTime;
        
        const percent = (currentTime / duration) * 100;
        const clamped = Math.max(0, Math.min(100, percent));
        setProgress(clamped);
        // CRITICAL: Always update currentTimeRef for subtitle sync
        currentTimeRef.current = currentTime;
      } else {
        setProgress(0);
        currentTimeRef.current = 0;
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);
    // Also update on seeked to ensure immediate subtitle update
    video.addEventListener('seeked', updateProgress);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', updateProgress);
      video.removeEventListener('seeked', updateProgress);
    };
  }, [videoRef, audioRef, currentTimeRef, isDubbing]);

  // Seek to position in video
  const seekToPosition = useCallback((clientX: number, rect: DOMRect) => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;
    
    // Wait until video has loaded metadata
    if (video.readyState < 1) return;
    
    // Get actual duration (handle HLS/streaming videos)
    let duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) {
      if (video.seekable && video.seekable.length > 0) {
        duration = video.seekable.end(video.seekable.length - 1);
      }
    }
    
    // If still no valid duration, cannot seek
    if (!duration || duration <= 0 || !Number.isFinite(duration)) {
      return;
    }
    
    // VideoProgressBar has px-4 padding (16px each side)
    const paddingLeft = 16;
    const paddingRight = 16;
    
    // Calculate position within the padded container
    const relativeX = clientX - rect.left;
    
    // Clamp to padding boundaries
    const clampedX = Math.max(paddingLeft, Math.min(rect.width - paddingRight, relativeX));
    
    // Calculate percentage within the actual bar area (excluding padding)
    const barWidth = rect.width - paddingLeft - paddingRight;
    const percentage = (clampedX - paddingLeft) / barWidth;
    
    // Calculate new time and ensure it's within valid range
    const newTime = Math.max(0, Math.min(duration, percentage * duration));
    
    // Immediate visual feedback
    setProgress(percentage * 100);
    
    const wasPlaying = !video.paused;
    if (wasPlaying) {
      video.pause();
      if (isDubbing && audio) {
        audio.pause();
      }
    }
    
    // Try to seek - wrap in try-catch for safety
    try {
      // For most videos, just seek directly
      // Only check seekable range for streaming/HLS videos with limited buffer
      if (video.seekable && video.seekable.length > 0) {
        const seekableStart = video.seekable.start(0);
        const seekableEnd = video.seekable.end(video.seekable.length - 1);
        
        // Only enforce seekable range if it's actually restricted AND valid
        // seekableEnd must be > 0 and represent actual buffered content
        // This happens with live streams or partially buffered videos
        const hasValidSeekableRange = seekableEnd > 1; // At least 1 second buffered
        const hasRestrictedRange = hasValidSeekableRange && (seekableStart > 0.5 || (seekableEnd < duration - 0.5));
        
        if (hasRestrictedRange && (newTime < seekableStart || newTime > seekableEnd)) {
          // Clamp to seekable range for restricted videos
          const clampedTime = Math.max(seekableStart, Math.min(seekableEnd, newTime));
          video.currentTime = clampedTime;
          currentTimeRef.current = clampedTime;
        } else {
          // Normal seek for fully buffered videos or invalid seekable range
          video.currentTime = newTime;
          currentTimeRef.current = newTime;
        }
      } else {
        video.currentTime = newTime;
        currentTimeRef.current = newTime;
      }
    } catch (error) {
      // If seek fails, just update the ref to current position
      currentTimeRef.current = video.currentTime;
      return;
    }
    
    // Get the actual time that was set (might be clamped)
    const actualTime = video.currentTime;
    
    if (isDubbing && audio && audio.src && !audio.error) {
      const syncAndResume = () => {
        if (!audio.error) {
          audio.currentTime = actualTime;
          if (wasPlaying) {
            setTimeout(() => {
              video.play();
              audio.play().catch(() => {});
            }, 100);
          }
        } else if (wasPlaying) {
          setTimeout(() => video.play(), 100);
        }
      };
      
      if (audio.readyState >= 2) {
        syncAndResume();
      } else {
        audio.addEventListener('loadedmetadata', syncAndResume, { once: true });
        audio.addEventListener('canplay', syncAndResume, { once: true });
      }
    } else if (wasPlaying) {
      setTimeout(() => video.play(), 100);
    }
  }, [videoRef, audioRef, currentTimeRef, isDubbing]);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seekToPosition(e.clientX, rect);
  }, [seekToPosition]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    seekToPosition(e.clientX, rect);
  }, [seekToPosition]);

  const handleProgressMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    seekToPosition(e.clientX, rect);
  }, [isDragging, seekToPosition]);

  const handleProgressMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Global mouse up listener
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseUp = () => setIsDragging(false);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  }, [isDragging]);

  return {
    progress,
    isDragging,
    setIsDragging,
    handleProgressClick,
    handleProgressMouseDown,
    handleProgressMouseMove,
    handleProgressMouseUp,
  };
}
