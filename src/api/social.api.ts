import axiosClient from './axiosClient';
import type { ID, User } from '@/types';
export const socialApi = {
  // Like video
  likeVideo: async (videoId: ID): Promise<void> => {
    try {
      await axiosClient.post(`/api/v1/social/likes/${videoId}`);
    } catch (error) {
      throw error;
    }
  },

  // Unlike video
  unlikeVideo: async (videoId: ID): Promise<void> => {
    try {
      await axiosClient.delete(`/api/v1/social/likes/${videoId}`);
    } catch (error) {
      throw error;
    }
  },

  // Get video likes
  getVideoLikes: async (videoId: ID): Promise<{ likes: User[]; total: number }> => {
    try {
      const response = await axiosClient.get<{ likes: User[]; total: number }>(
        `/api/v1/social/likes/video/${videoId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Follow user
  followUser: async (userId: ID): Promise<void> => {
    try {
      await axiosClient.post(`/api/v1/social/follow/${userId}`);
    } catch (error) {
      throw error;
    }
  },

  // Unfollow user
  unfollowUser: async (userId: ID): Promise<void> => {
    try {
      await axiosClient.delete(`/api/v1/social/unfollow/${userId}`);
    } catch (error) {
      throw error;
    }
  },

  // Get followers
  getFollowers: async (userId: ID): Promise<{ followers: User[]; total: number }> => {
    try {
      const response = await axiosClient.get(`/api/v1/social/followers/${userId}`);
      const data = response.data;
      
      // Normalize various possible shapes
      const followers = Array.isArray(data)
        ? data
        : data?.followers ?? data?.items ?? data?.data ?? [];
      const total = data?.total ?? data?.total_count ?? data?.count ?? followers.length ?? 0;
      
      return { followers, total };
    } catch (error) {
      throw error;
    }
  },

  // Get following
  getFollowing: async (userId: ID): Promise<{ following: User[]; total: number }> => {
    try {
      const response = await axiosClient.get(`/api/v1/social/following/${userId}`);
      const data = response.data;
      
      // Normalize various possible shapes
      const following = Array.isArray(data)
        ? data
        : data?.following ?? data?.items ?? data?.data ?? [];
      const total = data?.total ?? data?.total_count ?? data?.count ?? following.length ?? 0;
      
      return { following, total };
    } catch (error) {
      throw error;
    }
  },

  // Bookmark video
  bookmarkVideo: async (videoId: ID): Promise<void> => {
    try {
      await axiosClient.post(`/api/v1/social/bookmarks/${videoId}`);
    } catch (error) {
      throw error;
    }
  },

  // Unbookmark video
  unbookmarkVideo: async (videoId: ID): Promise<void> => {
    try {
      await axiosClient.delete(`/api/v1/social/bookmarks/${videoId}`);
    } catch (error) {
      throw error;
    }
  },

  // Get my bookmarks
  getMyBookmarks: async (): Promise<{ videos: any[]; total: number }> => {
    try {
      const response = await axiosClient.get<{ videos: any[]; total: number }>(
        '/api/v1/social/bookmarks/my'
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
