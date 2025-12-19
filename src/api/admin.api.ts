import axiosClient from './axiosClient';
import type { ID } from '@/types';

export interface AdminActionRequest {
  action: 'approve' | 'reject' | 'delete' | 'ban' | 'unban' | 'suspend';
  reason?: string;
}

export interface AdminTestResult {
  success: boolean;
  message: string;
  details?: any;
}

export const adminApi = {
  // Run tests
  runTests: async (): Promise<AdminTestResult> => {
    try {
      const response = await axiosClient.post<AdminTestResult>('/admin/run-tests');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin video action
  videoAction: async (videoId: ID, action: AdminActionRequest): Promise<{ message: string }> => {
    try {
      const response = await axiosClient.post<{ message: string }>(
        '/admin/videos/action',
        {
          video_id: videoId,
          ...action,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin user action
  userAction: async (userId: ID, action: AdminActionRequest): Promise<{ message: string }> => {
    try {
      const response = await axiosClient.post<{ message: string }>(
        '/admin/users/action',
        {
          user_id: userId,
          ...action,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin comment action
  commentAction: async (commentId: ID, action: AdminActionRequest): Promise<{ message: string }> => {
    try {
      const response = await axiosClient.post<{ message: string }>(
        '/admin/comments/action',
        {
          comment_id: commentId,
          ...action,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // List users (admin)
  listUsers: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<{ users: any[]; total: number }> => {
    try {
      const response = await axiosClient.get<{ users: any[]; total: number }>(
        '/admin/users/list',
        { params }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // List videos (admin)
  listVideos: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<{ videos: any[]; total: number }> => {
    try {
      const response = await axiosClient.get<{ videos: any[]; total: number }>(
        '/admin/videos/list',
        { params }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Analytics Overview
  getAnalyticsOverview: async (): Promise<{
    users: {
      total: number;
      active: number;
      new_today: number;
      new_week: number;
      new_month: number;
    };
    videos: {
      total: number;
      public: number;
      hidden: number;
      deleted: number;
      uploaded_today: number;
      uploaded_week: number;
      uploaded_month: number;
    };
    comments: {
      total: number;
      today: number;
      week: number;
      month: number;
    };
    reports: {
      total: number;
      pending: number;
      closed: number;
    };
  }> => {
    try {
      const response = await axiosClient.get('/admin/analytics/overview');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
