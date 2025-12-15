/**
 * Reusable Video Components
 * 
 * This file exports all reusable video-related components for easy importing
 */

// Core video components
export { VideoActions } from './VideoActions';
export { VideoUserInfo } from './VideoUserInfo';
export { SubtitleDisplay } from './SubtitleDisplay';
export { VideoCore } from './VideoCore';
export { UniversalVideoPlayer } from './UniversalVideoPlayer';

// Feed components (for Home & Following pages)
export { VideoFeed } from './VideoFeed';

// Empty state component
export { EmptyState } from './EmptyState';

/**
 * Usage examples:
 * 
 * 1. For feed pages (Home, Following):
 *    import { VideoFeed, EmptyState } from '@/components/video';
 * 
 * 2. For video detail page:
 *    import { SingleVideoPlayer } from '@/components/video';
 * 
 * 3. For custom video implementations:
 *    import { VideoPlayer, VideoActions, VideoUserInfo } from '@/components/video';
 */
