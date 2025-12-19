# API Backend Cần Bổ Sung Cho Admin Features

Đây là danh sách các API endpoint cần backend phát triển thêm để hỗ trợ đầy đủ chức năng Admin Panel.

---

## 1. Comments Management APIs

### `GET /admin/comments/list`
Lấy danh sách tất cả comments trong hệ thống (cho admin).

**Query Parameters:**
- `skip` (optional): Số lượng bỏ qua (pagination)
- `limit` (optional): Số lượng trả về (default: 100)
- `video_id` (optional): Lọc theo video
- `user_id` (optional): Lọc theo user
- `status` (optional): Lọc theo trạng thái (active, deleted, reported)
- `sort_by` (optional): Sắp xếp theo (created_at, updated_at)
- `order` (optional): Thứ tự (asc, desc)

**Response:**
```json
{
  "comments": [
    {
      "id": 1,
      "content": "Nice video!",
      "videoId": 123,
      "userId": 456,
      "user": {
        "id": 456,
        "username": "user123",
        "avatarUrl": "..."
      },
      "video": {
        "id": 123,
        "title": "Video Title"
      },
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "reportsCount": 0
    }
  ],
  "total": 1000
}
```

---

### `GET /admin/comments/reported`
Lấy danh sách comments bị báo cáo.

**Query Parameters:**
- `skip`, `limit` (pagination)

**Response:**
```json
{
  "comments": [...],
  "total": 50
}
```

---

### `GET /admin/comments/stats`
Thống kê về comments.

**Response:**
```json
{
  "total": 10000,
  "active": 9500,
  "deleted": 500,
  "reported": 50,
  "todayCount": 150,
  "weekCount": 1000,
  "monthCount": 4000
}
```

---

## 2. Analytics & Statistics APIs

### `GET /admin/analytics/overview`
Tổng quan thống kê hệ thống.

**Response:**
```json
{
  "users": {
    "total": 10000,
    "active": 8000,
    "new_today": 50,
    "new_week": 300,
    "new_month": 1200
  },
  "videos": {
    "total": 50000,
    "public": 48000,
    "hidden": 1500,
    "deleted": 500,
    "uploaded_today": 100,
    "uploaded_week": 700,
    "uploaded_month": 3000
  },
  "comments": {
    "total": 100000,
    "today": 500,
    "week": 3500,
    "month": 15000
  },
  "reports": {
    "total": 500,
    "pending": 50,
    "approved": 300,
    "rejected": 150
  }
}
```

---

### `GET /admin/analytics/users/growth`
Thống kê tăng trưởng users theo thời gian.

**Query Parameters:**
- `period` (required): daily, weekly, monthly, yearly
- `start_date` (optional): Ngày bắt đầu
- `end_date` (optional): Ngày kết thúc

**Response:**
```json
{
  "data": [
    {
      "date": "2024-01-01",
      "new_users": 50,
      "total_users": 10000,
      "active_users": 8000
    },
    {
      "date": "2024-01-02",
      "new_users": 60,
      "total_users": 10060,
      "active_users": 8100
    }
  ]
}
```

---

### `GET /admin/analytics/users/active`
Thống kê users hoạt động.

**Query Parameters:**
- `timeframe`: daily, weekly, monthly

**Response:**
```json
{
  "daily_active": 5000,
  "weekly_active": 7000,
  "monthly_active": 9000,
  "retention_rate": 0.85
}
```

---

### `GET /admin/analytics/users/demographics`
Phân tích nhân khẩu học users.

**Response:**
```json
{
  "by_country": [
    { "country": "VN", "count": 8000 },
    { "country": "US", "count": 1500 },
    { "country": "JP", "count": 500 }
  ],
  "by_age_group": [
    { "age_group": "18-24", "count": 4000 },
    { "age_group": "25-34", "count": 3500 },
    { "age_group": "35-44", "count": 2000 }
  ]
}
```

---

### `GET /admin/analytics/videos/trending`
Videos đang trending.

**Query Parameters:**
- `limit` (optional): Số lượng (default: 20)
- `timeframe`: today, week, month

**Response:**
```json
{
  "videos": [
    {
      "id": 123,
      "title": "Trending Video",
      "viewCount": 50000,
      "likeCount": 10000,
      "shareCount": 2000,
      "growthRate": 1.5
    }
  ]
}
```

---

### `GET /admin/analytics/videos/views`
Thống kê lượt xem videos theo thời gian.

**Query Parameters:**
- `period`: daily, weekly, monthly
- `start_date`, `end_date`

**Response:**
```json
{
  "data": [
    {
      "date": "2024-01-01",
      "views": 100000,
      "unique_views": 80000
    }
  ],
  "total_views": 5000000
}
```

---

### `GET /admin/analytics/videos/engagement`
Tỷ lệ tương tác videos.

**Response:**
```json
{
  "average_likes_per_video": 150,
  "average_comments_per_video": 25,
  "average_shares_per_video": 10,
  "engagement_rate": 0.15,
  "completion_rate": 0.75
}
```

---

### `GET /admin/analytics/videos/duration`
Phân tích độ dài videos.

**Response:**
```json
{
  "distribution": [
    { "range": "0-15s", "count": 10000 },
    { "range": "15-30s", "count": 15000 },
    { "range": "30-60s", "count": 20000 },
    { "range": "60s+", "count": 5000 }
  ],
  "average_duration": 35
}
```

---

### `GET /admin/analytics/system/performance`
Hiệu suất hệ thống.

**Response:**
```json
{
  "api_response_time": {
    "average": 150,
    "p95": 300,
    "p99": 500
  },
  "error_rate": 0.02,
  "uptime": 0.999,
  "requests_per_second": 1000
}
```

---

### `GET /admin/analytics/system/storage`
Thống kê storage.

**Response:**
```json
{
  "total_storage_gb": 1000,
  "used_storage_gb": 750,
  "free_storage_gb": 250,
  "videos_storage_gb": 700,
  "avatars_storage_gb": 50,
  "growth_rate_gb_per_day": 5
}
```

---

### `GET /admin/analytics/system/bandwidth`
Thống kê băng thông.

**Query Parameters:**
- `period`: daily, weekly, monthly

**Response:**
```json
{
  "data": [
    {
      "date": "2024-01-01",
      "bandwidth_gb": 500,
      "cost_usd": 50
    }
  ],
  "total_bandwidth_gb": 15000,
  "total_cost_usd": 1500
}
```

---

### `GET /admin/analytics/system/errors`
Logs và errors.

**Query Parameters:**
- `limit` (optional): Số lượng (default: 100)
- `severity`: info, warning, error, critical

**Response:**
```json
{
  "errors": [
    {
      "id": 1,
      "timestamp": "2024-01-01T12:00:00Z",
      "severity": "error",
      "message": "Database connection timeout",
      "stack_trace": "...",
      "user_id": 123,
      "request_id": "abc-123"
    }
  ],
  "total": 1000
}
```

---

## 3. Advanced Admin Actions

### `POST /admin/users/bulk-action`
Thao tác hàng loạt với users.

**Request Body:**
```json
{
  "user_ids": [1, 2, 3, 4, 5],
  "action": "ban" | "unban" | "delete" | "suspend",
  "reason": "Spam accounts"
}
```

**Response:**
```json
{
  "success": true,
  "affected_count": 5,
  "message": "Successfully performed action on 5 users"
}
```

---

### `POST /admin/videos/bulk-action`
Thao tác hàng loạt với videos.

**Request Body:**
```json
{
  "video_ids": [1, 2, 3],
  "action": "approve" | "reject" | "delete",
  "reason": "Inappropriate content"
}
```

---

### `POST /admin/reports/bulk-handle`
Xử lý nhiều reports cùng lúc.

**Request Body:**
```json
{
  "report_ids": [1, 2, 3],
  "status": "approved" | "rejected",
  "decision": "Content removed"
}
```

---

## 4. Content Moderation APIs

### `GET /admin/moderation/queue`
Hàng đợi nội dung cần kiểm duyệt.

**Query Parameters:**
- `type`: video, comment, user
- `priority`: high, medium, low

**Response:**
```json
{
  "items": [
    {
      "id": 123,
      "type": "video",
      "title": "Video Title",
      "reported_count": 5,
      "priority": "high",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50
}
```

---

### `POST /admin/moderation/ai-scan`
Quét nội dung bằng AI.

**Request Body:**
```json
{
  "target_type": "video" | "comment",
  "target_id": 123
}
```

**Response:**
```json
{
  "is_safe": false,
  "violations": ["violence", "nudity"],
  "confidence": 0.95,
  "details": {
    "violence_score": 0.8,
    "nudity_score": 0.9
  }
}
```

---

## 5. Revenue & Monetization (Optional)

### `GET /admin/revenue/overview`
Tổng quan doanh thu.

**Response:**
```json
{
  "total_revenue": 100000,
  "today_revenue": 500,
  "month_revenue": 15000,
  "year_revenue": 100000
}
```

---

### `GET /admin/revenue/by-creator`
Doanh thu theo creator.

**Response:**
```json
{
  "creators": [
    {
      "user_id": 123,
      "username": "creator1",
      "revenue": 5000,
      "views": 100000
    }
  ]
}
```

---

## 6. Notification Management

### `POST /admin/notifications/broadcast`
Gửi thông báo broadcast cho tất cả users.

**Request Body:**
```json
{
  "title": "System Maintenance",
  "message": "The system will be down for maintenance...",
  "target_users": "all" | "active" | [user_ids],
  "priority": "high" | "medium" | "low"
}
```

**Response:**
```json
{
  "success": true,
  "sent_count": 10000,
  "message": "Notification sent successfully"
}
```

---

## 7. System Configuration

### `GET /admin/config/settings`
Lấy cấu hình hệ thống.

**Response:**
```json
{
  "max_video_size_mb": 100,
  "max_video_duration_sec": 180,
  "allowed_video_formats": ["mp4", "mov", "avi"],
  "registration_enabled": true,
  "maintenance_mode": false
}
```

---

### `PUT /admin/config/settings`
Cập nhật cấu hình hệ thống.

**Request Body:**
```json
{
  "max_video_size_mb": 150,
  "maintenance_mode": true
}
```

---

## Tổng Kết

### API đã có sẵn: ✅
- Admin user actions
- Admin video actions
- Admin comment actions
- List users/videos
- Run tests
- Reports management

### API cần bổ sung: 📋
1. **Comments Management** (3 endpoints)
2. **Analytics & Statistics** (12 endpoints)
3. **Advanced Admin Actions** (3 endpoints)
4. **Content Moderation** (2 endpoints)
5. **Revenue & Monetization** (2 endpoints - optional)
6. **Notification Management** (1 endpoint)
7. **System Configuration** (2 endpoints)

**Tổng cộng: ~25 endpoints cần bổ sung**

### Ưu tiên triển khai:
1. **High Priority**: Comments Management, Basic Analytics
2. **Medium Priority**: Content Moderation, Advanced Actions
3. **Low Priority**: Revenue, Notifications, Config

---

## Notes
- Tất cả admin endpoints phải require `role = admin`
- Thêm rate limiting cho admin APIs
- Log tất cả admin actions để audit
- Thêm pagination cho tất cả list endpoints
- Support export data (CSV, JSON)
