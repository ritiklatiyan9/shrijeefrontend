// api/userService.js
import axios from 'axios';

const API_BASE_URL = 'https://shreejeebackend.onrender.com/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/users/refresh-token`, {}, {
          withCredentials: true
        });

        if (refreshResponse.data?.data?.accessToken) {
          localStorage.setItem('token', refreshResponse.data.data.accessToken);
          // Retry the original request
          error.config.headers.Authorization = `Bearer ${refreshResponse.data.data.accessToken}`;
          return apiClient.request(error.config);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// User Profile APIs
export const userService = {
  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  // Update profile with image
  updateProfile: async (formData) => {
    const response = await apiClient.put('/users/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Correctly set for FormData
      },
    });
    return response.data;
  },

  // Update profile (JSON only)
  updateProfileJSON: async (profileData) => {
    const response = await apiClient.put('/users/update', profileData);
    return response.data;
  },

  // Upload profile image
  uploadProfileImage: async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await apiClient.post('/users/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete profile image
  deleteProfileImage: async () => {
    const response = await apiClient.delete('/users/delete-profile-image');
    return response.data;
  },

  // Update bank details
  updateBankDetails: async (bankData) => {
    const response = await apiClient.put('/users/bank', bankData);
    return response.data;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await apiClient.put('/users/change-password', passwordData);
    return response.data;
  },

  // Get referrals
  getMyReferrals: async () => {
    const response = await apiClient.get('/users/my-referrals');
    return response.data;
  },

  // Get binary tree
  getBinaryTree: async (maxDepth = 10) => {
    const response = await apiClient.get(`/users/binary-tree?maxDepth=${maxDepth}`);
    return response.data;
  },

  // Get dashboard data
  getDashboard: async () => {
    const response = await apiClient.get('/users/dashboard');
    return response.data;
  },

  // KYC operations
  uploadKYC: async (kycData) => {
    const response = await apiClient.post('/users/kyc', kycData);
    return response.data;
  },

  getKYCStatus: async () => {
    const response = await apiClient.get('/users/kyc/status');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/users/logout');
    localStorage.clear();
    return response.data;
  },
};

export default userService;