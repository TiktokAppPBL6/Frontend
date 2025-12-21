/**
 * Messages Page - Modern Chat with WebSocket
 * Chỉ cho phép nhắn tin với Followers/Following
 */
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { messagesApi, type ConversationItem } from '@/api/messages.api';
import { usersApi } from '@/api/users.api';
import { useAuthStore } from '@/app/store/auth';
import websocketService from '@/services/websocket.service';
import { ConversationList } from '@/components/messages/ConversationList';

const wsService = websocketService;
import type { Conversation } from '@/components/messages/ConversationList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { NewMessageModal } from '@/components/messages/NewMessageModal';

export function Messages() {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    userId ? parseInt(userId) : null
  );
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const queryClient = useQueryClient();

  // Fetch inbox - now returns ConversationItem[] instead of Message[]
  const { data: inbox } = useQuery<ConversationItem[]>({
    queryKey: ['messages', 'inbox'],
    queryFn: messagesApi.getInbox,
  });

  // Fetch selected user data
  const { data: selectedUser } = useQuery({
    queryKey: ['user', selectedUserId],
    queryFn: () => usersApi.getUser(selectedUserId!),
    enabled: !!selectedUserId,
  });

  // Build conversations from inbox - now inbox contains ConversationItem[]
  useEffect(() => {
    if (!inbox || !currentUser) return;

    // Inbox already contains formatted conversations
    const formattedConversations: Conversation[] = inbox.map((conv: ConversationItem) => ({
      userId: conv.userId,
      username: conv.username,
      fullName: conv.fullName,
      avatar: conv.avatarUrl,
      lastMessage: {
        id: conv.lastMessage.id,
        senderId: conv.lastMessage.senderId,
        receiverId: conv.lastMessage.receiverId,
        content: conv.lastMessage.content,
        createdAt: conv.lastMessage.createdAt,
        seen: conv.lastMessage.seen,
      },
      unreadCount: conv.unreadCount,
      isOnline: false, // TODO: Get from WebSocket presence
    }));

    setConversations(formattedConversations);
  }, [inbox, currentUser]);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    const handleMessage = (wsMessage: any) => {
      if (wsMessage.type === 'message' && wsMessage.data) {
        const { sender_id, receiver_id } = wsMessage.data;
        
        // Update conversation list
        queryClient.invalidateQueries({ queryKey: ['messages', 'inbox'] });
        
        // If message is from/to current conversation, invalidate it too
        if (
          selectedUserId &&
          ((sender_id === selectedUserId && receiver_id === currentUser?.id) ||
            (sender_id === currentUser?.id && receiver_id === selectedUserId))
        ) {
          queryClient.invalidateQueries({
            queryKey: ['messages', 'conversation', selectedUserId],
          });
        }
      }
    };

    wsService.on('message', handleMessage);

    return () => {
      wsService.off('message', handleMessage);
    };
  }, [selectedUserId, currentUser, queryClient]);

  const handleSelectConversation = (userId: number) => {
    setSelectedUserId(userId);
    navigate(`/messages/${userId}`);
  };

  const handleNewMessage = () => {
    setShowNewMessageModal(true);
  };

  const handleSelectNewUser = (userId: number) => {
    setSelectedUserId(userId);
    navigate(`/messages/${userId}`);
  };

  const handleBack = () => {
    setSelectedUserId(null);
    navigate('/messages');
  };

  // Get existing conversation user IDs to exclude from new message modal
  const existingUserIds = conversations.map((c) => c.userId);

  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-900 flex overflow-hidden pt-16">
      {/* Conversation List - Sidebar */}
      <div
        className={`w-full lg:w-96 flex-shrink-0 ${
          selectedUserId ? 'hidden lg:block' : ''
        }`}
      >
        <ConversationList
          conversations={conversations}
          activeUserId={selectedUserId || undefined}
          onSelectConversation={handleSelectConversation}
          onNewMessage={handleNewMessage}
        />
      </div>

      {/* Chat Window - Main area */}
      <div
        className={`flex-1 ${
          !selectedUserId ? 'hidden lg:flex' : 'flex'
        } flex-col`}
      >
        {selectedUserId && selectedUser ? (
          <ChatWindow
            user={{
              id: selectedUser.id,
              username: selectedUser.username,
              fullName: selectedUser.fullName,
              avatar: selectedUser.avatarUrl,
              isOnline: false,
            }}
            onBack={handleBack}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <svg
                className="w-24 h-24 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Messages</h3>
              <p className="text-sm">
                Chọn một cuộc trò chuyện để bắt đầu nhắn tin
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        onSelectUser={handleSelectNewUser}
        excludeUserIds={existingUserIds}
      />
    </div>
  );
}
