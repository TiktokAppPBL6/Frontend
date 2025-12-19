# API Documentation

Tài liệu này mô tả tất cả các API endpoints được sử dụng trong TikTok Clone Frontend, tương ứng với backend FastAPI.

## Base URL

```typescript
API_BASE_URL = 'https://toptop-backend-api.azurewebsites.net'
API_VERSION = 'v1'
API_FULL_URL = `${API_BASE_URL}/api/${API_VERSION}`
```

## Authentication

Tất cả các request yêu cầu authentication sẽ tự động thêm token vào header:

```typescript
Authorization: Bearer {accessToken}
```

Token được lưu trong `localStorage` với key `accessToken`.

---

## 1. Authentication API (`authApi`)

### `POST /auth/register`
Đăng ký tài khoản mới.

```typescript
authApi.register({
  email: string,
  username: string,
  password: string,
  fullName?: string
})
```

### `POST /auth/login`
Đăng nhập (OAuth2 password flow).

```typescript
authApi.login({
  email: string,
  password: string
})
```

### `POST /auth/verify-password`
Xác thực mật khẩu hiện tại.

```typescript
authApi.verifyPassword(password: string, email?: string)
```

### `GET /auth/test-token`
Kiểm tra token hiện tại có hợp lệ không.

```typescript
authApi.testToken()
```

### `GET /auth/google/login`
Redirect đến Google OAuth login.

```typescript
authApi.googleLogin()
```

### `GET /auth/google/callback`
Callback từ Google OAuth (xử lý bởi backend).

```typescript
authApi.googleCallback(code: string, state?: string)
```

---

## 2. Users API (`usersApi`)

### `GET /users/me`
Lấy thông tin user hiện tại.

```typescript
usersApi.getMe()
```

### `PUT /users/me`
Cập nhật thông tin user hiện tại.

```typescript
usersApi.updateMe({
  username?: string,
  fullName?: string,
  email?: string
})
```

### `POST /users/me/avatar`
Upload avatar.

```typescript
usersApi.uploadAvatar(file: File)
```

### `GET /users/{user_id}`
Lấy thông tin user theo ID.

```typescript
usersApi.getUser(userId: number)
```

### `GET /users/`
Danh sách users (có phân trang).

```typescript
usersApi.listUsers({
  page?: number,
  pageSize?: number
})
```

### `GET /users/search`
Tìm kiếm users.

```typescript
usersApi.searchUsers(query: string)
```

---

## 3. Videos API (`videosApi`)

### `POST /videos/`
Upload video mới.

```typescript
videosApi.uploadVideo({
  title: string,
  description?: string,
  file?: File,
  url?: string,
  visibility?: 'public' | 'hidden',
  enableDubbing?: boolean,
  speakerId?: string
})
```

### `GET /videos/`
Danh sách videos (feed chính).

```typescript
videosApi.getVideos({
  page?: number,
  pageSize?: number,
  sort?: string,
  order?: 'asc' | 'desc'
})
```

### `GET /videos/search`
Tìm kiếm videos.

```typescript
videosApi.searchVideos({
  query: string,
  page?: number,
  pageSize?: number
})
```

### `GET /videos/following/feed`
Feed của các user đang follow.

```typescript
videosApi.getFollowingFeed({
  page?: number,
  pageSize?: number
})
```

### `GET /videos/{video_id}`
Lấy thông tin video theo ID.

```typescript
videosApi.getVideo(videoId: number)
```

### `PUT /videos/{video_id}`
Cập nhật video.

```typescript
videosApi.updateVideo(videoId: number, {
  title?: string,
  description?: string,
  visibility?: 'public' | 'hidden' | 'deleted'
})
```

### `DELETE /videos/{video_id}`
Xóa video.

```typescript
videosApi.deleteVideo(videoId: number)
```

### `GET /videos/user/{user_id}`
Lấy videos của user.

```typescript
videosApi.getUserVideos(userId: number, {
  page?: number,
  pageSize?: number
})
```

### `POST /videos/{video_id}/dubbing`
Tạo dubbing cho video.

```typescript
videosApi.createDubbing(videoId: number, {
  target_language: string,
  speaker_id?: string
})
```

### `GET /videos/audio/{audio_filename}`
Lấy file audio đã dubbing.

```typescript
videosApi.getDubbedAudio(audioFilename: string)
```

---

## 4. Video Transcription API

### `GET /videos/{video_id}/transcript`
Lấy transcript của video.

```typescript
videosApi.getVideoTranscript(videoId: number)
```

### `POST /videos/{video_id}/transcribe`
Tạo transcript cho video.

```typescript
videosApi.transcribeVideo(videoId: number, {
  language?: string
})
```

### `POST /videos/{video_id}/text-to-speech`
Tạo audio từ transcript.

```typescript
videosApi.generateSpeech(videoId: number, {
  speaker_id?: string,
  language?: string
})
```

### `GET /videos/{video_id}/text-to-speech/download`
Download audio TTS mới nhất.

```typescript
videosApi.downloadTTSAudio(videoId: number)
```

---

## 5. Comments API (`commentsApi`)

### `POST /comments/`
Tạo comment mới.

```typescript
commentsApi.createComment({
  videoId: number,
  content: string,
  parentId?: number
})
```

### `GET /comments/video/{video_id}`
Lấy comments của video.

```typescript
commentsApi.getVideoComments(videoId: number)
```

### `PUT /comments/{comment_id}`
Cập nhật comment.

```typescript
commentsApi.updateComment(commentId: number, {
  content: string
})
```

### `DELETE /comments/{comment_id}`
Xóa comment.

```typescript
commentsApi.deleteComment(commentId: number)
```

---

## 6. Social API (`socialApi`)

### Like Video

```typescript
socialApi.likeVideo(videoId: number)
socialApi.unlikeVideo(videoId: number)
socialApi.getVideoLikes(videoId: number)
```

### Follow User

```typescript
socialApi.followUser(userId: number)
socialApi.unfollowUser(userId: number)
socialApi.getFollowers(userId: number)
socialApi.getFollowing(userId: number)
```

### Bookmark Video

```typescript
socialApi.bookmarkVideo(videoId: number)
socialApi.unbookmarkVideo(videoId: number)
socialApi.getMyBookmarks()
```

---

## 7. Messages API (`messagesApi`)

### `POST /messages/`
Gửi tin nhắn.

```typescript
messagesApi.sendMessage({
  receiverId: number,
  content: string
})
```

### `GET /messages/conversation/{user_id}`
Lấy conversation với user.

```typescript
messagesApi.getConversation(userId: number)
```

### `GET /messages/inbox`
Lấy danh sách conversations.

```typescript
messagesApi.getInbox()
```

### `GET /messages/suggested-users`
Lấy suggested users để nhắn tin.

```typescript
messagesApi.getSuggestedUsers(limit?: number)
```

### `DELETE /messages/{message_id}`
Xóa tin nhắn.

```typescript
messagesApi.deleteMessage(messageId: number)
```

---

## 8. Reports API (`reportsApi`)

### `POST /reports/`
Tạo report mới.

```typescript
reportsApi.createReport({
  targetType: 'video' | 'user' | 'comment',
  targetId: number,
  reason: string,
  description?: string
})
```

### `GET /reports/`
Danh sách tất cả reports (admin).

```typescript
reportsApi.getReports()
```

### `GET /reports/my`
Reports của tôi.

```typescript
reportsApi.getMyReports()
```

### `PUT /reports/{report_id}`
Xử lý report (admin).

```typescript
reportsApi.updateReport(reportId: number, {
  status: 'pending' | 'approved' | 'rejected',
  decision?: string
})
```

### `GET /reports/{report_id}`
Lấy chi tiết report.

```typescript
reportsApi.getReport(reportId: number)
```

---

## 9. Notifications API (`notificationsApi`)

### `GET /notifications/`
Lấy danh sách notifications.

```typescript
notificationsApi.getNotifications()
```

### `GET /notifications/unseen/count`
Đếm số notifications chưa xem.

```typescript
notificationsApi.getUnseenCount()
```

### `POST /notifications/mark-seen`
Đánh dấu notification đã xem.

```typescript
notificationsApi.markAsSeen(notificationId: number)
```

### `POST /notifications/mark-all-seen`
Đánh dấu tất cả đã xem.

```typescript
notificationsApi.markAllAsSeen()
```

### `DELETE /notifications/{notification_id}`
Xóa notification.

```typescript
notificationsApi.deleteNotification(notificationId: number)
```

---

## 10. Admin API (`adminApi`)

### `POST /admin/run-tests`
Chạy tests (admin).

```typescript
adminApi.runTests()
```

### `POST /admin/videos/action`
Thực hiện action trên video (admin).

```typescript
adminApi.videoAction(videoId: number, {
  action: 'approve' | 'reject' | 'delete',
  reason?: string
})
```

### `POST /admin/users/action`
Thực hiện action trên user (admin).

```typescript
adminApi.userAction(userId: number, {
  action: 'ban' | 'unban' | 'suspend',
  reason?: string
})
```

### `POST /admin/comments/action`
Thực hiện action trên comment (admin).

```typescript
adminApi.commentAction(commentId: number, {
  action: 'approve' | 'delete',
  reason?: string
})
```

### `GET /admin/users/list`
Danh sách users (admin).

```typescript
adminApi.listUsers({
  skip?: number,
  limit?: number,
  status?: string
})
```

### `GET /admin/videos/list`
Danh sách videos (admin).

```typescript
adminApi.listVideos({
  skip?: number,
  limit?: number,
  status?: string
})
```

---

## Error Handling

Tất cả API calls được xử lý tự động bởi axios interceptors:

- **401 Unauthorized**: Tự động logout và redirect đến trang login
- **403 Forbidden**: Hiển thị thông báo không có quyền
- **404 Not Found**: Hiển thị thông báo không tìm thấy
- **Network Error**: Chuyển sang fallback mode với mock data

---

## Usage Example

```typescript
import { authApi, videosApi, socialApi } from '@/api';

// Login
const { accessToken, user } = await authApi.login({
  email: 'user@example.com',
  password: 'password123'
});

localStorage.setItem('accessToken', accessToken);
localStorage.setItem('user', JSON.stringify(user));

// Get videos
const { videos, total } = await videosApi.getVideos({
  page: 1,
  pageSize: 20
});

// Like video
await socialApi.likeVideo(videoId);

// Get current user
const currentUser = await usersApi.getMe();
```

---

## Notes

1. Tất cả endpoints đều sử dụng base URL: `https://toptop-backend-api.azurewebsites.net/api/v1`
2. Token tự động được thêm vào header cho các request yêu cầu authentication
3. FormData được xử lý tự động cho upload operations
4. Response được normalize để xử lý cả snake_case và camelCase
5. Có fallback mode khi không kết nối được backend
