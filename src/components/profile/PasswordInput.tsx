import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  disabled?: boolean;
  showCharCount?: boolean;
  minLength?: number;
}

export function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  showCharCount,
  minLength = 6,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-4 py-3 pr-12 bg-[#1E1E1E] border-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FE2C55]/20 transition-all placeholder:text-gray-500 ${
            error ? 'border-red-500' : 'border-gray-800 focus:border-[#FE2C55]'
          }`}
          placeholder={placeholder}
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
        <p className="text-sm text-red-400 mt-1">{error}</p>
      )}
      {showCharCount && value && value.length < minLength && (
        <p className="text-xs text-gray-400 mt-1">
          {value.length}/{minLength} ký tự
        </p>
      )}
    </div>
  );
}
