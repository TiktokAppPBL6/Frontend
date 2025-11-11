import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

type SectionKey = 'account' | 'privacy' | 'notifications' | 'language' | 'security';

export function Settings() {
  const [active, setActive] = useState<SectionKey>('account');
  const [settings, setSettings] = useState({
    privacy: {
      privateAccount: false,
      allowComments: true,
      allowDuet: true,
    },
    notifications: {
      likes: true,
      comments: true,
      newFollowers: true,
      mentions: true,
    },
    language: {
      locale: 'vi-VN',
      contentLanguage: 'vi',
    },
    security: {
      twoFactor: false,
      loginAlerts: true,
    },
  });

  useEffect(() => {
    const raw = localStorage.getItem('app.settings');
    if (raw) {
      try { setSettings(JSON.parse(raw)); } catch {}
    }
  }, []);

  const save = () => {
    localStorage.setItem('app.settings', JSON.stringify(settings));
    toast.success('Đã lưu cài đặt');
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-8">
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-0">
                {([
                  ['account','Tài khoản'],
                  ['privacy','Quyền riêng tư'],
                  ['notifications','Thông báo'],
                  ['language','Ngôn ngữ & Khu vực'],
                  ['security','Bảo mật'],
                ] as [SectionKey,string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActive(key)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${active===key?'border-l-2 border-[#FE2C55] bg-gray-50 font-medium':''}`}
                  >
                    {label}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Content */}
          <div className="md:col-span-3 space-y-6">
            {active === 'account' && (
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tài khoản</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-600">
                  Chỉnh sửa hồ sơ đã được chuyển vào trang Hồ sơ. Vào Hồ sơ và bấm "Chỉnh sửa hồ sơ" để cập nhật tên, username và ảnh.
                </CardContent>
              </Card>
            )}

            {active === 'privacy' && (
              <Card>
                <CardHeader>
                  <CardTitle>Quyền riêng tư</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span>Tài khoản riêng tư</span>
                    <input type="checkbox" checked={settings.privacy.privateAccount} onChange={(e)=>setSettings(s=>({
                      ...s, privacy:{...s.privacy, privateAccount:e.target.checked}
                    }))} />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Cho phép bình luận</span>
                    <input type="checkbox" checked={settings.privacy.allowComments} onChange={(e)=>setSettings(s=>({
                      ...s, privacy:{...s.privacy, allowComments:e.target.checked}
                    }))} />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Cho phép Duet</span>
                    <input type="checkbox" checked={settings.privacy.allowDuet} onChange={(e)=>setSettings(s=>({
                      ...s, privacy:{...s.privacy, allowDuet:e.target.checked}
                    }))} />
                  </label>
                  <Button onClick={save}>Lưu cài đặt</Button>
                </CardContent>
              </Card>
            )}

            {active === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Thông báo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(['likes','comments','newFollowers','mentions'] as (keyof typeof settings.notifications)[]).map((k)=> (
                    <label key={k} className="flex items-center justify-between">
                      <span>{k==='likes'?'Lượt thích':k==='comments'?'Bình luận':k==='newFollowers'?'Người theo dõi mới':'Nhắc đến bạn'}</span>
                      <input type="checkbox" checked={settings.notifications[k]} onChange={(e)=>setSettings(s=>({
                        ...s, notifications:{...s.notifications, [k]: e.target.checked}
                      }))} />
                    </label>
                  ))}
                  <Button onClick={save}>Lưu cài đặt</Button>
                </CardContent>
              </Card>
            )}

            {active === 'language' && (
              <Card>
                <CardHeader>
                  <CardTitle>Ngôn ngữ & Khu vực</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="mr-4">Ngôn ngữ giao diện</label>
                    <select className="border rounded px-3 py-2" value={settings.language.locale} onChange={(e)=>setSettings(s=>({
                      ...s, language:{...s.language, locale:e.target.value}
                    }))}>
                      <option value="vi-VN">Tiếng Việt</option>
                      <option value="en-US">English</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="mr-4">Ngôn ngữ nội dung</label>
                    <select className="border rounded px-3 py-2" value={settings.language.contentLanguage} onChange={(e)=>setSettings(s=>({
                      ...s, language:{...s.language, contentLanguage:e.target.value}
                    }))}>
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <Button onClick={save}>Lưu cài đặt</Button>
                </CardContent>
              </Card>
            )}

            {active === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Bảo mật</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span>Bật xác thực 2 bước</span>
                    <input type="checkbox" checked={settings.security.twoFactor} onChange={(e)=>setSettings(s=>({
                      ...s, security:{...s.security, twoFactor:e.target.checked}
                    }))} />
                  </label>
                  <label className="flex items-center justify-between">
                    <span>Thông báo đăng nhập mới</span>
                    <input type="checkbox" checked={settings.security.loginAlerts} onChange={(e)=>setSettings(s=>({
                      ...s, security:{...s.security, loginAlerts:e.target.checked}
                    }))} />
                  </label>
                  <Button onClick={save}>Lưu cài đặt</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
