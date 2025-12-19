import { useState } from 'react';
import { Avatar } from '@/components/common/Avatar';
import { MoreVertical, Flag } from 'lucide-react';
import { getAvatarUrl, formatDate } from '@/lib/utils';
import { ReportModal } from '@/components/common/ReportModal';
import { useAuthStore } from '@/app/store/auth';

interface CommentItemProps {
  comment: any;
}

export function CommentItem({ comment }: CommentItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const currentUser = useAuthStore((s) => s.user);

  const u = comment.user || {};
  const username = comment.username ?? u.username ?? u.user_name ?? 'user';
  const fullName = comment.fullName ?? comment.full_name ?? u.fullName ?? u.full_name ?? '';
  const avatar = getAvatarUrl(comment.avatarUrl ?? comment.avatar_url ?? u.avatarUrl ?? u.avatar_url);
  const userId = comment.userId ?? comment.user_id ?? u.id;
  const isOwnComment = currentUser?.id === userId;

  const handleReport = () => {
    setShowMenu(false);
    setShowReportModal(true);
  };

  return (
    <>
      <div className="flex gap-3 bg-[#1E1E1E] rounded-xl p-3 border border-gray-800 hover:border-gray-700 transition-all group">
        <Avatar src={avatar} alt={username} size="sm" className="ring-2 ring-gray-800" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-white text-sm font-bold truncate">{fullName || username}</p>
            <span className="text-gray-500 text-xs">· {formatDate(comment.createdAt ?? comment.created_at)}</span>
          </div>
          <p className="text-gray-400 text-xs mb-1.5">@{username}</p>
          <p className="text-gray-300 text-[13px] leading-relaxed whitespace-pre-wrap break-words">{comment.content}</p>
        </div>

        {/* Options Menu */}
        {!isOwnComment && (
          <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-[#1e1e1e] rounded-lg shadow-xl border border-gray-800 overflow-hidden z-50">
                  <button
                    onClick={handleReport}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-[#2a2a2a] transition-colors text-left"
                  >
                    <Flag className="w-4 h-4" />
                    <span className="text-sm font-medium">Báo cáo</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="comment"
        targetId={comment.id}
        targetInfo={{ title: `Bình luận từ @${username}` }}
      />
    </>
  );
}
