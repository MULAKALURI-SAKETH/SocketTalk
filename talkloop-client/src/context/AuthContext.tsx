import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import type { ChatUser } from '../types'
import {
  login as loginRequest,
  getCurrentUser,
  getApiError,
} from '../api/client'
import type { AuthCredentials, AuthContextType } from '../interfaces/IAuth'
import { ACTIVITY_EVENTS, INACTIVITY_TIMEOUT_MS } from '../constants/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate()

  const [user, setUser] = useState<ChatUser | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getCurrentUser()
      .then((currentUser) => {
        if (cancelled) return
        setUser(currentUser)
        setIsLoggedIn(true)
      })
      .catch(() => {
        if (cancelled) return
        setUser(null)
        setIsLoggedIn(false)
      })
      .finally(() => {
        if (!cancelled) setIsInitializing(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(
    async (credentials: AuthCredentials): Promise<ChatUser> => {
      setLoginError(null)
      try {
        const loggedInUser = await loginRequest(credentials)
        setUser(loggedInUser)
        setIsLoggedIn(true)
        navigate('/chat-home', { replace: true }) // Navigate to chat-home after successful login
        return loggedInUser
      } catch (error) {
        setLoginError(getApiError(error))
        throw error
      }
    },
    [navigate],
  )

  const logout = useCallback(() => {
    setUser(null)
    setIsLoggedIn(false)
    navigate('/login', { replace: true })
  }, [navigate])

  const clearLoginError = useCallback(() => {
    setLoginError(null)
  }, [])

  const logoutRef = useRef(logout)
  logoutRef.current = logout

  useEffect(() => {
    if (!isLoggedIn) {
      return
    }

    let inactivityTimer: ReturnType<typeof setTimeout>

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(
        () => logoutRef.current(),
        INACTIVITY_TIMEOUT_MS,
      )
    }

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer),
    )
    resetInactivityTimer()

    return () => {
      clearTimeout(inactivityTimer)
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer),
      )
    }
  }, [isLoggedIn])

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isInitializing,
        user,
        login,
        logout,
        loginError,
        clearLoginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
