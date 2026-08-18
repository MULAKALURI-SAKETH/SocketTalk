import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import { useTheme } from "../context/ThemeProvider";

const FEATURE_BLURBS = [
  "Real-time messages the moment you hit send.",
  "Read receipts, edits and deletes — just like WhatsApp.",
  "Share images and files in a single tap.",
  "Your conversations survive server restarts.",
];

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const [blurbIndex, setBlurbIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setBlurbIndex((index) => (index + 1) % FEATURE_BLURBS.length);
    }, 4000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2 dark:bg-slate-950">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative flex items-center justify-between">
          <BrandLogo className="text-white" withText />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/20"
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="relative space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Chat that feels
            <br />
            instant.
          </h1>

          <div className="relative flex h-20 items-center overflow-hidden">
            <p
              key={blurbIndex}
              className="animate-fade-up text-lg text-white/90"
            >
              {FEATURE_BLURBS[blurbIndex]}
            </p>
          </div>

          <div className="flex gap-1.5">
            {FEATURE_BLURBS.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === blurbIndex
                    ? "w-6 bg-white"
                    : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="relative text-sm text-white/70">
          © {new Date().getFullYear()} Talkloop — real-time chat, minus the
          boring parts.
        </p>
      </div>

      <div className="relative flex min-h-screen flex-col">
        <div className="flex items-center justify-between p-4 lg:hidden">
          <Link to="/" aria-label="Talkloop home">
            <BrandLogo />
          </Link>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg border border-slate-300 p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
                />
              </svg>
            )}
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;