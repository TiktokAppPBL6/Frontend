# Admin Panel

Admin Panel cho TikTok Clone với đầy đủ chức năng quản lý hệ thống.

## 📋 Tính năng

### ✅ Đã hoàn thành

#### 1. **Dashboard** (`/admin`)
- Tổng quan thống kê hệ thống
- Quick stats: Users, Videos, Comments, Reports
- Videos mới nhất
- Quick actions

#### 2. **Users Management** (`/admin/users`)
- Danh sách tất cả users
- Tìm kiếm users
- Lọc theo trạng thái (active, blocked, suspended)
- Thống kê users
- Actions:
  - 🔒 Ban user (chặn vĩnh viễn)
  - ⏸️ Suspend user (khóa tạm thời)
  - ✅ Unban user (mở khóa)

#### 3. **Videos Management** (`/admin/videos`)
- Danh sách tất cả videos với thumbnails
- Tìm kiếm videos
- Lọc theo visibility (public, hidden, deleted)
- Thống kê videos
- Actions:
  - ✅ Approve video
  - ❌ Reject video
  - 🗑️ Delete video

#### 4. **Reports Management** (`/admin/reports`)
- Danh sách tất cả reports
- Lọc theo trạng thái (pending, approved, rejected)
- Xem chi tiết report
- Actions:
  - ✅ Approve report
  - ❌ Reject report
  - 📝 Thêm quyết định xử lý

#### 5. **Comments Management** (`/admin/comments`)
- UI đã sẵn sàng
- ⏳ Chờ backend API

#### 6. **Analytics** (`/admin/analytics`)
- UI placeholder đã sẵn sàng
- ⏳ Chờ backend API

---

## 🔐 Phân quyền

### Admin Access
- Chỉ users có `role = "admin"` mới truy cập được
- AuthGuard tự động check và redirect nếu không có quyền
- Link "Admin Panel" chỉ hiển thị trong Sidebar cho admin

### Kiểm tra trong code:
```typescript
// Trong AuthGuard
if (requireAdmin && user?.role !== 'admin') {
  toast.error('Bạn không có quyền truy cập trang này!');
  return <Navigate to="/home" replace />;
}
```

---

## 🎨 UI/UX

### Design System
- Dark theme (`bg-[#121212]`)
- Consistent cards (`bg-[#1e1e1e]`)
- Color coding:
  - 🔵 Blue - Users, Info
  - 🟣 Purple - Videos, Admin
  - 🟢 Green - Success, Active
  - 🔴 Red - Danger, Delete
  - 🟡 Yellow - Warning, Pending

### Components
- Search bars với icon
- Filter dropdowns
- Stats cards với icons
- Action buttons với tooltips
- Confirmation modals
- Loading states

---

## 🛣️ Routes

```typescript
/admin                  → Dashboard
/admin/users           → Users Management
/admin/videos          → Videos Management  
/admin/reports         → Reports Management
/admin/comments        → Comments Management (WIP)
/admin/analytics       → Analytics (WIP)
```

Tất cả routes được protect bởi `<AuthGuard requireAdmin>`.

---

## 📊 API Integration

### Đã tích hợp:
```typescript
// Admin API
adminApi.listUsers({ status, limit })
adminApi.listVideos({ status, limit })
adminApi.userAction(userId, { action, reason })
adminApi.videoAction(videoId, { action, reason })
adminApi.commentAction(commentId, { action, reason })

// Reports API
reportsApi.getReports()
reportsApi.updateReport(reportId, { status, decision })

// Videos API (for recent videos)
videosApi.getVideos({ page, pageSize })
```

### Cần backend bổ sung:
Xem chi tiết trong [`docs/ADMIN_APIS_NEEDED.md`](../../docs/ADMIN_APIS_NEEDED.md)

**Tóm tắt cần bổ sung:**
- Comments Management APIs (3 endpoints)
- Analytics APIs (12 endpoints)
- Advanced admin actions (bulk operations)
- Content moderation APIs
- System config APIs

---

## 🔧 Cách sử dụng

### 1. Setup Admin User
Để test admin features, bạn cần user có `role = "admin"`:

```sql
-- Update existing user to admin
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### 2. Login as Admin
```typescript
// Login với admin account
await authApi.login({
  email: 'admin@example.com',
  password: 'your_password'
});
```

### 3. Access Admin Panel
- Sidebar sẽ hiển thị "Admin Panel" link
- Click vào để truy cập dashboard
- Hoặc truy cập trực tiếp: `/admin`

---

## 📝 Code Examples

### User Action
```typescript
// Ban user
await adminApi.userAction(userId, {
  action: 'ban',
  reason: 'Spam content'
});

// Unban user
await adminApi.userAction(userId, {
  action: 'unban',
  reason: 'Appeal accepted'
});
```

### Video Action
```typescript
// Delete video
await adminApi.videoAction(videoId, {
  action: 'delete',
  reason: 'Violates community guidelines'
});

// Approve video
await adminApi.videoAction(videoId, {
  action: 'approve',
  reason: 'Content reviewed and approved'
});
```

### Report Handling
```typescript
// Approve report
await reportsApi.updateReport(reportId, {
  status: 'approved',
  decision: 'Content removed and user warned'
});

// Reject report
await reportsApi.updateReport(reportId, {
  status: 'rejected',
  decision: 'No violation found'
});
```

---

## 🚀 Future Enhancements

### Phase 1 (Current)
- [x] Dashboard
- [x] Users Management
- [x] Videos Management
- [x] Reports Management
- [ ] Comments Management (waiting for API)
- [ ] Analytics (waiting for API)

### Phase 2
- [ ] Bulk actions (select multiple items)
- [ ] Advanced filters and sorting
- [ ] Export data (CSV, JSON)
- [ ] Charts and visualizations
- [ ] Real-time updates with WebSocket

### Phase 3
- [ ] Content moderation AI
- [ ] Automated rules engine
- [ ] Role-based permissions (moderator, super admin)
- [ ] Audit logs
- [ ] Email notifications for admins

### Phase 4
- [ ] Revenue analytics (if monetization added)
- [ ] System configuration UI
- [ ] Broadcast notifications
- [ ] A/B testing tools

---

## 🐛 Known Issues

1. **Comments Management**: UI sẵn sàng nhưng cần backend API
2. **Analytics**: Placeholder UI, cần backend data
3. **Real-time updates**: Hiện tại phải refresh manual

---

## 📚 Related Documentation

- [API Documentation](../../docs/API.md)
- [Admin APIs Needed](../../docs/ADMIN_APIS_NEEDED.md)
- [API Changelog](../../src/api/CHANGELOG.md)

---

## 💡 Tips

### Performance
- Sử dụng React Query cho caching và auto-refetch
- Pagination cho large lists
- Lazy loading cho images

### Security
- Tất cả admin actions đều require authentication
- Token được check tự động
- Input validation trước khi gửi request

### UX
- Confirmation modals cho destructive actions
- Toast notifications cho feedback
- Loading states cho async operations
- Error handling với user-friendly messages

---

## 🤝 Contributing

Khi thêm features mới:

1. Tạo page component trong `src/pages/admin/`
2. Thêm route trong `src/app/routes.tsx`
3. Thêm menu item trong Sidebar (nếu cần)
4. Tạo API functions trong `src/api/admin.api.ts`
5. Update documentation

---

## 📞 Support

Nếu có vấn đề hoặc câu hỏi:
- Check [ADMIN_APIS_NEEDED.md](../../docs/ADMIN_APIS_NEEDED.md) để xem API nào cần backend làm
- Review code trong các component đã có
- Test với admin account trước

---

**Built with ❤️ for TikTok Clone**
