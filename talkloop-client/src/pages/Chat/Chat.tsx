import React from 'react'
import Box from '@mui/material/Box'
import { useAuth } from '../../context/AuthContext'
import useChatConversation from '../../hooks/useChatConversation'
import Spinner from '../../components/Spinner/Spinner'
import UserList from '../../components/UserList/UserList'
import ChatWindow from '../../components/ChatWindow/ChatWindow'
import EmptyChatState from '../../components/EmptyChatState/EmptyChatState'
import styles from './Chat.module.css'

const Chat: React.FC = () => {
  const { user, logout } = useAuth()

  const {
    isLoading,
    selectedUser,
    conversationLoading,
    availableUsers,
    selectedMessages,
    openConversation,
    handleSend,
    handleEdit,
    handleDeleteForMe,
    handleDeleteForEveryone,
    handleLogout,
  } = useChatConversation(user, logout)

  if (isLoading) {
    return <Spinner />
  }

  return (
    <Box className={styles.root}>
      <UserList
        users={availableUsers}
        selectedSlug={selectedUser?.slug ?? null}
        currentUserName={user?.fullName}
        onSelectUser={(connectedUser) => void openConversation(connectedUser)}
        onLogout={() => void handleLogout()}
      />
      <Box component="main" className={styles.main}>
        {selectedUser ? (
          <ChatWindow
            otherUser={selectedUser}
            mySlug={user?.slug ?? ''}
            messages={selectedMessages}
            loading={conversationLoading}
            onSend={handleSend}
            onEdit={handleEdit}
            onDeleteForMe={handleDeleteForMe}
            onDeleteForEveryone={handleDeleteForEveryone}
          />
        ) : (
          <EmptyChatState />
        )}
      </Box>
    </Box>
  )
}

export default Chat
