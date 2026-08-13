import { Link } from "react-router-dom";
import useRegisterForm from "../../hooks/useRegisterForm";
import { fields } from "../../constants/authConstants";
import { IFormField } from "../../interfaces/IForm";

const RegisterUser: React.FC = () => {
  const {
    formData,
    validationErrors,
    isSubmitting,
    handleChange,
    handleRegisterSubmit,
  } = useRegisterForm();

  const inputClass = (hasError: boolean) =>
    `block w-full rounded-md bg-white px-3 py-1.5 text-base outline-1 -outline-offset-1 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 sm:text-sm/6 ${hasError ? "outline-red-400 focus:outline-red-500" : "outline-slate-300 focus:outline-indigo-500"}`;

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight">
          Create your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleRegisterSubmit} noValidate>
          {fields.map((field: IFormField) => {
            const error = validationErrors[field.name];
            return (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="block text-sm/6 font-medium"
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
                    aria-describedby={error ? `${field.name}-error` : undefined}
                    className={inputClass(Boolean(error))}
                  />

                  {error && (
                    <p
                      id={`${field.name}-error`}
                      className="mt-1 text-sm text-red-600"
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
            className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm/6 font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            className="font-semibold text-indigo-600 hover:text-indigo-500"
            to="/login"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterUser;
