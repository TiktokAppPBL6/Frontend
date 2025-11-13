import axiosClient from './axiosClient';
import type { User, SearchParams } from '@/types';
export const usersApi = {
  // Get current user
  getMe: async (): Promise<User> => {
    try {
      const response = await axiosClient.get<User>('/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update current user
  updateMe: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await axiosClient.put<User>('/users/me', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<User> => {
    try {
      const formData = new FormData();
      formData.append('file', file); // FastAPI usually expects 'file' field
      
      console.log('📤 Uploading avatar:', {
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        formData: formData,
        formDataEntries: Array.from(formData.entries()),
      });
      
      // Verify the file is actually in FormData
      const fileInFormData = formData.get('file');
      console.log('✅ File in FormData:', fileInFormData);
      
      // Let axios automatically set Content-Type with boundary for FormData
      const response = await axiosClient.post<User>('/users/me/avatar', formData);
      
      console.log('✅ Avatar uploaded successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Avatar upload failed:', error.response?.data || error.message);
      
      throw error;
    }
  },

  // Get user by ID
  getUser: async (userId: number): Promise<User> => {
    try {
      const response = await axiosClient.get<User>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // List users
  listUsers: async (params?: SearchParams): Promise<{ users: User[]; total: number }> => {
    try {
      const response = await axiosClient.get<{ users: User[]; total: number }>('/users/', {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search users
  searchUsers: async (query: string): Promise<User[]> => {
    try {
      const response = await axiosClient.get<User[]>('/users/search', {
        params: { q: query },
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
