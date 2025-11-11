import { useEffect, useState } from 'react';
import { Video } from '@/types';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Globe, Flag, Captions, Volume2, VolumeX } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '@/api/social.api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth';

interface VideoActionsProps {
  video: Video;
  vertical?: boolean;
  onCommentClick?: () => void;
  isMuted?: boolean;
  onMuteToggle?: () => void;
}

export function VideoActions({ video, vertical = true, onCommentClick, isMuted, onMuteToggle }: VideoActionsProps) {
  const currentUser = useAuthStore((s) => s.user);
  const initialIsLiked = (video as any).isLiked ?? (video as any).is_liked;
  const initialLikeCount = (video as any).likeCount ?? (video as any).likes_count ?? 0;
  const initialIsBookmarked = (video as any).isBookmarked ?? (video as any).is_bookmarked ?? false;
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked ?? false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(initialIsBookmarked);
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const needsIsLiked = initialIsLiked === undefined && !!currentUser?.id;
  const needsLikeCount = (video as any).likeCount === undefined && (video as any).likes_count === undefined;

  // Fetch likes to determine isLiked/count when not provided by API
  const { data: likesData } = useQuery({
    queryKey: ['video-likes', video.id],
    queryFn: () => socialApi.getVideoLikes(video.id),
    enabled: needsIsLiked || needsLikeCount,
  });

  useEffect(() => {
    if (!likesData) return;
    if (needsLikeCount && typeof likesData.total === 'number') {
      setLikeCount(likesData.total);
    }
    if (needsIsLiked && currentUser?.id) {
      const liked = likesData.likes?.some((u) => u.id === currentUser.id) ?? false;
      setIsLiked(liked);
    }
  }, [likesData, needsIsLiked, needsLikeCount, currentUser?.id]);

  const likeMutation = useMutation({
    mutationFn: (liked: boolean) =>
      liked ? socialApi.likeVideo(video.id) : socialApi.unlikeVideo(video.id),
    onSuccess: (_, liked) => {
      setIsLiked(liked);
      setLikeCount((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
      queryClient.invalidateQueries({ queryKey: ['videos'] });
      queryClient.invalidateQueries({ queryKey: ['video', video.id] });
      queryClient.invalidateQueries({ queryKey: ['video-likes', video.id] });
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
    if (onCommentClick) return onCommentClick();
    navigate(`/video/${video.id}#comments`);
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
    activeColor,
  }: {
    icon: any;
    count?: number;
    active?: boolean;
    onClick: () => void;
    activeColor?: 'pink' | 'yellow';
  }) => (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 group"
      disabled={likeMutation.isPending || bookmarkMutation.isPending}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md',
          'bg-gray-900/70 hover:bg-gray-900/80 border border-white/10',
          'shadow-lg hover:scale-110',
          active && (activeColor === 'yellow'
            ? 'bg-yellow-400/90 text-white hover:bg-yellow-500/90 border-yellow-400/30'
            : 'bg-[#FE2C55]/90 text-white hover:bg-[#FE2C55] border-[#FE2C55]/30')
        )}
      >
        <Icon className={cn('h-5 w-5 text-white', active && 'fill-current')} />
      </div>
      {count !== undefined && (
        <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {formatNumber(count)}
        </span>
      )}
    </button>
  );

  const containerClass = vertical
    ? 'flex flex-col gap-3'
    : 'flex flex-row gap-3 items-center justify-center';

  return (
    <div className={containerClass}>
      <ActionButton icon={Heart} count={likeCount} active={isLiked} onClick={handleLike} activeColor="pink" />
      <ActionButton
        icon={MessageCircle}
        count={(video as any).commentCount ?? (video as any).comments_count ?? 0}
        active={false}
        onClick={handleComment}
      />
      <ActionButton
        icon={Share2}
        count={(video as any).shareCount ?? (video as any).shares_count}
        active={false}
        onClick={handleShare}
      />
      <ActionButton icon={Bookmark} active={isBookmarked} onClick={handleBookmark} activeColor="yellow" />
      {/* More menu */}
      <div className="relative">
        <ActionButton icon={MoreVertical} onClick={() => setShowMenu((s) => !s)} />
        {showMenu && (
          <div className="absolute right-14 top-0 bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 min-w-[180px] py-2 z-20">
            <button className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-white hover:bg-white/10 transition-colors" onClick={() => setShowMenu(false)}>
              <Captions className="h-4 w-4 text-white/80" />
              <span>Vietsub</span>
            </button>
            <button className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-white hover:bg-white/10 transition-colors" onClick={() => setShowMenu(false)}>
              <Globe className="h-4 w-4 text-white/80" />
              <span>English</span>
            </button>
            <button className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-white hover:bg-white/10 transition-colors" onClick={() => setShowMenu(false)}>
              <Flag className="h-4 w-4 text-white/80" />
              <span>Tiếng Việt</span>
            </button>
          </div>
        )}
      </div>
      {/* Mute/Unmute button */}
      {onMuteToggle && (
        <ActionButton 
          icon={isMuted ? VolumeX : Volume2} 
          onClick={onMuteToggle}
        />
      )}
    </div>
  );
}
