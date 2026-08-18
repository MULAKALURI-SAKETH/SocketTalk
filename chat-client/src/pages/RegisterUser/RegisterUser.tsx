import { Link } from "react-router-dom";
import useRegisterForm from "../../hooks/useRegisterForm";
import { fields } from "../../constants/authConstants";
import { IFormField } from "../../interfaces/IForm";
import AuthLayout from "../../components/AuthLayout";

const RegisterUser: React.FC = () => {
  const {
    formData,
    validationErrors,
    isSubmitting,
    handleChange,
    handleRegisterSubmit,
  } = useRegisterForm();

  const inputClass = (hasError: boolean) =>
    `block w-full rounded-md bg-white px-3 py-2 text-base outline-1 -outline-offset-1 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 ${
      hasError
        ? "outline-red-400 focus:outline-red-500"
        : "outline-slate-300 focus:outline-indigo-500 dark:outline-slate-700"
    }`;

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-fade-up">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 dark:border-slate-700 dark:bg-slate-900 dark:shadow-none">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
            Join Talkloop and start talking in real time.
          </p>

          <form
            className="mt-6 space-y-5"
            onSubmit={handleRegisterSubmit}
            noValidate
          >
            {fields.map((field: IFormField) => {
              const error = validationErrors[field.name];
              return (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {field.label} <span className="pl-2 text-red-600">*</span>
                  </label>

                  <div className="mt-2">
                    <input
                      id={field.name}
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      type={field.type}
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      aria-invalid={Boolean(error)}
                      aria-describedby={
                        error ? `${field.name}-error` : undefined
                      }
                      className={inputClass(Boolean(error))}
                    />

                    {error && (
                      <p
                        id={`${field.name}-error`}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                      >
                        {error}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              to="/login"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterUser;
