import { Video } from '@/types';
import { getAvatarUrl } from '@/lib/utils';

interface VideoOwnerInfo {
  ownerId: number | null;
  ownerUsername: string;
  ownerAvatar: string;
  initialFollow: boolean;
}

/**
 * Extract owner information from video data
 * Handles multiple API response formats
 */
export function getVideoOwnerInfo(video: Video): VideoOwnerInfo {
  const v: any = video;
  
  const ownerId = v.ownerId ?? v.owner_id ?? (v.owner as any)?.id ?? null;
  const ownerUsername: string = v.username ?? v.user_name ?? (v.owner as any)?.username ?? '';
  const ownerAvatar: string = getAvatarUrl(v.avatarUrl ?? v.avatar_url ?? (v.owner as any)?.avatarUrl);
  const initialFollow = v.is_following ?? v.isFollowing ?? (v.owner as any)?.is_following ?? false;

  return {
    ownerId,
    ownerUsername,
    ownerAvatar,
    initialFollow,
  };
}
