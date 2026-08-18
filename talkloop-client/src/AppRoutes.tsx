import { useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastProvider";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Home from "./pages/Home/Home";
import Chat from "./pages/Chat/Chat";
import Logout from "./pages/Logout/Logout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Spinner from "./components/Spinner";

const AppRoutes: React.FC = () => {
  const { isLoggedIn, isInitializing } = useAuth();

  if (isInitializing) {
    return <Spinner />;
  }

  return (
    <ToastProvider>
      <Routes>
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Navigate to="/chat-home" replace />
            ) : (
              <Home />
            )
          }
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? <Navigate to="/chat-home" replace /> : <Login />
          }
        />
        <Route
          path="/register-user"
          element={
            isLoggedIn ? <Navigate to="/chat-home" replace /> : <Register />
          }
        />
        <Route
          path="/chat-home"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="/:slug/logout" element={<Logout />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </ToastProvider>
  );
};

export default AppRoutes;
