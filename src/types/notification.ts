import type { ID } from './user';

export interface Notification {
  id: ID;
  userId: ID;
  type: 'like' | 'comment' | 'follow' | 'system';
  refId?: ID;
  message?: string;
  createdAt: string;
  seen: boolean;
  sender?: {
    id: ID;
    username: string;
    avatarUrl?: string;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unseenCount: number;
}
