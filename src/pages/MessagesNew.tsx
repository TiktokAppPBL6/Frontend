import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { messagesApi } from '@/api/messages.api';
import { usersApi } from '@/api/users.api';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Search, MoreVertical, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/app/store/auth';
import type { Message } from '@/types';

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

  // Get inbox
  const { data: inbox, isLoading: inboxLoading } = useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: messagesApi.getInbox,
  });

  // Get conversation
  const { data: conversation, isLoading: conversationLoading } = useQuery({
    queryKey: ['messages', 'conversation', selectedUserId],
    queryFn: () => messagesApi.getConversation(selectedUserId!),
    enabled: !!selectedUserId,
  });

  // Get selected user info
  const { data: selectedUser } = useQuery({
    queryKey: ['user', selectedUserId],
    queryFn: () => usersApi.getUser(selectedUserId!),
    enabled: !!selectedUserId,
  });

  // Send message
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
    scrollToBottom();
  }, [conversation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedUserId) {
      sendMutation.mutate({
        receiverId: selectedUserId,
        content: message.trim(),
      });
    }
  };

  // Group inbox messages by conversation
  const getConversations = () => {
    if (!inbox) return [];
    
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

  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="container mx-auto max-w-7xl h-screen flex">
        {/* Sidebar - Conversations List */}
        <div className={`w-full ${selectedUserId ? 'hidden md:block' : ''} md:w-96 bg-[#1e1e1e] border-r border-gray-800 flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <h1 className="text-2xl font-bold text-white mb-4">Tin nhắn</h1>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[#121212] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {inboxLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FE2C55]"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                <Send className="w-16 h-16 mb-4" />
                <p className="text-center">Chưa có tin nhắn nào</p>
                <p className="text-sm text-center mt-2 text-gray-500">Bắt đầu trò chuyện với bạn bè</p>
              </div>
            ) : (
              conversations.map((msg) => {
                const partnerId = msg.senderId === currentUser?.id ? msg.receiverId : msg.senderId;
                const partnerInfo = msg.senderId === currentUser?.id ? msg.receiver : msg.sender;
                const isSelected = selectedUserId === partnerId;
                
                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedUserId(partnerId)}
                    className={`flex items-center gap-3 p-4 hover:bg-[#2a2a2a] cursor-pointer border-b border-gray-800 transition-colors ${
                      isSelected ? 'bg-[#2a2a2a]' : ''
                    }`}
                  >
                    <Avatar
                      src={partnerInfo?.avatarUrl}
                      alt={partnerInfo?.username}
                      size="md"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm truncate text-white">
                          {partnerInfo?.fullName || partnerInfo?.username}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(msg.createdAt), { 
                            addSuffix: true,
                            locale: vi 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {msg.senderId === currentUser?.id && 'Bạn: '}
                        {msg.content || '📷 Hình ảnh'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 ${!selectedUserId && 'hidden md:flex'} flex-col bg-[#121212]`}>
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#1e1e1e]">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-white hover:bg-[#2a2a2a]"
                    onClick={() => setSelectedUserId(null)}
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  
                  <Avatar
                    src={selectedUser?.avatarUrl}
                    alt={selectedUser?.username}
                    size="md"
                  />
                  
                  <div>
                    <h2 className="font-semibold text-white">{selectedUser?.fullName || selectedUser?.username}</h2>
                    <p className="text-sm text-gray-500">@{selectedUser?.username}</p>
                  </div>
                </div>
                
                <Button variant="ghost" size="icon" className="text-white hover:bg-[#2a2a2a]">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {conversationLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FE2C55]"></div>
                  </div>
                ) : !conversation || conversation.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Send className="w-16 h-16 mb-4" />
                    <p>Chưa có tin nhắn</p>
                    <p className="text-sm mt-2 text-gray-500">Gửi tin nhắn đầu tiên</p>
                  </div>
                ) : (
                  <>
                    {[...conversation].reverse().map((msg) => {
                      const isSender = msg.senderId === currentUser?.id;
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isSender && (
                            <Avatar
                              src={selectedUser?.avatarUrl}
                              alt={selectedUser?.username}
                              size="sm"
                            />
                          )}
                          
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isSender
                                ? 'bg-[#FE2C55] text-white rounded-br-none'
                                : 'bg-[#2a2a2a] text-white rounded-bl-none'
                            }`}
                          >
                            {msg.mediaUrl && (
                              <img
                                src={msg.mediaUrl}
                                alt="Media"
                                className="rounded-lg mb-2 max-w-full"
                              />
                            )}
                            {msg.content && <p className="text-sm">{msg.content}</p>}
                            <p className={`text-xs mt-1 ${isSender ? 'text-white/70' : 'text-gray-500'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          
                          {isSender && (
                            <Avatar
                              src={currentUser?.avatarUrl}
                              alt={currentUser?.username}
                              size="sm"
                            />
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-[#1e1e1e]">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  
                  <Input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 bg-[#121212] border-gray-700 text-white placeholder:text-gray-500"
                    disabled={sendMutation.isPending}
                  />
                  
                  <Button
                    type="submit"
                    disabled={!message.trim() || sendMutation.isPending}
                    className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Send className="w-24 h-24 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-white">Tin nhắn của bạn</h2>
              <p className="text-center max-w-sm text-gray-500">
                Chọn một cuộc trò chuyện hoặc bắt đầu cuộc trò chuyện mới
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
