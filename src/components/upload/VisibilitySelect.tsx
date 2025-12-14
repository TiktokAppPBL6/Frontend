interface VisibilitySelectProps {
  value: 'public' | 'hidden';
  onChange: (value: 'public' | 'hidden') => void;
}

export function VisibilitySelect({ value, onChange }: VisibilitySelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300">Hiển thị</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as 'public' | 'hidden')}
        className="w-full rounded-md border border-gray-700 bg-[#121212] text-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE2C55]"
      >
        <option value="public">Công khai</option>
        <option value="hidden">Riêng tư</option>
      </select>
    </div>
  );
}
