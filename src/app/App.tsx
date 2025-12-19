import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from './providers/QueryProvider';
import { AppRoutes } from './routes';
import { useAuthStore } from './store/auth';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function App() {
  const { isAuthenticated, fetchMe } = useAuthStore();

  useEffect(() => {
    // Fetch user data if authenticated
    if (isAuthenticated) {
      fetchMe();
    }
  }, [isAuthenticated, fetchMe]);

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
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;
