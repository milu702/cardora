const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getWorkers,
  getWorkerById,
  updateWorkerProfile,
  getContractors,
  updateContractorProfile,
  sendConnectionRequest,
  respondConnectionRequest,
  getConnections,
  getConnectionRequests,
  createTask,
  getTasks,
  updateTaskStatus,
  checkInAttendance,
  checkOutAttendance,
  getAttendanceHistory,
  recordPayment,
  getPaymentHistory,
  submitRating,
  getAdminVerifications,
  adminVerifyUser,
  submitComplaint,
} = require('../controllers/workforceController');

// Worker Routes
router.get('/workers', getWorkers);
router.get('/workers/:id', getWorkerById);
router.post('/workers/profile', protect, updateWorkerProfile);

// Contractor Routes
router.get('/contractors', getContractors);
router.post('/contractors/profile', protect, updateContractorProfile);

// Connection System Routes
router.post('/connections/request', protect, sendConnectionRequest);
router.put('/connections/request/:id', protect, respondConnectionRequest);
router.get('/connections', protect, getConnections);
router.get('/connections/requests', protect, getConnectionRequests);

// Task Routes
router.post('/tasks', protect, createTask);
router.get('/tasks', protect, getTasks);
router.put('/tasks/:id/status', protect, updateTaskStatus);

// Attendance GPS Routes
router.post('/attendance/check-in', protect, checkInAttendance);
router.post('/attendance/check-out', protect, checkOutAttendance);
router.get('/attendance', protect, getAttendanceHistory);

// Payment & Receipt Routes
router.post('/payments', protect, recordPayment);
router.get('/payments', protect, getPaymentHistory);

// Rating & Reviews Routes
router.post('/ratings', protect, submitRating);

// Admin Workforce & Moderation Routes
router.get('/admin/verifications', protect, getAdminVerifications);
router.put('/admin/verify/:id', protect, adminVerifyUser);
router.post('/complaints', protect, submitComplaint);

module.exports = router;
