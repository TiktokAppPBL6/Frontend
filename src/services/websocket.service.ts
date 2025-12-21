/**
 * Modern WebSocket Service for TikTok-style Real-time Features
 * 
 * Features:
 * - Automatic reconnection with exponential backoff
 * - Heartbeat/ping-pong to keep connection alive
 * - Type-safe message handling
 * - Event subscription system
 * - Connection state management
 * - Error recovery
 */
import { WS_BASE_URL } from '@/config/api';

// ============================================================================
// TypeScript Types
// ============================================================================

export type WebSocketMessageType = 
  | 'connection' 
  | 'notification' 
  | 'message' 
  | 'message_read' 
  | 'typing' 
  | 'ping' 
  | 'pong' 
  | 'online_status' 
  | 'error';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  status?: string;
  user_id?: number;
  data?: any;
  sender_id?: number;
  sender_username?: string;
  receiver_id?: number;
  conversation_id?: number;
  read_by_user_id?: number;
  is_typing?: boolean;
  timestamp: string;
  message?: string;
}

export type WebSocketEventHandler = (message: WebSocketMessage) => void;

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// ============================================================================
// WebSocket Service Class
// ============================================================================

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000; // 1 second
  private maxReconnectDelay = 30000; // 30 seconds
  private pingInterval: NodeJS.Timeout | null = null;
  private pingIntervalMs = 30000; // 30 seconds
  private listeners: Map<WebSocketMessageType, Set<WebSocketEventHandler>> = new Map();
  private stateListeners: Set<(state: ConnectionState) => void> = new Set();
  private token: string | null = null;
  private isManualClose = false;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize listener sets for each message type
    const messageTypes: WebSocketMessageType[] = [
      'connection',
      'notification',
      'message',
      'message_read',
      'typing',
      'pong',
      'online_status',
      'error'
    ];
    
    messageTypes.forEach(type => {
      this.listeners.set(type, new Set());
    });

    // Log initialization
    console.log('🔌 WebSocket Service initialized');
  }

  // ==========================================================================
  // Connection Management
  // ==========================================================================

  /**
   * Connect to WebSocket server
   */
  connect(token: string): void {
    // Prevent duplicate connections
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      console.log('⚠️  WebSocket already connected or connecting');
      return;
    }

    this.isManualClose = false;
    this.token = token;
    this.setConnectionState(ConnectionState.CONNECTING);

    try {
      const wsUrl = `${WS_BASE_URL}/api/v1/ws/${token}`;
      console.log('🔌 Connecting to WebSocket:', wsUrl.replace(token, '***'));
      
      this.ws = new WebSocket(wsUrl);

      // Connection opened
      this.ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        this.setConnectionState(ConnectionState.CONNECTED);
        this.reconnectAttempts = 0;
        this.startPingInterval();
      };

      // Message received
      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message:', message.type, message);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      // Connection error
      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.setConnectionState(ConnectionState.ERROR);
      };

      // Connection closed
      this.ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed: code=${event.code}, reason=${event.reason || 'none'}`);
        this.stopPingInterval();
        this.setConnectionState(ConnectionState.DISCONNECTED);

        // Attempt to reconnect unless manually closed
        if (!this.isManualClose) {
          this.attemptReconnect();
        }
      };

    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      this.setConnectionState(ConnectionState.ERROR);
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('🔌 Manually disconnecting WebSocket');
    this.isManualClose = true;
    this.stopPingInterval();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.setConnectionState(ConnectionState.DISCONNECTED);
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.isManualClose || !this.token) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`❌ Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
      this.setConnectionState(ConnectionState.ERROR);
      return;
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    this.reconnectAttempts++;
    this.setConnectionState(ConnectionState.RECONNECTING);

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      if (this.token && !this.isManualClose) {
        this.connect(this.token);
      }
    }, delay);
  }

  // ==========================================================================
  // Heartbeat / Ping-Pong
  // ==========================================================================

  /**
   * Start sending periodic pings to keep connection alive
   */
  private startPingInterval(): void {
    this.stopPingInterval();

    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: 'ping',
          timestamp: new Date().toISOString()
        });
        console.log('💓 Sent ping');
      }
    }, this.pingIntervalMs);
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // ==========================================================================
  // Message Handling
  // ==========================================================================

  /**
   * Handle incoming WebSocket message
   */
  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.listeners.get(message.type);
    
    if (listeners && listeners.size > 0) {
      listeners.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error in ${message.type} handler:`, error);
        }
      });
    }
  }

  /**
   * Send a message to the WebSocket server
   */
  send(message: Partial<WebSocketMessage>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️  Cannot send message: WebSocket not connected');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('❌ Error sending WebSocket message:', error);
    }
  }

  // ==========================================================================
  // Event Subscription
  // ==========================================================================

  /**
   * Subscribe to a specific message type
   */
  on(type: WebSocketMessageType, handler: WebSocketEventHandler): () => void {
    const listeners = this.listeners.get(type);
    
    if (listeners) {
      listeners.add(handler);
      console.log(`📝 Subscribed to '${type}' events (${listeners.size} listeners)`);
    }

    // Return unsubscribe function
    return () => this.off(type, handler);
  }

  /**
   * Unsubscribe from a specific message type
   */
  off(type: WebSocketMessageType, handler: WebSocketEventHandler): void {
    const listeners = this.listeners.get(type);
    
    if (listeners) {
      listeners.delete(handler);
      console.log(`📝 Unsubscribed from '${type}' events (${listeners.size} listeners remaining)`);
    }
  }

  /**
   * Subscribe to connection state changes
   */
  onStateChange(handler: (state: ConnectionState) => void): () => void {
    this.stateListeners.add(handler);
    
    // Return unsubscribe function
    return () => this.stateListeners.delete(handler);
  }

  // ==========================================================================
  // State Management
  // ==========================================================================

  /**
   * Set connection state and notify listeners
   */
  private setConnectionState(state: ConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      console.log(`🔄 Connection state changed: ${state}`);
      
      this.stateListeners.forEach(listener => {
        try {
          listener(state);
        } catch (error) {
          console.error('Error in state listener:', error);
        }
      });
    }
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // ==========================================================================
  // Convenience Methods
  // ==========================================================================

  /**
   * Send typing indicator
   */
  sendTypingIndicator(receiverId: number, isTyping: boolean, conversationId?: number): void {
    this.send({
      type: 'typing',
      receiver_id: receiverId,
      conversation_id: conversationId,
      is_typing: isTyping,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Check online status for multiple users
   */
  checkOnlineStatus(userIds: number[]): void {
    this.send({
      type: 'check_online' as any,
      data: { user_ids: userIds },
      timestamp: new Date().toISOString()
    });
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

export const websocketService = new WebSocketService();
export const wsService = websocketService; // Alias for compatibility
export default websocketService;

// Note: WebSocket connection is managed by App.tsx via Zustand stores
// Auto-connect removed to prevent duplicate connections
