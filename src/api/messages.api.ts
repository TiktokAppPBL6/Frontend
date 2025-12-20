import axiosClient from './axiosClient';
import type { ID } from '@/types';

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  seen: boolean;
}

export interface MessageSendRequest {
  receiver_id: number;
  content: string;
}

export const messagesApi = {
  // Get inbox - returns list of latest messages
  getInbox: async (): Promise<Message[]> => {
    try {
      const response = await axiosClient.get<Message[]>('/api/v1/messages/inbox');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get conversation with specific user
  getConversation: async (userId: ID): Promise<Message[]> => {
    try {
      const response = await axiosClient.get<Message[]>(`/api/v1/messages/conversation/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Send message
  sendMessage: async (data: MessageSendRequest): Promise<Message> => {
    try {
      const response = await axiosClient.post<Message>('/api/v1/messages/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete message
  deleteMessage: async (messageId: ID): Promise<string> => {
    try {
      const response = await axiosClient.delete<string>(`/api/v1/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get suggested users to message
  getSuggestedUsers: async (): Promise<any[]> => {
    try {
      const response = await axiosClient.get<any[]>('/api/v1/messages/suggested-users');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
