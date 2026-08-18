import { afterEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../context/ThemeProvider";
import Home from "../pages/Home/Home";

const renderHome = () =>
  render(
    <MemoryRouter>
      <ThemeProvider>
        <Home />
      </ThemeProvider>
    </MemoryRouter>,
  );

describe("Home", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("renders the hero headline", () => {
    renderHome();

    expect(
      screen.getByRole("heading", { name: /chat that feels/i }),
    ).toBeInTheDocument();
  });

  it("renders the feature section", () => {
    renderHome();

    expect(screen.getByText("Real-time messaging")).toBeInTheDocument();
    expect(screen.getByText("Read receipts")).toBeInTheDocument();
    expect(screen.getByText("Share files & images")).toBeInTheDocument();
    expect(screen.getByText("Edit & delete anytime")).toBeInTheDocument();
  });

  it("renders sign-in and registration links", () => {
    renderHome();

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
    renderHome();

    await user.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(document.documentElement.classList.contains("dark")).toBe(true);

    await user.click(screen.getByRole("button", { name: "Toggle theme" }));

    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});