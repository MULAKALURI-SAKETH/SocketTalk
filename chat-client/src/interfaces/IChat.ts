import { ChatMessage, ChatUser, ChatAttachment } from "../types";

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
  onSend: (content: string, attachments?: ChatAttachment[]) => void;
  onEdit: (
    messageId: string,
    content: string,
    attachments?: ChatAttachment[],
  ) => void;
  onDeleteForMe: (messageId: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
}

export interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}
