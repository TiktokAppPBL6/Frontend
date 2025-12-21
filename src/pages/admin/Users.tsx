import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { UsersStatsOverview } from '@/components/admin/users/UsersStatsOverview';
import { UsersFilters } from '@/components/admin/users/UsersFilters';
import { useUsersTableColumns } from '@/components/admin/users/useUsersTableColumns';

/**
 * AdminUsers - User management page
 * Refactored into smaller components for better maintainability
 */
export function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Fetch users data with pagination
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, pageSize],
    queryFn: () =>
      adminApi.listUsers({
        skip: page * pageSize,
        limit: pageSize,
      }),
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch user stats separately
  const { data: statsData } = useQuery({
    queryKey: ['admin-users-stats'],
    queryFn: () => adminApi.getUsersStats(),
    staleTime: 60000, // Cache for 60 seconds
  });

  // User action mutation
  const userActionMutation = useMutation({
    mutationFn: ({ userId, action, reason }: any) =>
      adminApi.userAction(userId, { action, reason }),
    onSuccess: () => {
      toast.success('Action completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => {
      toast.error('Failed to perform action!');
    },
  });

  // Action handlers
  const handleBanUser = (userId: number) => {
    if (window.confirm('Are you sure you want to ban this user?')) {
      userActionMutation.mutate({
        userId,
        action: 'ban',
        reason: 'Violated community guidelines',
      });
    }
  };

  const handleUnbanUser = (userId: number) => {
    userActionMutation.mutate({
      userId,
      action: 'unban',
      reason: 'Appeal accepted',
    });
  };

  // Filter users
  const filteredUsers = data?.users?.filter((user: any) => {
    // Search filter
    const matchesSearch = 
      user.username?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(search.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Get stats from dedicated API endpoint
  const totalUsers = data?.total || 0;
  const stats = {
    total: statsData?.total || totalUsers,
    active: statsData?.active || 0,
    blocked: statsData?.blocked || 0,
  };

  // Table columns
  const columns = useUsersTableColumns(handleBanUser, handleUnbanUser);

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Users Management</h1>
        <p className="text-slate-400">Manage all users on the platform</p>
      </div>

      {/* Stats Overview */}
      <div className="mb-6">
        <UsersStatsOverview {...stats} />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <UsersFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>

      {/* Data Table with Pagination */}
      <DataTable
        data={filteredUsers}
        columns={columns}
        loading={isLoading}
        itemsPerPage={pageSize}
      />

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalUsers)} of {totalUsers} users
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={(page + 1) * pageSize >= totalUsers}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
