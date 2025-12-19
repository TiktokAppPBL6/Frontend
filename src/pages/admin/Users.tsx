import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { Search, Ban, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminUsers() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionModal, setActionModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', statusFilter],
    queryFn: () =>
      adminApi.listUsers({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: 100,
      }),
  });

  const userActionMutation = useMutation({
    mutationFn: ({ userId, action, reason }: any) =>
      adminApi.userAction(userId, { action, reason }),
    onSuccess: () => {
      toast.success('Đã thực hiện thành công!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setActionModal(false);
      setSelectedUser(null);
    },
    onError: () => {
      toast.error('Có lỗi xảy ra!');
    },
  });

  const handleAction = (user: any, action: string) => {
    setSelectedUser({ ...user, action });
    setActionModal(true);
  };

  const confirmAction = (reason: string) => {
    if (!selectedUser) return;
    userActionMutation.mutate({
      userId: selectedUser.id,
      action: selectedUser.action,
      reason,
    });
  };

  const filteredUsers = data?.users?.filter((user: any) =>
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Quản Lý Users</h1>
          <p className="text-gray-400">Quản lý tất cả người dùng trong hệ thống</p>
        </div>

        {/* Filters */}
        <div className="bg-[#1e1e1e] rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm user..."
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
              <option value="active">Hoạt động</option>
              <option value="blocked">Đã chặn</option>
              <option value="suspended">Đã khóa tạm</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1e1e1e] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Tổng Users</p>
            <p className="text-2xl font-bold">{data?.total || 0}</p>
          </div>
          <div className="bg-[#1e1e1e] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Đang Hoạt Động</p>
            <p className="text-2xl font-bold">
              {data?.users?.filter((u: any) => u.status === 'active').length || 0}
            </p>
          </div>
          <div className="bg-[#1e1e1e] rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">Đã Chặn</p>
            <p className="text-2xl font-bold">
              {data?.users?.filter((u: any) => u.status === 'blocked').length || 0}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#252525]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium">User</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Trạng Thái</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Videos</th>
                  <th className="px-6 py-4 text-left text-sm font-medium">Followers</th>
                  <th className="px-6 py-4 text-right text-sm font-medium">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252525]">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                      Không tìm thấy user nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user: any) => (
                    <tr key={user.id} className="hover:bg-[#252525]">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatarUrl || '/default-avatar.png'}
                            alt={user.username}
                            className="w-10 h-10 rounded-full"
                          />
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-gray-400">{user.fullName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.email}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.videosCount || 0}</td>
                      <td className="px-6 py-4 text-sm">{user.followersCount || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {user.status === 'active' ? (
                            <>
                              <button
                                onClick={() => handleAction(user, 'suspend')}
                                className="p-2 hover:bg-yellow-500/20 rounded-lg transition-colors"
                                title="Khóa tạm thời"
                              >
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                              </button>
                              <button
                                onClick={() => handleAction(user, 'ban')}
                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Chặn vĩnh viễn"
                              >
                                <Ban className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAction(user, 'unban')}
                              className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                              title="Mở khóa"
                            >
                              <ShieldCheck className="w-4 h-4 text-green-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal && selectedUser && (
        <ActionModal
          user={selectedUser}
          action={selectedUser.action}
          onConfirm={confirmAction}
          onCancel={() => {
            setActionModal(false);
            setSelectedUser(null);
          }}
          isLoading={userActionMutation.isPending}
        />
      )}
    </div>
  );
}

function ActionModal({
  user,
  action,
  onConfirm,
  onCancel,
  isLoading,
}: {
  user: any;
  action: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState('');

  const actionLabels: any = {
    ban: 'Chặn vĩnh viễn',
    unban: 'Mở khóa',
    suspend: 'Khóa tạm thời',
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1e1e1e] rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">
          {actionLabels[action]} - {user.username}
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
