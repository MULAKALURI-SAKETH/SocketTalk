import React, { useEffect, useRef, useState } from "react";
import type { ChatAttachment, ChatMessage, ChatUser } from "../types";
import { ChatWindowProps } from "../interfaces/IChat";
import { useToast } from "../context/ToastProvider";
import { uploadImage } from "../api/client";
import {
  resolveMediaUrl,
  formatFileSize,
  isImageAttachment,
} from "../utils/media";
import EmojiPicker from "./EmojiPicker";
import { MessageImage } from "./MessageImage";
import MessageTicks from "./MessageTicks";
import { FileAttachment } from "./FileAttachment";

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
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
}) => {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editAttachments, setEditAttachments] = useState<ChatAttachment[]>([]);
  const [editEmojiOpen, setEditEmojiOpen] = useState(false);
  const [editUploading, setEditUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ChatMessage | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const editInputRef = useRef<HTMLTextAreaElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
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

  const startEditing = (message: ChatMessage) => {
    setEditingMessageId(message.id ?? null);
    setEditText(message.content);
    setEditAttachments(message.attachments ?? []);
    setEditEmojiOpen(false);
    setTimeout(() => editInputRef.current?.focus(), 0);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditText("");
    setEditAttachments([]);
    setEditEmojiOpen(false);
  };

  const saveEditing = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = editText.trim();
    if (!editingMessageId) return;
    if (!trimmed && editAttachments.length === 0) return;
    onEdit(editingMessageId, trimmed, editAttachments);
    cancelEditing();
  };

  const handleEditFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setEditUploading(true);
    try {
      const attachment = await uploadImage(file);
      setEditAttachments((prev) => [...prev, attachment]);
    } catch {
      showToast("File couldn't be uploaded. Please try again.", "error");
    } finally {
      setEditUploading(false);
    }
  };

  const removeEditAttachment = (url: string) => {
    setEditAttachments((prev) =>
      prev.filter((attachment) => attachment.url !== url),
    );
  };

  const handleEditEmojiSelect = (emoji: string) => {
    setEditText((prev) => prev + emoji);
    editInputRef.current?.focus();
    setEditEmojiOpen(false);
  };

  const doDeleteForMe = async () => {
    if (!deleteTarget?.id) return;
    setDeleteBusy(true);
    try {
      await onDeleteForMe(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const doDeleteForEveryone = async () => {
    if (!deleteTarget?.id) return;
    setDeleteBusy(true);
    try {
      await onDeleteForEveryone(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleteBusy(false);
    }
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
              const isPending = message.id?.startsWith("temp-");
              const canShowActions = isMine && !isPending;
              const isEditable = canShowActions;
              const isEditing = editingMessageId === message.id;
              return (
                <div
                  key={message.id ?? `${message.senderId}-${message.timestamp}`}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div className="group relative flex max-w-[70%] flex-col">
                    {canShowActions && !isEditing && (
                      <div className="absolute -top-3 right-1 z-10 hidden items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5 shadow-md group-hover:flex">
                        {isEditable && (
                          <button
                            type="button"
                            onClick={() => startEditing(message)}
                            aria-label="Edit message"
                            title="Edit"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.8}
                              stroke="currentColor"
                              className="h-4 w-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(message)}
                          aria-label="Delete message"
                          title="Delete"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.8}
                            stroke="currentColor"
                            className="h-4 w-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    )}

                    <div
                      className={`rounded-2xl px-4 py-2 text-sm ${
                        isMine
                          ? "bg-indigo-600 text-white"
                          : "bg-white text-slate-800 ring-1 ring-slate-200"
                      }`}
                    >
                      {isEditing ? (
                        <form
                          onSubmit={saveEditing}
                          className="flex flex-col gap-2"
                        >
                          {editAttachments.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {editAttachments.map((attachment) => (
                                <div
                                  key={attachment.url}
                                  className="group relative"
                                >
                                  {isImageAttachment(attachment.contentType) ? (
                                    <img
                                      src={resolveMediaUrl(attachment.url)}
                                      alt={
                                        attachment.fileName || "Edited image"
                                      }
                                      className="h-16 w-16 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.8}
                                        stroke="currentColor"
                                        className="h-6 w-6"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                        />
                                      </svg>
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeEditAttachment(attachment.url)
                                    }
                                    aria-label={`Remove ${attachment.fileName}`}
                                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-rose-100 hover:text-rose-600"
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
                          <textarea
                            ref={editInputRef}
                            value={editText}
                            onChange={(event) =>
                              setEditText(event.target.value)
                            }
                            rows={2}
                            aria-label="Edit message"
                            className="w-full resize-none rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          />
                          <div className="flex items-center justify-between gap-2">
                            <div className="relative flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  editFileInputRef.current?.click()
                                }
                                disabled={editUploading}
                                title="Add an image or file"
                                aria-label="Add an image or file"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {editUploading ? (
                                  <span
                                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"
                                    role="status"
                                    aria-label="Uploading"
                                  />
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.8}
                                    stroke="currentColor"
                                    className="h-4 w-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-5.409-9.909h.008v.008h-.008V6.75zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM3.75 21h16.5A1.5 1.5 0 0 0 21.75 19.5V4.5A1.5 1.5 0 0 0 20.25 3H3.75A1.5 1.5 0 0 0 2.25 4.5v15A1.5 1.5 0 0 0 3.75 21z"
                                    />
                                  </svg>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditEmojiOpen(true)}
                                title="Add an emoji"
                                aria-label="Add an emoji"
                                className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
                              >
                                <span className="text-base leading-none">
                                  😊
                                </span>
                              </button>
                              {editEmojiOpen && (
                                <EmojiPicker
                                  onSelect={handleEditEmojiSelect}
                                  onClose={() => setEditEmojiOpen(false)}
                                />
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="rounded-md px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={
                                  !editText.trim() &&
                                  editAttachments.length === 0
                                }
                                className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                          <input
                            ref={editFileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            onChange={(event) =>
                              void handleEditFileSelected(event)
                            }
                            className="hidden"
                          />
                        </form>
                      ) : (
                        <>
                          {renderMessageContent(message)}
                          <span
                            className={`mt-1 flex items-center justify-end gap-1 ${
                              isMine ? "text-white/70" : "text-slate-400"
                            }`}
                          >
                            <span className="text-[10px] leading-none">
                              {formatTime(message.timestamp)}
                              {message.edited && " • edited"}
                            </span>
                            {isMine && (
                              <MessageTicks
                                read={Boolean(message.readByRecipient)}
                              />
                            )}
                          </span>
                        </>
                      )}
                    </div>
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

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-800">
              Delete message?
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {deleteTarget.readByRecipient
                ? "This message has already been read, so it can only be deleted for you."
                : "Deleting for everyone removes this message and its files for both of you."}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => void doDeleteForMe()}
                className="w-full rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Delete for me
              </button>
              {!deleteTarget.readByRecipient && (
                <button
                  type="button"
                  disabled={deleteBusy}
                  onClick={() => void doDeleteForEveryone()}
                  className="w-full rounded-lg bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Delete for everyone
                </button>
              )}
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ChatWindow;
