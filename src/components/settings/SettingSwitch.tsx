interface SettingSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SettingSwitch({ label, checked, onChange }: SettingSwitchProps) {
  return (
    <label className="flex items-center justify-between text-gray-300">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4"
      />
    </label>
  );
}
