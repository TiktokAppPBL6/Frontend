import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Video,
  AlertTriangle,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', exact: true },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Video, label: 'Videos', path: '/admin/videos' },
  { icon: AlertTriangle, label: 'Reports', path: '/admin/reports' },
];

export function AdminSidebar() {
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 z-40">
      <div className="h-full flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700/50 px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-lg blur opacity-75"></div>
              <div className="relative bg-slate-900 rounded-lg p-2">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-xs text-slate-400">Toptop Management</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden',
                  active
                    ? 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 text-white shadow-lg shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                )}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 animate-pulse"></div>
                )}
                <Icon className={cn(
                  'h-5 w-5 relative z-10 transition-transform duration-300',
                  active ? 'text-purple-400 scale-110' : 'group-hover:scale-110'
                )} />
                <span className={cn(
                  'font-medium relative z-10',
                  active && 'font-bold'
                )}>{item.label}</span>
                {active && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500 rounded-l-full"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
