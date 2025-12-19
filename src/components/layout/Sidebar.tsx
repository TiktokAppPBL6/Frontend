import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Upload,
  MessageSquare,
  Bell,
  User,
  Bookmark,
  Search,
  LogOut,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/app/store/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Sidebar() {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đã đăng xuất');
    navigate('/');
  };

  const menuItems = [
    { icon: Home, label: 'Dành cho bạn', path: '/home', exact: true },
    { icon: Users, label: 'Đang Follow', path: '/following' },
    { icon: Bookmark, label: 'Đã lưu', path: '/bookmarks' },
    { icon: Upload, label: 'Tải lên', path: '/upload' },
    { icon: MessageSquare, label: 'Tin nhắn', path: '/messages' },
    { icon: Bell, label: 'Thông báo', path: '/notifications' },
    { icon: User, label: 'Hồ sơ', path: `/user/${user?.id}` },
  ];

  // Admin menu
  const adminItems = user?.role === 'admin' ? [
    { icon: Shield, label: 'Admin Panel', path: '/admin', exact: true },
  ] : [];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#121212] border-r border-gray-800 z-40 hidden lg:block overflow-hidden">
      <div className="h-full flex flex-col px-4 py-5">
        {/* Logo */}
        <Link to="/home" className="flex items-center justify-center mb-8 flex-shrink-0 group px-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FE2C55] via-[#00F2EA] to-[#FE2C55] rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative bg-[#121212] rounded-2xl flex items-center justify-center px-6 py-3 border border-gray-800">
              <span className="text-2xl font-black bg-gradient-to-r from-[#FE2C55] via-[#FF6B9D] to-[#00F2EA] text-transparent bg-clip-text">
                Toptop
              </span>
            </div>
          </div>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4 flex-shrink-0 px-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm"
              className="w-full bg-[#1e1e1e] border border-gray-800 rounded-lg px-3 py-2 pl-9 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-700 transition-colors"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </form>

        {/* Menu Items */}
        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-4 px-3 py-3 rounded-lg transition-colors text-base',
                  active
                    ? 'bg-[#FE2C55]/10 text-[#FE2C55] font-semibold'
                    : 'text-gray-300 hover:bg-gray-800'
                )}
              >
                <Icon className="h-6 w-6 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          {/* Admin Menu */}
          {adminItems.length > 0 && (
            <>
              <div className="border-t border-gray-800 my-2"></div>
              {adminItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path, item.exact);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-4 px-3 py-3 rounded-lg transition-colors text-base',
                      active
                        ? 'bg-purple-500/10 text-purple-400 font-semibold'
                        : 'text-gray-300 hover:bg-gray-800'
                    )}
                  >
                    <Icon className="h-6 w-6 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
          
          {/* Đăng xuất trong menu */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-3 py-3 rounded-lg transition-colors text-base text-gray-300 hover:bg-gray-800 hover:text-red-500 w-full mt-3"
          >
            <LogOut className="h-6 w-6 flex-shrink-0" />
            <span>Đăng xuất</span>
          </button>
        </nav>
      </div>
    </aside>
  );
}
