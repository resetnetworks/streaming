import React, { useEffect, useState, Suspense } from "react";
import * as Sentry from "@sentry/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Toaster } from "sonner";
import { getMyProfile } from "./features/auth/authSlice";
import UserLayout from "./components/user/UserLayout";
import PayPalSuccessHandler from "./components/PayPalSuccessHandler";
import ScrollToTop from "./components/ScrollToTop";
import RoleUpdateModal from "./components/user/RoleUpdateModal";
import {
  selectIsAuthenticated,
  selectAuthStatus,
  selectCurrentUser,
} from "./features/auth/authSelectors";
import Loader from "./components/Loader";
import {
  ProtectedRoute,
  RedirectedProtectedRoute,
  ArtistRegisterRoute,
  ArtistRoute,
  AdminRoute,
  PublicRoute,
} from "./components/RouteGuards";

import { 
  setRandomDefaultFromSongs, 
  loadDefaultSongFromStorage 
} from "./features/playback/playerSlice";

import * as Pages from "./routes/LazyRoutes";

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
  sessionStorage.removeItem("lazy-reloaded");
}, []);

useEffect(() => {
  // Always verify authentication status with backend on startup to check if a valid HttpOnly session cookie exists
  dispatch(getMyProfile())
    .unwrap()
    .then((userData) => {
      if (userData?._id) {
        Sentry.setUser({
          id: userData._id,
          email: userData.email,
          username: userData.name,
        });
        Sentry.setTag("role", userData.role);
      }
    })
    .catch((error) => {
      // It is normal to fail with 401 if the user is a guest
      if (error?.status !== 401 && error !== "Unauthorized") {
        Sentry.captureException(error);
      }
    })
    .finally(() => setInitialLoad(false));
}, [dispatch]);



  // ✅ Initialize default song on app start
  useEffect(() => {
    if (isAuthenticated && !initialLoad) {
      try {
        dispatch(loadDefaultSongFromStorage());
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }, [isAuthenticated, initialLoad, dispatch]);


  // 🔐 Disable Right Click & Inspect Shortcut
  useEffect(() => {
    if (import.meta.env.MODE === "development") return;
    
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
      <BrowserRouter>
      <ScrollToTop />
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
            <Route path="/careers" element={<Pages.Career />} />
            <Route path="/artist-details" element={<Pages.ArtistDetails />} />
            <Route path="/report-issue" element={<Pages.ReportIssue />} />
            <Route path="/accept-invite" element={<Pages.AcceptInvite />} />

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
                    user={user}
                  >
                <Pages.Home />
                </RedirectedProtectedRoute>
                }
              />
              <Route
                path="/genre/:genre"
                element={
                    <Pages.Genre />
                }
              />
              <Route
                path="/albums"
                element={
                  <RedirectedProtectedRoute
                    isAuthenticated={isAuthenticated}
                    user={user}
                  >
                    <Pages.AlbumsPage />
                  </RedirectedProtectedRoute>
                }
              />
              <Route
                path="/artists"
                element={<Pages.Artists />}
              />
              <Route
                path="/artist/:artistId"
                element={<Pages.Artist />}
              />
              <Route
                path="/purchases"
                element={
                    <Pages.Purchases />
                }
              />
              <Route
                path="/liked-songs"
                element={<Pages.LikedSong />}
              />
              <Route
                path="/album/:albumId"
                element={
                    <Pages.Album />
                }
              />
              <Route
                path="/song/:songId"
                element={
                    <Pages.Song />
                }
              />
              <Route
                path="/search"
                element={<Pages.Search />}
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

           {/* Artist Routes */}

            <Route 
            path="/artist/register"
            element={
            // <ArtistRegisterRoute
            // isAuthenticated={isAuthenticated} 
            // user={user}>
            <Pages.ArtistRegister />
            // </ArtistRegisterRoute>
            }
            />
            <Route 
            path="/artist/dashboard"
            element={
            <ArtistRoute
                    isAuthenticated={isAuthenticated}
                    user={user}
                  >
            <Pages.ArtistDashboard />
          </ArtistRoute>}
            />
          </Routes>      
        </Suspense>
        <Toaster richColors position="top-center" closeButton />
        <RoleUpdateModal />
      </BrowserRouter>

      
  
  );
}

export default App;


