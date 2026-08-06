const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getExecutiveKpis,
  getAgriIntelligenceSummary,
  getPendingReviews,
  getRecentPlantationTable,
  getLiveActivityFeed,
  getGlobalSearch,
  getAdminStats,
  getPlantationMapData,
  getAlertsData,
  getSensorData,
  getWeatherData,
  getAnalyticsData,
  getSystemHealth,
  getExpertsList,
  createExpert,
  toggleUserStatus,
  getAllUsers,
  getUserActivity,
  deleteUser,
  updateUserRole,
  deletePostAdmin,
  deleteListingAdmin,
  createUserByAdmin,
  queryAdminAiAssistant,
} = require('../controllers/adminController');

// Secure all admin endpoints
router.get('/executive-kpis', protect, adminOnly, getExecutiveKpis);
router.get('/intelligence', protect, adminOnly, getAgriIntelligenceSummary);
router.get('/pending-reviews', protect, adminOnly, getPendingReviews);
router.get('/plantations/recent', protect, adminOnly, getRecentPlantationTable);
router.get('/activities/feed', protect, adminOnly, getLiveActivityFeed);
router.get('/global-search', protect, adminOnly, getGlobalSearch);

router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/map', protect, adminOnly, getPlantationMapData);
router.get('/alerts', protect, adminOnly, getAlertsData);
router.get('/sensors', protect, adminOnly, getSensorData);
router.get('/weather', protect, adminOnly, getWeatherData);
router.get('/analytics', protect, adminOnly, getAnalyticsData);
router.get('/system-health', protect, adminOnly, getSystemHealth);
router.get('/experts', protect, adminOnly, getExpertsList);
router.post('/experts', protect, adminOnly, createExpert);
router.put('/users/:userId/status', protect, adminOnly, toggleUserStatus);
router.get('/users', protect, adminOnly, getAllUsers);
router.post('/users', protect, adminOnly, createUserByAdmin);
router.post('/ai-assistant', protect, adminOnly, queryAdminAiAssistant);
router.get('/users/:userId/activity', protect, adminOnly, getUserActivity);
router.put('/users/:userId/role', protect, adminOnly, updateUserRole);
router.delete('/users/:userId', protect, adminOnly, deleteUser);
router.delete('/posts/:postId', protect, adminOnly, deletePostAdmin);
router.delete('/listings/:listingId', protect, adminOnly, deleteListingAdmin);

module.exports = router;

