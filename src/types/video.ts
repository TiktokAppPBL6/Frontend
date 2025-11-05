import type { ID, User } from './user';

export interface Video {
  id: ID;
  ownerId: ID;
  title: string;
  description?: string;
  durationSec?: number;
  visibility: 'public' | 'hidden' | 'deleted';
  url: string;
  hlsUrl?: string;
  thumbUrl?: string;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  likeCount?: number;
  commentCount?: number;
  viewCount?: number;
  shareCount?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

export interface VideoUploadRequest {
  title: string;
  description?: string;
  url?: string;
  file?: File;
  visibility?: 'public' | 'hidden';
}

export interface VideoUpdateRequest {
  title?: string;
  description?: string;
  visibility?: 'public' | 'hidden' | 'deleted';
}

export interface VideosResponse {
  videos: Video[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
