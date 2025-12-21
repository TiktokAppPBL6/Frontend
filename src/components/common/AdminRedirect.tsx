import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth';

interface AdminRedirectProps {
  children: React.ReactNode;
}

/**
 * AdminRedirect - Redirect admin users to dashboard
 * Must check BEFORE rendering children to avoid hooks issues
 */
export function AdminRedirect({ children }: AdminRedirectProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Wait for auth to load
  if (!isAuthenticated) {
    return null; // Or loading spinner
  }

  // Redirect admin to dashboard BEFORE rendering children
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Only render children for non-admin users
  return <>{children}</>;
}
