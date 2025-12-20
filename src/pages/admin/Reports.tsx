import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '@/api';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminReports() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [actionModal, setActionModal] = useState(false);

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => reportsApi.getReports(),
  });

  const updateReportMutation = useMutation({
    mutationFn: ({ reportId, status, decision }: any) =>
      reportsApi.updateReport(reportId, { status, decision }),
    onSuccess: () => {
      toast.success('Đã xử lý report thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      setActionModal(false);
      setSelectedReport(null);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra!');
    },
  });

  const handleAction = (report: any, status: string) => {
    setSelectedReport({ ...report, newStatus: status });
    setActionModal(true);
  };

  const confirmAction = (decision: string) => {
    if (!selectedReport) return;
    updateReportMutation.mutate({
      reportId: selectedReport.id,
      status: selectedReport.newStatus,
      decision,
    });
  };

  const filteredReports = reports?.filter((report: any) => {
    const matchesSearch = 
      report.reason?.toLowerCase().includes(search.toLowerCase()) ||
      report.description?.toLowerCase().includes(search.toLowerCase()) ||
      report.reporter?.username?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTargetTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-500/20 text-purple-400';
      case 'user': return 'bg-blue-500/20 text-blue-400';
      case 'comment': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Quản Lý Reports</h1>
          <p className="text-gray-400">Xử lý tất cả báo cáo vi phạm từ người dùng</p>
        </div>

        {/* Filters */}
        <div className="bg-[#1e1e1e] rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm report..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#252525] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-[#252525] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="approved">Đã approve</option>
              <option value="rejected">Đã reject</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1e1e1e] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Tổng Reports</p>
            <p className="text-2xl font-bold">{reports?.length || 0}</p>
          </div>
          <div className="bg-[#1e1e1e] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Chờ Xử Lý</p>
            <p className="text-2xl font-bold text-yellow-400">
              {reports?.filter((r: any) => r.status === 'pending').length || 0}
            </p>
          </div>
          <div className="bg-[#1e1e1e] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Đã Approve</p>
            <p className="text-2xl font-bold text-green-400">
              {reports?.filter((r: any) => r.status === 'approved').length || 0}
            </p>
          </div>
          <div className="bg-[#1e1e1e] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Đã Reject</p>
            <p className="text-2xl font-bold text-red-400">
              {reports?.filter((r: any) => r.status === 'rejected').length || 0}
            </p>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Đang tải...</div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">Không tìm thấy report nào</div>
          ) : (
            filteredReports.map((report: any) => (
              <div key={report.id} className="bg-[#1e1e1e] rounded-xl p-6 hover:bg-[#252525] transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getTargetTypeColor(report.targetType)}`}>
                        {report.targetType}
                      </span>
                      <span className="text-sm text-gray-400">
                        Báo cáo bởi: <span className="text-white">{report.reporter?.username || 'Unknown'}</span>
                      </span>
                    </div>
                    <h3 className="font-medium text-lg mb-2">{report.reason}</h3>
                    {report.description && (
                      <p className="text-gray-400 text-sm mb-3">{report.description}</p>
                    )}
                    {report.decision && (
                      <div className="bg-[#252525] rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-400">
                          <strong>Quyết định:</strong> {report.decision}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Target ID: {report.targetId} | Report ID: #{report.id}
                    </p>
                  </div>
                  
                  {report.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleAction(report, 'approved')}
                        className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Approve</span>
                      </button>
                      <button
                        onClick={() => handleAction(report, 'rejected')}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && selectedReport && (
        <ActionModal
          report={selectedReport}
          status={selectedReport.newStatus}
          onConfirm={confirmAction}
          onCancel={() => {
            setActionModal(false);
            setSelectedReport(null);
          }}
          isLoading={updateReportMutation.isPending}
        />
      )}
    </div>
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
  onConfirm: (decision: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [decision, setDecision] = useState('');

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e1e1e] rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">
          {status === 'approved' ? 'Approve' : 'Reject'} Report
        </h3>
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">
            <strong>Lý do báo cáo:</strong> {report.reason}
          </p>
          <p className="text-sm text-gray-400">
            <strong>Target:</strong> {report.targetType} #{report.targetId}
          </p>
        </div>
        <textarea
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          placeholder="Quyết định của bạn..."
          className="w-full px-4 py-3 bg-[#252525] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          rows={4}
        />
        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(decision)}
            disabled={isLoading}
            className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 bg-[#252525] hover:bg-[#2a2a2a] rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
