interface VideoTitleInputProps {
  value: string;
  error?: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function VideoTitleInput({ 
  value, 
  error, 
  onChange, 
  maxLength = 150 
}: VideoTitleInputProps) {
  const isOverLimit = value.length > maxLength;
  const isNearLimit = value.length > maxLength - 15;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-300">
          Tiêu đề <span className="text-red-500">*</span>
        </label>
        <span className={`text-xs transition-colors ${
          isOverLimit 
            ? "text-red-500 font-medium" 
            : isNearLimit 
              ? "text-yellow-500" 
              : "text-gray-500"
        }`}>
          {value.length}/{maxLength}
        </span>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-gray-700 bg-[#121212] text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE2C55] placeholder:text-gray-500"
        placeholder="Nhập tiêu đề video..."
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {isOverLimit && !error && (
        <p className="text-sm text-red-500 font-medium">Vượt quá giới hạn!</p>
      )}
    </div>
  );
}
