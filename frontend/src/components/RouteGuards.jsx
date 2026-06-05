import { Navigate } from "react-router-dom";
import { useMyWorkspaces } from "../hooks/api/useWorkspace";
import Loader from "./Loader";

export const ProtectedRoute = ({ isAuthenticated, children, redirectTo = "/login" }) =>
  isAuthenticated ? children : <Navigate to={redirectTo} replace />;

export const RedirectedProtectedRoute = ({ user, children }) => {
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

export const ArtistRoute = ({ isAuthenticated, user, children }) => {
  const { data: workspaces, isLoading } = useMyWorkspaces();

  // ❌ Not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return <Loader />;
  }

  const isCollaborator = workspaces && workspaces.length > 0;
  const isAllowed = user?.role === "artist" || isCollaborator;

  // ❌ Not allowed
  if (!isAllowed) {
    return <Navigate to="/home" replace />;
  }

  // ✅ Allowed
  return children;
};


export const PublicRoute = ({ isAuthenticated, children, redirectTo = "/home" }) =>
  !isAuthenticated ? children : <Navigate to={redirectTo} replace />;
