import { useRef, useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';
import { SubtitleDisplay } from './SubtitleDisplay';
import { VideoTranscript } from '@/types';

interface VideoPlayerProps {
  videoUrl: string;
  transcript?: VideoTranscript | null;
  selectedLanguage?: 'en' | 'vi' | 'off';
  isMuted?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  showControls?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
}

export function VideoPlayer({
  videoUrl,
  transcript,
  selectedLanguage = 'off',
  isMuted = false,
  autoPlay = false,
  loop = true,
  showControls = true,
  onTimeUpdate,
  className = '',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentTimeRef = useRef<number>(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [progress, setProgress] = useState(0);

  // Sync video playing state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Update progress bar
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      currentTimeRef.current = video.currentTime;
      const progressValue = (video.currentTime / video.duration) * 100;
      setProgress(progressValue || 0);
      onTimeUpdate?.(video.currentTime);
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', updateProgress);
    };
  }, [onTimeUpdate]);

  // Sync muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    video.currentTime = percentage * video.duration;
  };

  return (
    <div className={`relative w-full h-full bg-black ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={getMediaUrl(videoUrl)}
        className="w-full h-full object-contain"
        loop={loop}
        playsInline
        autoPlay={autoPlay}
        muted={isMuted}
        onClick={togglePlayPause}
      />

      {/* Subtitle Display */}
      {transcript && selectedLanguage !== 'off' && transcript.timestamps && (
        <SubtitleDisplay
          timestamps={transcript.timestamps}
          currentTimeRef={currentTimeRef}
          language={selectedLanguage}
        />
      )}

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-10 h-10 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Progress Bar (Optional) */}
      {showControls && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 cursor-pointer group hover:h-1.5 transition-all"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-white transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
