import axiosClient, { shouldUseMock } from './axiosClient';
import type {
  Video,
  VideoUploadRequest,
  VideoUpdateRequest,
  VideosResponse,
  PaginationParams,
  SearchParams,
} from '@/types';
import {
  mockVideos,
  mockDelay,
  getMockVideo,
  getMockVideosByUser,
  searchMockVideos,
} from '@/mocks/mockDB';

export const videosApi = {
  // Get video feed
  getVideos: async (params?: PaginationParams): Promise<VideosResponse> => {
    try {
      const response = await axiosClient.get<VideosResponse>('/videos/', { params });
      
      // If API returns empty, use mock data
      if (!response.data.videos || response.data.videos.length === 0) {
        console.log('📦 API returned empty, using mock videos');
        await mockDelay();
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 10;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const videos = mockVideos.slice(start, end);
        return {
          videos,
          total: mockVideos.length,
          page,
          pageSize,
          hasMore: end < mockVideos.length,
        };
      }
      
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 10;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const videos = mockVideos.slice(start, end);
        return {
          videos,
          total: mockVideos.length,
          page,
          pageSize,
          hasMore: end < mockVideos.length,
        };
      }
      throw error;
    }
  },

  // Get video by ID
  getVideo: async (videoId: number): Promise<Video> => {
    try {
      const response = await axiosClient.get<Video>(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        const video = getMockVideo(videoId);
        if (!video) throw new Error('Video not found');
        return video;
      }
      throw error;
    }
  },

  // Get videos by user
  getUserVideos: async (userId: number, params?: PaginationParams): Promise<VideosResponse> => {
    try {
      const response = await axiosClient.get<any>(`/videos/user/${userId}`, {
        params,
      });
      
      console.log('📹 User videos response:', response.data);
      
      // Check if response is an array (some backends return array directly)
      let videos = Array.isArray(response.data) ? response.data : response.data.videos;
      
      // If API returns empty, use mock data
      if (!videos || videos.length === 0) {
        console.log('📦 API returned empty user videos, using mock data');
        await mockDelay();
        const mockVideos = getMockVideosByUser(userId);
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 10;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
          videos: mockVideos.slice(start, end),
          total: mockVideos.length,
          page,
          pageSize,
          hasMore: end < mockVideos.length,
        };
      }
      
      // Normalize response
      if (Array.isArray(response.data)) {
        return {
          videos: response.data,
          total: response.data.length,
          page: params?.page || 1,
          pageSize: params?.pageSize || response.data.length,
          hasMore: false,
        };
      }
      
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        const videos = getMockVideosByUser(userId);
        const page = params?.page || 1;
        const pageSize = params?.pageSize || 10;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
          videos: videos.slice(start, end),
          total: videos.length,
          page,
          pageSize,
          hasMore: end < videos.length,
        };
      }
      throw error;
    }
  },

  // Search videos
  searchVideos: async (params: SearchParams): Promise<Video[]> => {
    try {
      const response = await axiosClient.get<Video[]>('/videos/search', { params });
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return searchMockVideos(params.query);
      }
      throw error;
    }
  },

  // Upload video
  uploadVideo: async (data: VideoUploadRequest): Promise<Video> => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.file) formData.append('file', data.file);
      if (data.url) formData.append('url', data.url);
      if (data.visibility) formData.append('visibility', data.visibility);

      const response = await axiosClient.post<Video>('/videos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        const newVideo: Video = {
          id: Date.now(),
          ownerId: 1,
          title: data.title,
          description: data.description,
          visibility: data.visibility || 'public',
          url: data.file ? URL.createObjectURL(data.file) : data.url || '',
          hlsUrl: data.file ? URL.createObjectURL(data.file) : data.url,
          thumbUrl: 'https://picsum.photos/400/600?random=' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          owner: mockVideos[0].owner,
          likeCount: 0,
          commentCount: 0,
          viewCount: 0,
          shareCount: 0,
          isLiked: false,
          isBookmarked: false,
        };
        return newVideo;
      }
      throw error;
    }
  },

  // Update video
  updateVideo: async (videoId: number, data: VideoUpdateRequest): Promise<Video> => {
    try {
      const response = await axiosClient.put<Video>(`/videos/${videoId}`, data);
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        const video = getMockVideo(videoId);
        if (!video) throw new Error('Video not found');
        return { ...video, ...data };
      }
      throw error;
    }
  },

  // Delete video
  deleteVideo: async (videoId: number): Promise<void> => {
    try {
      await axiosClient.delete(`/videos/${videoId}`);
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return;
      }
      throw error;
    }
  },
};
