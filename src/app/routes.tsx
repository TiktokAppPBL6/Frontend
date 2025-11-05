import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { VideoSkeleton } from '@/components/ui/skeleton';

// Lazy load pages
const Intro = lazy(() => import('@/pages/Intro').then(m => ({ default: m.Intro })));
const Login = lazy(() => import('@/pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('@/pages/auth/Register').then(m => ({ default: m.Register })));
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const Following = lazy(() => import('@/pages/Following').then(m => ({ default: m.Following })));
const Upload = lazy(() => import('@/pages/Upload').then(m => ({ default: m.Upload })));
const Search = lazy(() => import('@/pages/Search').then(m => ({ default: m.Search })));
const Profile = lazy(() => import('@/pages/Profile').then(m => ({ default: m.Profile })));
const VideoDetail = lazy(() => import('@/pages/VideoDetail').then(m => ({ default: m.VideoDetail })));
const Messages = lazy(() => import('@/pages/Messages').then(m => ({ default: m.Messages })));
const Notifications = lazy(() => import('@/pages/Notifications').then(m => ({ default: m.Notifications })));
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen  flex items-center justify-center">
    <VideoSkeleton />
  </div>
);

// Layout wrapper for authenticated routes
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <Topbar />
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  );
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Intro />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <AuthGuard>
                <AppLayout>
                  <Home />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/following"
            element={
              <AuthGuard>
                <AppLayout>
                  <Following />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/upload"
            element={
              <AuthGuard>
                <AppLayout>
                  <Upload />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/search"
            element={
              <AuthGuard>
                <AppLayout>
                  <Search />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/user/:id"
            element={
              <AuthGuard>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/video/:id"
            element={
              <AuthGuard>
                <AppLayout>
                  <VideoDetail />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/messages"
            element={
              <AuthGuard>
                <AppLayout>
                  <Messages />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/messages/:userId"
            element={
              <AuthGuard>
                <AppLayout>
                  <Messages />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/notifications"
            element={
              <AuthGuard>
                <AppLayout>
                  <Notifications />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <AuthGuard>
                <AppLayout>
                  <Following />
                </AppLayout>
              </AuthGuard>
            }
          />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
