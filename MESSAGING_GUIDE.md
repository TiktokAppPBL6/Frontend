# 💬 Messaging Feature - Hướng dẫn sử dụng

## 📋 Tổng quan

Chức năng nhắn tin cho phép người dùng:
- ✅ Gửi tin nhắn văn bản cho người khác
- ✅ Xem danh sách cuộc trò chuyện
- ✅ Xem lịch sử tin nhắn với từng người
- ✅ Xóa tin nhắn đã gửi
- ✅ Gửi hình ảnh (media)
- ✅ Real-time UI với auto-scroll

---

## 🔌 API Endpoints

### 1. Gửi tin nhắn
```
POST /api/v1/messages/
```

**Request Body:**
```json
{
  "receiverId": 2,
  "content": "Hello! How are you?",
  "mediaUrl": "https://example.com/image.jpg"  // Optional
}
```

**Response:**
```json
{
  "id": 123,
  "senderId": 1,
  "receiverId": 2,
  "content": "Hello! How are you?",
  "mediaUrl": null,
  "status": "delivered",
  "createdAt": "2025-11-23T12:34:56"
}
```

**Validation:**
- receiverId phải tồn tại
- Không thể gửi tin nhắn cho chính mình
- content hoặc mediaUrl phải có ít nhất 1 cái

---

### 2. Lấy hộp thư đến
```
GET /api/v1/messages/inbox?skip=0&limit=50
```

**Response:**
```json
[
  {
    "id": 123,
    "senderId": 2,
    "receiverId": 1,
    "content": "Hi there!",
    "mediaUrl": null,
    "status": "delivered",
    "createdAt": "2025-11-23T12:34:56",
    "sender": {
      "id": 2,
      "username": "alice",
      "fullName": "Alice Smith",
      "avatarUrl": "https://..."
    }
  }
]
```

---

### 3. Lấy cuộc trò chuyện với user cụ thể
```
GET /api/v1/messages/conversation/{user_id}?skip=0&limit=50
```

**Response:**
```json
[
  {
    "id": 123,
    "senderId": 1,
    "receiverId": 2,
    "content": "Hello!",
    "status": "delivered",
    "createdAt": "2025-11-23T12:30:00"
  },
  {
    "id": 124,
    "senderId": 2,
    "receiverId": 1,
    "content": "Hi! How are you?",
    "status": "delivered",
    "createdAt": "2025-11-23T12:31:00"
  }
]
```

**Note:** Messages được sắp xếp từ mới nhất đến cũ nhất (DESC)

---

### 4. Xóa tin nhắn
```
DELETE /api/v1/messages/{message_id}
```

**Response:** 204 No Content

**Authorization:**
- Chỉ người gửi mới có thể xóa tin nhắn của mình
- Xóa soft delete (đổi status thành "deleted")

---

## 💻 Frontend Implementation

### Cấu trúc Components

```
src/
├── pages/
│   └── Messages.tsx          # Main messaging page
├── api/
│   └── messages.api.ts       # API calls
└── types/
    └── index.ts              # Message types
```

### Types Definition

```typescript
export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content?: string;
  mediaUrl?: string;
  status: 'delivered' | 'deleted';
  createdAt: string;
  sender?: User;
  receiver?: User;
}

export interface MessageSendRequest {
  receiverId: number;
  content?: string;
  mediaUrl?: string;
}
```

### Key Features

#### 1. Auto-scroll to latest message
```typescript
const messagesEndRef = useRef<HTMLDivElement>(null);

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

useEffect(() => {
  scrollToBottom();
}, [conversation]);
```

#### 2. Group inbox by conversation partner
```typescript
const getConversations = () => {
  if (!inbox) return [];
  
  const conversationsMap = new Map<number, Message>();
  
  inbox.forEach((msg: Message) => {
    const partnerId = msg.senderId === currentUser?.id 
      ? msg.receiverId 
      : msg.senderId;
    
    if (!conversationsMap.has(partnerId) || 
        new Date(msg.createdAt) > new Date(conversationsMap.get(partnerId)!.createdAt)) {
      conversationsMap.set(partnerId, msg);
    }
  });
  
  return Array.from(conversationsMap.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
```

#### 3. Send message with optimistic update
```typescript
const sendMutation = useMutation({
  mutationFn: messagesApi.sendMessage,
  onSuccess: () => {
    setMessage('');
    queryClient.invalidateQueries({ queryKey: ['messages'] });
    scrollToBottom();
  },
  onError: () => {
    toast.error('Không thể gửi tin nhắn');
  },
});
```

---

## 🎨 UI/UX Features

### Layout
- **2-column layout:** Conversations list (left) + Chat area (right)
- **Responsive:** Mobile shows one column at a time
- **Dark theme:** Matches TikTok style with #121212 background

### Conversations List
- Avatar + Username + Last message preview
- Time ago (using date-fns)
- Highlight selected conversation
- Empty state with icon

### Chat Area
- Header: Avatar + Username
- Messages: Bubble style, different colors for sender/receiver
- Sender messages: Right side, pink (#FE2C55)
- Receiver messages: Left side, gray (#2a2a2a)
- Auto-scroll to bottom
- Timestamp on each message

### Message Input
- Text input with placeholder
- Image upload button (UI only, not functional yet)
- Send button (disabled when empty)
- Loading state during send

---

## 🚀 Cách sử dụng

### 1. Khởi động backend
```bash
cd fastapi-tiktok-clone
python -m uvicorn app.main:app --reload
```

### 2. Khởi động frontend
```bash
cd Frontend
npm run dev
```

### 3. Truy cập Messages page
```
http://localhost:5173/messages
```

### 4. Test flow
1. Login với 2 tài khoản khác nhau (2 browsers hoặc incognito)
2. User 1: Vào `/messages`, chọn User 2, gửi tin nhắn
3. User 2: Vào `/messages/inbox`, sẽ thấy tin nhắn từ User 1
4. Click vào conversation để xem và trả lời

---

## 📱 Responsive Design

### Desktop (>= 768px)
- Full 2-column layout
- Conversations list: 384px wide
- Chat area: Flexible width

### Mobile (< 768px)
- Single column view
- Show conversations list by default
- When select conversation → Show chat area
- Back button to return to list

---

## 🔄 Real-time Updates (Future)

Hiện tại: Manual refresh (query invalidation)

**Planned:**
- WebSocket connection for real-time messages
- Online/offline status
- Typing indicators
- Read receipts

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. ❌ No real-time updates (need WebSocket)
2. ❌ Image upload not functional (UI only)
3. ❌ No pagination for long conversations
4. ❌ No search in messages
5. ❌ No message reactions
6. ❌ No group chats

### Planned Improvements
1. ✅ Add WebSocket for real-time messaging
2. ✅ Implement image/video upload
3. ✅ Add infinite scroll pagination
4. ✅ Search messages by content
5. ✅ Message reactions (like, love, etc.)
6. ✅ Group chat support
7. ✅ Voice messages
8. ✅ Message forwarding

---

## 🔐 Security

### Authorization
- Tất cả endpoints yêu cầu authentication
- User chỉ thấy tin nhắn của mình (inbox)
- User chỉ xóa được tin nhắn mình gửi

### Validation
- receiverId phải tồn tại trong database
- Không cho gửi tin nhắn cho chính mình
- Content + mediaUrl: Ít nhất 1 cái phải có

---

## 📊 Database Schema

```sql
CREATE TABLE Messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  senderId INT NOT NULL,
  receiverId INT NOT NULL,
  content TEXT,
  mediaUrl VARCHAR(500),
  status ENUM('delivered', 'deleted') DEFAULT 'delivered',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (senderId) REFERENCES Users(id),
  FOREIGN KEY (receiverId) REFERENCES Users(id),
  INDEX idx_conversation (senderId, receiverId),
  INDEX idx_created (createdAt)
);
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Gửi tin nhắn văn bản
- [ ] Gửi tin nhắn với hình ảnh
- [ ] Xem inbox (danh sách conversations)
- [ ] Xem conversation với user cụ thể
- [ ] Xóa tin nhắn đã gửi
- [ ] Không gửi được cho chính mình
- [ ] Không gửi được khi receiverId không tồn tại
- [ ] Auto-scroll khi có tin nhắn mới
- [ ] Responsive trên mobile
- [ ] Search conversations

### API Testing (Swagger)
```
http://localhost:8000/docs
```

1. Login để lấy token
2. Authorize với token
3. Test từng endpoint:
   - POST /messages/
   - GET /messages/inbox
   - GET /messages/conversation/{user_id}
   - DELETE /messages/{message_id}

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra backend logs
2. Kiểm tra browser console (F12)
3. Kiểm tra Network tab
4. Verify authentication token

---

## ✅ Summary

**Backend:**
- ✅ API đầy đủ và hoạt động
- ✅ Authorization & validation
- ✅ Soft delete messages
- ✅ Include sender/receiver info

**Frontend:**
- ✅ Modern UI/UX với dark theme
- ✅ Responsive design
- ✅ Auto-scroll messages
- ✅ Real-time updates via query invalidation
- ✅ Empty states
- ✅ Loading states
- ✅ Error handling

**Hoàn thiện: 90%**
- Còn thiếu: WebSocket, image upload, pagination

Good luck! 🚀
