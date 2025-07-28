import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ isAuthenticated, children, redirectTo = "/login" }) =>
  isAuthenticated ? children : <Navigate to={redirectTo} replace />;

export const RedirectedProtectedRoute = ({ isAuthenticated, user, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

export const AdminRoute = ({ isAuthenticated, user, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

export const PublicRoute = ({ isAuthenticated, children, redirectTo = "/" }) =>
  !isAuthenticated ? children : <Navigate to={redirectTo} replace />;
