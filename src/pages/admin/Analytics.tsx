import { BarChart3, TrendingUp, Users, Video, Activity, Calendar } from 'lucide-react';

export function AdminAnalytics() {
  // Note: Cần backend bổ sung các endpoint analytics

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Analytics & Thống Kê</h1>
          <p className="text-gray-400">Phân tích dữ liệu và xu hướng hệ thống</p>
        </div>

        {/* Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-500 mb-2">API Analytics Cần Bổ Sung</h3>
              <p className="text-sm text-gray-400 mb-3">
                Để hiển thị analytics đầy đủ, cần backend bổ sung các endpoint sau:
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-white mb-1">1. User Analytics</p>
                  <ul className="text-sm text-gray-400 list-disc list-inside space-y-1 ml-4">
                    <li><code className="text-blue-400">GET /admin/analytics/users/growth</code> - Tăng trưởng users theo thời gian</li>
                    <li><code className="text-blue-400">GET /admin/analytics/users/active</code> - Users hoạt động (daily/weekly/monthly)</li>
                    <li><code className="text-blue-400">GET /admin/analytics/users/retention</code> - Tỷ lệ giữ chân users</li>
                    <li><code className="text-blue-400">GET /admin/analytics/users/demographics</code> - Phân bố users theo khu vực</li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium text-white mb-1">2. Video Analytics</p>
                  <ul className="text-sm text-gray-400 list-disc list-inside space-y-1 ml-4">
                    <li><code className="text-blue-400">GET /admin/analytics/videos/trending</code> - Videos trending</li>
                    <li><code className="text-blue-400">GET /admin/analytics/videos/views</code> - Lượt xem theo thời gian</li>
                    <li><code className="text-blue-400">GET /admin/analytics/videos/engagement</code> - Tỷ lệ tương tác</li>
                    <li><code className="text-blue-400">GET /admin/analytics/videos/duration</code> - Phân tích độ dài video</li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium text-white mb-1">3. System Analytics</p>
                  <ul className="text-sm text-gray-400 list-disc list-inside space-y-1 ml-4">
                    <li><code className="text-blue-400">GET /admin/analytics/system/performance</code> - Hiệu suất hệ thống</li>
                    <li><code className="text-blue-400">GET /admin/analytics/system/storage</code> - Dung lượng storage</li>
                    <li><code className="text-blue-400">GET /admin/analytics/system/bandwidth</code> - Băng thông sử dụng</li>
                    <li><code className="text-blue-400">GET /admin/analytics/system/errors</code> - Logs và errors</li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium text-white mb-1">4. Revenue Analytics (nếu có monetization)</p>
                  <ul className="text-sm text-gray-400 list-disc list-inside space-y-1 ml-4">
                    <li><code className="text-blue-400">GET /admin/analytics/revenue/overview</code> - Tổng quan doanh thu</li>
                    <li><code className="text-blue-400">GET /admin/analytics/revenue/by-creator</code> - Doanh thu theo creator</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <ChartPlaceholder icon={Users} title="User Growth" color="bg-blue-500" />
          <ChartPlaceholder icon={Video} title="Video Views" color="bg-purple-500" />
          <ChartPlaceholder icon={Activity} title="Engagement Rate" color="bg-green-500" />
          <ChartPlaceholder icon={TrendingUp} title="Trending Content" color="bg-red-500" />
        </div>

        {/* Time Range Selector */}
        <div className="bg-[#1e1e1e] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">Chọn khoảng thời gian:</span>
            </div>
            <div className="flex gap-2">
              {['7 ngày', '30 ngày', '3 tháng', '1 năm'].map((range) => (
                <button
                  key={range}
                  disabled
                  className="px-4 py-2 bg-[#252525] rounded-lg text-sm opacity-50 cursor-not-allowed"
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartPlaceholder({ icon: Icon, title, color }: any) {
  return (
    <div className="bg-[#1e1e1e] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="h-48 flex items-center justify-center border-2 border-dashed border-[#252525] rounded-lg">
        <p className="text-gray-500 text-sm">Chart placeholder</p>
      </div>
    </div>
  );
}
