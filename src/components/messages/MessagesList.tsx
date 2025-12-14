import { Avatar } from '@/components/common/Avatar';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Message } from '@/types';

interface MessagesListProps {
  messages: Message[];
  currentUserId?: number;
  loading?: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function MessagesList({ 
  messages, 
  currentUserId, 
  loading, 
  messagesEndRef 
}: MessagesListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FE2C55]"></div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <Send className="w-16 h-16 mb-4" />
        <p>Chưa có tin nhắn</p>
        <p className="text-sm mt-2 text-gray-500">Gửi tin nhắn đầu tiên</p>
      </div>
    );
  }

  return (
    <>
      {[...messages].reverse().map((msg) => {
        const isSender = msg.senderId === currentUserId;
        
        return (
          <div
            key={msg.id}
            className={`flex gap-3 ${isSender ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <Avatar
              src={isSender ? msg.sender?.avatarUrl : msg.receiver?.avatarUrl}
              alt={isSender ? msg.sender?.username : msg.receiver?.username}
              size="sm"
              className="flex-shrink-0"
            />
            
            <div className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} max-w-[70%]`}>
              <div
                className={`px-4 py-2 rounded-2xl ${
                  isSender
                    ? 'bg-[#FE2C55] text-white'
                    : 'bg-[#2a2a2a] text-gray-200'
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
              </div>
              <span className="text-xs text-gray-500 mt-1 px-2">
                {formatDistanceToNow(new Date(msg.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </>
  );
}
