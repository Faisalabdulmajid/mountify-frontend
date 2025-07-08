// Frontend utility untuk mengelola CSRF token
import axios from "axios";

class CSRFTokenManager {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  }

  // Get CSRF token dari server
  async getCSRFToken() {
    try {
      const response = await axios.get(`${this.baseURL}/api/csrf-token`, {
        withCredentials: true,
      });

      if (response.data && response.data.csrfToken) {
        this.token = response.data.csrfToken;
        this.tokenExpiry = Date.now() + 23 * 60 * 60 * 1000; // 23 hours

        // Set default header untuk semua request axios
        axios.defaults.headers.common["X-CSRF-Token"] = this.token;

        return this.token;
      }
    } catch (error) {
      console.error("Failed to get CSRF token:", error);
      throw error;
    }
  }

  // Check apakah token masih valid
  isTokenValid() {
    return this.token && this.tokenExpiry && Date.now() < this.tokenExpiry;
  }

  // Get token (refresh jika perlu)
  async getToken() {
    if (!this.isTokenValid()) {
      await this.getCSRFToken();
    }
    return this.token;
  }

  // Clear token
  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
    delete axios.defaults.headers.common["X-CSRF-Token"];
  }

  // Setup interceptor untuk auto-retry jika CSRF error
  setupInterceptor() {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (
          error.response?.status === 403 &&
          error.response?.data?.error?.includes("CSRF")
        ) {
          console.warn("CSRF token invalid, refreshing...");

          // Clear invalid token
          this.clearToken();

          // Get new token
          try {
            await this.getCSRFToken();

            // Retry original request
            const originalRequest = error.config;
            originalRequest.headers["X-CSRF-Token"] = this.token;

            return axios.request(originalRequest);
          } catch (refreshError) {
            console.error("Failed to refresh CSRF token:", refreshError);
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

// Export singleton instance
const csrfTokenManager = new CSRFTokenManager();

// Setup interceptor saat import
csrfTokenManager.setupInterceptor();

export default csrfTokenManager;

// Helper functions
export const getCSRFToken = () => csrfTokenManager.getToken();
export const clearCSRFToken = () => csrfTokenManager.clearToken();
export const initializeCSRF = () => csrfTokenManager.getCSRFToken();
