// src/pages/SocialLoginCallback.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleSocialLoginSuccess } from "../../features/auth/authSlice"; // 🔥 Use the new thunk
import { toast } from "sonner";
import Loader from "../../components/Loader";

const SocialLoginCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters from backend redirect
        const urlParams = new URLSearchParams(window.location.search);
        const isNewUser = urlParams.get('newUser') === 'true';
        const error = urlParams.get('error');

        // Check for authentication errors first
        if (error) {
          toast.error(`Login failed: ${error}. Please try again.`);
          navigate("/login");
          return;
        }
        
        // 🔥 FIXED: Use the proper social login thunk
        const result = await dispatch(handleSocialLoginSuccess({ isNewUser })).unwrap();
        const { user } = result;
        
        // Determine where to redirect based on user status
        const hasGenres = user.preferredGenres && user.preferredGenres.length > 0;
        const pendingToken = localStorage.getItem("pendingInviteToken");
        
        if (user?.role === "artist") {
          toast.success(`Welcome back ${user.name}!`);
          navigate("/artist/dashboard");
        } else if (pendingToken) {
          localStorage.removeItem("pendingInviteToken");
          toast.success(`Welcome ${user.name}! Redirecting to accept invitation...`);
          navigate(`/accept-invite?token=${pendingToken}`);
        } else if (isNewUser || !hasGenres) {
          // New user or user without genres - go to genre selection
          localStorage.setItem("justRegistered", "true");
          localStorage.setItem("registrationTime", Date.now().toString());
          toast.success(`Welcome ${user.name}! Please select your favorite genres.`);
          navigate("/genres");
        } else {
          // Existing user with genres - go to homepage
          toast.success(`Welcome back ${user.name}!`);
          navigate("/");
        }
      } catch (error) {
        toast.error("Login failed. Please try again.");
        // Clean up any partial data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("justRegistered");
        localStorage.removeItem("registrationTime");
        navigate("/login");
      }
    };

    // Add a small delay to ensure all cookies are set
    const timer = setTimeout(() => {
      handleCallback();
    }, 100);

    return () => clearTimeout(timer);
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#020216] text-white">
      <div className="flex flex-col items-center justify-center p-8 rounded-[24px] max-w-[450px] w-full text-center">
        <Loader />
      </div>
    </div>
  );
};

export default SocialLoginCallback;
