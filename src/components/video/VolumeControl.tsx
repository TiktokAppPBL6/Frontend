import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VolumeControlProps {
  isMuted: boolean;
  onMuteToggle: () => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
}

export function VolumeControl({ isMuted, onMuteToggle, volume = 1, onVolumeChange }: VolumeControlProps) {
  const [showSlider, setShowSlider] = useState(false);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setCurrentVolume(volume);
  }, [volume]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowSlider(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowSlider(false);
    }, 500);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setCurrentVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  const getVolumeIcon = () => {
    if (isMuted || currentVolume === 0) return VolumeX;
    if (currentVolume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Volume Button */}
      <button
        onClick={onMuteToggle}
        className="flex flex-col items-center gap-1 group transition-transform active:scale-90"
      >
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200',
            'bg-white/10 backdrop-blur-sm shadow-lg',
            'hover:bg-white/20 hover:scale-110',
            !isMuted && 'bg-white/20 scale-105'
          )}
        >
          <VolumeIcon
            className={cn(
              'w-6 h-6 transition-colors duration-200',
              !isMuted ? 'text-white' : 'text-gray-400',
              'group-hover:scale-110'
            )}
            strokeWidth={2.5}
          />
        </div>
      </button>

      {/* Volume Slider */}
      {showSlider && !isMuted && (
        <div className="absolute left-full ml-3 z-50 animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="bg-[#1e1e1e]/95 backdrop-blur-md rounded-full px-4 py-3 shadow-2xl border border-white/20">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={currentVolume}
                onChange={handleVolumeChange}
                className="w-24 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer 
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:w-4 
                  [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-white 
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-xl
                  [&::-webkit-slider-thumb]:hover:scale-125
                  [&::-webkit-slider-thumb]:transition-transform
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-gray-800"
                style={{
                  background: `linear-gradient(to right, #FE2C55 ${currentVolume * 100}%, #374151 ${currentVolume * 100}%)`
                }}
              />
              <span className="text-sm text-white font-bold min-w-[2.5rem] text-right">
                {Math.round(currentVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
