import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatAttachment, ChatMessage } from '../types'
import { useToast } from '../context/ToastProvider'
import { uploadImage } from '../api/client'

export interface UseChatWindowProps {
  messages: ChatMessage[]
  onSend: (content: string, attachments?: ChatAttachment[]) => void
  onEdit: (
    messageId: string,
    content: string,
    attachments?: ChatAttachment[],
  ) => void
  onDeleteForMe: (messageId: string) => void
  onDeleteForEveryone: (messageId: string) => void
}

const useChatWindow = ({
  messages,
  onSend,
  onEdit,
  onDeleteForMe,
  onDeleteForEveryone,
}: UseChatWindowProps) => {
  const [text, setText] = useState('')
  const [attachments, setAttachments] = useState<ChatAttachment[]>([])
  const [attachMenuAnchor, setAttachMenuAnchor] = useState<HTMLElement | null>(
    null,
  )
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editAttachments, setEditAttachments] = useState<ChatAttachment[]>([])
  const [editEmojiOpen, setEditEmojiOpen] = useState(false)
  const [editUploading, setEditUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ChatMessage | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const textInputRef = useRef<HTMLInputElement | null>(null)
  const editInputRef = useRef<HTMLTextAreaElement | null>(null)
  const editFileInputRef = useRef<HTMLInputElement | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('[data-emoji-picker]')) {
        setEmojiOpen(false)
        setEditEmojiOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const canSend = text.trim().length > 0 || attachments.length > 0

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmed = text.trim()
      if (!canSend) return
      onSend(trimmed, attachments)
      setText('')
      setAttachments([])
    },
    [text, canSend, onSend, attachments],
  )

  const openEmojiPicker = useCallback(() => {
    setAttachMenuAnchor(null)
    setEmojiOpen(true)
  }, [])

  const handleFileSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return

      setUploading(true)
      setAttachMenuAnchor(null)
      try {
        const attachment = await uploadImage(file)
        setAttachments((prev) => [...prev, attachment])
      } catch {
        showToast("We couldn't upload that file. Please try again.", 'error')
      } finally {
        setUploading(false)
      }
    },
    [showToast],
  )

  const removeAttachment = useCallback((url: string) => {
    setAttachments((prev) =>
      prev.filter((attachment) => attachment.url !== url),
    )
  }, [])

  const handleEmojiSelect = useCallback((emoji: string) => {
    setText((prev) => prev + emoji)
    textInputRef.current?.focus()
    setEmojiOpen(false)
  }, [])

  const startEditing = useCallback((message: ChatMessage) => {
    setEditingMessageId(message.id ?? null)
    setEditText(message.content)
    setEditAttachments(message.attachments ?? [])
    setEditEmojiOpen(false)
    setTimeout(() => editInputRef.current?.focus(), 0)
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingMessageId(null)
    setEditText('')
    setEditAttachments([])
    setEditEmojiOpen(false)
  }, [])

  const saveEditing = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const trimmed = editText.trim()
      if (!editingMessageId) return
      if (!trimmed && editAttachments.length === 0) return
      onEdit(editingMessageId, trimmed, editAttachments)
      cancelEditing()
    },
    [editText, editingMessageId, editAttachments, onEdit, cancelEditing],
  )

  const handleEditFileSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) return

      setEditUploading(true)
      try {
        const attachment = await uploadImage(file)
        setEditAttachments((prev) => [...prev, attachment])
      } catch {
        showToast("File couldn't be uploaded. Please try again.", 'error')
      } finally {
        setEditUploading(false)
      }
    },
    [showToast],
  )

  const removeEditAttachment = useCallback((url: string) => {
    setEditAttachments((prev) =>
      prev.filter((attachment) => attachment.url !== url),
    )
  }, [])

  const handleEditEmojiSelect = useCallback((emoji: string) => {
    setEditText((prev) => prev + emoji)
    editInputRef.current?.focus()
    setEditEmojiOpen(false)
  }, [])

  const doDeleteForMe = useCallback(async () => {
    if (!deleteTarget?.id) return
    setDeleteBusy(true)
    try {
      await onDeleteForMe(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleteBusy(false)
    }
  }, [deleteTarget, onDeleteForMe])

  const doDeleteForEveryone = useCallback(async () => {
    if (!deleteTarget?.id) return
    setDeleteBusy(true)
    try {
      await onDeleteForEveryone(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleteBusy(false)
    }
  }, [deleteTarget, onDeleteForEveryone])

  return {
    text,
    setText,
    attachments,
    attachMenuAnchor,
    setAttachMenuAnchor,
    emojiOpen,
    setEmojiOpen,
    uploading,
    editingMessageId,
    editText,
    setEditText,
    editAttachments,
    editEmojiOpen,
    setEditEmojiOpen,
    editUploading,
    deleteTarget,
    setDeleteTarget,
    deleteBusy,
    canSend,
    bottomRef,
    fileInputRef,
    textInputRef,
    editInputRef,
    editFileInputRef,
    handleSubmit,
    openEmojiPicker,
    handleFileSelected,
    removeAttachment,
    handleEmojiSelect,
    startEditing,
    cancelEditing,
    saveEditing,
    handleEditFileSelected,
    removeEditAttachment,
    handleEditEmojiSelect,
    doDeleteForMe,
    doDeleteForEveryone,
  }
}

export default useChatWindow
