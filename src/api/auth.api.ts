import axiosClient, { shouldUseMock } from './axiosClient';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';
import { mockUsers, mockDelay } from '@/mocks/mockDB';

export const authApi = {
  // Login
  login: async (data: LoginRequest & { _skipRedirect?: boolean }): Promise<AuthResponse> => {
    try {
      // Convert to form-data for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', data.email); // OAuth2 uses 'username' field
      formData.append('password', data.password);
      
      const response = await axiosClient.post<any>('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(data._skipRedirect ? { 'X-Skip-Auth-Redirect': '1' } : {}),
        },
        // Also attach flag on config root (non-standard) for interceptor convenience
        ...(data._skipRedirect ? { skipAuthRedirect: true } : {}),
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
  
  // Verify current password without changing session
  verifyPassword: async (password: string): Promise<{ valid: boolean }> => {
    try {
      const response = await axiosClient.post<{ valid?: boolean; success?: boolean }>(
        '/auth/verify-password',
        { password },
        {
          headers: { 'X-Skip-Auth-Redirect': '1' },
        }
      );
      const valid = response.data?.valid ?? response.data?.success ?? true;
      return { valid };
    } catch (error: any) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return { valid: true };
      }
      const status = error?.response?.status;
      if (status === 401) {
        return { valid: false };
      }
      throw error;
    }
  },
  
  // Change password
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    try {
      await axiosClient.post('/auth/change-password', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return;
      }
      throw error;
    }
  },
};
