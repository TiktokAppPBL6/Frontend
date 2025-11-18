import { create } from 'zustand';
import type { User } from '@/types';
import { usersApi } from '@/api/users.api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,

  login: (token: string, user: User) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  loginWithToken: async (token: string) => {
    console.log('🔑 loginWithToken: Saving token and setting authenticated');
    localStorage.setItem('accessToken', token);
    set({ token, isAuthenticated: true, isLoading: true });
    
    try {
      // Fetch user info with the new token
      console.log('👤 loginWithToken: Fetching user info...');
      const user = await usersApi.getMe();
      console.log('✅ loginWithToken: User fetched successfully');
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false });
    } catch (error) {
      console.error('❌ loginWithToken: Failed to fetch user:', error);
      // Still keep authenticated, will retry on next app load
      set({ isLoading: false });
    }
    
    console.log('✅ loginWithToken: Complete');
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const user = await usersApi.getMe();
      set({ user, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      set({ isLoading: false });
      // If token is invalid, logout
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false });
    }
  },

  updateUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));
