/**
 * WebSocket Connection Status Indicator
 * Shows connection state with modern UI
 */
import { useState, useEffect } from 'react';
import { wsService, ConnectionState } from '@/services/websocket.service';
import { WifiOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WebSocketStatus() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(wsService.getState());

  useEffect(() => {
    // Subscribe to connection state changes
    const unsubscribe = wsService.onStateChange((state) => {
      setConnectionState(state);
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  // Don't show anything when connected
  if (connectionState === ConnectionState.CONNECTED) {
    return null;
  }

  // Show status for other states
  const getStatusInfo = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTING:
        return {
          icon: Loader2,
          text: 'Đang kết nối...',
          className: 'bg-yellow-500/90 text-white',
          iconClassName: 'animate-spin',
        };
      case ConnectionState.RECONNECTING:
        return {
          icon: Loader2,
          text: 'Đang kết nối lại...',
          className: 'bg-orange-500/90 text-white',
          iconClassName: 'animate-spin',
        };
      case ConnectionState.DISCONNECTED:
        return {
          icon: WifiOff,
          text: 'Mất kết nối',
          className: 'bg-gray-500/90 text-white',
          iconClassName: '',
        };
      case ConnectionState.ERROR:
        return {
          icon: WifiOff,
          text: 'Lỗi kết nối',
          className: 'bg-red-500/90 text-white',
          iconClassName: '',
        };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo();

  if (!statusInfo) {
    return null;
  }

  const Icon = statusInfo.icon;

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300',
        statusInfo.className
      )}
    >
      <Icon className={cn('w-4 h-4', statusInfo.iconClassName)} />
      <span className="text-sm font-medium">{statusInfo.text}</span>
    </div>
  );
}

