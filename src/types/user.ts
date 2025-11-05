export type ID = number;

export interface User {
  id: ID;
  email: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  createdAt: string;
  updatedAt: string;
  followersCount?: number;
  followingCount?: number;
  videosCount?: number;
  isFollowing?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName?: string;
}
