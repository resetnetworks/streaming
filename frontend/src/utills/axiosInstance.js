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

// ✅ Attach token on each request
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

    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global response error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    if (error.response?.status === 401) {
      console.warn("🚫 Unauthorized — clearing auth data");
      
      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Don't redirect if already on auth pages
      const currentPath = window.location.pathname;
      const authPaths = ['/login', '/register', '/forgot-password'];
      const isOnAuthPage = authPaths.some(path => currentPath.includes(path));
      
      if (!isOnAuthPage) {
        window.location.href = '/login';
      }
    }

    else if (error.response?.status === 400) {
      error.message = "User already exists. Please try logging in.";
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
