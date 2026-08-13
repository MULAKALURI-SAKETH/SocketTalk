import React from "react";
import type { ChatUser } from "../types";

interface ChatSidebarProps {
  users: ChatUser[];
  selectedSlug: string | null;
  currentUserName?: string;
  onSelectUser: (user: ChatUser) => void;
  onLogout: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  users,
  selectedSlug,
  currentUserName,
  onSelectUser,
  onLogout,
}) => {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200 bg-white">
      <header className="border-b border-slate-200 px-4 py-4">
        <p className="text-sm font-semibold text-indigo-600">REALTIME CHAT</p>
        <h1 className="mt-1 text-xl font-bold text-slate-800">Chats</h1>
        {currentUserName && (
          <p className="mt-1 text-sm text-slate-500">
            Logged in as {currentUserName}
          </p>
        )}
      </header>

      <ul className="flex-1 overflow-y-auto py-2">
        {users.map((connectedUser) => {
          const isSelected = connectedUser.slug === selectedSlug;
          return (
            <li key={connectedUser.slug}>
              <button
                type="button"
                onClick={() => onSelectUser(connectedUser)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected ? "bg-indigo-50" : "hover:bg-slate-50"
                }`}
              >
                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                  {connectedUser.fullName.charAt(0).toUpperCase()}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-semibold text-slate-800">
                    {connectedUser.fullName}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {users.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-500">
            No users are currently online.
          </p>
        )}
      </ul>

      <footer className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Logout
        </button>
      </footer>
    </aside>
  );
};

export default ChatSidebar;
