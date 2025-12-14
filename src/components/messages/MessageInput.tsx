import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Image as ImageIcon } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}

export function MessageInput({ value, onChange, onSubmit, disabled }: MessageInputProps) {
  return (
    <form onSubmit={onSubmit} className="flex-shrink-0 p-4 border-t border-gray-800 bg-[#1e1e1e]">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
        >
          <ImageIcon className="w-5 h-5" />
        </Button>
        
        <Input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-[#121212] border-gray-700 text-white placeholder:text-gray-500"
          disabled={disabled}
        />
        
        <Button
          type="submit"
          disabled={!value.trim() || disabled}
          className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </form>
  );
}
