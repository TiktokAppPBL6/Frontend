# 🔔 Real-time Notification & WebSocket System - TikTok Style

## ✅ HOÀN THÀNH - Real-time Notifications như TikTok!

Hệ thống thông báo và tin nhắn real-time đã được triển khai hoàn chỉnh với thiết kế hiện đại giống TikTok.

---

## 🎯 Tính năng

### 1. **Real-time Notifications** 
- ✅ Thông báo khi có người like video của bạn
- ✅ Thông báo khi có người comment vào video
- ✅ Thông báo khi có người follow bạn
- ✅ Bell icon với badge count (số lượng chưa đọc)
- ✅ Dropdown notification list
- ✅ Mark as read / Mark all as read
- ✅ Browser notifications (nếu được phép)
- ✅ Lưu notifications trong localStorage
- ✅ Avatar + thumbnail preview
- ✅ Timestamp với format "2 minutes ago"

### 2. **WebSocket Connection**
- ✅ Auto-connect khi user login
- ✅ Auto-reconnect khi mất kết nối (max 5 attempts)
- ✅ Ping/pong để keep-alive
- ✅ Connection status indicator (chỉ hiện khi offline)
- ✅ Graceful disconnect khi logout

### 3. **Backend Integration**
- ✅ WebSocket endpoint: `/api/v1/ws/{token}`
- ✅ Gửi notification khi:
  - User A like video của User B → Thông báo cho User B
  - User A comment vào video của User B → Thông báo cho User B
  - User A follow User B → Thông báo cho User B
- ✅ Connection Manager quản lý nhiều connections per user
- ✅ Typing indicators support

---

## 📁 Files Created/Modified

### Frontend

#### **New Components:**
- ✅ `tiktok-clone/src/components/common/NotificationCenter.tsx`
  - Bell icon với badge count
  - Dropdown notification list
  - Real-time updates
  - Mark as read/unread
  - Browser notifications

#### **Modified:**
- ✅ `tiktok-clone/src/components/layout/Topbar.tsx`
  - Thêm NotificationCenter vào header
- ✅ `tiktok-clone/src/components/common/WebSocketStatus.tsx`
  - Hiện đại hóa UI
  - Chỉ hiện khi offline/reconnecting
- ✅ `tiktok-clone/src/services/websocket.service.ts`
  - WebSocket service với auto-reconnect
  - Event handlers
  - Ping/pong

### Backend

#### **Modified:**
- ✅ `Backend-Business/app/api/v1/social.py`
  - Import `send_notification_ws`
  - Gửi notification khi like video
  - Gửi notification khi follow user
- ✅ `Backend-Business/app/api/v1/comments.py`
  - Import `send_notification_ws`
  - Gửi notification khi comment
- ✅ `Backend-Business/app/api/v1/websocket.py`
  - Connection Manager
  - Helper functions: `send_notification_ws`, `send_message_ws`

---

## 🚀 Usage

### Backend
```bash
# Activate venv
D:\Good\backend\.venv\Scripts\Activate.ps1

# Start server
cd Backend-Business
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd tiktok-clone
npm run dev
```

---

## 🔌 WebSocket Flow

### 1. **Connection**
```typescript
// Auto-connect khi user login (trong AuthGuard hoặc App)
import { wsService } from '@/services/websocket.service';

const token = localStorage.getItem('token');
wsService.connect(token);
```

### 2. **Subscribe to Notifications**
```typescript
// NotificationCenter tự động subscribe
wsService.on('notification', (message) => {
  // Handle notification
  console.log('New notification:', message.data);
});
```

### 3. **Server sends notification**
```python
# Backend - When user likes a video
await send_notification_ws(
    user_id=video.userId,
    notification_data={
        "type": "like",
        "message": f"{current_user.username} liked your video",
        "user_id": current_user.id,
        "username": current_user.username,
        "avatar": current_user.avatar,
        "video_id": video_id,
        "video_thumbnail": video.thumbnailUrl
    }
)
```

### 4. **Frontend receives & displays**
- Bell icon badge count tăng lên
- Dropdown list cập nhật real-time
- Browser notification hiện ra (nếu có permission)
- Lưu vào localStorage

---

## 🎨 UI/UX Features

### **Bell Icon với Badge**
```
🔔  (3)  <- Red badge với số lượng unread
```

### **Notification Dropdown**
```
┌─────────────────────────────────────┐
│ Notifications   Mark all read | Clear │
├─────────────────────────────────────┤
│ 👤 @username started following you  │
│    2 minutes ago              • NEW │
├─────────────────────────────────────┤
│ ❤️ @user liked your video     📹  │
│    5 minutes ago                    │
├─────────────────────────────────────┤
│ 💬 @user commented: "Nice vid..."   │
│    1 hour ago                  📹  │
└─────────────────────────────────────┘
```

### **Connection Status (chỉ khi offline)**
```
🔴 Mất kết nối
🟡 Đang kết nối lại...
```

---

## 🔧 Configuration

### **Notification Types**
```typescript
type NotificationType = 'like' | 'comment' | 'follow' | 'message';
```

### **Storage**
- `localStorage.notifications` - Lưu tối đa 50 notifications
- Auto-clear khi user click "Clear all"

### **Reconnection**
- Max attempts: 5
- Delay: 3s, 6s, 9s, 12s, 15s (incremental)

---

## 📊 Testing

### **Test Notification System:**

1. **Mở 2 browsers:**
   - Browser A: User 1 login
   - Browser B: User 2 login

2. **User 1 like video của User 2:**
   - ✅ User 2 sẽ thấy bell icon badge tăng
   - ✅ Notification xuất hiện trong dropdown
   - ✅ Browser notification hiện ra

3. **User 1 follow User 2:**
   - ✅ User 2 nhận notification "started following you"

4. **User 1 comment vào video của User 2:**
   - ✅ User 2 nhận notification với preview comment

### **Test Reconnection:**

1. Stop backend server
2. Frontend hiện "Mất kết nối"
3. Start backend server
4. Frontend tự động reconnect: "Đang kết nối lại..."
5. Connected → Status indicator biến mất

---

## 🎉 Kết quả

Bây giờ bạn có:
- ✅ **Real-time notifications** giống TikTok
- ✅ **Bell icon** với badge count
- ✅ **Dropdown list** với mark as read
- ✅ **Auto-reconnect** khi mất kết nối
- ✅ **Browser notifications**
- ✅ **Modern UI/UX** với avatars, thumbnails
- ✅ **Persistent storage** trong localStorage
- ✅ **Connection status indicator**

---

## 🔜 Next Steps (Optional)

- [ ] Message/Chat system với typing indicators
- [ ] Online status (green dot khi user online)
- [ ] Notification sounds
- [ ] Push notifications (khi tab không active)
- [ ] Notification settings (mute/unmute types)
- [ ] Group notifications (collapse multiple similar)

---

**Backend running:** `http://0.0.0.0:8000` ✅  
**Frontend running:** `http://localhost:3000` ✅  
**WebSocket endpoint:** `ws://127.0.0.1:8000/api/v1/ws/{token}` ✅  

**Refresh browser và test thôi! 🚀**
