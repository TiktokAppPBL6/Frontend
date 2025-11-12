import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatDate(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return then.toLocaleDateString('vi-VN');
}

// Get full URL for media files (images, videos)
export function getMediaUrl(url: string | undefined | null, defaultAvatar: boolean = false): string {
  // If URL is null/empty and it's an avatar request, return default avatar
  if (!url && defaultAvatar) {
    return '/avatar.jpg';
  }
  
  if (!url) return '';
  
  // If already a full URL (starts with http:// or https://), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a blob URL (for preview), return as is
  if (url.startsWith('blob:')) {
    return url;
  }
  
  // Otherwise, prepend backend base URL (HTTP server, not file path!)
  const baseUrl = 'http://localhost:8000';
  // Remove leading slash if exists to avoid double slashes
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
}

// Get avatar URL with default fallback
export function getAvatarUrl(url: string | undefined | null): string {
  if (!url) return '/avatar.jpg';
  
  // If already a full URL (starts with http:// or https://), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a blob URL (for preview), return as is
  if (url.startsWith('blob:')) {
    return url;
  }
  
  // Otherwise, prepend backend base URL
  const baseUrl = 'http://localhost:8000';
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanUrl}`;
}
