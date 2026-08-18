import { ChatEvent } from "../types";

export enum IUserStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
}

export interface IUser {
  fullName: String;
  slug: String;
  userStatus: IUserStatus;
}

export interface IChatSocketOptions {
  username: string | undefined;
  onMessage: (event: ChatEvent) => void;
}
