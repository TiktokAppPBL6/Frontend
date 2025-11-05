import type { User, Video, Comment, Notification, Conversation, Message } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'user1@example.com',
    username: 'user1',
    fullName: 'John Doe',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    followersCount: 1200,
    followingCount: 345,
    videosCount: 23,
  },
  {
    id: 2,
    email: 'user2@example.com',
    username: 'user2',
    fullName: 'Jane Smith',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    followersCount: 5600,
    followingCount: 890,
    videosCount: 67,
  },
  {
    id: 3,
    email: 'user3@example.com',
    username: 'user3',
    fullName: 'Bob Johnson',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    followersCount: 890,
    followingCount: 234,
    videosCount: 12,
  },
];

// Mock Videos
export const mockVideos: Video[] = [
  {
    id: 1,
    ownerId: 1,
    title: 'Amazing Dance Video',
    description: 'Check out this cool dance move! #dance #trending',
    durationSec: 15,
    visibility: 'public',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    hlsUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbUrl: 'https://picsum.photos/400/600?random=1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    owner: mockUsers[0],
    likeCount: 1234,
    commentCount: 89,
    viewCount: 12345,
    shareCount: 56,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 2,
    ownerId: 2,
    title: 'Cooking Tutorial',
    description: 'Learn how to make the perfect pasta! #cooking #food',
    durationSec: 30,
    visibility: 'public',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    hlsUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbUrl: 'https://picsum.photos/400/600?random=2',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    owner: mockUsers[1],
    likeCount: 5678,
    commentCount: 234,
    viewCount: 45678,
    shareCount: 123,
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: 3,
    ownerId: 3,
    title: 'Travel Vlog',
    description: 'Exploring the beautiful mountains! #travel #nature',
    durationSec: 45,
    visibility: 'public',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    hlsUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbUrl: 'https://picsum.photos/400/600?random=3',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    owner: mockUsers[2],
    likeCount: 890,
    commentCount: 45,
    viewCount: 8900,
    shareCount: 34,
    isLiked: true,
    isBookmarked: false,
  },
  {
    id: 4,
    ownerId: 1,
    title: 'Fitness Tips',
    description: '5 exercises for a healthy lifestyle #fitness #health',
    durationSec: 20,
    visibility: 'public',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    hlsUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbUrl: 'https://picsum.photos/400/600?random=4',
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 345600000).toISOString(),
    owner: mockUsers[0],
    likeCount: 2345,
    commentCount: 112,
    viewCount: 23456,
    shareCount: 78,
    isLiked: false,
    isBookmarked: true,
  },
];

// Mock Comments
export const mockComments: Comment[] = [
  {
    id: 1,
    videoId: 1,
    userId: 2,
    content: 'This is amazing! 🔥',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'visible',
    user: mockUsers[1],
    likesCount: 23,
    isLiked: false,
  },
  {
    id: 2,
    videoId: 1,
    userId: 3,
    content: 'Love this dance move! ❤️',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'visible',
    user: mockUsers[2],
    likesCount: 15,
    isLiked: true,
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 1,
    userId: 1,
    type: 'like',
    refId: 1,
    message: 'liked your video',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    seen: false,
    sender: {
      id: 2,
      username: 'user2',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
    },
  },
  {
    id: 2,
    userId: 1,
    type: 'comment',
    refId: 1,
    message: 'commented on your video',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    seen: false,
    sender: {
      id: 3,
      username: 'user3',
      avatarUrl: 'https://i.pravatar.cc/150?img=3',
    },
  },
  {
    id: 3,
    userId: 1,
    type: 'follow',
    refId: 2,
    message: 'started following you',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    seen: true,
    sender: {
      id: 2,
      username: 'user2',
      avatarUrl: 'https://i.pravatar.cc/150?img=2',
    },
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 1,
    senderId: 2,
    receiverId: 1,
    content: 'Hey! Love your videos!',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    seen: false,
    sender: mockUsers[1],
  },
  {
    id: 2,
    senderId: 1,
    receiverId: 2,
    content: 'Thanks so much! 😊',
    createdAt: new Date(Date.now() - 900000).toISOString(),
    seen: true,
  },
];

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    user: mockUsers[1],
    lastMessage: mockMessages[1],
    unseenCount: 1,
  },
  {
    user: mockUsers[2],
    lastMessage: {
      id: 3,
      senderId: 3,
      receiverId: 1,
      content: 'Great content!',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      seen: true,
    },
    unseenCount: 0,
  },
];

// Helper functions for mock operations
export const mockDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getMockUser = (id: number): User | undefined =>
  mockUsers.find((u) => u.id === id);

export const getMockVideo = (id: number): Video | undefined =>
  mockVideos.find((v) => v.id === id);

export const getMockVideosByUser = (userId: number): Video[] =>
  mockVideos.filter((v) => v.ownerId === userId);

export const getMockCommentsByVideo = (videoId: number): Comment[] =>
  mockComments.filter((c) => c.videoId === videoId);

export const searchMockUsers = (query: string): User[] =>
  mockUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(query.toLowerCase())
  );

export const searchMockVideos = (query: string): Video[] =>
  mockVideos.filter(
    (v) =>
      v.title.toLowerCase().includes(query.toLowerCase()) ||
      v.description?.toLowerCase().includes(query.toLowerCase())
  );
