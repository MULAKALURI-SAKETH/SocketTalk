import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { FormErrors, LoginFormData } from "../interfaces/IForm";
import { useToast } from "../context/ToastContext";
import { getApiError } from "../api/authApi";
import { validate } from "../utils/authUtils";
import { useAuth } from "../context/AuthContext"; // Import useAuth

const useLoginForm = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const { login: authLogin } = useAuth(); // Destructure login from useAuth to avoid name collision

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updated: LoginFormData = {
      ...formData,
      [event.target.name]: event.target.value,
    };
    setFormData(updated);
    if (hasSubmitted) {
      setValidationErrors(validate(updated));
    }
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    const errors = validate(formData);
    setValidationErrors(errors);
    if (Object.keys(errors).length) {
      showToast("Please correct the highlighted fields.", "error");
      return;
    }
    setIsSubmitting(true);

    try {
      await authLogin(formData); // Authenticates via cookie and restores the session
      showToast("Login successful.", "success");
    } catch (error) {
      showToast(getApiError(error), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    validationErrors,
    isSubmitting,
    handleChange,
    handleLoginSubmit,
  };
};

export default useLoginForm;
