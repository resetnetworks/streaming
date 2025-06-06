// src/utils/axiosInstance.js
import axios from "axios";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api", // change as needed
  withCredentials: true, // for sending cookies (optional)
});

// Request interceptor to attach token if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or from Redux state if you prefer

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle global errors here like token expiration, etc.
    if (error.response?.status === 401) {
      console.warn("Unauthorized — maybe redirect to login.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
