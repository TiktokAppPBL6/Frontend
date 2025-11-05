import type { ID, User } from './user';

export interface Message {
  id: ID;
  senderId: ID;
  receiverId: ID;
  content: string;
  createdAt: string;
  seen: boolean;
  sender?: User;
  receiver?: User;
}

export interface Conversation {
  user: User;
  lastMessage?: Message;
  unseenCount: number;
}

export interface MessageSendRequest {
  receiverId: ID;
  content: string;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
}

export interface InboxResponse {
  conversations: Conversation[];
}
