import axiosClient, { shouldUseMock } from './axiosClient';
import type { Notification, NotificationsResponse, ID } from '@/types';
import { mockNotifications, mockDelay } from '@/mocks/mockDB';

export const notificationsApi = {
  // Get notifications
  getNotifications: async (): Promise<NotificationsResponse> => {
    try {
      const response = await axiosClient.get<NotificationsResponse>('/notifications/');
      
      // If API returns empty, use mock data
      if (!response.data.notifications || response.data.notifications.length === 0) {
        console.log('📦 API returned no notifications, using mock data');
        await mockDelay();
        const unseenCount = mockNotifications.filter((n) => !n.seen).length;
        return {
          notifications: mockNotifications,
          total: mockNotifications.length,
          unseenCount,
        };
      }
      
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        const unseenCount = mockNotifications.filter((n) => !n.seen).length;
        return {
          notifications: mockNotifications,
          total: mockNotifications.length,
          unseenCount,
        };
      }
      throw error;
    }
  },

  // Get unseen count
  getUnseenCount: async (): Promise<{ count: number }> => {
    try {
      const response = await axiosClient.get<{ count: number }>('/notifications/unseen/count');
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        const count = mockNotifications.filter((n) => !n.seen).length;
        return { count };
      }
      throw error;
    }
  },

  // Mark notification as seen
  markAsSeen: async (notificationId: ID): Promise<void> => {
    try {
      await axiosClient.post('/notifications/mark-seen', { notificationId });
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay(200);
        return;
      }
      throw error;
    }
  },

  // Mark all as seen
  markAllAsSeen: async (): Promise<void> => {
    try {
      await axiosClient.post('/notifications/mark-all-seen');
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay(200);
        return;
      }
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: ID): Promise<void> => {
    try {
      await axiosClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return;
      }
      throw error;
    }
  },
};
