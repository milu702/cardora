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

const {
  createWorker: createSupervisorWorker,
  getPlantationWorkers,
  updateWorker: updateSupervisorWorker,
  deleteWorker: deleteSupervisorWorker,
  markBulkAttendance,
  getAttendanceByDate,
  submitWorkerRating: submitSupervisorWorkerRating,
  getWorkerRatings: getSupervisorWorkerRatings,
  getWorkerWageDetails,
  recordPayment: recordSupervisorWorkerPayment,
  sendWorkerSms,
  getWorkerSmsLogs,
  getSmsSettingsController,
  updateSmsSettingsController,
  getOwnerMonitoringSummary,
  assignSupervisorToPlantation,
} = require('../controllers/supervisorWorkerController');

// Supervisor–Worker Management Module Routes
router.post('/supervisor/workers', protect, createSupervisorWorker);
router.get('/supervisor/workers/plantation/:plantationId', protect, getPlantationWorkers);
router.put('/supervisor/workers/:id', protect, updateSupervisorWorker);
router.delete('/supervisor/workers/:id', protect, deleteSupervisorWorker);

router.post('/supervisor/attendance/bulk', protect, markBulkAttendance);
router.get('/supervisor/attendance/:plantationId/:date', protect, getAttendanceByDate);

router.post('/supervisor/ratings', protect, submitSupervisorWorkerRating);
router.get('/supervisor/ratings/worker/:workerId', protect, getSupervisorWorkerRatings);

router.get('/supervisor/wages/worker/:workerId', protect, getWorkerWageDetails);
router.post('/supervisor/payments', protect, recordSupervisorWorkerPayment);

router.post('/supervisor/sms/send', protect, sendWorkerSms);
router.get('/supervisor/sms/history/:workerId', protect, getWorkerSmsLogs);
router.get('/supervisor/sms/settings', protect, getSmsSettingsController);
router.put('/supervisor/sms/settings', protect, updateSmsSettingsController);

router.get('/owner-summary/:plantationId', protect, getOwnerMonitoringSummary);
router.post('/plantations/:plantationId/assign-supervisor', protect, assignSupervisorToPlantation);

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
