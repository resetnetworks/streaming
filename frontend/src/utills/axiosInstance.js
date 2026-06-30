// src/utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true,
  timeout: 10000,
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
    if (window.queryClient) {
      window.queryClient.clear();
    }
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
// ✅ Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    if (isLoggingOut) return config;
    
    // Inject active workspace ID if present in localStorage
    if (typeof window !== 'undefined') {
      const activeWorkspaceId = localStorage.getItem("activeWorkspaceId");
      if (activeWorkspaceId) {
        config.headers["x-workspace-id"] = activeWorkspaceId;
      }
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

    if (error.config?.url?.includes('/paypal/')) return Promise.reject(error);

    if (!error.response) return Promise.reject(error);

    const status = error.response?.status;
    const code = error.response?.data?.code; // ✅ NEW: code check karo

    // ✅ NEW: ROLE_CHANGED — modal show karo, logout mat karo abhi
    if (status === 401 && code === "ROLE_CHANGED") {
      if (window.store) {
        try {
          const { setRoleUpdateModal } = await import("../features/auth/authSlice");
          window.store.dispatch(setRoleUpdateModal(true));
        } catch (e) {}
      }
      return Promise.reject(error); // ✅ aage propagate mat karo logout tak
    }

    // ✅ 401 — normal logout (ROLE_CHANGED wala upar handle ho gaya)
    if (status === 401) {
      const token = localStorage.getItem("token") || getTokenFromCookie();
      if (!token) return Promise.reject(error);
      await forceLogout();
      return Promise.reject(error);
    }

    // ✅ 403 — sirf artist routes pe logout
    if (status === 403) {
      const isArtistRoute =
        error.config?.url?.includes('/artist/') ||
        error.config?.url?.includes('/v2/artist/');

      if (isArtistRoute) {
        await forceLogout();
        return Promise.reject(error);
      }
    }

    if (status === 404) {
      const isUserNotFound =
        error.response?.data?.message?.toLowerCase().includes('user not found') ||
        error.response?.data?.code === 'USER_NOT_FOUND';

      if (isUserNotFound) {
        await forceLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;