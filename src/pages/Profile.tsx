import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { videosApi } from '@/api/videos.api';
import { socialApi } from '@/api/social.api';
import { useAuthStore } from '@/app/store/auth';
import { useState, useMemo } from 'react';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { VideoGrid } from '@/components/profile/VideoGrid';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { EditVideoModal } from '@/components/profile/EditVideoModal';
import { FollowersModal } from '@/components/profile/FollowersModal';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

export function Profile() {
  const [editOpen, setEditOpen] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');
  const [videoTab, setVideoTab] = useState<'public' | 'private'>('public');
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const userId = parseInt(id || '0');
  const isOwnProfile = currentUser?.id === userId;

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => usersApi.getUser(userId),
    enabled: !!userId,
  });

  // Get videos count from user data first
  const userVideosCount = user 
    ? ((user as any).videos_count ?? (user as any).videosCount ?? null)
    : null;

  const { data: videosData, isLoading: videosLoading } = useQuery({
    queryKey: ['videos', 'user', userId],
    queryFn: () => videosApi.getUserVideos(userId, { page: 1, pageSize: 20 }),
    // Only fetch if userId exists AND (we don't have count info yet OR count > 0)
    enabled: !!userId && (userVideosCount === null || userVideosCount > 0),
  });

  // Filter videos by privacy for own profile
  const publicVideos = useMemo(() => {
    if (!videosData?.videos) return [];
    return videosData.videos.filter((v: any) => {
      // Public videos: not private, not hidden
      const isPrivate = v.privacy === 'private' || v.is_private === true;
      const isHidden = v.visibility === 'hidden';
      return !isPrivate && !isHidden;
    });
  }, [videosData]);

  const privateVideos = useMemo(() => {
    if (!videosData?.videos || !isOwnProfile) return [];
    return videosData.videos.filter((v: any) => {
      // Private videos: marked as private OR hidden
      const isPrivate = v.privacy === 'private' || v.is_private === true;
      const isHidden = v.visibility === 'hidden';
      return isPrivate || isHidden;
    });
  }, [videosData, isOwnProfile]);

  const displayVideos = isOwnProfile 
    ? (videoTab === 'public' ? publicVideos : privateVideos)
    : publicVideos;

  // Get follow status from API (check both snake_case and camelCase)
  const isFollowing = user ? ((user as any).is_following ?? user.isFollowing ?? false) : false;

  // Normalize counts from API: prefer snake_case then camelCase, fallback to 0 or videosData
  const followersCount = user ? ((user as any).followers_count ?? (user as any).followersCount ?? 0) : 0;
  const followingCount = user ? ((user as any).following_count ?? (user as any).followingCount ?? 0) : 0;
  const videosCount = user
    ? ((user as any).videos_count ?? (user as any).videosCount ?? (videosData as any)?.total ?? videosData?.videos?.length ?? 0)
    : ((videosData as any)?.total ?? videosData?.videos?.length ?? 0);

  const followMutation = useMutation({
    mutationFn: () => 
      isFollowing ? socialApi.unfollowUser(userId) : socialApi.followUser(userId),
    onSuccess: () => {
      toast.success(isFollowing ? 'Đã bỏ theo dõi' : 'Đã theo dõi');
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#121212] py-6">
        <div className="container mx-auto max-w-4xl px-4">
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#121212] py-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400">Không tìm thấy người dùng</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#121212] py-6">
        <div className="container mx-auto max-w-5xl px-4">
          <ProfileHeader
            user={user}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            followersCount={followersCount}
            followingCount={followingCount}
            videosCount={videosCount}
            onEditClick={() => setEditOpen(true)}
            onFollowClick={() => followMutation.mutate()}
            onFollowersClick={() => {
              setFollowersModalTab('followers');
              setFollowersModalOpen(true);
            }}
            onFollowingClick={() => {
              setFollowersModalTab('following');
              setFollowersModalOpen(true);
            }}
            isFollowPending={followMutation.isPending}
          />

          <div>
            <ProfileTabs
              isOwnProfile={isOwnProfile}
              activeTab={videoTab}
              onTabChange={setVideoTab}
            />

            <VideoGrid
              videos={displayVideos}
              isOwnProfile={isOwnProfile}
              isLoading={videosLoading && userVideosCount !== 0}
              activeTab={videoTab}
              onEditVideo={setEditingVideo}
            />
          </div>
        </div>
      </div>

      <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
      {editingVideo && (
        <EditVideoModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
        />
      )}
      {followersModalOpen && (
        <FollowersModal
          userId={userId}
          initialTab={followersModalTab}
          onClose={() => setFollowersModalOpen(false)}
        />
      )}
    </>
  );
}
