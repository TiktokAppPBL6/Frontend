import { useEffect, useState, useCallback } from 'react';
import { Video } from '@/types';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Captions,
  Volume2,
  VolumeX,
  Languages,
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { socialApi } from '@/api/social.api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth';
import { ActionButton } from './ActionButton';
import { cn } from '@/lib/utils';

interface VideoActionsProps {
  video: Video;
  onCommentClick?: () => void;
  isMuted?: boolean;
  onMuteToggle?: () => void;
  subtitleLanguage?: 'off' | 'en' | 'vi';
  onSubtitleChange?: (lang: 'off' | 'en' | 'vi') => void;
  isDubbing?: boolean;
  onDubbingToggle?: () => void;
}

export function VideoActions({
  video,
  onCommentClick,
  isMuted,
  onMuteToggle,
  subtitleLanguage = 'off',
  onSubtitleChange,
  isDubbing = false,
  onDubbingToggle,
}: VideoActionsProps) {
  const currentUser = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  // Initialize states from video data
  const v: any = video;
  const initialIsLiked = v.isLiked ?? v.is_liked ?? false;
  const initialLikeCount = v.likeCount ?? v.likes_count ?? 0;
  const initialIsBookmarked = v.isBookmarked ?? v.is_bookmarked ?? false;
  const commentsCount = v.commentsCount ?? v.comments_count ?? 0;
  const sharesCount = v.shareCount ?? v.shares_count ?? 0;

  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(initialIsBookmarked);
  const [showSubtitleMenu, setShowSubtitleMenu] = useState(false);

  // Fetch likes if not provided
  const { data: likesData } = useQuery({
    queryKey: ['video-likes', video.id],
    queryFn: () => socialApi.getVideoLikes(video.id),
    enabled: initialIsLiked === undefined && !!currentUser?.id,
  });

  useEffect(() => {
    if (likesData) {
      setLikeCount(likesData.total ?? 0);
      if (currentUser?.id) {
        const liked = likesData.likes?.some((u) => u.id === currentUser.id) ?? false;
        setIsLiked(liked);
      }
    }
  }, [likesData, currentUser?.id]);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: (liked: boolean) =>
      liked ? socialApi.likeVideo(video.id) : socialApi.unlikeVideo(video.id),
    onMutate: (liked) => {
      setIsLiked(liked);
      setLikeCount((prev) => (liked ? prev + 1 : Math.max(0, prev - 1)));
    },
    onError: () => {
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev + 1 : Math.max(0, prev - 1)));
      toast.error('Không thể thực hiện hành động này');
    },
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: (bookmarked: boolean) =>
      bookmarked
        ? socialApi.bookmarkVideo(video.id)
        : socialApi.unbookmarkVideo(video.id),
    onMutate: (bookmarked) => {
      setIsBookmarked(bookmarked);
      toast.success(bookmarked ? 'Đã lưu video' : 'Đã bỏ lưu video');
    },
    onError: () => {
      setIsBookmarked(!isBookmarked);
      toast.error('Không thể thực hiện hành động này');
    },
  });

  // Handlers
  const handleLike = useCallback(() => {
    likeMutation.mutate(!isLiked);
  }, [isLiked, likeMutation]);

  const handleComment = useCallback(() => {
    if (onCommentClick) {
      onCommentClick();
    } else {
      navigate(`/video/${video.id}#comments`);
    }
  }, [onCommentClick, navigate, video.id]);

  const handleShare = useCallback(async () => {
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
  }, [video.id, video.title, video.description]);

  const handleBookmark = useCallback(() => {
    bookmarkMutation.mutate(!isBookmarked);
  }, [isBookmarked, bookmarkMutation]);

  const handleSubtitleSelect = useCallback(
    (lang: 'off' | 'en' | 'vi') => {
      onSubtitleChange?.(lang);
      setShowSubtitleMenu(false);
    },
    [onSubtitleChange]
  );

  const hasAudioVi = v.audio_vi || v.audioVi;

  return (
    <div className="flex flex-col gap-3 relative z-50" style={{ pointerEvents: 'auto' }}>
      {/* Like */}
      <ActionButton
        icon={Heart}
        count={likeCount}
        active={isLiked}
        activeColor="red"
        onClick={handleLike}
      />

      {/* Comment */}
      <ActionButton
        icon={MessageCircle}
        count={commentsCount}
        onClick={handleComment}
      />

      {/* Bookmark */}
      <ActionButton
        icon={Bookmark}
        active={isBookmarked}
        activeColor="yellow"
        onClick={handleBookmark}
      />

      {/* Subtitle Menu */}
      <div className="relative">
        <ActionButton
          icon={Captions}
          active={subtitleLanguage !== 'off'}
          activeColor="blue"
          onClick={() => setShowSubtitleMenu((s) => !s)}
        />
        {showSubtitleMenu && (
          <div className="absolute right-16 bottom-0 bg-black/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/80 min-w-[160px] py-2 z-[60]">
            <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wide">
              Phụ đề
            </div>
            {[
              { value: 'off', label: 'Tắt' },
              { value: 'en', label: 'English' },
              { value: 'vi', label: 'Tiếng Việt' },
            ].map((option) => (
              <button
                key={option.value}
                className={cn(
                  'w-full px-4 py-2.5 flex items-center justify-between text-sm text-white hover:bg-white/10 transition-colors',
                  subtitleLanguage === option.value && 'bg-white/5'
                )}
                onClick={() => handleSubtitleSelect(option.value as any)}
              >
                <span>{option.label}</span>
                {subtitleLanguage === option.value && (
                  <span className="text-[#FE2C55]">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dubbing Toggle */}
      {hasAudioVi && onDubbingToggle && (
        <ActionButton
          icon={Languages}
          active={isDubbing}
          activeColor="blue"
          onClick={onDubbingToggle}
        />
      )}

      {/* Mute/Unmute */}
      {onMuteToggle && (
        <ActionButton
          icon={isMuted ? VolumeX : Volume2}
          active={!isMuted}
          onClick={onMuteToggle}
        />
      )}
    </div>
  );
}
