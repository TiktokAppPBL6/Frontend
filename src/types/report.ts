import type { ID } from './user';

export interface Report {
  id: ID;
  reporterId: ID;
  targetType: 'video' | 'comment' | 'user';
  targetId: ID;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt?: string;
}

export interface ReportCreateRequest {
  targetType: 'video' | 'comment' | 'user';
  targetId: ID;
  reason: string;
  description?: string;
}

export interface ReportUpdateRequest {
  status: 'reviewed' | 'resolved' | 'dismissed';
  note?: string;
}
