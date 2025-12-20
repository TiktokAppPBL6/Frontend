import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { notificationsApi } from '@/api/notifications.api';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Bell, Heart, MessageCircle, UserPlus, AlertCircle, Ban, VideoOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { WebSocketService } from '@/services/websocket';

/**
 * Notifications Page - WebSocket Integration theo BACKEND_IMPLEMENTATION_GUIDE.md
 * - Subscribe to "notification:new" event
 * - Subscribe to "notification:unseen_count" event
 * - Subscribe to admin events: "admin:user_banned", "admin:video_deleted", "admin:report_resolved"
 * - Call markNotificationsAsSeen when opening page
 */
export function Notifications() {
  const queryClient = useQueryClient();

  // Query notifications (no polling - use WebSocket)
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(),
    // Removed refetchInterval - use WebSocket instead
  });

  // Query unseen count (no polling - use WebSocket)
  const { data: unseenCount } = useQuery({
    queryKey: ['notifications-unseen-count'],
    queryFn: notificationsApi.getUnseenCount,
    // Removed refetchInterval - use WebSocket instead
  });

  // WebSocket Integration - Subscribe to events
  useEffect(() => {
    const ws = WebSocketService.getInstance();

    // Handler for new notification
    const handleNewNotification = (event: any) => {
      console.log('🔔 New notification:', event);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unseen-count'] });
      // Show toast
      toast.success(`Thông báo mới: ${event.data.message || 'Bạn có thông báo mới'}`);
    };

    // Handler for unseen count update
    const handleUnseenCount = (event: any) => {
      console.log('📊 Unseen count update:', event);
      queryClient.setQueryData(['notifications-unseen-count'], event.data.count);
    };

    // Handler for admin events
    const handleUserBanned = (event: any) => {
      console.log('🚫 User banned:', event);
      toast.error(
        <div className="flex items-center gap-2">
          <Ban className="w-5 h-5" />
          <div>
            <div className="font-semibold">Tài khoản bị khóa</div>
            <div className="text-sm">{event.data.reason || 'Vi phạm chính sách'}</div>
          </div>
        </div>,
        { duration: 10000 }
      );
      // Refresh notifications
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleVideoDeleted = (event: any) => {
      console.log('🗑️ Video deleted:', event);
      toast.error(
        <div className="flex items-center gap-2">
          <VideoOff className="w-5 h-5" />
          <div>
            <div className="font-semibold">Video bị xóa</div>
            <div className="text-sm">{event.data.reason || 'Vi phạm nội dung'}</div>
          </div>
        </div>,
        { duration: 10000 }
      );
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    const handleReportResolved = (event: any) => {
      console.log('✅ Report resolved:', event);
      toast.success(
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <div>
            <div className="font-semibold">Báo cáo đã xử lý</div>
            <div className="text-sm">{event.data.result || 'Đã giải quyết'}</div>
          </div>
        </div>,
        { duration: 10000 }
      );
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    // Subscribe to WebSocket events
    ws.on('notification:new', handleNewNotification);
    ws.on('notification:unseen_count', handleUnseenCount);
    ws.on('admin:user_banned', handleUserBanned);
    ws.on('admin:video_deleted', handleVideoDeleted);
    ws.on('admin:report_resolved', handleReportResolved);

    // Cleanup on unmount
    return () => {
      ws.off('notification:new', handleNewNotification);
      ws.off('notification:unseen_count', handleUnseenCount);
      ws.off('admin:user_banned', handleUserBanned);
      ws.off('admin:video_deleted', handleVideoDeleted);
      ws.off('admin:report_resolved', handleReportResolved);
    };
  }, [queryClient]);

  // Mark all as seen when opening page
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const ws = WebSocketService.getInstance();
    const unseenIds = notifications
      .filter((notif: any) => !notif.is_read)
      .map((notif: any) => notif.id);

    if (unseenIds.length > 0) {
      ws.markNotificationsAsSeen(unseenIds);
    }
  }, [notifications]);

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
      case 'admin_ban':
        return <Ban className="w-5 h-5 text-red-600" />;
      case 'admin_delete':
        return <VideoOff className="w-5 h-5 text-red-600" />;
      case 'admin_resolve':
        return <AlertCircle className="w-5 h-5 text-green-600" />;
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
      case 'admin_ban':
        return 'đã khóa tài khoản của bạn';
      case 'admin_delete':
        return 'đã xóa video của bạn';
      case 'admin_resolve':
        return 'đã xử lý báo cáo của bạn';
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
