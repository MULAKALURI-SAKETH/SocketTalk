import { afterEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import type { ChatUser } from "../types";
import { IUserStatus } from "../types";

const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

const testUser: ChatUser = {
  slug: "alice",
  fullName: "alice",
  userStatus: IUserStatus.ONLINE,
};

const Consumer = () => {
  const { isLoggedIn, user, login, logout } = useAuth();
  return (
    <div>
      <p data-testid="status">{isLoggedIn ? "in" : "out"}</p>
      <p data-testid="user">{user?.slug ?? "none"}</p>
      <button onClick={() => login(testUser)}>login</button>
      <button onClick={() => logout()}>logout</button>
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
  afterEach(() => {
    localStorage.clear();
  });

  it("starts logged out when no token is stored", () => {
    renderAuthApp();

    expect(screen.getByTestId("status")).toHaveTextContent("out");
    expect(screen.getByTestId("user")).toHaveTextContent("none");
  });

  it("restores the session from localStorage", () => {
    localStorage.setItem(AUTH_TOKEN_KEY, "authenticated");
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(testUser));

    renderAuthApp();

    expect(screen.getByTestId("status")).toHaveTextContent("in");
    expect(screen.getByTestId("user")).toHaveTextContent("alice");
  });

  it("login persists the session and navigates to chat-home", async () => {
    const user = userEvent.setup();
    renderAuthApp();

    await user.click(screen.getByText("login"));

    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe("authenticated");
    expect(JSON.parse(localStorage.getItem(AUTH_USER_KEY)!)).toEqual(testUser);
    expect(await screen.findByText("Chat Home")).toBeInTheDocument();
  });

  it("logout clears the session and navigates to login", async () => {
    const user = userEvent.setup();
    localStorage.setItem(AUTH_TOKEN_KEY, "authenticated");
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(testUser));
    renderAuthApp();

    await user.click(screen.getByText("logout"));

    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });
});