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
    <div className="min-h-screen bg-white pt-20 pb-8">
      <div className="container mx-auto max-w-2xl px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Thông báo</h1>
          {data && data.unseenCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllSeen}>
              Đánh dấu đã đọc
            </Button>
          )}
        </div>

        {isLoading ? (
          <p className="text-center py-8">Đang tải...</p>
        ) : data?.notifications && data.notifications.length > 0 ? (
          <div className="space-y-2">
            {data.notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg ${
                  notification.seen ? 'bg-white' : 'bg-blue-50'
                }`}
              >
                <Avatar
                  src={notification.sender?.avatarUrl}
                  alt={notification.sender?.username}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-semibold">@{notification.sender?.username}</span>{' '}
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                {!notification.seen && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Chưa có thông báo nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
