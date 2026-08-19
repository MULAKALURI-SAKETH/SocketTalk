import { describe, expect, it, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { useTheme as useMuiTheme } from '@mui/material/styles'

jest.unstable_mockModule('../api/client', () => ({
  getCurrentUser: jest
    .fn<() => Promise<never>>()
    .mockRejectedValue(new Error('not logged in')),
  login: jest.fn(),
  register: jest.fn(),
  logoutUser: jest.fn(),
  getApiError: jest.fn(),
  updatePreferences: jest.fn<() => Promise<{}>>().mockResolvedValue({}),
}))

const { ThemeProvider, useTheme } = await import('../context/ThemeProvider')
const { AuthProvider } = await import('../context/AuthContext')

const Toggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const muiTheme = useMuiTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="toggle theme"
      data-testid="theme-toggle"
    >
      {theme}:{muiTheme.palette.mode}
    </button>
  )
}

const renderToggle = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <ThemeProvider>
          <Toggle />
        </ThemeProvider>
      </AuthProvider>
    </MemoryRouter>,
  )

describe('ThemeContext', () => {
  it('starts in light mode', async () => {
    renderToggle()

    expect(
      await screen.findByRole('button', { name: 'toggle theme' }),
    ).toHaveTextContent('light:light')
  })

  it('toggles to dark mode and applies the MUI dark palette', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(
      await screen.findByRole('button', { name: 'toggle theme' }),
    )

    expect(
      screen.getByRole('button', { name: 'toggle theme' }),
    ).toHaveTextContent('dark:dark')
  })

  it('toggles back to light mode', async () => {
    const user = userEvent.setup()
    renderToggle()

    await user.click(
      await screen.findByRole('button', { name: 'toggle theme' }),
    )
    await user.click(screen.getByRole('button', { name: 'toggle theme' }))

    expect(
      screen.getByRole('button', { name: 'toggle theme' }),
    ).toHaveTextContent('light:light')
  })
})
