// lib/axios.ts
import axios from "axios";

// IMPORTANT: Point to local Next.js API routes, not backend directly
export const axiosInstance = axios.create({
  baseURL: "/api", // This hits your Next.js API proxy
  // DON'T set Content-Type here - let it be dynamic based on request
  withCredentials: true, // Send cookies
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🚀 [Frontend] ${config.method?.toUpperCase()} ${config.url}`);
    
    // CRITICAL: Remove Content-Type for FormData to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('📤 Sending FormData - browser will set Content-Type with boundary');
    } else {
      // For non-FormData requests, ensure JSON content type
      config.headers['Content-Type'] = 'application/json';
    }
    
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
    console.error('Error details:', error.response?.data);
    
    // If 401, could trigger token refresh here
    if (error.response?.status === 401) {
      console.log('[Frontend] Unauthorized - might need to refresh token or redirect to login');
    }
    
    return Promise.reject(error);
  }
);
