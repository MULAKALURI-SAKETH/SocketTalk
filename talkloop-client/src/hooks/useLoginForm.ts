import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import type { FormErrors, LoginFormData } from '../interfaces/IForm'
import { useToast } from '../context/ToastProvider'
import { getApiError } from '../api/client'
import { validateLogin } from '../utils/auth'
import { useAuth } from '../context/AuthContext' // Import useAuth

const useLoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  })
  const [validationErrors, setValidationErrors] = useState<FormErrors>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const { showToast } = useToast()
  const { login: authLogin } = useAuth() // Destructure login from useAuth to avoid name collision

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updated: LoginFormData = {
      ...formData,
      [event.target.name]: event.target.value,
    }
    setFormData(updated)
    if (serverError) setServerError(null)
    if (hasSubmitted) {
      setValidationErrors(validateLogin(updated))
    }
  }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasSubmitted(true)
    const errors = validateLogin(formData)
    setValidationErrors(errors)
    if (Object.keys(errors).length) {
      showToast('Please fill in all the required fields.', 'error')
      return
    }
    setIsSubmitting(true)

    try {
      await authLogin(formData) // Authenticates via cookie and restores the session
      showToast("Welcome back! You're signed in.", 'success')
    } catch (error) {
      const message = getApiError(error)
      setServerError(message)
      showToast(message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    validationErrors,
    isSubmitting,
    serverError,
    handleChange,
    handleLoginSubmit,
  }
}

export default useLoginForm
