import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.unstable_mockModule("axios", () => {
  class AxiosError extends Error {
    isAxiosError = true;
    response: unknown;
    constructor(
      message?: string,
      _code?: string,
      _config?: unknown,
      _request?: unknown,
      response?: unknown,
    ) {
      super(message);
      this.response = response;
    }
  }
  return {
    default: {
      get: jest.fn(),
      post: jest.fn(),
      isAxiosError: jest.fn(
        (error: unknown) =>
          (error as { isAxiosError?: boolean })?.isAxiosError === true,
      ),
      AxiosError,
      defaults: {},
    },
  };
});

const axios = (await import("axios")).default;
const {
  getApiError,
  getChatMessages,
  getConnectedUsers,
  getCurrentUser,
  getOnlineUsers,
  login,
  logoutUser,
  register,
  uploadImage,
} = await import("../api/authApi");

const mockedAxios = jest.mocked(axios);

describe("authApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("login posts credentials and returns the user", async () => {
    const user = {
      slug: "alice",
      fullName: "alice",
      userStatus: "ONLINE" as const,
    };
    mockedAxios.post.mockResolvedValue({ data: user });

    const result = await login({ username: "alice", password: "Password12" });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8088/auth/login",
      { username: "alice", password: "Password12" },
    );
    expect(result).toEqual(user);
  });

  it("register posts credentials to the register endpoint", async () => {
    mockedAxios.post.mockResolvedValue({ data: { slug: "alice" } });

    await register({ username: "alice", password: "Password12" });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8088/auth/register",
      { username: "alice", password: "Password12" },
    );
  });

  it("getConnectedUsers fetches the users endpoint", async () => {
    const users = [
      { slug: "alice", fullName: "alice", userStatus: "ONLINE" as const },
    ];
    mockedAxios.get.mockResolvedValue({ data: users });

    const result = await getConnectedUsers();

    expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8088/users");
    expect(result.data).toEqual(users);
  });

  it("logoutUser posts the username to the logout endpoint", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });

    await logoutUser({ username: "alice" });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8088/auth/logout",
      { username: "alice" },
    );
  });

  it("getChatMessages fetches the conversation between two users", async () => {
    const messages = [
      { id: "m1", senderId: "alice", recipientId: "bob", content: "Hi" },
    ];
    mockedAxios.get.mockResolvedValue({ data: messages });

    const result = await getChatMessages("alice", "bob");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://localhost:8088/messages/alice/bob",
    );
    expect(result.data).toEqual(messages);
  });

  it("uploadImage posts a file and returns the attachment metadata", async () => {
    const attachment = {
      url: "/uploads/img1/photo.png",
      fileName: "photo.png",
      contentType: "image/png",
      fileSize: 1234,
    };
    mockedAxios.post.mockResolvedValue({ data: attachment });
    const file = new File(["image-bytes"], "photo.png", { type: "image/png" });

    const result = await uploadImage(file);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8088/uploads",
      expect.any(FormData),
    );
    const formData = mockedAxios.post.mock.calls[0][1] as FormData;
    expect(formData.get("file")).toEqual(file);
    expect(result).toEqual(attachment);
  });

  it("configures axios to send cookies with every request", () => {
    expect(
      (axios as { defaults: { withCredentials?: boolean } }).defaults
        .withCredentials,
    ).toBe(true);
  });

  it("getCurrentUser fetches the authenticated user", async () => {
    const user = {
      slug: "alice",
      fullName: "alice",
      userStatus: "ONLINE" as const,
    };
    mockedAxios.get.mockResolvedValue({ data: user });

    const result = await getCurrentUser();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://localhost:8088/auth/me",
    );
    expect(result).toEqual(user);
  });

  it("getOnlineUsers fetches only the online users", async () => {
    const users = [
      { slug: "alice", fullName: "alice", userStatus: "ONLINE" as const },
    ];
    mockedAxios.get.mockResolvedValue({ data: users });

    const result = await getOnlineUsers();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://localhost:8088/users/online",
    );
    expect(result.data).toEqual(users);
  });

  it("getApiError returns the backend message when present", () => {
    const error = new axios.AxiosError(
      "Network Error",
      undefined,
      undefined,
      undefined,
      {
        data: { message: "Invalid username or password." },
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config: {},
      } as any,
    );

    expect(getApiError(error)).toBe("Invalid username or password.");
  });

  it("getApiError falls back to a friendly message for a response without a body", () => {
    const error = new axios.AxiosError(
      "Request failed with status code 500",
      undefined,
      undefined,
      undefined,
      {
        data: {},
        status: 500,
        statusText: "Internal Server Error",
        headers: {},
        config: {},
      } as any,
    );

    expect(getApiError(error)).toBe("Something went wrong. Please try again.");
  });

  it("getApiError reports a connection problem when the server is unreachable", () => {
    const error = new axios.AxiosError("Network Error", "ERR_NETWORK");

    expect(getApiError(error)).toBe(
      "We couldn't reach the server. Check your connection and try again.",
    );
  });

  it("getApiError returns a friendly message for non-axios errors", () => {
    expect(getApiError("boom")).toBe("Something went wrong. Please try again.");
  });
});
