import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "sonner";
import { getMyProfile } from "./features/auth/authSlice";
import UserLayout from "./components/user/UserLayout";
import PayPalSuccessHandler from "./components/PayPalSuccessHandler";
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
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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

  // 🔐 Disable Right Click & Inspect Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "U") ||
        (e.ctrlKey && e.shiftKey && e.key === "C")
      ) {
        e.preventDefault();
      }
    };

    const handleRightClick = (e) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleRightClick);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleRightClick);
    };
  }, []);
  

  if (initialLoad) return <Loader />;

  return (
    <Elements stripe={stripePromise}>
      <BrowserRouter>
      {/* paypal success handler */}
      {isAuthenticated && <PayPalSuccessHandler />}
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/payment-success" element={<Pages.PaymentSuccess />} />
            <Route path="/terms-and-conditions" element={<Pages.TermsAndConditions />} />
            <Route path="/cancellation-refund-policy" element={<Pages.CancellationRefundPolicy />} />
            <Route path="/about-us" element={<Pages.About />} />
            <Route path="/payment-fail" element={<Pages.PaymentFailure />} />
            <Route path="/" element={<Pages.LandingPage />} />
            <Route path="/contact-us" element={<Pages.Help />} />
            <Route path="/data-deletion" element={<Pages.DataDeletion />} />
            <Route path="/privacy-policy" element={<Pages.PrivacyPolicy />} />

            {/* 🔥 NEW: Social Login Callback Route */}
            <Route path="/auth/callback" element={<Pages.SocialLoginCallback />} />

            {/* User Authentication Routes */}
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

            {/* Genre Selection - Protected but Special Case */}
            <Route
              path="/genres"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Pages.FavouriteGen />
                </ProtectedRoute>
              }
            />

            {/* User Layout Protected Routes */}
            <Route element={<UserLayout />}>
              <Route
                path="/home"
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
                path="/genre/:genre"
                element={
                  <RedirectedProtectedRoute
                    isAuthenticated={isAuthenticated}
                    user={user}
                  >
                    <Pages.Genre />
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
                path="/purchases"
                element={
                  <RedirectedProtectedRoute
                    isAuthenticated={isAuthenticated}
                    user={user}
                  >
                    <Pages.Purchases />
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
            </Route>

            {/* Payment History - Outside UserLayout */}
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

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute isAuthenticated={isAuthenticated} user={user}>
                  <Pages.Admin />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/payments/:artistId"
              element={
                <AdminRoute isAuthenticated={isAuthenticated} user={user}>
                  <Pages.ArtistPayments />
                </AdminRoute>
              }
            />

            {/* Fallback Route */}
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
