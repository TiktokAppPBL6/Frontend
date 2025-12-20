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
  // Get video feed (public videos)
  // No authentication required
  // If logged in: is_liked shows if user liked the video
  // If not logged in: is_liked = null
  getVideos: async (params?: PaginationParams & { sort?: string; order?: 'asc' | 'desc' }): Promise<VideosResponse> => {
    try {
      // Backend uses skip/limit instead of page/pageSize
      const skip = params?.page ? (params.page - 1) * (params.pageSize || 20) : 0;
      const limit = params?.pageSize || 20;
      
      const response = await axiosClient.get<any>('/api/v1/videos/', {
        params: { 
          skip,
          limit,
        },
      });

      const data = response.data;

      // Normalize response
      if (Array.isArray(data)) {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || data.length;
        return { videos: data, total: data.length, page, pageSize, hasMore: data.length >= limit };
      }

      // If backend returns object with videos array
      return {
        videos: data.videos || data.items || data.data || [],
        total: data.total || data.total_count || data.count || 0,
        page: params?.page || 1,
        pageSize: params?.pageSize || limit,
        hasMore: data.has_more || false,
      };
    } catch (error) {
      throw error;
    }
  },

  // Get following feed - videos from users you follow
  getFollowingFeed: async (params?: PaginationParams): Promise<VideosResponse> => {
    try {
      // Backend uses skip/limit
      const skip = params?.page ? (params.page - 1) * (params.pageSize || 20) : 0;
      const limit = params?.pageSize || 20;
      
      const response = await axiosClient.get<any>('/api/v1/videos/following/feed', {
        params: { skip, limit },
      });

      const data = response.data;
      const videos = Array.isArray(data) ? data : data?.videos ?? data?.items ?? data?.data ?? [];

      // Normalize response
      if (Array.isArray(data)) {
        const page = params?.page || 1;
        const pageSize = params?.pageSize || data.length;
        return { videos: data, total: data.length, page, pageSize, hasMore: data.length >= limit };
      }

      return {
        videos,
        total: data?.total ?? data?.total_count ?? data?.count ?? videos.length,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? limit,
        hasMore: data?.hasMore ?? data?.has_more ?? false,
      };
    } catch (error) {
      throw error;
    }
  },

  // Get video by ID
  getVideo: async (videoId: number): Promise<Video> => {
    try {
      const response = await axiosClient.get<Video>(`/api/v1/videos/${videoId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get videos by user
  getUserVideos: async (userId: number, params?: PaginationParams): Promise<VideosResponse> => {
    try {
      // Backend uses skip/limit
      const skip = params?.page ? (params.page - 1) * (params.pageSize || 20) : 0;
      const limit = params?.pageSize || 20;
      
      const response = await axiosClient.get<any>(`/api/v1/videos/user/${userId}`, {
        params: { skip, limit },
      });
      
      console.log('📹 User videos response:', response.data);
      
      // Normalize response
      if (Array.isArray(response.data)) {
        return {
          videos: response.data,
          total: response.data.length,
          page: params?.page || 1,
          pageSize: params?.pageSize || response.data.length,
          hasMore: response.data.length >= limit,
        };
      }
      
      const data = response.data;
      return {
        videos: data.videos || data.items || data.data || [],
        total: data.total || data.total_count || data.count || 0,
        page: params?.page || 1,
        pageSize: params?.pageSize || limit,
        hasMore: data.has_more || false,
      };
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
      
      const response = await axiosClient.get<any>('/api/v1/videos/search', { 
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

      const response = await axiosClient.post<Video>('/api/v1/videos/', formData, {
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
      const response = await axiosClient.put<Video>(`/api/v1/videos/${videoId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete video
  deleteVideo: async (videoId: number): Promise<void> => {
    try {
      await axiosClient.delete(`/api/v1/videos/${videoId}`);
    } catch (error) {
      throw error;
    }
  },

  // Get video transcript/subtitles
  getVideoTranscript: async (videoId: number): Promise<VideoTranscript> => {
    try {
      const response = await axiosClient.get<VideoTranscript>(`/api/v1/videos/${videoId}/transcript`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create dubbing for video
  createDubbing: async (
    videoId: number,
    data: {
      speaker_id: string;
    }
  ): Promise<{ video_id: number; audio_filename: string; message: string }> => {
    try {
      const response = await axiosClient.post<{ video_id: number; audio_filename: string; message: string }>(
        `/api/v1/videos/${videoId}/dubbing`,
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
      use_correction?: boolean;
      translate_to_vietnamese?: boolean;
    }
  ): Promise<VideoTranscript> => {
    try {
      // Backend expects form-data, not JSON
      const formData = new URLSearchParams();
      if (data?.use_correction !== undefined) {
        formData.append('use_correction', data.use_correction.toString());
      }
      if (data?.translate_to_vietnamese !== undefined) {
        formData.append('translate_to_vietnamese', data.translate_to_vietnamese.toString());
      }

      const response = await axiosClient.post<VideoTranscript>(
        `/api/v1/videos/${videoId}/transcribe`,
        formData,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
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
      use_vietnamese?: boolean;
      alpha?: number;
    }
  ): Promise<{ message: string; audio_url?: string }> => {
    try {
      // Backend expects form-data, not JSON
      const formData = new URLSearchParams();
      if (data?.use_vietnamese !== undefined) {
        formData.append('use_vietnamese', data.use_vietnamese.toString());
      }
      if (data?.alpha !== undefined) {
        formData.append('alpha', data.alpha.toString());
      }

      const response = await axiosClient.post<{ message: string; audio_url?: string }>(
        `/api/v1/videos/${videoId}/text-to-speech`,
        formData,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
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
        `/api/v1/videos/${videoId}/text-to-speech/download`,
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
        `/api/v1/videos/audio/${audioFilename}`,
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
