import axios from "axios";
import { LogoutRequest, ChatUser, ChatMessage } from "../types"; // Import necessary types

// Backend API base URL - configured via .env (VITE_API_BASE_URL)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8088";

// Send the HttpOnly session cookie with every request
axios.defaults.withCredentials = true;

export interface AuthCredentials {
  username: string;
  password: string;
}

export const getApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    // Check for a specific error message from the backend
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    if (error.response) {
      return "Something went wrong. Please try again.";
    }
    return "We couldn't reach the server. Check your connection and try again.";
  }
  // Fallback for non-Axios errors
  return "Something went wrong. Please try again.";
};

// Logs the user in and returns the persisted user record (slug, fullName, userStatus)
export const login = async (
  credentials: AuthCredentials,
): Promise<ChatUser> => {
  const response = await axios.post<ChatUser>(
    `${API_BASE_URL}/auth/login`,
    credentials,
  );
  return response.data;
};

// Registers a new user with a username and password
export const register = async (
  credentials: AuthCredentials,
): Promise<ChatUser> => {
  const response = await axios.post<ChatUser>(
    `${API_BASE_URL}/auth/register`,
    credentials,
  );
  return response.data;
};

// Restores the logged-in user by validating the HttpOnly session cookie
export const getCurrentUser = async (): Promise<ChatUser> => {
  const response = await axios.get<ChatUser>(`${API_BASE_URL}/auth/me`);
  return response.data;
};

export const getConnectedUsers = async (): Promise<{ data: ChatUser[] }> => {
  const response = await axios.get<ChatUser[]>(`${API_BASE_URL}/users`);
  return { data: response.data };
};

// New function to log out a specific user from the admin dashboard
export const logoutUser = async (request: LogoutRequest) => {
  const response = await axios.post(`${API_BASE_URL}/auth/logout`, request);
  return response.data;
};

export const getChatMessages = async (
  senderId: string,
  recipientId: string,
): Promise<{ data: ChatMessage[] }> => {
  const response = await axios.get<ChatMessage[]>(
    `${API_BASE_URL}/messages/${senderId}/${recipientId}`,
  );
  return { data: response.data };
};
