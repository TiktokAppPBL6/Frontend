# Multi-Instance Testing Guide

## Chạy Nhiều Instances để Test Notifications & Messages

### 🎯 Mục đích

Chạy nhiều instances của frontend trên các ports khác nhau để test:
- ✅ Real-time notifications (like, comment, follow)
- ✅ Real-time messaging
- ✅ Typing indicators
- ✅ Read receipts
- ✅ Online status

---

## 🚀 Cách 1: Tự động (Khuyên dùng)

### Chạy tất cả instances:

```powershell
cd tiktok-clone
.\run-multi-instances.ps1
```

Sẽ mở 3 cửa sổ PowerShell mới:
- **Port 3000**: User A
- **Port 3001**: User B
- **Port 3002**: User C

### Dừng tất cả instances:

```powershell
.\stop-all-instances.ps1
```

---

## 🔧 Cách 2: Thủ công

Mở 3 terminal riêng biệt và chạy:

### Terminal 1 - User A (Port 3000):
```powershell
cd tiktok-clone
npm run dev:3000
```

### Terminal 2 - User B (Port 3001):
```powershell
cd tiktok-clone
npm run dev:3001
```

### Terminal 3 - User C (Port 3002):
```powershell
cd tiktok-clone
npm run dev:3002
```

---

## 🧪 Test Scenarios

### 1️⃣ Test Like Notification

1. **Browser 1** (localhost:3000): Đăng nhập User A, post video
2. **Browser 2** (localhost:3001): Đăng nhập User B, like video của User A
3. **Kiểm tra**: User A sẽ nhận notification real-time 🔔

### 2️⃣ Test Comment Notification

1. **Browser 1** (localhost:3000): User A post video
2. **Browser 2** (localhost:3001): User B comment vào video
3. **Kiểm tra**: User A nhận notification với preview comment 💬

### 3️⃣ Test Follow Notification

1. **Browser 1** (localhost:3000): User A đang online
2. **Browser 2** (localhost:3001): User B follow User A
3. **Kiểm tra**: User A nhận notification follow 👥

### 4️⃣ Test Real-time Messaging

1. **Browser 1** (localhost:3000): User A mở Messages page
2. **Browser 2** (localhost:3001): User B mở Messages page
3. **Browser 2**: User B gửi tin nhắn cho User A
4. **Kiểm tra**: 
   - User A nhận tin nhắn real-time ✉️
   - Typing indicator hiển thị khi gõ ⌨️
   - Read receipt khi User A đọc tin nhắn ✓✓

### 5️⃣ Test Online Status

1. **Browser 1** (localhost:3000): User A đăng nhập
2. **Browser 2** (localhost:3001): User B mở Messages
3. **Kiểm tra**: User A hiển thị online (dot xanh) 🟢
4. Close Browser 1
5. **Kiểm tra**: User A hiển thị offline (dot xám) ⚪

---

## 📋 Port Mapping

| Port | User | Purpose |
|------|------|---------|
| 3000 | User A | Primary instance |
| 3001 | User B | Secondary instance |
| 3002 | User C | Tertiary instance (optional) |
| 3003 | User D | Extra instance (optional) |

---

## 🔍 Troubleshooting

### Lỗi: "Failed to fetch dynamically imported module"

**Nguyên nhân**: Service Worker cache cũ từ port khác

**Giải pháp**: Mở DevTools → Console → Chạy:

```javascript
// Unregister Service Workers
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});

// Clear caches
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});

// Reload
location.reload();
```

### Lỗi: Port đã được sử dụng

**Giải pháp**: Stop all instances trước:

```powershell
.\stop-all-instances.ps1
```

### WebSocket không kết nối

**Kiểm tra**:
1. Backend có đang chạy? (`netstat -ano | findstr :8000`)
2. Token có hợp lệ? (Check localStorage)
3. Check console logs: `🔌 Connecting to WebSocket`

---

## 💡 Tips

1. **Incognito Mode**: Dùng incognito để tránh session conflicts
2. **Different Browsers**: Chrome cho User A, Edge cho User B, Firefox cho User C
3. **Clear Storage**: Clear localStorage/sessionStorage khi đổi user
4. **Check Console**: Luôn mở DevTools để xem logs
5. **Network Tab**: Xem WebSocket connections trong Network tab (WS filter)

---

## 🎨 Console Logs Quan Trọng

### Frontend Logs:
```
🔌 WebSocket Service initialized
🔌 Connecting to WebSocket: ws://localhost:8000/api/v1/ws/***
✅ WebSocket connected successfully
📨 WebSocket message: connection {...}
📨 WebSocket message: notification {...}
💓 Sent ping
```

### Backend Logs:
```
✅ User 123 connected. Total connections: 1
📬 Sent notification to user 123: like
💬 Sent message to user 456 from 123
✓ Sent read receipt to user 123 for conversation 789
```

---

## 📚 Related Documentation

- [WEBSOCKET_SYSTEM_COMPLETE.md](../WEBSOCKET_SYSTEM_COMPLETE.md) - WebSocket architecture
- [API_CONFIG.md](./docs/API_CONFIG.md) - API configuration
- [package.json](./package.json) - Available scripts

---

## 🎯 Quick Start

```powershell
# 1. Start backend (chỉ 1 lần)
cd Backend-Business
D:\Good\backend\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 2. Start multiple frontends
cd tiktok-clone
.\run-multi-instances.ps1

# 3. Open browsers
# http://localhost:3000 → Login User A
# http://localhost:3001 → Login User B
# http://localhost:3002 → Login User C

# 4. Start testing!
```

Enjoy testing! 🚀
