import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "sonner";
import { getMyProfile } from "./features/auth/authSlice"; // thunk
import {
  selectIsAuthenticated,
  selectAuthStatus,
  selectCurrentUser,
} from "./features/auth/authSelectors";
import Loader from "./components/Loader";

// Lazy load route components
const Register = lazy(() => import("./user/Register"));
const Login = lazy(() => import("./user/Login"));
const FavouriteGen = lazy(() => import("./user/FavouriteGen"));
const ForgotPassword = lazy(() => import("./user/ForgotPassword"));
const ResetPassword = lazy(() => import("./user/ResetPassword"));
const Home = lazy(() => import("./user/Home"));
const Browse = lazy(() => import("./user/Browse"));

// ProtectedRoute: only render children if authenticated, else redirect
const ProtectedRoute = ({ isAuthenticated, children, redirectTo = "/login" }) => {
  return isAuthenticated ? children : <Navigate to={redirectTo} replace />;
};

// RedirectedProtectedRoute: redirect to /genres if user has no preferredGenres
const RedirectedProtectedRoute = ({ isAuthenticated, user, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.preferredGenres?.length === 0) {
    return <Navigate to="/genres" replace />;
  }

  return children;
};

// PublicRoute: only render children if NOT authenticated, else redirect
const PublicRoute = ({ isAuthenticated, children, redirectTo = "/" }) => {
  return !isAuthenticated ? children : <Navigate to={redirectTo} replace />;
};

function App() {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  const loading = status === "loading";

  useEffect(() => {
    dispatch(getMyProfile()).catch(() => {
      // optional: handle error
    });
  }, [dispatch]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public routes */}
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
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Protected routes */}
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
                <RedirectedProtectedRoute isAuthenticated={isAuthenticated} user={user}>
                  <Home />
                </RedirectedProtectedRoute>
              }
            />
            <Route
              path="/browse"
              element={
                <RedirectedProtectedRoute isAuthenticated={isAuthenticated} user={user}>
                  <Browse />
                </RedirectedProtectedRoute>
              }
            />

            {/* Fallback route - redirect based on authentication */}
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
