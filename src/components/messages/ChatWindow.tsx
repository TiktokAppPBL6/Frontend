/**
 * Chat Window Component - TikTok Style
 * Real-time messaging với typing indicators, read receipts, online status
 */
import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Image, MoreVertical, Phone, Video as VideoIcon, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/app/store/auth';
import { useMessageStore, type Message } from '@/app/store/message';
import { messagesApi, type Message as APIMessage } from '@/api/messages.api';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/common/Avatar';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import wsService from '@/services/websocket.service';

interface ChatUser {
  id: number;
  username: string;
  fullName?: string;
  avatar?: string;
  isOnline?: boolean;
  bio?: string;
}

interface ChatWindowProps {
  user: ChatUser;
  onBack?: () => void;
}

export function ChatWindow({ user, onBack }: ChatWindowProps) {
  const currentUser = useAuthStore((state) => state.user);
  
  // Use Zustand store for realtime updates
  const storeMessages = useMessageStore((state) => state.messages[user.id] || []);
  const setStoreMessages = useMessageStore((state) => state.setMessages);
  const typingUsers = useMessageStore((state) => state.typingUsers);
  
  console.log('🔄 ChatWindow render - Messages count:', storeMessages.length, 'for user:', user.id);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();
  const hasLoadedRef = useRef(false); // Prevent duplicate API calls
  
  // Partner typing status from store
  const partnerTyping = typingUsers.has(user.id);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [storeMessages, partnerTyping]);

  // Load messages into store (only once per user.id)
  useEffect(() => {
    console.log('🔄 ChatWindow useEffect triggered for user:', user.id, 'hasLoadedRef:', hasLoadedRef.current);
    
    // Reset hasLoaded flag when user changes
    hasLoadedRef.current = false;
    
    let isMounted = true;
    
    const loadMessages = async () => {
      // Prevent duplicate calls
      if (hasLoadedRef.current) {
        console.log('⚠️ Messages already loaded, skipping...');
        return;
      }
      
      hasLoadedRef.current = true;
      
      try {
        const data: APIMessage[] = await messagesApi.getConversation(user.id);
        
        if (!isMounted) return; // Prevent state update if unmounted
        
        console.log('📥 Loaded messages from API:', data?.length, 'messages');
        
        if (data && data.length > 0) {
          console.log('🔍 Sample message with sender:', {
            id: data[0].id,
            senderId: data[0].senderId,
            hasSender: !!data[0].sender,
            senderAvatar: data[0].sender?.avatarUrl,
            hasReceiver: !!data[0].receiver,
            receiverAvatar: data[0].receiver?.avatarUrl
          });
        }
        
        // Backend already returns messages in correct order (oldest first)
        // Convert API messages to store format - PRESERVE sender/receiver!
        const storeFormatMessages: Message[] = (data || []).map((msg: APIMessage) => ({
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
        
        // Save to Zustand store for realtime sync
        setStoreMessages(user.id, storeFormatMessages);
        // Mark conversation as read when opening
        markAsRead();
      } catch (error) {
        console.error('Error loading messages:', error);
        hasLoadedRef.current = false; // Reset on error so it can retry
      }
    };
    
    loadMessages();
    
    return () => {
      isMounted = false;
    };
    // Only depend on user.id - setStoreMessages is stable from Zustand
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  // Send typing indicator
  const sendTypingIndicator = () => {
    if (!isTyping) {
      setIsTyping(true);
      wsService.send({
        type: 'typing',
        receiver_id: user.id,
        is_typing: true,
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      wsService.send({
        type: 'typing',
        receiver_id: user.id,
        is_typing: false,
      });
    }, 2000);
  };

  // Mark messages as read
  const markAsRead = async () => {
    try {
      await messagesApi.markAsRead(user.id);
      // Update store messages as read
      const updatedMessages = storeMessages.map((msg) =>
        msg.senderId === user.id ? { ...msg, status: 'read' as const } : msg
      );
      setStoreMessages(user.id, updatedMessages);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      messagesApi.sendMessage({ receiver_id: user.id, content }),
    onSuccess: () => {
      // Store will update via WebSocket, just invalidate queries
      queryClient.invalidateQueries({ queryKey: ['messages', 'inbox'] });
      scrollToBottom();
    },
    onError: (error: any) => {
      // Handle follow relationship error
      if (error.response?.status === 403) {
        toast.error('Bạn cần theo dõi người này để gửi tin nhắn', {
          duration: 4000,
          icon: '🔒',
        });
      } else {
        toast.error('Không thể gửi tin nhắn');
      }
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const content = inputMessage.trim();
    setInputMessage('');
    setIsTyping(false);

    // Stop typing indicator
    wsService.send({
      type: 'typing',
      receiver_id: user.id,
      is_typing: false,
    });

    // Send message
    sendMessageMutation.mutate(content);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          <div className="relative">
            <Avatar src={user.avatar} alt={user.username} size="md" />
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {user.fullName || user.username}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.isOnline ? 'Đang hoạt động' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <VideoIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {storeMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <p>Chưa có tin nhắn nào</p>
            <p className="text-sm mt-1">Gửi tin nhắn đầu tiên cho {user.username}!</p>
          </div>
        ) : (
          storeMessages.map((message, index) => {
            console.log(`📩 Rendering message ${message.id}:`, {
              senderId: message.senderId,
              hasSender: !!message.sender,
              senderData: message.sender,
              hasReceiver: !!message.receiver,
              receiverData: message.receiver
            });
            
            const isOwn = message.senderId === currentUser?.id;
            const showAvatar =
              index === storeMessages.length - 1 ||
              storeMessages[index + 1]?.senderId !== message.senderId;
            
            // Determine avatar and name based on message sender data
            // Always use message.sender data if available (from API)
            let displayAvatar: string;
            let displayName: string;
            
            if (message.sender) {
              // Use sender info from message (API data)
              displayAvatar = message.sender.avatarUrl || '/avatar.jpg';
              displayName = message.sender.username;
              
              if (index === 0) {
                console.log('🎨 Avatar from message.sender:', {
                  messageId: message.id,
                  senderId: message.senderId,
                  senderAvatar: message.sender.avatarUrl,
                  displayAvatar
                });
              }
            } else {
              // Fallback: determine from senderId
              if (isOwn) {
                displayAvatar = currentUser?.avatarUrl || '/avatar.jpg';
                displayName = currentUser?.username || 'You';
              } else {
                displayAvatar = user.avatar || '/avatar.jpg';
                displayName = user.username;
              }
              
              if (index === 0) {
                console.log('⚠️ No message.sender, using fallback:', {
                  messageId: message.id,
                  senderId: message.senderId,
                  isOwn,
                  displayAvatar
                });
              }
            }

            return (
              <div
                key={message.id}
                className={cn('flex items-end gap-2', isOwn && 'flex-row-reverse')}
              >
                {/* Avatar */}
                {!isOwn && showAvatar ? (
                  <Avatar src={displayAvatar} alt={displayName} size="sm" />
                ) : !isOwn ? (
                  <div className="w-8"></div>
                ) : null}

                {/* Message Bubble */}
                <div
                  className={cn(
                    'max-w-[70%] px-4 py-2 rounded-2xl',
                    isOwn
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                  )}
                >
                  <p className="text-sm break-words">{message.content}</p>
                  <div
                    className={cn(
                      'flex items-center gap-1 mt-1 text-xs',
                      isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    <span>
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                    {isOwn && (
                      <span>{message.status === 'read' ? '✓✓' : '✓'}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {partnerTyping && (
          <div className="flex items-end gap-2">
            <Avatar 
              src={storeMessages.find(m => m.senderId === user.id)?.sender?.avatarUrl || user.avatar} 
              alt={user.username} 
              size="sm" 
            />
            <div className="bg-gray-200 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <Image className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            type="button"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              sendTypingIndicator();
            }}
            placeholder="Aa"
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || sendMessageMutation.isPending}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
