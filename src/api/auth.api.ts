import axiosClient from './axiosClient';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';

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
      throw error;
    }
  },

  // Register
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosClient.post<any>('/auth/register', data);
      
      // Normalize response - handle both snake_case and camelCase
      const responseData = response.data;
      const accessToken = responseData.access_token || responseData.accessToken;
      const user = responseData.user;
      
      console.log('Register response:', { accessToken, user });
      
      return {
        accessToken,
        user,
      };
    } catch (error) {
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
      throw error;
    }
  },

  // Google Login
  googleLogin: async (credential: string): Promise<AuthResponse> => {
    try {
      const response = await axiosClient.post<any>('/auth/google/login', {
        credential,
      });
      
      // Normalize response - handle both snake_case and camelCase
      const responseData = response.data;
      const accessToken = responseData.access_token || responseData.accessToken;
      const user = responseData.user;
      
      console.log('Google login response:', { accessToken, user });
      
      return {
        accessToken,
        user,
      };
    } catch (error) {
      throw error;
    }
  },

  // Exchange Google authorization code for token
  googleCallback: async (code: string): Promise<AuthResponse> => {
    try {
      // Call backend callback endpoint directly with code
      const response = await axiosClient.get<any>(`/auth/google/callback`, {
        params: { code }
      });
      
      // Normalize response
      const responseData = response.data;
      const accessToken = responseData.access_token || responseData.accessToken;
      const user = responseData.user;
      
      console.log('Google callback response:', { accessToken, user });
      
      return {
        accessToken,
        user,
      };
    } catch (error) {
      throw error;
    }
  },
};
