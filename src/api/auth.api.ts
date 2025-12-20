import axiosClient from './axiosClient';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types';

export const authApi = {
  // Login
  login: async (data: LoginRequest & { _skipRedirect?: boolean }): Promise<AuthResponse> => {
    try {
      // Convert to form-data for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', data.email); // OAuth2 uses 'username' field
      formData.append('password', data.password);
      
      const response = await axiosClient.post<any>('/api/v1/auth/login', formData, {
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
  register: async (data: RegisterRequest): Promise<any> => {
    try {
      // OpenAPI spec: POST /api/v1/auth/register returns User object (201), not {access_token, user}
      const response = await axiosClient.post<any>('/api/v1/auth/register', data);
      
      // Response is the User object directly
      const user = response.data;
      
      console.log('Register response (User object):', user);
      
      // Return user object as is (registration does NOT auto-login)
      return { user };
    } catch (error) {
      throw error;
    }
  },

  // Logout (usually client-side only)
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
  
  // Test token manually
  testToken: async (): Promise<{ valid: boolean; user?: any }> => {
    try {
      const response = await axiosClient.get<{ valid?: boolean; success?: boolean; user?: any }>(
        '/api/v1/auth/test-token'
      );
      return {
        valid: response.data?.valid ?? response.data?.success ?? true,
        user: response.data?.user,
      };
    } catch (error) {
      return { valid: false };
    }
  },
  
  // Google login - redirect to Google OAuth
  googleLogin: () => {
    window.location.href = `${axiosClient.defaults.baseURL}/api/v1/auth/google/login`;
  },
  
  // Google callback - handle redirect from Google (usually handled by backend)
  googleCallback: async (code: string, state?: string): Promise<AuthResponse> => {
    try {
      const response = await axiosClient.get<any>('/api/v1/auth/google/callback', {
        params: { code, state },
      });
      
      const responseData = response.data;
      const accessToken = responseData.access_token || responseData.accessToken;
      const user = responseData.user;
      
      return {
        accessToken,
        user,
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Verify password (POST /api/v1/auth/verify-password)
  // OpenAPI spec: Request body = {email: string, password: string}
  // Response: {valid: bool, message: string}
  verifyPassword: async (email: string, password: string): Promise<{ valid: boolean; message?: string }> => {
    try {
      const response = await axiosClient.post<{ valid: boolean; message: string }>(
        '/api/v1/auth/verify-password',
        { email, password },
        {
          headers: { 'X-Skip-Auth-Redirect': '1' },
        }
      );
      return {
        valid: response.data?.valid ?? false,
        message: response.data?.message,
      };
    } catch (error: any) {
      // 401: Incorrect password, 403: Blocked, 404: Email not found
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 404) {
        return { 
          valid: false,
          message: error?.response?.data?.message || 'Password verification failed'
        };
      }
      throw error;
    }
  },
  
  // Change password
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    try {
      await axiosClient.post('/api/v1/auth/change-password', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      });
    } catch (error) {
      throw error;
    }
  },

  // Google Login with credential
  googleLoginWithCredential: async (credential: string): Promise<AuthResponse> => {
    try {
      const response = await axiosClient.post<any>('/api/v1/auth/google/login', {
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
  googleCallbackHandler: async (code: string): Promise<AuthResponse> => {
    try {
      // Call backend callback endpoint directly with code
      const response = await axiosClient.get<any>(`/api/v1/auth/google/callback`, {
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
