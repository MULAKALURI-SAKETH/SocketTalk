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

export interface ChatMessage {
  id?: string;
  chatId?: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp?: string;
}
