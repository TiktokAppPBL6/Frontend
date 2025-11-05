import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, User, Video } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/common/Avatar';
import { usersApi } from '@/api/users.api';
import { videosApi } from '@/api/videos.api';
import { formatNumber } from '@/lib/utils';

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'users' | 'videos'>('videos');
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);

  // Search users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['search', 'users', query],
    queryFn: () => usersApi.searchUsers(query),
    enabled: !!query && activeTab === 'users',
  });

  // Search videos
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['search', 'videos', query],
    queryFn: () => videosApi.searchVideos({ query, page: 1, pageSize: 20 }),
    enabled: !!query && activeTab === 'videos',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm video, người dùng..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-12 h-12 text-lg"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FE2C55]"
            >
              <SearchIcon className="h-6 w-6" />
            </button>
          </div>
        </form>

        {query && (
          <>
            {/* Tabs */}
            <div className="flex gap-8 border-b border-gray-200 mb-6">
              <button
                onClick={() => setActiveTab('videos')}
                className={`pb-4 px-2 font-semibold transition-colors ${
                  activeTab === 'videos'
                    ? 'text-[#FE2C55] border-b-2 border-[#FE2C55]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Video className="inline h-5 w-5 mr-2" />
                Video
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`pb-4 px-2 font-semibold transition-colors ${
                  activeTab === 'users'
                    ? 'text-[#FE2C55] border-b-2 border-[#FE2C55]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="inline h-5 w-5 mr-2" />
                Người dùng
              </button>
            </div>

            {/* Results */}
            <div>
              {activeTab === 'users' && (
                <div className="space-y-4">
                  {usersLoading ? (
                    <div className="text-center py-8">Đang tìm kiếm...</div>
                  ) : users && users.length > 0 ? (
                    users.map((user) => (
                      <Link
                        key={user.id}
                        to={`/user/${user.id}`}
                        className="flex items-center gap-4 p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                      >
                        <Avatar src={user.avatarUrl} alt={user.username} size="lg" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">
                            {user.fullName || user.username}
                          </h3>
                          <p className="text-gray-500 text-sm">@{user.username}</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {formatNumber(user.followersCount || 0)} người theo dõi
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Không tìm thấy người dùng nào
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'videos' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {videosLoading ? (
                    <div className="col-span-full text-center py-8">Đang tìm kiếm...</div>
                  ) : videos && videos.length > 0 ? (
                    videos.map((video) => (
                      <Link
                        key={video.id}
                        to={`/video/${video.id}`}
                        className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-200 hover:ring-2 hover:ring-[#FE2C55] transition-all"
                      >
                        <img
                          src={video.thumbUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                          <p className="font-semibold text-sm line-clamp-2">{video.title}</p>
                          <p className="text-xs mt-1">
                            {formatNumber(video.viewCount || 0)} lượt xem
                          </p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      Không tìm thấy video nào
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {!query && (
          <div className="text-center py-20">
            <SearchIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Nhập từ khóa để tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  );
}
