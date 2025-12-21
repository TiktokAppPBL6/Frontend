import { create } from 'zustand';
import { createElement } from 'react';
import wsService, { WebSocketMessage } from '@/services/websocket.service';
import toast from 'react-hot-toast';
import { useAuthStore } from './auth';
import { MessageToast } from '@/components/messages/MessageToast';

export type Message = {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  mediaUrl?: string;
  status: 'delivered' | 'read' | 'deleted';
  createdAt: string;
  sender?: {
    id: number;
    username: string;
    avatarUrl?: string;
    fullName?: string;
  };
  receiver?: {
    id: number;
    username: string;
    avatarUrl?: string;
    fullName?: string;
  };
};

export type Conversation = {
  userId: number;
  username: string;
  avatarUrl?: string;
  fullName?: string;
  lastMessage?: Message;
  unreadCount: number;
  isTyping?: boolean;
};

interface MessageState {
  messages: Record<number, Message[]>; // Key: userId (the other person in conversation)
  conversations: Conversation[];
  activeConversation: number | null;
  typingUsers: Set<number>;
  isConnected: boolean;
  addMessage: (message: Message) => void;
  setMessages: (userId: number, messages: Message[]) => void;
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (userId: number | null) => void;
  markConversationAsRead: (userId: number) => void;
  setTypingStatus: (userId: number, isTyping: boolean) => void;
  connectWebSocket: (token: string) => void;
  disconnectWebSocket: () => void;
  getUnreadCount: () => number;
}

export const useMessageStore = create<MessageState>((set, get) => {
  // Setup WebSocket listeners
  const handleMessageEvent = (message: WebSocketMessage) => {
    if (message.type === 'message' && message.data) {
      const wsData = message.data;
      console.log('📨 Received WebSocket message:', wsData);
      
      // Convert WebSocket data to Message format
      const newMessage: Message = {
        id: wsData.id || Date.now(),
        senderId: wsData.sender_id || wsData.senderId,
        receiverId: wsData.receiver_id || wsData.receiverId,
        content: wsData.content,
        status: 'delivered', // New messages are delivered by default
        createdAt: wsData.created_at || wsData.createdAt || new Date().toISOString(),
        sender: wsData.sender,
        receiver: wsData.receiver,
      };
      
      console.log('💾 Adding message to store:', newMessage);
      get().addMessage(newMessage);
      
      // Show notification toast if not on messages page
      const isOnMessagesPage = window.location.pathname.startsWith('/messages');
      const isFromOtherUser = newMessage.senderId !== get().activeConversation;
      
      if (!isOnMessagesPage && isFromOtherUser) {
        const senderName = newMessage.sender?.fullName || newMessage.sender?.username || 'Người dùng';
        const senderAvatar = newMessage.sender?.avatarUrl;
        const messagePreview = newMessage.content.length > 50 
          ? newMessage.content.substring(0, 50) + '...' 
          : newMessage.content;
        
        toast.custom(
          (t) => createElement(MessageToast, {
            t,
            senderName,
            message: messagePreview,
            avatar: senderAvatar,
            onDismiss: () => toast.dismiss(t.id),
          }),
          {
            duration: 4000,
            position: 'top-right',
          }
        );
      }
    } else if (message.type === 'message_read') {
      // Handle message read status
      const { conversation_id, read_by_user_id } = message;
      if (conversation_id && read_by_user_id) {
        get().markConversationAsRead(read_by_user_id);
      }
    } else if (message.type === 'typing') {
      // Handle typing indicator
      const { sender_id, is_typing } = message;
      if (sender_id !== undefined) {
        get().setTypingStatus(sender_id, is_typing || false);
      }
    } else if (message.type === 'connection') {
      set({ isConnected: message.status === 'connected' });
    }
  };

  return {
    messages: {},
    conversations: [],
    activeConversation: null,
    typingUsers: new Set(),
    isConnected: false,

    addMessage: (message: Message) => {
      set((state) => {
        // Get current logged-in user ID from auth store
        const currentUserId = useAuthStore.getState().user?.id;
        
        // Determine which user this conversation is with
        // The "other user" is whoever is NOT the current logged-in user
        const otherUserId = message.senderId !== currentUserId 
          ? message.senderId 
          : message.receiverId;
        
        console.log('🔍 Current user:', currentUserId, '| Other user:', otherUserId, '| Sender:', message.senderId, '| Receiver:', message.receiverId);
        
        const existingMessages = state.messages[otherUserId] || [];
        
        // Check if message already exists (to avoid duplicates)
        if (existingMessages.some(m => m.id === message.id)) {
          console.log('⚠️ Duplicate message detected, skipping:', message.id);
          return state;
        }

        // Add message at END (newest at bottom) for proper chat display
        const updatedMessages = {
          ...state.messages,
          [otherUserId]: [...existingMessages, message],
        };
        
        console.log('✅ Message added! Total messages for user', otherUserId, ':', updatedMessages[otherUserId].length);

        // Update conversations list
        const conversationIndex = state.conversations.findIndex(
          c => c.userId === otherUserId
        );
        
        let updatedConversations = [...state.conversations];
        if (conversationIndex >= 0) {
          const conversation = updatedConversations[conversationIndex];
          updatedConversations[conversationIndex] = {
            ...conversation,
            lastMessage: message,
            unreadCount: message.senderId === otherUserId 
              ? conversation.unreadCount + 1 
              : conversation.unreadCount,
          };
          // Move to top
          const [updated] = updatedConversations.splice(conversationIndex, 1);
          updatedConversations.unshift(updated);
        } else {
          // Create new conversation
          const otherUser = message.sender?.id === otherUserId ? message.sender : message.receiver;
          if (otherUser) {
            updatedConversations.unshift({
              userId: otherUserId,
              username: otherUser.username,
              avatarUrl: otherUser.avatarUrl,
              fullName: otherUser.fullName,
              lastMessage: message,
              unreadCount: message.senderId === otherUserId ? 1 : 0,
            });
          }
        }

        return {
          messages: updatedMessages,
          conversations: updatedConversations,
        };
      });
    },

    setMessages: (userId: number, messages: Message[]) => {
      set((state) => ({
        messages: {
          ...state.messages,
          [userId]: messages,
        },
      }));
    },

    setConversations: (conversations: Conversation[]) => {
      set({ conversations });
    },

    setActiveConversation: (userId: number | null) => {
      set({ activeConversation: userId });
      
      // Mark conversation as read when activated
      if (userId !== null) {
        get().markConversationAsRead(userId);
      }
    },

    markConversationAsRead: (userId: number) => {
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.userId === userId ? { ...conv, unreadCount: 0 } : conv
        ),
      }));
    },

    setTypingStatus: (userId: number, isTyping: boolean) => {
      set((state) => {
        const newTypingUsers = new Set(state.typingUsers);
        if (isTyping) {
          newTypingUsers.add(userId);
        } else {
          newTypingUsers.delete(userId);
        }

        // Update conversation typing status
        const updatedConversations = state.conversations.map((conv) =>
          conv.userId === userId ? { ...conv, isTyping } : conv
        );

        return {
          typingUsers: newTypingUsers,
          conversations: updatedConversations,
        };
      });

      // Auto-clear typing indicator after 3 seconds
      if (isTyping) {
        setTimeout(() => {
          const currentTypingUsers = get().typingUsers;
          if (currentTypingUsers.has(userId)) {
            get().setTypingStatus(userId, false);
          }
        }, 3000);
      }
    },

    connectWebSocket: (token: string) => {
      // Remove existing listeners
      wsService.off('message', handleMessageEvent);
      wsService.off('message_read', handleMessageEvent);
      wsService.off('typing', handleMessageEvent);
      wsService.off('connection', handleMessageEvent);
      
      // Add new listeners
      wsService.on('message', handleMessageEvent);
      wsService.on('message_read', handleMessageEvent);
      wsService.on('typing', handleMessageEvent);
      wsService.on('connection', handleMessageEvent);
      
      // Connect WebSocket
      wsService.connect(token);
    },

    disconnectWebSocket: () => {
      wsService.off('message', handleMessageEvent);
      wsService.off('message_read', handleMessageEvent);
      wsService.off('typing', handleMessageEvent);
      wsService.off('connection', handleMessageEvent);
      wsService.disconnect();
      set({ isConnected: false });
    },

    getUnreadCount: () => {
      const state = get();
      return state.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
    },
  };
});
