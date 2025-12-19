import { useState } from 'react';
import { Search, MessageSquare } from 'lucide-react';

export function AdminComments() {
  const [search, setSearch] = useState('');
  const [videoIdFilter, setVideoIdFilter] = useState('');

  // Note: Hiện tại API chưa có endpoint để list all comments
  // Cần backend bổ sung: GET /admin/comments/list

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Quản Lý Comments</h1>
          <p className="text-gray-400">Quản lý và kiểm duyệt tất cả comments</p>
        </div>

        {/* Notice */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-500 mb-2">API Chưa Sẵn Sàng</h3>
              <p className="text-sm text-gray-400">
                Tính năng này cần backend bổ sung endpoint:
              </p>
              <ul className="mt-2 text-sm text-gray-400 list-disc list-inside space-y-1">
                <li><code className="text-yellow-500">GET /admin/comments/list</code> - Lấy danh sách tất cả comments</li>
                <li><code className="text-yellow-500">GET /admin/comments/reported</code> - Comments bị báo cáo</li>
                <li><code className="text-yellow-500">GET /admin/comments/stats</code> - Thống kê comments</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Placeholder UI */}
        <div className="bg-[#1e1e1e] rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm comment..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-[#252525] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 opacity-50 cursor-not-allowed"
              />
            </div>
            <input
              type="text"
              placeholder="Video ID..."
              value={videoIdFilter}
              onChange={(e) => setVideoIdFilter(e.target.value)}
              disabled
              className="px-4 py-3 bg-[#252525] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 opacity-50 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="text-center py-12 text-gray-400">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Tính năng đang được phát triển</p>
          <p className="text-sm mt-2">Vui lòng chờ backend cung cấp API</p>
        </div>
      </div>
    </div>
  );
}
