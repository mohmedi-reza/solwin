import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { toast } from "react-toastify";
import { AuthService } from "./auth.service";
import { AuthError } from "../types/auth.interface";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://api-poker-sol.bestudios.dev";

// Extend the AxiosRequestConfig to include _retry property
interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
  requestConfig: RetryableRequest;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout
  withCredentials: true, // Important for cookie handling
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
const requestQueue: QueueItem[] = [];

const processQueue = (error: Error | null) => {
  requestQueue.forEach((queueItem) => {
    if (error) {
      queueItem.reject(error);
    } else {
      // Retry the request with new token
      const token = AuthService.getAccessToken();
      if (token) {
        queueItem.requestConfig.headers.Authorization = `Bearer ${token}`;
        queueItem.resolve(apiClient(queueItem.requestConfig));
      } else {
        queueItem.reject(new Error("No token available"));
      }
    }
  });
  requestQueue.length = 0; // Clear the queue
};

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    // Log request for debugging
    console.log("API Request:", {
      url: config.url,
      method: config.method,
      data: config.data,
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor
apiClient.interceptors.request.use(
  (config: RetryableRequest) => {
    const token = AuthService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: Error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("API Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response.data; // Return only the data
  },
  async (error: AxiosError<AuthError>) => {
    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    const originalRequest = error.config as RetryableRequest;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If token refresh is in progress, queue the request
        return new Promise((resolve, reject) => {
          requestQueue.push({
            resolve,
            reject,
            requestConfig: originalRequest,
          });
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const refreshed = await AuthService.refreshTokens();
        if (refreshed) {
          processQueue(null); // Process queue with success
          const token = AuthService.getAccessToken();
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }
        }
        AuthService.setAuthState('unauthenticated');
        throw new Error("Token refresh failed");
      } catch (refreshError) {
        processQueue(refreshError as Error); // Process queue with error
        AuthService.clearTokens();
        AuthService.setAuthState('unauthenticated');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Improve error handling
    if (error.response?.status === 500) {
      toast.error("Server error. Please try again later.");
    } else if (error.code === 'ECONNABORTED') {
      toast.error("Request timeout. Please check your connection.");
    } else if (!error.response) {
      toast.error("Network error. Please check your connection.");
    }

    return Promise.reject(error);
  }
);

// Create a public instance without auth interceptors
export const createPublicClient = () => {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

export default apiClient;
