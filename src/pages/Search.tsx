import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon, User, Video, Heart, MessageCircle, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/common/Avatar';
import { usersApi } from '@/api/users.api';
import { videosApi } from '@/api/videos.api';
import { formatNumber, getMediaUrl, getAvatarUrl } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

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
    <div className="min-h-screen bg-gray-50 pt-20 pb-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm video, người dùng..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-12 h-12 text-lg bg-white"
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
            <div className="flex gap-8 border-b border-gray-200 mb-6 bg-white rounded-t-lg px-4">
              <button
                onClick={() => setActiveTab('videos')}
                className={`pb-4 pt-4 px-2 font-semibold transition-colors ${
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
                className={`pb-4 pt-4 px-2 font-semibold transition-colors ${
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
            <div className="bg-white rounded-b-lg p-4">{activeTab === 'users' && (
                <div className="space-y-3">
                  {usersLoading ? (
                    <div className="text-center py-8 text-gray-500">Đang tìm kiếm...</div>
                  ) : users && users.length > 0 ? (
                    users.map((user: any) => {
                      // Normalize user fields
                      const followersCount = user.followers_count ?? user.followersCount ?? 0;
                      const videosCount = user.videos_count ?? user.videosCount ?? 0;
                      
                      return (
                        <Link
                          key={user.id}
                          to={`/user/${user.id}`}
                          className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                        >
                          <Avatar src={getAvatarUrl(user.avatarUrl)} alt={user.username} size="lg" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">
                              {user.fullName || user.username}
                            </h3>
                            <p className="text-gray-500 text-sm">@{user.username}</p>
                            <div className="flex items-center gap-4 text-gray-400 text-sm mt-1">
                              <span>{formatNumber(followersCount)} người theo dõi</span>
                              <span className="text-gray-300">•</span>
                              <span>{formatNumber(videosCount)} video</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <div className="text-center py-32">
                      <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                          <User className="h-12 w-12 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-gray-900 text-2xl font-bold mb-3">
                        Không tìm thấy người dùng
                      </p>
                      <p className="text-gray-500 text-base">
                        Thử tìm kiếm với từ khóa khác
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'videos' && (
                <div>
                  {videosLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[9/16] rounded-lg" />
                      ))}
                    </div>
                  ) : videos && videos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {videos.map((video: any) => (
                        <Link
                          key={video.id}
                          to={`/video/${video.id}`}
                          className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-gray-900 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
                        >
                          {/* Thumbnail */}
                          <img
                            src={getMediaUrl(video.thumbUrl ?? video.thumb_url)}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Play Icon Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-12 w-12 text-white fill-white" />
                            </div>
                          </div>

                          {/* Stats Overlay - Bottom */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                            <p className="text-white text-sm font-medium line-clamp-2 mb-2">
                              {video.title}
                            </p>
                            <div className="flex items-center gap-3 text-white text-xs">
                              <div className="flex items-center gap-1">
                                <Heart className="h-3.5 w-3.5 fill-current" />
                                <span>{formatNumber(video.likes_count ?? video.likesCount ?? 0)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="h-3.5 w-3.5" />
                                <span>{formatNumber(video.comments_count ?? video.commentsCount ?? 0)}</span>
                              </div>
                            </div>
                          </div>

                          {/* User Info - Top Right */}
                          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                            <Avatar 
                              src={getAvatarUrl(video.avatarUrl ?? video.avatar_url)} 
                              alt={video.username ?? video.user_name}
                              size="sm"
                              className="w-5 h-5"
                            />
                            <span className="text-white text-xs font-medium max-w-[80px] truncate">
                              {video.username ?? video.user_name}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-32">
                      <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 mb-4">
                          <Video className="h-12 w-12 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-gray-900 text-2xl font-bold mb-3">
                        Không tìm thấy video
                      </p>
                      <p className="text-gray-500 text-base">
                        Thử tìm kiếm với từ khóa khác
                      </p>
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
