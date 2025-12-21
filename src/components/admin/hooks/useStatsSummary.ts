import { Users, Video, AlertTriangle } from 'lucide-react';

interface StatsSummaryProps {
  stats: {
    users: {
      total: number;
      new_today: number;
      active_7d: number;
      banned: number;
    };
    videos: {
      total: number;
      new_today: number;
      public: number;
      private: number;
    };
    reports: {
      total: number;
      pending: number;
      resolved: number;
      resolved_today: number;
    };
    engagement?: {
      rate: number;
      views_today: number;
      likes_total: number;
      comments_total: number;
    };
  };
}

/**
 * StatsSummary - Reusable stats data processor
 * Transforms raw stats into display format
 */
export function useStatsSummary(statsData?: StatsSummaryProps['stats']) {
  if (!statsData) return [];

  return [
    {
      title: 'Total Users',
      value: statsData.users.total || 0,
      icon: Users,
      gradient: 'from-blue-500 via-blue-600 to-cyan-500',
      link: '/admin/users',
    },
    {
      title: 'Total Videos',
      value: statsData.videos.total || 0,
      icon: Video,
      gradient: 'from-purple-500 via-pink-500 to-purple-600',
      link: '/admin/videos',
    },
    {
      title: 'Total Reports',
      value: statsData.reports.total || 0,
      icon: AlertTriangle,
      gradient: 'from-red-500 via-orange-500 to-red-600',
      link: '/admin/reports',
    },
  ];
}
