import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from '@/types';
import { VideoActions } from './VideoActions';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';

interface FeedVideoProps {
  video: Video;
  isInView?: boolean;
  onVideoInView?: (videoId: number, inView: boolean) => void;
}

export function FeedVideo({ video, isInView = false, onVideoInView }: FeedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // Intersection Observer for autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const inView = entry.isIntersecting && entry.intersectionRatio >= 0.6;
          onVideoInView?.(video.id, inView);

          if (videoRef.current) {
            if (inView) {
              videoRef.current.play().catch((e) => console.log('Play failed:', e));
              setIsPlaying(true);
            } else {
              videoRef.current.pause();
              setIsPlaying(false);
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
  }, [video.id, onVideoInView]);

  // Force play/pause based on isInView prop (for controlling from parent)
  useEffect(() => {
    if (videoRef.current) {
      if (isInView && !isPlaying) {
        videoRef.current.play().catch((e) => console.log('Play failed:', e));
        setIsPlaying(true);
      } else if (!isInView && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isInView]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[600px] mx-auto mb-4 snap-start"
      style={{ minHeight: '100vh' }}
    >
      {/* Video Container */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 100px)' }}>
        <video
          ref={videoRef}
          src={getMediaUrl(video.hlsUrl || video.url)}
          poster={getMediaUrl(video.thumbUrl)}
          className="w-full h-full object-contain cursor-pointer"
          loop
          muted={isMuted}
          playsInline
          onClick={handleVideoClick}
        />

        {/* Overlay Controls */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Right Side - Avatar with Follow Button + Actions (TikTok Style) */}
          <div className="absolute right-4 bottom-4 pointer-events-auto">
            <div className="flex flex-col items-center gap-3">
              {/* Avatar with + button */}
              <div className="relative w-12 pb-2">
                <button
                  onClick={() => navigate(`/profile/${video.owner?.username}`)}
                  className="block transition-transform hover:scale-105"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shadow-lg">
                    <img
                      src={getMediaUrl(video.owner?.avatarUrl)}
                      alt={video.owner?.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>
                {/* Follow/Unfollow button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Implement follow/unfollow logic
                    console.log('Toggle follow for:', video.owner?.username);
                  }}
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#FE2C55] rounded-full flex items-center justify-center hover:bg-[#FE2C55]/90 transition-all hover:scale-110 shadow-lg"
                  aria-label="Follow"
                >
                  <svg className="w-3.5 h-3.5 text-white font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              {/* Action Buttons */}
              <VideoActions video={video} />
            </div>
          </div>

          {/* Bottom - User Info, Title & Mute Button (Same Row) */}
          <div className="absolute bottom-4 left-4 right-24 pointer-events-auto flex items-end gap-3">
            {/* User Info & Title */}
            <div className="flex-1 min-w-0">
              <div className="inline-block bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <h3 className="font-semibold text-white text-xs truncate">
                  @{video.owner?.username}
                </h3>
                <p className="text-white text-xs line-clamp-1 leading-tight mt-0.5">
                  {video.title}
                </p>
              </div>
            </div>
            
            {/* Mute Button */}
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMute}
              className="bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full w-10 h-10 shrink-0"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
