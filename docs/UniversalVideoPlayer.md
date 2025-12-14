# UniversalVideoPlayer - Component Đa Năng

Component video player thống nhất có thể sử dụng cho **cả 3 trang**: Home, Following, và VideoDetail.

## 🎯 Lợi ích

✅ **Tái sử dụng code**: 1 component cho 3 trang khác nhau  
✅ **Dễ maintain**: Fix bug 1 lần, tất cả trang đều được cập nhật  
✅ **Consistent UX**: Hành vi giống nhau trên mọi trang  
✅ **Performance**: Memoization tối ưu, không re-render không cần thiết  
✅ **Flexible**: Hỗ trợ 2 modes với external/internal state management

---

## 📋 Modes

### 1. Feed Mode (Home, Following)
- **Tự động quản lý state** (mute, dubbing, subtitle)
- **Autoplay** khi video vào viewport
- **Internal follow logic** với mutation riêng
- **Comments modal** integrated

### 2. Detail Mode (VideoDetail)
- **External state control** từ parent component
- **Không autoplay** (do không scroll)
- **External follow logic** từ parent
- **Sync với các section khác** (info, comments)

---

## 🔧 API

### Props

```typescript
interface UniversalVideoPlayerProps {
  video: Video;                              // Video data object
  mode?: 'feed' | 'detail';                  // Default: 'feed'
  
  // Feed mode props
  isInView?: boolean;                        // Video có trong viewport không
  onVideoInView?: (id: number, inView: boolean) => void;
  
  // Detail mode - External controls
  externalIsMuted?: boolean;                 // Mute state từ parent
  externalIsDubbing?: boolean;               // Dubbing state từ parent
  externalSubtitleLanguage?: 'off' | 'en' | 'vi';
  onMuteChange?: (muted: boolean) => void;
  onDubbingChange?: (dubbing: boolean) => void;
  onSubtitleChange?: (lang: 'off' | 'en' | 'vi') => void;
  
  // Detail mode - External follow
  externalIsFollowing?: boolean;             // Follow state từ parent
  onFollowClick?: () => void;                // Follow callback
  isFollowPending?: boolean;                 // Loading state
}
```

---

## 📖 Usage Examples

### Feed Mode (Home, Following)

```tsx
import { UniversalVideoPlayer } from '@/components/video/UniversalVideoPlayer';

function VideoFeed({ videos }: { videos: Video[] }) {
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);

  const handleVideoInView = (videoId: number, inView: boolean) => {
    if (inView) setCurrentVideoId(videoId);
  };

  return (
    <div>
      {videos.map((video) => (
        <div key={video.id} className="h-screen">
          <UniversalVideoPlayer
            video={video}
            mode="feed"
            isInView={currentVideoId === video.id}
            onVideoInView={handleVideoInView}
          />
        </div>
      ))}
    </div>
  );
}
```

**Đặc điểm:**
- Tự quản lý tất cả state (mute, dubbing, subtitle, follow)
- Autoplay khi `isInView={true}`
- Comments modal tự động
- Không cần truyền external props

---

### Detail Mode (VideoDetail)

```tsx
import { UniversalVideoPlayer } from '@/components/video/UniversalVideoPlayer';

function VideoDetail() {
  const [isMuted, setIsMuted] = useState(false);
  const [isDubbing, setIsDubbing] = useState(false);
  const [subtitleLanguage, setSubtitleLanguage] = useState<'off' | 'en' | 'vi'>('off');
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowClick = () => {
    // Custom follow logic với toast, invalidate queries, etc.
    followMutation.mutate();
  };

  return (
    <div>
      {/* Video Player */}
      <div className="h-screen">
        <UniversalVideoPlayer
          video={video}
          mode="detail"
          externalIsMuted={isMuted}
          externalIsDubbing={isDubbing}
          externalSubtitleLanguage={subtitleLanguage}
          onMuteChange={setIsMuted}
          onDubbingChange={setIsDubbing}
          onSubtitleChange={setSubtitleLanguage}
          externalIsFollowing={isFollowing}
          onFollowClick={handleFollowClick}
          isFollowPending={followMutation.isPending}
        />
      </div>

      {/* Other sections can use same states */}
      <VideoInfoSection 
        isFollowing={isFollowing}
        onFollowClick={handleFollowClick}
      />
    </div>
  );
}
```

**Đặc điểm:**
- Parent component kiểm soát tất cả state
- Không autoplay (do không scroll)
- State sync với các section khác
- Custom follow logic với complex side effects

---

## 🏗️ Architecture

```
UniversalVideoPlayer
├── Mode Detection (feed vs detail)
├── State Management
│   ├── Feed Mode: Internal states + hooks
│   └── Detail Mode: External states from props
├── Shared Hooks
│   ├── useVideoSync (audio/video sync)
│   ├── useVideoProgress (progress bar)
│   ├── useVideoControls (play/pause/mute)
│   └── useVideoAutoplay (viewport detection)
├── Conditional Features
│   ├── Autoplay: Feed only
│   ├── Follow logic: Internal (feed) vs External (detail)
│   └── Transcript fetching: Both modes
└── UI Components
    ├── VideoPlayerWithSubtitles
    ├── VideoProgressBar
    ├── VideoActions
    ├── VideoAvatarWithFollow
    ├── VideoFeedInfo
    └── CommentsModal
```

---

## 🔄 Migration Path

### Trước (3 components riêng biệt)

```
FeedVideo.tsx (430 lines) → Home, Following
VideoPlayerContainer.tsx → VideoDetail
+ useVideoPlayer hook
+ Many duplicated logic
```

### Sau (1 universal component)

```
UniversalVideoPlayer.tsx (220 lines) → All pages
+ Shared hooks (useVideoSync, useVideoProgress, etc.)
+ Single source of truth
+ Consistent behavior
```

**Kết quả:**
- ❌ Xóa: `FeedVideo.tsx`, `VideoPlayerContainer.tsx`, `useVideoPlayer.ts`
- ✅ Thêm: `UniversalVideoPlayer.tsx`
- 📉 Giảm: ~300 lines duplicate code
- 🔧 Dễ maintain: Fix 1 lần cho tất cả

---

## 🎨 Customization

### Thêm mode mới

```tsx
type VideoPlayerMode = 'feed' | 'detail' | 'embed';

// Example: Embed mode cho chia sẻ
if (mode === 'embed') {
  // Disable follow button
  // Show share watermark
  // Autoplay without sound
}
```

### Override behaviors

```tsx
// Custom autoplay logic
<UniversalVideoPlayer
  video={video}
  mode="feed"
  onVideoInView={(id, inView) => {
    // Custom tracking logic
    analytics.track('video_view', { id, inView });
    handleVideoInView(id, inView);
  }}
/>
```

---

## 🧪 Testing

```tsx
import { render, screen } from '@testing-library/react';
import { UniversalVideoPlayer } from './UniversalVideoPlayer';

describe('UniversalVideoPlayer', () => {
  it('should use internal states in feed mode', () => {
    const { container } = render(
      <UniversalVideoPlayer video={mockVideo} mode="feed" />
    );
    
    // Click mute button
    const muteBtn = screen.getByLabelText('Mute');
    fireEvent.click(muteBtn);
    
    // Check internal state changed
    expect(container.querySelector('video')).toHaveProperty('muted', true);
  });

  it('should use external states in detail mode', () => {
    const onMuteChange = jest.fn();
    
    render(
      <UniversalVideoPlayer
        video={mockVideo}
        mode="detail"
        externalIsMuted={false}
        onMuteChange={onMuteChange}
      />
    );
    
    // Click mute button
    const muteBtn = screen.getByLabelText('Mute');
    fireEvent.click(muteBtn);
    
    // Check callback called
    expect(onMuteChange).toHaveBeenCalledWith(true);
  });
});
```

---

## ⚡ Performance Tips

1. **Memoization**: Component đã được memo với custom comparison
2. **Conditional autoplay**: Chỉ active khi mode="feed"
3. **Lazy transcript**: Chỉ fetch khi subtitle !== 'off'
4. **Ref-based time tracking**: Không trigger re-render mỗi frame

```tsx
// Good: Memoized re-render logic
export const UniversalVideoPlayer = memo(
  UniversalVideoPlayerComponent,
  (prev, next) => {
    // Only re-render when necessary props change
    if (prev.video.id !== next.video.id) return false;
    if (prev.mode !== next.mode) return false;
    // ... smart comparison
    return true;
  }
);
```

---

## 🐛 Common Issues

**Issue: Video không autoplay ở feed mode**
- ✅ Check `isInView` prop có được truyền đúng không
- ✅ Verify `mode="feed"` đã set
- ✅ Kiểm tra IntersectionObserver threshold (60%)

**Issue: State không sync ở detail mode**
- ✅ Đảm bảo truyền đủ external props
- ✅ Check callbacks (onMuteChange, onDubbingChange) được wire đúng
- ✅ Verify parent state management

**Issue: Performance kém khi scroll**
- ✅ Check memoization có hoạt động không
- ✅ Đảm bảo video object reference stable (từ TanStack Query)
- ✅ Verify không có unnecessary re-renders

---

## 📚 Related Documentation

- [Video Hooks](./hooks/README.md) - Custom hooks chi tiết
- [Video Utils](./lib/videoUtils.ts) - Helper functions
- [FeedVideo Migration](./MIGRATION.md) - Migration guide (nếu cần)
