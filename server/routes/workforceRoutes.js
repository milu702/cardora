const express = require('express');
const router = express.Router();
const { protect, admin, optionalAuth } = require('../middleware/authMiddleware');
const { checkSupervisorPermission } = require('../middleware/permissionMiddleware');

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
  deleteWorker,
  deleteTask,
} = require('../controllers/workforceController');

const {
  createWorker: createSupervisorWorker,
  getPlantationWorkers,
  updateWorker: updateSupervisorWorker,
  deleteWorker: deleteSupervisorWorker,
  markBulkAttendance,
  getAttendanceByDate,
  exportPlantationAttendance,
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
  inviteAndAssignSupervisor,
  sendWorkerPhoneOTP,
  verifyWorkerPhoneOTP,
} = require('../controllers/supervisorWorkerController');

const {
  sendSupervisorInvitation,
  getInvitationByToken,
  acceptSupervisorInvitation,
  rejectSupervisorInvitation,
  getOwnerSupervisors,
  getSupervisorProfile,
  updateSupervisorPermissions,
  revokeSupervisorAccess,
  reassignSupervisor,
  getOwnerActivityHistory,
  getPlantationCombinedHistory,
  recordPlantationActivity,
  getPlantationActivities,
} = require('../controllers/supervisorManagementController');

// ==========================================
// 1. INVITATION & ACCEPTANCE ROUTES
// ==========================================
router.post('/supervisor/invitations', protect, sendSupervisorInvitation);
router.get('/supervisor/invitations/token/:token', getInvitationByToken);
router.post('/supervisor/invitations/:token/accept', optionalAuth, acceptSupervisorInvitation);
router.post('/supervisor/invitations/:token/reject', optionalAuth, rejectSupervisorInvitation);

// ==========================================
// 2. OWNER SUPERVISOR MANAGEMENT ROUTES
// ==========================================
router.get('/owner/supervisors', protect, getOwnerSupervisors);
router.get('/owner/supervisors/:id', protect, getSupervisorProfile);
router.put('/owner/supervisors/:id/permissions', protect, updateSupervisorPermissions);
router.post('/owner/supervisors/:id/revoke', protect, revokeSupervisorAccess);
router.post('/owner/supervisors/:id/reassign', protect, reassignSupervisor);

// ==========================================
// 3. OWNER ACTIVITY HISTORY & TIMELINES
// ==========================================
router.get('/owner/activity', protect, getOwnerActivityHistory);
router.get('/owner/supervisors/:id/activity', protect, getOwnerActivityHistory);
router.get('/owner/plantations/:id/activity', protect, getPlantationCombinedHistory);

// ==========================================
// 4. PLANTATION ACTIVITIES (SUPERVISOR / OWNER)
// ==========================================
router.get('/supervisor/activities', protect, checkSupervisorPermission('activityManagement'), getPlantationActivities);
router.post('/supervisor/activities', protect, checkSupervisorPermission('activityManagement'), recordPlantationActivity);
router.put('/supervisor/activities/:id', protect, checkSupervisorPermission('activityManagement'), recordPlantationActivity);

// ==========================================
// 5. SUPERVISOR WORKER & ATTENDANCE MANAGEMENT
// ==========================================
router.post('/supervisor/workers', protect, checkSupervisorPermission('workersManagement'), createSupervisorWorker);
router.get('/supervisor/workers/plantation/:plantationId', protect, getPlantationWorkers);
router.put('/supervisor/workers/:id', protect, checkSupervisorPermission('workersManagement'), updateSupervisorWorker);
router.delete('/supervisor/workers/:id', protect, checkSupervisorPermission('workersManagement'), deleteSupervisorWorker);

router.post('/supervisor/attendance/bulk', protect, checkSupervisorPermission('attendanceManagement'), markBulkAttendance);
router.get('/supervisor/attendance/:plantationId/:date', protect, getAttendanceByDate);
router.get('/supervisor/attendance/export/:plantationId', protect, exportPlantationAttendance);

router.post('/supervisor/ratings', protect, submitSupervisorWorkerRating);
router.get('/supervisor/ratings/worker/:workerId', protect, getSupervisorWorkerRatings);

router.get('/supervisor/wages/worker/:workerId', protect, checkSupervisorPermission('wageManagement'), getWorkerWageDetails);
router.post('/supervisor/payments', protect, checkSupervisorPermission('wageManagement'), recordSupervisorWorkerPayment);

router.post('/supervisor/sms/send', protect, sendWorkerSms);
router.get('/supervisor/sms/history/:workerId', protect, getWorkerSmsLogs);
router.get('/supervisor/sms/settings', protect, getSmsSettingsController);
router.put('/supervisor/sms/settings', protect, updateSmsSettingsController);

router.post('/supervisor/phone/send-otp', protect, sendWorkerPhoneOTP);
router.post('/supervisor/phone/verify-otp', protect, verifyWorkerPhoneOTP);

router.get('/owner-summary/:plantationId', protect, getOwnerMonitoringSummary);
router.post('/plantations/:plantationId/assign-supervisor', protect, assignSupervisorToPlantation);
router.post('/plantations/:plantationId/invite-supervisor', protect, inviteAndAssignSupervisor);

// ==========================================
// 6. GENERAL WORKER, CONTRACTOR, TASK ROUTES
// ==========================================
router.get('/workers', protect, getWorkers);
router.get('/workers/:id', getWorkerById);
router.post('/workers/profile', protect, updateWorkerProfile);
router.delete('/workers/:id', protect, deleteWorker);

router.get('/contractors', getContractors);
router.post('/contractors/profile', protect, updateContractorProfile);

router.post('/connections/request', protect, sendConnectionRequest);
router.put('/connections/request/:id', protect, respondConnectionRequest);
router.get('/connections', protect, getConnections);
router.get('/connections/requests', protect, getConnectionRequests);

// Task Routes
router.post('/tasks', protect, createTask);
router.get('/tasks', protect, getTasks);
router.put('/tasks/:id/status', protect, updateTaskStatus);
router.delete('/tasks/:id', protect, deleteTask);

// Attendance GPS Routes
router.post('/attendance/check-in', protect, checkInAttendance);
router.post('/attendance/check-out', protect, checkOutAttendance);
router.get('/attendance', protect, getAttendanceHistory);

// Payment & Receipt Routes
router.post('/payments', protect, recordPayment);
router.get('/payments', protect, getPaymentHistory);

router.post('/ratings', protect, submitRating);

router.get('/admin/verifications', protect, getAdminVerifications);
router.put('/admin/verify/:id', protect, adminVerifyUser);
router.post('/complaints', protect, submitComplaint);

module.exports = router;
