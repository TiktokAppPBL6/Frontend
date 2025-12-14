import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { socialApi } from '@/api/social.api';
import toast from 'react-hot-toast';

interface UseVideoFollowProps {
  ownerId: number | null;
  initialFollow: boolean;
}

interface UseVideoFollowReturn {
  isFollowing: boolean;
  followMutation: {
    isPending: boolean;
    mutate: () => void;
  };
  handleFollowClick: () => void;
}

/**
 * Hook to manage follow/unfollow actions for video owner
 */
export function useVideoFollow({ ownerId, initialFollow }: UseVideoFollowProps): UseVideoFollowReturn {
  const [isFollowing, setIsFollowing] = useState<boolean>(!!initialFollow);

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!ownerId) throw new Error('Invalid user ID');
      if (isFollowing) {
        await socialApi.unfollowUser(ownerId);
      } else {
        await socialApi.followUser(ownerId);
      }
    },
    onSuccess: () => {
      setIsFollowing((prev) => !prev);
      toast.success(isFollowing ? 'Đã bỏ theo dõi' : 'Đã theo dõi');
    },
    onError: (error: any) => {
      console.error('Follow error:', error);
      toast.error('Không thể thực hiện hành động này');
    },
  });

  const handleFollowClick = () => {
    followMutation.mutate();
  };

  return {
    isFollowing,
    followMutation,
    handleFollowClick,
  };
}
