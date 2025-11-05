import { useState } from 'react';
import { Video } from '@/types';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn, formatNumber } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '@/api/social.api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface VideoActionsProps {
  video: Video;
  vertical?: boolean;
}

export function VideoActions({ video, vertical = true }: VideoActionsProps) {
  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(video.isBookmarked || false);
  const [likeCount, setLikeCount] = useState(video.likeCount || 0);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const likeMutation = useMutation({
    mutationFn: (liked: boolean) =>
      liked ? socialApi.likeVideo(video.id) : socialApi.unlikeVideo(video.id),
    onSuccess: (_, liked) => {
      setIsLiked(liked);
      setLikeCount((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: () => {
      toast.error('Không thể thực hiện hành động này');
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: (bookmarked: boolean) =>
      bookmarked ? socialApi.bookmarkVideo(video.id) : socialApi.unbookmarkVideo(video.id),
    onSuccess: (_, bookmarked) => {
      setIsBookmarked(bookmarked);
      toast.success(bookmarked ? 'Đã lưu video' : 'Đã bỏ lưu video');
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
    onError: () => {
      toast.error('Không thể thực hiện hành động này');
    },
  });

  const handleLike = () => {
    likeMutation.mutate(!isLiked);
  };

  const handleComment = () => {
    navigate(`/video/${video.id}`);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/video/${video.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Đã sao chép link!');
    }
  };

  const handleBookmark = () => {
    bookmarkMutation.mutate(!isBookmarked);
  };

  const ActionButton = ({
    icon: Icon,
    count,
    active,
    onClick,
  }: {
    icon: any;
    count?: number;
    active?: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group"
      disabled={likeMutation.isPending || bookmarkMutation.isPending}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
          'bg-gray-200/80 hover:bg-gray-300/80',
          active && 'bg-[#FE2C55] text-white hover:bg-[#FE2C55]/90'
        )}
      >
        <Icon className={cn('h-6 w-6', active && 'fill-current')} />
      </div>
      {count !== undefined && (
        <span className="text-xs font-semibold text-white drop-shadow-lg">
          {formatNumber(count)}
        </span>
      )}
    </button>
  );

  const containerClass = vertical
    ? 'flex flex-col gap-4'
    : 'flex flex-row gap-4 items-center justify-center';

  return (
    <div className={containerClass}>
      <ActionButton icon={Heart} count={likeCount} active={isLiked} onClick={handleLike} />
      <ActionButton
        icon={MessageCircle}
        count={video.commentCount}
        active={false}
        onClick={handleComment}
      />
      <ActionButton icon={Share2} count={video.shareCount} active={false} onClick={handleShare} />
      <ActionButton icon={Bookmark} active={isBookmarked} onClick={handleBookmark} />
    </div>
  );
}
