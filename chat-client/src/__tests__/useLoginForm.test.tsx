import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuthCredentials } from "../api/authApi";
import type { ChatUser } from "../types";
import { IUserStatus } from "../types";

jest.unstable_mockModule("../api/authApi", () => ({
  getApiError: jest.fn((error: unknown) => String(error)),
}));
jest.unstable_mockModule("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const { useAuth } = await import("../context/AuthContext");
const { default: useLoginForm } = await import("../hooks/useLoginForm");
const { ToastProvider } = await import("../context/ToastContext");

const mockedUseAuth = jest.mocked(useAuth);

type AuthLoginFn = (credentials: AuthCredentials) => Promise<ChatUser>;

const authLogin = jest.fn<AuthLoginFn>();

const Harness = () => {
  const { formData, validationErrors, handleChange, handleLoginSubmit } =
    useLoginForm();
  return (
    <form onSubmit={handleLoginSubmit}>
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
      {validationErrors.username && <p>{validationErrors.username}</p>}
      {validationErrors.password && <p>{validationErrors.password}</p>}
      <button type="submit">Submit</button>
    </form>
  );
};

const renderLoginForm = () =>
  render(
    <ToastProvider>
      <Harness />
    </ToastProvider>,
  );

describe("useLoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseAuth.mockReturnValue({
      isLoggedIn: false,
      isInitializing: false,
      user: null,
      login: authLogin,
      logout: jest.fn(),
      loginError: null,
      clearLoginError: jest.fn(),
    });
  });

  it("does not call login and shows a toast when validation fails", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText("Username"), "short");
    await user.type(screen.getByLabelText("Password"), "Password12");
    await user.click(screen.getByText("Submit"));

    await waitFor(() =>
      expect(
        screen.getByText(
          "Use exactly 10 letters, numbers, or hyphens with uppercase, lowercase, and a number.",
        ),
      ).toBeInTheDocument(),
    );
    expect(authLogin).not.toHaveBeenCalled();
    expect(
      screen.getByText("Please correct the highlighted fields."),
    ).toBeInTheDocument();
  });

  it("authenticates through the context and shows a success toast", async () => {
    const user = userEvent.setup();
    authLogin.mockResolvedValue({
      slug: "Abcdef1Xy2",
      fullName: "Abcdef1Xy2",
      userStatus: IUserStatus.ONLINE,
    });

    renderLoginForm();

    await user.type(screen.getByLabelText("Username"), "Abcdef1Xy2");
    await user.type(screen.getByLabelText("Password"), "Password12");
    await user.click(screen.getByText("Submit"));

    await waitFor(() =>
      expect(authLogin).toHaveBeenCalledWith({
        username: "Abcdef1Xy2",
        password: "Password12",
      }),
    );
    expect(screen.getByText("Login successful.")).toBeInTheDocument();
  });
});
