import React from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Send from '@mui/icons-material/Send'
import Add from '@mui/icons-material/Add'
import Edit from '@mui/icons-material/Edit'
import Delete from '@mui/icons-material/Delete'
import Close from '@mui/icons-material/Close'
import InsertDriveFile from '@mui/icons-material/InsertDriveFile'
import type { ChatAttachment, ChatMessage } from '../../types'
import { ChatWindowProps } from '../../interfaces/IChat'
import {
  resolveMediaUrl,
  formatFileSize,
  isImageAttachment,
} from '../../utils/media'
import { formatTime } from '../../utils/time'
import useChatWindow from '../../hooks/useChatWindow'
import EmojiPicker from '../EmojiPicker/EmojiPicker'
import { MessageImage } from '../MessageImage/MessageImage'
import MessageTicks from '../MessageTicks/MessageTicks'
import { FileAttachment } from '../FileAttachment/FileAttachment'
import styles from './ChatWindow.module.css'

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
  const {
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
  } = useChatWindow({
    messages,
    onSend,
    onEdit,
    onDeleteForMe,
    onDeleteForEveryone,
  })

  const renderAttachment = (attachment: ChatAttachment) => {
    if (isImageAttachment(attachment.contentType)) {
      return (
        <MessageImage
          key={attachment.url}
          url={resolveMediaUrl(attachment.url)}
        />
      )
    }
    return (
      <FileAttachment
        key={attachment.url}
        url={attachment.url}
        fileName={attachment.fileName}
        fileSize={attachment.fileSize}
      />
    )
  }

  const renderMessageContent = (message: ChatMessage) => {
    const messageAttachments = message.attachments ?? []
    const hasAttachments = messageAttachments.length > 0
    const UPLOAD_URL_PATTERN = /^\/uploads\/.+/
    const legacyUrl =
      !hasAttachments && UPLOAD_URL_PATTERN.test(message.content)
        ? message.content
        : null
    const hasText = message.content.trim().length > 0 && !legacyUrl
    return (
      <>
        {hasAttachments && (
          <Box
            className={`${styles.attachments} ${
              hasText ? styles.attachmentsWithText : ''
            }`}
          >
            {messageAttachments.map((attachment) =>
              renderAttachment(attachment),
            )}
          </Box>
        )}
        {legacyUrl && (
          <Box className={styles.legacyAttach}>
            {legacyUrl.toLowerCase().endsWith('.pdf') ? (
              <FileAttachment
                url={legacyUrl}
                fileName={legacyUrl.split('/').pop() ?? 'File'}
                fileSize={0}
              />
            ) : (
              <MessageImage url={resolveMediaUrl(legacyUrl)} />
            )}
          </Box>
        )}
        {hasText && (
          <Typography variant="body2" className={styles.messageText}>
            {message.content}
          </Typography>
        )}
      </>
    )
  }

  const renderEditPreview = (
    attachment: ChatAttachment,
    onRemove: (url: string) => void,
  ) => {
    return (
      <Box key={attachment.url} className={styles.editPreview}>
        {isImageAttachment(attachment.contentType) ? (
          <Box
            component="img"
            src={resolveMediaUrl(attachment.url)}
            alt={attachment.fileName || 'Edited image'}
            className={styles.editPreviewImg}
          />
        ) : (
          <Box className={styles.editPreviewFile}>
            <InsertDriveFile />
          </Box>
        )}
        <IconButton
          size="small"
          aria-label={`Remove ${attachment.fileName}`}
          onClick={() => onRemove(attachment.url)}
          className={styles.removeBtn}
        >
          <Close className={styles.iconSmall} />
        </IconButton>
      </Box>
    )
  }

  const renderMessages = () => {
    if (loading) {
      return (
        <Typography variant="body2" className={styles.loading}>
          Loading messages…
        </Typography>
      )
    }

    if (messages.length === 0) {
      return (
        <Typography variant="body2" className={styles.loading}>
          No messages yet. Say hello!👋
        </Typography>
      )
    }

    return (
      <Box className={styles.list}>
        {messages.map((message) => {
          const isMine = message.senderId === mySlug
          const isPending = message.id?.startsWith('temp-')
          const canShowActions = isMine && !isPending
          const isEditable = canShowActions
          const isEditing = editingMessageId === message.id
          return (
            <Box
              key={message.id ?? `${message.senderId}-${message.timestamp}`}
              className={`${styles.row} ${
                isMine ? styles.rowEnd : styles.rowStart
              }`}
            >
              <Box className={styles.group}>
                {canShowActions && !isEditing && (
                  <Box className={styles.actions}>
                    {isEditable && (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          aria-label="Edit message"
                          onClick={() => startEditing(message)}
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                        >
                          <Edit className={styles.iconMedium} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        aria-label="Delete message"
                        onClick={() => setDeleteTarget(message)}
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      >
                        <Delete className={styles.iconMedium} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}

                <Paper
                  elevation={1}
                  className={`${styles.bubble} ${
                    isMine ? styles.bubbleMine : styles.bubbleOther
                  }`}
                >
                  {isEditing ? (
                    <Box
                      component="form"
                      onSubmit={saveEditing}
                      className={styles.editForm}
                    >
                      {editAttachments.length > 0 && (
                        <Box className={styles.editPreviews}>
                          {editAttachments.map((attachment) =>
                            renderEditPreview(attachment, removeEditAttachment),
                          )}
                        </Box>
                      )}
                      <TextField
                        inputRef={editInputRef}
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                        multiline
                        rows={2}
                        size="small"
                        aria-label="Edit message"
                        className={styles.editField}
                      />
                      <Box className={styles.editActions}>
                        <Box className={styles.editTools}>
                          <IconButton
                            size="small"
                            type="button"
                            onClick={() => editFileInputRef.current?.click()}
                            disabled={editUploading}
                            title="Add an image or file"
                            aria-label="Add an image or file"
                            className={styles.toolBtn}
                          >
                            {editUploading ? (
                              <CircularProgress size={14} />
                            ) : (
                              <Add className={styles.iconMedium} />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            type="button"
                            onClick={() => setEditEmojiOpen(true)}
                            title="Add an emoji"
                            aria-label="Add an emoji"
                            className={styles.toolBtn}
                          >
                            <Box component="span" className={styles.toolEmoji}>
                              😊
                            </Box>
                          </IconButton>
                          {editEmojiOpen && (
                            <Box data-emoji-picker>
                              <EmojiPicker
                                onSelect={handleEditEmojiSelect}
                                onClose={() => setEditEmojiOpen(false)}
                              />
                            </Box>
                          )}
                        </Box>
                        <Box className={styles.editSaveGroup}>
                          <Button
                            size="small"
                            onClick={cancelEditing}
                            className={styles.cancelBtn}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="small"
                            type="submit"
                            variant="contained"
                            disabled={
                              !editText.trim() && editAttachments.length === 0
                            }
                          >
                            Save
                          </Button>
                        </Box>
                      </Box>
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,application/pdf"
                        onChange={(event) => void handleEditFileSelected(event)}
                        hidden
                      />
                    </Box>
                  ) : (
                    <>
                      {renderMessageContent(message)}
                      <Box
                        className={`${styles.meta} ${
                          isMine ? styles.metaMine : styles.metaOther
                        }`}
                      >
                        <Typography
                          variant="caption"
                          className={styles.metaText}
                        >
                          {formatTime(message.timestamp)}
                          {message.edited && ' • edited'}
                        </Typography>
                        {isMine && (
                          <MessageTicks
                            read={Boolean(message.readByRecipient)}
                          />
                        )}
                      </Box>
                    </>
                  )}
                </Paper>
              </Box>
            </Box>
          )
        })}
        <Box ref={bottomRef} />
      </Box>
    )
  }

  return (
    <Box component="section" className={styles.section}>
      <Box component="header" className={styles.header}>
        <Box className={styles.headerAvatarWrap}>
          <Avatar className={styles.headerAvatar}>
            {otherUser.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Box className={styles.headerOnlineDot} />
        </Box>
        <Box className={styles.headerMeta}>
          <Typography className={styles.headerName}>
            {otherUser.fullName}
          </Typography>
          <Typography variant="body2" className={styles.headerSlug}>
            @{otherUser.slug}
          </Typography>
        </Box>
      </Box>

      <Box className={styles.messages}>{renderMessages()}</Box>

      <Box component="form" onSubmit={handleSubmit} className={styles.composer}>
        {attachments.length > 0 && (
          <Box className={styles.pending}>
            {attachments.map((attachment) => (
              <Box key={attachment.url} className={styles.pendingItem}>
                {isImageAttachment(attachment.contentType) ? (
                  <Box
                    component="img"
                    src={resolveMediaUrl(attachment.url)}
                    alt={attachment.fileName || 'Pending image'}
                    className={styles.pendingImg}
                  />
                ) : (
                  <Box className={styles.pendingFileIcon}>
                    <InsertDriveFile fontSize="small" />
                  </Box>
                )}
                <Box className={styles.pendingMeta}>
                  <Box component="span" className={styles.pendingName}>
                    {attachment.fileName}
                  </Box>
                  <Box component="span" className={styles.pendingSize}>
                    {formatFileSize(attachment.fileSize)}
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  aria-label={`Remove ${attachment.fileName}`}
                  onClick={() => removeAttachment(attachment.url)}
                  className={styles.pendingRemove}
                >
                  <Close className={styles.iconSmall} />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Box className={styles.inputRow}>
          {emojiOpen && (
            <Box data-emoji-picker>
              <EmojiPicker
                onSelect={handleEmojiSelect}
                onClose={() => setEmojiOpen(false)}
              />
            </Box>
          )}

          <IconButton
            type="button"
            onClick={(event) => setAttachMenuAnchor(event.currentTarget)}
            aria-label="Attach an image or emoji"
            aria-expanded={Boolean(attachMenuAnchor)}
            disabled={uploading}
            className={styles.attachBtn}
          >
            {uploading ? <CircularProgress size={20} /> : <Add />}
          </IconButton>

          <Menu
            anchorEl={attachMenuAnchor}
            open={Boolean(attachMenuAnchor)}
            onClose={() => setAttachMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => fileInputRef.current?.click()}
              className={styles.menuItem}
            >
              <InsertDriveFile
                fontSize="small"
                className={styles.menuIconPrimary}
              />
              Upload from computer
            </MenuItem>
            <MenuItem onClick={openEmojiPicker} className={styles.menuItem}>
              <Box component="span" className={styles.menuEmoji}>
                😊
              </Box>
              Emoji
            </MenuItem>
          </Menu>

          <TextField
            inputRef={textInputRef}
            fullWidth
            size="small"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type your message..."
          />
          <IconButton
            type="submit"
            aria-label="Send message"
            disabled={!canSend}
            className={styles.sendBtn}
          >
            <Send />
          </IconButton>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={(event) => void handleFileSelected(event)}
            hidden
          />
        </Box>
      </Box>

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete message?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget?.readByRecipient
              ? 'This message has already been read, so it can only be deleted for you.'
              : 'Deleting for everyone removes this message and its files for both of you.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button
            variant="outlined"
            disabled={deleteBusy}
            onClick={() => void doDeleteForMe()}
          >
            Delete for me
          </Button>
          {!deleteTarget?.readByRecipient && (
            <Button
              variant="outlined"
              color="error"
              disabled={deleteBusy}
              onClick={() => void doDeleteForEveryone()}
            >
              Delete for everyone
            </Button>
          )}
          <Button variant="contained" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ChatWindow
