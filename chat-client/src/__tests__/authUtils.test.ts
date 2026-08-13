import { validate, validateRegistration } from "../utils/authUtils";

describe("validate", () => {
  it("returns required errors for empty credentials", () => {
    const errors = validate({ username: "", password: "" });

    expect(errors.username).toBe("Username is required.");
    expect(errors.password).toBe("Password is required.");
  });

  it("rejects a username that does not match the format", () => {
    const errors = validate({ username: "short", password: "Password12" });

    expect(errors.username).toBe(
      "Use exactly 10 letters, numbers, or hyphens with uppercase, lowercase, and a number.",
    );
  });

  it("rejects a password that does not match the format", () => {
    const errors = validate({ username: "Abcdef1Xy2", password: "short" });

    expect(errors.password).toBe(
      "Use 10-15 letters or numbers with uppercase, lowercase, and a number.",
    );
  });

  it("returns no errors for valid credentials", () => {
    const errors = validate({ username: "Abcdef1Xy2", password: "Password12" });

    expect(errors).toEqual({});
  });
});

describe("validateRegistration", () => {
  it("requires a matching confirm password", () => {
    const errors = validateRegistration({
      username: "Abcdef1Xy2",
      password: "Password12",
      confirmPassword: "",
    });

    expect(errors.confirmPassword).toBe("Please confirm your password.");
  });

  it("rejects mismatched passwords", () => {
    const errors = validateRegistration({
      username: "Abcdef1Xy2",
      password: "Password12",
      confirmPassword: "Password13",
    });

    expect(errors.confirmPassword).toBe("Passwords do not match.");
  });

  it("returns no errors for a valid registration", () => {
    const errors = validateRegistration({
      username: "Abcdef1Xy2",
      password: "Password12",
      confirmPassword: "Password12",
    });

    expect(errors).toEqual({});
  });
});