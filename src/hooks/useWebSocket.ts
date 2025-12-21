/**
 * Custom hook for WebSocket Integration
 * Modern implementation with real-time notifications
 */

import { useEffect } from 'react';
import { websocketService, WebSocketMessageType, WebSocketEventHandler } from '@/services/websocket';

/**
 * Subscribe to WebSocket event
 * Auto cleanup on unmount
 */
export function useWebSocketEvent(
  eventType: WebSocketMessageType,
  callback: WebSocketEventHandler
) {
  useEffect(() => {
    websocketService.on(eventType, callback);

    return () => {
      websocketService.off(eventType, callback);
    };
  }, [eventType, callback]);
}

/**
 * Get WebSocket connection status
 */
export function useWebSocketStatus() {
  return websocketService.getConnectionState();
}
