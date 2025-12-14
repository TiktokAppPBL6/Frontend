import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/api/comments.api';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { getAvatarUrl, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

interface VideoCommentSectionProps {
  videoId: number;
  comments: any[];
  currentUser: any;
}

export function VideoCommentSection({ videoId, comments, currentUser }: VideoCommentSectionProps) {
  const [comment, setComment] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const commentMutation = useMutation({
    mutationFn: commentsApi.createComment,
    onMutate: async (newComment) => {
      await queryClient.cancelQueries({ queryKey: ['comments', videoId] });
      const previousComments = queryClient.getQueryData(['comments', videoId]);

      queryClient.setQueryData(['comments', videoId], (old: any) => {
        const oldComments = old?.comments || [];
        const optimisticComment = {
          id: Date.now(),
          content: newComment.content,
          createdAt: new Date().toISOString(),
          userId: currentUser?.id,
          username: currentUser?.username,
          fullName: currentUser?.fullName,
          avatarUrl: currentUser?.avatarUrl,
        };
        return {
          comments: [optimisticComment, ...oldComments],
          total: (old?.total || 0) + 1,
        };
      });

      return { previousComments };
    },
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
      toast.success('Đã thêm bình luận');
    },
    onError: (_err, _newComment, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', videoId], context.previousComments);
      }
      toast.error('Không thể thêm bình luận');
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      commentMutation.mutate({ videoId, content: comment.trim() });
    }
  };

  return (
    <div id="comments-section" className="bg-[#1E1E1E] rounded-2xl p-6 border border-gray-800">
      <h3 className="text-white text-lg font-bold mb-4">
        Bình luận ({comments?.length || 0})
      </h3>

      {/* Comment Input */}
      {currentUser ? (
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
              <img
                src={getAvatarUrl(currentUser.avatarUrl)}
                alt={currentUser.username}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Thêm bình luận..."
                className="flex-1 bg-[#121212] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-[#FE2C55] focus:outline-none"
              />
              <Button
                type="submit"
                disabled={!comment.trim() || commentMutation.isPending}
                className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-[#121212] rounded-lg border border-gray-800">
          <p className="text-gray-400 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-[#FE2C55] hover:underline font-semibold"
            >
              Đăng nhập
            </button>
            {' '}để bình luận
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-3">
              <button
                onClick={() => navigate(`/user/${comment.user?.id || comment.userId}`)}
                className="flex-shrink-0"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                  <img
                    src={getAvatarUrl(comment.user?.avatarUrl || comment.avatarUrl)}
                    alt={comment.user?.username || comment.username || 'User'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
              <div className="flex-1">
                <div className="bg-[#121212] rounded-lg px-4 py-2">
                  <button
                    onClick={() => navigate(`/user/${comment.user?.id || comment.userId}`)}
                    className="font-semibold text-white text-sm hover:underline"
                  >
                    {comment.user?.username || comment.username || 'Unknown User'}
                  </button>
                  <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                </div>
                <p className="text-gray-500 text-xs mt-1 ml-4">
                  {formatDate(comment.createdAt)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa có bình luận nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
