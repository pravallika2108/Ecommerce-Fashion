// lib/axios.ts
import axios from "axios";

// IMPORTANT: Point to local Next.js API routes, not backend directly
export const axiosInstance = axios.create({
  baseURL: "/api", // This hits your Next.js API proxy
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 [Frontend] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[Frontend] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ [Frontend] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ [Frontend] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`);
    
    // If 401, could trigger token refresh here
    if (error.response?.status === 401) {
      console.log('[Frontend] Unauthorized - might need to refresh token or redirect to login');
    }
    
    return Promise.reject(error);
  }
);
