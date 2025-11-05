import React from 'react';
import { cn, getMediaUrl } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt = 'Avatar', size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const avatarUrl = getMediaUrl(src);

  return (
    <div
      className={cn(
        'relative inline-block rounded-full overflow-hidden bg-gray-200',
        sizeClasses[size],
        className
      )}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-gray-300">
          <User className="h-1/2 w-1/2 text-gray-500" />
        </div>
      )}
    </div>
  );
}
