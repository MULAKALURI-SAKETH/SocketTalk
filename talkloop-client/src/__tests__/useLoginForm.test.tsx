import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AuthCredentials } from "../api/client";
import type { ChatUser } from "../types";
import { IUserStatus } from "../types";

jest.unstable_mockModule("../api/client", () => ({
  getApiError: jest.fn((error: unknown) => String(error)),
}));
jest.unstable_mockModule("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const { getApiError } = await import("../api/client");
const { useAuth } = await import("../context/AuthContext");
const { default: useLoginForm } = await import("../hooks/useLoginForm");
const { ToastProvider } = await import("../context/ToastProvider");

const mockedGetApiError = jest.mocked(getApiError);
const mockedUseAuth = jest.mocked(useAuth);

type AuthLoginFn = (credentials: AuthCredentials) => Promise<ChatUser>;

const authLogin = jest.fn<AuthLoginFn>();

const Harness = () => {
  const {
    formData,
    validationErrors,
    serverError,
    handleChange,
    handleLoginSubmit,
  } = useLoginForm();
  return (
    <form onSubmit={handleLoginSubmit}>
      {serverError && <p role="alert">{serverError}</p>}
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

  it("does not call login when a required field is empty", async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText("Username"), "Abcdef1Xy2");
    await user.click(screen.getByText("Submit"));

    await waitFor(() =>
      expect(screen.getByText("Please enter your password.")).toBeInTheDocument(),
    );
    expect(authLogin).not.toHaveBeenCalled();
    expect(
      screen.getByText("Please fill in all the required fields."),
    ).toBeInTheDocument();
  });

  it("sends any filled-in credentials to login without registration strength rules", async () => {
    const user = userEvent.setup();
    authLogin.mockResolvedValue({
      slug: "short",
      fullName: "short",
      userStatus: IUserStatus.ONLINE,
    });

    renderLoginForm();

    await user.type(screen.getByLabelText("Username"), "short");
    await user.type(screen.getByLabelText("Password"), "Password12");
    await user.click(screen.getByText("Submit"));

    await waitFor(() =>
      expect(authLogin).toHaveBeenCalledWith({
        username: "short",
        password: "Password12",
      }),
    );
    expect(screen.getByText("Welcome back! You're signed in.")).toBeInTheDocument();
  });

  it("shows a friendly message and inline error when login fails", async () => {
    const user = userEvent.setup();
    authLogin.mockRejectedValue(new Error("invalid credentials"));
    mockedGetApiError.mockReturnValue(
      "Invalid username or password. Please try again.",
    );

    renderLoginForm();

    await user.type(screen.getByLabelText("Username"), "Abcdef1Xy2");
    await user.type(screen.getByLabelText("Password"), "WrongPass");
    await user.click(screen.getByText("Submit"));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid username or password. Please try again.",
      ),
    );
  });
});
