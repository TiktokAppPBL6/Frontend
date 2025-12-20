/**
 * WebSocket Service - Real-time Messages & Notifications
 * Kết nối đến backend WebSocket endpoint theo BACKEND_IMPLEMENTATION_GUIDE.md
 */

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

interface WebSocketEvent {
  type: WebSocketEventType;
  data?: any;
  error?: {
    code: string;
    message: string;
    timestamp: string;
  };
}

type EventCallback = (data: any) => void;

class WebSocketService {
  private static instance: WebSocketService | null = null;
  private ws: WebSocket | null = null;
  private listeners: Map<WebSocketEventType, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isManualClose = false;
  private token: string | null = null;

  /**
   * Get singleton instance
   */
  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Connect to WebSocket endpoint
   * @param token JWT token for authentication
   */
  connect(token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    this.token = token;
    this.isManualClose = false;

    // Get WebSocket URL from environment or default
    const wsUrl = (import.meta as any).env?.VITE_WS_URL || 'wss://toptop-backend-api.azurewebsites.net/api/v1/ws';
    const url = `${wsUrl}?token=${token}`;

    console.log('[WebSocket] Connecting...');
    this.ws = new WebSocket(url);

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onerror = this.handleError.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect() {
    this.isManualClose = true;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    console.log('[WebSocket] Disconnected');
  }

  /**
   * Subscribe to WebSocket events
   */
  on(eventType: WebSocketEventType, callback: EventCallback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  /**
   * Unsubscribe from WebSocket events
   */
  off(eventType: WebSocketEventType, callback: EventCallback) {
    this.listeners.get(eventType)?.delete(callback);
  }

  /**
   * Send message to server
   */
  private send(event: WebSocketEvent) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    } else {
      console.warn('[WebSocket] Cannot send, not connected');
    }
  }

  /**
   * Mark messages as seen
   */
  markMessagesAsSeen(conversationWith: number, messageIds: number[]) {
    this.send({
      type: 'message:new',
      data: {
        conversationWith,
        messageIds
      }
    });
  }

  /**
   * Mark notifications as seen
   */
  markNotificationsAsSeen(notificationIds: number[]) {
    this.send({
      type: 'notification:new',
      data: {
        notificationIds
      }
    });
  }

  // Private methods

  private handleOpen() {
    console.log('[WebSocket] Connected successfully');
    this.reconnectAttempts = 0;
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message: WebSocketEvent = JSON.parse(event.data);
      
      // Handle ping/pong
      if (message.type === 'ping') {
        this.send({ type: 'error', data: { timestamp: new Date().toISOString() } });
        return;
      }

      // Emit to listeners
      this.emit(message.type, message.data || message.error);
      
    } catch (error) {
      console.error('[WebSocket] Failed to parse message:', error);
    }
  }

  private handleError(error: Event) {
    console.error('[WebSocket] Error:', error);
    this.emit('error', { message: 'WebSocket error occurred' });
  }

  private handleClose(event: CloseEvent) {
    console.log('[WebSocket] Connection closed:', event.code, event.reason);
    this.stopHeartbeat();

    // Handle specific close codes
    if (event.code === 4001) {
      console.error('[WebSocket] Unauthorized - invalid token');
      this.emit('error', { code: 'UNAUTHORIZED', message: 'Invalid or expired token' });
      return;
    }

    if (event.code === 4003) {
      console.warn('[WebSocket] Account banned');
      this.emit('admin:user_banned', { reason: event.reason });
      return;
    }

    // Auto-reconnect if not manual close
    if (!this.isManualClose && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocket] Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        if (this.token) {
          this.connect(this.token);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private emit(eventType: WebSocketEventType, data: any) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Error in ${eventType} callback:`, error);
        }
      });
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    // Server sends ping every 30s, no need to send from client
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Export class for type checking
export { WebSocketService };

// Singleton instance
export const websocketService = new WebSocketService();

// Auto-connect khi có token trong localStorage
const token = localStorage.getItem('token');
if (token) {
  websocketService.connect(token);
}

// Auto-disconnect khi đóng tab
window.addEventListener('beforeunload', () => {
  websocketService.disconnect();
});
