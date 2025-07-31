import axios from "axios";

// ✅ Enhanced axios instance with better environment handling
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 
           import.meta.env.VITE_API_URL || 
           "http://localhost:4000/api", // ✅ Multiple fallbacks
  withCredentials: true,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Enhanced helper function to get token from cookie
const getTokenFromCookie = () => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split('; ');
  const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
  
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  return null;
};

// ✅ Enhanced request interceptor with comprehensive token management
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from multiple sources
    const tokenFromStorage = localStorage.getItem('token');
    const tokenFromCookie = getTokenFromCookie();
    const token = tokenFromStorage || tokenFromCookie;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      
      // Sync tokens - if cookie has token but localStorage doesn't, store it
      if (tokenFromCookie && !tokenFromStorage) {
        localStorage.setItem('token', tokenFromCookie);
        console.log('🔄 Syncing token from cookie to localStorage');
      }
    }
    
    // Ensure withCredentials is set for cookie-based auth
    config.withCredentials = true;
    
    // Development logging
    if (import.meta.env.DEV) {
      console.log('🌐 API Request:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        tokenSource: tokenFromStorage ? 'localStorage' : tokenFromCookie ? 'cookie' : 'none',
        baseURL: config.baseURL,
        withCredentials: config.withCredentials
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Enhanced response interceptor with better error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Development logging
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        hasData: !!response.data
      });
    }
    
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.warn("🚫 Unauthorized — clearing auth data");
      
      // Clear auth data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Clear auth cookies
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      
      // Don't redirect if already on auth pages
      const currentPath = window.location.pathname;
      const authPaths = ['/login', '/register', '/forgot-password'];
      const isOnAuthPage = authPaths.some(path => currentPath.includes(path));
      
      if (!isOnAuthPage) {
        // Use setTimeout to avoid navigation during request
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ✅ Environment validation on module load
if (import.meta.env.DEV) {
  console.log('🔧 Axios Instance Configuration:', {
    baseURL: axiosInstance.defaults.baseURL,
    timeout: axiosInstance.defaults.timeout,
    withCredentials: axiosInstance.defaults.withCredentials,
    environment: import.meta.env.MODE,
    availableEnvVars: {
      VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'Missing',
      VITE_API_URL: import.meta.env.VITE_API_URL || 'Missing'
    }
  });
}

export default axiosInstance;
