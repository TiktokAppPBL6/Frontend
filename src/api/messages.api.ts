import axiosClient, { shouldUseMock } from './axiosClient';
import type {
  Message,
  MessageSendRequest,
  MessagesResponse,
  InboxResponse,
  ID,
} from '@/types';
import { mockMessages, mockConversations, mockDelay } from '@/mocks/mockDB';

export const messagesApi = {
  // Get inbox (conversations list)
  getInbox: async (): Promise<InboxResponse> => {
    try {
      const response = await axiosClient.get<InboxResponse>('/messages/inbox');
      
      // If API returns empty, use mock data
      if (!response.data.conversations || response.data.conversations.length === 0) {
        console.log('📦 API returned no conversations, using mock data');
        await mockDelay();
        return { conversations: mockConversations };
      }
      
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return { conversations: mockConversations };
      }
      throw error;
    }
  },

  // Get conversation with a user
  getConversation: async (userId: ID): Promise<MessagesResponse> => {
    try {
      const response = await axiosClient.get<MessagesResponse>(`/messages/conversation/${userId}`);
      
      // If API returns empty, use mock data
      if (!response.data.messages || response.data.messages.length === 0) {
        console.log('📦 API returned no messages, using mock data');
        await mockDelay();
        const messages = mockMessages.filter(
          (m) => m.senderId === userId || m.receiverId === userId
        );
        return {
          messages,
          total: messages.length,
        };
      }
      
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        const messages = mockMessages.filter(
          (m) => m.senderId === userId || m.receiverId === userId
        );
        return {
          messages,
          total: messages.length,
        };
      }
      throw error;
    }
  },

  // Send message
  sendMessage: async (data: MessageSendRequest): Promise<Message> => {
    try {
      const response = await axiosClient.post<Message>('/messages/', data);
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        const newMessage: Message = {
          id: Date.now(),
          senderId: 1,
          receiverId: data.receiverId,
          content: data.content,
          createdAt: new Date().toISOString(),
          seen: false,
        };
        return newMessage;
      }
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (messageId: ID): Promise<void> => {
    try {
      await axiosClient.delete(`/messages/${messageId}`);
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return;
      }
      throw error;
    }
  },
};
