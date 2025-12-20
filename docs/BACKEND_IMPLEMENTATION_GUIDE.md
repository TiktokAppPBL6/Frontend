# Backend Implementation Guide - WebSocket & Admin APIs

> **Dành cho Backend Team**: Document này mô tả chi tiết các API và WebSocket cần implement để hoàn thiện hệ thống TikTok Clone.

## 📋 Tổng quan

Backend cần implement 2 phần chính:

### 1. **WebSocket Real-time System**
- Mục đích: Gửi real-time messages và notifications cho users
- Công nghệ: WebSocket với JWT authentication
- Users connect vào 1 endpoint, nhận events tức thì khi có interaction

### 2. **Admin Dashboard REST APIs**
- Mục đích: Quản lý users, videos, reports với đầy đủ CRUD operations
- Công nghệ: REST APIs với admin role authorization
- Frontend sẽ polling để lấy stats, không dùng WebSocket cho admin

---

## 🎯 Yêu cầu kỹ thuật

**Backend cần:**
- FastAPI (hoặc Django Channels) cho WebSocket
- JWT authentication đã implement
- Database: PostgreSQL/MySQL với các bảng: users, videos, reports, messages, notifications
- Redis (optional): Để scale WebSocket across multiple servers
- Admin middleware: Verify admin role trước khi access admin APIs

**Không cần:**
- Real-time WebSocket cho admin dashboard (dùng polling)
- Complex analytics (chỉ cần basic stats và charts 7 ngày)

---

## 🔌 PHẦN 1: WebSocket Real-time System

### Nhiệm vụ backend cần làm:

1. **Tạo WebSocket endpoint** `/api/v1/ws?token={jwt_token}`
2. **Implement ConnectionManager** để quản lý user connections
3. **Integrate vào existing APIs** để gửi events khi có interaction
4. **Handle client messages** (mark as seen, typing indicator)

### 1.1. WebSocket Endpoint Setup
---

### 1.2. Event Schemas (Contract với Frontend)

Backend cần gửi/nhận các events theo format sau:

**Messages:**
```javascript
// Server → Client: Tin nhắn mới
{ type: "message:new", data: { id, senderId, receiverId, content, createdAt, seen } }

// Server → Client: Đã đọc
{ type: "message:seen", data: { messageIds: [], seenBy, seenAt } }

// Client → Server: Mark as seen
{ type: "message:mark_seen", data: { conversationWith, messageIds: [] } }
```

**Notifications:**
```javascript
// Server → Client: Thông báo mới (like/comment/follow/mention/reply)
{ type: "notification:new", data: { id, userId, type, refId, createdAt, seen, actor: {id, username, avatarUrl}, target: {type, id, title} } }

// Server → Client: Số chưa đọc
{ type: "notification:unseen_count", data: { count } }

// Client → Server: Mark as seen
{ type: "notification:mark_seen", data: { notificationIds: [] } }
```

**Admin Events (Chỉ gửi cho affected users):**
```javascript
{ type: "admin:user_banned", data: { userId, reason, bannedAt } }
{ type: "admin:video_deleted", data: { videoId, reason, deletedAt } }
{ type: "admin:report_resolved", data: { reportId, status, result, resolvedAt } }
```

**Heartbeat:**
```javascript
{ type: "ping", timestamp } // Server → Client every 30s
{ type: "pong", timestamp } // Client → Server response
```

**Errors:**
```javascript
{ type: "error", error: { code, message, timestamp } }
// Codes: UNAUTHORIZED, FORBIDDEN, INVALID_MESSAGE, RATE_LIMIT, INTERNAL_ERROR
```

---

### 1.3. Connection Manager Implementation

**File mới cần tạo:** `app/websocket/connection_manager.py`

```python
class ConnectionManager:
    def __init__(self):
        self.connections: dict[int, set[WebSocket]] = {}
    
    def add_connection(self, user_id: int, ws: WebSocket):
        if user_id not in self.connections:
            self.connections[user_id] = set()
        self.connections[user_id].add(ws)
    
    def remove_connection(self, user_id: int, ws: WebSocket):
        if user_id in self.connections:
            self.connections[user_id].discard(ws)
            if not self.connections[user_id]:
                del self.connections[user_id]
    
    async def send_to_user(self, user_id: int, message: dict):
        if user_id not in self.connections:
            return
        for ws in list(self.connections[user_id]):
            try:
                await ws.send_json(message)
            except:
                self.remove_connection(user_id, ws)

connection_manager = ConnectionManager()
```

---

### 1.4. WebSocket Endpoint Handler

**File mới cần tạo:** `app/websocket/endpoint.py`

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

@app.websocket("/api/v1/ws")
async def websocket_endpoint(websocket: WebSocket, token: str):
    user = verify_jwt_token(token)
    if not user:
        await websocket.close(code=4001, reason="Unauthorized")
        return
    
    await websocket.accept()
    connection_manager.add_connection(user.id, websocket)
    await websocket.send_json({"type": "connected", "userId": user.id})
    
    try:
        while True:
            data = await websocket.receive_json()
            if data["type"] == "message:mark_seen":
                await mark_messages_seen(data["data"]["messageIds"])
            elif data["type"] == "notification:mark_seen":
                await mark_notifications_seen(data["data"]["notificationIds"])
            elif data["type"] == "pong":
                pass  # Heartbeat response
    except WebSocketDisconnect:
        connection_manager.remove_connection(user.id, websocket)
```

---

### 1.5. Integration vào Existing APIs

**Các file cần sửa để gửi WebSocket events:**

#### a) Messages API - `app/api/messages.py`
```python
# Thêm vào POST /api/v1/messages/
async def send_message(sender_id: int, receiver_id: int, content: str):
    message = db.create_message(sender_id, receiver_id, content)
    
    # ⭐ THÊM: Gửi WebSocket event
    await connection_manager.send_to_user(receiver_id, {
        "type": "message:new",
        "data": message.dict()
    })
    
    return message
```

#### b) Videos/Interactions API - `app/api/videos.py`

**Khi user like video:**
```python
# Thêm vào POST /api/v1/videos/{id}/like
async def create_like(user_id: int, video_id: int):
    like = db.create_like(user_id, video_id)
    video = db.get_video(video_id)
    
    # ⭐ THÊM: Notify video owner (nếu không phải chính mình)
    if video.owner_id != user_id:
        notification = db.create_notification(video.owner_id, "like", video_id, user_id)
        actor = db.get_user(user_id)
        
        await connection_manager.send_to_user(video.owner_id, {
            "type": "notification:new",
            "data": {
                **notification.dict(),
                "actor": {"id": actor.id, "username": actor.username, "avatarUrl": actor.avatar_url},
                "target": {"type": "video", "id": video.id, "title": video.title}
            }
        })
        
        unseen = db.count_unseen_notifications(video.owner_id)
        await connection_manager.send_to_user(video.owner_id, {
            "type": "notification:unseen_count",
            "data": {"count": unseen}
        })
    
    return like
```

**Khi user comment video:**
```python
# Thêm vào POST /api/v1/comments/
async def create_comment(user_id: int, video_id: int, content: str):
    comment = db.create_comment(user_id, video_id, content)
    video = db.get_video(video_id)
    
    # ⭐ THÊM: Notify video owner
    if video.owner_id != user_id:
        notification = db.create_notification(video.owner_id, "comment", video_id, user_id)
        actor = db.get_user(user_id)
        
        await connection_manager.send_to_user(video.owner_id, {
            "type": "notification:new",
            "data": {**notification.dict(), "actor": actor.dict(), "target": {"type": "video", "id": video.id}}
        })
        
        unseen = db.count_unseen_notifications(video.owner_id)
        await connection_manager.send_to_user(video.owner_id, {"type": "notification:unseen_count", "data": {"count": unseen}})
    
    return comment
```

#### c) Users/Social API - `app/api/users.py`

**Khi user follow:**
```python
# Thêm vào POST /api/v1/users/{id}/follow
async def follow_user(follower_id: int, followed_id: int):
    follow = db.create_follow(follower_id, followed_id)
    
    # ⭐ THÊM: Notify user được follow
    notification = db.create_notification(followed_id, "follow", followed_id, follower_id)
    actor = db.get_user(follower_id)
    
    await connection_manager.send_to_user(followed_id, {
        "type": "notification:new",
        "data": {**notification.dict(), "actor": actor.dict()}
    })
    
    unseen = db.count_unseen_notifications(followed_id)
    await connection_manager.send_to_user(followed_id, {"type": "notification:unseen_count", "data": {"count": unseen}})
    
    return follow
```

#### d) Admin API - `app/api/admin.py`

**Khi admin ban user:**
```python
# Trong POST /api/v1/admin/users/{id}/ban
async def ban_user(admin_id: int, user_id: int, reason: str):
    db.ban_user(user_id, reason)
    
    # ⭐ THÊM: Notify user và disconnect
    await connection_manager.send_to_user(user_id, {
        "type": "admin:user_banned",
        "data": {"userId": user_id, "reason": reason, "bannedAt": datetime.utcnow().isoformat()}
    })
    
    # Disconnect tất cả connections của user
    if user_id in connection_manager.connections:
        for ws in list(connection_manager.connections[user_id]):
            await ws.close(code=4003, reason="Account banned")
        connection_manager.connections.pop(user_id, None)
    
    return {"success": True}
```

**Khi admin xóa video:**
```python
# Trong DELETE /api/v1/admin/videos/{id}
async def delete_video_by_admin(admin_id: int, video_id: int, reason: str):
    video = db.get_video(video_id)
    db.delete_video(video_id)
    
    # ⭐ THÊM: Notify video owner
    await connection_manager.send_to_user(video.owner_id, {
        "type": "admin:video_deleted",
        "data": {"videoId": video_id, "reason": reason, "deletedAt": datetime.utcnow().isoformat()}
    })
    return {"success": True}
```

**Khi admin resolve report:**
```python
# Trong POST /api/v1/admin/reports/{id}/resolve
async def resolve_report(admin_id: int, report_id: int, status: str, result: str):
    report = db.get_report(report_id)
    db.update_report(report_id, status, result)
    
    # ⭐ THÊM: Notify reporter
    await connection_manager.send_to_user(report.reporter_id, {
        "type": "admin:report_resolved",
        "data": {"reportId": report_id, "status": status, "result": result, "resolvedAt": datetime.utcnow().isoformat()}
    })
    return {"success": True}
```

---

## 📊 PHẦN 2: Admin Dashboard REST APIs

### Nhiệm vụ backend cần làm:

1. **Tạo admin middleware** để verify admin role
**Response format:**
```json
{
  "users": {
    "total": 1234,
    "active_7d": 567,
    "new_today": 12,
    "banned": 5
  },
  "videos": {
    "total": 5678,
    "public": 5000,
    "private": 678,
    "new_today": 45
  },
  "reports": {
    "total": 123,
    "pending": 34,
    "resolved": 80,
    "rejected": 9,
    "resolved_today": 5
  },
  "engagement": {
    "total_likes": 123456,
    "total_comments": 45678,
    "total_follows": 12345,
    "total_views": 987654
  }
}
```

**Database queries cần:**
- `COUNT(*) FROM users`
- `COUNT(*) FROM users WHERE last_active >= NOW() - INTERVAL 7 DAY`
- `COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()`
- _(Tương tự cho videos, reports, engagement)_

#### b) GET `/api/v1/admin/stats/charts`

**Mục đích:** Data cho biểu đồ 7 ngày gần đây (Frontend polling mỗi 60s)

**Response format:**
```json
{
  "users_chart": [
    {"date": "2024-12-14", "count": 45, "active": 30},
    {"date": "2024-12-15", "count": 52, "active": 38},
    ...
  ],
  "videos_chart": [
    {"date": "2024-12-14", "count": 123, "views": 5000},
    ...
  ],
  "reports_chart": [
    {"date": "2024-12-14", "pending": 10, "resolved": 5, "rejected": 2},
    ...
  ],
  "engagement_chart": [
    {"date": "2024-12-14", "likes": 500, "comments": 200, "follows": 50},
    ...
  ]
}
```

**Database queries cần:**
```sql
SELECT DATE(created_at) as date, COUNT(*) as count
FROM users
WHERE created_at >= NOW() - INTERVAL 7 DAY
GROUP BY DATE(created_at)
ORDER BY date ASC
```

#### c) GET `/api/v1/admin/stats/recent-activity?limit=10`

**Mục đích:** Hoạt động gần đây (Frontend polling mỗi 30s)

**Response format:**
```json
{
  "recent_users": [
    {
      "id": 123,
      "username": "user123",
      "email": "user@example.com",
      "createdAt": "2024-12-20T10:30:00Z",
      "avatarUrl": "/avatars/123.jpg"
    }
  ],
  "recent_videos": [
    {
      "id": 456,
      "title": "My Video",
      "ownerId": 123,
      "ownerName": "user123",
      "createdAt": "2024-12-20T10:25:00Z",
      "views": 100,
      "likes": 20,
      "visibility": "public"
    }
  ],
  "recent_reports": [
    {
      "id": 789,
      "reporterId": 123,
      "reporterName": "user123",
      "targetType": "video",
      "targetId": 456,
      "reason": "spam",
      "status": "pending",
      "createdAt": "2024-12-20T10:20:00Z"
    }
  ]
}
```

---

### 2.3. User Management APIs

**File mới cần tạo:** `app/api/admin/users.py`

#### a) GET `/api/v1/admin/users`

**Mục đích:** Lấy danh sách users với pagination, search, filter

**Query params:**
- `page`: int (default 1)
- `limit`: int (default 20)
- `search`: str (search trong username, email, full_name)
- `status`: "active" | "banned" | "all" (default "all")
- `sort_by`: "created_at" | "username" | "follower_count" (default "created_at")
- `order`: "asc" | "desc" (default "desc")

**Response format:**
```json
{
  "users": [
    {
      "id": 123,
      "username": "user123",
      "email": "user@example.com",
      "fullName": "John Doe",
      "avatarUrl": "/avatars/123.jpg",
      "bio": "Hello world",
      "followerCount": 500,
      "followingCount": 300,
      "videoCount": 50,
      "isVerified": false,
      "isBanned": false,
      "banReason": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "lastActive": "2024-12-20T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1234,
    "pages": 62
  }
}
```

**Database query example:**
```sql
SELECT * FROM users
WHERE (username LIKE %search% OR email LIKE %search%)
  AND (is_banned = status OR status = 'all')
ORDER BY sort_by order
LIMIT limit OFFSET (page-1)*limit
```

#### b) GET `/api/v1/admin/users/{user_id}`

**Mục đích:** Chi tiết user với stats và recent activities

**Response format:**
```json
{
  "user": { ...full user object... },
  "stats": {
    "videos": 50,
    "followers": 500,
    "following": 300,
    "total_likes": 12345,
    "total_views": 67890,
    "reports_by_user": 2,
    "reports_against_user": 0
  },
  "recent_videos": [...10 videos...],
  "recent_reports_by": [...reports user đã tạo...],
  "recent_reports_against": [...reports bị report...]
}
```

#### c) POST `/api/v1/admin/users/{user_id}/ban`

**Body:** `{ "reason": "Vi phạm quy định" }`

**Action:**
1. Update `users.is_banned = true, users.ban_reason = reason`
2. Gửi WebSocket event `admin:user_banned` (xem phần 1.5.d)
3. Disconnect user khỏi WebSocket

**Response:** `{ "success": true, "message": "User banned" }`

#### d) POST `/api/v1/admin/users/{user_id}/unban`

**Action:** Update `users.is_banned = false, users.ban_reason = null`

**Response:** `{ "success": true, "message": "User unbanned" }`

#### e) DELETE `/api/v1/admin/users/{user_id}`

**Body:** `{ "reason": "Yêu cầu của user" }`

**Action:**
1. Xóa tất cả videos của user
2. Xóa tất cả comments của user
3. Xóa tất cả reports của/về user
4. Xóa user record
5. Disconnect khỏi WebSocket

**Response:** `{ "success": true, "message": "User deleted" }`

#### f) PUT `/api/v1/admin/users/{user_id}/role`

**Body:** `{ "role": "admin" }` (values: "user", "moderator", "admin")

**Action:** Update `users.role = role`

**Response:** `{ "success": true, "message": "Role updated" }`

#### g) POST `/api/v1/admin/users/{user_id}/verify`

**Action:** Update `users.is_verified = true`

**Response:** `{ "success": true, "message": "User verified" }`

---

### 2.4. Video Management APIs

**File mới cần tạo:** `app/api/admin/videos.py`

#### a) GET `/api/v1/admin/videos`

**Query params:**
- `page`, `limit`
- `search`: str (search trong title, description)
- `visibility`: "public" | "private" | "all"
- `sort_by`: "created_at" | "views" | "likes" | "comments"
- `order`: "asc" | "desc"

**Response format:**
```json
{
  "videos": [
    {
      "id": 456,
      "title": "My Video",
      "description": "...",
      "videoUrl": "/videos/456.mp4",
      "thumbUrl": "/thumbs/456.jpg",
      "visibility": "public",
      "ownerId": 123,
      "ownerUsername": "user123",
      "ownerAvatar": "/avatars/123.jpg",
      "views": 1000,
      "likes": 200,
      "comments": 50,
      "shares": 30,
      "createdAt": "2024-12-15T10:00:00Z",
      "duration": 30
    }
  ],
  "pagination": { ... }
}
```

#### b) GET `/api/v1/admin/videos/{video_id}`

**Response:**
```json
{
  "video": { ...full video object... },
  "owner": { "id", "username", "avatarUrl" },
  "stats": {
    "views": 1000,
    "likes": 200,
    "comments": 50,
    "shares": 30,
    "reports": 2
  },
  "recent_comments": [...20 comments...],
  "reports": [...all reports về video này...]
}
```

#### c) PUT `/api/v1/admin/videos/{video_id}/visibility`

**Body:** `{ "visibility": "private" }`

**Action:** Update `videos.visibility = visibility`

**Response:** `{ "success": true, "message": "Visibility updated" }`

#### d) DELETE `/api/v1/admin/videos/{video_id}`

**Body:** `{ "reason": "Nội dung không phù hợp" }`

**Action:**
1. Delete video file từ storage
2. Delete video record từ database
3. Gửi WebSocket event `admin:video_deleted` (xem phần 1.5.d)

**Response:** `{ "success": true, "message": "Video deleted" }`

#### e) POST `/api/v1/admin/videos/bulk-delete`

**Body:** `{ "video_ids": [1, 2, 3], "reason": "..." }`

**Action:** Loop qua mỗi video_id và xóa như endpoint (d)

**Response:** `{ "success": true, "message": "3 videos deleted" }`

---

### 2.5. Report Management APIs

**File mới cần tạo:** `app/api/admin/reports.py`

#### a) GET `/api/v1/admin/reports`

**Query params:**
- `page`, `limit`
- `status`: "pending" | "resolved" | "rejected" | "all"
- `target_type`: "video" | "comment" | "user" | "all"
- `sort_by`: "created_at"
- `order`: "asc" | "desc"

**Response format:**
```json
{
  "reports": [
    {
      "id": 789,
      "reporterId": 123,
      "reporterUsername": "user123",
      "targetType": "video",
      "targetId": 456,
      "reason": "spam",
      "details": "This is spam content",
      "status": "pending",
      "result": null,
      "resolvedBy": null,
      "resolvedAt": null,
      "createdAt": "2024-12-20T10:00:00Z",
      "targetInfo": {
        "title": "Video Title",
        "ownerUsername": "owner123"
      }
    }
  ],
  "pagination": { ... }
}
```

**Lưu ý:** `targetInfo` cần fetch từ bảng tương ứng (videos/users/comments)

#### b) GET `/api/v1/admin/reports/{report_id}`

**Response:**
```json
{
  "report": { ...full report object... },
  "reporter": { "id", "username", "avatarUrl" },
  "target": { ...video/user/comment object... }
}
```

#### c) POST `/api/v1/admin/reports/{report_id}/resolve`

**Body:** `{ "result": "Video đã bị xóa" }`

**Action:**
1. Update `reports.status = 'resolved', reports.result = result, reports.resolved_by = admin_id, reports.resolved_at = NOW()`
2. Gửi WebSocket event `admin:report_resolved` (xem phần 1.5.d)

**Response:** `{ "success": true, "message": "Report resolved" }`

#### d) POST `/api/v1/admin/reports/{report_id}/reject`

**Body:** `{ "reason": "Report không hợp lệ" }`

**Action:**
1. Update `reports.status = 'rejected', reports.result = reason, ...`
2. Gửi WebSocket event `admin:report_resolved` với status="rejected"

**Response:** `{ "success": true, "message": "Report rejected" }`

#### e) POST `/api/v1/admin/reports/bulk-resolve`

**Body:** `{ "report_ids": [1, 2, 3], "result": "..." }`

**Action:** Loop qua mỗi report_id và resolve như endpoint (c)

**Response:** `{ "success": true, "message": "3 reports resolved" }`

---

## 🔒 PHẦN 3: Security & Validation

### 3.1. Authentication & Authorization

**Tất cả admin APIs cần:**
```python
@app.get("/api/v1/admin/...", dependencies=[Depends(require_admin)])
```

**WebSocket connection cần:**
- Verify JWT token từ query param hoặc header
- Reject nếu token invalid/expired

### 3.2. Rate Limiting

Cần implement rate limiting cho:
- WebSocket messages: Max 100 messages/minute per user
- Admin APIs: Max 1000 requests/hour per admin
- Ban IP nếu quá rate limit

**Suggest dùng:**
- `slowapi` library cho FastAPI
- Redis để track request counts

### 3.3. Data Validation

**Validate input:**
- Message content: Max 5000 characters, không có script tags
- Reason/result: Max 500 characters
- Pagination: page >= 1, limit <= 100
- Search: Max 100 characters

**Sanitize output:**
- Remove XSS từ user-generated content
- Escape HTML trong messages/comments

---

## 📈 PHẦN 4: Scaling với Redis (Optional - Phase 3)

### 4.1. Khi nào cần Redis?

- Khi có nhiều server instances (load balancer)
- User A kết nối vào Server 1, User B vào Server 2
- User A gửi message cho User B → Server 1 cần notify Server 2

### 4.2. Redis Pub/Sub Implementation

**File:** `app/websocket/redis_pubsub.py`

```python
import redis.asyncio as redis
import json

redis_client = redis.Redis(host='localhost', port=6379)

# Khi gửi event, publish to Redis thay vì gửi trực tiếp
async def broadcast_event(user_id: int, event: dict):
    await redis_client.publish('websocket_events', json.dumps({
        'user_id': user_id,
        'event': event
    }))

# Background task lắng nghe Redis events
async def redis_listener():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe('websocket_events')
    
    async for message in pubsub.listen():
        if message['type'] == 'message':
            data = json.loads(message['data'])
            user_id = data['user_id']
            event = data['event']
            
            # Gửi đến user nếu user đang connect vào server này
            await connection_manager.send_to_user(user_id, event)

# Start listener khi app khởi động
@app.on_event("startup")
async def startup():
    asyncio.create_task(redis_listener())
```

**Khi nào implement:**
- Phase 1-2: Không cần Redis (1 server instance)
- Phase 3: Khi deploy multiple instances cần Redis

---

## 🧪 PHẦN 5: Testing Requirements

### 5.1. WebSocket Testing

**Cần test:**
- [ ] Connect với valid token → success
- [ ] Connect với invalid token → reject 4001
- [ ] Send message → receiver nhận WebSocket event
- [ ] Like video → owner nhận notification event
- [ ] Mark as seen → sender nhận update
- [ ] Ban user → user nhận event và bị disconnect
- [ ] Multiple devices cùng user → tất cả nhận events

**Tools suggest:** `pytest-asyncio`, `websockets` library

### 5.2. Admin APIs Testing

**Cần test:**
- [ ] Non-admin call admin API → 403 Forbidden
- [ ] Get users with pagination → correct format
- [ ] Search users → results match search term
- [ ] Ban user → database updated, WebSocket sent
- [ ] Delete video → file deleted, owner notified
- [ ] Resolve report → status updated, reporter notified
- [ ] Bulk operations → all items processed

**Tools suggest:** `pytest`, `httpx`

### 5.3. Load Testing

**Cần test:**
- [ ] 1000 concurrent WebSocket connections
- [ ] 100 messages/second broadcast
- [ ] Admin APIs với 100 requests/second

**Tools suggest:** `locust`, `k6`

---

## 📋 PHẦN 6: Implementation Timeline

### Week 1: WebSocket Foundation (5-7 ngày)

**Day 1-2: Setup & Connection Manager**
- [ ] Tạo `app/websocket/` folder
- [ ] Implement `ConnectionManager` class
- [ ] Setup WebSocket endpoint `/api/v1/ws`
- [ ] JWT authentication cho WebSocket
- [ ] Test basic connection/disconnect

**Day 3-4: Message Events**
- [ ] Integrate vào `POST /api/v1/messages/`
- [ ] Gửi `message:new` event
- [ ] Implement `message:mark_seen` handler
- [ ] Test message delivery

**Day 5-7: Notification Events**
- [ ] Integrate vào like/comment/follow APIs
- [ ] Gửi `notification:new` event
- [ ] Implement `notification:mark_seen` handler
- [ ] Gửi `notification:unseen_count` updates
- [ ] Test notification delivery

### Week 2: Admin APIs Foundation (5-7 ngày)

**Day 1-2: Admin Middleware & Stats**
- [ ] Tạo admin middleware `require_admin`
- [ ] Implement `/api/v1/admin/stats/overview`
- [ ] Implement `/api/v1/admin/stats/charts`
- [ ] Implement `/api/v1/admin/stats/recent-activity`
- [ ] Test stats accuracy

**Day 3-4: User Management**
- [ ] GET `/api/v1/admin/users` với pagination
- [ ] GET `/api/v1/admin/users/{id}` detail
- [ ] POST `/api/v1/admin/users/{id}/ban` + WebSocket
- [ ] POST `/api/v1/admin/users/{id}/unban`
- [ ] DELETE `/api/v1/admin/users/{id}`
- [ ] Test user CRUD

**Day 5-7: Video & Report Management**
- [ ] GET `/api/v1/admin/videos` với pagination
- [ ] DELETE `/api/v1/admin/videos/{id}` + WebSocket
- [ ] GET `/api/v1/admin/reports` với pagination
- [ ] POST `/api/v1/admin/reports/{id}/resolve` + WebSocket
- [ ] Test video/report CRUD

### Week 3: Polish & Production Ready (5-7 ngày)

**Day 1-2: Security & Validation**
- [ ] Implement rate limiting
- [ ] Add input validation
- [ ] XSS prevention
- [ ] Test security measures

**Day 3-4: Redis Scaling (Optional)**
- [ ] Setup Redis pub/sub
- [ ] Test cross-server WebSocket
- [ ] Load balancer sticky sessions

**Day 5-7: Testing & Documentation**
- [ ] Write unit tests
- [ ] Load testing
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Deployment guide

---

## 📚 PHẦN 7: Dependencies & Setup

### 7.1. Python Dependencies

**Add vào `requirements.txt`:**
```txt
fastapi==0.109.0
websockets==12.0
python-jose[cryptography]==3.3.0  # JWT
redis==5.0.1  # Optional - Phase 3
slowapi==0.1.9  # Rate limiting
python-multipart==0.0.6
sqlalchemy==2.0.25
```

### 7.2. Database Schema Requirements

**Cần có các tables:**
```sql
-- users table
users (
  id, username, email, password_hash, full_name, avatar_url, bio,
  follower_count, following_count, video_count,
  is_verified, is_banned, ban_reason, is_admin,
  created_at, updated_at, last_active
)

-- videos table  
videos (
  id, owner_id, title, description, video_url, thumb_url,
  visibility, duration, view_count, like_count, comment_count, share_count,
  created_at, updated_at
)

-- reports table
reports (
  id, reporter_id, target_type, target_id, reason, details,
  status, result, resolved_by, resolved_at,
  created_at
)

-- messages table
messages (
  id, sender_id, receiver_id, content, seen, seen_at,
  created_at
)

-- notifications table
notifications (
  id, user_id, type, ref_id, actor_id, seen, seen_at,
  created_at
)
```

**Migration cần thêm (nếu chưa có):**
- `users.is_admin BOOLEAN DEFAULT FALSE`
- `users.is_banned BOOLEAN DEFAULT FALSE`
- `users.ban_reason VARCHAR(500)`
- `reports.resolved_by INT` (foreign key to users.id)
- `reports.resolved_at TIMESTAMP`

### 7.3. Environment Variables

**Add vào `.env`:**
```env
# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=10080  # 7 days

# Redis (Optional - Phase 3)
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate Limiting
RATE_LIMIT_MESSAGES=100  # per minute
RATE_LIMIT_ADMIN_API=1000  # per hour
```

---

## ❓ PHẦN 8: FAQs

### Q1: Frontend sẽ polling hay WebSocket cho admin dashboard?
**A:** Frontend sẽ **polling** (mỗi 30-60s). KHÔNG dùng WebSocket cho admin stats vì:
- Admin stats không cần real-time (60s delay OK)
- Giảm complexity cho backend
- Admin chỉ có vài users, polling không tốn resource

### Q2: User offline thì message có bị mất không?
**A:** Không. Messages vẫn được save vào database. Khi user online lại:
- Frontend gọi `GET /api/v1/messages/inbox` để lấy missed messages
- WebSocket chỉ để gửi real-time, không phải primary storage

### Q3: Cần Redis ngay từ đầu không?
**A:** Không. Redis chỉ cần khi:
- Deploy multiple server instances
- Phase 1-2 dùng 1 server instance → không cần Redis
- Phase 3 mới setup Redis pub/sub

### Q4: Rate limiting bao nhiêu là hợp lý?
**A:**
- Messages: 100/minute per user (1.6 messages/second)
- Typing events: 10/minute per user
- Admin APIs: 1000/hour per admin (~16 requests/minute)

### Q5: WebSocket connection bị drop thì sao?
**A:** Frontend sẽ tự động reconnect. Backend chỉ cần:
- Remove connection khỏi ConnectionManager khi disconnect
- Accept reconnection với token mới
- Frontend handle reconnection logic

---

## 📞 PHẦN 9: Support & Contact

**Nếu có thắc mắc khi implement:**

1. **Event schema không rõ:** Check lại phần 1.2
2. **Database query không biết viết:** Check phần 2.2, 2.3, 2.4, 2.5
3. **WebSocket không hoạt động:** Check phần 5.1 testing
4. **Admin API response format:** Check từng endpoint ở phần 2

**Files cần tạo mới:**
- `app/websocket/connection_manager.py`
- `app/websocket/endpoint.py`
- `app/middleware/admin.py`
- `app/api/admin/stats.py`
- `app/api/admin/users.py`
- `app/api/admin/videos.py`
- `app/api/admin/reports.py`
- `app/websocket/redis_pubsub.py` (optional - Phase 3)

**Files cần sửa (thêm WebSocket integration):**
- `app/api/messages.py`
- `app/api/videos.py`
- `app/api/users.py`
- `app/api/admin.py` (hoặc tương đương)

---

## ✅ Checklist Tổng hợp

### WebSocket (Week 1)
- [ ] ConnectionManager class
- [ ] WebSocket endpoint `/api/v1/ws`
- [ ] JWT authentication
- [ ] Message events (new, seen)
- [ ] Notification events (new, unseen_count, mark_seen)
- [ ] Admin events (user_banned, video_deleted, report_resolved)
- [ ] Integrate vào existing APIs
- [ ] Error handling & heartbeat

### Admin APIs (Week 2)
- [ ] Admin middleware
- [ ] Stats: overview, charts, recent-activity
- [ ] Users: list, detail, ban, unban, delete, verify, role
- [ ] Videos: list, detail, visibility, delete, bulk-delete
- [ ] Reports: list, detail, resolve, reject, bulk-resolve
- [ ] Pagination, search, filter cho tất cả list endpoints
- [ ] WebSocket events khi admin actions

### Production Ready (Week 3)
- [ ] Rate limiting
- [ ] Input validation & XSS prevention
- [ ] Redis pub/sub (optional)
- [ ] Unit tests
- [ ] Load tests
- [ ] API documentation
- [ ] Deployment guide

---

**Total:** ~847 dòng document chi tiết, đủ để backend team implement hoàn chỉnh! 🚀
2. **Implement Stats APIs** (overview, charts, recent activity)
3. **Implement CRUD APIs** cho Users, Videos, Reports
4. **Add pagination, search, filter** cho tất cả list endpoints

### 2.1. Admin Middleware & Authorization

**File mới cần tạo:** `app/middleware/admin.py`

```python
from fastapi import HTTPException, Depends
from app.auth import get_current_user

async def require_admin(current_user = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Sử dụng trong routes:
# @app.get("/api/v1/admin/users", dependencies=[Depends(require_admin)])
```

---

### 2.2. Stats & Analytics APIs

**File:** `app/api/admin/stats.py`

Cần implement 3 endpoints sau:
```python
@app.get("/api/v1/admin/stats/overview")
async def get_admin_overview_stats():
    return {
        "users": {
            "total": await db.count_users(),
            "active_7d": await db.count_active_users(days=7),
            "new_today": await db.count_users_today(),
            "banned": await db.count_banned_users()
        },
        "videos": {
            "total": await db.count_videos(),
            "public": await db.count_videos(visibility="public"),
            "private": await db.count_videos(visibility="private"),
            "new_today": await db.count_videos_today()
        },
        "reports": {
            "total": await db.count_reports(),
            "pending": await db.count_reports(status="pending"),
            "resolved": await db.count_reports(status="resolved"),
            "rejected": await db.count_reports(status="rejected"),
            "resolved_today": await db.count_reports_resolved_today()
        },
        "engagement": {
            "total_likes": await db.count_all_likes(),
            "total_comments": await db.count_all_comments(),
            "total_follows": await db.count_all_follows(),
            "total_views": await db.count_all_views()
        }
    }
```

**2. Charts Data (Last 7 days)**
```python
@app.get("/api/v1/admin/stats/charts")
async def get_admin_charts_data():
    return {
        "users_chart": await db.get_users_chart_last_7_days(),
        # Format: [{"date": "2024-01-15", "count": 45, "active": 30}, ...]
        
        "videos_chart": await db.get_videos_chart_last_7_days(),
        # Format: [{"date": "2024-01-15", "count": 123, "views": 5000}, ...]
        
        "reports_chart": await db.get_reports_chart_last_7_days(),
        # Format: [{"date": "2024-01-15", "pending": 10, "resolved": 5, "rejected": 2}, ...]
        
        "engagement_chart": await db.get_engagement_chart_last_7_days()
        # Format: [{"date": "2024-01-15", "likes": 500, "comments": 200, "follows": 50}, ...]
    }
```

**3. Recent Activity (Polling every 30s)**
```python
@app.get("/api/v1/admin/stats/recent-activity")
async def get_recent_activity(limit: int = 10):
    return {
        "recent_users": await db.get_recent_users(limit),
        # Format: [{id, username, email, createdAt, avatarUrl}, ...]
        
        "recent_videos": await db.get_recent_videos(limit),
        # Format: [{id, title, ownerId, ownerName, createdAt, views, likes, visibility}, ...]
        
        "recent_reports": await db.get_recent_reports(limit)
        # Format: [{id, reporterId, reporterName, targetType, targetId, reason, status, createdAt}, ...]
    }
```

---

### User Management APIs

**1. Get All Users (Paginated)**
```python
@app.get("/api/v1/admin/users")
async def get_all_users(
    page: int = 1,
    limit: int = 20,
    search: str = None,
    status: str = None,  # "active", "banned", "all"
    sort_by: str = "created_at",  # "created_at", "username", "follower_count"
    order: str = "desc"  # "asc", "desc"
):
    offset = (page - 1) * limit
    users, total = await db.get_users_paginated(offset, limit, search, status, sort_by, order)
    
    return {
        "users": [
            {
                "id": u.id,
                "username": u.username,
                "email": u.email,
                "fullName": u.full_name,
                "avatarUrl": u.avatar_url,
                "bio": u.bio,
                "followerCount": u.follower_count,
                "followingCount": u.following_count,
                "videoCount": u.video_count,
                "isVerified": u.is_verified,
                "isBanned": u.is_banned,
                "banReason": u.ban_reason,
                "createdAt": u.created_at,
                "lastActive": u.last_active
            } for u in users
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }
```

**2. Get User Detail**
```python
@app.get("/api/v1/admin/users/{user_id}")
async def get_user_detail(user_id: int):
    user = await db.get_user(user_id)
    videos = await db.get_user_videos(user_id, limit=10)
    reports_by = await db.get_reports_by_user(user_id, limit=10)
    reports_against = await db.get_reports_against_user(user_id, limit=10)
    
    return {
        "user": user.dict(),
        "stats": {
            "videos": await db.count_user_videos(user_id),
            "followers": await db.count_user_followers(user_id),
            "following": await db.count_user_following(user_id),
            "total_likes": await db.count_user_total_likes(user_id),
            "total_views": await db.count_user_total_views(user_id),
            "reports_by_user": await db.count_reports_by_user(user_id),
            "reports_against_user": await db.count_reports_against_user(user_id)
        },
        "recent_videos": videos,
        "recent_reports_by": reports_by,
        "recent_reports_against": reports_against
    }
```

**3. Ban User**
```python
@app.post("/api/v1/admin/users/{user_id}/ban")
async def ban_user_endpoint(user_id: int, reason: str):
    await ban_user(admin_id=current_user.id, user_id=user_id, reason=reason)
    return {"success": True, "message": "User banned successfully"}
```

**4. Unban User**
```python
@app.post("/api/v1/admin/users/{user_id}/unban")
async def unban_user(user_id: int):
    db.unban_user(user_id)
    return {"success": True, "message": "User unbanned successfully"}
```

**5. Delete User**
```python
@app.delete("/api/v1/admin/users/{user_id}")
async def delete_user(user_id: int, reason: str):
    # Delete user and all related data (videos, comments, etc.)
    await db.delete_user_cascade(user_id)
    
    # Disconnect all WebSocket connections
    if user_id in connection_manager.connections:
        for ws in list(connection_manager.connections[user_id]):
            await ws.close(code=4003, reason="Account deleted")
        connection_manager.connections.pop(user_id, None)
    
    return {"success": True, "message": "User deleted successfully"}
```

**6. Update User Role**
```python
@app.put("/api/v1/admin/users/{user_id}/role")
async def update_user_role(user_id: int, role: str):  # "user", "moderator", "admin"
    db.update_user_role(user_id, role)
    return {"success": True, "message": "User role updated"}
```

**7. Verify User**
```python
@app.post("/api/v1/admin/users/{user_id}/verify")
async def verify_user(user_id: int):
    db.verify_user(user_id)
    return {"success": True, "message": "User verified successfully"}
```

---

### Video Management APIs

**1. Get All Videos (Paginated)**
```python
@app.get("/api/v1/admin/videos")
async def get_all_videos(
    page: int = 1,
    limit: int = 20,
    search: str = None,
    visibility: str = None,  # "public", "private", "all"
    sort_by: str = "created_at",  # "created_at", "views", "likes", "comments"
    order: str = "desc"
):
    offset = (page - 1) * limit
    videos, total = await db.get_videos_paginated(offset, limit, search, visibility, sort_by, order)
    
    return {
        "videos": [
            {
                "id": v.id,
                "title": v.title,
                "description": v.description,
                "videoUrl": v.video_url,
                "thumbUrl": v.thumb_url,
                "visibility": v.visibility,
                "ownerId": v.owner_id,
                "ownerUsername": v.owner.username,
                "ownerAvatar": v.owner.avatar_url,
                "views": v.view_count,
                "likes": v.like_count,
                "comments": v.comment_count,
                "shares": v.share_count,
                "createdAt": v.created_at,
                "duration": v.duration
            } for v in videos
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }
```

**2. Get Video Detail**
```python
@app.get("/api/v1/admin/videos/{video_id}")
async def get_video_detail(video_id: int):
    video = await db.get_video(video_id)
    owner = await db.get_user(video.owner_id)
    comments = await db.get_video_comments(video_id, limit=20)
    reports = await db.get_video_reports(video_id)
    
    return {
        "video": video.dict(),
        "owner": {"id": owner.id, "username": owner.username, "avatarUrl": owner.avatar_url},
        "stats": {
            "views": video.view_count,
            "likes": video.like_count,
            "comments": video.comment_count,
            "shares": video.share_count,
            "reports": len(reports)
        },
        "recent_comments": comments,
        "reports": reports
    }
```

**3. Update Video Visibility**
```python
@app.put("/api/v1/admin/videos/{video_id}/visibility")
async def update_video_visibility(video_id: int, visibility: str):  # "public", "private"
    db.update_video_visibility(video_id, visibility)
    return {"success": True, "message": "Video visibility updated"}
```

**4. Delete Video**
```python
@app.delete("/api/v1/admin/videos/{video_id}")
async def delete_video_endpoint(video_id: int, reason: str):
    await delete_video_by_admin(admin_id=current_user.id, video_id=video_id, reason=reason)
    return {"success": True, "message": "Video deleted successfully"}
```

**5. Bulk Delete Videos**
```python
@app.post("/api/v1/admin/videos/bulk-delete")
async def bulk_delete_videos(video_ids: List[int], reason: str):
    for video_id in video_ids:
        await delete_video_by_admin(current_user.id, video_id, reason)
    return {"success": True, "message": f"{len(video_ids)} videos deleted"}
```

---

### Report Management APIs

**1. Get All Reports (Paginated)**
```python
@app.get("/api/v1/admin/reports")
async def get_all_reports(
    page: int = 1,
    limit: int = 20,
    status: str = None,  # "pending", "resolved", "rejected", "all"
    target_type: str = None,  # "video", "comment", "user", "all"
    sort_by: str = "created_at",
    order: str = "desc"
):
    offset = (page - 1) * limit
    reports, total = await db.get_reports_paginated(offset, limit, status, target_type, sort_by, order)
    
    return {
        "reports": [
            {
                "id": r.id,
                "reporterId": r.reporter_id,
                "reporterUsername": r.reporter.username,
                "targetType": r.target_type,
                "targetId": r.target_id,
                "reason": r.reason,
                "details": r.details,
                "status": r.status,
                "result": r.result,
                "resolvedBy": r.resolved_by,
                "resolvedAt": r.resolved_at,
                "createdAt": r.created_at,
                "targetInfo": await get_target_info(r.target_type, r.target_id)
            } for r in reports
        ],
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }

async def get_target_info(target_type: str, target_id: int):
    if target_type == "video":
        v = await db.get_video(target_id)
        return {"title": v.title, "ownerUsername": v.owner.username}
    elif target_type == "user":
        u = await db.get_user(target_id)
        return {"username": u.username}
    elif target_type == "comment":
        c = await db.get_comment(target_id)
        return {"content": c.content[:50], "authorUsername": c.author.username}
```

**2. Get Report Detail**
```python
@app.get("/api/v1/admin/reports/{report_id}")
async def get_report_detail(report_id: int):
    report = await db.get_report(report_id)
    reporter = await db.get_user(report.reporter_id)
    
    target = None
    if report.target_type == "video":
        target = await db.get_video(report.target_id)
    elif report.target_type == "user":
        target = await db.get_user(report.target_id)
    elif report.target_type == "comment":
        target = await db.get_comment(report.target_id)
    
    return {
        "report": report.dict(),
        "reporter": {"id": reporter.id, "username": reporter.username, "avatarUrl": reporter.avatar_url},
        "target": target.dict() if target else None
    }
```

**3. Resolve Report**
```python
@app.post("/api/v1/admin/reports/{report_id}/resolve")
async def resolve_report_endpoint(report_id: int, result: str):
    await resolve_report(current_user.id, report_id, "resolved", result)
    return {"success": True, "message": "Report resolved"}
```

**4. Reject Report**
```python
@app.post("/api/v1/admin/reports/{report_id}/reject")
async def reject_report(report_id: int, reason: str):
    await resolve_report(current_user.id, report_id, "rejected", reason)
    return {"success": True, "message": "Report rejected"}
```

**5. Bulk Resolve Reports**
```python
@app.post("/api/v1/admin/reports/bulk-resolve")
async def bulk_resolve_reports(report_ids: List[int], result: str):
    for report_id in report_ids:
        await resolve_report(current_user.id, report_id, "resolved", result)
    return {"success": True, "message": f"{len(report_ids)} reports resolved"}
```

---

## 🔒 Security Requirements

**Authentication:**
- Verify JWT token khi WebSocket connect
- Admin APIs cần admin role token
- Reject invalid/expired tokens

**Authorization:**
- User chỉ nhận notifications/messages của mình
- Admin không nhận real-time stats qua WebSocket

**Rate Limiting:**
- Max 100 messages/minute per user
- Max 10 typing events/minute
- Max 1000 API requests/hour per admin

**Data Validation:**
- Validate tất cả incoming messages
- Sanitize content (XSS prevention)
- Limit lengths: message 5000 chars, reason 500 chars

---

## 📈 Scaling với Redis Pub/Sub

```python
import redis.asyncio as redis

redis_client = redis.Redis(host='localhost', port=6379)

# Publish event to Redis
async def broadcast_event(user_id: int, event: dict):
    await redis_client.publish('websocket_events', json.dumps({
        'user_id': user_id,
        'event': event
    }))

# Subscribe to Redis events
async def redis_listener():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe('websocket_events')
    
    async for message in pubsub.listen():
        if message['type'] == 'message':
            data = json.loads(message['data'])
            user_id = data['user_id']
            event = data['event']
            await connection_manager.send_to_user(user_id, event)
```

---

## 🧪 Testing Checklist

**WebSocket:**
- [ ] Connection with valid token
- [ ] Reject invalid token
- [ ] Multiple devices receive events
- [ ] Offline users don't crash server
- [ ] Message/notification delivery
- [ ] Seen status updates
- [ ] Admin events (ban, delete, resolve)

**Admin APIs:**
- [ ] Overview stats correct
- [ ] Charts data format correct
- [ ] Pagination works
- [ ] Search/filter works
- [ ] CRUD operations work
- [ ] Bulk operations work
- [ ] Authorization checks

---

## 📋 Priority Implementation Order

**Week 1:**
- WebSocket connection/authentication
- Basic message events
- Basic notification events
- Admin overview stats API

**Week 2:**
- Seen status updates
- Admin user management CRUD
- Admin video management CRUD
- Admin report management CRUD

**Week 3:**
- Charts APIs
- Redis pub/sub scaling
- Rate limiting
- Monitoring/logging

---

## 📚 Libraries

**Python (FastAPI):**
- `fastapi` - Web framework
- `websockets` - WebSocket support
- `redis-py` - Redis pub/sub
- `sqlalchemy` - Database ORM
- `pydantic` - Data validation

**Deployment:**
- Load balancer with sticky sessions
- Multiple server instances
- Redis for cross-server communication
- PostgreSQL/MySQL database
