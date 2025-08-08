// src/utils/axiosInstance.js
import axios from "axios";
import { toast } from "sonner";

// ✅ Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true, // ✅ Send cookies (needed for cookie-based auth)
  timeout: 300000,
});

// ✅ Helper function to get token from cookie
const getTokenFromCookie = () => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
  
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  return null;
};

// ✅ Helper function to clear all cookies
const clearAllCookies = () => {
  if (typeof document === 'undefined') return;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
  }
};

// ✅ Comprehensive auth data clearing function
const clearAllAuthData = () => {
  // Clear localStorage
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("subscribedArtists");
  
  // ✅ Clear Redux Persist data
  localStorage.removeItem("persist:root");
  localStorage.removeItem("persist:auth");
  localStorage.removeItem("persist:player");
  
  // Clear all persist keys
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('persist:')) {
      localStorage.removeItem(key);
    }
  });
  
  // Clear all cookies
  clearAllCookies();
  
  // ✅ Remove Authorization header from axios defaults
  delete axiosInstance.defaults.headers.common["Authorization"];
  
  console.log("🧹 All auth data cleared due to token expiry");
};

// ✅ ENHANCED: Attach token on each request with Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    // Try localStorage first, then cookie
    let token = localStorage.getItem("token");
    
    if (!token) {
      token = getTokenFromCookie();
      if (token) {
        // Store in localStorage for future use
        localStorage.setItem('token', token);
      }
    }

    // ✅ Set Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ FIXED: More precise error handling - Only 401 triggers auth clearing
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Axios interceptor caught error:", error);
    
    const errorStatus = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;
    const errorCode = error.code;
    
    // ✅ FIXED: Only clear auth data on 401 status code
    const isTokenExpired = (
      errorStatus === 401 ||          // ✅ Only 401 Unauthorized
      errorMessage === "Authentication token missing. Please login."
    );
    
    // ✅ Handle network errors separately (don't clear auth data)
    const isNetworkError = (
      errorCode === 'ERR_NETWORK' ||
      errorCode === 'ECONNREFUSED' ||
      errorCode === 'ENOTFOUND' ||
      errorCode === 'ETIMEDOUT' ||
      error.message === 'Network Error'
    );
    
    if (isTokenExpired) {
      console.warn("🚫 Token expired (401) — clearing all auth data");
      
      // ✅ Show toast notification
      toast.error("Session expired. You have been logged out.", {
        description: "Please login again to continue using the app.",
        duration: 5000,
        action: {
          label: "Login",
          onClick: () => window.location.href = '/login'
        }
      });
      
      // ✅ Clear all auth data immediately
      clearAllAuthData();
      
      // ✅ Dispatch logout action to Redux if available
      if (window.store) {
        window.store.dispatch({ type: 'auth/logout/fulfilled' });
      }
      
      // ✅ Smart redirect to avoid loops
      const currentPath = window.location.pathname;
      const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback'];
      const publicPaths = ['/privacy-policy', '/help', '/data-deletion'];
      const isOnAuthPage = authPaths.some(path => currentPath.includes(path));
      const isOnPublicPage = publicPaths.some(path => currentPath.includes(path));
      
      // Only redirect if not already on auth page and not on public pages
      if (!isOnAuthPage && !isOnPublicPage) {
        console.log("🔄 Redirecting to login page due to 401 error");
        
        // ✅ Delay redirect slightly to show toast
        setTimeout(() => {
          window.history.replaceState(null, '', '/login');
          window.location.href = '/login';
        }, 1500);
      }
    }
    else if (isNetworkError) {
      // ✅ Handle network errors without clearing auth data
      console.warn("🌐 Network error detected - not clearing auth data");
      
      if (errorCode === 'ERR_NETWORK') {
        toast.error("Network connection failed", {
          description: "Please check your internet connection and try again.",
          duration: 4000,
        });
      } else if (errorCode === 'ECONNREFUSED') {
        toast.error("Server connection refused", {
          description: "The server might be down. Please try again later.",
          duration: 4000,
        });
      } else if (errorCode === 'ENOTFOUND') {
        toast.error("Server not found", {
          description: "Please check the server URL and try again.",
          duration: 4000,
        });
      } else {
        toast.error("Network error occurred", {
          description: "Please check your connection and try again.",
          duration: 4000,
        });
      }
      
      // ✅ Don't redirect for network errors - let user retry
    }
    else if (errorStatus === 400) {
      // ✅ Keep your existing 400 error handling
      error.message = "User already exists. Please try logging in.";
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
