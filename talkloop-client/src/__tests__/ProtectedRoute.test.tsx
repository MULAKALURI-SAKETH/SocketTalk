import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ChatUser } from "../types";
import { IUserStatus } from "../types";

jest.unstable_mockModule("../api/client", () => ({
  getCurrentUser: jest.fn(),
  login: jest.fn(),
  getApiError: jest.fn(),
}));

const { getCurrentUser } = await import("../api/client");
const { AuthProvider } = await import("../context/AuthContext");
const { default: ProtectedRoute } = await import("../components/ProtectedRoute");

const mockedGetCurrentUser = jest.mocked(getCurrentUser);

const testUser: ChatUser = {
  slug: "alice",
  fullName: "alice",
  userStatus: IUserStatus.ONLINE,
};

const Protected = () => <div>Protected Content</div>;

const renderProtectedRoute = () =>
  render(
    <MemoryRouter initialEntries={["/protected"]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <Protected />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mockedGetCurrentUser.mockRejectedValue(new Error("401"));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders children when the session is valid", async () => {
    mockedGetCurrentUser.mockResolvedValue(testUser);

    renderProtectedRoute();

    expect(await screen.findByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });

  it("redirects to /login when the session is invalid", async () => {
    renderProtectedRoute();

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
