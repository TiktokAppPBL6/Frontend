import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { Search, Trash2, Eye, Heart, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminVideos() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [actionModal, setActionModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-videos', statusFilter],
    queryFn: () =>
      adminApi.listVideos({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 100,
      }),
  });

  const videoActionMutation = useMutation({
    mutationFn: ({ videoId, action, reason }: any) =>
      adminApi.videoAction(videoId, { action, reason }),
    onSuccess: () => {
      toast.success('Đã thực hiện thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] });
      setActionModal(false);
      setSelectedVideo(null);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra!');
    },
  });

  const handleAction = (video: any, action: string) => {
    setSelectedVideo({ ...video, action });
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

  const filteredVideos = data?.videos?.filter((video: any) =>
    video.title?.toLowerCase().includes(search.toLowerCase()) ||
    video.description?.toLowerCase().includes(search.toLowerCase()) ||
    video.owner?.username?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Quản Lý Videos</h1>
          <p className="text-gray-400">Quản lý tất cả video trong hệ thống</p>
        </div>

        {/* Filters */}
        <div className="bg-[#1e1e1e] rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm video..."
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
              <option value="public">Public</option>
              <option value="hidden">Hidden</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1e1e1e] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Tổng Videos</p>
            <p className="text-2xl font-bold">{data?.total || 0}</p>
          </div>
          <div className="bg-[#1e1e1e] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Public</p>
            <p className="text-2xl font-bold">
              {data?.videos?.filter((v: any) => v.visibility === 'public').length || 0}
            </p>
          </div>
          <div className="bg-[#1e1e1e] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Hidden/Deleted</p>
            <p className="text-2xl font-bold">
              {data?.videos?.filter((v: any) => v.visibility !== 'public').length || 0}
            </p>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-gray-400">Đang tải...</div>
          ) : filteredVideos.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400">
              Không tìm thấy video nào
            </div>
          ) : (
            filteredVideos.map((video: any) => (
              <div
                key={video.id}
                className="bg-[#1e1e1e] rounded-xl overflow-hidden hover:bg-[#252525] transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[9/16] bg-[#252525]">
                  <img
                    src={video.thumbUrl || '/placeholder.jpg'}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        video.visibility === 'public'
                          ? 'bg-green-500/80 text-white'
                          : video.visibility === 'hidden'
                          ? 'bg-yellow-500/80 text-white'
                          : 'bg-red-500/80 text-white'
                      }`}
                    >
                      {video.visibility}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-medium mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-1">
                    {video.owner?.username || video.username}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{video.viewCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{video.likeCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{video.commentCount || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {video.visibility !== 'deleted' && (
                      <>
                        <button
                          onClick={() => handleAction(video, 'approve')}
                          className="flex-1 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">Approve</span>
                        </button>
                        <button
                          onClick={() => handleAction(video, 'reject')}
                          className="flex-1 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg transition-colors flex items-center justify-center gap-2"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm">Reject</span>
                        </button>
                        <button
                          onClick={() => handleAction(video, 'delete')}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
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
    </div>
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
    approve: 'Approve video',
    reject: 'Reject video',
    delete: 'Xóa video',
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e1e1e] rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">
          {actionLabels[action]} - {video.title}
        </h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Lý do (không bắt buộc)..."
          className="w-full px-4 py-3 bg-[#252525] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          rows={4}
        />
        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(reason)}
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
