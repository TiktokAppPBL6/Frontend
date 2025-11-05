import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Upload,
  MessageSquare,
  Bell,
  User,
  Bookmark,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/app/store/auth';

export function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const menuItems = [
    { icon: Home, label: 'Dành cho bạn', path: '/home', exact: true },
    { icon: Users, label: 'Đang Follow', path: '/following' },
    { icon: Bookmark, label: 'Đã lưu', path: '/bookmarks' },
    { icon: Upload, label: 'Tải lên', path: '/upload' },
    { icon: MessageSquare, label: 'Tin nhắn', path: '/messages' },
    { icon: Bell, label: 'Thông báo', path: '/notifications' },
    { icon: User, label: 'Hồ sơ', path: `/user/${user?.id}` },
    { icon: Settings, label: 'Cài đặt', path: '/settings' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 overflow-y-auto z-40 hidden lg:block">
      <div className="p-4">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FE2C55] to-[#00F2EA] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#FE2C55] to-[#00F2EA] bg-clip-text text-transparent">
            TikTok
          </span>
        </Link>

        {/* Menu Items */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  active
                    ? 'bg-[#FE2C55]/10 text-[#FE2C55] font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-6 w-6" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        {user && (
          <div className="mt-8 p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <img
                src={user.avatarUrl || 'https://i.pravatar.cc/150'}
                alt={user.username}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user.fullName || user.username}</p>
                <p className="text-xs text-gray-500 truncate">@{user.username}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
