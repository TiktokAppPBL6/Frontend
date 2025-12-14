import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon } from 'lucide-react';
import { usersApi } from '@/api/users.api';
import { videosApi } from '@/api/videos.api';
import { SearchTabs } from '@/components/search/SearchTabs';
import { UserList } from '@/components/search/UserList';
import { SearchVideoGrid } from '@/components/search/SearchVideoGrid';

export function Search() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'users' | 'videos'>('videos');
  const query = searchParams.get('q') || '';

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

  return (
    <div className="min-h-screen bg-[#121212] py-6">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {query ? `Kết quả tìm kiếm: "${query}"` : 'Tìm kiếm'}
          </h1>
          <p className="text-gray-400">
            {query ? 'Khám phá video và người dùng phù hợp' : 'Sử dụng thanh tìm kiếm bên trái để tìm kiếm'}
          </p>
        </div>

        {query && (
          <>
            <SearchTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="bg-[#1e1e1e] rounded-b-lg p-4 border border-gray-800 border-t-0">
              {activeTab === 'users' && (
                <UserList users={users || []} isLoading={usersLoading} />
              )}

              {activeTab === 'videos' && (
                <SearchVideoGrid videos={videos || []} isLoading={videosLoading} />
              )}
            </div>
          </>
        )}

        {!query && (
          <div className="text-center py-20">
            <SearchIcon className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">Nhập từ khóa để tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  );
}
