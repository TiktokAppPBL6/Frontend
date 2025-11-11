import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';

const BASE_URL = 'http://localhost:8000/api/v1';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're in fallback mode
let isFallbackMode = false;

export const setFallbackMode = (enabled: boolean) => {
  isFallbackMode = enabled;
  if (enabled) {
    console.warn('🔄 API Fallback Mode: Using mock data');
    toast.error('Không thể kết nối server. Đang dùng dữ liệu tạm.', {
      duration: 5000,
      id: 'fallback-mode',
    });
  }
};

export const isFallback = () => isFallbackMode;

// Request interceptor - Add auth token
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Request with token:', config.url, token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ Request without token:', config.url);
    }
    
    // If sending FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      console.log('📦 Detected FormData, removing Content-Type header');
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and fallback
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Network errors or server unreachable
    if (
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED' ||
      error.message.includes('Network Error') ||
      !error.response
    ) {
      if (!isFallbackMode) {
        setFallbackMode(true);
      }
      // Let the individual API handlers deal with mock data
      return Promise.reject({
        ...error,
        shouldUseMock: true,
      });
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Allow certain calls to opt-out of global logout on 401
      const cfg: any = error.config || {};
      const skipAuthRedirect = cfg.headers?.['X-Skip-Auth-Redirect'] === '1' || cfg.skipAuthRedirect === true;
      if (!skipAuthRedirect) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      toast.error('Bạn không có quyền thực hiện hành động này.');
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      toast.error('Không tìm thấy tài nguyên.');
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      toast.error('Lỗi server. Vui lòng thử lại sau.');
    }

    return Promise.reject(error);
  }
);

// Helper to check if error should use mock
export const shouldUseMock = (error: any): boolean => {
  return error?.shouldUseMock === true || isFallbackMode;
};

export default axiosClient;
