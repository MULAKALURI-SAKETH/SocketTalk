import type { ChatUser } from '../types'

export interface AuthCredentials {
  username: string
  password: string
}

export interface AuthContextType {
  isLoggedIn: boolean
  isInitializing: boolean
  user: ChatUser | null
  login: (credentials: AuthCredentials) => Promise<ChatUser>
  logout: () => void
  loginError: string | null
  clearLoginError: () => void
}

export type Theme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

export type ToastType = 'success' | 'error'

export interface ToastContextValue {
  showToast: (message: string, type: ToastType) => void
}
