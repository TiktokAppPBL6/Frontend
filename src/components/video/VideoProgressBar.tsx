import { useState } from 'react';

interface VideoProgressBarProps {
  progress: number;
  onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onProgressMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onProgressMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onProgressMouseUp: () => void;
}

export function VideoProgressBar({
  progress,
  onProgressClick,
  onProgressMouseDown,
  onProgressMouseMove,
  onProgressMouseUp,
}: VideoProgressBarProps) {
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const paddingLeft = 16;
    const paddingRight = 16;
    const availableWidth = rect.width - paddingLeft - paddingRight;
    const mouseX = e.clientX - rect.left - paddingLeft;
    const percentage = Math.max(0, Math.min(100, (mouseX / availableWidth) * 100));
    
    setHoverPosition(percentage);
    onProgressMouseMove(e);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setHoverPosition(null);
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 px-4 py-4 cursor-pointer z-40 group"
      onClick={onProgressClick}
      onMouseDown={onProgressMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={onProgressMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Larger hit area for easier interaction */}
      <div className="w-full relative py-2">
        {/* Track - thinner bar with larger clickable area */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-visible group-hover:h-1.5 transition-all duration-200 relative">
          {/* Progress fill */}
          <div
            className="h-full bg-gradient-to-r from-[#FE2C55] to-[#FF6B9D] transition-all duration-150 rounded-full"
            style={{ width: `${progress}%` }}
          />
          
          {/* Hover preview - show where user will seek to */}
          {isHovering && hoverPosition !== null && (
            <div
              className="absolute top-0 h-full bg-white/30 transition-all duration-75 rounded-full"
              style={{ width: `${hoverPosition}%` }}
            />
          )}
        </div>
        
        {/* Progress indicator dot - appears on hover at current progress */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
        />
        
        {/* Hover indicator dot - shows where click will seek to */}
        {isHovering && hoverPosition !== null && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white/70 rounded-full pointer-events-none transition-all duration-75"
            style={{ left: `${hoverPosition}%`, transform: 'translate(-50%, -50%)' }}
          />
        )}
      </div>
    </div>
  );
}
