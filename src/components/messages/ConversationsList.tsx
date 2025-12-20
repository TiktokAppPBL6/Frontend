import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { Avatar } from '@/components/common/Avatar';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getAvatarUrl } from '@/lib/utils';
import type { Message } from '@/api/messages.api';

interface ConversationsListProps {
  conversations: Message[];
  currentUserId?: number;
  selectedUserId: number | null;
  onSelectUser: (userId: number) => void;
}

export function ConversationsList({ 
  conversations, 
  currentUserId, 
  selectedUserId, 
  onSelectUser 
}: ConversationsListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <Send className="w-16 h-16 mb-4" />
        <p className="text-center">Chưa có tin nhắn nào</p>
        <p className="text-sm text-center mt-2 text-gray-500">Bắt đầu trò chuyện với bạn bè</p>
      </div>
    );
  }

  return (
    <>
      {conversations.map((msg) => {
        const partnerId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
        const isSelected = selectedUserId === partnerId;
        
        // Fetch user info for this conversation
        const { data: partnerUser } = useQuery({
          queryKey: ['user', partnerId],
          queryFn: () => usersApi.getUser(partnerId),
          staleTime: 1000 * 60 * 5, // Cache 5 phút
        });
        
        return (
          <div
            key={msg.id}
            onClick={() => onSelectUser(partnerId)}
            className={`flex items-center gap-3 p-4 hover:bg-[#2a2a2a] cursor-pointer border-b border-gray-800 transition-colors ${
              isSelected ? 'bg-[#2a2a2a]' : ''
            }`}
          >
            <Avatar
              src={getAvatarUrl(partnerUser?.avatarUrl)}
              alt={partnerUser?.username || `User ${partnerId}`}
              size="md"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm truncate text-white">
                  {partnerUser?.username || `Người dùng #${partnerId}`}
                </h3>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(msg.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-400 truncate">
                {msg.senderId === currentUserId && 'Bạn: '}
                {msg.content || '📷 Hình ảnh'}
              </p>
              {!msg.seen && msg.senderId !== currentUserId && (
                <div className="w-2 h-2 bg-[#FE2C55] rounded-full mt-1" />
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
