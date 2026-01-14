// api/matchingIncomeService.js - Complete API Service
import axios from 'axios';

const API_BASE_URL = 'https://shreejeebackend.onrender.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/matching-income`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // ✅ Fixed: Changed from 'token' to 'accessToken'
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
 * Get user's matching income records
 * @param {string} userId - User ID
 * @param {object} filters - Filter options
 * @returns {Promise}
 */
export const fetchUserMatchingIncome = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.incomeType) params.append('incomeType', filters.incomeType);
    if (filters.status) params.append('status', filters.status);
    if (filters.legType) params.append('legType', filters.legType);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = `/user/${userId}${queryString ? `?${queryString}` : ''}`;

    return await api.get(url);
  } catch (error) {
    console.error('Error fetching user matching income:', error);
    return {
      success: false,
      message: error.message,
      data: [],
      summary: null
    };
  }
};

/**
 * Get income details for a specific plot
 * @param {string} plotId - Plot ID
 * @returns {Promise}
 */
export const fetchPlotIncomeDetails = async (plotId) => {
  try {
    return await api.get(`/plot/${plotId}`);
  } catch (error) {
    console.error('Error fetching plot income details:', error);
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
};

/**
 * Get income summary grouped by time period
 * @param {string} userId - User ID
 * @param {object} options - Summary options
 * @returns {Promise}
 */
export const fetchIncomeSummary = async (userId, options = {}) => {
  try {
    const params = new URLSearchParams();

    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    if (options.groupBy) params.append('groupBy', options.groupBy);

    const queryString = params.toString();
    const url = `/summary/${userId}${queryString ? `?${queryString}` : ''}`;

    return await api.get(url);
  } catch (error) {
    console.error('Error fetching income summary:', error);
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
};

/**
 * Get team income records (all downline members)
 * @param {string} userId - User ID
 * @param {object} filters - Filter options
 * @returns {Promise}
 */
export const fetchTeamMatchingIncome = async (userId, filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.incomeType) params.append('incomeType', filters.incomeType);
    if (filters.status) params.append('status', filters.status);
    if (filters.legType) params.append('legType', filters.legType);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.memberId) params.append('memberId', filters.memberId);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const url = `/team/${userId}${queryString ? `?${queryString}` : ''}`;

    return await api.get(url);
  } catch (error) {
    console.error('Error fetching team matching income:', error);
    return {
      success: false,
      message: error.message,
      data: [],
      summary: {}
    };
  }
};

/* ============================================================================ */
/* 🔶 ADMIN API METHODS                                                        */
/* ============================================================================ */

/**
 * Get all income records with advanced filtering (Admin Only)
 * @param {object} filters - Filter options
 * @returns {Promise}
 */
export const getAllIncomeRecords = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.incomeType) params.append('incomeType', filters.incomeType);
    if (filters.status) params.append('status', filters.status);
    if (filters.legType) params.append('legType', filters.legType);
    if (filters.eligibleOnly !== undefined) params.append('eligibleOnly', filters.eligibleOnly);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = `/admin/all${queryString ? `?${queryString}` : ''}`;

    return await api.get(url);
  } catch (error) {
    console.error('Error fetching all income records:', error);
    return {
      success: false,
      message: error.message,
      data: []
    };
  }
};

/**
 * Get dashboard statistics (Admin Only)
 * @returns {Promise}
 */
export const getDashboardStats = async () => {
  try {
    return await api.get('/admin/stats');
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};

/**
 * Approve a single income record (Admin Only)
 * @param {string} recordId - Income record ID
 * @param {string} adminId - Admin user ID
 * @param {string} notes - Optional approval notes
 * @returns {Promise}
 */
export const approveMatchingIncome = async (recordId, adminId, notes = '') => {
  try {
    return await api.patch(`/admin/approve/${recordId}`, {
      adminId,
      notes
    });
  } catch (error) {
    console.error('Error approving income:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Bulk approve multiple income records (Admin Only)
 * @param {object} data - { adminId, recordIds, notes }
 * @returns {Promise}
 */
export const bulkApproveIncome = async (data) => {
  try {
    return await api.post('/admin/bulk-approve', data);
  } catch (error) {
    console.error('Error bulk approving income:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Reject an income record (Admin Only)
 * @param {string} recordId - Income record ID
 * @param {object} data - { adminId, reason }
 * @returns {Promise}
 */
export const rejectMatchingIncome = async (recordId, data) => {
  try {
    return await api.patch(`/admin/reject/${recordId}`, data);
  } catch (error) {
    console.error('Error rejecting income:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Update income status to credited/paid (Admin Only)
 * @param {string} recordId - Income record ID
 * @param {object} data - { status, paymentDetails }
 * @returns {Promise}
 */
export const updateIncomeStatus = async (recordId, data) => {
  try {
    return await api.patch(`/admin/status/${recordId}`, data);
  } catch (error) {
    console.error('Error updating income status:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/* ============================================================================ */
/* 📊 UTILITY METHODS                                                          */
/* ============================================================================ */

/**
 * Export income records to CSV
 * @param {object} filters - Filter options
 * @returns {Promise}
 */
export const exportIncomeRecords = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });

    const queryString = params.toString();
    const url = `/admin/export${queryString ? `?${queryString}` : ''}`;

    const response = await axios.get(`${API_BASE_URL}/api/matching-income${url}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // ✅ Fixed: Changed from 'token' to 'accessToken'
      },
      responseType: 'blob'
    });

    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `income-records-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    return {
      success: true,
      message: 'Records exported successfully'
    };
  } catch (error) {
    console.error('Error exporting records:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Calculate potential income for a user
 * @param {string} userId - User ID
 * @returns {Promise}
 */
export const calculatePotentialIncome = async (userId) => {
  try {
    return await api.get(`/user/${userId}/potential`);
  } catch (error) {
    console.error('Error calculating potential income:', error);
    return {
      success: false,
      message: error.message,
      data: null
    };
  }
};

export default {
  // User Methods
  fetchUserMatchingIncome,
  fetchPlotIncomeDetails,
  fetchIncomeSummary,
  fetchTeamMatchingIncome,

  // Admin Methods
  getAllIncomeRecords,
  getDashboardStats,
  approveMatchingIncome,
  bulkApproveIncome,
  rejectMatchingIncome,
  updateIncomeStatus,

  // Utility Methods
  exportIncomeRecords,
  calculatePotentialIncome
};