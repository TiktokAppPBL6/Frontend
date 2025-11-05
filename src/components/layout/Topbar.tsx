import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, LogOut } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/app/store/auth';

export function Topbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      {/* Logo - Always visible on left */}
      <Link to="/home" className="fixed left-4 top-2 z-50 lg:left-6">
        <img src="/tiktok.png" alt="TikTok" className="h-10"  />
      </Link>

      <div className="h-full px-4 flex items-center justify-between lg:pl-64">
        {/* Spacer for logo on desktop */}
        <div className="w-32 lg:w-0"></div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-auto">
          <div className="relative w-full">
            <Input
              type="text"
              placeholder="Tìm kiếm video, người dùng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <Link to={`/user/${user?.id}`}>
            <Avatar src={user?.avatarUrl} alt={user?.username} size="md" />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="hidden md:flex"
            title="Đăng xuất"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-40 overflow-y-auto">
          <nav className="p-4">
            {/* Mobile menu items would go here */}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full justify-start gap-2"
            >
              <LogOut className="h-5 w-5" />
              Đăng xuất
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
