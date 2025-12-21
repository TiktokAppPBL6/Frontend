import { useEffect } from 'react';
import { notificationsApi } from '@/api/notifications.api';
import { useNotificationStore } from '@/app/store/notification';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { Bell, Heart, MessageCircle, UserPlus, AlertCircle, Ban, VideoOff, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

/**
 * Notifications Page - với WebSocket real-time
 */
export function Notifications() {
  const navigate = useNavigate();
  
  // Get notifications from Zustand store (real-time via WebSocket)
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const markAllAsSeen = useNotificationStore((state) => state.markAllAsSeen);
  const markAsSeen = useNotificationStore((state) => state.markAsSeen);
  const removeNotification = useNotificationStore((state) => state.removeNotification);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const isConnected = useNotificationStore((state) => state.isConnected);

  // Fetch notifications from backend when page loads
  useEffect(() => {
    console.log('🔍 Notifications page mounted');
    fetchNotifications();
  }, [fetchNotifications]);

  // Debug: Log notifications
  useEffect(() => {
    console.log('📋 Current notifications:', notifications.length);
  }, [notifications]);

  const handleMarkAllSeen = async () => {
    try {
      await notificationsApi.markAllAsSeen();
      markAllAsSeen();
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await notificationsApi.deleteNotification(id);
      removeNotification(id);
      toast.success('Đã xóa thông báo');
    } catch (error) {
      toast.error('Không thể xóa thông báo');
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Mark as seen when clicked
    if (!notification.seen) {
      markAsSeen([notification.id]);
    }
    
    // Navigate based on notification type
    if (notification.videoId) {
      navigate(`/video/${notification.videoId}`);
    } else if (notification.fromUserId) {
      navigate(`/profile/${notification.fromUserId}`);
    }
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
    // Parse backend message và format lại
    const content = notification.content || '';
    
    switch (notification.type) {
      case 'like':
        return 'đã thích video của bạn';
      case 'comment':
        // Extract comment text from "commented on your video: actual comment"
        const commentMatch = content.match(/commented on your video:\s*(.+)/i);
        if (commentMatch && commentMatch[1]) {
          return `đã bình luận video của bạn: ${commentMatch[1]}`;
        }
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
        return content || 'có hoạt động mới';
    }
  };

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Header - Sticky */}
      <div className="sticky top-0 z-10 bg-[#121212]/95 backdrop-blur-lg border-b border-gray-800">
        <div className="container mx-auto max-w-2xl px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Bell className="w-7 h-7 text-[#FE2C55]" />
                Thông báo
                {isConnected ? (
                  <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-500/10 px-2 py-1 rounded-full" title="Đang sử dụng REST API">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                    Offline
                  </span>
                )}
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  <span className="font-semibold text-[#FE2C55]">{unreadCount}</span> thông báo chưa đọc
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleMarkAllSeen}
                className="bg-[#FE2C55]/10 border-[#FE2C55]/30 text-[#FE2C55] hover:bg-[#FE2C55]/20 hover:border-[#FE2C55]/50 transition-all"
              >
                Đánh dấu đã đọc
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-2xl px-4 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-[#1e1e1e] border border-gray-800 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification, index) => (
              <div
                key={`${notification.id}-${index}`}
                className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  notification.seen 
                    ? 'bg-[#1e1e1e]/50 border-gray-800/50 hover:bg-[#1e1e1e] hover:border-gray-700' 
                    : 'bg-gradient-to-br from-[#2a2a2a] via-[#252525] to-[#1e1e1e] border-[#FE2C55]/30 hover:border-[#FE2C55]/50 shadow-lg shadow-[#FE2C55]/5'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Unread glow indicator */}
                {!notification.seen && (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#FE2C55] via-pink-500 to-pink-600 rounded-l-2xl"></div>
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#FE2C55] animate-ping"></div>
                  </>
                )}
                
                {/* Avatar với animation */}
                <div className="flex-shrink-0 relative">
                  {notification.fromUser?.avatarUrl ? (
                    <div className="relative">
                      {!notification.seen && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55] to-pink-500 rounded-full blur-md opacity-50 animate-pulse"></div>
                      )}
                      <img 
                        src={notification.fromUser.avatarUrl} 
                        alt={notification.fromUser.username}
                        className={`w-12 h-12 rounded-full object-cover relative ${
                          notification.seen 
                            ? 'ring-2 ring-gray-700' 
                            : 'ring-2 ring-[#FE2C55]/50'
                        }`}
                      />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center ${
                      notification.seen 
                        ? 'ring-2 ring-gray-700' 
                        : 'ring-2 ring-[#FE2C55]/50'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {notification.fromUser ? (
                      <span className="font-bold text-white hover:text-[#FE2C55] transition-colors">
                        @{notification.fromUser.username}
                      </span>
                    ) : (
                      <span className="font-bold text-white">Hệ thống</span>
                    )}{' '}
                    <span className="text-gray-400">
                      {getNotificationMessage(notification)}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-xs text-gray-500 font-medium">
                      {formatDate(notification.createdAt)}
                    </p>
                    {!notification.seen && (
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-[#FE2C55] text-white rounded-full animate-pulse">
                        MỚI
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification.id);
                    }}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-[#1e1e1e] to-[#252525] mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55]/20 to-pink-500/20 rounded-full blur-xl"></div>
              <Bell className="h-16 w-16 text-gray-600 relative" />
            </div>
            <h3 className="text-white text-3xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Chưa có thông báo
            </h3>
            <p className="text-gray-400 text-base max-w-md mx-auto leading-relaxed">
              Khi có người thích, bình luận hoặc theo dõi bạn,<br />
              các thông báo sẽ xuất hiện tại đây
            </p>
          </div>
        )}
      </div>
    </div>
  );
}