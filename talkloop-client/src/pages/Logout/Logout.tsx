import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastProvider'
import { logoutUser } from '../../api/client'
import styles from './Logout.module.css'

const Logout: React.FC = () => {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const { slug } = useParams<{ slug: string }>()

  useEffect(() => {
    const performLogout = async () => {
      const username = user?.slug ?? slug
      if (username) {
        try {
          await logoutUser({ username })
        } catch {
          showToast("We couldn't sign you out. Please try again.", 'error')
        }
      }
      logout()
    }
    void performLogout()
  }, [user, slug, logout])

  return (
    <Box className={styles.root}>
      <CircularProgress size={24} />
      <Typography variant="body1">Logging out...</Typography>
    </Box>
  )
}

export default Logout
