import axiosClient from './axiosClient';
import type { Notification, NotificationsResponse, ID } from '@/types';
export const notificationsApi = {
  // Get notifications
  getNotifications: async (): Promise<NotificationsResponse> => {
    try {
      const response = await axiosClient.get<NotificationsResponse>('/notifications/');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get unseen count
  getUnseenCount: async (): Promise<{ count: number }> => {
    try {
      const response = await axiosClient.get<{ count: number }>('/notifications/unseen/count');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark notification as seen
  markAsSeen: async (notificationId: ID): Promise<void> => {
    try {
      await axiosClient.post('/notifications/mark-seen', { notificationId });
    } catch (error) {
      throw error;
    }
  },

  // Mark all as seen
  markAllAsSeen: async (): Promise<void> => {
    try {
      await axiosClient.post('/notifications/mark-all-seen');
    } catch (error) {
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: ID): Promise<void> => {
    try {
      await axiosClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      throw error;
    }
  },
};
