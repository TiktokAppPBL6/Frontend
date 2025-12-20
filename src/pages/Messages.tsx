import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { messagesApi, type Message } from '@/api/messages.api';
import { usersApi } from '@/api/users.api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/app/store/auth';
import { ConversationsHeader } from '@/components/messages/ConversationsHeader';
import { ConversationsList } from '@/components/messages/ConversationsList';
import { ChatHeader } from '@/components/messages/ChatHeader';
import { MessagesList } from '@/components/messages/MessagesList';
import { MessageInput } from '@/components/messages/MessageInput';
import { EmptyChatState } from '@/components/messages/EmptyChatState';
import { WebSocketService } from '@/services/websocket';

/**
 * Messages Page - WebSocket Integration theo BACKEND_IMPLEMENTATION_GUIDE.md
 * - Subscribe to "message:new" event
 * - Subscribe to "message:seen" event
 * - Call markMessagesAsSeen khi viewing conversation
 */
export function Messages() {
  const { userId } = useParams<{ userId?: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const [message, setMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    userId ? parseInt(userId) : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Query conversations list (no polling - use WebSocket)
  const { data: inbox, isLoading: inboxLoading } = useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: messagesApi.getInbox,
    // Removed refetchInterval - use WebSocket instead
  });

  // Query conversation messages (no polling - use WebSocket)
  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ['messages', 'conversation', selectedUserId],
    queryFn: () => messagesApi.getConversation(selectedUserId!),
    enabled: !!selectedUserId,
    // Removed refetchInterval - use WebSocket instead
  });

  const { data: selectedUser } = useQuery({
    queryKey: ['user', selectedUserId],
    queryFn: () => usersApi.getUser(selectedUserId!),
    enabled: !!selectedUserId,
  });

  // WebSocket Integration - Subscribe to events
  useEffect(() => {
    const ws = WebSocketService.getInstance();

    // Handler for new messages
    const handleNewMessage = (event: any) => {
      console.log('📩 New message received:', event);
      // Invalidate inbox and conversation queries
      queryClient.invalidateQueries({ queryKey: ['messages', 'inbox'] });
      if (selectedUserId && (event.data.sender_id === selectedUserId || event.data.receiver_id === selectedUserId)) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'conversation', selectedUserId] });
      }
      // Auto scroll to bottom
      setTimeout(scrollToBottom, 100);
    };

    // Handler for message seen
    const handleMessageSeen = (event: any) => {
      console.log('👁️ Message seen:', event);
      // Update seen status in cache
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    };

    // Subscribe to WebSocket events
    ws.on('message:new', handleNewMessage);
    ws.on('message:seen', handleMessageSeen);

    // Cleanup on unmount
    return () => {
      ws.off('message:new', handleNewMessage);
      ws.off('message:seen', handleMessageSeen);
    };
  }, [selectedUserId, queryClient]);

  // Mark messages as seen when viewing conversation
  useEffect(() => {
    if (!selectedUserId || !conversation || conversation.length === 0) return;

    const ws = WebSocketService.getInstance();
    const unseenMessageIds = conversation
      .filter((msg: Message) => msg.senderId === selectedUserId && !msg.seen)
      .map((msg: Message) => msg.id);

    if (unseenMessageIds.length > 0) {
      ws.markMessagesAsSeen(selectedUserId, unseenMessageIds);
    }
  }, [selectedUserId, conversation]);

  const sendMutation = useMutation({
    mutationFn: messagesApi.sendMessage,
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      scrollToBottom();
    },
    onError: () => {
      toast.error('Không thể gửi tin nhắn');
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (conversation && conversation.length > 0) {
      scrollToBottom();
    }
  }, [conversation?.length]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedUserId) {
      sendMutation.mutate({
        receiver_id: selectedUserId,
        content: message.trim(),
      });
    }
  };

  const getConversations = () => {
    if (!inbox || inbox.length === 0) return [];
    const conversationsMap = new Map<number, Message>();
    inbox.forEach((msg: Message) => {
      const partnerId = msg.senderId === currentUser?.id ? msg.receiverId : msg.senderId;
      if (!conversationsMap.has(partnerId) || 
          new Date(msg.createdAt) > new Date(conversationsMap.get(partnerId)!.createdAt)) {
        conversationsMap.set(partnerId, msg);
      }
    });
    return Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const conversations = getConversations();

  const filteredConversations = conversations.filter((msg) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      msg.content?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="h-screen bg-[#121212] flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <div className={`w-full ${selectedUserId ? 'hidden md:block' : ''} md:w-96 bg-[#1e1e1e] border-r border-gray-800 flex flex-col overflow-hidden`}>
          <ConversationsHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <div className="flex-1 overflow-y-auto">
            {inboxLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FE2C55]"></div>
              </div>
            ) : (
              <ConversationsList
                conversations={filteredConversations}
                currentUserId={currentUser?.id}
                selectedUserId={selectedUserId}
                onSelectUser={setSelectedUserId}
              />
            )}
          </div>
        </div>
        <div className={`flex-1 ${!selectedUserId && 'hidden md:flex'} flex flex-col bg-[#121212]`}>
          {selectedUserId ? (
            <>
              <ChatHeader user={selectedUser} onBack={() => setSelectedUserId(null)} showBackButton={true} />
              <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                <MessagesList messages={conversation || []} currentUserId={currentUser?.id} loading={conversationLoading} messagesEndRef={messagesEndRef} />
              </div>
              <MessageInput value={message} onChange={setMessage} onSubmit={handleSendMessage} disabled={sendMutation.isPending} />
            </>
          ) : (
            <EmptyChatState />
          )}
        </div>
      </div>
    </div>
  );
}
