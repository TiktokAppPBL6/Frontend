import { Toast } from 'react-hot-toast';
import { Bell } from 'lucide-react';

interface NotificationToastProps {
  t: Toast;
  username: string;
  message: string;
  iconEmoji?: string; // Optional now since we removed the badge
  avatar?: string;
  onDismiss: () => void;
}

/**
 * Beautiful TikTok-style notification toast popup
 */
export function NotificationToast({ 
  t, 
  username, 
  message, 
  avatar,
  onDismiss 
}: NotificationToastProps) {
  return (
    <div 
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gradient-to-r from-[#1a1a1a] via-[#252525] to-[#1a1a1a] shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 border border-[#FE2C55]/30 backdrop-blur-xl`}
      style={{
        boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(254,44,85,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
      }}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start gap-3">
          {/* Avatar with glow effect */}
          <div className="flex-shrink-0 relative">
            {avatar ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55] to-[#FE6B8B] rounded-full blur-md opacity-60"></div>
                <img
                  className="h-12 w-12 rounded-full ring-2 ring-[#FE2C55]/50 relative"
                  src={avatar}
                  alt={username}
                />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FE2C55] to-[#FE6B8B] rounded-full blur-md opacity-40"></div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ring-2 ring-gray-700 relative">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="ml-1 flex-1">
            <p className="text-sm font-bold text-white flex items-center gap-2">
              @{username}
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FE2C55] animate-pulse"></span>
            </p>
            <p className="mt-1 text-sm text-gray-300 leading-relaxed">
              {message}
            </p>
            <p className="mt-1.5 text-xs text-gray-500">
              Vừa xong
            </p>
          </div>
        </div>
      </div>
      
      {/* Close button */}
      <div className="flex border-l border-gray-800">
        <button
          onClick={onDismiss}
          className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 focus:outline-none transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
