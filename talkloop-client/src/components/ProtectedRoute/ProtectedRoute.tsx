import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import Spinner from '../Spinner/Spinner'

const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoggedIn, isInitializing } = useAuth()

  if (isInitializing) {
    return <Spinner />
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
