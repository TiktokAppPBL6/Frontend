# WebSocket Requirements - Backend Implementation Guide

## 📋 Tổng quan

Frontend cần backend implement WebSocket để có real-time notifications và messages thay vì polling. Document này mô tả chi tiết các yêu cầu và API contract.

## 🔌 WebSocket Endpoints

### 1. Main WebSocket Connection
```
WS /api/v1/ws
hoặc
WSS /api/v1/ws (production với SSL)
```

**Authentication:**
- Sử dụng JWT token trong query params: `/api/v1/ws?token={jwt_token}`
- Hoặc trong headers: `Authorization: Bearer {jwt_token}`
- Server phải verify token và reject nếu invalid/expired

**Connection Flow:**
```
Client -> Connect với JWT token
Server -> Verify token
Server -> Send: { type: "connected", userId: 123, message: "Connected successfully" }
Client -> Ready to receive events
```

## 📨 Message Events (Chat)

### Server → Client Events

#### 1. New Message Received
```json
{
  "type": "message:new",
  "data": {
    "id": 456,
    "senderId": 123,
    "receiverId": 789,
    "content": "Hello from WebSocket!",
    "createdAt": "2024-01-15T10:30:00Z",
    "seen": false
  }
}
```

**Khi nào gửi:**
- Khi có user gửi message đến current user
- Chỉ gửi đến receiverId (không gửi cho sender vì sender đã có response từ API)

#### 2. Message Seen Status Update
```json
{
  "type": "message:seen",
  "data": {
    "messageIds": [456, 457, 458],
    "seenBy": 789,
    "seenAt": "2024-01-15T10:35:00Z"
  }
}
```

**Khi nào gửi:**
- Khi receiver đã đọc messages
- Gửi đến sender để update UI (check mark)

#### 3. User Typing Indicator
```json
{
  "type": "message:typing",
  "data": {
    "userId": 123,
    "conversationWith": 789,
    "isTyping": true
  }
}
```

**Khi nào gửi:**
- Khi user đang gõ tin nhắn
- Timeout sau 3 giây nếu không có activity

### Client → Server Events

#### 1. Mark Messages as Seen
```json
{
  "type": "message:mark_seen",
  "data": {
    "conversationWith": 123,
    "messageIds": [456, 457]
  }
}
```

#### 2. Typing Indicator
```json
{
  "type": "message:typing",
  "data": {
    "conversationWith": 789,
    "isTyping": true
  }
}
```

## 🔔 Notification Events

### Server → Client Events

#### 1. New Notification
```json
{
  "type": "notification:new",
  "data": {
    "id": 789,
    "userId": 123,
    "type": "like",
    "refId": 456,
    "createdAt": "2024-01-15T10:30:00Z",
    "seen": false,
    "actor": {
      "id": 999,
      "username": "john_doe",
      "avatarUrl": "/avatars/999.jpg"
    },
    "target": {
      "type": "video",
      "id": 456,
      "title": "My awesome video"
    }
  }
}
```

**Notification Types:**
- `like` - Ai đó thích video của user
- `comment` - Ai đó comment video của user
- `follow` - Ai đó follow user
- `mention` - Ai đó mention user trong comment
- `reply` - Ai đó reply comment của user

#### 2. Notification Seen
```json
{
  "type": "notification:seen",
  "data": {
    "notificationIds": [789, 790],
    "seenAt": "2024-01-15T10:35:00Z"
  }
}
```

#### 3. Unseen Count Update
```json
{
  "type": "notification:unseen_count",
  "data": {
    "count": 5
  }
}
```

**Khi nào gửi:**
- Sau khi có notification mới
- Sau khi user mark as seen

### Client → Server Events

#### 1. Mark Notification as Seen
```json
{
  "type": "notification:mark_seen",
  "data": {
    "notificationIds": [789, 790]
  }
}
```

## 🛠️ Technical Implementation

### 1. Connection Management

**Requirements:**
- Support multiple concurrent connections per user (mobile + web)
- Maintain connection pool: `Map<userId, Set<connectionId>>`
- Handle reconnection gracefully
- Ping/Pong heartbeat every 30 seconds
- Auto-disconnect after 5 minutes idle

**Example Connection Pool:**
```python
# Pseudo code
class ConnectionManager:
    def __init__(self):
        self.active_connections = {}  # userId -> Set[WebSocket]
    
    async def connect(self, user_id: int, websocket):
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
    
    async def disconnect(self, user_id: int, websocket):
        self.active_connections[user_id].discard(websocket)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]
    
    async def send_to_user(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            for ws in self.active_connections[user_id]:
                await ws.send_json(message)
```

### 2. Message Broadcasting

**Khi user A gửi message cho user B:**
```python
# Pseudo code
async def send_message(sender_id: int, receiver_id: int, content: str):
    # 1. Save to database
    message = await db.create_message(sender_id, receiver_id, content)
    
    # 2. Send to receiver via WebSocket
    await connection_manager.send_to_user(receiver_id, {
        "type": "message:new",
        "data": message.to_dict()
    })
    
    # 3. Update unread count
    unread_count = await db.get_unread_message_count(receiver_id)
    await connection_manager.send_to_user(receiver_id, {
        "type": "message:unread_count",
        "data": {"count": unread_count}
    })
    
    return message
```

**Khi user B đọc message:**
```python
# Pseudo code
async def mark_messages_seen(user_id: int, message_ids: List[int]):
    # 1. Update database
    await db.mark_messages_seen(message_ids)
    
    # 2. Get senders of these messages
    senders = await db.get_message_senders(message_ids)
    
    # 3. Notify all senders
    for sender_id in senders:
        await connection_manager.send_to_user(sender_id, {
            "type": "message:seen",
            "data": {
                "messageIds": message_ids,
                "seenBy": user_id,
                "seenAt": datetime.utcnow().isoformat()
            }
        })
```

### 3. Notification Broadcasting

**Khi có interaction (like, comment, follow):**
```python
# Pseudo code
async def create_like(user_id: int, video_id: int):
    # 1. Save like to database
    like = await db.create_like(user_id, video_id)
    
    # 2. Get video owner
    video = await db.get_video(video_id)
    owner_id = video.owner_id
    
    # Don't notify if user likes their own video
    if owner_id == user_id:
        return like
    
    # 3. Create notification
    notification = await db.create_notification(
        user_id=owner_id,
        type="like",
        ref_id=video_id,
        actor_id=user_id
    )
    
    # 4. Get actor info
    actor = await db.get_user(user_id)
    
    # 5. Send via WebSocket
    await connection_manager.send_to_user(owner_id, {
        "type": "notification:new",
        "data": {
            **notification.to_dict(),
            "actor": {
                "id": actor.id,
                "username": actor.username,
                "avatarUrl": actor.avatar_url
            },
            "target": {
                "type": "video",
                "id": video.id,
                "title": video.title,
                "thumbUrl": video.thumb_url
            }
        }
    })
    
    # 6. Update unseen count
    unseen_count = await db.get_unseen_notification_count(owner_id)
    await connection_manager.send_to_user(owner_id, {
        "type": "notification:unseen_count",
        "data": {"count": unseen_count}
    })
    
    return like
```

### 4. Error Handling

**Error Event Format:**
```json
{
  "type": "error",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Error Codes:**
- `UNAUTHORIZED` - Token invalid/expired
- `FORBIDDEN` - Not allowed to perform action
- `INVALID_MESSAGE` - Message format invalid
- `RATE_LIMIT` - Too many requests
- `INTERNAL_ERROR` - Server error

### 5. Heartbeat / Ping-Pong

**Ping từ Server (mỗi 30 giây):**
```json
{
  "type": "ping",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Pong từ Client:**
```json
{
  "type": "pong",
  "timestamp": "2024-01-15T10:30:05Z"
}
```

**Rules:**
- Server gửi ping mỗi 30 giây
- Client phải trả lời pong trong 10 giây
- Nếu không có pong → disconnect

## 🔒 Security Requirements

### 1. Authentication
- Verify JWT token khi connect
- Reject connection nếu token invalid
- Support token refresh (send new token via message)

### 2. Authorization
- User chỉ nhận được notifications/messages của mình
- Không leak data của user khác
- Validate permissions trước khi broadcast

### 3. Rate Limiting
- Max 100 messages per minute per user
- Max 10 typing events per minute
- Block/warn nếu exceed

### 4. Data Validation
- Validate tất cả incoming messages
- Sanitize content (XSS prevention)
- Limit message length (max 5000 characters)

## 📊 Monitoring & Logging

**Backend cần track:**
- Number of active connections
- Messages sent/received per second
- Average latency
- Connection errors
- Authentication failures

**Logs quan trọng:**
```
[INFO] User 123 connected from 192.168.1.1
[INFO] Message sent: 123 -> 789 (50ms)
[WARN] User 456 exceeded rate limit
[ERROR] Failed to deliver message to user 789: connection lost
[INFO] User 123 disconnected after 1200s
```

## 🧪 Testing Checklist

Backend cần test các scenarios sau:

### Connection
- [ ] Successful connection with valid token
- [ ] Reject connection with invalid token
- [ ] Reject connection with expired token
- [ ] Handle multiple connections from same user
- [ ] Handle reconnection after disconnect

### Messages
- [ ] Send message via WebSocket to online user
- [ ] Queue message for offline user
- [ ] Mark message as seen
- [ ] Update seen status for sender
- [ ] Typing indicator works correctly
- [ ] Rate limiting works

### Notifications
- [ ] New like notification sent
- [ ] New comment notification sent
- [ ] New follow notification sent
- [ ] Unseen count updates correctly
- [ ] Mark as seen works
- [ ] Don't notify for own actions

### Edge Cases
- [ ] User offline then comes online
- [ ] User has multiple devices connected
- [ ] Rapid message sending
- [ ] Large message content
- [ ] Network interruption
- [ ] Server restart (reconnection)

## 📝 API Fallback

**Important:** REST APIs phải vẫn hoạt động song song với WebSocket!

Khi WebSocket fail hoặc không available, frontend sẽ fallback về polling:
- `GET /api/v1/messages/inbox` - mỗi 3 giây
- `GET /api/v1/notifications/` - mỗi 5 giây
- `POST /api/v1/messages/` - vẫn dùng REST để gửi

→ Backend phải maintain cả 2 systems

## 🚀 Deployment Considerations

### Load Balancer
- WebSocket cần sticky sessions
- Hoặc sử dụng Redis pub/sub để broadcast across instances

### Scaling
```
User 1 → Load Balancer → Server 1 (WS connection)
User 2 → Load Balancer → Server 2 (WS connection)

User 1 sends message to User 2:
Server 1 → Redis pub/sub → Server 2 → User 2
```

### Redis Pub/Sub Example
```python
# Server 1
await redis.publish('notifications', json.dumps({
    'user_id': 789,
    'event': {
        'type': 'notification:new',
        'data': {...}
    }
}))

# Server 2 subscribes to 'notifications' channel
async def handle_redis_message(message):
    data = json.loads(message)
    user_id = data['user_id']
    event = data['event']
    
    # Send to user if connected to this server
    await connection_manager.send_to_user(user_id, event)
```

## 📚 Recommended Libraries

### Python (FastAPI/Django)
- **FastAPI:** `fastapi` + `websockets`
- **Django:** `channels` + `daphne`
- **Redis:** `redis-py` hoặc `aioredis`

### Node.js
- **Socket.io:** Full-featured WebSocket library
- **ws:** Lightweight WebSocket library
- **Redis:** `ioredis` cho pub/sub

## 🎯 Priority Implementation Order

1. **Phase 1 - Basic WebSocket (Week 1)**
   - Connection/Authentication
   - Basic message events (message:new)
   - Basic notification events (notification:new)

2. **Phase 2 - Enhanced Features (Week 2)**
   - Seen status updates
   - Typing indicators
   - Unseen counts

3. **Phase 3 - Production Ready (Week 3)**
   - Redis pub/sub for scaling
   - Rate limiting
   - Monitoring/logging
   - Load testing

## 📞 Frontend Integration

Khi backend ready, frontend sẽ:
1. Tạo WebSocket service: `src/services/websocket.ts`
2. Connect khi user login
3. Subscribe to events
4. Update UI real-time
5. Fallback to polling nếu WS fail

**Frontend sẽ cần từ backend:**
- WebSocket endpoint URL (production)
- Token format requirements
- Event schema documentation
- Error codes documentation

---

## ❓ Questions?

Nếu có thắc mắc về requirements, liên hệ:
- Frontend team để clarify event format
- DevOps team để setup load balancer
- Security team để review authentication flow
