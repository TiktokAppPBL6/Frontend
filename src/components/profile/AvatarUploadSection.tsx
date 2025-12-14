import { Camera } from 'lucide-react';
import { Avatar } from '@/components/common/Avatar';

interface AvatarUploadSectionProps {
  currentAvatar?: string;
  previewUrl: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function AvatarUploadSection({ 
  currentAvatar, 
  previewUrl, 
  onFileChange, 
  disabled 
}: AvatarUploadSectionProps) {
  return (
    <div className="flex items-center gap-6 pb-6 border-b border-gray-800">
      <div className="relative group">
        <Avatar
          src={previewUrl || currentAvatar}
          alt="Profile"
          size="lg"
          className="w-24 h-24"
        />
        <label
          htmlFor="avatar-upload"
          className={`absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <Camera className="h-6 w-6 text-white" />
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
      <div>
        <h3 className="text-white font-semibold mb-1">Ảnh đại diện</h3>
        <p className="text-sm text-gray-400 mb-2">JPG, PNG (tối đa 5MB)</p>
        <label
          htmlFor="avatar-upload"
          className={`inline-block px-4 py-2 text-sm font-medium text-white bg-[#FE2C55] rounded-lg hover:bg-[#FE2C55]/90 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          Tải ảnh lên
        </label>
      </div>
    </div>
  );
}
