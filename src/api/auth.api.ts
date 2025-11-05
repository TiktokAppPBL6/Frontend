import axiosClient, { shouldUseMock } from './axiosClient';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';
import { mockUsers, mockDelay } from '@/mocks/mockDB';

export const authApi = {
  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      // Convert to form-data for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', data.email); // OAuth2 uses 'username' field
      formData.append('password', data.password);
      
      const response = await axiosClient.post<any>('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Normalize response - handle both snake_case and camelCase
      const responseData = response.data;
      const accessToken = responseData.access_token || responseData.accessToken;
      const user = responseData.user;
      
      console.log('Login response:', { accessToken, user });
      
      return {
        accessToken,
        user,
      };
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        // Mock login - accept any credentials
        const user = mockUsers[0];
        return {
          accessToken: 'mock-token-' + Date.now(),
          user,
        };
      }
      throw error;
    }
  },

  // Register
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        // Mock register
        const newUser: User = {
          id: Date.now(),
          email: data.email,
          username: data.username,
          fullName: data.fullName,
          avatarUrl: 'https://i.pravatar.cc/150?img=' + Math.floor(Math.random() * 70),
          role: 'user',
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          followersCount: 0,
          followingCount: 0,
          videosCount: 0,
        };
        return {
          accessToken: 'mock-token-' + Date.now(),
          user: newUser,
        };
      }
      throw error;
    }
  },

  // Logout (usually client-side only)
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
};
