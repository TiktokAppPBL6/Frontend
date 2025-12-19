import { useState } from 'react';
import { MoreVertical, Flag, Share2, Link as LinkIcon, Download } from 'lucide-react';
import { ReportModal } from '@/components/common/ReportModal';
import type { Video } from '@/types';
import toast from 'react-hot-toast';

interface VideoOptionsMenuProps {
  video: Video;
}

export function VideoOptionsMenu({ video }: VideoOptionsMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/videos/${video.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Đã sao chép liên kết!');
    setShowMenu(false);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: (video as any).description || (video as any).caption || 'Video trên TikTok Clone',
          url: `${window.location.origin}/videos/${video.id}`,
        });
        setShowMenu(false);
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownload = () => {
    // This would require backend API
    toast.error('Tính năng tải xuống đang được phát triển');
    setShowMenu(false);
  };

  const handleReport = () => {
    setShowMenu(false);
    setShowReportModal(true);
  };

  return (
    <>
      <div className="relative flex flex-col items-center">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex flex-col items-center gap-1 group transition-transform active:scale-90"
          aria-label="More options"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 bg-white/10 backdrop-blur-sm shadow-lg hover:bg-white/20 hover:scale-110">
            <MoreVertical className="w-5 h-5 text-white transition-colors duration-200 group-hover:scale-110" />
          </div>
        </button>

        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <div className="absolute right-0 bottom-full mb-2 w-56 bg-[#1e1e1e] rounded-lg shadow-xl border border-gray-800 overflow-hidden z-50">
              <button
                onClick={handleShare}
                className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#2a2a2a] transition-colors text-left"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Chia sẻ</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#2a2a2a] transition-colors text-left"
              >
                <LinkIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Sao chép liên kết</span>
              </button>

              <button
                onClick={handleDownload}
                className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#2a2a2a] transition-colors text-left"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm font-medium">Tải xuống</span>
              </button>

              <div className="h-px bg-gray-800" />

              <button
                onClick={handleReport}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-[#2a2a2a] transition-colors text-left"
              >
                <Flag className="w-5 h-5" />
                <span className="text-sm font-medium">Báo cáo</span>
              </button>
            </div>
          </>
        )}
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="video"
        targetId={video.id}
        targetInfo={{ title: (video as any).description || (video as any).caption || `Video #${video.id}` }}
      />
    </>
  );
}
