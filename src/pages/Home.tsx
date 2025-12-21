import { VideoFeedContainer } from '@/components/video/VideoFeedContainer';

/**
 * Home Page - Main video feed
 * For regular users only (admins are redirected by AuthGuard)
 */
export function Home() {
  return <VideoFeedContainer />;
}
