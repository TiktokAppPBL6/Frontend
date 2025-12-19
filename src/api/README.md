# API Module

Module này chứa tất cả các API clients để giao tiếp với TikTok Clone Backend (FastAPI).

## Cấu trúc

```
src/api/
├── index.ts              # Export tất cả API modules
├── axiosClient.ts        # Axios instance với interceptors
├── auth.api.ts           # Authentication API
├── users.api.ts          # Users API
├── videos.api.ts         # Videos API
├── comments.api.ts       # Comments API
├── social.api.ts         # Social API (likes, follows, bookmarks)
├── messages.api.ts       # Messages API
├── reports.api.ts        # Reports API
├── notifications.api.ts  # Notifications API
└── admin.api.ts          # Admin API
```

## Sử dụng

### Import

```typescript
// Import toàn bộ
import api from '@/api';

// Hoặc import từng module
import { authApi, videosApi, socialApi } from '@/api';
```

### Authentication

```typescript
// Login
const { accessToken, user } = await authApi.login({
  email: 'user@example.com',
  password: 'password123'
});

// Register
const { accessToken, user } = await authApi.register({
  email: 'user@example.com',
  username: 'username',
  password: 'password123'
});

// Test token
const { valid } = await authApi.testToken();

// Google OAuth
authApi.googleLogin(); // Redirect to Google
```

### Users

```typescript
// Get current user
const user = await usersApi.getMe();

// Update profile
const updatedUser = await usersApi.updateMe({
  fullName: 'New Name',
  username: 'newusername'
});

// Upload avatar
const user = await usersApi.uploadAvatar(fileObject);

// Search users
const users = await usersApi.searchUsers('query');
```

### Videos

```typescript
// Get video feed
const { videos, total, hasMore } = await videosApi.getVideos({
  page: 1,
  pageSize: 20
});

// Get following feed
const { videos } = await videosApi.getFollowingFeed();

// Upload video
const video = await videosApi.uploadVideo({
  title: 'My Video',
  description: 'Description',
  file: fileObject,
  visibility: 'public',
  enableDubbing: true,
  speakerId: 'id_1'
});

// Search videos
const videos = await videosApi.searchVideos({
  query: 'keyword',
  page: 1
});

// Get video transcript
const transcript = await videosApi.getVideoTranscript(videoId);

// Create dubbing
const result = await videosApi.createDubbing(videoId, {
  target_language: 'vi',
  speaker_id: 'id_1'
});

// Generate speech from transcript
const result = await videosApi.generateSpeech(videoId, {
  speaker_id: 'id_1'
});
```

### Social Interactions

```typescript
// Like/Unlike
await socialApi.likeVideo(videoId);
await socialApi.unlikeVideo(videoId);

// Follow/Unfollow
await socialApi.followUser(userId);
await socialApi.unfollowUser(userId);

// Get followers/following
const { followers } = await socialApi.getFollowers(userId);
const { following } = await socialApi.getFollowing(userId);

// Bookmark
await socialApi.bookmarkVideo(videoId);
await socialApi.unbookmarkVideo(videoId);
const { videos } = await socialApi.getMyBookmarks();
```

### Comments

```typescript
// Get comments
const { comments } = await commentsApi.getVideoComments(videoId);

// Create comment
const comment = await commentsApi.createComment({
  videoId: videoId,
  content: 'Nice video!',
  parentId: parentCommentId // Optional, for replies
});

// Update comment
const updated = await commentsApi.updateComment(commentId, {
  content: 'Updated content'
});

// Delete comment
await commentsApi.deleteComment(commentId);
```

### Messages

```typescript
// Get inbox
const { conversations } = await messagesApi.getInbox();

// Get conversation
const { messages } = await messagesApi.getConversation(userId);

// Send message
const message = await messagesApi.sendMessage({
  receiverId: userId,
  content: 'Hello!'
});

// Delete message
await messagesApi.deleteMessage(messageId);

// Get suggested users
const users = await messagesApi.getSuggestedUsers(10);
```

### Notifications

```typescript
// Get notifications
const { notifications } = await notificationsApi.getNotifications();

// Get unseen count
const { count } = await notificationsApi.getUnseenCount();

// Mark as seen
await notificationsApi.markAsSeen(notificationId);
await notificationsApi.markAllAsSeen();

// Delete notification
await notificationsApi.deleteNotification(notificationId);
```

### Reports

```typescript
// Create report
const report = await reportsApi.createReport({
  targetType: 'video',
  targetId: videoId,
  reason: 'inappropriate',
  description: 'This video contains...'
});

// Get reports
const { reports } = await reportsApi.getReports(); // Admin only
const { reports } = await reportsApi.getMyReports(); // User's reports

// Update report (admin)
const updated = await reportsApi.updateReport(reportId, {
  status: 'approved',
  decision: 'Content removed'
});
```

### Admin

```typescript
// Run tests
const result = await adminApi.runTests();

// Video actions
await adminApi.videoAction(videoId, {
  action: 'delete',
  reason: 'Violates guidelines'
});

// User actions
await adminApi.userAction(userId, {
  action: 'ban',
  reason: 'Spam'
});

// List resources
const { users } = await adminApi.listUsers({ limit: 50 });
const { videos } = await adminApi.listVideos({ limit: 50 });
```

## Features

### Auto Authentication
Token tự động được thêm vào tất cả requests:
```typescript
Authorization: Bearer {token}
```

### Error Handling
Tự động xử lý các lỗi phổ biến:
- **401**: Logout và redirect đến login
- **403**: Hiển thị thông báo không có quyền
- **404**: Hiển thị thông báo không tìm thấy
- **Network Error**: Fallback mode với mock data

### FormData Support
Tự động detect và xử lý FormData cho file uploads.

### Response Normalization
Normalize response từ backend (snake_case → camelCase).

### Fallback Mode
Khi không kết nối được backend, tự động chuyển sang mock data mode.

```typescript
import { setFallbackMode, isFallback } from '@/api';

// Enable fallback
setFallbackMode(true);

// Check if in fallback mode
if (isFallback()) {
  console.log('Using mock data');
}
```

## Configuration

Config API base URL trong [src/config/api.ts](../config/api.ts):

```typescript
export const API_BASE_URL = 'https://toptop-backend-api.azurewebsites.net';
export const API_VERSION = 'v1';
export const API_FULL_URL = `${API_BASE_URL}/api/${API_VERSION}`;
```

## Error Types

```typescript
interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
```

## Best Practices

1. **Luôn sử dụng try-catch** khi gọi API:
```typescript
try {
  const videos = await videosApi.getVideos();
} catch (error) {
  console.error('Failed to fetch videos:', error);
  toast.error('Không thể tải videos');
}
```

2. **Sử dụng React Query** cho caching và state management:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['videos', page],
  queryFn: () => videosApi.getVideos({ page })
});
```

3. **Skip auth redirect** khi cần:
```typescript
// Cho các API calls không cần auto-logout trên 401
const result = await authApi.verifyPassword(password);
```

4. **Check token** trước khi thực hiện sensitive operations:
```typescript
const { valid } = await authApi.testToken();
if (!valid) {
  // Handle invalid token
}
```

## Documentation

Xem chi tiết API documentation tại [docs/API.md](../../docs/API.md).
