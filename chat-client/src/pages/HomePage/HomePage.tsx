import React from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../../components/BrandLogo";
import ChatMockup from "../../components/ChatMockup";
import { useTheme } from "../../context/ThemeContext";

const FEATURES = [
  {
    title: "Real-time messaging",
    description:
      "Messages land the instant you hit send, powered by WebSocket STOMP under the hood.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
      </svg>
    ),
  },
  {
    title: "Read receipts",
    description:
      "Double ticks tell you when your message was delivered and when it was read.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
  },
  {
    title: "Share files & images",
    description:
      "Send photos and documents with a preview — images render right in the conversation.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-5.409-9.909h.008v.008h-.008V6.75zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM3.75 21h16.5A1.5 1.5 0 0 0 21.75 19.5V4.5A1.5 1.5 0 0 0 20.25 3H3.75A1.5 1.5 0 0 0 2.25 4.5v15A1.5 1.5 0 0 0 3.75 21z"
        />
      </svg>
    ),
  },
  {
    title: "Edit & delete anytime",
    description:
      "Fix typos or remove a message — edits sync live, and deletes are per-user or for everyone.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.6}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
        />
      </svg>
    ),
  },
];

const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 ${className}`}
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
  );
};

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/80">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" aria-label="Talkloop home">
            <BrandLogo />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#features"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 sm:block dark:text-slate-400 dark:hover:text-white"
            >
              Features
            </a>
            <ThemeToggle />
            <Link
              to="/login"
              className="hidden rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:block dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sign in
            </Link>
            <Link
              to="/register-user"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 blur-3xl" />

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Now with read receipts, edits &amp; deletes
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Chat that feels{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
                instant.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-600 dark:text-slate-400">
              Talkloop is a real-time chat app where messages arrive the moment
              you send them — no page refreshes, no waiting.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/register-user"
                className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors hover:bg-indigo-500"
              >
                Start chatting free
              </Link>
              <Link
                to="/login"
                className="rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Sign in
              </Link>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6">
              {[
                ["< 50ms", "Typical delivery"],
                ["100%", "Real-time, not polling"],
                ["24/7", "Always connected"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dd className="text-xl font-bold text-slate-900 dark:text-white">
                    {value}
                  </dd>
                  <dt className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-fade-up [animation-delay:0.15s]">
            <ChatMockup />
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-t border-slate-200 bg-slate-50 py-16 lg:py-24 dark:border-slate-800 dark:bg-slate-900/40"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Everything a great chat needs
            </h2>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
              Built for speed and reliability, with the details that make
              conversations feel natural.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
                  {feature.icon}
                </span>
                <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-14 text-center shadow-2xl shadow-indigo-600/30">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-fuchsia-300/20 blur-3xl" />
            <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to talk?
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-lg text-white/85">
              Create a free account and your first message is only a click away.
            </p>
            <Link
              to="/register-user"
              className="relative mt-8 inline-block rounded-md bg-white px-8 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition-transform hover:scale-[1.03]"
            >
              Get started — it&apos;s free
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <BrandLogo />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Talkloop. Real-time chat, minus the
            boring parts.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
