// src/pages/SocialLoginCallback.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleSocialLoginSuccess } from "../features/auth/authSlice"; // 🔥 Use the new thunk
import { toast } from "sonner";

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
        
        
        if (isNewUser || !hasGenres) {
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
    <div className="min-h-screen bg-image flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold mb-2">Completing Social Login...</h2>
        <p className="text-gray-300 mb-4">Please wait while we authenticate your account</p>
        
        <div className="mt-4 text-sm text-gray-400 space-y-1">
          <p>🔄 Verifying credentials...</p>
          <p>📂 Fetching your profile data...</p>
          <p>💾 Setting up your session...</p>
        </div>
      </div>
    </div>
  );
};

export default SocialLoginCallback;
