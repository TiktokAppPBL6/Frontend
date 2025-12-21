# 💬 Real-time Chat System - TikTok Style

## ✅ HOÀN THÀNH - Hệ thống chat real-time với Followers/Following!

Chat system với WebSocket real-time, chỉ cho phép nhắn tin với những người following hoặc follower.

---

## 🎯 Tính năng

### 1. **Conversation List**
- ✅ Danh sách conversations với avatar, last message, timestamp
- ✅ **Online status indicator** (green dot khi user online)
- ✅ **Unread badge count** (số tin nhắn chưa đọc)
- ✅ Search conversations
- ✅ Filter: "Tất cả" vs "Following"
- ✅ Sort theo thời gian tin nhắn gần nhất
- ✅ Badge "Following" cho những người bạn đang follow
- ✅ Badge "Bạn bè" cho mutual friends

### 2. **Chat Window**
- ✅ **Real-time messaging** - Tin nhắn xuất hiện ngay lập tức
- ✅ **Typing indicators** - "..." khi đối phương đang gõ
- ✅ **Read receipts** - ✓ (sent) vs ✓✓ (seen)
- ✅ **Online status** trong header
- ✅ Message bubbles với timestamp
- ✅ Avatar cho messages
- ✅ Auto-scroll to bottom
- ✅ Empty state khi chưa có tin nhắn

### 3. **New Message Modal**
- ✅ **Chỉ cho phép nhắn tin** với:
  - Followers (người follow bạn)
  - Following (người bạn đang follow)
  - **KHÔNG** cho phép nhắn tin random user
- ✅ Search users
- ✅ Sort: Mutual friends → Following → Followers
- ✅ Badge indicators: "Bạn bè", "Following", "Follower"

### 4. **WebSocket Real-time**
- ✅ Real-time message delivery
- ✅ Typing indicators (gửi/nhận)
- ✅ Online status updates
- ✅ Message read status
- ✅ Auto-reconnect

---

## 📁 Files Created

### Frontend Components

#### **Chat Components:**
- ✅ `tiktok-clone/src/components/messages/ChatWindow.tsx`
  - Chat interface chính
  - Message bubbles, input field
  - Typing indicators, read receipts
  - Online status display
  
- ✅ `tiktok-clone/src/components/messages/ConversationList.tsx`
  - Sidebar danh sách conversations
  - Search & filter
  - Unread badges, online status
  - Following/Follower indicators

- ✅ `tiktok-clone/src/components/messages/NewMessageModal.tsx`
  - Modal để bắt đầu chat mới
  - **Chỉ hiện Followers/Following**
  - Search & sort users
  - Mutual friends priority

#### **Pages:**
- ✅ `tiktok-clone/src/pages/MessagesNew.tsx`
  - Messages page mới với components hiện đại
  - Responsive: sidebar + chat window
  - WebSocket integration

### Backend (Đã có sẵn)
- ✅ `Backend-Business/app/api/v1/messages.py`
  - Send message API với WebSocket notification
  - Get conversation
  - Get inbox
- ✅ `Backend-Business/app/api/v1/websocket.py`
  - `send_message_ws()` helper
  - Typing indicator handling

---

## 🔌 WebSocket Events

### **Client → Server:**

```typescript
// Typing indicator
{
  type: 'typing',
  receiver_id: number,
  is_typing: boolean
}
```

### **Server → Client:**

```typescript
// New message
{
  type: 'message',
  data: {
    id: number,
    sender_id: number,
    receiver_id: number,
    content: string,
    createdAt: string,
    sender: {
      id, username, avatar, fullName
    }
  }
}

// Typing indicator
{
  type: 'typing',
  sender_id: number,
  sender_username: string,
  is_typing: boolean
}

// Message read
{
  type: 'message_read',
  read_by_user_id: number
}
```

---

## 🚀 Usage

### **1. Thay thế Messages page cũ:**

```bash
# Backup old file
mv tiktok-clone/src/pages/Messages.tsx tiktok-clone/src/pages/Messages.tsx.old

# Rename new file
mv tiktok-clone/src/pages/MessagesNew.tsx tiktok-clone/src/pages/Messages.tsx
```

### **2. Restart dev server:**
```bash
cd tiktok-clone
npm run dev
```

### **3. Test messaging:**
1. User A và User B phải follow nhau (hoặc ít nhất 1 chiều)
2. User A mở Messages → Click "Tin nhắn mới"
3. Chỉ thấy danh sách Followers/Following
4. Chọn User B → Bắt đầu chat
5. Typing indicators + real-time messages + read receipts

---

## 🎨 UI/UX Features

### **Conversation Item:**
```
┌─────────────────────────────────────┐
│ 👤 User Name • Following         2m │
│    Last message preview...       🔵3 │
│    (Online status) (Unread badge)   │
└─────────────────────────────────────┘
```

### **Chat Window:**
```
┌──────────────────────────────────────┐
│ ← 👤 User Name (Đang hoạt động) ⋮   │
├──────────────────────────────────────┤
│                                      │
│  👤 [Hey!]                           │
│     2 mins ago                       │
│                                      │
│              [Hi there!] 💬          │
│              Just now ✓✓             │
│                                      │
│  👤 ... (typing)                     │
│                                      │
├──────────────────────────────────────┤
│ 📷 😊 [Type message here...] [📤]    │
└──────────────────────────────────────┘
```

### **New Message Modal:**
```
┌─────────────────────────────────────┐
│ Tin nhắn mới                    ✕   │
├─────────────────────────────────────┤
│ 🔍 [Search...]                      │
├─────────────────────────────────────┤
│ 👤 User A          [Bạn bè]         │
│    @userA • Following • Follower    │
├─────────────────────────────────────┤
│ 👤 User B          [Following]      │
│    @userB • Following               │
├─────────────────────────────────────┤
│ 👤 User C          [Follower]       │
│    @userC • Follower                │
└─────────────────────────────────────┘
```

---

## 🔒 Security & Privacy

### **Message Restrictions:**
- ✅ Chỉ nhắn tin với Followers/Following
- ✅ Không thể nhắn tin cho chính mình
- ✅ Backend validate receiver existence
- ✅ Frontend validate follow status

### **Why this design?**
Giống TikTok, chỉ những người có connection mới có thể nhắn tin nhau:
- Tránh spam từ strangers
- Privacy & safety
- Encourage following relationship

---

## 📊 Database Models

### **Message Model (Backend):**
```python
class Message:
    id: int
    senderId: int
    receiverId: int
    content: str
    mediaUrl: Optional[str]
    status: MessageStatus  # pending, delivered, seen
    createdAt: datetime
    
    # Relations
    sender: User
    receiver: User
```

### **Conversation (Frontend - Computed):**
```typescript
interface Conversation {
  userId: number;
  username: string;
  fullName?: string;
  avatar?: string;
  lastMessage?: Message;
  unreadCount?: number;
  isOnline?: boolean;
}
```

---

## 🧪 Testing Scenarios

### **Test 1: Follow → Message**
1. User A follow User B
2. User A → Messages → "Tin nhắn mới"
3. ✅ User B xuất hiện trong danh sách
4. Click User B → Chat opens
5. Send message → ✅ User B nhận real-time

### **Test 2: Mutual Friends**
1. User A follow User B
2. User B follow User A
3. User A → "Tin nhắn mới"
4. ✅ User B có badge "Bạn bè"
5. ✅ User B xuất hiện đầu tiên (priority)

### **Test 3: Typing Indicators**
1. User A và User B đang chat
2. User A gõ chữ
3. ✅ User B thấy "... (typing)"
4. User A stop typing
5. ✅ Indicator biến mất sau 2s

### **Test 4: Read Receipts**
1. User A send message → ✅ ✓ (sent)
2. User B mở chat
3. ✅ Message tự động mark as read
4. ✅ User A thấy ✓✓ (seen)

### **Test 5: Online Status**
1. User A online
2. ✅ Green dot hiện ở avatar
3. ✅ Header hiện "Đang hoạt động"
4. User A logout
5. ✅ Status → "Offline"

---

## 🎉 Kết quả

Bây giờ bạn có:
- ✅ **Real-time chat** như TikTok
- ✅ **Typing indicators** live
- ✅ **Read receipts** (✓ vs ✓✓)
- ✅ **Online status** indicators
- ✅ **Chỉ chat với Followers/Following**
- ✅ **Search & filter** conversations
- ✅ **Unread badges** count
- ✅ **Responsive design** (mobile + desktop)
- ✅ **Auto-scroll** to bottom
- ✅ **WebSocket auto-reconnect**

---

## 🔜 Future Enhancements (Optional)

- [ ] Media messages (images/videos)
- [ ] Voice messages
- [ ] Message reactions (❤️👍😂)
- [ ] Delete/Edit messages
- [ ] Message forwarding
- [ ] Group chats
- [ ] Message search
- [ ] Push notifications khi app ở background
- [ ] Video/Voice calls

---

**Backend:** ✅ Running on `http://0.0.0.0:8000`  
**Frontend:** ✅ Running on `http://localhost:3000`  
**WebSocket:** ✅ Connected via `ws://127.0.0.1:8000/api/v1/ws/{token}`  

**Thử ngay tính năng chat! 💬🚀**
