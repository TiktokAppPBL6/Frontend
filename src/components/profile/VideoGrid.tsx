import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VideoCard } from './VideoCard';
import { Globe, Lock } from 'lucide-react';

interface VideoGridProps {
  videos: any[];
  isOwnProfile: boolean;
  isLoading: boolean;
  activeTab?: 'public' | 'private';
  onEditVideo: (video: any) => void;
}

export function VideoGrid({ 
  videos, 
  isOwnProfile, 
  isLoading,
  activeTab = 'public',
  onEditVideo 
}: VideoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} className="aspect-[9/16] rounded-lg bg-gray-800" />
        ))}
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-32">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[#1e1e1e] mb-6">
          {isOwnProfile && activeTab === 'private' ? (
            <Lock className="h-12 w-12 text-gray-600" />
          ) : (
            <Globe className="h-12 w-12 text-gray-600" />
          )}
        </div>
        <p className="text-gray-400 font-medium text-lg mb-2">
          {isOwnProfile 
            ? (activeTab === 'private' ? 'Chưa có video riêng tư' : 'Chưa có video công khai')
            : 'Người dùng này chưa có video công khai'
          }
        </p>
        <p className="text-gray-500 text-sm mb-6">
          {isOwnProfile ? 'Tải video lên để chia sẻ với mọi người' : 'Quay lại sau khi họ đăng video mới'}
        </p>
        {isOwnProfile && (
          <Link to="/upload">
            <Button className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white px-8 py-6 text-base">
              Tải video lên
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {videos.map((video: any) => (
        <VideoCard
          key={video.id}
          video={video}
          isOwnVideo={isOwnProfile}
          onEdit={onEditVideo}
        />
      ))}
    </div>
  );
}
