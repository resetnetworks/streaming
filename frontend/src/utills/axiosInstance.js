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

// ✅ ENHANCED: Complete auth data clearing with Redux Persist
const clearAllAuthData = async () => {
  
  try {
    // ✅ 1. Clear Redux Persist using the persistor from store
    if (window.__PERSISTOR__) {
      await window.__PERSISTOR__.purge();
      await window.__PERSISTOR__.flush();
    }
    
    // ✅ 2. Clear specific localStorage keys
    const keysToRemove = [
      "user",
      "token",
      "authToken", 
      "userData",
      "subscribedArtists",
      "persist:root",
      "persist:auth", 
      "persist:player"
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // ✅ 3. Clear ALL persist keys automatically
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('persist:')) {
        localStorage.removeItem(key);
      }
    });
    
    // ✅ 4. Complete localStorage and sessionStorage clear
    localStorage.clear();
    sessionStorage.clear();
    
    // ✅ 5. Clear all cookies
    clearAllCookies();
    
    // ✅ 6. Remove Authorization header from axios defaults
    delete axiosInstance.defaults.headers.common["Authorization"];
    
    
  } catch (error) {
    // Force clear anyway
    localStorage.clear();
    sessionStorage.clear();
    clearAllCookies();
  }
};

// ✅ PREVENT LOOPS: Track logout state
let isLoggingOut = false;

// ✅ ENHANCED: Force logout with complete data clearing and loop prevention
const forceLogout = async () => {
  // ✅ Prevent multiple logout calls
  if (isLoggingOut) {
    return;
  }
  
  isLoggingOut = true;
  
  // Clear all auth data including persist
  await clearAllAuthData();
  
  // ✅ Dispatch logout action to Redux if available
  if (window.store) {
    try {
      window.store.dispatch({ type: 'auth/logout/fulfilled' });
    } catch (reduxError) {
    }
  }
  
  // ✅ ENHANCED: Smart redirect with loop prevention
  const currentPath = window.location.pathname;
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback'];
  const publicPaths = ['/privacy-policy', '/help', '/data-deletion', "/"];
  const isOnAuthPage = authPaths.some(path => currentPath.includes(path));
  const isOnPublicPage = publicPaths.some(path => currentPath.includes(path));
  
  // Only redirect if not already on auth page and not on public pages
  if (!isOnAuthPage && !isOnPublicPage) {
    
    // ✅ Single redirect without reload to prevent loops
    window.location.replace('/login');
  }
  
  // ✅ Reset logout flag after delay
  setTimeout(() => {
    isLoggingOut = false;
  }, 2000);
};

// ✅ Attach token on each request with Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip token check if already logging out
    if (isLoggingOut) {
      return config;
    }
    
    // Try localStorage first, then cookie
    let token = localStorage.getItem("token") || localStorage.getItem("authToken");
    
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

// ✅ ENHANCED: Global response error handling with immediate 401 clearing
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorStatus = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;
    
    
    // Skip logout if already in progress
    if (isLoggingOut) {
      return Promise.reject(error);
    }
    
    // 🔑 PayPal specific error handling - DON'T logout user
    if (originalRequest?.url?.includes('/paypal/')) {
      return Promise.reject(error);
    }
    
    // ✅ ENHANCED: Comprehensive token expiry detection
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
      errorMessage?.includes('Authentication failed') ||
      errorMessage?.includes('jwt expired') ||
      errorMessage?.includes('invalid token')
    );
    
    if (isTokenExpired) {
      await forceLogout();
    }
    else if (errorStatus === 400) {
      error.response.data.msg;
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
