import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { messagesApi, type ConversationItem, type APIMessage } from '@/api/messages.api';
import { usersApi } from '@/api/users.api';
import type { Message } from '@/app/store/message';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/app/store/auth';
import { useMessageStore } from '@/app/store/message';
import { ConversationsHeader } from '@/components/messages/ConversationsHeader';
import { ConversationsList } from '@/components/messages/ConversationsList';
import { ChatHeader } from '@/components/messages/ChatHeader';
import { MessagesList } from '@/components/messages/MessagesList';
import { MessageInput } from '@/components/messages/MessageInput';
import { EmptyChatState } from '@/components/messages/EmptyChatState';
import wsService from '@/services/websocket.service';

/**
 * Messages Page - WebSocket Integration với Zustand Store
 */
export function Messages() {
  const { userId } = useParams<{ userId?: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Get data from Zustand store (real-time via WebSocket)
  const conversations = useMessageStore((state) => state.conversations);
  const messages = useMessageStore((state) => state.messages);
  const setActiveConversation = useMessageStore((state) => state.setActiveConversation);
  const setMessages = useMessageStore((state) => state.setMessages);
  const setConversations = useMessageStore((state) => state.setConversations);
  const typingUsers = useMessageStore((state) => state.typingUsers);
  const isConnected = useMessageStore((state) => state.isConnected);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    userId ? parseInt(userId) : null
  );

  // Fetch initial inbox from API - returns ConversationItem[] (optimized)
  const { data: inbox, isLoading: inboxLoading } = useQuery<ConversationItem[]>({
    queryKey: ['messages', 'inbox'],
    queryFn: messagesApi.getInbox,
  });

  // Fetch conversation messages from API - returns APIMessage[] with sender/receiver
  const { data: conversation, isLoading: conversationLoading } = useQuery<APIMessage[]>({
    queryKey: ['messages', 'conversation', selectedUserId],
    queryFn: () => messagesApi.getConversation(selectedUserId!) as Promise<APIMessage[]>,
    enabled: !!selectedUserId,
  });

  const { data: selectedUser } = useQuery({
    queryKey: ['user', selectedUserId],
    queryFn: () => usersApi.getUser(selectedUserId!),
    enabled: !!selectedUserId,
  });

  // Sync API inbox to store conversations - inbox is already optimized ConversationItem[]
  useEffect(() => {
    if (inbox && inbox.length > 0) {
      const formattedConversations = inbox.map((conv: ConversationItem) => ({
        userId: conv.userId,
        username: conv.username,
        avatarUrl: conv.avatarUrl,
        fullName: conv.fullName,
        lastMessage: {
          id: conv.lastMessage.id,
          senderId: conv.lastMessage.senderId,
          receiverId: conv.lastMessage.receiverId,
          content: conv.lastMessage.content,
          status: (conv.lastMessage.seen ? 'read' : 'delivered') as 'delivered' | 'read' | 'deleted',
          createdAt: conv.lastMessage.createdAt,
        },
        unreadCount: conv.unreadCount,
      }));
      setConversations(formattedConversations);
    }
  }, [inbox, setConversations]);

  // Sync API conversation to store messages - PRESERVE sender/receiver!
  useEffect(() => {
    if (selectedUserId && conversation) {
      console.log('📥 Messages.tsx: Converting API messages to store format');
      
      const storeFormatMessages: Message[] = conversation.map((msg: APIMessage) => ({
        id: msg.id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        mediaUrl: msg.mediaUrl,
        status: (msg.seen ? 'read' : 'delivered') as 'delivered' | 'read' | 'deleted',
        createdAt: msg.createdAt,
        sender: msg.sender ? {
          id: msg.sender.id,
          username: msg.sender.username,
          fullName: msg.sender.fullName,
          avatarUrl: msg.sender.avatarUrl,
        } : undefined,
        receiver: msg.receiver ? {
          id: msg.receiver.id,
          username: msg.receiver.username,
          fullName: msg.receiver.fullName,
          avatarUrl: msg.receiver.avatarUrl,
        } : undefined,
      }));
      
      console.log('💾 Messages.tsx: Converted', storeFormatMessages.length, 'messages');
      console.log('🔍 Sample messages with sender/receiver:', 
        storeFormatMessages.slice(0, 3).map(m => ({
          id: m.id,
          senderId: m.senderId,
          receiverId: m.receiverId,
          hasSender: !!m.sender,
          senderAvatar: m.sender?.avatarUrl,
          hasReceiver: !!m.receiver,
          receiverAvatar: m.receiver?.avatarUrl,
        }))
      );
      setMessages(selectedUserId, storeFormatMessages);
    }
  }, [selectedUserId, conversation, setMessages]);

  // Update active conversation
  useEffect(() => {
    if (selectedUserId) {
      setActiveConversation(selectedUserId);
    }
  }, [selectedUserId, setActiveConversation]);

  // Update active conversation
  useEffect(() => {
    if (selectedUserId) {
      setActiveConversation(selectedUserId);
    }
  }, [selectedUserId, setActiveConversation]);

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

  // Auto scroll when messages change
  useEffect(() => {
    const currentMessages = selectedUserId ? messages[selectedUserId] : [];
    if (currentMessages && currentMessages.length > 0) {
      scrollToBottom();
    }
  }, [selectedUserId, messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedUserId) {
      // Send typing indicator stop
      wsService.sendTypingIndicator(selectedUserId, false);
      
      sendMutation.mutate({
        receiver_id: selectedUserId,
        content: message.trim(),
      });
    }
  };

  const handleTyping = () => {
    if (selectedUserId) {
      wsService.sendTypingIndicator(selectedUserId, true);
      
      // Auto-stop after 3 seconds
      setTimeout(() => {
        wsService.sendTypingIndicator(selectedUserId, false);
      }, 3000);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      conv.username?.toLowerCase().includes(searchLower) ||
      conv.fullName?.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  const currentMessages = selectedUserId ? messages[selectedUserId] || [] : [];
  const isUserTyping = selectedUserId ? typingUsers.has(selectedUserId) : false;

  return (
    <div className="h-screen bg-[#121212] flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        <div className={`w-full ${selectedUserId ? 'hidden md:block' : ''} md:w-96 bg-[#1e1e1e] border-r border-gray-800 flex flex-col overflow-hidden`}>
          <ConversationsHeader 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery}
            isConnected={isConnected}
          />
          <div className="flex-1 overflow-y-auto">
            {inboxLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FE2C55]"></div>
              </div>
            ) : filteredConversations.length > 0 ? (
              <ConversationsList
                conversations={filteredConversations}
                currentUserId={currentUser?.id}
                selectedUserId={selectedUserId}
                onSelectUser={setSelectedUserId}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <p className="text-gray-400">Chưa có cuộc trò chuyện nào</p>
              </div>
            )}
          </div>
        </div>
        <div className={`flex-1 ${!selectedUserId && 'hidden md:flex'} flex flex-col bg-[#121212]`}>
          {selectedUserId ? (
            <>
              <ChatHeader 
                user={selectedUser} 
                onBack={() => setSelectedUserId(null)} 
                showBackButton={true}
                isTyping={isUserTyping}
              />
              <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
                <MessagesList 
                  messages={currentMessages} 
                  currentUserId={currentUser?.id} 
                  loading={conversationLoading} 
                  messagesEndRef={messagesEndRef} 
                />
              </div>
              <MessageInput 
                value={message} 
                onChange={(val) => {
                  setMessage(val);
                  handleTyping();
                }} 
                onSubmit={handleSendMessage} 
                disabled={sendMutation.isPending} 
              />
            </>
          ) : (
            <EmptyChatState />
          )}
        </div>
      </div>
    </div>
  );
}
