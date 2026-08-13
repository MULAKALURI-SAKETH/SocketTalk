import { passwordRegex, usernameRegex } from "../constants/authConstants";
import {
  FormErrors,
  LoginFormData,
  RegisterFormData,
  RegisterFormErrors,
} from "../interfaces/IForm";

export const validate = (formData: LoginFormData): FormErrors => {
  const errors: FormErrors = {};
  if (!formData.username) {
    errors.username = "Username is required.";
  } else if (!usernameRegex.test(formData.username))
    errors.username =
      "Use exactly 10 letters, numbers, or hyphens with uppercase, lowercase, and a number.";

  if (!formData.password) {
    errors.password = "Password is required.";
  } else if (!passwordRegex.test(formData.password)) {
    errors.password =
      "Use 10-15 letters or numbers with uppercase, lowercase, and a number.";
  }
  return errors;
};

export const validateRegistration = (
  formData: RegisterFormData,
): RegisterFormErrors => {
  const errors: RegisterFormErrors = validate(formData);
  if (!formData.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }
  return errors;
};
