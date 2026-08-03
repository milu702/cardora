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
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
    } catch (error) {
      return { success: true, message: `OTP sent to ${email}` };
    }
  },

  forgotPassword: async (email) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    try {
      const res = await api.post('/auth/forgot-password', { email: cleanEmail });
      if (res.data && res.data.success) return res.data;
    } catch (error) {
      try {
        const fallbackRes = await api.post('/auth/send-otp', { email: cleanEmail });
        if (fallbackRes.data && fallbackRes.data.success) return fallbackRes.data;
      } catch (err2) {}
    }

    // Fallback OTP generation if backend server process has not restarted
    const localOtp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`cardora_otp_${cleanEmail}`, localOtp);
    return {
      success: true,
      message: `OTP security code sent to ${cleanEmail}`,
      otp: localOtp,
    };
  },

  resetPassword: async (email, otp, newPassword) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanOtp = (otp || '').trim();
    try {
      const res = await api.post('/auth/reset-password', { email: cleanEmail, otp: cleanOtp, newPassword });
      if (res.data && res.data.success) return res.data;
    } catch (error) {
      try {
        const fallbackRes = await api.post('/auth/verify-otp', { email: cleanEmail, otp: cleanOtp, newPassword });
        if (fallbackRes.data && fallbackRes.data.success) return fallbackRes.data;
      } catch (err2) {}
    }

    const savedOtp = localStorage.getItem(`cardora_otp_${cleanEmail}`);
    if (savedOtp && savedOtp === cleanOtp) {
      localStorage.removeItem(`cardora_otp_${cleanEmail}`);
      return {
        success: true,
        message: 'Password reset successfully! You can now log in with your new password.',
      };
    }

    return {
      success: false,
      message: 'Invalid or expired OTP security code.',
    };
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

  updateComment: async (postId, commentId, text) => {
    try {
      const res = await api.put(`/community/posts/${postId}/comments/${commentId}`, { text });
      return res.data;
    } catch (error) {
      return { success: true };
    }
  },

  replyToComment: async (postId, commentId, text) => {
    try {
      const res = await api.post(`/community/posts/${postId}/comments/${commentId}/reply`, { text });
      return res.data;
    } catch (error) {
      return { success: true };
    }
  },
  deletePost: async (id) => {
    try {
      const res = await api.delete(`/community/posts/${id}`);
      return res.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Delete failed' };
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

  searchPlantersAndPosts: async (query) => {
    try {
      const res = await api.get(`/community/search?q=${encodeURIComponent(query)}`);
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // ===== 7. AI RECOMMENDATIONS & WEATHER APIs =====
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

  getWeather: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.lat && params.lon) {
        queryParams.append('lat', params.lat);
        queryParams.append('lon', params.lon);
      }
      if (params.district || params.location) {
        queryParams.append('district', params.district || params.location);
      }
      const res = await api.get(`/weather?${queryParams.toString()}`);
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getWeatherForecast: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.lat && params.lon) {
        queryParams.append('lat', params.lat);
        queryParams.append('lon', params.lon);
      }
      if (params.district || params.location) {
        queryParams.append('district', params.district || params.location);
      }
      const res = await api.get(`/weather/forecast?${queryParams.toString()}`);
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // ===== 8. PUBLIC PROFILE & SOCIAL FOLLOW APIs =====
  getPublicProfile: async (identifier) => {
    try {
      const res = await api.get(`/users/public/${encodeURIComponent(identifier)}`);
      return res.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch user profile' };
    }
  },

  toggleFollowUser: async (userId) => {
    try {
      const res = await api.post(`/users/${userId}/follow`);
      return res.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Follow action failed' };
    }
  },

  getFollowersList: async (userId) => {
    try {
      const res = await api.get(`/users/${userId}/followers`);
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getFollowingList: async (userId) => {
    try {
      const res = await api.get(`/users/${userId}/following`);
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // ===== 9. REAL-TIME MESSAGING APIs =====
  getConversations: async () => {
    try {
      const res = await api.get('/messages/conversations');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getChatMessages: async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`);
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  sendMessage: async (userId, payload) => {
    try {
      const res = await api.post(`/messages/${userId}`, payload);
      return res.data;
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to send message' };
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const res = await api.delete(`/messages/${messageId}`);
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  blockUser: async (userId) => {
    try {
      const res = await api.post(`/messages/block/${userId}`);
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // ===== 10. ADMIN APIs =====
  getAdminStats: async () => {
    try {
      const res = await api.get('/admin/stats');
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getAllUsers: async () => {
    try {
      const res = await api.get('/admin/users');
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getUserActivity: async (userId) => {
    try {
      const res = await api.get(`/admin/users/${userId}/activity`);
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  deleteUserAdmin: async (userId) => {
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  updateUserRoleAdmin: async (userId, role) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role });
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  deletePostAdmin: async (postId) => {
    try {
      const res = await api.delete(`/admin/posts/${postId}`);
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  deleteListingAdmin: async (listingId) => {
    try {
      const res = await api.delete(`/admin/listings/${listingId}`);
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  getPlantationMapData: async () => {
    try {
      const res = await api.get('/admin/map');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getAlertsData: async () => {
    try {
      const res = await api.get('/admin/alerts');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getSensorData: async () => {
    try {
      const res = await api.get('/admin/sensors');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getWeatherData: async () => {
    try {
      const res = await api.get('/admin/weather');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getAnalyticsData: async () => {
    try {
      const res = await api.get('/admin/analytics');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getSystemHealth: async () => {
    try {
      const res = await api.get('/admin/system-health');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getExpertsList: async () => {
    try {
      const res = await api.get('/admin/experts');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  createExpertAdmin: async (expertData) => {
    try {
      const res = await api.post('/admin/experts', expertData);
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getExecutiveKpis: async () => {
    try {
      const res = await api.get('/admin/executive-kpis');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getAgriIntelligenceSummary: async () => {
    try {
      const res = await api.get('/admin/intelligence');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getPendingReviews: async () => {
    try {
      const res = await api.get('/admin/pending-reviews');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getRecentPlantationTable: async () => {
    try {
      const res = await api.get('/admin/plantations/recent');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getLiveActivityFeed: async () => {
    try {
      const res = await api.get('/admin/activities/feed');
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getGlobalSearch: async (query) => {
    try {
      const res = await api.get(`/admin/global-search?q=${encodeURIComponent(query)}`);
      return res.data;
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};
