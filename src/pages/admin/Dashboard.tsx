import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsGrid } from '@/components/admin/StatsGrid';
import { ChartsGrid } from '@/components/admin/ChartsGrid';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { useStatsSummary } from '@/components/admin/hooks/useStatsSummary';

/**
 * AdminDashboard - Main admin dashboard page
 * Displays overview statistics and charts
 * Refactored into smaller components for better maintainability
 */
export function AdminDashboard() {
  // Fetch statistics from admin API (polling 60s)
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats-overview'],
    queryFn: () => adminApi.getAdminOverview(),
    refetchInterval: 60000,
    staleTime: 50000,
  });

  // Fetch chart data (polling 60s)
  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: ['admin-stats-charts'],
    queryFn: () => adminApi.getAdminCharts(),
    refetchInterval: 60000,
    staleTime: 50000,
  });

  // Transform stats data into display format
  const stats = useStatsSummary(statsData);

  // Show loading state
  if (statsLoading || chartsLoading) {
    return (
      <AdminLayout>
        <LoadingSpinner message="Loading dashboard..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Overview of your platform's performance and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8">
        <StatsGrid stats={stats} />
      </div>

      {/* Charts Grid */}
      <ChartsGrid chartsData={chartsData} />
    </AdminLayout>
  );
}
