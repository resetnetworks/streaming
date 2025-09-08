import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ isAuthenticated, children, redirectTo = "/login" }) =>
  isAuthenticated ? children : <Navigate to={redirectTo} replace />;

export const RedirectedProtectedRoute = ({ isAuthenticated, user, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.preferredGenres?.length === 0) return <Navigate to="/genres" replace />;
  return children;
};

export const AdminRoute = ({ isAuthenticated, user, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/home" replace />;
  return children;
};

export const PublicRoute = ({ isAuthenticated, children, redirectTo = "/home" }) =>
  !isAuthenticated ? children : <Navigate to={redirectTo} replace />;
