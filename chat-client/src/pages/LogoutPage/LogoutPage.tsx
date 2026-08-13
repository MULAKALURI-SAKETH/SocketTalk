import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { logoutUser } from "../../api/authApi";

const LogoutPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    const performLogout = async () => {
      const username = user?.slug ?? slug;
      if (username) {
        try {
          await logoutUser({ username });
        } catch {
          showToast("We couldn't sign you out. Please try again.", "error");
        }
      }
      logout();
    };
    void performLogout();
  }, [user, slug, logout]);

  // Render a loading/logging out message while the redirect happens
  return (
    <div className="flex min-h-screen items-center justify-center">
      Logging out...
    </div>
  );
};

export default LogoutPage;
