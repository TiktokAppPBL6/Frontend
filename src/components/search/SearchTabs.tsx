import { User, Video } from 'lucide-react';

interface SearchTabsProps {
  activeTab: 'users' | 'videos';
  onTabChange: (tab: 'users' | 'videos') => void;
}

export function SearchTabs({ activeTab, onTabChange }: SearchTabsProps) {
  return (
    <div className="flex gap-8 border-b border-gray-800 mb-6 bg-[#1e1e1e] rounded-t-lg px-4">
      <button
        onClick={() => onTabChange('videos')}
        className={`pb-4 pt-4 px-2 font-semibold transition-colors ${
          activeTab === 'videos'
            ? 'text-[#FE2C55] border-b-2 border-[#FE2C55]'
            : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        <Video className="inline h-5 w-5 mr-2" />
        Video
      </button>
      <button
        onClick={() => onTabChange('users')}
        className={`pb-4 pt-4 px-2 font-semibold transition-colors ${
          activeTab === 'users'
            ? 'text-[#FE2C55] border-b-2 border-[#FE2C55]'
            : 'text-gray-400 hover:text-gray-300'
        }`}
      >
        <User className="inline h-5 w-5 mr-2" />
        Người dùng
      </button>
    </div>
  );
}
