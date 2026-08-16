import React, { useEffect, useRef, useState } from "react";
import type { ChatAttachment, ChatMessage, ChatUser } from "../types";
import { ChatWindowProps } from "../interfaces/IChat";
import { useToast } from "../context/ToastContext";
import { uploadImage } from "../api/authApi";
import { resolveMediaUrl } from "../utils/mediaUtils";
import EmojiPicker from "./EmojiPicker";
import { MessageImage } from "./MessageImage";
import {
  FileAttachment,
  formatFileSize,
  isImageAttachment,
} from "./FileAttachment";

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
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const canSend = text.trim().length > 0 || attachments.length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!canSend) return;
    onSend(trimmed, attachments);
    setText("");
    setAttachments([]);
  };

  const openMenu = () => {
    setMenuOpen((open) => !open);
    setEmojiOpen(false);
  };

  const openEmojiPicker = () => {
    setEmojiOpen(true);
    setMenuOpen(false);
  };

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    setMenuOpen(false);
    try {
      const attachment = await uploadImage(file);
      setAttachments((prev) => [...prev, attachment]);
    } catch {
      showToast("We couldn't upload that file. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (url: string) => {
    setAttachments((prev) =>
      prev.filter((attachment) => attachment.url !== url),
    );
  };

  const handleEmojiSelect = (emoji: string) => {
    setText((prev) => prev + emoji);
    textInputRef.current?.focus();
    setEmojiOpen(false);
  };

  const UPLOAD_URL_PATTERN = /^\/uploads\/.+/;

  const renderAttachment = (attachment: ChatAttachment) => {
    if (isImageAttachment(attachment.contentType)) {
      return (
        <MessageImage
          key={attachment.url}
          url={resolveMediaUrl(attachment.url)}
        />
      );
    }
    return (
      <FileAttachment
        key={attachment.url}
        url={attachment.url}
        fileName={attachment.fileName}
        fileSize={attachment.fileSize}
      />
    );
  };

  const renderMessageContent = (message: ChatMessage) => {
    const attachments = message.attachments ?? [];
    const hasAttachments = attachments.length > 0;
    const legacyUrl =
      !hasAttachments && UPLOAD_URL_PATTERN.test(message.content)
        ? message.content
        : null;
    const hasText = message.content.trim().length > 0 && !legacyUrl;
    return (
      <>
        {hasAttachments && (
          <div className={`flex flex-wrap gap-1 ${hasText ? "mb-2" : ""}`}>
            {attachments.map((attachment) => renderAttachment(attachment))}
          </div>
        )}
        {legacyUrl && (
          <div className="mb-2">
            {legacyUrl.toLowerCase().endsWith(".pdf") ? (
              <FileAttachment
                url={legacyUrl}
                fileName={legacyUrl.split("/").pop() ?? "File"}
                fileSize={0}
              />
            ) : (
              <MessageImage url={resolveMediaUrl(legacyUrl)} />
            )}
          </div>
        )}
        {hasText && (
          <p className="whitespace-pre-wrap wrap-break-word">
            {message.content}
          </p>
        )}
      </>
    );
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
                      {renderMessageContent(message)}
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
        ) : (
          <p className="text-center text-shadow-md text-slate-600">
            No messages yet. Say hello!👋
          </p>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative flex flex-col border-t border-slate-200 bg-white"
      >
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-slate-200 px-3 py-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.url}
                className="group relative flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1.5 pr-8"
              >
                {isImageAttachment(attachment.contentType) ? (
                  <img
                    src={resolveMediaUrl(attachment.url)}
                    alt={attachment.fileName || "Pending image"}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-rose-100 text-rose-600">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                      />
                    </svg>
                  </span>
                )}
                <span className="max-w-32">
                  <span className="block truncate text-xs font-medium text-slate-700">
                    {attachment.fileName}
                  </span>
                  <span className="block text-[11px] text-slate-400">
                    {formatFileSize(attachment.fileSize)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.url)}
                  aria-label={`Remove ${attachment.fileName}`}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-rose-100 hover:text-rose-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-3 w-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 p-3">
          {emojiOpen && (
            <EmojiPicker
              onSelect={handleEmojiSelect}
              onClose={() => setEmojiOpen(false)}
            />
          )}

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={openMenu}
              aria-label="Attach an image or emoji"
              aria-expanded={menuOpen}
              disabled={uploading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"
                  role="status"
                  aria-label="Uploading"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              )}
            </button>

            {menuOpen && (
              <div
                className="absolute bottom-12 left-0 z-20 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl"
                role="menu"
              >
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  role="menuitem"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-5 w-5 text-indigo-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  Upload from computer
                </button>
                <button
                  type="button"
                  onClick={openEmojiPicker}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                  role="menuitem"
                >
                  <span className="flex h-5 w-5 items-center justify-center text-lg leading-none text-indigo-600">
                    😊
                  </span>
                  Emoji
                </button>
              </div>
            )}
          </div>

          <input
            ref={textInputRef}
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type your message..."
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <button
            type="submit"
            disabled={!canSend}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={(event) => void handleFileSelected(event)}
            className="hidden"
          />
        </div>
      </form>
    </section>
  );
};

export default ChatWindow;
