/**
 * API Configuration
 * Centralized API URL configuration
 * 
 * IMPORTANT: This is the ONLY place where API URLs should be configured.
 * All other files MUST import from this file.
 */

// Use environment variable with fallback to localhost
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://toptop-backend-api.azurewebsites.net/';
export const API_VERSION = 'v1';

// Full API URL (same as base URL since endpoints include /api/v1)
export const API_FULL_URL = `${API_BASE_URL}`;

// WebSocket URL (convert http/https to ws/wss)
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

// Export for use in HTML files or external contexts
if (typeof window !== 'undefined') {
  (window as any).__API_CONFIG__ = {
    API_BASE_URL,
    API_VERSION,
    API_FULL_URL,
    WS_BASE_URL,
  };
}
