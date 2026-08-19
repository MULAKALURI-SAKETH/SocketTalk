import { passwordRegex, usernameRegex } from '../constants/auth'
import {
  FormErrors,
  LoginFormData,
  RegisterFormData,
  RegisterFormErrors,
} from '../interfaces/IForm'

// Login only checks that both fields are filled in. The backend decides
// whether the credentials are correct, so registration strength rules
// never block someone from signing in.
export const validateLogin = (formData: LoginFormData): FormErrors => {
  const errors: FormErrors = {}
  if (!formData.username || !formData.username.trim()) {
    errors.username = 'Please enter your username.'
  }
  if (!formData.password) {
    errors.password = 'Please enter your password.'
  }
  return errors
}

export const validateRegistration = (
  formData: RegisterFormData,
): RegisterFormErrors => {
  const errors: RegisterFormErrors = {}

  if (!formData.username || !formData.username.trim()) {
    errors.username = 'Please choose a username.'
  } else if (!usernameRegex.test(formData.username)) {
    errors.username =
      'Your username must be exactly 10 characters, using uppercase and lowercase letters, numbers, or hyphens.'
  }

  if (!formData.password) {
    errors.password = 'Please create a password.'
  } else if (!passwordRegex.test(formData.password)) {
    errors.password =
      'Your password must be 10-15 characters and include uppercase and lowercase letters and a number.'
  }

  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Those passwords don't match. Please try again."
  }

  return errors
}
