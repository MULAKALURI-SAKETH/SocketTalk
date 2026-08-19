import { useState } from 'react'
import { useToast } from '../context/ToastProvider'
import { getApiError, logoutUser as apiLogoutUser } from '../api/client'

/**
 * Custom hook for managing actions within the Admin Dashboard,
 * specifically for logging out individual users.
 * @param onUserLoggedOut Callback function to execute after a user is successfully logged out (e.g., to refresh the user list).
 */
const useAdminDashboard = (onUserLoggedOut: () => void) => {
  const { showToast } = useToast()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleUserLogout = async (username: string) => {
    setIsLoggingOut(true)
    try {
      await apiLogoutUser({ username }) // Call the backend API to log out the user
      showToast(`${username} has been signed out.`, 'success')
      onUserLoggedOut() // Refresh the list of connected users
    } catch (error) {
      showToast(getApiError(error), 'error')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return { handleUserLogout, isLoggingOut }
}

export default useAdminDashboard
