// api/legBalanceService.js - Leg Balance & Carry-Forward API Service
import axios from 'axios';

const API_BASE_URL ='https://shreejeebackend.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/leg-balance`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (Unauthorized) - Token might be expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/api/v1/users/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Store new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
        
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

/* ============================================================================ */
/* 🔷 USER API METHODS                                                         */
/* ============================================================================ */

/**
 * Get user's leg balance with detailed unmatched sales
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const fetchUserLegBalance = async (userId) => {
  try {
    return await api.get(`/${userId}`);
  } catch (error) {
    console.error('Error fetching leg balance:', error);
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};

/**
 * Get user's leg balance summary (lightweight)
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const fetchUserLegBalanceSummary = async (userId) => {
  try {
    return await api.get(`/${userId}/summary`);
  } catch (error) {
    console.error('Error fetching leg balance summary:', error);
    return {
      success: false,
      message: error.message,
      data: {
        leftLeg: { totalSales: 0, availableBalance: 0 },
        rightLeg: { totalSales: 0, availableBalance: 0 },
        totalMatchedAmount: 0,
        carryForward: { leg: 'none', amount: 0 }
      }
    };
  }
};

/**
 * Get detailed unmatched sales for a user
 * @param {string} userId - User ID
 * @param {string} leg - 'left', 'right', or 'both'
 * @returns {Promise}
 */
export const fetchUnmatchedSales = async (userId, leg = 'both') => {
  try {
    const params = new URLSearchParams();
    if (leg) params.append('leg', leg);
    
    const queryString = params.toString();
    const url = `/${userId}/unmatched${queryString ? `?${queryString}` : ''}`;
    
    return await api.get(url);
  } catch (error) {
    console.error('Error fetching unmatched sales:', error);
    return {
      success: false,
      message: error.message,
      data: {
        unmatchedSales: [],
        summary: {
          leftCount: 0,
          leftAmount: 0,
          rightCount: 0,
          rightAmount: 0,
          totalUnmatched: 0
        }
      }
    };
  }
};

/* ============================================================================ */
/* 🔶 ADMIN API METHODS                                                        */
/* ============================================================================ */

/**
 * Get all leg balances (Admin Only)
 * @param {object} options - Filter options
 * @returns {Promise}
 */
export const fetchAllLegBalances = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const queryString = params.toString();
    const url = `/admin/all${queryString ? `?${queryString}` : ''}`;
    
    return await api.get(url);
  } catch (error) {
    console.error('Error fetching all leg balances:', error);
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
};

export default {
  fetchUserLegBalance,
  fetchUserLegBalanceSummary,
  fetchUnmatchedSales,
  fetchAllLegBalances
};