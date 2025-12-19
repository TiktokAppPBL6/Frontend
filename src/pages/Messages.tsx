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

  const { data: inbox, isLoading: inboxLoading } = useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: messagesApi.getInbox,
    refetchInterval: 3000,
  });

  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ['messages', 'conversation', selectedUserId],
    queryFn: () => messagesApi.getConversation(selectedUserId!),
    enabled: !!selectedUserId,
    refetchInterval: selectedUserId ? 2000 : false,
  });

  const { data: selectedUser } = useQuery({
    queryKey: ['user', selectedUserId],
    queryFn: () => usersApi.getUser(selectedUserId!),
    enabled: !!selectedUserId,
  });

  const sendMutation = useMutation({
    mutationFn: messagesApi.sendMessage,
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      scrollToBottom();
    },
    onError: () => {
      toast.error('Kh�ng th? g?i tin nh?n');
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
