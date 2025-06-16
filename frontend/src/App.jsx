import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "sonner";
import { getMyProfile } from "./features/auth/authSlice";
import {
  selectIsAuthenticated,
  selectAuthStatus,
  selectCurrentUser,
} from "./features/auth/authSelectors";
import Loader from "./components/Loader";
import Artist from "./user/Artist";
import CreatePlayList from "./user/CreatePlayList";

// Lazy load route components
const Register = lazy(() => import("./user/Register"));
const Login = lazy(() => import("./user/Login"));
const FavouriteGen = lazy(() => import("./user/FavouriteGen"));
const ForgotPassword = lazy(() => import("./user/ForgotPassword"));
const ResetPassword = lazy(() => import("./user/ResetPassword"));
const Home = lazy(() => import("./user/Home"));
const Browse = lazy(() => import("./user/Browse"));
const LikedSong = lazy(() => import("./user/LikedSong"));
const Admin = lazy(() => import("./admin/Admin"));
const Album = lazy(() => import("./user/Album"));

// Protected routes
const ProtectedRoute = ({
  isAuthenticated,
  children,
  redirectTo = "/login",
}) => {
  return isAuthenticated ? children : <Navigate to={redirectTo} replace />;
};

const RedirectedProtectedRoute = ({ isAuthenticated, user, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.preferredGenres?.length === 0)
    return <Navigate to="/genres" replace />;
  return children;
};

const AdminRoute = ({ isAuthenticated, user, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ isAuthenticated, children, redirectTo = "/" }) => {
  return !isAuthenticated ? children : <Navigate to={redirectTo} replace />;
};

function App() {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  const loading = status === "loading";

  // ✅ Only fetch profile if not already authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(getMyProfile()).catch(() => {});
    }
  }, [dispatch, isAuthenticated]);

  if (loading) return <Loader />;

  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/register"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/genres"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <FavouriteGen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <RedirectedProtectedRoute
                  isAuthenticated={isAuthenticated}
                  user={user}
                >
                  <Home />
                </RedirectedProtectedRoute>
              }
            />
            <Route
              path="/browse"
              element={
                <RedirectedProtectedRoute
                  isAuthenticated={isAuthenticated}
                  user={user}
                >
                  <Browse />
                </RedirectedProtectedRoute>
              }
            />
            <Route
              path="/artist/:artistId"
              element={
                <RedirectedProtectedRoute
                  isAuthenticated={isAuthenticated}
                  user={user}
                >
                  <Artist />
                </RedirectedProtectedRoute>
              }
            />
            <Route path="/create-playlist" element={<CreatePlayList />} />
            <Route
              path="/liked-songs"
              element={
                <RedirectedProtectedRoute
                  isAuthenticated={isAuthenticated}
                  user={user}
                >
                  <LikedSong />
                </RedirectedProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute isAuthenticated={isAuthenticated} user={user}>
                  <Admin />
                </AdminRoute>
              }
            />
            <Route
              path="/album/:albumId"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} user={user}>
                  <Album />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route
              path="*"
              element={
                isAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <Toaster richColors position="top-center" />
    </>
  );
}

export default App;
