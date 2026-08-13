import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ChatUser } from "../types";
import { IUserStatus } from "../types";

jest.unstable_mockModule("../api/authApi", () => ({
  getCurrentUser: jest.fn(),
  login: jest.fn(),
  getApiError: jest.fn(() => "Login failed."),
}));

const { getCurrentUser, login } = await import("../api/authApi");
const { AuthProvider, useAuth } = await import("../context/AuthContext");

const mockedGetCurrentUser = jest.mocked(getCurrentUser);
const mockedLogin = jest.mocked(login);

const testUser: ChatUser = {
  slug: "alice",
  fullName: "alice",
  userStatus: IUserStatus.ONLINE,
};

const Consumer = () => {
  const {
    isLoggedIn,
    isInitializing,
    user,
    login: authLogin,
    logout,
    loginError,
    clearLoginError,
  } = useAuth();
  return (
    <div>
      {isInitializing ? <p data-testid="loading">loading</p> : null}
      <p data-testid="status">{isLoggedIn ? "in" : "out"}</p>
      <p data-testid="user">{user?.slug ?? "none"}</p>
      {loginError && <p data-testid="error">{loginError}</p>}
      <button
        onClick={() =>
          void authLogin({
            username: "alice",
            password: "Password12",
          }).catch(() => {})
        }
      >
        login
      </button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={clearLoginError}>clear</button>
    </div>
  );
};

const renderAuthApp = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Consumer />} />
          <Route path="/chat-home" element={<div>Chat Home</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );

describe("AuthContext", () => {
  beforeEach(() => {
    mockedGetCurrentUser.mockResolvedValue(testUser);
    mockedLogin.mockResolvedValue(testUser);
  });

  afterEach(() => {
    localStorage.clear();
    jest.useRealTimers();
  });

  it("starts logged out when the session restore fails", async () => {
    mockedGetCurrentUser.mockRejectedValue(new Error("401"));

    renderAuthApp();

    await waitFor(() =>
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId("status")).toHaveTextContent("out");
    expect(screen.getByTestId("user")).toHaveTextContent("none");
  });

  it("restores the session from the HttpOnly cookie via /auth/me", async () => {
    renderAuthApp();

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("in"),
    );
    expect(mockedGetCurrentUser).toHaveBeenCalled();
    expect(screen.getByTestId("user")).toHaveTextContent("alice");
  });

  it("login authenticates and navigates to chat-home", async () => {
    mockedGetCurrentUser.mockRejectedValue(new Error("401"));
    const user = userEvent.setup();

    renderAuthApp();

    await waitFor(() =>
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument(),
    );
    await user.click(screen.getByText("login"));

    expect(mockedLogin).toHaveBeenCalledWith({
      username: "alice",
      password: "Password12",
    });
    expect(await screen.findByText("Chat Home")).toBeInTheDocument();
  });

  it("sets loginError and clears it when login fails", async () => {
    mockedGetCurrentUser.mockRejectedValue(new Error("401"));
    mockedLogin.mockRejectedValue(new Error("Invalid username or password."));
    const user = userEvent.setup();

    renderAuthApp();

    await waitFor(() =>
      expect(screen.queryByTestId("loading")).not.toBeInTheDocument(),
    );
    await user.click(screen.getByText("login"));

    expect(
      await screen.findByTestId("error"),
    ).toHaveTextContent("Login failed.");

    await user.click(screen.getByText("clear"));
    expect(screen.queryByTestId("error")).not.toBeInTheDocument();
  });

  it("logout clears the session and navigates to login", async () => {
    const user = userEvent.setup();

    renderAuthApp();

    await waitFor(() =>
      expect(screen.getByTestId("status")).toHaveTextContent("in"),
    );
    await user.click(screen.getByText("logout"));

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  it("auto logs out and navigates to login after an hour of inactivity", async () => {
    jest.useFakeTimers();
    mockedGetCurrentUser.mockResolvedValue(testUser);

    await act(async () => {
      renderAuthApp();
    });

    expect(screen.getByTestId("status")).toHaveTextContent("in");

    // User activity resets the timer, so just under an hour is not enough
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove"));
    });
    act(() => {
      jest.advanceTimersByTime(59 * 60 * 1000);
    });
    expect(screen.getByTestId("status")).toHaveTextContent("in");

    // No further activity, the timer fires and logs the user out
    act(() => {
      jest.advanceTimersByTime(60 * 1000);
    });

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
