import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ConversationsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function ConversationsHeader({ searchQuery, onSearchChange }: ConversationsHeaderProps) {
  return (
    <div className="flex-shrink-0 p-4 border-b border-gray-800">
      <h1 className="text-2xl font-bold text-white mb-4">Tin nhắn</h1>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-[#121212] border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>
    </div>
  );
}
