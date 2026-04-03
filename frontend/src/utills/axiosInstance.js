// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
  timeout: 300000,
});

const getTokenFromCookie = () => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
  return tokenCookie ? tokenCookie.split('=')[1] : null;
};

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

const clearAllAuthData = async () => {
  try {
    if (window.__PERSISTOR__) {
      await window.__PERSISTOR__.purge();
      await window.__PERSISTOR__.flush();
    }

    const keysToRemove = [
      "user",
      "token",
      "authToken",
      "userData",
      "subscribedArtists",
      "persist:root",
      "persist:auth",
      "persist:player",
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('persist:')) localStorage.removeItem(key);
    });

    localStorage.clear();
    sessionStorage.clear();
    clearAllCookies();
    delete axiosInstance.defaults.headers.common["Authorization"];

  } catch (error) {
    localStorage.clear();
    sessionStorage.clear();
    clearAllCookies();
  }
};

let isLoggingOut = false;

export const forceLogout = async () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  await clearAllAuthData();

  if (window.store) {
    try {
      window.store.dispatch({ type: 'auth/logout/fulfilled' });
    } catch (e) {}
  }

  const currentPath = window.location.pathname;
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback'];
  const publicPaths = ['/privacy-policy', '/contact-us', '/data-deletion', '/about-us', '/terms-and-conditions', '/'];
  const isOnAuthPage = authPaths.some(path => currentPath.includes(path));
  const isOnPublicPage = publicPaths.some(path => currentPath.includes(path));

  if (!isOnAuthPage && !isOnPublicPage) {
    window.location.replace('/login');
  }

  setTimeout(() => { isLoggingOut = false; }, 2000);
};

// ✅ Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (isLoggingOut) return config;

    let token = localStorage.getItem("token") || localStorage.getItem("authToken");
    if (!token) {
      token = getTokenFromCookie();
      if (token) localStorage.setItem('token', token);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (isLoggingOut) return Promise.reject(error);

    // PayPal routes pe logout mat karo
    if (error.config?.url?.includes('/paypal/')) return Promise.reject(error);

    // Network error — server band ya internet cut, logout nahi karna
    if (!error.response) return Promise.reject(error);

    const status = error.response?.status;

    // ✅ 401 — sirf tab logout karo jab token exist karta ho
    if (status === 401) {
      const token = localStorage.getItem("token") || getTokenFromCookie();

      // Token tha hi nahi — silently fail, redirect nahi
      if (!token) return Promise.reject(error);

      // Token tha but server ne reject kiya — expired/invalid, logout karo
      await forceLogout();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;