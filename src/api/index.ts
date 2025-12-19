/**
 * API Exports
 * Centralized export for all API modules
 */

import { authApi } from './auth.api';
import { usersApi } from './users.api';
import { videosApi } from './videos.api';
import { commentsApi } from './comments.api';
import { socialApi } from './social.api';
import { messagesApi } from './messages.api';
import { reportsApi } from './reports.api';
import { notificationsApi } from './notifications.api';
import { adminApi } from './admin.api';

export { authApi } from './auth.api';
export { usersApi } from './users.api';
export { videosApi } from './videos.api';
export { commentsApi } from './comments.api';
export { socialApi } from './social.api';
export { messagesApi } from './messages.api';
export { reportsApi } from './reports.api';
export { notificationsApi } from './notifications.api';
export { adminApi } from './admin.api';
export { axiosClient, setFallbackMode, isFallback } from './axiosClient';

export default {
  auth: authApi,
  users: usersApi,
  videos: videosApi,
  comments: commentsApi,
  social: socialApi,
  messages: messagesApi,
  reports: reportsApi,
  notifications: notificationsApi,
  admin: adminApi,
};
