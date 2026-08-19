import { IFormField } from '../interfaces/IForm'

export const usernameRegex =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9-]{10}$/
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z0-9]{10,15}$/

export const fields: IFormField[] = [
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    placeholder: 'Username',
    autoComplete: 'username',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Password',
    autoComplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm password',
    type: 'password',
    placeholder: 'Confirm password',
    autoComplete: 'new-password',
  },
]

export const INACTIVITY_TIMEOUT_MS = 3600000
export const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
]
