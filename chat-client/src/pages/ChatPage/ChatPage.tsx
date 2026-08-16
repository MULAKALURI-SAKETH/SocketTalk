import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getChatMessages,
  getConnectedUsers,
  logoutUser,
} from "../../api/authApi";
import { useToast } from "../../context/ToastContext";
import type { ChatMessage, ChatUser, ChatAttachment } from "../../types";
import { useChatSocket } from "../../hooks/useChatSocket";
import Loader from "../../components/Loader";
import ChatSidebar from "../../components/ChatSidebar";
import ChatWindow from "../../components/ChatWindow";
import ChatEmptyState from "../../components/ChatEmptyState";

const ChatPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversations, setConversations] = useState<
    Record<string, ChatMessage[]>
  >({});
  const hasFetched = useRef(false);

  const handleIncomingMessage = useCallback(
    (message: ChatMessage) => {
      setConversations((prev) => {
        const otherId =
          user && message.senderId === user.slug
            ? message.recipientId
            : message.senderId;
        if (!otherId) return prev;
        const existing = prev[otherId] ?? [];
        if (message.id && existing.some((m) => m.id === message.id))
          return prev;
        return {
          ...prev,
          [otherId]: [
            ...existing,
            {
              ...message,
              timestamp: message.timestamp ?? new Date().toISOString(),
            },
          ],
        };
      });
    },
    [user],
  );

  const { sendMessage } = useChatSocket({
    username: user?.slug,
    onMessage: handleIncomingMessage,
  });

  const fetchAllUsers = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const { data } = await getConnectedUsers();
      setUsers(data);
    } catch {
      setUsers([]);
      if (!silent) {
        showToast(
          "We couldn't load the chat list. Please refresh and try again.",
          "error",
        );
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    void fetchAllUsers();
  }, []);

  // Keep online/offline statuses fresh while the user is on this page
  useEffect(() => {
    const refresh = () => void fetchAllUsers(true);
    const intervalId = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openConversation = async (otherUser: ChatUser) => {
    setSelectedUser(otherUser);
    if (!user) return;
    setConversationLoading(true);
    try {
      const { data } = await getChatMessages(user.slug, otherUser.slug);
      setConversations((prev) => ({
        ...prev,
        [otherUser.slug]: data,
      }));
    } catch {
      showToast("We couldn't load the messages. Please try again.", "error");
    } finally {
      setConversationLoading(false);
    }
  };

  const handleSend = (content: string, attachments?: ChatAttachment[]) => {
    if (!user || !selectedUser) return;
    const sent = sendMessage(selectedUser.slug, content, attachments);
    if (!sent) {
      showToast(
        "You're currently offline. Please wait a moment and try again.",
        "error",
      );
      return;
    }
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: user.slug,
      recipientId: selectedUser.slug,
      content,
      attachments,
      timestamp: new Date().toISOString(),
    };
    setConversations((prev) => ({
      ...prev,
      [selectedUser.slug]: [
        ...(prev[selectedUser.slug] ?? []),
        optimisticMessage,
      ],
    }));
  };

  const handleLogout = async () => {
    if (user?.slug) {
      try {
        await logoutUser({ username: user.slug });
      } catch {
        // Even if the backend logout fails, still clear the local session
      }
    }
    logout();
  };

  if (isLoading) {
    return <Loader />;
  }

  const availableUsers = users.filter(
    (connectedUser) => connectedUser.slug !== user?.slug,
  );

  const selectedMessages = selectedUser
    ? (conversations[selectedUser.slug] ?? [])
    : [];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <ChatSidebar
        users={availableUsers}
        selectedSlug={selectedUser?.slug ?? null}
        currentUserName={user?.fullName}
        onSelectUser={(connectedUser) => void openConversation(connectedUser)}
        onLogout={() => void handleLogout()}
      />
      <main className="flex-1 overflow-hidden">
        {selectedUser ? (
          <ChatWindow
            otherUser={selectedUser}
            mySlug={user?.slug ?? ""}
            messages={selectedMessages}
            loading={conversationLoading}
            onSend={handleSend}
          />
        ) : (
          <ChatEmptyState />
        )}
      </main>
    </div>
  );
};

export default ChatPage;
