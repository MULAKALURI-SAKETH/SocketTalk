import { afterEach, describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "../context/ThemeProvider";

const Toggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme} aria-label="toggle theme">
      {theme}
    </button>
  );
};

const renderToggle = () =>
  render(
    <ThemeProvider>
      <Toggle />
    </ThemeProvider>,
  );

describe("ThemeContext", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("starts in light mode with no dark class", () => {
    renderToggle();

    expect(screen.getByRole("button", { name: "toggle theme" })).toHaveTextContent(
      "light",
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("toggles to dark mode and applies the dark class", async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByRole("button", { name: "toggle theme" }));

    expect(screen.getByRole("button", { name: "toggle theme" })).toHaveTextContent(
      "dark",
    );
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("toggles back to light mode and removes the dark class", async () => {
    const user = userEvent.setup();
    renderToggle();

    await user.click(screen.getByRole("button", { name: "toggle theme" }));
    await user.click(screen.getByRole("button", { name: "toggle theme" }));

    expect(screen.getByRole("button", { name: "toggle theme" })).toHaveTextContent(
      "light",
    );
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});