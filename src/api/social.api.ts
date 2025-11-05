import axiosClient, { shouldUseMock } from './axiosClient';
import type { ID, User } from '@/types';
import { mockDelay, mockVideos } from '@/mocks/mockDB';

export const socialApi = {
  // Like video
  likeVideo: async (videoId: ID): Promise<void> => {
    try {
      await axiosClient.post(`/social/likes/${videoId}`);
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay(300);
        return;
      }
      throw error;
    }
  },

  // Unlike video
  unlikeVideo: async (videoId: ID): Promise<void> => {
    try {
      await axiosClient.delete(`/social/likes/${videoId}`);
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay(300);
        return;
      }
      throw error;
    }
  },

  // Get video likes
  getVideoLikes: async (videoId: ID): Promise<{ likes: User[]; total: number }> => {
    try {
      const response = await axiosClient.get<{ likes: User[]; total: number }>(
        `/social/likes/video/${videoId}`
      );
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return { likes: [], total: 0 };
      }
      throw error;
    }
  },

  // Follow user
  followUser: async (userId: ID): Promise<void> => {
    try {
      await axiosClient.post(`/social/follow/${userId}`);
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay(300);
        return;
      }
      throw error;
    }
  },

  // Unfollow user
  unfollowUser: async (userId: ID): Promise<void> => {
    try {
      await axiosClient.delete(`/social/unfollow/${userId}`);
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay(300);
        return;
      }
      throw error;
    }
  },

  // Get followers
  getFollowers: async (userId: ID): Promise<{ followers: User[]; total: number }> => {
    try {
      const response = await axiosClient.get<{ followers: User[]; total: number }>(
        `/social/followers/${userId}`
      );
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return { followers: [], total: 0 };
      }
      throw error;
    }
  },

  // Get following
  getFollowing: async (userId: ID): Promise<{ following: User[]; total: number }> => {
    try {
      const response = await axiosClient.get<{ following: User[]; total: number }>(
        `/social/following/${userId}`
      );
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return { following: [], total: 0 };
      }
      throw error;
    }
  },

  // Bookmark video
  bookmarkVideo: async (videoId: ID): Promise<void> => {
    try {
      await axiosClient.post(`/social/bookmarks/${videoId}`);
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay(300);
        return;
      }
      throw error;
    }
  },

  // Unbookmark video
  unbookmarkVideo: async (videoId: ID): Promise<void> => {
    try {
      await axiosClient.delete(`/social/bookmarks/${videoId}`);
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay(300);
        return;
      }
      throw error;
    }
  },

  // Get my bookmarks
  getMyBookmarks: async (): Promise<{ videos: any[]; total: number }> => {
    try {
      const response = await axiosClient.get<{ videos: any[]; total: number }>(
        '/social/bookmarks/my'
      );
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return {
          videos: mockVideos.filter((v) => v.isBookmarked),
          total: mockVideos.filter((v) => v.isBookmarked).length,
        };
      }
      throw error;
    }
  },
};
