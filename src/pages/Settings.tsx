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
    <div className="min-h-screen bg-[#121212] pt-20 pb-8">
      <div className="container mx-auto max-w-5xl px-4">
        <h1 className="text-2xl font-bold mb-6 text-white">Cài đặt</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="bg-[#1e1e1e] border-gray-800">
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
                    className={`w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 transition-colors ${active===key?'border-l-2 border-[#FE2C55] bg-gray-800 font-medium text-white':''}`}
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
              <Card className="bg-[#1e1e1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Thông tin tài khoản</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-400">
                  Chỉnh sửa hồ sơ đã được chuyển vào trang Hồ sơ. Vào Hồ sơ và bấm "Chỉnh sửa hồ sơ" để cập nhật tên, username và ảnh.
                </CardContent>
              </Card>
            )}

            {active === 'privacy' && (
              <Card className="bg-[#1e1e1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Quyền riêng tư</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center justify-between text-gray-300">
                    <span>Tài khoản riêng tư</span>
                    <input type="checkbox" checked={settings.privacy.privateAccount} onChange={(e)=>setSettings(s=>({
                      ...s, privacy:{...s.privacy, privateAccount:e.target.checked}
                    }))} className="w-4 h-4" />
                  </label>
                  <label className="flex items-center justify-between text-gray-300">
                    <span>Cho phép bình luận</span>
                    <input type="checkbox" checked={settings.privacy.allowComments} onChange={(e)=>setSettings(s=>({
                      ...s, privacy:{...s.privacy, allowComments:e.target.checked}
                    }))} className="w-4 h-4" />
                  </label>
                  <label className="flex items-center justify-between text-gray-300">
                    <span>Cho phép Duet</span>
                    <input type="checkbox" checked={settings.privacy.allowDuet} onChange={(e)=>setSettings(s=>({
                      ...s, privacy:{...s.privacy, allowDuet:e.target.checked}
                    }))} className="w-4 h-4" />
                  </label>
                  <Button onClick={save} className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white">Lưu cài đặt</Button>
                </CardContent>
              </Card>
            )}

            {active === 'notifications' && (
              <Card className="bg-[#1e1e1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Thông báo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(['likes','comments','newFollowers','mentions'] as (keyof typeof settings.notifications)[]).map((k)=> (
                    <label key={k} className="flex items-center justify-between text-gray-300">
                      <span>{k==='likes'?'Lượt thích':k==='comments'?'Bình luận':k==='newFollowers'?'Người theo dõi mới':'Nhắc đến bạn'}</span>
                      <input type="checkbox" checked={settings.notifications[k]} onChange={(e)=>setSettings(s=>({
                        ...s, notifications:{...s.notifications, [k]: e.target.checked}
                      }))} className="w-4 h-4" />
                    </label>
                  ))}
                  <Button onClick={save} className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white">Lưu cài đặt</Button>
                </CardContent>
              </Card>
            )}

            {active === 'language' && (
              <Card className="bg-[#1e1e1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Ngôn ngữ & Khu vực</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-gray-300">
                    <label className="mr-4">Ngôn ngữ giao diện</label>
                    <select className="border border-gray-700 bg-[#121212] text-white rounded px-3 py-2" value={settings.language.locale} onChange={(e)=>setSettings(s=>({
                      ...s, language:{...s.language, locale:e.target.value}
                    }))}>
                      <option value="vi-VN">Tiếng Việt</option>
                      <option value="en-US">English</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <label className="mr-4">Ngôn ngữ nội dung</label>
                    <select className="border border-gray-700 bg-[#121212] text-white rounded px-3 py-2" value={settings.language.contentLanguage} onChange={(e)=>setSettings(s=>({
                      ...s, language:{...s.language, contentLanguage:e.target.value}
                    }))}>
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <Button onClick={save} className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white">Lưu cài đặt</Button>
                </CardContent>
              </Card>
            )}

            {active === 'security' && (
              <Card className="bg-[#1e1e1e] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Bảo mật</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <label className="flex items-center justify-between text-gray-300">
                    <span>Bật xác thực 2 bước</span>
                    <input type="checkbox" checked={settings.security.twoFactor} onChange={(e)=>setSettings(s=>({
                      ...s, security:{...s.security, twoFactor:e.target.checked}
                    }))} className="w-4 h-4" />
                  </label>
                  <label className="flex items-center justify-between text-gray-300">
                    <span>Thông báo đăng nhập mới</span>
                    <input type="checkbox" checked={settings.security.loginAlerts} onChange={(e)=>setSettings(s=>({
                      ...s, security:{...s.security, loginAlerts:e.target.checked}
                    }))} className="w-4 h-4" />
                  </label>
                  <Button onClick={save} className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white">Lưu cài đặt</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
