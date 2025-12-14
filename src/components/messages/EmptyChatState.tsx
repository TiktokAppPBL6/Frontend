import { Send } from 'lucide-react';

export function EmptyChatState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <Send className="w-24 h-24 mb-4" />
      <h2 className="text-xl font-semibold mb-2 text-white">Tin nhắn của bạn</h2>
      <p className="text-center max-w-sm text-gray-500">
        Chọn một cuộc trò chuyện hoặc bắt đầu cuộc trò chuyện mới
      </p>
    </div>
  );
}
