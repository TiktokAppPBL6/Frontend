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
      if (data.enableDubbing !== undefined) formData.append('enable_dubbing', data.enableDubbing.toString());
      if (data.speakerId) formData.append('speaker_id', data.speakerId);

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

  // Create dubbing for video
  createDubbing: async (
    videoId: number,
    data: {
      target_language: string;
      speaker_id?: string;
    }
  ): Promise<{ message: string; dubbing_id?: number }> => {
    try {
      const response = await axiosClient.post<{ message: string; dubbing_id?: number }>(
        `/videos/${videoId}/dubbing`,
        data
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Transcribe video (create transcript)
  transcribeVideo: async (
    videoId: number,
    data?: {
      language?: string;
    }
  ): Promise<VideoTranscript> => {
    try {
      const response = await axiosClient.post<VideoTranscript>(
        `/videos/${videoId}/transcribe`,
        data || {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate speech from transcript (text-to-speech)
  generateSpeech: async (
    videoId: number,
    data?: {
      speaker_id?: string;
      language?: string;
    }
  ): Promise<{ message: string; audio_url?: string }> => {
    try {
      const response = await axiosClient.post<{ message: string; audio_url?: string }>(
        `/videos/${videoId}/text-to-speech`,
        data || {}
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Download latest text-to-speech audio
  downloadTTSAudio: async (videoId: number): Promise<Blob> => {
    try {
      const response = await axiosClient.get(
        `/videos/${videoId}/text-to-speech/download`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Serve dubbed audio
  getDubbedAudio: async (audioFilename: string): Promise<Blob> => {
    try {
      const response = await axiosClient.get(
        `/videos/audio/${audioFilename}`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
