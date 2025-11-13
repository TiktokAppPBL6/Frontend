import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/api/comments.api';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send } from 'lucide-react';
import { getAvatarUrl, formatDate, cn } from '@/lib/utils';

interface CommentsModalProps {
  videoId: number;
  onClose: () => void;
}

export function CommentsModal({ videoId, onClose }: CommentsModalProps) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['comments', videoId],
    queryFn: () => commentsApi.getVideoComments(videoId),
    enabled: !!videoId,
  });
  const [comment, setComment] = useState('');

  const commentMutation = useMutation({
    mutationFn: commentsApi.createComment,
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
    },
  });

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#1E1E1E] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-[#1E1E1E]">
          <div>
            <h3 className="text-white font-bold text-lg">Bình luận</h3>
            <p className="text-gray-400 text-xs mt-0.5">{data?.total ?? 0} bình luận</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-800 rounded-full text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* List */}
        <div className={cn("flex-1 overflow-y-auto p-4 bg-[#121212]", isLoading && 'opacity-60')}>          
          <div className="space-y-3">
            {data?.comments?.map((c: any) => {
              // Response fields can be at top level or nested in c.user
              const u = c.user || {};
              const username = c.username ?? u.username ?? u.user_name ?? 'user';
              const fullName = c.fullName ?? c.full_name ?? u.fullName ?? u.full_name ?? '';
              const avatar = getAvatarUrl(c.avatarUrl ?? c.avatar_url ?? u.avatarUrl ?? u.avatar_url);
              
              return (
                <div key={c.id} className="flex gap-3 bg-[#1E1E1E] rounded-xl p-3 border border-gray-800 hover:border-gray-700 transition-all">
                  <Avatar src={avatar} alt={username} size="sm" className="ring-2 ring-gray-800" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white text-sm font-bold truncate">{fullName || username}</p>
                      <span className="text-gray-500 text-xs">· {formatDate(c.createdAt ?? c.created_at)}</span>
                    </div>
                    <p className="text-gray-400 text-xs mb-1.5">@{username}</p>
                    <p className="text-gray-300 text-[13px] leading-relaxed whitespace-pre-wrap break-words">{c.content}</p>
                  </div>
                </div>
              );
            })}

            {!data?.comments?.length && !isLoading && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-sm">Chưa có bình luận nào</p>
                <p className="text-gray-600 text-xs mt-1">Hãy là người đầu tiên bình luận!</p>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-800 p-4 bg-[#1E1E1E]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!comment.trim() || commentMutation.isPending) return;
              commentMutation.mutate({ videoId, content: comment.trim() });
            }}
            className="flex items-center gap-3"
          >
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Viết bình luận..."
              className="flex-1 bg-[#121212] border-gray-700 text-white rounded-full px-4 py-2 focus:bg-[#121212] focus:border-[#FE2C55] focus:ring-2 focus:ring-[#FE2C55]/20 transition-all placeholder:text-gray-500"
              disabled={commentMutation.isPending}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 rounded-full h-10 w-10 shadow-md hover:shadow-lg transition-all disabled:opacity-50" 
              disabled={!comment.trim() || commentMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
