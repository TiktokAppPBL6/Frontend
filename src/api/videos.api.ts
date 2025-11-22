import axiosClient from './axiosClient';
import type {
  Video,
  VideoUploadRequest,
  VideoUpdateRequest,
  VideosResponse,
  VideoTranscript,
  PaginationParams,
  SearchParams,
} from '@/types';

export const videosApi = {
  // Get video feed
  getVideos: async (params?: PaginationParams & { sort?: string; order?: 'asc' | 'desc' }): Promise<VideosResponse> => {
    try {
      const response = await axiosClient.get<any>('/videos/', {
        params: { ...params, sort: params?.sort || 'createdAt', order: params?.order || 'desc' },
      });

      const data = response.data;

      // If backend returned array directly, wrap into normalized response
      if (Array.isArray(data)) {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || data.length;
        return { videos: data, total: data.length, page, pageSize, hasMore: false };
      }

      return data as VideosResponse;
    } catch (error) {
      throw error;
    }
  },

  // Get following feed - videos from users you follow
  getFollowingFeed: async (params?: PaginationParams): Promise<VideosResponse> => {
    try {
      const response = await axiosClient.get<any>('/videos/following/feed', {
        params,
      });

      const data = response.data;
      const videos = Array.isArray(data) ? data : data?.videos ?? data?.items ?? data?.data ?? [];

      // Normalize response
      if (Array.isArray(data)) {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || data.length;
        return { videos: data, total: data.length, page, pageSize, hasMore: false };
      }

      return {
        videos,
        total: data?.total ?? data?.total_count ?? data?.count ?? videos.length,
        page: data?.page ?? params?.page ?? 1,
        pageSize: data?.pageSize ?? data?.page_size ?? params?.pageSize ?? videos.length,
        hasMore: data?.hasMore ?? data?.has_more ?? false,
      };
    } catch (error) {
      throw error;
    }
  },

  // Get video by ID
  getVideo: async (videoId: number): Promise<Video> => {
    try {
      const response = await axiosClient.get<Video>(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
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
      throw error;
    }
  },

  // Search videos
  searchVideos: async (params: SearchParams): Promise<Video[]> => {
    try {
      // Backend expects: q, skip, limit (not query, page, pageSize)
      const skip = params.page ? (params.page - 1) * (params.pageSize || 20) : 0;
      const limit = params.pageSize || 20;
      
      const response = await axiosClient.get<any>('/videos/search', { 
        params: {
          q: params.query,
          skip,
          limit
        }
      });
      
      // Response might be array or object
      const videos = Array.isArray(response.data) ? response.data : response.data?.videos ?? response.data?.items ?? [];
      return videos;
    } catch (error) {
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
      throw error;
    }
  },

  // Update video
  updateVideo: async (videoId: number, data: VideoUpdateRequest): Promise<Video> => {
    try {
      const response = await axiosClient.put<Video>(`/videos/${videoId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete video
  deleteVideo: async (videoId: number): Promise<void> => {
    try {
      await axiosClient.delete(`/videos/${videoId}`);
    } catch (error) {
      throw error;
    }
  },

  // Get video transcript/subtitles
  getVideoTranscript: async (videoId: number): Promise<VideoTranscript> => {
    try {
      const response = await axiosClient.get<VideoTranscript>(`/videos/${videoId}/transcript`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
