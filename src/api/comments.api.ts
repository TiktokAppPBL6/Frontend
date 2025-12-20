import axiosClient from './axiosClient';
import type {
  Comment,
  CommentCreateRequest,
  CommentUpdateRequest,
  CommentsResponse,
} from '@/types';
export const commentsApi = {
  // Get comments for a video
  getVideoComments: async (videoId: number): Promise<CommentsResponse> => {
    try {
      const res = await axiosClient.get<any>(`/api/v1/comments/video/${videoId}`);
      const data = res.data;
      // Normalize various possible shapes
      const comments = Array.isArray(data)
        ? data
        : data?.comments ?? data?.items ?? data?.data ?? [];
      const total = data?.total ?? data?.total_count ?? data?.count ?? comments.length ?? 0;

      return { comments, total };
    } catch (error) {
      throw error;
    }
  },

  // Create comment
  createComment: async (data: CommentCreateRequest): Promise<Comment> => {
    try {
      const response = await axiosClient.post<Comment>('/api/v1/comments/', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update comment
  updateComment: async (commentId: number, data: CommentUpdateRequest): Promise<Comment> => {
    try {
      const response = await axiosClient.put<Comment>(`/api/v1/comments/${commentId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId: number): Promise<void> => {
    try {
      await axiosClient.delete(`/api/v1/comments/${commentId}`);
    } catch (error) {
      throw error;
    }
  },
};
