import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth';
import toast from 'react-hot-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check admin permission
  if (requireAdmin && user?.role !== 'admin') {
    toast.error('Bạn không có quyền truy cập trang này!');
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
