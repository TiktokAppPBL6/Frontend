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
  // ===== Analytics =====
  
  // Analytics Overview
  getAnalyticsOverview: async (): Promise<any> => {
    try {
      const response = await axiosClient.get('/api/v1/admin/analytics/overview');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Users Growth
  getUsersGrowth: async (params?: { period?: string; timeframe?: string }): Promise<any> => {
    try {
      const response = await axiosClient.get('/api/v1/admin/analytics/users/growth', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Active Users
  getActiveUsers: async (params?: { period?: string; timeframe?: string }): Promise<any> => {
    try {
      const response = await axiosClient.get('/api/v1/admin/analytics/users/active', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Trending Videos
  getTrendingVideos: async (params?: { limit?: number; period?: string }): Promise<any> => {
    try {
      const response = await axiosClient.get('/api/v1/admin/analytics/videos/trending', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Videos Views
  getVideosViews: async (params?: { period?: string; timeframe?: string }): Promise<any> => {
    try {
      const response = await axiosClient.get('/api/v1/admin/analytics/videos/views', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Videos Engagement
  getVideosEngagement: async (params?: { period?: string; timeframe?: string }): Promise<any> => {
    try {
      const response = await axiosClient.get('/api/v1/admin/analytics/videos/engagement', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get System Storage
  getSystemStorage: async (): Promise<any> => {
    try {
      const response = await axiosClient.get('/api/v1/admin/analytics/system/storage');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Comments Stats
  getCommentsStats: async (params?: { period?: string; timeframe?: string }): Promise<any> => {
    try {
      const response = await axiosClient.get('/api/v1/admin/analytics/comments/stats', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== Comments Management =====
  
  // Get Admin Comments List
  getAdminCommentsList: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<any> => {
    try {
      const response = await axiosClient.get('/api/v1/admin/comments/list', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Reported Comments
  getReportedComments: async (params?: { skip?: number; limit?: number }): Promise<any> => {
    try {
      const response = await axiosClient.get('/api/v1/admin/comments/reported', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin Delete Comment
  adminDeleteComment: async (commentId: ID): Promise<void> => {
    try {
      await axiosClient.delete(`/api/v1/admin/comments/${commentId}`);
    } catch (error) {
      throw error;
    }
  },

  // Bulk Comment Action
  bulkCommentAction: async (data: {
    comment_ids: number[];
    action: string;
    reason?: string;
  }): Promise<any> => {
    try {
      const response = await axiosClient.post('/api/v1/admin/comments/bulk-action', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== Admin Actions (Users, Videos, Reports) =====
  
  // Bulk User Action
  bulkUserAction: async (data: {
    user_ids: number[];
    action: string;
    reason?: string;
  }): Promise<any> => {
    try {
      const response = await axiosClient.post('/api/v1/admin/users/bulk-action', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk Video Action
  bulkVideoAction: async (data: {
    video_ids: number[];
    action: string;
    reason?: string;
  }): Promise<any> => {
    try {
      const response = await axiosClient.post('/api/v1/admin/videos/bulk-action', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Bulk Handle Reports
  bulkHandleReports: async (data: {
    report_ids: number[];
    decision: string;
    notes?: string;
  }): Promise<any> => {
    try {
      const response = await axiosClient.post('/api/v1/admin/reports/bulk-handle', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Broadcast Notification
  broadcastNotification: async (data: {
    title: string;
    message: string;
    user_ids?: number[];
    type?: string;
  }): Promise<any> => {
    try {
      const response = await axiosClient.post('/api/v1/admin/notifications/broadcast', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get Recent Logs
  getRecentLogs: async (params?: { limit?: number; level?: string }): Promise<any> => {
    try {
      const response = await axiosClient.get('/api/v1/admin/logs/recent', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ===== Legacy/Helper Methods =====
  
  // List Users (uses regular users endpoint for admin purposes)
  // Note: Backend does NOT have /api/v1/admin/users/list endpoint
  listUsers: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<{ users: any[]; total: number }> => {
    try {
      const response = await axiosClient.get<any>(
        '/api/v1/users/',
        { params }
      );
      
      console.log('👥 Admin list users response:', response.data);
      
      // Normalize response
      const data = response.data;
      
      if (Array.isArray(data)) {
        return {
          users: data,
          total: data.length,
        };
      }
      
      // If backend returns object with users array
      return {
        users: data.users || data.items || data.data || [],
        total: data.total || data.total_count || data.count || 0,
      };
    } catch (error) {
      throw error;
    }
  },

  // List Videos (uses regular videos endpoint for admin purposes)
  // Note: Backend does NOT have /api/v1/admin/videos/list endpoint
  listVideos: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<{ videos: any[]; total: number }> => {
    try {
      const response = await axiosClient.get<any>(
        '/api/v1/videos/',
        { params }
      );
      
      console.log('📹 Admin list videos response:', response.data);
      
      // Normalize response
      const data = response.data;
      
      if (Array.isArray(data)) {
        return {
          videos: data,
          total: data.length,
        };
      }
      
      // If backend returns object with videos array
      return {
        videos: data.videos || data.items || data.data || [],
        total: data.total || data.total_count || data.count || 0,
      };
    } catch (error) {
      throw error;
    }
  },

  // User Action (single user) - uses bulk action with single ID
  userAction: async (userId: ID, action: { action: string; reason?: string }): Promise<{ message: string }> => {
    try {
      const response = await axiosClient.post('/api/v1/admin/users/bulk-action', {
        user_ids: [userId],
        ...action,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Video Action (single video) - uses bulk action with single ID
  videoAction: async (videoId: ID, action: { action: string; reason?: string }): Promise<{ message: string }> => {
    try {
      const response = await axiosClient.post('/api/v1/admin/videos/bulk-action', {
        video_ids: [videoId],
        ...action,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Comment Action (single comment) - uses bulk action with single ID
  commentAction: async (commentId: ID, action: { action: string; reason?: string }): Promise<{ message: string }> => {
    try {
      const response = await axiosClient.post('/api/v1/admin/comments/bulk-action', {
        comment_ids: [commentId],
        ...action,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
