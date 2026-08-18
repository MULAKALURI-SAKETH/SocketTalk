import { afterEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeContext";
import HomePage from "../pages/HomePage/HomePage";

const renderHomePage = () =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <HomePage />
      </ThemeProvider>
    </MemoryRouter>,
  );

describe("HomePage", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("renders the hero headline", () => {
    renderHomePage();

    expect(
      screen.getByRole("heading", { name: /chat that feels/i }),
    ).toBeInTheDocument();
  });

  it("renders the feature section", () => {
    renderHomePage();

    expect(screen.getByText("Real-time messaging")).toBeInTheDocument();
    expect(screen.getByText("Read receipts")).toBeInTheDocument();
    expect(screen.getByText("Share files & images")).toBeInTheDocument();
    expect(screen.getByText("Edit & delete anytime")).toBeInTheDocument();
  });

  it("renders sign-in and registration links", () => {
    renderHomePage();

    expect(
      screen.getAllByRole("link", { name: /sign in/i }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: /start chatting free/i }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /get started/i }).length,
    ).toBeGreaterThan(0);
  });

  it("toggles dark mode from the navbar", async () => {
    const user = userEvent.setup();
    renderHomePage();

    await user.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await user.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});