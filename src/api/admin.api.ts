/**
 * Admin API Client
 * Theo BACKEND_IMPLEMENTATION_GUIDE.md - PHẦN 2
 */

import axiosClient from './axiosClient';
import type { ID } from '@/types';

// ==================== TYPES ====================

export interface AdminStats {
  users: {
    total: number;
    active_7d: number;
    new_today: number;
    banned: number;
  };
  videos: {
    total: number;
    public: number;
    private: number;
    new_today: number;
  };
  reports: {
    total: number;
    pending: number;
    resolved: number;
    rejected: number;
    resolved_today: number;
  };
  engagement?: {
    rate: number;
    views_today: number;
    likes_total: number;
    comments_total: number;
    total_likes: number;
    total_comments: number;
    total_follows: number;
    total_views: number;
  };
}

export interface ChartDataPoint {
  date: string;
  users?: number;
  videos?: number;
  likes?: number;
  comments?: number;
  reports?: number;
}

export interface AdminCharts {
  users_chart: Array<{ date: string; users: number }>;
  videos_chart: Array<{ date: string; videos: number }>;
  engagement_chart: Array<{ date: string; likes: number; comments: number }>;
  reports_chart: Array<{ date: string; reports: number }>;
}

export interface RecentActivity {
  recent_users: any[];
  recent_videos: any[];
  recent_reports: any[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  order?: 'asc' | 'desc';
}

export interface UserListParams extends PaginationParams {
  status?: 'active' | 'banned' | 'all';
}

export interface VideoListParams extends PaginationParams {
  visibility?: 'public' | 'private' | 'all';
}

export interface ReportListParams extends PaginationParams {
  status?: 'pending' | 'resolved' | 'rejected' | 'all';
  target_type?: 'video' | 'comment' | 'user' | 'all';
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

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
  // ==================== STATS APIS (theo PHẦN 2) ====================
  // Updated: 2025-12-21 - Fixed paths to /api/v1/admin/*
  
  /**
   * GET /api/v1/admin/stats/overview
   * Polling: 60s
   */
  getAdminOverview: async (): Promise<AdminStats> => {
    const response = await axiosClient.get('/api/v1/admin/stats/overview');
    console.log('📊 Fetching admin overview from:', '/api/v1/admin/stats/overview');
    return response.data;
  },

  /**
   * GET /api/v1/admin/stats/charts
   * Polling: 60s
   */
  getAdminCharts: async (): Promise<AdminCharts> => {
    const response = await axiosClient.get('/api/v1/admin/stats/charts');
    console.log('📈 Fetching admin charts from:', '/api/v1/admin/stats/charts');
    return response.data;
  },

  /**
   * GET /api/v1/admin/stats/recent-activity
   * Polling: 30s
   */
  getRecentActivity: async (limit = 10): Promise<RecentActivity> => {
    const response = await axiosClient.get('/api/v1/admin/stats/recent-activity', {
      params: { limit }
    });
    return response.data;
  },

  // ==================== USER MANAGEMENT (theo PHẦN 2) ====================

  /**
   * GET /api/v1/admin/users/stats
   * Get user statistics (total, active, blocked)
   */
  getUsersStats: async () => {
    const response = await axiosClient.get('/api/v1/admin/users/stats');
    return response.data;
  },

  /**
   * GET /api/v1/admin/users/list
   * List users with skip/limit pagination
   */
  listUsers: async (params: { skip?: number; limit?: number; status?: string } = {}) => {
    const response = await axiosClient.get('/api/v1/admin/users/list', { params });
    return response.data;
  },

  /**
   * GET /api/v1/admin/users
   * Pagination, search, filter by status
   */
  getAdminUsers: async (params: UserListParams = {}) => {
    const response = await axiosClient.get('/admin/users', { params });
    return response.data;
  },

  /**
   * GET /api/v1/admin/users/{user_id}
   * Chi tiết user + stats + recent activities
   */
  getAdminUserDetail: async (userId: number) => {
    const response = await axiosClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * POST /api/v1/admin/users/{user_id}/ban
   * Ban user → WebSocket event "admin:user_banned"
   */
  banUser: async (userId: number, reason: string) => {
    const response = await axiosClient.post(`/admin/users/${userId}/ban`, { reason });
    return response.data;
  },

  /**
   * POST /api/v1/admin/users/{user_id}/unban
   */
  unbanUser: async (userId: number) => {
    const response = await axiosClient.post(`/admin/users/${userId}/unban`, {});
    return response.data;
  },

  /**
   * DELETE /api/v1/admin/users/{user_id}
   * Xóa user + cascade tất cả data
   */
  deleteUser: async (userId: number, reason: string) => {
    const response = await axiosClient.delete(`/admin/users/${userId}`, {
      data: { reason }
    });
    return response.data;
  },

  /**
   * PUT /api/v1/admin/users/{user_id}/role
   * Update role: user, moderator, admin
   */
  updateUserRole: async (userId: number, role: string) => {
    const response = await axiosClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  /**
   * POST /api/v1/admin/users/{user_id}/verify
   * Verify user (blue checkmark)
   */
  verifyUser: async (userId: number) => {
    const response = await axiosClient.post(`/admin/users/${userId}/verify`, {});
    return response.data;
  },

  // ==================== VIDEO MANAGEMENT (theo PHẦN 2) ====================

  /**
   * GET /api/v1/admin/videos/stats
   * Get video statistics (total, public, hidden, deleted)
   */
  getVideosStats: async () => {
    const response = await axiosClient.get('/api/v1/admin/videos/stats');
    return response.data;
  },

  /**
   * GET /api/v1/admin/videos/list
   * List videos with skip/limit pagination
   */
  listVideos: async (params: { skip?: number; limit?: number; visibility?: string } = {}) => {
    const response = await axiosClient.get('/api/v1/admin/videos/list', { params });
    return response.data;
  },

  /**
   * GET /api/v1/admin/videos
   * Pagination, search, filter by visibility
   */
  getAdminVideos: async (params: VideoListParams = {}) => {
    const response = await axiosClient.get('/admin/videos', { params });
    return response.data;
  },

  /**
   * GET /api/v1/admin/videos/{video_id}
   * Chi tiết video + stats + comments + reports
   */
  getAdminVideoDetail: async (videoId: number) => {
    const response = await axiosClient.get(`/admin/videos/${videoId}`);
    return response.data;
  },

  /**
   * PUT /api/v1/admin/videos/{video_id}/visibility
   * Update visibility: public, private
   */
  updateVideoVisibility: async (videoId: number, visibility: 'public' | 'private') => {
    const response = await axiosClient.put(`/admin/videos/${videoId}/visibility`, { visibility });
    return response.data;
  },

  /**
   * DELETE /api/v1/admin/videos/{video_id}
   * Xóa video → WebSocket event "admin:video_deleted"
   */
  deleteVideo: async (videoId: number, reason: string) => {
    const response = await axiosClient.delete(`/admin/videos/${videoId}`, {
      data: { reason }
    });
    return response.data;
  },

  /**
   * POST /api/v1/admin/videos/bulk-delete
   */
  bulkDeleteVideos: async (videoIds: number[], reason: string) => {
    const response = await axiosClient.post('/admin/videos/bulk-delete', {
      video_ids: videoIds,
      reason
    });
    return response.data;
  },

  // ==================== REPORT MANAGEMENT (theo PHẦN 2) ====================

  /**
   * GET /api/v1/admin/reports
   * Pagination, filter by status, target_type
   */
  getAdminReports: async (params: ReportListParams = {}) => {
    const response = await axiosClient.get('/admin/reports', { params });
    return response.data;
  },

  /**
   * GET /api/v1/admin/reports/{report_id}
   * Chi tiết report + reporter + target info
   */
  getAdminReportDetail: async (reportId: number) => {
    const response = await axiosClient.get(`/admin/reports/${reportId}`);
    return response.data;
  },

  /**
   * POST /api/v1/admin/reports/{report_id}/resolve
   * Resolve report → WebSocket "admin:report_resolved"
   */
  resolveReport: async (reportId: number, result: string) => {
    const response = await axiosClient.post(`/admin/reports/${reportId}/resolve`, { result });
    return response.data;
  },

  /**
   * POST /api/v1/admin/reports/{report_id}/reject
   */
  rejectReport: async (reportId: number, reason: string) => {
    const response = await axiosClient.post(`/admin/reports/${reportId}/reject`, { reason });
    return response.data;
  },

  /**
   * POST /api/v1/admin/reports/bulk-resolve
   */
  bulkResolveReports: async (reportIds: number[], result: string) => {
    const response = await axiosClient.post('/admin/reports/bulk-resolve', {
      report_ids: reportIds,
      result
    });
    return response.data;
  },

  // ==================== LEGACY ANALYTICS (giữ lại để tương thích) ====================
  
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
