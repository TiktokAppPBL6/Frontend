import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '@/api/users.api';
import { Avatar } from '@/components/common/Avatar';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getAvatarUrl } from '@/lib/utils';

export interface ConversationItem {
  userId: number;
  username: string;
  avatarUrl?: string;
  fullName?: string;
  lastMessage?: any;
  unreadCount: number;
  isTyping?: boolean;
}

interface ConversationsListProps {
  conversations: ConversationItem[];
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
  const navigate = useNavigate();

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
      {conversations.map((conv) => {
        const isSelected = selectedUserId === conv.userId;
        
        return (
          <div
            key={conv.userId}
            onClick={() => onSelectUser(conv.userId)}
            className={`flex items-center gap-3 p-4 hover:bg-[#2a2a2a] cursor-pointer border-b border-gray-800 transition-colors ${
              isSelected ? 'bg-[#2a2a2a]' : ''
            }`}
          >
            <div 
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/user/${conv.userId}`);
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Avatar
                src={getAvatarUrl(conv.avatarUrl)}
                alt={conv.username || `User ${conv.userId}`}
                size="md"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm truncate text-white">
                  {conv.username || `Người dùng #${conv.userId}`}
                </h3>
                {conv.lastMessage?.createdAt && (
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400 truncate">
                {conv.isTyping ? (
                  <span className="italic text-[#FE2C55]">đang gõ...</span>
                ) : (
                  <>
                    {conv.lastMessage?.senderId === currentUserId && 'Bạn: '}
                    {conv.lastMessage?.content || 'Chưa có tin nhắn'}
                  </>
                )}
              </p>
              {conv.unreadCount > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-[#FE2C55] rounded-full" />
                  <span className="text-xs text-[#FE2C55]">{conv.unreadCount}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
