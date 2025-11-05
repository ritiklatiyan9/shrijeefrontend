// api/matchingIncomeService.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1/';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Fetch current month matching income for a user
export const fetchCurrentMonthMatchingIncome = async (userId) => {
  try {
    const now = new Date();
    const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const response = await api.get(`/matching-income/user/${userId}`, {
      params: {
        cycleStartDate: cycleStart.toISOString().split('T')[0],
        cycleEndDate: cycleEnd.toISOString().split('T')[0],
        page: 1,
        limit: 100 // Get more records
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching current month matching income:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch matching income',
      data: [],
      summary: null
    };
  }
};

// Fetch user matching income with filters
export const fetchUserMatchingIncome = async (userId, filters = {}) => {
  try {
    const params = {
      page: 1,
      limit: 100,
      ...filters
    };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });
    
    const response = await api.get(`/matching-income/user/${userId}`, { params });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user matching income:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch matching income',
      data: [],
      summary: null
    };
  }
};

// Fetch team matching income
export const fetchTeamMatchingIncome = async (userId, filters = {}) => {
  try {
    const params = { ...filters };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });
    
    const response = await api.get(`/matching-income/team/${userId}`, { params });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching team matching income:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch team matching income',
      data: { personal: [], team: [] },
      summary: null
    };
  }
};

// Calculate matching income (Admin only)
export const calculateMatchingIncome = async () => {
  try {
    const response = await api.post('/matching-income/calculate');
    return response.data;
  } catch (error) {
    console.error('Error calculating matching income:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to calculate matching income'
    };
  }
};

// Fetch matching income for a specific cycle (Admin)
export const fetchCycleMatchingIncome = async (cycleStart, cycleEnd, filters = {}) => {
  try {
    const params = {
      cycleStartDate: cycleStart,
      cycleEndDate: cycleEnd,
      page: 1,
      limit: 100,
      ...filters
    };
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key];
      }
    });
    
    const response = await api.get('/matching-income/cycle', { params });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching cycle matching income:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch cycle matching income',
      data: [],
      summary: null
    };
  }
};

// Approve matching income record (Admin only)
export const approveMatchingIncome = async (recordId, adminId) => {
  try {
    const response = await api.patch(`/matching-income/approve/${recordId}`, { adminId });
    return response.data;
  } catch (error) {
    console.error('Error approving matching income:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to approve matching income'
    };
  }
};

export default api;