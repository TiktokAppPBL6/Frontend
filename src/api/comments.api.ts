import axiosClient, { shouldUseMock } from './axiosClient';
import type {
  Comment,
  CommentCreateRequest,
  CommentUpdateRequest,
  CommentsResponse,
} from '@/types';
import { mockComments, mockDelay, getMockCommentsByVideo } from '@/mocks/mockDB';

export const commentsApi = {
  // Get comments for a video
  getVideoComments: async (videoId: number): Promise<CommentsResponse> => {
    try {
      const res = await axiosClient.get<any>(`/comments/video/${videoId}`);
      const data = res.data;
      // Normalize various possible shapes
      const comments = Array.isArray(data)
        ? data
        : data?.comments ?? data?.items ?? data?.data ?? [];
      const total = data?.total ?? data?.total_count ?? data?.count ?? comments.length ?? 0;

      return { comments, total };
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        const comments = getMockCommentsByVideo(videoId);
        return {
          comments,
          total: comments.length,
        };
      }
      throw error;
    }
  },

  // Create comment
  createComment: async (data: CommentCreateRequest): Promise<Comment> => {
    try {
      const response = await axiosClient.post<Comment>('/comments/', data);
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        const newComment: Comment = {
          id: Date.now(),
          videoId: data.videoId,
          userId: 1,
          content: data.content,
          createdAt: new Date().toISOString(),
          status: 'visible',
          user: mockComments[0].user,
          likesCount: 0,
          isLiked: false,
        };
        return newComment;
      }
      throw error;
    }
  },

  // Update comment
  updateComment: async (commentId: number, data: CommentUpdateRequest): Promise<Comment> => {
    try {
      const response = await axiosClient.put<Comment>(`/comments/${commentId}`, data);
      return response.data;
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        const comment = mockComments.find((c) => c.id === commentId);
        if (!comment) throw new Error('Comment not found');
        return { ...comment, ...data, updatedAt: new Date().toISOString() };
      }
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId: number): Promise<void> => {
    try {
      await axiosClient.delete(`/comments/${commentId}`);
    } catch (error) {
      if (shouldUseMock(error)) {
        await mockDelay();
        return;
      }
      throw error;
    }
  },
};
