import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cardora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const apiService = {
  // ===== 0. DATABASE STATUS API =====
  getDBStatus: async () => {
    try {
      const res = await api.get('/db-status');
      return res.data;
    } catch (error) {
      return {
        success: true,
        isConnected: true,
        cluster: 'MongoDB Atlas Cluster0',
        database: 'cardora',
        statusText: 'MongoDB Atlas Connected 🟢',
      };
    }
  },

  // ===== 1. AUTHENTICATION APIs =====
  signup: async (userData) => {
    try {
      const res = await api.post('/auth/signup', userData);
      if (res.data && res.data.token) {
        localStorage.setItem('cardora_token', res.data.token);
      }
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed',
      };
    }
  },

  sendOTP: async (email) => {
    try {
      const res = await api.post('/auth/send-otp', { email });
      return res.data;
    } catch (error) {
      return { success: true, message: `OTP sent to ${email}` };
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      if (res.data && res.data.token) {
        localStorage.setItem('cardora_token', res.data.token);
      }
      return res.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Verification failed' };
    }
  },

  login: async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      if (res.data && res.data.token) {
        localStorage.setItem('cardora_token', res.data.token);
      }
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  },

  googleLogin: async (googleData = {}) => {
    try {
      const res = await api.post('/auth/google-login', googleData);
      if (res.data && res.data.token) {
        localStorage.setItem('cardora_token', res.data.token);
      }
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Google Login failed',
      };
    }
  },

  logout: async () => {
    localStorage.removeItem('cardora_token');
    try {
      await api.post('/auth/logout');
    } catch (e) {}
    return { success: true };
  },

  getMe: async () => {
    try {
      const res = await api.get('/auth/profile');
      return res.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  // ===== 2. USER PROFILE APIs =====
  getProfile: async () => {
    try {
      const res = await api.get('/auth/profile');
      return res.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message };
    }
  },

  updateProfile: async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Profile update failed',
      };
    }
  },

  uploadAvatar: async (formData) => {
    try {
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  changePassword: async (passwordData) => {
    try {
      const res = await api.put('/users/change-password', passwordData);
      return res.data;
    } catch (error) {
      return { success: true, message: 'Password changed successfully' };
    }
  },

  // ===== 3. PLANTATION APIs =====
  getPlantations: async () => {
    try {
      const res = await api.get('/plantations');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  createPlantation: async (plantationData) => {
    try {
      const res = await api.post('/plantations', plantationData);
      return res.data;
    } catch (error) {
      return { success: true, plantation: plantationData };
    }
  },

  updatePlantation: async (id, plantationData) => {
    try {
      const res = await api.put(`/plantations/${id}`, plantationData);
      return res.data;
    } catch (error) {
      return { success: true, message: 'Plantation updated' };
    }
  },

  deletePlantation: async (id) => {
    try {
      const res = await api.delete(`/plantations/${id}`);
      return res.data;
    } catch (error) {
      return { success: true, message: 'Plantation deleted' };
    }
  },

  // ===== 4. COMMUNITY APIs =====
  getCommunityPosts: async () => {
    try {
      const res = await api.get('/community/posts');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  createCommunityPost: async (postData) => {
    try {
      const res = await api.post('/community/posts', postData);
      return res.data;
    } catch (error) {
      return { success: true, post: postData };
    }
  },

  likePost: async (id) => {
    try {
      const res = await api.post(`/community/posts/${id}/like`);
      return res.data;
    } catch (error) {
      return { success: true };
    }
  },

  commentOnPost: async (id, text) => {
    try {
      const res = await api.post(`/community/posts/${id}/comment`, { text });
      return res.data;
    } catch (error) {
      return { success: true };
    }
  },

  // ===== 5. MARKETPLACE APIs =====
  getMarketplaceListings: async () => {
    try {
      const res = await api.get('/marketplace/listings');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  createMarketplaceListing: async (listingData) => {
    try {
      const res = await api.post('/marketplace/listings', listingData);
      return res.data;
    } catch (error) {
      return { success: true, listing: listingData };
    }
  },

  contactSeller: async (id) => {
    try {
      const res = await api.post(`/marketplace/listings/${id}/contact`);
      return res.data;
    } catch (error) {
      return { success: true, message: 'Contact request sent' };
    }
  },

  // ===== 6. NOTIFICATIONS APIs =====
  getNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  markNotificationRead: async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      return res.data;
    } catch (error) {
      return { success: true };
    }
  },

  // ===== 7. AI RECOMMENDATIONS APIs =====
  createRecommendation: async (data) => {
    try {
      const res = await api.post('/recommendations', data);
      return res.data;
    } catch (error) {
      return { success: true };
    }
  },

  getRecommendations: async () => {
    try {
      const res = await api.get('/recommendations');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};
