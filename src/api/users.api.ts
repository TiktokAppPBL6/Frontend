import axiosClient from './axiosClient';
import type { User, SearchParams } from '@/types';
export const usersApi = {
  // Get current user
  getMe: async (): Promise<User> => {
    try {
      const response = await axiosClient.get<User>('/api/v1/users/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update current user
  updateMe: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await axiosClient.put<User>('/api/v1/users/me', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload avatar
  // OpenAPI spec: POST /api/v1/users/me/avatar returns string (avatar URL), not User object
  uploadAvatar: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file); // FastAPI expects 'file' field
      
      console.log('📤 Uploading avatar:', {
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
      });
      
      // Let axios automatically set Content-Type with boundary for FormData
      const response = await axiosClient.post<string>('/api/v1/users/me/avatar', formData);
      
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
      const response = await axiosClient.get<User>(`/api/v1/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // List users
  // OpenAPI spec: GET /api/v1/users/ returns array of User directly, not {users, total}
  listUsers: async (params?: SearchParams): Promise<User[]> => {
    try {
      // Backend uses skip/limit
      const skip = params?.page ? (params.page - 1) * (params.pageSize || 20) : 0;
      const limit = params?.pageSize || 20;
      
      const response = await axiosClient.get<User[]>('/api/v1/users/', {
        params: { skip, limit },
      });
      
      // Response is array directly
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search users
  searchUsers: async (query: string): Promise<User[]> => {
    try {
      const response = await axiosClient.get<User[]>('/api/v1/users/search', {
        params: { q: query },
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
