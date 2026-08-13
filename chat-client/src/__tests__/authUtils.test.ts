import { describe, expect, it } from "@jest/globals";
import { validateLogin, validateRegistration } from "../utils/authUtils";

describe("validateLogin", () => {
  it("returns required errors for empty credentials", () => {
    const errors = validateLogin({ username: "", password: "" });

    expect(errors.username).toBe("Please enter your username.");
    expect(errors.password).toBe("Please enter your password.");
  });

  it("does not enforce registration strength rules on login", () => {
    const errors = validateLogin({
      username: "short",
      password: "Password12",
    });

    expect(errors).toEqual({});
  });

  it("returns no errors for any filled-in credentials", () => {
    const errors = validateLogin({
      username: "Abcdef1Xy2",
      password: "Password12",
    });

    expect(errors).toEqual({});
  });
});

describe("validateRegistration", () => {
  it("rejects a username that does not match the format", () => {
    const errors = validateRegistration({
      username: "short",
      password: "Password12",
      confirmPassword: "Password12",
    });

    expect(errors.username).toBe(
      "Your username must be exactly 10 characters, using uppercase and lowercase letters, numbers, or hyphens.",
    );
  });

  it("rejects a password that does not match the format", () => {
    const errors = validateRegistration({
      username: "Abcdef1Xy2",
      password: "short",
      confirmPassword: "short",
    });

    expect(errors.password).toBe(
      "Your password must be 10-15 characters and include uppercase and lowercase letters and a number.",
    );
  });

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

    expect(errors.confirmPassword).toBe(
      "Those passwords don't match. Please try again.",
    );
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
