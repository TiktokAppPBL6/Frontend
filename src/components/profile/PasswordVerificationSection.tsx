import { Eye, EyeOff, Shield } from 'lucide-react';
import { useState } from 'react';

interface PasswordVerificationSectionProps {
  password: string;
  onPasswordChange: (value: string) => void;
  error: string | null;
  disabled?: boolean;
}

export function PasswordVerificationSection({
  password,
  onPasswordChange,
  error,
  disabled,
}: PasswordVerificationSectionProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="pt-4 border-t border-gray-800">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0 mt-1">
          <Shield className="h-5 w-5 text-yellow-500" />
        </div>
        <div>
          <h3 className="text-white font-semibold mb-1">Xác thực bảo mật</h3>
          <p className="text-sm text-gray-400">
            Nhập mật khẩu để xác nhận thay đổi thông tin
          </p>
        </div>
      </div>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={`w-full px-4 py-3 pr-12 bg-[#1E1E1E] border-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE2C55]/20 transition-all placeholder:text-gray-500 ${
            error ? 'border-red-500' : 'border-gray-800 focus:border-[#FE2C55]'
          }`}
          placeholder="Nhập mật khẩu hiện tại"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
}
