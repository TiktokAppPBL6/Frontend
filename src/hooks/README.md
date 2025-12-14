# Video Hooks

Custom React hooks để quản lý chức năng video player. Mỗi hook tập trung vào một khía cạnh cụ thể, giúp code dễ test và tái sử dụng.

## 📋 Danh sách Hooks

### `useVideoSync`
Đồng bộ hóa video và audio khi bật chế độ dubbing (lồng tiếng).

**Chức năng:**
- Tự động pause audio khi video đang seeking
- Sync audio time với video khi seek hoàn tất
- Play/pause audio theo trạng thái video

**Sử dụng:**
```tsx
useVideoSync({ videoRef, audioRef, isDubbing });
```

---

### `useVideoProgress`
Quản lý thanh progress bar và xử lý tương tác (click, drag).

**Chức năng:**
- Tính toán progress từ video/audio currentTime
- Xử lý click để seek đến vị trí mới
- Hỗ trợ drag progress bar
- Sync audio khi dubbing active
- Thêm delay 100ms trước khi resume để đảm bảo smooth playback

**Return values:**
```tsx
{
  progress: number;              // 0-100%
  handleProgressClick: (e) => void;
  handleProgressMouseDown: (e) => void;
  handleProgressMouseMove: (e) => void;
  handleProgressMouseUp: () => void;
}
```

**Sử dụng:**
```tsx
const {
  progress,
  handleProgressClick,
  handleProgressMouseDown,
  handleProgressMouseMove,
  handleProgressMouseUp,
} = useVideoProgress({
  videoRef,
  audioRef,
  currentTimeRef,
  isDubbing,
});
```

---

### `useVideoControls`
Quản lý các controls cơ bản: mute, dubbing toggle, play/pause.

**Chức năng:**
- Toggle mute cho video và audio
- Bật/tắt chế độ dubbing (Vietnamese audio)
- Click để play/pause video
- Tự động sync audio khi switch dubbing

**Return values:**
```tsx
{
  isMuted: boolean;
  isDubbing: boolean;
  toggleMute: () => void;
  toggleDubbing: () => void;
  handleVideoClick: () => void;
}
```

**Sử dụng:**
```tsx
const {
  isMuted,
  isDubbing,
  toggleMute,
  toggleDubbing,
  handleVideoClick,
} = useVideoControls({ videoRef, audioRef });
```

---

### `useVideoAutoplay`
Quản lý autoplay dựa trên viewport visibility (IntersectionObserver).

**Chức năng:**
- Tự động play video khi vào viewport (60% threshold)
- Auto unmute lần đầu tiên xem video
- Pause video khi ra khỏi viewport
- Sync audio nếu dubbing đang bật

**Sử dụng:**
```tsx
useVideoAutoplay({
  videoRef,
  audioRef,
  containerRef,
  videoId: video.id,
  isDubbing,
  onVideoInView,
});
```

---

### `useVideoFollow`
Quản lý follow/unfollow user (video owner).

**Chức năng:**
- Track follow state
- Call API follow/unfollow
- Hiển thị toast notification
- Handle loading state

**Return values:**
```tsx
{
  isFollowing: boolean;
  followMutation: {
    isPending: boolean;
    mutate: () => void;
  };
  handleFollowClick: () => void;
}
```

**Sử dụng:**
```tsx
const { isFollowing, followMutation, handleFollowClick } = useVideoFollow({
  ownerId: video.ownerId,
  initialFollow: video.is_following,
});
```

---

## 🔧 Utility Functions

### `getVideoOwnerInfo` (lib/videoUtils.ts)
Extract thông tin owner từ video data với nhiều format khác nhau.

**Return:**
```tsx
{
  ownerId: number | null;
  ownerUsername: string;
  ownerAvatar: string;
  initialFollow: boolean;
}
```

**Sử dụng:**
```tsx
import { getVideoOwnerInfo } from '@/lib/videoUtils';

const { ownerId, ownerUsername, ownerAvatar, initialFollow } = 
  getVideoOwnerInfo(video);
```

---

## 📦 Tích hợp vào Component

**Trước refactor:** FeedVideo.tsx ~ 430 dòng

**Sau refactor:** 
- FeedVideo.tsx: ~80 dòng (chỉ còn logic tích hợp)
- 5 custom hooks: Mỗi hook 60-180 dòng, tập trung vào 1 nhiệm vụ
- 1 utility function: Xử lý data normalization

**Lợi ích:**
- ✅ Dễ đọc và maintain hơn
- ✅ Dễ test từng phần riêng biệt
- ✅ Tái sử dụng trong các component khác (VideoDetail, VideoModal, etc.)
- ✅ Tách biệt concerns rõ ràng
- ✅ TypeScript types đầy đủ

**Example usage trong component:**
```tsx
function FeedVideoComponent({ video, onVideoInView }: FeedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef<number>(0);

  // Extract data
  const { ownerId, ownerUsername, ownerAvatar, initialFollow } = 
    getVideoOwnerInfo(video);

  // Use hooks
  const { isMuted, isDubbing, toggleMute, toggleDubbing, handleVideoClick } = 
    useVideoControls({ videoRef, audioRef });

  const { progress, handleProgressClick, ... } = 
    useVideoProgress({ videoRef, audioRef, currentTimeRef, isDubbing });

  useVideoSync({ videoRef, audioRef, isDubbing });
  useVideoAutoplay({ videoRef, audioRef, containerRef, videoId: video.id, isDubbing, onVideoInView });

  const { isFollowing, handleFollowClick } = 
    useVideoFollow({ ownerId, initialFollow });

  // Render UI with actions
  return (
    <div ref={containerRef}>
      <VideoPlayer onClick={handleVideoClick} />
      <VideoProgressBar progress={progress} onClick={handleProgressClick} />
      <VideoActions 
        onMuteToggle={toggleMute} 
        onDubbingToggle={toggleDubbing}
      />
    </div>
  );
}
```

---

## 🧪 Testing

Mỗi hook có thể test độc lập:

```tsx
// Example: Test useVideoControls
import { renderHook, act } from '@testing-library/react-hooks';
import { useVideoControls } from './useVideoControls';

test('toggleMute should mute/unmute video', () => {
  const videoRef = { current: document.createElement('video') };
  const audioRef = { current: document.createElement('audio') };
  
  const { result } = renderHook(() => useVideoControls({ videoRef, audioRef }));
  
  expect(result.current.isMuted).toBe(false);
  
  act(() => {
    result.current.toggleMute();
  });
  
  expect(result.current.isMuted).toBe(true);
  expect(videoRef.current.muted).toBe(true);
});
```

---

## 🐛 Debugging Tips

**Progress bar không chính xác khi dubbing:**
- Check `isDubbing` state có đúng không
- Verify audio.readyState >= 1 trước khi lấy currentTime
- Xem console có log "Audio play failed" không

**Audio không sync với video:**
- Check useVideoSync có được gọi không
- Verify audioRef.current tồn tại
- Kiểm tra audio URL có hợp lệ không (`video.audio_vi`)

**Video không autoplay:**
- Check containerRef có được attach vào DOM không
- Verify IntersectionObserver threshold (mặc định 60%)
- Xem browser console có block autoplay không (muted requirement)
