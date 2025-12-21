import { Languages, Volume2 } from 'lucide-react';

interface DubbingSettingsProps {
  speakerId: 'id_1' | 'id_2' | 'id_3' | 'id_4';
  onSpeakerChange: (speakerId: 'id_1' | 'id_2' | 'id_3' | 'id_4') => void;
}

const SPEAKERS = [
  { id: 'id_1', name: 'Nữ - Giọng Trẻ', icon: '👱‍♀️' },
  { id: 'id_2', name: 'Nam - Giọng Trẻ', icon: '👨' },
  { id: 'id_3', name: 'Nữ - Giọng Trung niên', icon: '👩' },
  { id: 'id_4', name: 'Nam - Giọng Trung niên', icon: '🧔' },
] as const;

export function DubbingSettings({ 
  speakerId, 
  onSpeakerChange 
}: DubbingSettingsProps) {
  return (
    <div className="space-y-4 p-4 rounded-lg border border-gray-700 bg-[#121212]">
      <div className="flex items-center gap-3">
        <Languages className="h-5 w-5 text-[#FE2C55]" />
        <span className="text-sm font-medium text-gray-300">Lồng tiếng tự động</span>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Volume2 className="h-4 w-4" />
          <span>Chọn giọng đọc:</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SPEAKERS.map((speaker) => (
            <label
              key={speaker.id}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                speakerId === speaker.id
                  ? 'border-[#FE2C55] bg-[#FE2C55]/10'
                  : 'border-gray-700 hover:border-gray-600 bg-[#1e1e1e]'
              }`}
            >
              <input
                type="radio"
                name="speaker"
                value={speaker.id}
                checked={speakerId === speaker.id}
                onChange={(e) => onSpeakerChange(e.target.value as typeof speakerId)}
                className="hidden"
              />
              <span className="text-2xl">{speaker.icon}</span>
              <span className="text-sm text-gray-300 flex-1">{speaker.name}</span>
              {speakerId === speaker.id && (
                <div className="w-2 h-2 rounded-full bg-[#FE2C55]" />
              )}
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 italic">
          💡 Video sẽ được lồng tiếng tự động sang tiếng Việt nếu phát hiện ngôn ngữ khác
        </p>
      </div>
    </div>
  );
}
