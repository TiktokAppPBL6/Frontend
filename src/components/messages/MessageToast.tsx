import { Toast } from 'react-hot-toast';
import { MessageCircle } from 'lucide-react';

interface MessageToastProps {
  t: Toast;
  senderName: string;
  message: string;
  avatar?: string;
  onDismiss: () => void;
}

/**
 * Beautiful TikTok-style message notification toast popup
 */
export function MessageToast({ 
  t, 
  senderName, 
  message, 
  avatar,
  onDismiss 
}: MessageToastProps) {
  return (
    <div 
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-gradient-to-r from-[#1a1a1a] via-[#252525] to-[#1a1a1a] shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 border border-blue-500/30 backdrop-blur-xl cursor-pointer hover:scale-[1.02] transition-transform`}
      style={{
        boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(59,130,246,0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
      }}
      onClick={onDismiss}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start gap-3">
          {/* Avatar with glow effect */}
          <div className="flex-shrink-0 relative">
            {avatar ? (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-md opacity-60"></div>
                <img
                  className="h-12 w-12 rounded-full ring-2 ring-blue-500/50 relative object-cover"
                  src={avatar}
                  alt={senderName}
                />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-md opacity-40"></div>
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center ring-2 ring-gray-700 relative">
                  <MessageCircle className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="ml-1 flex-1">
            <p className="text-sm font-bold text-white flex items-center gap-2">
              {senderName}
              <span className="inline-flex items-center gap-1 text-xs font-normal text-blue-400">
                <MessageCircle className="w-3 h-3" />
                Tin nhắn mới
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-300 leading-relaxed line-clamp-2">
              {message}
            </p>
            <p className="mt-1.5 text-xs text-gray-500">
              Nhấn để xem
            </p>
          </div>
        </div>
      </div>
      
      {/* Close button */}
      <div className="flex border-l border-gray-800">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
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
