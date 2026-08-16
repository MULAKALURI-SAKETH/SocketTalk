import { ChatMessage, ChatUser } from "../types";

export interface ChatSidebarProps {
  users: ChatUser[];
  selectedSlug: string | null;
  currentUserName?: string;
  onSelectUser: (user: ChatUser) => void;
  onLogout: () => void;
}

export interface ChatWindowProps {
  otherUser: ChatUser;
  mySlug: string;
  messages: ChatMessage[];
  loading: boolean;
  onSend: (content: string) => void;
}
