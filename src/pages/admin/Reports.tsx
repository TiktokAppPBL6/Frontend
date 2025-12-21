import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { ReportsStatsOverview } from '@/components/admin/reports/ReportsStatsOverview';
import { ReportsFilters } from '@/components/admin/reports/ReportsFilters';
import { useReportsTableColumns } from '@/components/admin/reports/useReportsTableColumns';

/**
 * AdminReports - Reports management page
 * Refactored into smaller components for better maintainability
 */
export function AdminReports() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [actionModal, setActionModal] = useState(false);

  // Fetch reports data
  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => reportsApi.getReports(),
  });

  // Report action mutation
  const updateReportMutation = useMutation({
    mutationFn: ({ reportId, status, decision }: any) =>
      reportsApi.updateReport(reportId, { status, decision }),
    onSuccess: () => {
      toast.success('Report action completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      setActionModal(false);
      setSelectedReport(null);
    },
    onError: () => {
      toast.error('Failed to perform action!');
    },
  });

  // Action handlers
  const handleApproveReport = (reportId: number, report: any) => {
    setSelectedReport({ ...report, id: reportId, actionType: 'approve' });
    setActionModal(true);
  };

  const handleRejectReport = (reportId: number, report: any) => {
    setSelectedReport({ ...report, id: reportId, actionType: 'reject' });
    setActionModal(true);
  };

  const confirmAction = () => {
    if (!selectedReport) return;
    
    // Map action types to backend decision values
    const decisionMap: any = {
      'approve': selectedReport.targetType === 'video' ? 'hide_video' : 'block_user',
      'reject': 'reject'
    };
    
    updateReportMutation.mutate({
      reportId: selectedReport.id,
      status: 'closed',
      decision: decisionMap[selectedReport.actionType],
    });
  };

  // Filter reports
  const filteredReports = reports?.filter((report: any) => {
    const matchesSearch =
      report.reason?.toLowerCase().includes(search.toLowerCase()) ||
      report.description?.toLowerCase().includes(search.toLowerCase()) ||
      report.reporter?.username?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesType = targetTypeFilter === 'all' || report.targetType === targetTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  // Calculate stats from ALL reports (not filtered)
  const stats = {
    total: reports?.length || 0,
    pending: reports?.filter((r: any) => r.status === 'open').length || 0,
    approved: reports?.filter((r: any) => r.status === 'closed' && r.decision !== 'reject').length || 0,
    rejected: reports?.filter((r: any) => r.status === 'closed' && r.decision === 'reject').length || 0,
  };

  // Table columns
  const columns = useReportsTableColumns(handleApproveReport, handleRejectReport);

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Reports Management</h1>
        <p className="text-slate-400">Manage all user reports on the platform</p>
      </div>

      {/* Stats Overview */}
      <div className="mb-6">
        <ReportsStatsOverview {...stats} />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <ReportsFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          targetTypeFilter={targetTypeFilter}
          onTargetTypeFilterChange={setTargetTypeFilter}
        />
      </div>

      {/* Data Table */}
      <DataTable
        data={filteredReports}
        columns={columns}
        loading={isLoading}
        itemsPerPage={15}
      />

      {/* Action Modal */}
      {actionModal && selectedReport && (
        <ActionModal
          report={selectedReport}
          status={selectedReport.actionType}
          onConfirm={confirmAction}
          onCancel={() => {
            setActionModal(false);
            setSelectedReport(null);
          }}
          isLoading={updateReportMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}

function ActionModal({
  report,
  status,
  onConfirm,
  onCancel,
  isLoading,
}: {
  report: any;
  status: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-4">
          {status === 'approve' ? 'Approve (Take Action)' : 'Reject'} Report
        </h3>
        <div className="mb-4 space-y-2">
          <p className="text-sm text-slate-400">
            <strong className="text-white">Report ID:</strong> #{report.id}
          </p>
          <p className="text-sm text-slate-400">
            <strong className="text-white">Reason:</strong> {report.reason}
          </p>
          <p className="text-sm text-slate-400">
            <strong className="text-white">Target:</strong> {report.targetType} #{report.targetId}
          </p>
          {report.description && (
            <p className="text-sm text-slate-400">
              <strong className="text-white">Description:</strong> {report.description}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
