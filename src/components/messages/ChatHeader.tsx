import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User } from '@/types';

interface ChatHeaderProps {
  user?: User;
  onBack?: () => void;
  showBackButton?: boolean;
  isTyping?: boolean;
}

export function ChatHeader({ user, onBack, showBackButton = false, isTyping = false }: ChatHeaderProps) {
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    if (user?.id) {
      navigate(`/user/${user.id}`);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#1e1e1e] flex-shrink-0">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-[#2a2a2a]"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        
        <div 
          onClick={handleAvatarClick}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Avatar
            src={user?.avatarUrl}
            alt={user?.username}
            size="md"
          />
        </div>
        
        <div>
          <h2 className="font-semibold text-white">{user?.fullName || user?.username}</h2>
          {isTyping ? (
            <p className="text-sm text-[#FE2C55] italic">đang gõ...</p>
          ) : (
            <p className="text-sm text-gray-500">@{user?.username}</p>
          )}
        </div>
      </div>
      
      <Button variant="ghost" size="icon" className="text-white hover:bg-[#2a2a2a]">
        <MoreVertical className="w-5 h-5" />
      </Button>
    </div>
  );
}
