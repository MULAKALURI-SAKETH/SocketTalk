import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getChatMessages,
  getConnectedUsers,
  logoutUser,
  markMessagesAsRead,
  deleteMessageForEveryone,
  deleteMessageForMe,
  editMessage,
  getApiError,
} from '../api/client'
import { useToast } from '../context/ToastProvider'
import type { ChatMessage, ChatUser, ChatAttachment, ChatEvent } from '../types'
import { ChatNotificationType } from '../types'
import { useChatSocket } from './useChatSocket'
import { removeMessageById } from '../utils/chat'

const useChatConversation = (user: ChatUser | null, logout: () => void) => {
  const { showToast } = useToast()

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [users, setUsers] = useState<ChatUser[]>([])
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [conversationLoading, setConversationLoading] = useState(false)
  const [conversations, setConversations] = useState<
    Record<string, ChatMessage[]>
  >({})
  const hasFetched = useRef(false)
  const selectedUserRef = useRef<ChatUser | null>(null)
  selectedUserRef.current = selectedUser

  const markConversationRead = useCallback(
    (senderId: string) => {
      if (!user) return
      void markMessagesAsRead(senderId, user.slug).catch(() => {})
    },
    [user],
  )

  const handleIncomingMessage = useCallback(
    (event: ChatEvent) => {
      if (event.type === ChatNotificationType.MESSAGE) {
        const message = event as unknown as ChatMessage
        setConversations((prev) => {
          const otherId =
            user && message.senderId === user.slug
              ? message.recipientId
              : message.senderId
          if (!otherId) return prev
          const existing = prev[otherId] ?? []
          if (message.id && existing.some((m) => m.id === message.id))
            return prev
          if (user && message.senderId === user.slug) {
            const tempIndex = existing.findIndex(
              (m) =>
                m.senderId === message.senderId &&
                m.recipientId === message.recipientId &&
                m.id?.startsWith('temp-'),
            )
            if (tempIndex !== -1) {
              const updated = [...existing]
              updated[tempIndex] = {
                ...message,
                timestamp: message.timestamp ?? new Date().toISOString(),
              }
              return { ...prev, [otherId]: updated }
            }
          }
          const isViewing =
            selectedUserRef.current?.slug === message.senderId &&
            user?.slug === message.recipientId
          const incoming: ChatMessage = {
            ...message,
            timestamp: message.timestamp ?? new Date().toISOString(),
            readByRecipient: isViewing ? true : message.readByRecipient,
          }
          if (isViewing) {
            markConversationRead(message.senderId)
          }
          return {
            ...prev,
            [otherId]: [...existing, incoming],
          }
        })
        return
      }

      if (event.type === ChatNotificationType.MESSAGE_READ) {
        setConversations((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([key, messages]) => [
              key,
              messages.map((message) =>
                message.senderId === event.senderId &&
                message.recipientId === event.recipientId
                  ? { ...message, readByRecipient: true }
                  : message,
              ),
            ]),
          ),
        )
        return
      }

      if (event.type === ChatNotificationType.MESSAGE_EDITED) {
        setConversations((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([key, messages]) => [
              key,
              messages.map((message) =>
                message.id === event.id
                  ? {
                      ...message,
                      content: event.content ?? message.content,
                      attachments: event.attachments ?? message.attachments,
                      edited: true,
                    }
                  : message,
              ),
            ]),
          ),
        )
        return
      }

      if (event.type === ChatNotificationType.MESSAGE_DELETED && event.id) {
        setConversations((prev) => removeMessageById(prev, event.id!))
      }
    },
    [markConversationRead, user],
  )

  const { sendMessage } = useChatSocket({
    username: user?.slug,
    onMessage: handleIncomingMessage,
  })

  const fetchAllUsers = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setIsLoading(true)
        const { data } = await getConnectedUsers()
        setUsers(data)
      } catch {
        setUsers([])
        if (!silent) {
          showToast(
            "We couldn't load the chat list. Please refresh and try again.",
            'error',
          )
        }
      } finally {
        if (!silent) setIsLoading(false)
      }
    },
    [showToast],
  )

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    void fetchAllUsers()
  }, [])

  useEffect(() => {
    const refresh = () => void fetchAllUsers(true)
    const intervalId = window.setInterval(refresh, 15000)
    window.addEventListener('focus', refresh)
    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  const openConversation = useCallback(
    async (otherUser: ChatUser) => {
      setSelectedUser(otherUser)
      if (!user) return
      setConversationLoading(true)
      try {
        const { data } = await getChatMessages(user.slug, otherUser.slug)
        setConversations((prev) => ({
          ...prev,
          [otherUser.slug]: data,
        }))
        const hasUnreadIncoming = data.some(
          (message) =>
            message.senderId === otherUser.slug &&
            message.recipientId === user.slug &&
            !message.readByRecipient,
        )
        if (hasUnreadIncoming) {
          markConversationRead(otherUser.slug)
          setConversations((prev) => ({
            ...prev,
            [otherUser.slug]: (prev[otherUser.slug] ?? []).map((message) =>
              message.senderId === otherUser.slug &&
              message.recipientId === user.slug
                ? { ...message, readByRecipient: true }
                : message,
            ),
          }))
        }
      } catch {
        showToast("We couldn't load the messages. Please try again.", 'error')
      } finally {
        setConversationLoading(false)
      }
    },
    [user, markConversationRead, showToast],
  )

  const handleSend = useCallback(
    (content: string, attachments?: ChatAttachment[]) => {
      if (!user || !selectedUser) return
      const sent = sendMessage(selectedUser.slug, content, attachments)
      if (!sent) {
        showToast(
          "You're currently offline. Please wait a moment and try again.",
          'error',
        )
        return
      }
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        senderId: user.slug,
        recipientId: selectedUser.slug,
        content,
        attachments,
        timestamp: new Date().toISOString(),
      }
      setConversations((prev) => ({
        ...prev,
        [selectedUser.slug]: [
          ...(prev[selectedUser.slug] ?? []),
          optimisticMessage,
        ],
      }))
    },
    [user, selectedUser, sendMessage, showToast],
  )

  const handleEdit = useCallback(
    async (
      messageId: string,
      content: string,
      attachments?: ChatAttachment[],
    ) => {
      if (!user) return
      try {
        const updated = await editMessage(
          messageId,
          content,
          user.slug,
          attachments,
        )
        if (!selectedUser) return
        setConversations((prev) => ({
          ...prev,
          [selectedUser.slug]: (prev[selectedUser.slug] ?? []).map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  content: updated.content,
                  attachments: updated.attachments,
                  edited: true,
                }
              : message,
          ),
        }))
      } catch (error) {
        showToast(getApiError(error), 'error')
      }
    },
    [user, selectedUser, showToast],
  )

  const handleDeleteForMe = useCallback(
    async (messageId: string) => {
      if (!user) return
      try {
        await deleteMessageForMe(messageId, user.slug)
        setConversations((prev) => removeMessageById(prev, messageId))
      } catch (error) {
        showToast(getApiError(error), 'error')
      }
    },
    [user, showToast],
  )

  const handleDeleteForEveryone = useCallback(
    async (messageId: string) => {
      if (!user) return
      try {
        await deleteMessageForEveryone(messageId, user.slug)
        setConversations((prev) => removeMessageById(prev, messageId))
      } catch (error) {
        showToast(getApiError(error), 'error')
      }
    },
    [user, showToast],
  )

  const handleLogout = useCallback(async () => {
    if (user?.slug) {
      try {
        await logoutUser({ username: user.slug })
      } catch {
        // Even if the backend logout fails, still clear the local session
      }
    }
    logout()
  }, [user, logout])

  const availableUsers = useMemo(
    () => users.filter((connectedUser) => connectedUser.slug !== user?.slug),
    [users, user?.slug],
  )

  const selectedMessages = useMemo(
    () => (selectedUser ? (conversations[selectedUser.slug] ?? []) : []),
    [conversations, selectedUser],
  )

  return {
    isLoading,
    users,
    selectedUser,
    conversationLoading,
    conversations,
    availableUsers,
    selectedMessages,
    setSelectedUser,
    openConversation,
    handleSend,
    handleEdit,
    handleDeleteForMe,
    handleDeleteForEveryone,
    handleLogout,
  }
}

export default useChatConversation
