import React, { useEffect, useState, Suspense } from "react";
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
import {
  ProtectedRoute,
  RedirectedProtectedRoute,
  AdminRoute,
  PublicRoute,
} from "./components/RouteGuards";

import * as Pages from "./routes/LazyRoutes";

// 🟦 Stripe
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// ⚠️ Use your actual publishable key here (from .env or directly)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY); // or process.env.STRIPE_PUBLISHABLE_KEY

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(getMyProfile()).finally(() => setInitialLoad(false));
    } else {
      setInitialLoad(false);
    }
  }, [dispatch, isAuthenticated]);

  if (initialLoad) return <Loader />;

  return (
    <Elements stripe={stripePromise}>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public */}
            <Route path="/payment-success" element={<Pages.PaymentSuccess />} />
            <Route path="/payment-fail" element={<Pages.PaymentFailure />} />
            <Route
              path="/register"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <Pages.Register />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <Pages.Login />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <Pages.ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password/:token"
              element={
                <PublicRoute isAuthenticated={isAuthenticated}>
                  <Pages.ResetPassword />
                </PublicRoute>
              }
            />

            {/* Protected */}
            <Route
              path="/genres"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Pages.FavouriteGen />
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
                  <Pages.Home />
                </RedirectedProtectedRoute>
              }
            />
            <Route
              path="/artists"
              element={
                <RedirectedProtectedRoute
                  isAuthenticated={isAuthenticated}
                  user={user}
                >
                  <Pages.Artists />
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
                  <Pages.Artist />
                </RedirectedProtectedRoute>
              }
            />
            <Route
              path="/admin/payments/:artistId"
              element={
                <AdminRoute
                  isAuthenticated={isAuthenticated}
                  user={user}
                >
                  <Pages.ArtistPayments />
                </AdminRoute>
              }
            />
            <Route
              path="/purchases"
              element={
                <RedirectedProtectedRoute
                  isAuthenticated={isAuthenticated}
                  user={user}
                >
                  <Pages.Library />
                </RedirectedProtectedRoute>
              }
            />
            <Route
              path="/liked-songs"
              element={
                <RedirectedProtectedRoute
                  isAuthenticated={isAuthenticated}
                  user={user}
                >
                  <Pages.LikedSong />
                </RedirectedProtectedRoute>
              }
            />
            <Route
              path="/payment-history"
              element={
                <RedirectedProtectedRoute
                  isAuthenticated={isAuthenticated}
                  user={user}
                >
                  <Pages.PaymentHistory />
                </RedirectedProtectedRoute>
              }
            />
            <Route
              path="/album/:albumId"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Pages.Album />
                </ProtectedRoute>
              }
            />
            <Route
              path="/search"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Pages.Search />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute isAuthenticated={isAuthenticated} user={user}>
                  <Pages.Admin />
                </AdminRoute>
              }
            />

            <Route path="/help" element={<Pages.Help />} />

            {/* Fallback */}
            <Route
              path="*"
              element={
                <Navigate to={isAuthenticated ? "/" : "/login"} replace />
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <Toaster richColors position="top-center" />
    </Elements>
  );
}

export default App;
