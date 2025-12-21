/**
 * Conversation List - TikTok Style
 * Danh sách tin nhắn với followers/following, online status, unread badges
 */
import { useState, useEffect } from 'react';
import { Search, Edit3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '@/components/common/Avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { type Message } from '@/api/messages.api';
import { followsApi } from '@/api/follows.api';
import { EmptyMessagesState } from './EmptyMessagesState';

export interface Conversation {
  userId: number;
  username: string;
  fullName?: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount?: number;
  isOnline?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeUserId?: number;
  onSelectConversation: (userId: number) => void;
  onNewMessage?: () => void;
}

export function ConversationList({
  conversations,
  activeUserId,
  onSelectConversation,
  onNewMessage,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFollowingOnly, setShowFollowingOnly] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<number>>(new Set());

  // Get following list
  const { data: followingData } = useQuery({
    queryKey: ['following'],
    queryFn: () => followsApi.getFollowing(),
  });

  useEffect(() => {
    if (followingData) {
      const ids = new Set<number>(followingData.map((f: { followeeId: number }) => f.followeeId));
      setFollowingIds(ids);
    }
  }, [followingData]);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.fullName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      !showFollowingOnly || followingIds.has(conv.userId);

    return matchesSearch && matchesFilter;
  });

  // Sort by last message time
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const timeA = a.lastMessage?.createdAt
      ? new Date(a.lastMessage.createdAt).getTime()
      : 0;
    const timeB = b.lastMessage?.createdAt
      ? new Date(b.lastMessage.createdAt).getTime()
      : 0;
    return timeB - timeA;
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
          <div className="flex gap-2">
            <button
              onClick={onNewMessage}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
              title="Tin nhắn mới"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowFollowingOnly(false)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              !showFollowingOnly
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            Tất cả
          </button>
          <button
            onClick={() => setShowFollowingOnly(true)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              showFollowingOnly
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            Following ({followingIds.size})
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          searchQuery ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-gray-500 dark:text-gray-400">
              <p>Không tìm thấy kết quả</p>
              <p className="text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
            </div>
          ) : (
            <EmptyMessagesState onSelectUser={onSelectConversation} />
          )
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedConversations.map((conversation) => {
              const isActive = conversation.userId === activeUserId;
              const isFollowing = followingIds.has(conversation.userId);

              return (
                <button
                  key={conversation.userId}
                  onClick={() => onSelectConversation(conversation.userId)}
                  className={cn(
                    'w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                    isActive && 'bg-gray-100 dark:bg-gray-800'
                  )}
                >
                  {/* Avatar with online status */}
                  <div className="relative flex-shrink-0">
                    <Avatar
                      src={conversation.avatar}
                      alt={conversation.username}
                      size="lg"
                    />
                    {conversation.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white truncate">
                          {conversation.fullName || conversation.username}
                        </span>
                        {isFollowing && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            • Following
                          </span>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {formatDistanceToNow(
                            new Date(conversation.lastMessage.createdAt),
                            { addSuffix: false, locale: vi }
                          )}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p
                        className={cn(
                          'text-sm truncate',
                          conversation.unreadCount && conversation.unreadCount > 0
                            ? 'font-semibold text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                        )}
                      >
                        {conversation.lastMessage?.content || 'Bắt đầu trò chuyện'}
                      </p>
                      {conversation.unreadCount && conversation.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full flex-shrink-0">
                          {conversation.unreadCount > 99
                            ? '99+'
                            : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
