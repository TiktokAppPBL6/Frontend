import { useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from './providers/QueryProvider';
import { AppRoutes } from './routes';
import { useAuthStore } from './store/auth';
import { useNotificationStore } from './store/notification';
import { useMessageStore } from './store/message';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { WebSocketStatus } from '@/components/common/WebSocketStatus';

export default function App() {
  const { isAuthenticated, token, fetchMe } = useAuthStore();
  const connectNotificationWS = useNotificationStore((state) => state.connectWebSocket);
  const disconnectNotificationWS = useNotificationStore((state) => state.disconnectWebSocket);
  const connectMessageWS = useMessageStore((state) => state.connectWebSocket);
  const disconnectMessageWS = useMessageStore((state) => state.disconnectWebSocket);
  
  // Track if WebSocket is already connected to prevent duplicates
  const wsConnectedRef = useRef(false);

  // Debug localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('notification-storage');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        console.log('💾 App mount - localStorage notification-storage:', data);
      } catch (e) {
        console.error('❌ Failed to parse localStorage:', e);
      }
    } else {
      console.log('💾 App mount - No notifications in localStorage');
    }
  }, []);

  useEffect(() => {
    // Fetch user data if authenticated
    if (isAuthenticated) {
      fetchMe();
    }
  }, [isAuthenticated, fetchMe]);

  // Connect WebSocket when authenticated (only once)
  useEffect(() => {
    if (isAuthenticated && token && !wsConnectedRef.current) {
      console.log('🔌 Connecting to WebSocket...');
      wsConnectedRef.current = true;
      connectNotificationWS(token);
      connectMessageWS(token);
    } else if (!isAuthenticated && wsConnectedRef.current) {
      console.log('🔌 Disconnecting from WebSocket...');
      wsConnectedRef.current = false;
      disconnectNotificationWS();
      disconnectMessageWS();
    }

    // Cleanup on unmount
    return () => {
      if (wsConnectedRef.current) {
        wsConnectedRef.current = false;
        disconnectNotificationWS();
        disconnectMessageWS();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#00F2EA',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#FE2C55',
                secondary: '#fff',
              },
            },
          }}
        />
        
        {/* WebSocket Status Indicator - Only show in development */}
        {import.meta.env.DEV && isAuthenticated && <WebSocketStatus />}
      </QueryProvider>
    </ErrorBoundary>
  );
}
