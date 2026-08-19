import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react'
import {
  createTheme,
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
} from '@mui/material'
import { useAuth } from './AuthContext'
import { updatePreferences } from '../api/client'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoggedIn } = useAuth()
  const [theme, setTheme] = useState<Theme>('light')
  const hasSyncedFromUser = useRef(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (isLoggedIn && user?.preferences?.theme) {
      const stored = user.preferences.theme
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored)
      }
      hasSyncedFromUser.current = true
    }
  }, [isLoggedIn, user])

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      if (isLoggedIn) {
        void updatePreferences({ theme: next }).catch(() => {})
      }
      return next
    })
  }, [isLoggedIn])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  )

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: theme,
          primary: { main: '#4f46e5' },
          secondary: { main: '#7c3aed' },
        },
        typography: {
          fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        },
        shape: { borderRadius: 12 },
      }),
    [theme],
  )

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
