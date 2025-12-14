import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingSwitch } from './SettingSwitch';

interface NotificationSettingsSectionProps {
  settings: {
    likes: boolean;
    comments: boolean;
    newFollowers: boolean;
    mentions: boolean;
  };
  onUpdate: (key: string, value: boolean) => void;
}

export function NotificationSettingsSection({ settings, onUpdate }: NotificationSettingsSectionProps) {
  return (
    <Card className="bg-[#1e1e1e] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Thông báo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingSwitch
          label="Lượt thích"
          checked={settings.likes}
          onChange={(checked) => onUpdate('likes', checked)}
        />
        <SettingSwitch
          label="Bình luận"
          checked={settings.comments}
          onChange={(checked) => onUpdate('comments', checked)}
        />
        <SettingSwitch
          label="Người theo dõi mới"
          checked={settings.newFollowers}
          onChange={(checked) => onUpdate('newFollowers', checked)}
        />
        <SettingSwitch
          label="Nhắc đến"
          checked={settings.mentions}
          onChange={(checked) => onUpdate('mentions', checked)}
        />
        <button className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors">
          Lưu
        </button>
      </CardContent>
    </Card>
  );
}
