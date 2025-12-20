# Backend Implementation Guide - WebSocket & Admin APIs

## 📋 Overview
Real-time WebSocket cho Messages + Notifications, REST APIs cho Admin dashboard.

## 🔌 WebSocket Implementation

### Endpoint
```
WS /api/v1/ws?token={jwt_token}
```

### Event Schemas

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
// Server → Client: Thông báo mới (like/comment/follow)
{ type: "notification:new", data: { id, userId, type, refId, createdAt, seen, actor: {id, username, avatarUrl} } }

// Server → Client: Số chưa đọc
{ type: "notification:unseen_count", data: { count } }

// Client → Server: Mark as seen
{ type: "notification:mark_seen", data: { notificationIds: [] } }
```

**Admin Events:** (Chỉ gửi cho affected users)
```javascript
{ type: "admin:user_banned", data: { userId, reason, bannedAt } }
{ type: "admin:video_deleted", data: { videoId, reason, deletedAt } }
{ type: "admin:report_resolved", data: { reportId, status, result, resolvedAt } }
```

### Connection Manager

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

### WebSocket Endpoint Handler

```python
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
    except WebSocketDisconnect:
        connection_manager.remove_connection(user.id, websocket)
```

## 📤 Broadcasting Events

### Khi user A gửi message cho user B:

```python
async def send_message(sender_id: int, receiver_id: int, content: str):
    # 1. Save to database
    message = db.create_message(sender_id, receiver_id, content)
    
    # 2. Gửi WebSocket đến receiver
    await connection_manager.send_to_user(receiver_id, {
        "type": "message:new",
        "data": message.dict()
    })
    
    return message  # Return cho REST API response
```

### Khi user A like video của user B:

```python
async def create_like(user_id: int, video_id: int):
    # 1. Save like
    like = db.create_like(user_id, video_id)
    
    # 2. Get video owner
    video = db.get_video(video_id)
    if video.owner_id == user_id:
        return like  # Không notify chính mình
    
    # 3. Create notification
    notification = db.create_notification(
        user_id=video.owner_id,
        type="like",
        ref_id=video_id
    )
    
    # 4. Get actor info
    actor = db.get_user(user_id)
    
    # 5. Gửi WebSocket
    await connection_manager.send_to_user(video.owner_id, {
        "type": "notification:new",
        "data": {
            **notification.dict(),
            "actor": {
                "id": actor.id,
                "username": actor.username,
                "avatarUrl": actor.avatar_url
            }
        }
    })
    
    # 6. Update unseen count
    unseen = db.count_unseen_notifications(video.owner_id)
    await connection_manager.send_to_user(video.owner_id, {
        "type": "notification:unseen_count",
        "data": {"count": unseen}
    })
    
    return like
```

### Khi admin ban user:

```python
async def ban_user(admin_id: int, user_id: int, reason: str):
    # 1. Update user status
    db.ban_user(user_id, reason)
    
    # 2. Gửi WebSocket đến user bị ban
    await connection_manager.send_to_user(user_id, {
        "type": "admin:user_banned",
        "data": {
            "userId": user_id,
            "reason": reason,
            "bannedAt": datetime.utcnow().isoformat()
        }
    })
    
    # 3. Disconnect user
    if user_id in connection_manager.connections:
        for ws in list(connection_manager.connections[user_id]):
            await ws.close(code=4003, reason="Account banned")
        connection_manager.connections.pop(user_id, None)
    
    return {"success": True}
```

### Khi admin xóa video:

```python
async def delete_video_by_admin(admin_id: int, video_id: int, reason: str):
    # 1. Get video info
    video = db.get_video(video_id)
    
    # 2. Delete video
    db.delete_video(video_id)
    
    # 3. Notify owner
    await connection_manager.send_to_user(video.owner_id, {
        "type": "admin:video_deleted",
        "data": {
            "videoId": video_id,
            "reason": reason,
            "deletedAt": datetime.utcnow().isoformat()
        }
    })
    
    return {"success": True}
```

### Khi admin resolve report:

```python
async def resolve_report(admin_id: int, report_id: int, status: str, result: str):
    # status: "resolved" hoặc "rejected"
    
    # 1. Get report info
    report = db.get_report(report_id)
    
    # 2. Update report
    db.update_report(report_id, status, result)
    
    # 3. Notify reporter
    await connection_manager.send_to_user(report.reporter_id, {
        "type": "admin:report_resolved",
        "data": {
            "reportId": report_id,
            "status": status,
            "result": result,
            "resolvedAt": datetime.utcnow().isoformat()
        }
    })
    
    return {"success": True}
```

## � Admin Dashboard Stats API (REST - Không dùng WebSocket)

Admin dashboard sẽ polling các API sau để lấy thống kê:

### 1. Overview Stats
```python
@app.get("/api/v1/admin/stats/overview")
async def get_admin_overview_stats():
    return {
        "users": {
            "total": await db.count_users(),
            "active": await db.count_active_users(days=7),
            "new_today": await db.count_users_today()
        },
        "videos": {
            "total": await db.count_videos(),
            "public": await db.count_videos(visibility="public"),
            "new_today": await db.count_videos_today()
        },
        "reports": {
            "total": await db.count_reports(),
            "pending": await db.count_reports(status="pending"),
            "resolved_today": await db.count_reports_resolved_today()
        }
    }
```

### 2. Charts Data (7 ngày gần đây)
```python
@app.get("/api/v1/admin/stats/charts")
async def get_admin_charts_data():
    return {
        "users_chart": await db.get_users_chart_last_7_days(),
        # Trả về: [{"date": "2024-01-15", "count": 45}, ...]
        
        "videos_chart": await db.get_videos_chart_last_7_days(),
        # Trả về: [{"date": "2024-01-15", "count": 123}, ...]
        
        "reports_chart": await db.get_reports_chart_last_7_days()
        # Trả về: [{"date": "2024-01-15", "pending": 10, "resolved": 5}, ...]
    }
```

### 3. Recent Activity
```python
@app.get("/api/v1/admin/stats/recent-activity")
async def get_recent_activity(limit: int = 10):
    return {
        "recent_users": await db.get_recent_users(limit),
        "recent_videos": await db.get_recent_videos(limit),
        "recent_reports": await db.get_recent_reports(limit)
    }
```

**Frontend sẽ polling:**
- Overview & Charts: Mỗi 60 giây
- Recent Activity: Mỗi 30 giây
- Khi admin thực hiện action: Refresh ngay lập tức

## �🗄️ Connection Manager

```python
class ConnectionManager:
    def __init__(self):
        # userId -> Set of WebSocket connections
        self.connections: dict[int, set[WebSocket]] = {}
    
    def add_connection(self, user_id: int, websocket: WebSocket):
        if user_id not in self.connections:
            self.connections[user_id] = set()
        self.connections[user_id].add(websocket)
    
    def remove_connection(self, user_id: int, websocket: WebSocket):
        if user_id in self.connections:
            self.connections[user_id].discard(websocket)
            if not self.connections[user_id]:
                del self.connections[user_id]
    
    async def send_to_user(self, user_id: int, message: dict):
        """Send message to all connections of a user"""
        if user_id not in self.connections:
            return  # User offline, skip
        
        for ws in list(self.connections[user_id]):
            try:
                await ws.send_json(message)
            except Exception:
                # Connection broken, remove it
                self.remove_connection(user_id, ws)

# Singleton instance
connection_manager = ConnectionManager()
```

## 🔄 Integration Points

### Nơi cần gửi WebSocket events:

#### User Actions
| Action | API Endpoint | WebSocket Event |
|--------|-------------|-----------------|
| Send message | `POST /api/v1/messages/` | `message:new` → receiver |
| Mark as seen | `POST /api/v1/messages/mark-seen` | `message:seen` → sender |
| Like video | `POST /api/v1/videos/{id}/like` | `notification:new` → video owner |
| Comment video | `POST /api/v1/comments/` | `notification:new` → video owner |
| Follow user | `POST /api/v1/users/{id}/follow` | `notification:new` → followed user |

#### Admin Actions
| Action | API Endpoint | WebSocket Event |
|--------|-------------|-----------------|
| Ban user | `POST /api/v1/admin/users/{id}/ban` | `admin:user_banned` → affected user |
| Delete video | `DELETE /api/v1/admin/videos/{id}` | `admin:video_deleted` → video owner |
| Resolve report | `POST /api/v1/admin/reports/{id}/resolve` | `admin:report_resolved` → reporter |

**Admin Dashboard Stats (REST API - Không dùng WebSocket):**
| Endpoint | Purpose | Polling Interval |
|----------|---------|------------------|
| `GET /api/v1/admin/stats/overview` | Tổng quan (users, videos, reports) | 60 giây |
| `GET /api/v1/admin/stats/charts` | Data cho biểu đồ | 60 giây |
| `GET /api/v1/admin/stats/recent-activity` | Hoạt động gần đây | 30 giây |

## 📦 Example với FastAPI

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse

app = FastAPI()

@app.websocket("/api/v1/ws")
async def websocket_endpoint(websocket: WebSocket, token: str):
    # Verify token
    user = await verify_jwt(token)
    if not user:
        await websocket.close(code=4001)
        return
    
    # Accept connection
    await websocket.accept()
    connection_manager.add_connection(user.id, websocket)
    
    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "userId": user.id
        })
        
        # Keep connection alive
        while True:
            # Receive messages from client (if any)
            data = await websocket.receive_json()
            await handle_client_message(user.id, data)
            
    except WebSocketDisconnect:
        connection_manager.remove_connection(user.id, websocket)

async def handle_client_message(user_id: int, data: dict):
    """Handle messages from client (e.g., mark as seen, typing)"""
    message_type = data.get("type")
    
    if message_type == "message:mark_seen":
        message_ids = data["data"]["messageIds"]
        await mark_messages_as_seen(message_ids)
    
    elif message_type == "pong":
        # Heartbeat response
        pass
```

## 🚨 Important Notes

### General
1. **REST API vẫn cần hoạt động** - Frontend sẽ fallback về polling nếu WebSocket fail
2. **Hỗ trợ multiple connections** - User có thể mở nhiều tabs/devices
3. **Rate limiting** - Chặn spam (max 100 messages/minute)
4. **Heartbeat** - Ping/pong mỗi 30 giây để check connection alive
5. **Reconnection** - Client sẽ tự động reconnect nếu bị disconnect

### Admin-specific
6. **Admin stats qua REST API** - Dashboard polling mỗi 30-60 giây, KHÔNG dùng WebSocket cho stats
7. **Chỉ 3 events cơ bản** - user_banned, video_deleted, report_resolved
8. **Notify affected users only** - User bị ban, owner video bị xóa, người report
9. **Graceful disconnect** - Gửi event trước khi disconnect user bị ban
10. **Simple charts** - Dữ liệu biểu đồ 7 ngày qua, polling mỗi 60 giây

## 📋 Testing Checklist

### Basic Connection
- [ ] User connect với valid token
- [ ] User bị reject với invalid token
- [ ] Multiple devices cùng user nhận events
- [ ] User offline không crash server
- [ ] Reconnection hoạt động

### Messages
- [ ] Send message qua API → receiver nhận WebSocket event
- [ ] Mark as seen → sender nhận update
- [ ] User offline → message được queue và gửi khi online

### Notifications
- [ ] Like video → owner nhận notification WebSocket
- [ ] Comment video → owner nhận notification
- [ ] Follow user → followed user nhận notification
- [ ] Unseen count được update đúng

### Admin Functions
- [ ] Ban user → user nhận event và bị disconnect
- [ ] Delete video → owner nhận notification
- [ ] Resolve report → reporter nhận notification
- [ ] Admin stats API hoạt động đúng (REST không phải WebSocket)
- [ ] Charts data trả về đúng format cho 7 ngày

## 🔗 Chi tiết đầy đủ

Xem file `WEBSOCKET_REQUIREMENTS.md` để biết:
- Full event schema
- Error handling
- Security requirements
- Scaling với Redis
- Production deployment

## 💬 Questions?

Liên hệ Frontend team để clarify event format hoặc thắc mắc về integration.
