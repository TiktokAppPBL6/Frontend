import React, { useState } from 'react';
import { cn, getAvatarUrl } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt = 'Avatar', size = 'md', className }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const avatarUrl = getAvatarUrl(src);
  const defaultAvatar = '/avatar.jpg';

  return (
    <div
      className={cn(
        'relative inline-block rounded-full overflow-hidden bg-gray-200',
        sizeClasses[size],
        className
      )}
    >
      {!imageError ? (
        <img 
          src={avatarUrl} 
          alt={alt} 
          className="h-full w-full object-cover" 
          onError={() => setImageError(true)}
        />
      ) : (
        <img 
          src={defaultAvatar} 
          alt={alt} 
          className="h-full w-full object-cover" 
        />
      )}
    </div>
  );
}
