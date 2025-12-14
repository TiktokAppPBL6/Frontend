import { useEffect, useRef, RefObject } from 'react';

interface UseVideoAutoplayProps {
  videoRef: RefObject<HTMLVideoElement>;
  audioRef: RefObject<HTMLAudioElement>;
  containerRef: RefObject<HTMLDivElement>;
  videoId: number;
  isDubbing: boolean;
  onVideoInView?: (videoId: number, inView: boolean) => void;
}

/**
 * Hook to manage video autoplay based on viewport visibility
 * Uses IntersectionObserver to detect when video is in view
 */
export function useVideoAutoplay({
  videoRef,
  audioRef,
  containerRef,
  videoId,
  isDubbing,
  onVideoInView,
}: UseVideoAutoplayProps) {
  const hasPlayedOnce = useRef<boolean>(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView = entry.isIntersecting && entry.intersectionRatio >= 0.6;
          onVideoInView?.(videoId, inView);

          if (videoRef.current) {
            if (inView) {
              const video = videoRef.current;
              
              // Check if video has valid source before playing
              if (!video.src || video.error) {
                return; // Skip playback if video failed to load
              }
              
              // Auto-unmute on first view only
              if (!hasPlayedOnce.current) {
                video.muted = isDubbing ? true : false;
                hasPlayedOnce.current = true;
              }
              
              video.play().catch(() => {}); // Silently fail
              
              // Sync audio if dubbing and audio is available
              if (isDubbing && audioRef.current && audioRef.current.src) {
                const audio = audioRef.current;
                if (audio.readyState >= 2 && !audio.error) {
                  audio.currentTime = video.currentTime;
                  audio.play().catch(() => {}); // Silently fail if CORS blocked
                }
              }
            } else {
              videoRef.current.pause();
              
              // Pause audio only if it's loaded and not errored
              if (isDubbing && audioRef.current && audioRef.current.src && !audioRef.current.error) {
                audioRef.current.pause();
              }
            }
          }
        });
      },
      {
        threshold: [0.6],
        rootMargin: '0px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [videoRef, audioRef, containerRef, videoId, isDubbing, onVideoInView]);
}
