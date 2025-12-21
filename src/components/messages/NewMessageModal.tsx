/**
 * New Message Modal - Start chat with Followers/Following
 * Chỉ cho phép nhắn tin với những người following hoặc follower
 */
import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { followsApi } from '@/api/follows.api';
import { Avatar } from '@/components/common/Avatar';

interface User {
  id: number;
  username: string;
  fullName?: string;
  avatar?: string;
  isFollower?: boolean;
  isFollowing?: boolean;
}

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: number) => void;
  excludeUserIds?: number[];
}

export function NewMessageModal({
  isOpen,
  onClose,
  onSelectUser,
  excludeUserIds = [],
}: NewMessageModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  // Get followers and following
  const { data: followers } = useQuery({
    queryKey: ['followers'],
    queryFn: () => followsApi.getFollowers(),
  });

  const { data: following } = useQuery({
    queryKey: ['following'],
    queryFn: () => followsApi.getFollowing(),
  });

  useEffect(() => {
    if (!followers || !following) return;

    const usersMap = new Map<number, User>();

    // Add followers
    followers.forEach((f: any) => {
      if (!excludeUserIds.includes(f.followerId)) {
        usersMap.set(f.followerId, {
          id: f.followerId,
          username: f.follower?.username || `User ${f.followerId}`,
          fullName: f.follower?.fullName,
          avatar: f.follower?.avatarUrl,
          isFollower: true,
          isFollowing: false,
        });
      }
    });

    // Add following (merge if already exists as follower)
    following.forEach((f: any) => {
      if (!excludeUserIds.includes(f.followeeId)) {
        if (usersMap.has(f.followeeId)) {
          const existing = usersMap.get(f.followeeId)!;
          existing.isFollowing = true; // Mark as mutual
        } else {
          usersMap.set(f.followeeId, {
            id: f.followeeId,
            username: f.followee?.username || `User ${f.followeeId}`,
            fullName: f.followee?.fullName,
            avatar: f.followee?.avatarUrl,
            isFollower: false,
            isFollowing: true,
          });
        }
      }
    });

    setAvailableUsers(Array.from(usersMap.values()));
  }, [followers, following, excludeUserIds]);

  // Filter users by search query
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort: mutual friends first, then following, then followers
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aMutual = a.isFollower && a.isFollowing;
    const bMutual = b.isFollower && b.isFollowing;
    
    if (aMutual && !bMutual) return -1;
    if (!aMutual && bMutual) return 1;
    
    if (a.isFollowing && !b.isFollowing) return -1;
    if (!a.isFollowing && b.isFollowing) return 1;
    
    return 0;
  });

  const handleSelectUser = (userId: number) => {
    onSelectUser(userId);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tin nhắn mới
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto">
          {sortedUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500 dark:text-gray-400">
              <p>Không tìm thấy người dùng</p>
              <p className="text-sm mt-1">
                Bạn cần follow hoặc được follow bởi người dùng để có thể nhắn tin
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedUsers.map((user) => {
                const isMutual = user.isFollower && user.isFollowing;

                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Avatar src={user.avatar} alt={user.username} size="md" />
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {user.fullName || user.username}
                        </span>
                        {isMutual && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full">
                            Bạn bè
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        @{user.username}
                        {user.isFollowing && ' • Following'}
                        {user.isFollower && ' • Follower'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
