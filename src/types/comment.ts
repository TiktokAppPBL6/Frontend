import type { ID, User } from './user';

export interface Comment {
  id: ID;
  videoId: ID;
  userId: ID;
  content: string;
  createdAt: string;
  updatedAt?: string;
  status: 'visible' | 'hidden';
  user?: User;
  likesCount?: number;
  isLiked?: boolean;
}

export interface CommentCreateRequest {
  videoId: ID;
  content: string;
}

export interface CommentUpdateRequest {
  content: string;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
}
