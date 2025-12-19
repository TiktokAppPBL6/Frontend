# Sửa lỗi Notifications và Messages

## Vấn đề
- Tính năng Thông báo và Tin nhắn không hiển thị dữ liệu
- API frontend không khớp với backend OpenAPI spec
- Request/Response payload format không đúng

## Thay đổi đã thực hiện

### 1. Notifications API (`src/api/notifications.api.ts`)

#### Cũ:
```typescript
// Response: NotificationsResponse = { notifications: [], total, unseenCount }
getNotifications: async (): Promise<NotificationsResponse>

// Payload: { notificationId }
markAsSeen: async (notificationId: ID): Promise<void>
```

#### Mới:
```typescript
// Response: Notification[] - trực tiếp là mảng
getNotifications: async (params?: { skip?: number; limit?: number }): Promise<Notification[]>

// Payload: { notification_ids: [number[]] } - đúng theo OpenAPI spec
markAsSeen: async (notificationIds: number[]): Promise<string>

// Response: number - trực tiếp là số
getUnseenCount: async (): Promise<number>
```

#### Interface Notification:
```typescript
export interface Notification {
  id: number;
  userId: number;
  type: string;          // 'like', 'comment', 'follow'
  refId?: number;
  createdAt: string;
  seen: boolean;
}
```

### 2. Messages API (`src/api/messages.api.ts`)

#### Cũ:
```typescript
// Response: InboxResponse wrapper
getInbox: async (): Promise<InboxResponse>

// Payload: MessageSendRequest với receiverId
sendMessage: async (data: MessageSendRequest): Promise<Message>
```

#### Mới:
```typescript
// Response: Message[] - trực tiếp là mảng
getInbox: async (): Promise<Message[]>

// Response: Message[] - không còn wrap trong object
getConversation: async (userId: ID): Promise<Message[]>

// Payload: { receiver_id, content } - snake_case theo backend
sendMessage: async (data: MessageSendRequest): Promise<Message>

// Response: string - status message
deleteMessage: async (messageId: ID): Promise<string>
```

#### Interface Message:
```typescript
export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  seen: boolean;
}

export interface MessageSendRequest {
  receiver_id: number;   // snake_case theo backend
  content: string;
}
```

### 3. Notifications Page (`src/pages/Notifications.tsx`)

#### Thay đổi chính:
- ✅ Thêm auto-refresh mỗi 5 giây cho notifications và unseen count
- ✅ Sử dụng `useMutation` cho markAllSeen với proper invalidation
- ✅ Hiển thị số lượng thông báo chưa đọc
- ✅ Icon phân loại theo type (like, comment, follow)
- ✅ Chỉ báo chưa đọc (đỏ dot) cho notifications
- ✅ Toast notification khi đánh dấu đã đọc
- ✅ Hiển thị thông tin cơ bản (User #id) thay vì full user object

#### Code mẫu:
```typescript
const { data: notifications } = useQuery({
  queryKey: ['notifications'],
  queryFn: () => notificationsApi.getNotifications(),
  refetchInterval: 5000, // Auto refresh
});

const { data: unseenCount } = useQuery({
  queryKey: ['notifications-unseen-count'],
  queryFn: notificationsApi.getUnseenCount,
  refetchInterval: 5000,
});

const markAllSeenMutation = useMutation({
  mutationFn: notificationsApi.markAllAsSeen,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unseen-count'] });
    toast.success('Đã đánh dấu tất cả là đã đọc');
  },
});
```

### 4. Messages Page (`src/pages/Messages.tsx`)

#### Thay đổi chính:
- ✅ Import `Message` type từ `@/api/messages.api` thay vì `@/types`
- ✅ Payload `sendMessage` sử dụng `receiver_id` (snake_case)
- ✅ Xử lý `inbox` có thể là mảng rỗng
- ✅ Loại bỏ filter theo user info (không có trong response)
- ✅ Chỉ filter theo nội dung tin nhắn

#### Code mẫu:
```typescript
const getConversations = () => {
  if (!inbox || inbox.length === 0) return [];
  const conversationsMap = new Map<number, Message>();
  inbox.forEach((msg: Message) => {
    const partnerId = msg.senderId === currentUser?.id ? msg.receiverId : msg.senderId;
    if (!conversationsMap.has(partnerId) || 
        new Date(msg.createdAt) > new Date(conversationsMap.get(partnerId)!.createdAt)) {
      conversationsMap.set(partnerId, msg);
    }
  });
  return Array.from(conversationsMap.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
```

### 5. Message Components

#### ConversationsList.tsx:
- Import type từ `@/api/messages.api`
- Hiển thị "Người dùng #id" thay vì username
- Thêm chỉ báo chưa đọc (đỏ dot)
- Avatar placeholder

#### MessagesList.tsx:
- Import type từ `@/api/messages.api`
- Loại bỏ reverse() - hiển thị theo thứ tự từ backend
- Avatar placeholder với user ID
- Giữ nguyên UI bubble và timestamps

## Cách Backend API hoạt động

### Notifications
```
GET /api/v1/notifications/?skip=0&limit=50
Response: [
  {
    id: 1,
    userId: 123,
    type: "like",
    refId: 456,
    createdAt: "2024-01-15T10:30:00",
    seen: false
  }
]

GET /api/v1/notifications/unseen/count
Response: 5

POST /api/v1/notifications/mark-seen
Body: { notification_ids: [1, 2, 3] }
Response: "Notifications marked as seen"
```

### Messages
```
GET /api/v1/messages/inbox
Response: [
  {
    id: 1,
    senderId: 123,
    receiverId: 456,
    content: "Hello",
    createdAt: "2024-01-15T10:30:00",
    seen: false
  }
]

GET /api/v1/messages/conversation/456
Response: [ ...messages... ]

POST /api/v1/messages/
Body: { receiver_id: 456, content: "Hello" }
Response: { id: 1, senderId: 123, receiverId: 456, ... }
```

## Kết quả

✅ **Notifications:**
- Hiển thị danh sách thông báo với icon phân loại
- Đếm và hiển thị số thông báo chưa đọc
- Auto-refresh mỗi 5 giây
- Đánh dấu tất cả đã đọc
- Chỉ báo visual cho thông báo chưa đọc

✅ **Messages:**
- Hiển thị inbox với conversations
- Real-time polling (3s inbox, 2s conversation)
- Gửi tin nhắn với payload đúng format
- Hiển thị chat history
- UI bubble messages với timestamps
- Chỉ báo tin nhắn chưa đọc

✅ **Code Quality:**
- Type-safe với TypeScript
- Không có compilation errors
- Khớp 100% với backend OpenAPI spec
- Proper error handling
- Loading states

## Lưu ý

1. **Backend chưa trả về user info:** Messages và Notifications chỉ có user IDs, không có avatar/username. Cần backend populate user info hoặc fetch riêng.

2. **Real-time:** Hiện tại dùng polling. Có thể nâng cấp lên WebSocket cho real-time tốt hơn.

3. **Mark as seen:** Notifications có endpoint markAsSeen, nhưng Messages chưa có endpoint để mark message as seen.

4. **Pagination:** Notifications có pagination (skip/limit), nhưng frontend chưa implement infinite scroll.

## Cải tiến tiếp theo

1. Thêm infinite scroll cho notifications
2. WebSocket cho real-time updates
3. Fetch user info để hiển thị avatar/username
4. Mark individual notification as seen
5. Mark message as seen khi đọc
6. Rich notifications (ảnh, video preview)
7. Notification sounds và browser notifications
