import { Search, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/app/store/auth';
import { Avatar } from '@/components/common/Avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function AdminTopbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement admin search
      console.log('Search:', searchQuery);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search users, videos, reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:ring-purple-500/20"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          </div>
        </form>

        {/* Right Section */}
        <div className="flex items-center gap-4 ml-6">
          {/* User Menu */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-700/50">
            <Link to={`/user/${user?.id}`}>
              <Avatar src={user?.avatarUrl} alt={user?.username} size="md" />
            </Link>
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-white">{user?.username}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
