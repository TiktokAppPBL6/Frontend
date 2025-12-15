import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
  icon: LucideIcon;
  label?: string;
  count?: number;
  active?: boolean;
  activeColor?: 'red' | 'blue' | 'yellow';
  onClick?: () => void;
  className?: string;
}

const activeColors = {
  red: 'text-[#FE2C55]',
  blue: 'text-[#00D9FF]',
  yellow: 'text-[#FFD600]',
};

/**
 * ActionButton - Reusable action button for video controls
 * TikTok-style with icon, count, and active states
 */
export function ActionButton({
  icon: Icon,
  label,
  count,
  active,
  activeColor = 'red',
  onClick,
  className,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 group transition-transform active:scale-90',
        className
      )}
    >
      {/* Icon with hover and active effects */}
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200',
          'bg-white/10 backdrop-blur-sm shadow-lg',
          'hover:bg-white/20 hover:scale-110',
          active && 'bg-white/20 scale-110'
        )}
      >
        <Icon
          className={cn(
            'w-6 h-6 transition-colors duration-200',
            active ? activeColors[activeColor] : 'text-white',
            'group-hover:scale-110'
          )}
          fill={active ? 'currentColor' : 'none'}
        />
      </div>

      {/* Label */}
      {label && (
        <span className="text-xs font-medium text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {label}
        </span>
      )}

      {/* Count */}
      {count !== undefined && count > 0 && (
        <span className="text-xs font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count}
        </span>
      )}
    </button>
  );
}
