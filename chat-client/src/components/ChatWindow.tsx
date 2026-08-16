import React, { useEffect, useRef, useState } from "react";
import type { ChatMessage, ChatUser } from "../types";
import { ChatWindowProps } from "../interfaces/IChat";

const formatTime = (timestamp?: string): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const ChatWindow: React.FC<ChatWindowProps> = ({
  otherUser,
  mySlug,
  messages,
  loading,
  onSend,
}) => {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <section className="flex h-full min-w-0 flex-col">
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
          {otherUser.fullName.charAt(0).toUpperCase()}
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-800">
            {otherUser.fullName}
          </p>
          <p className="truncate text-sm text-slate-500">@{otherUser.slug}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
        {loading ? (
          <p className="text-center text-sm text-slate-400">
            Loading messages…
          </p>
        ) : messages.length !== 0 ? (
          <p className="text-center text-shadow-md text-slate-600">
            No messages yet. Say hello!👋
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((message) => {
              const isMine = message.senderId === mySlug;
              return (
                <div
                  key={message.id ?? `${message.senderId}-${message.timestamp}`}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex max-w-[70%] flex-col">
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm ${
                        isMine
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-slate-800 ring-1 ring-slate-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap wrap-break-word">
                        {message.content}
                      </p>
                    </div>
                    <p
                      className={`mt-1 px-1 text-xs text-slate-400 ${
                        isMine ? "self-end text-right" : "self-start text-left"
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
      >
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type your message..."
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </section>
  );
};

export default ChatWindow;
