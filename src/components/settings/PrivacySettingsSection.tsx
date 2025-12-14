import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingSwitch } from './SettingSwitch';

interface PrivacySettingsSectionProps {
  settings: {
    privateAccount: boolean;
    allowComments: boolean;
    allowDuet: boolean;
  };
  onUpdate: (key: string, value: boolean) => void;
}

export function PrivacySettingsSection({ settings, onUpdate }: PrivacySettingsSectionProps) {
  return (
    <Card className="bg-[#1e1e1e] border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Quyền riêng tư</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SettingSwitch
          label="Tài khoản riêng tư"
          checked={settings.privateAccount}
          onChange={(checked) => onUpdate('privateAccount', checked)}
        />
        <SettingSwitch
          label="Cho phép bình luận"
          checked={settings.allowComments}
          onChange={(checked) => onUpdate('allowComments', checked)}
        />
        <SettingSwitch
          label="Cho phép Duet"
          checked={settings.allowDuet}
          onChange={(checked) => onUpdate('allowDuet', checked)}
        />
        <button className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors">
          Lưu
        </button>
      </CardContent>
    </Card>
  );
}
