import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { messagesApi } from '@/api/messages.api';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export function Messages() {
  const { userId } = useParams<{ userId?: string }>();
  const [message, setMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    userId ? parseInt(userId) : null
  );
  const queryClient = useQueryClient();

  // Get inbox
  const { data: inboxData, isLoading: inboxLoading } = useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: messagesApi.getInbox,
  });

  // Get conversation
  const { data: conversationData } = useQuery({
    queryKey: ['messages', 'conversation', selectedUserId],
    queryFn: () => messagesApi.getConversation(selectedUserId!),
    enabled: !!selectedUserId,
  });

  const sendMutation = useMutation({
    mutationFn: messagesApi.sendMessage,
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: () => {
      toast.error('Không thể gửi tin nhắn');
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && selectedUserId) {
      sendMutation.mutate({
        receiverId: selectedUserId,
        content: message.trim(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="container mx-auto max-w-6xl h-[calc(100vh-4rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Conversations List */}
          <div className="md:col-span-1 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold">Tin nhắn</h2>
            </div>

            {inboxLoading ? (
              <p className="p-4 text-center text-gray-500">Đang tải...</p>
            ) : inboxData?.conversations && inboxData.conversations.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {inboxData.conversations.map((conv) => (
                  <button
                    key={conv.user.id}
                    onClick={() => setSelectedUserId(conv.user.id)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                      selectedUserId === conv.user.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar src={conv.user.avatarUrl} alt={conv.user.username} size="md" />
                      {conv.unseenCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                          {conv.unseenCount}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold truncate">
                        {conv.user.fullName || conv.user.username}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.lastMessage?.content || 'Chưa có tin nhắn'}
                      </p>
                    </div>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-400">
                        {formatDate(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Chưa có tin nhắn nào</p>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 flex flex-col">
            {selectedUserId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <Avatar
                    src={
                      inboxData?.conversations.find((c) => c.user.id === selectedUserId)?.user
                        .avatarUrl
                    }
                    alt="User"
                    size="md"
                  />
                  <div>
                    <p className="font-semibold">
                      {inboxData?.conversations.find((c) => c.user.id === selectedUserId)?.user
                        .fullName ||
                        inboxData?.conversations.find((c) => c.user.id === selectedUserId)?.user
                          .username}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {conversationData?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === selectedUserId ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg ${
                          msg.senderId === selectedUserId
                            ? 'bg-gray-200 text-gray-900'
                            : 'bg-[#FE2C55] text-white'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.senderId === selectedUserId ? 'text-gray-500' : 'text-white/70'
                          }`}
                        >
                          {formatDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1"
                    disabled={sendMutation.isPending}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!message.trim() || sendMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Chọn một cuộc trò chuyện để bắt đầu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
