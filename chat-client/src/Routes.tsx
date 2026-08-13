import { useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginForm from "./pages/LoginForm/LoginForm";
import RegisterUser from "./pages/RegisterUser/RegisterUser";
import ChatPage from "./pages/ChatPage/ChatPage";
import LogoutPage from "./pages/LogoutPage/LogoutPage";
import AdminDashboard from "./pages/MessageApp/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const AppRoutes: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <ToastProvider>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/chat-home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? <Navigate to="/chat-home" replace /> : <LoginForm />
          }
        />
        <Route
          path="/register-user"
          element={
            isLoggedIn ? <Navigate to="/chat-home" replace /> : <RegisterUser />
          }
        />
        <Route
          path="/chat-home"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="/:slug/logout" element={<LogoutPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </ToastProvider>
  );
};

export default AppRoutes;
