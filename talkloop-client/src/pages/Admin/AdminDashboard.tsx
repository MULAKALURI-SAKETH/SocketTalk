import { useEffect, useRef, useState } from 'react'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import { getApiError, getOnlineUsers } from '../../api/client'
import type { ChatUser } from '../../types'
import useAdminDashboard from '../../hooks/useAdminDashboard'
import styles from './AdminDashboard.module.css'

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<ChatUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const hasFetched = useRef(false)

  const loadUsers = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await getOnlineUsers()
      setUsers(response.data)
    } catch (cause) {
      setError(getApiError(cause))
    } finally {
      setIsLoading(false)
    }
  }
  const { handleUserLogout } = useAdminDashboard(loadUsers)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    void loadUsers()
  }, [])

  return (
    <Box component="main" className={styles.root}>
      <Container maxWidth="md">
        <Paper elevation={1} className={styles.card}>
          <Box className={styles.header}>
            <Box>
              <Typography variant="caption" className={styles.brandCaption}>
                Socket Talk
              </Typography>
              <Typography variant="h5" component="h1" className={styles.title}>
                Online users
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => void loadUsers()}
              disabled={isLoading}
            >
              {isLoading ? 'Loading…' : 'Refresh'}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" className={styles.alert}>
              {error}
            </Alert>
          )}

          {!isLoading && !error && users.length === 0 && (
            <Typography variant="body2" className={styles.emptyText}>
              No users are currently online.
            </Typography>
          )}

          <List className={styles.list}>
            {users.map((user) => (
              <ListItem
                key={user.slug}
                disableGutters
                secondaryAction={
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => void handleUserLogout(user.slug)}
                  >
                    Logout
                  </Button>
                }
                className={styles.listItem}
              >
                <ListItemAvatar>
                  <Avatar className={styles.avatar}>
                    <Box className={styles.avatarDot} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography className={styles.userName}>
                      {user.fullName}
                    </Typography>
                  }
                  secondary={`@${user.slug}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Container>
    </Box>
  )
}

export default AdminDashboard
