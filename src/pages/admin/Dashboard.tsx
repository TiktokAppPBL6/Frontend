import { useQuery } from '@tanstack/react-query';
import { adminApi, videosApi } from '@/api';
import { Users, Video, AlertTriangle, TrendingUp, Eye, ArrowUp, ArrowDown, Activity, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export function AdminDashboard() {
  // Fetch statistics from analytics API
  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics-overview'],
    queryFn: () => adminApi.getAnalyticsOverview(),
  });

  const { data: videosRecent } = useQuery({
    queryKey: ['videos-recent'],
    queryFn: () => videosApi.getVideos({ page: 1, pageSize: 5 }),
  });

  // Mock data for charts - 7 days
  const usersChartData = [
    { day: 'T2', value: 245 },
    { day: 'T3', value: 278 },
    { day: 'T4', value: 295 },
    { day: 'T5', value: 312 },
    { day: 'T6', value: 348 },
    { day: 'T7', value: 389 },
    { day: 'CN', value: 425 },
  ];

  const videosChartData = [
    { day: 'T2', value: 82 },
    { day: 'T3', value: 95 },
    { day: 'T4', value: 108 },
    { day: 'T5', value: 125 },
    { day: 'T6', value: 142 },
    { day: 'T7', value: 158 },
    { day: 'CN', value: 176 },
  ];

  const reportsChartData = [
    { day: 'T2', value: 28 },
    { day: 'T3', value: 35 },
    { day: 'T4', value: 32 },
    { day: 'T5', value: 29 },
    { day: 'T6', value: 26 },
    { day: 'T7', value: 24 },
    { day: 'CN', value: 21 },
  ];

  const stats = [
    {
      title: 'Tổng Users',
      value: analyticsData?.users.total || 0,
      icon: Users,
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      color: '#3b82f6',
      link: '/admin/users',
      trend: '+12%',
      trendUp: true,
      chartData: usersChartData,
    },
    {
      title: 'Tổng Videos',
      value: analyticsData?.videos.total || 0,
      icon: Video,
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
      color: '#a855f7',
      link: '/admin/videos',
      trend: '+8%',
      trendUp: true,
      chartData: videosChartData,
    },
    {
      title: 'Reports Chờ',
      value: analyticsData?.reports.pending || 0,
      icon: AlertTriangle,
      gradient: 'from-red-500 via-orange-500 to-red-600',
      color: '#ef4444',
      link: '/admin/reports',
      trend: '-5%',
      trendUp: false,
      chartData: reportsChartData,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] text-white p-6">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with glassmorphism */}
        <div className="mb-8 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 border border-white/20 shadow-2xl shadow-purple-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-300 flex items-center gap-2 text-base">
                <Activity className="w-4 h-4 text-blue-400" />
                Quản lý và giám sát hệ thống Toptop
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/"
                className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 hover:border-blue-400/50 rounded-xl transition-all duration-300 hover:scale-105"
              >
                <Home className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <span className="text-sm font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Về Trang Chủ
                </span>
              </Link>
              <div className="text-right bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Hôm nay</p>
                <p className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {new Date().toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards with Integrated Mini Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trendUp ? ArrowUp : ArrowDown;
            return (
              <Link
                key={index}
                to={stat.link}
                className="group relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/20 hover:border-white/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
              >
                {/* Gradient glow on hover */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${stat.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                <div className="relative z-10 p-6">
                  {/* Header: Icon, Title, Trend */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-lg`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider">{stat.title}</h3>
                        <p className="text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mt-1">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                      stat.trendUp 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      <TrendIcon className="w-3 h-3" />
                      {stat.trend}
                    </div>
                  </div>

                  {/* Mini Chart */}
                  <div className="mt-4 h-24 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stat.chartData}>
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={stat.color} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={stat.color} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke={stat.color} 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill={`url(#gradient-${index})`}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 7 days label */}
                  <p className="text-xs text-gray-500 mt-2 text-right">7 ngày qua</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Videos with enhanced design */}
        <div className="backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1.5 bg-gradient-to-b from-purple-400 via-pink-400 to-purple-500 rounded-full" />
              <h2 className="text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Videos Mới Nhất
              </h2>
            </div>
            <Link 
              to="/admin/videos" 
              className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 hover:border-blue-400/50 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <span className="text-sm font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Xem tất cả
              </span>
              <ArrowUp className="w-4 h-4 text-blue-400 rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </Link>
          </div>
          <div className="space-y-4">
            {videosRecent?.videos?.slice(0, 5).map((video) => (
              <div
                key={video.id}
                className="group flex items-center gap-5 p-5 bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl hover:from-white/10 hover:to-white/15 transition-all duration-500 border border-white/10 hover:border-white/20 hover:scale-[1.02]"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-xl">
                  <img
                    src={video.thumbUrl || '/placeholder.jpg'}
                    alt={video.title}
                    className="w-24 h-24 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-purple-300 group-hover:bg-clip-text group-hover:text-transparent transition-all truncate">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    @{video.owner?.username || video.username}
                  </p>
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div className="flex flex-col items-center gap-1 group-hover:scale-110 transition-transform">
                    <Eye className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    <span className="font-bold text-gray-300 group-hover:text-blue-300">{video.viewCount || 0}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors" />
                    <span className="font-bold text-gray-300 group-hover:text-pink-300">{video.likeCount || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
