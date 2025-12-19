import axiosClient from './axiosClient';
import type { ID } from '@/types';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  refId?: number;
  createdAt: string;
  seen: boolean;
}

export const notificationsApi = {
  // Get notifications
  getNotifications: async (params?: { skip?: number; limit?: number }): Promise<Notification[]> => {
    try {
      const response = await axiosClient.get<Notification[]>('/notifications/', {
        params: {
          skip: params?.skip || 0,
          limit: params?.limit || 50,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get unseen count
  getUnseenCount: async (): Promise<number> => {
    try {
      const response = await axiosClient.get<number>('/notifications/unseen/count');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark notifications as seen
  markAsSeen: async (notificationIds: number[]): Promise<string> => {
    try {
      const response = await axiosClient.post<string>('/notifications/mark-seen', {
        notification_ids: notificationIds,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Mark all as seen
  markAllAsSeen: async (): Promise<string> => {
    try {
      const response = await axiosClient.post<string>('/notifications/mark-all-seen');
      return response.data;
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
