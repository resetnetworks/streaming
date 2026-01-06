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

export const ArtistRegisterRoute = ({ isAuthenticated, user, children }) => {
  // Agar user authenticated nahi hai to login page pe bhejein
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Agar user authenticated hai LEIN artist ya admin hai
  // To unhe home page redirect karein
  if (user && (user?.role === "artist" || user?.role === "admin")) {
    return <Navigate to="/home" replace />;
  }

  // Agar user authenticated hai aur artist/admin nahi hai
  // (yaani regular user hai jo artist banna chahta hai)
  // To artist register page show karein
  return children;
};


export const PublicRoute = ({ isAuthenticated, children, redirectTo = "/home" }) =>
  !isAuthenticated ? children : <Navigate to={redirectTo} replace />;
