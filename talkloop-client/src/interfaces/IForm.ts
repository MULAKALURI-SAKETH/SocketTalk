export type LoginFormData = { username: string; password: string }
export type FormErrors = Partial<Record<keyof LoginFormData, string>>

export type RegisterFormData = {
  username: string
  password: string
  confirmPassword: string
}

export type RegisterFormErrors = Partial<Record<keyof RegisterFormData, string>>

export interface IFormField {
  name: keyof RegisterFormData
  label: string
  type: string
  placeholder: string
  autoComplete: string
}
