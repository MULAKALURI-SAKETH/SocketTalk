import { useState } from "react";
import useLoginForm from "../../hooks/useLoginForm";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";

const LoginForm: React.FC = () => {
  const {
    formData,
    validationErrors,
    isSubmitting,
    serverError,
    handleChange,
    handleLoginSubmit,
  } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);

  const inputClass = (hasError: boolean) =>
    `block w-full rounded-md bg-white px-3 py-2 pr-10 text-base outline-1 -outline-offset-1 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 ${
      hasError
        ? "outline-red-400 focus:outline-red-500"
        : "outline-slate-300 focus:outline-indigo-500 dark:outline-slate-700"
    }`;

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-fade-up">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
            Sign in to pick up where you left off.
          </p>

          {serverError && (
            <div
              role="alert"
              className="mt-6 rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
            >
              {serverError}
            </div>
          )}

          <form
            className="mt-6 space-y-5"
            onSubmit={handleLoginSubmit}
            noValidate
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Username <span className="pl-2 text-red-600">*</span>
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  type="text"
                  placeholder="Username"
                  autoComplete="username"
                  aria-invalid={Boolean(validationErrors.username)}
                  aria-describedby={
                    validationErrors.username ? "username-error" : undefined
                  }
                  className={inputClass(Boolean(validationErrors.username))}
                />
                {validationErrors.username && (
                  <p
                    id="username-error"
                    className="mt-1 text-sm text-red-600 dark:text-red-400"
                  >
                    {validationErrors.username}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Password <span className="pl-2 text-red-600">*</span>
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(validationErrors.password)}
                  aria-describedby={
                    validationErrors.password ? "password-error" : undefined
                  }
                  className={inputClass(Boolean(validationErrors.password))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? (
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
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
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
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p
                  id="password-error"
                  className="mt-1 text-sm text-red-600 dark:text-red-400"
                >
                  {validationErrors.password}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Remember me
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            New here?{" "}
            <Link
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              to="/register-user"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginForm;
