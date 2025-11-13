import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/api/notifications.api';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Bell } from 'lucide-react';

export function Notifications() {
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getNotifications,
  });

  const handleMarkAllSeen = () => {
    notificationsApi.markAllAsSeen();
  };

  return (
    <div className="min-h-screen bg-[#121212] py-6">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Thông báo</h1>
          {data && data.unseenCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMarkAllSeen}
              className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
            >
              Đánh dấu đã đọc
            </Button>
          )}
        </div>

        {isLoading ? (
          <p className="text-center py-8 text-gray-400">Đang tải...</p>
        ) : data?.notifications && data.notifications.length > 0 ? (
          <div className="space-y-2">
            {data.notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  notification.seen 
                    ? 'bg-[#1e1e1e] border-gray-800' 
                    : 'bg-[#2a2a2a] border-[#FE2C55]/30'
                }`}
              >
                <Avatar
                  src={notification.sender?.avatarUrl}
                  alt={notification.sender?.username}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300">
                    <span className="font-semibold text-white">@{notification.sender?.username}</span>{' '}
                    {notification.message}
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
