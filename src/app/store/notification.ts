import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import wsService, { WebSocketMessage } from '@/services/websocket.service';
import { notificationsApi, Notification as ApiNotification } from '@/api/notifications.api';

export type Notification = {
  id: number;
  userId: number;
  type: string;
  content: string;
  videoId?: number;
  commentId?: number;
  fromUserId?: number;
  fromUser?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  seen: boolean;
  createdAt: string;
};

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  addNotification: (notification: Notification) => void;
  markAsSeen: (notificationIds: number[]) => void;
  markAllAsSeen: () => void;
  setNotifications: (notifications: Notification[]) => void;
  setUnreadCount: (count: number) => void;
  connectWebSocket: (token: string) => void;
  disconnectWebSocket: () => void;
  removeNotification: (id: number) => void;
  fetchNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => {
      // Setup WebSocket listener for notifications
      const handleNotificationMessage = (message: WebSocketMessage) => {
        if (message.type === 'notification' && message.data) {
          // Map WebSocket notification data to Notification type
          const wsData = message.data;
          const notification: Notification = {
            id: wsData.id || Date.now(), // Use timestamp as fallback ID
            userId: wsData.user_id || 0,
            type: wsData.type || 'unknown',
            content: wsData.message || '',
            videoId: wsData.video_id,
            commentId: wsData.comment_id,
            fromUserId: wsData.user_id,
            fromUser: wsData.username ? {
              id: wsData.user_id,
              username: wsData.username,
              avatarUrl: wsData.avatar
            } : undefined,
            seen: false,
            createdAt: message.timestamp || new Date().toISOString()
          };
          
          get().addNotification(notification);
          
          console.log('📨 WebSocket notification processed:', notification);
        } else if (message.type === 'connection') {
          set({ isConnected: message.status === 'connected' });
        }
      };

      return {
        notifications: [],
        unreadCount: 0,
        isConnected: false,
        isLoading: false,

        fetchNotifications: async () => {
          try {
            set({ isLoading: true });
            const apiData = await notificationsApi.getNotifications();
            
            // Convert API notifications to store format
            const data: Notification[] = apiData.map((n: ApiNotification) => ({
              ...n,
              content: '', // API doesn't return content, set default
              videoId: n.refId,
              fromUser: undefined,
            }));
            
            // Merge API data with existing notifications (preserve WebSocket real-time ones)
            set((state) => {
              const existingIds = new Set(data.map(n => n.id));
              const realtimeOnly = state.notifications.filter(n => !existingIds.has(n.id));
              
              // Combine: API data + real-time notifications not yet in API
              const merged = [...realtimeOnly, ...data];
              const unread = merged.filter(n => !n.seen).length;
              
              return {
                notifications: merged,
                unreadCount: unread,
                isLoading: false
              };
            });
          } catch (error) {
            console.error('Failed to fetch notifications:', error);
            set({ isLoading: false });
          }
        },

        addNotification: (notification: Notification) => {
          // Add to store
          set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));

          // Format message tiếng Việt
          const username = notification.fromUser?.username || 'Hệ thống';
          let message = '';
          let iconEmoji = '';
          
          switch (notification.type) {
            case 'like':
              message = 'đã thích video của bạn';
              iconEmoji = '❤️';
              break;
            case 'comment':
              // Extract comment text
              const commentMatch = notification.content?.match(/commented on your video:\s*(.+)/i);
              if (commentMatch && commentMatch[1]) {
                message = `đã bình luận: ${commentMatch[1]}`;
              } else {
                message = 'đã bình luận video của bạn';
              }
              iconEmoji = '💬';
              break;
            case 'follow':
              message = 'đã theo dõi bạn';
              iconEmoji = '👤';
              break;
            default:
              message = notification.content || 'có hoạt động mới';
              iconEmoji = '🔔';
          }

          // Show beautiful TikTok-style toast popup
          toast.success(`${iconEmoji} ${username} ${message}`, {
            duration: 4000,
            position: 'top-right',
          });
        },

        markAsSeen: (notificationIds: number[]) => {
          set((state) => ({
            notifications: state.notifications.map((notif) =>
              notificationIds.includes(notif.id) ? { ...notif, seen: true } : notif
            ),
            unreadCount: Math.max(0, state.unreadCount - notificationIds.length),
          }));
        },

        markAllAsSeen: () => {
          set((state) => ({
            notifications: state.notifications.map((notif) => ({ ...notif, seen: true })),
            unreadCount: 0,
          }));
        },

        setNotifications: (notifications: Notification[]) => {
          const unread = notifications.filter((n) => !n.seen).length;
          set({ notifications, unreadCount: unread });
        },

        setUnreadCount: (count: number) => {
          set({ unreadCount: count });
        },

        connectWebSocket: (token: string) => {
          // Remove existing listener if any
          wsService.off('notification', handleNotificationMessage);
          wsService.off('connection', handleNotificationMessage);
          
          // Add new listeners
          wsService.on('notification', handleNotificationMessage);
          wsService.on('connection', handleNotificationMessage);
          
          // Connect WebSocket
          wsService.connect(token);
        },

        disconnectWebSocket: () => {
          wsService.off('notification', handleNotificationMessage);
          wsService.off('connection', handleNotificationMessage);
          wsService.disconnect();
          set({ isConnected: false });
        },

        removeNotification: (id: number) => {
          set((state) => {
            const notification = state.notifications.find((n) => n.id === id);
            const wasUnread = notification && !notification.seen;
            return {
              notifications: state.notifications.filter((n) => n.id !== id),
              unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
            };
          });
        },
      };
    },
    {
      name: 'notification-storage', // localStorage key
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);