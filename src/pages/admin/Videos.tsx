import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api';
import toast from 'react-hot-toast';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { VideosStatsOverview } from '@/components/admin/videos/VideosStatsOverview';
import { VideosFilters } from '@/components/admin/videos/VideosFilters';
import { useVideosTableColumns } from '@/components/admin/videos/useVideosTableColumns';

/**
 * AdminVideos - Videos management page
 * Refactored into smaller components for better maintainability
 */
export function AdminVideos() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [actionModal, setActionModal] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Fetch videos data with pagination
  const { data, isLoading } = useQuery({
    queryKey: ['admin-videos', page, pageSize],
    queryFn: () =>
      adminApi.listVideos({
        page: page + 1, // API uses 1-based page numbering
        pageSize: pageSize,
      }),
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch video stats separately
  const { data: statsData } = useQuery({
    queryKey: ['admin-videos-stats'],
    queryFn: () => adminApi.getVideosStats(),
    staleTime: 60000, // Cache for 60 seconds
  });

  // Debug log
  console.log('📹 Videos data:', data);
  console.log('📹 Is array?', Array.isArray(data));

  // Video action mutation
  const videoActionMutation = useMutation({
    mutationFn: ({ videoId, action, reason }: any) =>
      adminApi.videoAction(videoId, { action, reason }),
    onSuccess: () => {
      toast.success('Video action completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      setActionModal(false);
      setSelectedVideo(null);
    },
    onError: () => {
      toast.error('Failed to perform action!');
    },
  });

  // Action handlers
  const handleRejectVideo = (videoId: number, video: any) => {
    setSelectedVideo({ ...video, id: videoId, action: 'reject' });
    setActionModal(true);
  };

  const handleDeleteVideo = (videoId: number, video: any) => {
    setSelectedVideo({ ...video, id: videoId, action: 'delete' });
    setActionModal(true);
  };

  const confirmAction = (reason: string) => {
    if (!selectedVideo) return;
    videoActionMutation.mutate({
      videoId: selectedVideo.id,
      action: selectedVideo.action,
      reason,
    });
  };

  // Filter videos by search and status (client-side for current page)
  // API /api/v1/videos returns array directly: [{}, {}, ...]
  const allVideos = Array.isArray(data) ? data : (data?.data || data?.videos || []);
  
  const filteredVideos = allVideos.filter((video: any) => {
    // Search filter
    const matchesSearch = 
      video.title?.toLowerCase().includes(search.toLowerCase()) ||
      video.description?.toLowerCase().includes(search.toLowerCase()) ||
      video.username?.toLowerCase().includes(search.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || video.visibility === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get stats from dedicated API endpoint
  // Since API returns array directly, we can't get total from response
  // Use allVideos.length for current page or stats API for total
  const totalVideos = statsData?.total || allVideos.length;
  const stats = {
    total: statsData?.total || totalVideos,
    public: statsData?.public || 0,
    hidden: statsData?.hidden || 0,
    deleted: statsData?.deleted || 0,
  };

  // Table columns
  const columns = useVideosTableColumns(handleRejectVideo, handleDeleteVideo);

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Videos Management</h1>
        <p className="text-slate-400">Manage all videos on the platform</p>
      </div>

      {/* Stats Overview */}
      <div className="mb-6">
        <VideosStatsOverview {...stats} />
      </div>

      {/* Filters */}
      <div className="mb-6">
        <VideosFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>

      {/* Data Table with Pagination */}
      <DataTable
        data={filteredVideos}
        columns={columns}
        loading={isLoading}
        itemsPerPage={pageSize}
      />

      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalVideos)} of {totalVideos} videos
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
            disabled={(page + 1) * pageSize >= totalVideos}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && selectedVideo && (
        <ActionModal
          video={selectedVideo}
          action={selectedVideo.action}
          onConfirm={confirmAction}
          onCancel={() => {
            setActionModal(false);
            setSelectedVideo(null);
          }}
          isLoading={videoActionMutation.isPending}
        />
      )}
    </AdminLayout>
  );
}

function ActionModal({
  video,
  action,
  onConfirm,
  onCancel,
  isLoading,
}: {
  video: any;
  action: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState('');

  const actionLabels: any = {
    approve: 'Approve Video',
    reject: 'Hide Video',
    delete: 'Delete Video',
  };

  const actionDescriptions: any = {
    approve: 'This video will be made public and visible to all users.',
    reject: 'This video will be hidden from public view.',
    delete: 'This video will be permanently deleted and cannot be recovered.',
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold text-white mb-2">
          {actionLabels[action]}
        </h3>
        <p className="text-sm text-slate-400 mb-4">
          {actionDescriptions[action]}
        </p>
        
        <div className="mb-4 space-y-2">
          <p className="text-sm text-slate-400">
            <strong className="text-white">Video:</strong> {video.title}
          </p>
          <p className="text-sm text-slate-400">
            <strong className="text-white">Owner:</strong> {video.owner?.username || video.username || 'Unknown'}
          </p>
          <p className="text-sm text-slate-400">
            <strong className="text-white">Video ID:</strong> #{video.id}
          </p>
        </div>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason (optional)..."
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 mb-4"
          rows={4}
        />
        
        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(reason)}
            disabled={isLoading}
            className={`flex-1 py-3 rounded-xl font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              action === 'delete'
                ? 'bg-red-500 hover:bg-red-600'
                : action === 'reject'
                ? 'bg-yellow-500 hover:bg-yellow-600'
                : 'bg-purple-500 hover:bg-purple-600'
            }`}
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
