import { cn } from '@/lib/utils';
import { Globe, Lock } from 'lucide-react';

interface ProfileTabsProps {
  isOwnProfile: boolean;
  activeTab: 'public' | 'private';
  onTabChange: (tab: 'public' | 'private') => void;
}

export function ProfileTabs({ isOwnProfile, activeTab, onTabChange }: ProfileTabsProps) {
  if (!isOwnProfile) {
    return (
      <div className="border-b border-gray-800 mb-6">
        <div className="flex items-center justify-center gap-2 py-4 relative">
          <Globe className="h-5 w-5 text-white" />
          <span className="text-base font-semibold text-white">Video</span>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center border-b border-gray-800 mb-6">
      <button
        onClick={() => onTabChange('public')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 py-4 px-4 text-base font-semibold transition-all relative',
          activeTab === 'public'
            ? 'text-white'
            : 'text-gray-500 hover:text-gray-300'
        )}
      >
        <Globe className="h-5 w-5" />
        <span>Công khai</span>
        {activeTab === 'public' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
        )}
      </button>
      <button
        onClick={() => onTabChange('private')}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 py-4 px-4 text-base font-semibold transition-all relative',
          activeTab === 'private'
            ? 'text-white'
            : 'text-gray-500 hover:text-gray-300'
        )}
      >
        <Lock className="h-5 w-5" />
        <span>Riêng tư</span>
        {activeTab === 'private' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
        )}
      </button>
    </div>
  );
}
