import { useEffect, useState, useRef, memo } from 'react';
import { SubtitleTimestamp } from '@/types/video';
import { cn } from '@/lib/utils';

interface SubtitleDisplayProps {
  timestamps: SubtitleTimestamp[];
  currentTimeRef: React.RefObject<number>;
  language: 'en' | 'vi';
  className?: string;
}

function SubtitleDisplayComponent({ timestamps, currentTimeRef, language, className }: SubtitleDisplayProps) {
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleTimestamp | null>(null);
  const rafRef = useRef<number>();
  const prevSubtitleRef = useRef<SubtitleTimestamp | null>(null);

  useEffect(() => {
    const updateSubtitle = () => {
      const currentTime = currentTimeRef.current || 0;
      const subtitle = timestamps.find(
        (t) => currentTime >= t.start && currentTime <= t.end
      );
      
      // Only update state if subtitle actually changed
      if (subtitle !== prevSubtitleRef.current) {
        prevSubtitleRef.current = subtitle || null;
        setCurrentSubtitle(subtitle || null);
      }
      
      rafRef.current = requestAnimationFrame(updateSubtitle);
    };

    rafRef.current = requestAnimationFrame(updateSubtitle);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [timestamps, currentTimeRef]);

  if (!currentSubtitle) return null;

  const text = language === 'vi' ? currentSubtitle.text_vi : currentSubtitle.text;

  return (
    <div className={cn("absolute inset-x-0 flex justify-center px-4 pointer-events-none z-30", className)}>
      <div className="inline-block max-w-[85%] px-3 py-1.5 rounded-lg bg-black/90 backdrop-blur-sm">
        <p className="text-white text-center text-xs sm:text-sm leading-snug tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
          {text}
        </p>
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const SubtitleDisplay = memo(SubtitleDisplayComponent);

