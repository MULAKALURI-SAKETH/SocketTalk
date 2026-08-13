import useLoginForm from "../../hooks/useLoginForm";
import { Link } from "react-router-dom";

const LoginForm: React.FC = () => {
  const {
    formData,
    validationErrors,
    isSubmitting,
    handleChange,
    handleLoginSubmit,
  } = useLoginForm();

  const inputClass = (hasError: boolean) =>
    `block w-full rounded-md bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${hasError ? "outline-red-400 focus:outline-red-500" : "outline-slate-300 focus:outline-indigo-500"}`;

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
          Sign in to your account
        </h2>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleLoginSubmit} noValidate>
          <div>
            <label htmlFor="username" className="block text-sm/6 font-medium">
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
                <p id="username-error" className="mt-1 text-sm text-red-600">
                  {validationErrors.username}
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm/6 font-medium">
              Password <span className="pl-2 text-red-600">*</span>
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                aria-invalid={Boolean(validationErrors.password)}
                aria-describedby={
                  validationErrors.password ? "password-error" : undefined
                }
                className={inputClass(Boolean(validationErrors.password))}
              />
              {validationErrors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600">
                  {validationErrors.password}
                </p>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          New here?{" "}
          <Link
            className="font-semibold text-indigo-600 hover:text-indigo-500"
            to="/register-user"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
