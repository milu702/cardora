const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const WorkerRating = require('../models/WorkerRating');
const Payment = require('../models/Payment');
const SMSLog = require('../models/SMSLog');
const Plantation = require('../models/Plantation');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { sendSmsNotification, getSmsSettings, updateSmsSettings } = require('../services/smsService');

/**
 * Helper to auto-append attendance records to server CSV log
 */
const appendToCsvFile = (records, plantationName = 'Cardora Plantation Estate') => {
  try {
    const dirPath = path.join(__dirname, '../exports');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, 'attendance_register.csv');
    const fileExists = fs.existsSync(filePath);

    const headers = ['Date', 'Plantation Name', 'Worker ID', 'Worker Name', 'Work Type', 'Status', 'Daily Wage (INR)', 'Overtime Hours', 'Overtime Amount (INR)', 'Marked By'];
    let csvContent = '';

    if (!fileExists) {
      csvContent += '\uFEFF' + headers.join(',') + '\n';
    }

    records.forEach((r) => {
      const row = [
        `"${r.date || ''}"`,
        `"${r.plantationName || plantationName}"`,
        `"${r.workerId || ''}"`,
        `"${r.worker?.fullName || r.markedBy || 'Worker'}"`,
        `"${r.workType || 'Harvesting'}"`,
        `"${r.status || 'Present'}"`,
        r.worker?.dailyWage || 700,
        r.overtimeHours || 0,
        r.overtimeAmount || 0,
        `"${r.markedBy || 'Supervisor'}"`,
      ].join(',');
      csvContent += row + '\n';
    });

    fs.appendFileSync(filePath, csvContent, 'utf8');
  } catch (err) {
    console.error('Error writing to attendance CSV file on server:', err);
  }
};

/**
 * Helper to check plantation authorization
 */
const verifyPlantationAccess = async (userId, plantationId) => {
  let plantation;
  if (plantationId && mongoose.Types.ObjectId.isValid(plantationId)) {
    plantation = await Plantation.findById(plantationId);
  }
  const userObj = await User.findById(userId);

  if (!plantation && userObj && userObj.assignedPlantation) {
    plantation = await Plantation.findById(userObj.assignedPlantation);
  }
  if (!plantation) {
    plantation = await Plantation.findOne({ user: userId });
  }
  if (!plantation) {
    plantation = await Plantation.findOne({ supervisorId: userId });
  }
  if (!plantation) {
    plantation = await Plantation.findOne({ assignedSupervisors: userId });
  }
  if (!plantation) {
    const ownerName = userObj ? (userObj.fullName || userObj.name || userObj.username || 'Estate Owner') : 'Estate Owner';
    plantation = await Plantation.create({
      name: `${ownerName}'s Plantation Estate`,
      user: userId,
      supervisorId: (userObj?.role || '').toLowerCase() === 'supervisor' ? userId : undefined,
      location: userObj?.location || 'Idukki, Kerala',
      areaSize: '15 Acres',
      cropType: 'Cardamom',
    });
  }

  const uId = userId.toString();
  const isOwner = plantation.user && plantation.user.toString() === uId;
  const isDirectSupervisor = plantation.supervisorId && plantation.supervisorId.toString() === uId;
  const isAssignedSupervisor = plantation.assignedSupervisors && plantation.assignedSupervisors.some(id => id.toString() === uId);

  const isSupervisorRole = userObj && (userObj.role === 'Supervisor' || userObj.role === 'supervisor');

  return {
    plantation,
    isOwner: isOwner || (!isSupervisorRole && !isDirectSupervisor && !isAssignedSupervisor),
    isSupervisor: isDirectSupervisor || isAssignedSupervisor || isSupervisorRole,
  };
};

// ==========================================
// 1. WORKER MANAGEMENT (NO WORKER LOGIN)
// ==========================================

// @desc    Create new supervisor-managed worker
// @route   POST /api/workforce/supervisor/workers
// @access  Private (Supervisor / Owner)
exports.createWorker = async (req, res) => {
  try {
    const {
      plantationId,
      fullName,
      phone,
      gender,
      address,
      workType,
      dailyWage,
      joiningDate,
      emergencyContact,
      status,
      photo,
      sendAssignmentSms,
    } = req.body;

    if (!fullName) {
      return res.status(400).json({ success: false, message: 'Worker Name is required' });
    }

    const authCheck = await verifyPlantationAccess(req.user._id, plantationId);
    if (!authCheck || !authCheck.plantation) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage workers for this plantation' });
    }

    const targetPlantationId = authCheck.plantation._id;

    // Auto-generate Worker ID (e.g., WRK-1001)
    const count = await Worker.countDocuments();
    const generatedWorkerId = `WRK-${1000 + count + 1}`;

    const worker = await Worker.create({
      workerId: generatedWorkerId,
      plantationId: targetPlantationId,
      supervisorId: req.user._id,
      fullName: fullName.trim(),
      phone: phone ? phone.trim() : '',
      gender: gender || 'Male',
      address: address || '',
      workType: workType || 'Capsule Harvesting',
      dailyWage: Number(dailyWage) || 700,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      status: status || 'Active',
      photo: photo || '',
      emergencyContact: emergencyContact || { name: '', phone: '', relation: '' },
    });

    // Send optional Assignment SMS
    if (sendAssignmentSms && phone) {
      await sendSmsNotification({
        workerId: worker.workerId,
        workerObj: worker,
        phone,
        type: 'WorkAssignment',
        data: {
          workType: worker.workType,
          plantationName: authCheck.plantation.name,
          date: new Date().toLocaleDateString(),
        },
        supervisorId: req.user._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Worker registered successfully',
      worker,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all workers for a plantation
// @route   GET /api/workforce/supervisor/workers/plantation/:plantationId
// @access  Private (Supervisor / Owner)
exports.getPlantationWorkers = async (req, res) => {
  try {
    const { plantationId } = req.params;
    const { search, status } = req.query;

    const authCheck = await verifyPlantationAccess(req.user._id, plantationId);
    if (!authCheck || !authCheck.plantation) {
      return res.status(403).json({ success: false, message: 'Not authorized to view workers for this plantation' });
    }

    const targetPlantationId = authCheck.plantation._id;

    // Strict multi-tenant isolation: Owners see their plantation workers; Supervisors see their created/assigned workers
    let filter = {};
    if (authCheck.isOwner) {
      filter = {
        $or: [
          { plantationId: targetPlantationId },
          { supervisorId: req.user._id },
        ],
      };
    } else {
      filter = {
        $or: [
          { supervisorId: req.user._id },
          { plantationId: targetPlantationId, supervisorId: req.user._id },
        ],
      };
    }

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (search) {
      filter.fullName = { $regex: search, $options: 'i' };
    }

    const workers = await Worker.find(filter).sort({ createdAt: -1 });

    const ownerUser = authCheck.plantation.user
      ? await User.findById(authCheck.plantation.user)
      : await User.findById(req.user._id);

    const ownerName = ownerUser
      ? (ownerUser.fullName || ownerUser.name || ownerUser.username || 'Plantation Owner')
      : (req.user.fullName || req.user.name || req.user.username || 'Plantation Owner');

    res.status(200).json({
      success: true,
      count: workers.length,
      plantation: {
        id: authCheck.plantation._id,
        name: authCheck.plantation.name || 'Cardora Plantation Estate',
        location: authCheck.plantation.location || 'Idukki, Kerala',
        ownerName,
        ownerEmail: ownerUser ? ownerUser.email : '',
        ownerPhone: ownerUser ? ownerUser.phone : '',
      },
      workers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update worker profile
// @route   PUT /api/workforce/supervisor/workers/:id
// @access  Private (Supervisor / Owner)
exports.updateWorker = async (req, res) => {
  try {
    let worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker record not found' });
    }

    if (worker.plantationId) {
      const authCheck = await verifyPlantationAccess(req.user._id, worker.plantationId);
      if (!authCheck) {
        return res.status(403).json({ success: false, message: 'Not authorized to modify this worker' });
      }
    }

    worker = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: 'Worker updated successfully',
      worker,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete worker from plantation roster
// @route   DELETE /api/workforce/supervisor/workers/:id
// @access  Private (Supervisor / Owner)
exports.deleteWorker = async (req, res) => {
  try {
    const { id } = req.params;
    let worker;

    if (mongoose.Types.ObjectId.isValid(id)) {
      worker = await Worker.findById(id);
    }
    if (!worker) {
      worker = await Worker.findOne({ workerId: id });
    }

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker record not found' });
    }

    if (worker.plantationId) {
      const authCheck = await verifyPlantationAccess(req.user._id, worker.plantationId);
      if (!authCheck) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this worker' });
      }
    }

    // Permanently remove worker from MongoDB
    await Worker.findByIdAndDelete(worker._id);

    res.status(200).json({
      success: true,
      message: 'Worker successfully deleted from roster',
      workerId: worker._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. EASY ATTENDANCE SYSTEM
// ==========================================

// @desc    Save/Update bulk daily attendance for plantation
// @route   POST /api/workforce/supervisor/attendance/bulk
// @access  Private (Supervisor / Owner)
exports.markBulkAttendance = async (req, res) => {
  try {
    const { plantationId, date, attendanceList, sendSms } = req.body;

    if (!plantationId || !attendanceList || !Array.isArray(attendanceList)) {
      return res.status(400).json({ success: false, message: 'Plantation ID and attendance array are required' });
    }

    const authCheck = await verifyPlantationAccess(req.user._id, plantationId);
    if (!authCheck || !authCheck.plantation) {
      return res.status(403).json({ success: false, message: 'Not authorized to mark attendance for this plantation' });
    }

    const targetPlantationId = authCheck.plantation._id;
    const attendanceDate = date || new Date().toISOString().split('T')[0];
    const updatedRecords = [];

    for (const item of attendanceList) {
      let worker;
      if (item.workerId && mongoose.Types.ObjectId.isValid(item.workerId)) {
        worker = await Worker.findById(item.workerId);
      }
      if (!worker && item.workerId) {
        worker = await Worker.findOne({ workerId: item.workerId });
      }
      if (!worker) continue;

      const filter = {
        worker: worker._id,
        date: attendanceDate,
      };

      const overtimeHours = Number(item.overtimeHours) || 0;
      const hourlyRate = (worker.dailyWage || 700) / 8;
      const overtimeAmount = Math.round(overtimeHours * hourlyRate * 1.5); // 1.5x overtime multiplier

      const updateData = {
        worker: worker._id,
        workerId: worker.workerId,
        supervisor: req.user._id,
        plantation: targetPlantationId,
        plantationName: authCheck.plantation.name,
        date: attendanceDate,
        status: item.status || 'Present',
        overtimeHours,
        overtimeAmount,
        workType: item.workType || worker.workType || 'General Harvesting',
        remarks: item.remarks || '',
        markedBy: req.user.name || 'Supervisor',
        checkInTime: new Date(),
        checkInLocation: item.checkInLocation || {
          lat: Number(item.lat) || 9.8471,
          lng: Number(item.lng) || 77.1023,
          address: item.address || `${authCheck.plantation.name || 'Cardora Estate'}, Idukki`,
        },
      };

      const record = await Attendance.findOneAndUpdate(filter, updateData, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });

      updatedRecords.push(record);

      // Trigger SMS Notification if requested
      if (sendSms && worker.phone) {
        let wageForDay = worker.dailyWage;
        if (item.status === 'Half Day') wageForDay = Math.round(worker.dailyWage / 2);
        if (item.status === 'Absent' || item.status === 'Leave') wageForDay = 0;

        await sendSmsNotification({
          workerId: worker.workerId,
          workerObj: worker,
          phone: worker.phone,
          type: 'Attendance',
          data: {
            date: attendanceDate,
            status: item.status,
            dailyWage: wageForDay,
          },
          supervisorId: req.user._id,
        });
      }
    }

    // Auto-append to server CSV storage
    appendToCsvFile(updatedRecords, authCheck.plantation.name);

    res.status(200).json({
      success: true,
      message: `Attendance recorded for ${updatedRecords.length} workers & stored in CSV register`,
      date: attendanceDate,
      records: updatedRecords,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance by plantation and date
// @route   GET /api/workforce/supervisor/attendance/:plantationId/:date
// @access  Private (Supervisor / Owner)
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { plantationId, date } = req.params;

    const authCheck = await verifyPlantationAccess(req.user._id, plantationId);
    if (!authCheck || !authCheck.plantation) {
      return res.status(403).json({ success: false, message: 'Not authorized to view attendance' });
    }

    const targetPlantationId = authCheck.plantation._id;
    const attendanceRecords = await Attendance.find({
      date,
      $or: [
        { plantation: targetPlantationId },
        { supervisor: req.user._id },
        { plantation: null },
      ],
    })
      .populate('worker', 'fullName workerId phone photo dailyWage status workType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      date,
      count: attendanceRecords.length,
      records: attendanceRecords,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complete attendance history for plantation export/download
// @route   GET /api/workforce/supervisor/attendance/export/:plantationId
// @access  Private (Supervisor / Owner)
exports.exportPlantationAttendance = async (req, res) => {
  try {
    const { plantationId } = req.params;

    const authCheck = await verifyPlantationAccess(req.user._id, plantationId);
    if (!authCheck) {
      return res.status(403).json({ success: false, message: 'Not authorized to export attendance records' });
    }

    const targetPlantationId = authCheck.plantation._id;
    const attendanceRecords = await Attendance.find({
      $or: [{ plantation: targetPlantationId }, { supervisor: req.user._id }, { plantation: null }],
    })
      .populate('worker', 'fullName workerId phone photo dailyWage status workType')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      plantationName: authCheck.plantation?.name || 'Cardora Estate',
      records: attendanceRecords,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. STAR RATING SYSTEM (1-5 STARS)
// ==========================================

// @desc    Submit 4-category star rating for worker
// @route   POST /api/workforce/supervisor/ratings
// @access  Private (Supervisor / Owner)
exports.submitWorkerRating = async (req, res) => {
  try {
    const {
      workerId,
      plantationId,
      date,
      workQuality,
      punctuality,
      teamwork,
      productivity,
      comment,
    } = req.body;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker record not found' });
    }

    const authCheck = await verifyPlantationAccess(req.user._id, plantationId || worker.plantationId);
    if (!authCheck || !authCheck.plantation) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit ratings' });
    }

    const targetPlantationId = authCheck.plantation._id;

    if (!worker.plantationId || !mongoose.Types.ObjectId.isValid(worker.plantationId)) {
      worker.plantationId = targetPlantationId;
    }

    const wQ = Number(workQuality) || 5;
    const punc = Number(punctuality) || 5;
    const team = Number(teamwork) || 5;
    const prod = Number(productivity) || 5;
    const overallRating = Number(((wQ + punc + team + prod) / 4).toFixed(1));

    const ratingDate = date || new Date().toISOString().split('T')[0];

    const ratingDoc = await WorkerRating.findOneAndUpdate(
      { worker: worker._id, plantation: targetPlantationId, date: ratingDate },
      {
        worker: worker._id,
        workerId: worker.workerId,
        plantation: targetPlantationId,
        supervisor: req.user._id,
        date: ratingDate,
        workQuality: wQ,
        punctuality: punc,
        teamwork: team,
        productivity: prod,
        overallRating,
        comment: comment || '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Update cumulative worker rating
    const allRatings = await WorkerRating.find({ worker: worker._id });
    const avgCumulative = (
      allRatings.reduce((acc, curr) => acc + curr.overallRating, 0) / allRatings.length
    ).toFixed(1);

    worker.rating = Number(avgCumulative);
    worker.totalRatingsCount = allRatings.length;
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Worker rating saved successfully',
      rating: ratingDoc,
      workerRatingSummary: {
        averageRating: worker.rating,
        totalRatings: worker.totalRatingsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get rating history for worker
// @route   GET /api/workforce/supervisor/ratings/worker/:workerId
// @access  Private (Supervisor / Owner)
exports.getWorkerRatings = async (req, res) => {
  try {
    const { workerId } = req.params;
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker record not found' });
    }

    const ratings = await WorkerRating.find({ worker: worker._id })
      .populate('supervisor', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      workerId: worker.workerId,
      workerName: worker.fullName,
      overallAverage: worker.rating,
      totalRatings: ratings.length,
      ratings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. AUTOMATIC WAGE & PAYMENT MANAGEMENT
// ==========================================

// @desc    Get worker wage details and calculation breakdown
// @route   GET /api/workforce/supervisor/wages/worker/:workerId
// @access  Private (Supervisor / Owner)
exports.getWorkerWageDetails = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { month } = req.query; // YYYY-MM

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker record not found' });
    }

    let dateQuery = { worker: worker._id };
    if (month) {
      dateQuery.date = { $regex: `^${month}` };
    }

    const attendanceRecords = await Attendance.find(dateQuery);
    const payments = await Payment.find({ worker: worker._id });

    let presentDays = 0;
    let halfDays = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let totalOvertimeHours = 0;
    let totalOvertimeAmount = 0;

    attendanceRecords.forEach((att) => {
      if (att.status === 'Present') presentDays++;
      else if (att.status === 'Half Day') halfDays++;
      else if (att.status === 'Absent') absentDays++;
      else if (att.status === 'Leave') leaveDays++;

      if (att.overtimeHours) {
        totalOvertimeHours += att.overtimeHours;
        totalOvertimeAmount += att.overtimeAmount || 0;
      }
    });

    const dailyRate = worker.dailyWage || 700;
    const fullDayEarnings = presentDays * dailyRate;
    const halfDayEarnings = halfDays * Math.round(dailyRate / 2);
    const grossAttendanceEarned = fullDayEarnings + halfDayEarnings + totalOvertimeAmount;

    let bonusesTotal = 0;
    let advancesTotal = 0;
    let totalPaidAmount = 0;

    payments.forEach((p) => {
      const amt = Number(p.amount) || 0;
      if (p.type === 'Bonus' || p.paymentType === 'Bonus') {
        bonusesTotal += amt;
      } else if (p.type === 'Advance' || p.paymentType === 'Advance') {
        advancesTotal += amt;
      } else if (p.status === 'Paid' || p.status === 'Completed') {
        totalPaidAmount += amt;
      }
    });

    const totalEarned = grossAttendanceEarned + bonusesTotal;
    const finalWage = totalEarned - advancesTotal;
    const pendingAmount = Math.max(0, finalWage - totalPaidAmount);

    res.status(200).json({
      success: true,
      worker: {
        id: worker._id,
        workerId: worker.workerId,
        fullName: worker.fullName,
        dailyWage: dailyRate,
        phone: worker.phone,
        workType: worker.workType,
      },
      summary: {
        presentDays,
        halfDays,
        absentDays,
        leaveDays,
        totalOvertimeHours,
        totalOvertimeAmount,
        fullDayEarnings,
        halfDayEarnings,
        grossAttendanceEarned,
        bonusesTotal,
        advancesTotal,
        totalEarned,
        finalWage,
        totalPaidAmount,
        pendingAmount,
      },
      payments,
      attendanceCount: attendanceRecords.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record payment for worker
// @route   POST /api/workforce/supervisor/payments
// @access  Private (Supervisor / Owner)
exports.recordPayment = async (req, res) => {
  try {
    const {
      workerId,
      plantationId,
      amount,
      paymentDate,
      paymentMethod,
      transactionId,
      remarks,
      type,
      sendSms,
    } = req.body;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker record not found' });
    }

    const authCheck = await verifyPlantationAccess(req.user._id, plantationId || worker.plantationId);
    if (!authCheck || !authCheck.plantation) {
      return res.status(403).json({ success: false, message: 'Not authorized to record payments' });
    }

    const targetPlantationId = authCheck.plantation._id;

    const payment = await Payment.create({
      worker: worker._id,
      workerId: worker.workerId,
      plantation: targetPlantationId,
      supervisor: req.user._id,
      payer: req.user._id,
      amount: Number(amount),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMethod: paymentMethod || 'Cash',
      transactionId: transactionId || '',
      remarks: remarks || '',
      type: type || 'Salary',
      status: 'Paid',
    });

    // Optional Payment SMS Dispatch
    if (sendSms && worker.phone) {
      await sendSmsNotification({
        workerId: worker.workerId,
        workerObj: worker,
        phone: worker.phone,
        type: 'Payment',
        data: {
          amount: payment.amount,
          date: new Date(payment.paymentDate).toLocaleDateString(),
        },
        supervisorId: req.user._id,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. SMS NOTIFICATIONS & SETTINGS
// ==========================================

// @desc    Trigger manual worker SMS
// @route   POST /api/workforce/supervisor/sms/send
// @access  Private (Supervisor / Owner)
exports.sendWorkerSms = async (req, res) => {
  try {
    const { workerId, type, customMessage, data } = req.body;

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const result = await sendSmsNotification({
      workerId: worker.workerId,
      workerObj: worker,
      phone: worker.phone,
      type: type || 'Attendance',
      data: data || {},
      supervisorId: req.user._id,
    });

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get worker SMS log history
// @route   GET /api/workforce/supervisor/sms/history/:workerId
// @access  Private (Supervisor / Owner)
exports.getWorkerSmsLogs = async (req, res) => {
  try {
    const logs = await SMSLog.find({ worker: req.params.workerId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get SMS Settings
// @route   GET /api/workforce/supervisor/sms/settings
// @access  Private
exports.getSmsSettingsController = (req, res) => {
  res.status(200).json({ success: true, settings: getSmsSettings() });
};

// @desc    Update SMS Settings
// @route   PUT /api/workforce/supervisor/sms/settings
// @access  Private
exports.updateSmsSettingsController = (req, res) => {
  const updated = updateSmsSettings(req.body);
  res.status(200).json({ success: true, settings: updated });
};

// ==========================================
// 6. OWNER MONITORING & DASHBOARD STATS
// ==========================================

// @desc    Get Plantation Owner Monitoring Overview
// @route   GET /api/workforce/owner-summary/:plantationId
// @access  Private (Owner / Supervisor)
exports.getOwnerMonitoringSummary = async (req, res) => {
  try {
    const { plantationId } = req.params;

    const authCheck = await verifyPlantationAccess(req.user._id, plantationId);
    if (!authCheck || !authCheck.plantation) {
      return res.status(403).json({ success: false, message: 'Not authorized to view monitoring summary' });
    }

    const plantation = authCheck.plantation;
    const targetPlantationId = plantation._id;
    const workers = await Worker.find({ plantationId: targetPlantationId });

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.find({ plantation: targetPlantationId, date: todayStr });

    let presentToday = 0;
    let absentToday = 0;
    let halfDayToday = 0;
    let leaveToday = 0;

    todayAttendance.forEach((att) => {
      if (att.status === 'Present') presentToday++;
      else if (att.status === 'Absent') absentToday++;
      else if (att.status === 'Half Day') halfDayToday++;
      else if (att.status === 'Leave') leaveToday++;
    });

    const totalWorkers = workers.length;
    const unrecordedToday = Math.max(0, totalWorkers - todayAttendance.length);

    // Financial Liabilities & Wage Aggregates
    const allPayments = await Payment.find({ plantation: targetPlantationId });
    const allAttendance = await Attendance.find({ plantation: targetPlantationId });

    let totalGrossEarned = 0;
    let totalPaid = 0;

    allAttendance.forEach((att) => {
      const worker = workers.find((w) => w._id.toString() === att.worker.toString());
      const dailyRate = worker ? worker.dailyWage : 700;
      if (att.status === 'Present') totalGrossEarned += dailyRate;
      if (att.status === 'Half Day') totalGrossEarned += Math.round(dailyRate / 2);
      if (att.overtimeAmount) totalGrossEarned += att.overtimeAmount;
    });

    allPayments.forEach((p) => {
      if (p.status === 'Paid' || p.status === 'Completed') {
        totalPaid += Number(p.amount) || 0;
      }
    });

    const pendingWages = Math.max(0, totalGrossEarned - totalPaid);

    // Calculate Average Rating across workers
    const activeRatings = workers.filter((w) => w.rating > 0);
    const avgWorkerRating = activeRatings.length
      ? (activeRatings.reduce((acc, w) => acc + w.rating, 0) / activeRatings.length).toFixed(1)
      : '4.5';

    // Supervisor Info & Owner Info
    const ownerUser = plantation.user
      ? await User.findById(plantation.user)
      : await User.findById(req.user._id);

    const ownerName = ownerUser
      ? (ownerUser.fullName || ownerUser.name || ownerUser.username || 'Plantation Owner')
      : (req.user.fullName || req.user.name || req.user.username || 'Plantation Owner');

    // Ensure plantation user is set to current logged-in owner if missing
    if (!plantation.user) {
      plantation.user = req.user._id;
      await plantation.save().catch(() => {});
    }

    const supervisors = await User.find({
      $or: [
        { _id: { $in: [plantation.supervisorId, ...(plantation.assignedSupervisors || [])].filter(Boolean) } },
        { assignedPlantation: plantation._id },
        { role: { $regex: /^supervisor$/i } },
      ],
    }).select('name fullName username email phone role avatar createdAt');

    // Supervisor Activity Logs with Exact Attendance Marked Times
    const recentAttendanceLogs = await Attendance.find({
      $or: [{ plantation: plantation._id }, { plantation: null }],
    })
      .populate('worker', 'fullName workerId')
      .populate('supervisor', 'name fullName username email')
      .sort({ updatedAt: -1 })
      .limit(25);

    const activityLogs = recentAttendanceLogs.map((att) => ({
      id: att._id,
      type: 'ATTENDANCE',
      supervisorName: att.markedBy || att.supervisor?.fullName || att.supervisor?.name || att.supervisor?.username || 'Supervisor',
      workerName: att.worker?.fullName || 'Worker',
      workerId: att.workerId || att.worker?.workerId || '',
      action: `Marked ${att.status} (${att.workType || 'Work'})`,
      status: att.status,
      date: att.date,
      markedTime: att.updatedAt || att.checkInTime || att.createdAt,
    }));

    res.status(200).json({
      success: true,
      plantation: {
        id: plantation._id,
        name: plantation.name || 'Cardora Plantation Estate',
        location: plantation.location || 'Idukki, Kerala',
        ownerName,
        ownerEmail: ownerUser ? ownerUser.email : '',
        ownerPhone: ownerUser ? ownerUser.phone : '',
      },
      supervisors,
      stats: {
        totalWorkers,
        presentToday,
        absentToday,
        halfDayToday,
        leaveToday,
        unrecordedToday,
        totalGrossEarned,
        totalPaid,
        pendingWages,
        avgWorkerRating,
      },
      activityLogs,
      workers: workers.slice(0, 10), // Top 10 preview
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign Supervisor to Plantation (By Owner)
// @route   POST /api/plantations/:plantationId/assign-supervisor
// @access  Private (Owner)
exports.assignSupervisorToPlantation = async (req, res) => {
  try {
    const { plantationId } = req.params;
    const { supervisorId, emailOrUsername } = req.body;

    let plantation;
    if (plantationId && mongoose.Types.ObjectId.isValid(plantationId)) {
      plantation = await Plantation.findById(plantationId);
    }
    if (!plantation) {
      plantation = await Plantation.findOne({ user: req.user._id });
    }
    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }

    if (plantation.user.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only plantation owner can assign supervisors' });
    }

    let targetSupervisor;
    if (supervisorId) {
      targetSupervisor = await User.findById(supervisorId);
    } else if (emailOrUsername) {
      targetSupervisor = await User.findOne({
        $or: [{ email: emailOrUsername.toLowerCase() }, { username: emailOrUsername.toLowerCase() }],
      });
    }

    if (!targetSupervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor account not found' });
    }

    plantation.supervisorId = targetSupervisor._id;
    if (!plantation.assignedSupervisors.includes(targetSupervisor._id)) {
      plantation.assignedSupervisors.push(targetSupervisor._id);
    }
    await plantation.save();

    res.status(200).json({
      success: true,
      message: `Supervisor ${targetSupervisor.name} assigned to ${plantation.name}`,
      supervisor: {
        id: targetSupervisor._id,
        name: targetSupervisor.name,
        email: targetSupervisor.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Invite & Assign Supervisor to Plantation via Email
// @route   POST /api/workforce/plantations/:plantationId/invite-supervisor
// @access  Private (Owner / Admin)
exports.inviteAndAssignSupervisor = async (req, res) => {
  try {
    const { plantationId } = req.params;
    const { name, email, phone, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Supervisor email address is required' });
    }

    let plantation;
    if (plantationId && mongoose.Types.ObjectId.isValid(plantationId)) {
      plantation = await Plantation.findById(plantationId);
    }
    if (!plantation) {
      plantation = await Plantation.findOne({ user: req.user._id });
    }
    if (!plantation) {
      plantation = await Plantation.findOne({});
    }

    const plantationName = plantation ? plantation.name : 'Cardamom Plantation Estate';
    const villageName = plantation ? plantation.village : 'Vandanmedu';
    const districtName = plantation ? plantation.district : 'Idukki';

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && name.trim()) || 'Plantation Supervisor';
    const rawPassword = password || `sup${Math.floor(10000 + Math.random() * 90000)}`;

    let supervisor = await User.findOne({ email: cleanEmail });

    if (!supervisor) {
      const username = `sup_${cleanEmail.split('@')[0]}_${Math.floor(100 + Math.random() * 900)}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
      supervisor = await User.create({
        name: cleanName,
        username,
        email: cleanEmail,
        password: rawPassword,
        role: 'Supervisor',
        phone: phone || '+91 98470 12345',
        location: `${villageName}, ${districtName}`,
        district: districtName,
        assignedPlantation: plantation ? plantation._id : undefined,
        bio: `Assigned Supervisor for ${plantationName}`,
        isVerified: true,
      });
    } else {
      supervisor.role = 'Supervisor';
      if (plantation) supervisor.assignedPlantation = plantation._id;
      if (password) {
        supervisor.password = rawPassword;
      }
      await supervisor.save();
    }

    // Link supervisor to plantation if plantation exists
    if (plantation) {
      if (!plantation.user) plantation.user = req.user._id;
      plantation.supervisorId = supervisor._id;
      if (!plantation.assignedSupervisors) plantation.assignedSupervisors = [];
      if (!plantation.assignedSupervisors.includes(supervisor._id)) {
        plantation.assignedSupervisors.push(supervisor._id);
      }
      await plantation.save();
    }

    const ownerName = req.user.fullName || req.user.name || 'Cardamom Estate Owner';
    const loginUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth`;

    const emailSubject = `🌿 Cardora Plantation Supervisor Invitation - ${plantationName}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #F8FAF7; border-radius: 16px; color: #17331F; max-width: 600px; margin: 0 auto; border: 1px solid #D7E6D5;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1F5E3B; font-weight: 900; margin: 0;">🌿 Cardora Smart Agriculture</h2>
          <p style="color: #5C8D4E; font-size: 13px; font-weight: bold; margin-top: 4px;">Plantation Supervisor Portal Access</p>
        </div>

        <p style="font-size: 15px; line-height: 1.6;">Hello <strong>${cleanName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6;">
          Estate Owner <strong>${ownerName}</strong> has assigned you as the <strong>Plantation Supervisor</strong> for <strong>${plantationName}</strong> (${villageName}, ${districtName}).
        </p>

        <div style="background-color: #FFFFFF; border: 2px dashed #1F5E3B; padding: 18px; border-radius: 12px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #1F5E3B; font-size: 14px; text-transform: uppercase;">Your Supervisor Credentials</h4>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Login Portal:</strong> <a href="${loginUrl}" style="color: #1F5E3B; font-weight: bold;">${loginUrl}</a></p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Email:</strong> ${cleanEmail}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 15px; font-weight: bold; background: #EBF5EC; padding: 2px 6px; border-radius: 4px; color: #17331F;">${rawPassword}</span></p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Assigned Estate:</strong> ${plantationName}</p>
        </div>

        <p style="font-size: 13px; color: #4A5568;">
          Logging in with these credentials will directly grant you access to your assigned workers, GPS attendance board, and daily wage records.
        </p>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${loginUrl}" style="display: inline-block; padding: 12px 28px; background-color: #1F5E3B; color: #FFFFFF; text-decoration: none; font-weight: bold; border-radius: 12px; font-size: 14px;">
            Log In as Supervisor
          </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #D7E6D5; margin: 24px 0 16px 0;" />
        <p style="font-size: 11px; color: #718096; text-align: center;">Sent securely by Cardora Smart Agriculture Platform.</p>
      </div>
    `;

    await sendEmail({
      email: cleanEmail,
      subject: emailSubject,
      message: `You've been invited as Plantation Supervisor for ${plantationName}. Login at ${loginUrl} with Email: ${cleanEmail} and Password: ${rawPassword}`,
      html: emailHtml,
    });

    res.status(200).json({
      success: true,
      message: `Supervisor invitation & credentials sent to ${cleanEmail} for ${plantationName}`,
      supervisor: {
        id: supervisor._id,
        name: supervisor.name,
        email: supervisor.email,
        phone: supervisor.phone,
        role: supervisor.role,
        assignedPlantation: plantation ? plantation._id : undefined,
      },
    });
  } catch (error) {
    console.error('inviteAndAssignSupervisor error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send supervisor invitation' });
  }
};
