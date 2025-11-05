// AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AuthContext = createContext();

const API_BASE_URL = 'http://13.127.229.155:5000/api/v1/users';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for handling cookies if applicable
});

// Add a request interceptor to include the access token in the Authorization header
apiClient.interceptors.request.use(
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

// Add a response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        const response = await axios.post(`${API_BASE_URL}/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // If refresh fails, log the user out
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Optionally clear user state here too
        // setUser(null);
        window.location.href = '/login'; // Redirect to login
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigate hook

  const register = async (userData) => {
    try {
      const response = await apiClient.post('/register', userData);
      const { data } = response.data;
      console.log("Registration successful:", data);
      // Note: The API might not log the user in immediately after registration
      // You might need a separate login call or redirect to login/KYC page
      // For mandatory KYC, redirect to KYC page after successful registration
      // navigate('/kyc'); // Example redirect after registration
      return { success: true, user: data };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiClient.post('/login', credentials);
      const { data } = response.data;
      const { user: userData, accessToken, refreshToken } = data;

      // Decode the access token to get user details if embedded
      // Or use the user object returned from the login API
      // Assuming the API returns user details along with tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setUser(userData);
      console.log("Login successful:", userData);
      navigate('/'); // Redirect after successful login
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/logout');
      console.log("Logout API called successfully");
    } catch (error) {
      console.error('Logout API error (proceeding with local logout):', error);
      // Still clear local storage even if backend logout fails
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      navigate('/login'); // Redirect to login after logout
    }
  };

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        // Verify token is not expired first
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          console.log("Token expired, clearing storage");
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setLoading(false);
          return;
        }

        // Token is valid, fetch user profile to confirm session
        const response = await apiClient.get('/me');
        setUser(response.data.data);
      } catch (error) {
        console.error('Auth status check failed:', error);
        // If token is invalid or fetch fails, clear storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      }
    }
    setLoading(false); // Set loading to false after check
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    register,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};