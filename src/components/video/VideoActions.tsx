import { useEffect, useState, memo, useCallback } from 'react';
import { Video } from '@/types';
import { Heart, MessageCircle, Share2, Bookmark, Captions, Volume2, VolumeX } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
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
  subtitleLanguage?: 'off' | 'en' | 'vi';
  onSubtitleChange?: (lang: 'off' | 'en' | 'vi') => void;
}

function VideoActionsComponent({ video, vertical = true, onCommentClick, isMuted, onMuteToggle, subtitleLanguage = 'off', onSubtitleChange }: VideoActionsProps) {
  const currentUser = useAuthStore((s) => s.user);
  const initialIsLiked = (video as any).isLiked ?? (video as any).is_liked;
  const initialLikeCount = (video as any).likeCount ?? (video as any).likes_count ?? 0;
  const initialIsBookmarked = (video as any).isBookmarked ?? (video as any).is_bookmarked ?? false;
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked ?? false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(initialIsBookmarked);
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState<boolean>(false);
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
      // Don't invalidate to prevent reload - optimistic update is enough
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
      // Don't invalidate to prevent reload
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

  const handleSubtitleSelect = useCallback((lang: 'off' | 'en' | 'vi') => {
    onSubtitleChange?.(lang);
    setShowSubtitleMenu(false);
  }, [onSubtitleChange]);

  const ActionButton = ({
    icon: Icon,
    count,
    active,
    onClick,
    activeColor,
    disabled,
    label,
  }: {
    icon: any;
    count?: number;
    active?: boolean;
    onClick: () => void;
    activeColor?: 'pink' | 'yellow' | 'blue';
    disabled?: boolean;
    label?: string;
  }) => (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="flex flex-col items-center gap-1 group relative cursor-pointer"
      disabled={!!disabled}
      style={{ pointerEvents: 'auto' }}
      aria-label={label}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer',
          'bg-gray-900/90 hover:bg-gray-800 border border-gray-700/60',
          'shadow-xl',
          active && (
            activeColor === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600 border-yellow-400 text-white' :
            activeColor === 'blue' ? 'bg-blue-500 hover:bg-blue-600 border-blue-400 text-white' :
            'bg-[#FE2C55] hover:bg-[#fe1744] border-[#FE2C55] text-white'
          ),
          !active && 'text-white'
        )}
      >
        <Icon className={cn('h-5 w-5', active && 'fill-current')} strokeWidth={2} />
      </div>
      {count !== undefined && (
        <span className="text-xs font-bold text-white drop-shadow-lg">
          {formatNumber(count)}
        </span>
      )}
    </button>
  );

  const containerClass = vertical
    ? 'flex flex-col gap-4 pointer-events-auto relative z-50'
    : 'flex flex-row gap-4 items-center justify-center pointer-events-auto relative z-50';

  return (
    <div className={containerClass}>
      <ActionButton 
        icon={Heart} 
        count={likeCount} 
        active={isLiked} 
        onClick={handleLike} 
        activeColor="pink" 
        disabled={likeMutation.isPending}
        label={isLiked ? "Bỏ thích" : "Thích"}
      />
      <ActionButton
        icon={MessageCircle}
        count={(video as any).commentCount ?? (video as any).comments_count ?? 0}
        active={false}
        onClick={handleComment}
        label="Bình luận"
      />
      <ActionButton
        icon={Bookmark}
        active={isBookmarked}
        onClick={handleBookmark}
        activeColor="yellow"
        disabled={bookmarkMutation.isPending}
        label={isBookmarked ? "Bỏ lưu" : "Lưu video"}
      />
      <ActionButton
        icon={Share2}
        count={(video as any).shareCount ?? (video as any).shares_count}
        active={false}
        onClick={handleShare}
        label="Chia sẻ"
      />
      
      {/* Subtitle Menu */}
      <div className="relative z-50" style={{ pointerEvents: 'auto' }}>
        <ActionButton 
          icon={Captions} 
          active={subtitleLanguage !== 'off'}
          activeColor="blue"
          onClick={() => setShowSubtitleMenu((s) => !s)}
          label="Phụ đề"
        />
        {showSubtitleMenu && (
          <div className="absolute right-16 bottom-0 bg-black/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/80 min-w-[160px] py-2 z-[60]">
            <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide">Phụ đề</div>
            <button 
              className={cn(
                "w-full px-4 py-2.5 flex items-center justify-between text-sm text-white hover:bg-white/10 transition-colors cursor-pointer",
                subtitleLanguage === 'off' && "bg-white/5"
              )} 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                handleSubtitleSelect('off');
              }}
            >
              <span>Tắt</span>
              {subtitleLanguage === 'off' && <span className="text-[#FE2C55]">✓</span>}
            </button>
            <button 
              className={cn(
                "w-full px-4 py-2.5 flex items-center justify-between text-sm text-white hover:bg-white/10 transition-colors cursor-pointer",
                subtitleLanguage === 'en' && "bg-white/5"
              )} 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                handleSubtitleSelect('en');
              }}
            >
              <span>English</span>
              {subtitleLanguage === 'en' && <span className="text-[#FE2C55]">✓</span>}
            </button>
            <button 
              className={cn(
                "w-full px-4 py-2.5 flex items-center justify-between text-sm text-white hover:bg-white/10 transition-colors cursor-pointer",
                subtitleLanguage === 'vi' && "bg-white/5"
              )} 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                handleSubtitleSelect('vi');
              }}
            >
              <span>Tiếng Việt</span>
              {subtitleLanguage === 'vi' && <span className="text-[#FE2C55]">✓</span>}
            </button>
          </div>
        )}
      </div>

      {/* Mute/Unmute button */}
      {onMuteToggle && (
        <ActionButton 
          icon={isMuted ? VolumeX : Volume2} 
          onClick={onMuteToggle}
          active={!isMuted}
          label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
        />
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export const VideoActions = memo(VideoActionsComponent, (prevProps, nextProps) => {
  return (
    prevProps.video.id === nextProps.video.id &&
    prevProps.isMuted === nextProps.isMuted &&
    prevProps.subtitleLanguage === nextProps.subtitleLanguage &&
    prevProps.vertical === nextProps.vertical
  );
});
