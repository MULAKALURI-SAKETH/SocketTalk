export enum IUserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

export interface ChatUser {
  slug: string;
  fullName: string;
  userStatus: IUserStatus;
}

export interface LogoutRequest {
  username: string;
}

export interface ChatAttachment {
  url: string;
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface ChatMessage {
  id?: string;
  chatId?: string;
  senderId: string;
  recipientId: string;
  content: string;
  attachments?: ChatAttachment[];
  timestamp?: string;
  readByRecipient?: boolean;
  edited?: boolean;
  deletedForEveryone?: boolean;
}

export enum ChatNotificationType {
  MESSAGE = "MESSAGE",
  MESSAGE_READ = "MESSAGE_READ",
  MESSAGE_EDITED = "MESSAGE_EDITED",
  MESSAGE_DELETED = "MESSAGE_DELETED",
}

export interface ChatEvent {
  type: ChatNotificationType;
  id?: string;
  chatId?: string;
  senderId: string;
  recipientId: string;
  content?: string;
  attachments?: ChatAttachment[];
  timestamp?: string;
  readByRecipient?: boolean;
  edited?: boolean;
  deletedForEveryone?: boolean;
}
