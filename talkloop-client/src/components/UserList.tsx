import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import LightMode from '@mui/icons-material/LightMode'
import DarkMode from '@mui/icons-material/DarkMode'
import Logout from '@mui/icons-material/Logout'
import Settings from '@mui/icons-material/Settings'
import { IUserStatus } from '../types'
import { UserListProps } from '../interfaces/IChat'
import { useTheme } from '../context/ThemeProvider'
import styles from './UserList.module.css'

const UserList: React.FC<UserListProps> = ({
  users,
  selectedSlug,
  currentUserName,
  onSelectUser,
  onLogout,
}) => {
  const { theme, toggleTheme } = useTheme()
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null)

  return (
    <Box component="aside" className={styles.aside}>
      <Box className={styles.header}>
        <Box className={styles.headerTop}>
          <Typography variant="caption" className={styles.brandLabel}>
            SocketTalk
          </Typography>
          <IconButton
            onClick={(e) => setSettingsAnchor(e.currentTarget)}
            aria-label="Settings"
            size="small"
            className={styles.settingsBtn}
          >
            <Settings fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={settingsAnchor}
            open={Boolean(settingsAnchor)}
            onClose={() => setSettingsAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              onClick={() => {
                toggleTheme()
                setSettingsAnchor(null)
              }}
            >
              <ListItemIcon>
                {theme === 'dark' ? (
                  <LightMode fontSize="small" />
                ) : (
                  <DarkMode fontSize="small" />
                )}
              </ListItemIcon>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onLogout()
                setSettingsAnchor(null)
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              <Typography color="error">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
        <Typography variant="h6" component="h1" className={styles.title}>
          Chats
        </Typography>
        {currentUserName && (
          <Typography variant="body2" className={styles.userInfo}>
            Logged in as {currentUserName}
          </Typography>
        )}
      </Box>

      <List disablePadding className={styles.list}>
        {users.map((connectedUser) => {
          const isSelected = connectedUser.slug === selectedSlug
          const isOnline = connectedUser.userStatus === IUserStatus.ONLINE
          return (
            <ListItemButton
              key={connectedUser.slug}
              onClick={() => onSelectUser(connectedUser)}
              selected={isSelected}
              className={styles.item}
            >
              <ListItemAvatar>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  className={`${styles.statusBadge} ${
                    isOnline ? styles.statusBadgeOnline : ''
                  }`}
                >
                  <Avatar className={styles.avatar}>
                    {connectedUser.fullName.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography className={styles.name}>
                    {connectedUser.fullName}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="caption"
                    className={isOnline ? styles.online : styles.offline}
                  >
                    {isOnline ? 'Online' : 'Offline'}
                  </Typography>
                }
              />
            </ListItemButton>
          )
        })}
        {users.length === 0 && (
          <Typography variant="body2" className={styles.empty}>
            No users yet. Invite someone to start chatting.
          </Typography>
        )}
      </List>
    </Box>
  )
}

export default UserList
