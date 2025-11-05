export type { User, AuthResponse, LoginRequest, RegisterRequest, ID } from './user';
export type { Video, VideoUploadRequest, VideoUpdateRequest, VideosResponse } from './video';
export type { Comment, CommentCreateRequest, CommentUpdateRequest, CommentsResponse } from './comment';
export type { Notification, NotificationsResponse } from './notification';
export type { Message, Conversation, MessageSendRequest, MessagesResponse, InboxResponse } from './message';
export type { Report, ReportCreateRequest, ReportUpdateRequest } from './report';

// Common API response types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SearchParams extends PaginationParams {
  query: string;
}
