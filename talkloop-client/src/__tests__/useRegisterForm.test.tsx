import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.unstable_mockModule('../api/client', () => ({
  getApiError: jest.fn((error: unknown) => String(error)),
  register: jest.fn(),
}))
jest.unstable_mockModule('../context/ToastProvider', () => ({
  useToast: jest.fn(() => ({ showToast: jest.fn() })),
}))
jest.unstable_mockModule('react-router-dom', () => ({
  useNavigate: jest.fn(),
}))

const { register } = await import('../api/client')
const { useToast } = await import('../context/ToastProvider')
const { useNavigate } = await import('react-router-dom')
const { default: useRegisterForm } = await import('../hooks/useRegisterForm')
const { IUserStatus } = await import('../types')

const mockedRegister = jest.mocked(register)
const mockedUseToast = jest.mocked(useToast)
const mockedUseNavigate = jest.mocked(useNavigate)

const Harness = () => {
  const { formData, validationErrors, handleChange, handleRegisterSubmit } =
    useRegisterForm()
  return (
    <form onSubmit={handleRegisterSubmit}>
      <input
        aria-label="Username"
        name="username"
        value={formData.username}
        onChange={handleChange}
      />
      <input
        aria-label="Password"
        name="password"
        value={formData.password}
        onChange={handleChange}
      />
      <input
        aria-label="Confirm password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
      />
      {validationErrors.username && <p>{validationErrors.username}</p>}
      {validationErrors.password && <p>{validationErrors.password}</p>}
      {validationErrors.confirmPassword && (
        <p>{validationErrors.confirmPassword}</p>
      )}
      <button type="submit">Submit</button>
    </form>
  )
}

const renderRegisterForm = () => render(<Harness />)

describe('useRegisterForm', () => {
  const showToast = jest.fn()
  const navigate = jest.fn() as unknown as ReturnType<typeof useNavigate>

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseToast.mockReturnValue({ showToast })
    mockedUseNavigate.mockReturnValue(navigate)
  })

  it('does not call the API when passwords do not match', async () => {
    const user = userEvent.setup()
    renderRegisterForm()

    await user.type(screen.getByLabelText('Username'), 'Abcdef1Xy2')
    await user.type(screen.getByLabelText('Password'), 'Password12')
    await user.type(screen.getByLabelText('Confirm password'), 'Password13')
    await user.click(screen.getByText('Submit'))

    expect(
      screen.getByText("Those passwords don't match. Please try again."),
    ).toBeInTheDocument()
    expect(showToast).toHaveBeenCalledWith(
      'Please fix the highlighted fields before creating your account.',
      'error',
    )
    expect(mockedRegister).not.toHaveBeenCalled()
  })

  it('registers the user and navigates to login on success', async () => {
    const user = userEvent.setup()
    mockedRegister.mockResolvedValue({
      slug: 'Abcdef1Xy2',
      fullName: 'Abcdef1Xy2',
      userStatus: IUserStatus.ONLINE,
    })
    renderRegisterForm()

    await user.type(screen.getByLabelText('Username'), 'Abcdef1Xy2')
    await user.type(screen.getByLabelText('Password'), 'Password12')
    await user.type(screen.getByLabelText('Confirm password'), 'Password12')
    await user.click(screen.getByText('Submit'))

    await waitFor(() =>
      expect(mockedRegister).toHaveBeenCalledWith({
        username: 'Abcdef1Xy2',
        password: 'Password12',
      }),
    )
    expect(showToast).toHaveBeenCalledWith(
      'Account created! You can now sign in.',
      'success',
    )
    expect(navigate).toHaveBeenCalledWith('/login', { replace: true })
  })
})
