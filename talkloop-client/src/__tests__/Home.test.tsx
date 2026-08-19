import { describe, expect, it, jest } from '@jest/globals'
import { render, screen } from '@testing-library/react'
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

const { ThemeProvider } = await import('../context/ThemeProvider')
const { AuthProvider } = await import('../context/AuthContext')
const { default: Home } = await import('../pages/Home/Home')

const ThemeProbe: React.FC = () => {
  const muiTheme = useMuiTheme()
  return <p data-testid="palette-mode">{muiTheme.palette.mode}</p>
}

const renderHome = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <ThemeProvider>
          <Home />
          <ThemeProbe />
        </ThemeProvider>
      </AuthProvider>
    </MemoryRouter>,
  )

describe('Home', () => {
  it('renders the hero headline', async () => {
    renderHome()

    expect(
      await screen.findByRole('heading', { name: /chat that feels/i }),
    ).toBeInTheDocument()
  })

  it('renders the feature section', async () => {
    renderHome()

    expect(await screen.findByText('Real-time messaging')).toBeInTheDocument()
    expect(screen.getByText('Read receipts')).toBeInTheDocument()
    expect(screen.getByText('Share files & images')).toBeInTheDocument()
    expect(screen.getByText('Edit & delete anytime')).toBeInTheDocument()
  })

  it('renders sign-in and registration links', async () => {
    renderHome()

    await screen.findByRole('heading', { name: /chat that feels/i })

    expect(
      screen.getAllByRole('link', { name: /sign in/i }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByRole('link', { name: /start chatting free/i }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /get started/i }).length,
    ).toBeGreaterThan(0)
  })

  it('toggles dark mode from the navbar', async () => {
    const user = userEvent.setup()
    renderHome()

    expect(await screen.findByTestId('palette-mode')).toHaveTextContent('light')

    await user.click(screen.getByRole('button', { name: 'Toggle theme' }))

    expect(screen.getByTestId('palette-mode')).toHaveTextContent('dark')

    await user.click(screen.getByRole('button', { name: 'Toggle theme' }))

    expect(screen.getByTestId('palette-mode')).toHaveTextContent('light')
  })
})
