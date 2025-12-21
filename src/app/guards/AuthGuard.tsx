import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/app/store/auth';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  blockAdmin?: boolean; // NEW: Block admin from accessing this route
}

export function AuthGuard({ children, requireAdmin = false, blockAdmin = false }: AuthGuardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const hasShownToast = useRef(false);

  // Reset toast flag when location changes
  useEffect(() => {
    hasShownToast.current = false;
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Redirect admin away from user routes (like /home)
  if (blockAdmin && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Check admin permission
  if (requireAdmin && user?.role !== 'admin') {
    // Removed toast - just redirect silently
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
}
