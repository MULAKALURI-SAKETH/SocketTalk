import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { RegisterFormData, RegisterFormErrors } from "../interfaces/IForm";
import { useToast } from "../context/ToastProvider";
import { getApiError, register } from "../api/client";
import { validateRegistration } from "../utils/auth";

const useRegisterForm = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState<RegisterFormErrors>(
    {},
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const updated: RegisterFormData = {
      ...formData,
      [event.target.name]: event.target.value,
    };
    setFormData(updated);
    if (hasSubmitted) setValidationErrors(validateRegistration(updated));
  };

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    const errors = validateRegistration(formData);
    setValidationErrors(errors);
    if (Object.keys(errors).length) {
      showToast("Please fix the highlighted fields before creating your account.", "error");
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        username: formData.username,
        password: formData.password,
      });
      showToast("Account created! You can now sign in.", "success");
      navigate("/login", { replace: true });
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
    handleRegisterSubmit,
  };
};

export default useRegisterForm;
