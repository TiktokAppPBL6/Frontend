import axiosClient from './axiosClient';
import type {
  Message,
  MessageSendRequest,
  MessagesResponse,
  InboxResponse,
  ID,
} from '@/types';
export const messagesApi = {
  // Get inbox (conversations list)
  getInbox: async (): Promise<InboxResponse> => {
    try {
      const response = await axiosClient.get<InboxResponse>('/messages/inbox');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get conversation with a user
  getConversation: async (userId: ID): Promise<MessagesResponse> => {
    try {
      const response = await axiosClient.get<MessagesResponse>(`/messages/conversation/${userId}`);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send message
  sendMessage: async (data: MessageSendRequest): Promise<Message> => {
    try {
      const response = await axiosClient.post<Message>('/messages/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (messageId: ID): Promise<void> => {
    try {
      await axiosClient.delete(`/messages/${messageId}`);
    } catch (error) {
      throw error;
    }
  },

  // Get suggested users (users who haven't been messaged yet)
  getSuggestedUsers: async (limit: number = 10): Promise<any[]> => {
    try {
      const response = await axiosClient.get(`/messages/suggested-users`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
