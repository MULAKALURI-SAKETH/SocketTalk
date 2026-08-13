import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";

jest.unstable_mockModule("../api/authApi", () => ({
  getApiError: jest.fn((error: unknown) => String(error)),
  logoutUser: jest.fn(),
}));
jest.unstable_mockModule("../context/ToastContext", () => ({
  useToast: jest.fn(() => ({ showToast: jest.fn() })),
}));

const { logoutUser } = await import("../api/authApi");
const { useToast } = await import("../context/ToastContext");
const { default: useAdminDashboard } = await import(
  "../hooks/useAdminDashboard"
);

const mockedLogoutUser = jest.mocked(logoutUser);
const mockedUseToast = jest.mocked(useToast);

describe("useAdminDashboard", () => {
  const showToast = jest.fn();
  const onUserLoggedOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseToast.mockReturnValue({ showToast });
  });

  it("logs out a user and notifies the parent on success", async () => {
    mockedLogoutUser.mockResolvedValue({});
    const { result } = renderHook(() => useAdminDashboard(onUserLoggedOut));

    await act(async () => {
      await result.current.handleUserLogout("alice");
    });

    expect(mockedLogoutUser).toHaveBeenCalledWith({ username: "alice" });
    expect(showToast).toHaveBeenCalledWith(
      "User 'alice' logged out successfully.",
      "success",
    );
    expect(onUserLoggedOut).toHaveBeenCalledTimes(1);
    expect(result.current.isLoggingOut).toBe(false);
  });

  it("shows an error toast and skips the callback on failure", async () => {
    mockedLogoutUser.mockRejectedValue(new Error("Network Error"));
    const { result } = renderHook(() => useAdminDashboard(onUserLoggedOut));

    await act(async () => {
      await result.current.handleUserLogout("alice");
    });

    expect(showToast).toHaveBeenCalledWith("Error: Network Error", "error");
    expect(onUserLoggedOut).not.toHaveBeenCalled();
    expect(result.current.isLoggingOut).toBe(false);
  });
});