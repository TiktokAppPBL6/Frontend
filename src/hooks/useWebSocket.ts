/**
 * Custom hook for WebSocket Integration
 * Theo BACKEND_IMPLEMENTATION_GUIDE.md - PHẦN 1
 */

import { useEffect } from 'react';
import { WebSocketService } from '@/services/websocket';

type WebSocketEventType = 
  | 'connected'
  | 'message:new'
  | 'message:seen'
  | 'notification:new'
  | 'notification:unseen_count'
  | 'admin:user_banned'
  | 'admin:video_deleted'
  | 'admin:report_resolved'
  | 'ping'
  | 'error';

/**
 * Subscribe to WebSocket event
 * Auto cleanup on unmount
 */
export function useWebSocketEvent(
  eventType: WebSocketEventType,
  callback: (event: any) => void
) {
  useEffect(() => {
    const ws = WebSocketService.getInstance();
    
    ws.on(eventType, callback);

    return () => {
      ws.off(eventType, callback);
    };
  }, [eventType, callback]);
}

/**
 * Mark messages as seen
 */
export function useMarkMessagesAsSeen() {
  const ws = WebSocketService.getInstance();

  return (conversationWith: number, messageIds: number[]) => {
    ws.markMessagesAsSeen(conversationWith, messageIds);
  };
}

/**
 * Mark notifications as seen
 */
export function useMarkNotificationsAsSeen() {
  const ws = WebSocketService.getInstance();

  return (notificationIds: number[]) => {
    ws.markNotificationsAsSeen(notificationIds);
  };
}

/**
 * Get WebSocket connection status
 */
export function useWebSocketStatus() {
  const ws = WebSocketService.getInstance();
  return ws.isConnected();
}
