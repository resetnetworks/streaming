// ✅ COMPLETE FIXED VERSION
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  withCredentials: true, // ✅ Cookies always sent
  timeout: 300000,
});

// ✅ All your existing helper functions (SAME)
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
    
    const keysToRemove = ["user", "token", "authToken", "userData", "subscribedArtists", "persist:root", "persist:auth", "persist:player"];
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

const forceLogout = async () => {
  if (isLoggingOut) return;
  isLoggingOut = true;
  
  await clearAllAuthData();
  
  if (window.store) {
    try {
      window.store.dispatch({ type: 'auth/logout/fulfilled' });
    } catch (reduxError) {}
  }
  
  const currentPath = window.location.pathname;
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/callback'];
  const publicPaths = ['/privacy-policy', '/contact-us', '/data-deletion', '/about-us', 'terms-and-conditions', "/"];
  const isOnAuthPage = authPaths.some(path => currentPath.includes(path));
  const isOnPublicPage = publicPaths.some(path => currentPath.includes(path));
  
  if (!isOnAuthPage && !isOnPublicPage) {
    window.location.replace('/login');
  }
  
  setTimeout(() => { isLoggingOut = false; }, 2000);
};

// ✅ FIXED REQUEST INTERCEPTOR - Monetize = NO Bearer
axiosInstance.interceptors.request.use(
  (config) => {
    if (isLoggingOut) return config;
    
    // ✅ MONETIZE ROUTES = COOKIE ONLY
    const monetizeRoutes = ['/v2/monetize', '/monetize', '/artist/', '/monetization/'];
    const isMonetizeRoute = monetizeRoutes.some(route => config.url?.includes(route));
    
    console.log('🚀 [AXIOS]', config.method?.toUpperCase(), config.url);
    console.log('💰 [MONETIZE ROUTE]', isMonetizeRoute);
    
    if (isMonetizeRoute) {
      console.log('🍪 [MONETIZE] Cookie-only (No Bearer)');
      return config; // ✅ withCredentials: true sends cookies
    }
    
    // ✅ OTHER ROUTES = Bearer token (your existing logic)
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

// ✅ FIXED RESPONSE INTERCEPTOR - NO LOGOUT ON PAYPAL/MONETIZE
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const errorStatus = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message;
    
    if (isLoggingOut) return Promise.reject(error);
    
    // ✅ SKIP LOGOUT: PayPal + Monetize + 400/422 errors
    const skipRoutes = ['/paypal/', '/v2/monetize', '/monetize', '/artist/', 'paypal.com'];
    const skipStatus = [400, 422]; // PayPal validation errors
    
    const shouldSkipLogout = skipRoutes.some(route => 
        originalRequest?.url?.includes(route)
      ) || skipStatus.includes(errorStatus) ||
      errorMessage?.toLowerCase().includes('paypal') ||
      errorMessage?.toLowerCase().includes('validation');
    
    if (shouldSkipLogout) {
      console.log('⚠️ [SKIP LOGOUT]', originalRequest?.url, errorStatus);
      return Promise.reject(error);
    }
    
    // ✅ ONLY REAL 401s trigger logout
    const isTokenExpired = errorStatus === 401;
    if (isTokenExpired) {
      console.log('🚪 [REAL LOGOUT] 401 detected');
      await forceLogout();
    }
    
    return Promise.reject(error);
  }
);

export { getTokenFromCookie, clearAllCookies };
export default axiosInstance;
