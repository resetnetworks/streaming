// src/utils/axiosInstance.js
import axios from "axios";

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

// ✅ NEW: Helper function to clear all cookies
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

// ✅ NEW: Comprehensive auth data clearing function
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

    // ✅ NEW: Set Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ ENHANCED: Global response error handling with PayPal exception
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    const originalRequest = error.config;
    const errorStatus = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;
    
    // 🔑 NEW: PayPal specific error handling - DON'T logout user
    if (originalRequest?.url?.includes('/paypal/')) {
      return Promise.reject(error);
    }
    
    // ✅ ENHANCED: Comprehensive token expiry detection (for non-PayPal requests)
    const isTokenExpired = (
      errorStatus === 401 ||          // Unauthorized
      error.code === 'ECONNREFUSED' ||  // Database connection refused
      error.code === 'ENOTFOUND' ||     // Database not found
      error.message?.includes('Network Error') ||
      errorMessage?.toLowerCase().includes('token') ||
      errorMessage?.toLowerCase().includes('authentication') ||
      errorMessage?.toLowerCase().includes('unauthorized') ||
      errorMessage === "Authentication token missing. Please login." ||
      errorMessage?.includes('User not found') ||
      errorMessage?.includes('Authentication failed')
    );
    
    if (isTokenExpired) {
      
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
        // Clear URL and redirect to login
        window.history.replaceState(null, '', '/login');
        window.location.href = '/login';
      }
    }
    else if (errorStatus === 400) {
      // ✅ Keep your existing 400 error handling
      error.message = "User already exists. Please try logging in.";
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
