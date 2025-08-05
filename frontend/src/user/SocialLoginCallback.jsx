// src/pages/SocialLoginCallback.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMyProfile } from "../features/auth/authSlice";
import { toast } from "sonner";
import axios from "../utills/axiosInstance";

const SocialLoginCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const handleSocialLoginCallback = async () => {
      try {
        // Get URL parameters to check if it's a new registration
        const urlParams = new URLSearchParams(window.location.search);
        const isNewUser = urlParams.get('newUser') === 'true';
        
        // Wait a bit for cookies to be set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get token from cookie
        const getTokenFromCookie = () => {
          if (typeof document === 'undefined') return null;
          const cookies = document.cookie.split('; ');
          const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
          return tokenCookie ? tokenCookie.split('=')[1] : null;
        };

        const token = getTokenFromCookie();
        
        if (token) {
          localStorage.setItem("token", token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        // Get user profile
        const result = await dispatch(getMyProfile()).unwrap();
        
        if (result) {
          // Check if user has preferred genres
          const hasGenres = result.preferredGenres && result.preferredGenres.length > 0;
          
          if (isNewUser || !hasGenres) {
            // New user or user without genres - go to genre selection
            localStorage.setItem("justRegistered", "true");
            localStorage.setItem("registrationTime", Date.now().toString());
            toast.success(`Welcome ${result.name}! Please select your favorite genres.`);
            navigate("/genres");
          } else {
            // Existing user with genres - go to homepage
            toast.success(`Welcome back ${result.name}!`);
            navigate("/");
          }
        }
        
      } catch (error) {
        console.error("Social login callback error:", error);
        toast.error("Login failed. Please try again.");
        navigate("/login");
      }
    };

    handleSocialLoginCallback();
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen bg-image flex items-center justify-center">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg">Completing login...</p>
        <p className="text-sm text-gray-300 mt-2">Please wait while we set up your account</p>
      </div>
    </div>
  );
};

export default SocialLoginCallback;
