import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications.api';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export function Notifications() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(),
    refetchInterval: 5000, // Auto refresh every 5 seconds
  });

  const { data: unseenCount } = useQuery({
    queryKey: ['notifications-unseen-count'],
    queryFn: notificationsApi.getUnseenCount,
    refetchInterval: 5000,
  });

  const markAllSeenMutation = useMutation({
    mutationFn: notificationsApi.markAllAsSeen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unseen-count'] });
      toast.success('Đã đánh dấu tất cả là đã đọc');
    },
  });

  const handleMarkAllSeen = () => {
    markAllSeenMutation.mutate();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationMessage = (notification: any) => {
    switch (notification.type) {
      case 'like':
        return 'đã thích video của bạn';
      case 'comment':
        return 'đã bình luận về video của bạn';
      case 'follow':
        return 'đã theo dõi bạn';
      default:
        return 'có hoạt động mới';
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] py-6">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Thông báo</h1>
            {unseenCount !== undefined && unseenCount > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                {unseenCount} thông báo chưa đọc
              </p>
            )}
          </div>
          {unseenCount !== undefined && unseenCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMarkAllSeen}
              disabled={markAllSeenMutation.isPending}
              className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FE2C55]"></div>
          </div>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                  notification.seen 
                    ? 'bg-[#1e1e1e] border-gray-800' 
                    : 'bg-[#2a2a2a] border-[#FE2C55]/30'
                }`}
              >
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">Người dùng #{notification.userId}</span>{' '}
                    {getNotificationMessage(notification)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                {!notification.seen && (
                  <div className="w-2 h-2 bg-[#FE2C55] rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-[#1e1e1e] mb-8">
              <Bell className="h-14 w-14 text-gray-600" />
            </div>
            <h3 className="text-white text-2xl font-bold mb-3">Chưa có thông báo</h3>
            <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
              Khi ai đó thích, bình luận hoặc theo dõi bạn,<br />
              bạn sẽ nhận được thông báo ở đây
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
