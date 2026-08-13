const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const WorkerRating = require('../models/WorkerRating');
const Payment = require('../models/Payment');
const SMSLog = require('../models/SMSLog');
const Plantation = require('../models/Plantation');
const User = require('../models/User');
const { sendSmsNotification, getSmsSettings, updateSmsSettings } = require('../services/smsService');

/**
 * Helper to check plantation authorization
 */
const verifyPlantationAccess = async (userId, plantationId) => {
  const plantation = await Plantation.findById(plantationId);
  if (!plantation) return null;

  const uId = userId.toString();
  const isOwner = plantation.user.toString() === uId;
  const isDirectSupervisor = plantation.supervisorId && plantation.supervisorId.toString() === uId;
  const isAssignedSupervisor = plantation.assignedSupervisors && plantation.assignedSupervisors.some(id => id.toString() === uId);

  if (isOwner || isDirectSupervisor || isAssignedSupervisor) {
    return { plantation, isOwner, isSupervisor: isDirectSupervisor || isAssignedSupervisor };
  }
  return null;
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

    if (!plantationId || !fullName) {
      return res.status(400).json({ success: false, message: 'Plantation ID and Worker Name are required' });
    }

    const authCheck = await verifyPlantationAccess(req.user._id, plantationId);
    if (!authCheck) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage workers for this plantation' });
    }

    // Auto-generate Worker ID (e.g., WRK-1001)
    const count = await Worker.countDocuments();
    const generatedWorkerId = `WRK-${1000 + count + 1}`;

    const worker = await Worker.create({
      workerId: generatedWorkerId,
      plantationId,
      supervisorId: req.user._id,
      fullName,
      phone: phone || '',
      gender: gender || 'Male',
      address: address || '',
      workType: workType || 'Capsule Harvesting',
      dailyWage: Number(dailyWage) || 700,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      status: status || 'Active',
      photo: photo || '',
      emergencyContact: emergencyContact || { name: '', phone: '', relation: '' },
      user: null, // No login credentials created
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
    if (!authCheck) {
      return res.status(403).json({ success: false, message: 'Not authorized to view workers for this plantation' });
    }

    let filter = { plantationId };
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { workerId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { workType: { $regex: search, $options: 'i' } },
      ];
    }

    const workers = await Worker.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workers.length,
      plantation: {
        id: authCheck.plantation._id,
        name: authCheck.plantation.name,
        location: authCheck.plantation.location,
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

// @desc    Delete / Deactivate worker
// @route   DELETE /api/workforce/supervisor/workers/:id
// @access  Private (Supervisor / Owner)
exports.deleteWorker = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker record not found' });
    }

    if (worker.plantationId) {
      const authCheck = await verifyPlantationAccess(req.user._id, worker.plantationId);
      if (!authCheck) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this worker' });
      }
    }

    // Soft delete by marking Inactive
    worker.status = 'Inactive';
    await worker.save();

    res.status(200).json({
      success: true,
      message: 'Worker set to Inactive status',
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
    if (!authCheck) {
      return res.status(403).json({ success: false, message: 'Not authorized to mark attendance for this plantation' });
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];
    const updatedRecords = [];

    for (const item of attendanceList) {
      const worker = await Worker.findById(item.workerId);
      if (!worker) continue;

      const filter = {
        worker: worker._id,
        plantation: plantationId,
        date: attendanceDate,
      };

      const overtimeHours = Number(item.overtimeHours) || 0;
      const hourlyRate = (worker.dailyWage || 700) / 8;
      const overtimeAmount = Math.round(overtimeHours * hourlyRate * 1.5); // 1.5x overtime multiplier

      const updateData = {
        worker: worker._id,
        workerId: worker.workerId,
        supervisor: req.user._id,
        plantation: plantationId,
        plantationName: authCheck.plantation.name,
        date: attendanceDate,
        status: item.status || 'Present',
        overtimeHours,
        overtimeAmount,
        workType: item.workType || worker.workType || 'General Harvesting',
        remarks: item.remarks || '',
        markedBy: req.user.name || 'Supervisor',
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

    res.status(200).json({
      success: true,
      message: `Attendance recorded for ${updatedRecords.length} workers`,
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
    if (!authCheck) {
      return res.status(403).json({ success: false, message: 'Not authorized to view attendance' });
    }

    const attendanceRecords = await Attendance.find({ plantation: plantationId, date })
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
    if (!authCheck) {
      return res.status(403).json({ success: false, message: 'Not authorized to submit ratings' });
    }

    const wQ = Number(workQuality) || 5;
    const punc = Number(punctuality) || 5;
    const team = Number(teamwork) || 5;
    const prod = Number(productivity) || 5;
    const overallRating = Number(((wQ + punc + team + prod) / 4).toFixed(1));

    const ratingDate = date || new Date().toISOString().split('T')[0];

    const ratingDoc = await WorkerRating.findOneAndUpdate(
      { worker: worker._id, plantation: plantationId || worker.plantationId, date: ratingDate },
      {
        worker: worker._id,
        workerId: worker.workerId,
        plantation: plantationId || worker.plantationId,
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
    if (!authCheck) {
      return res.status(403).json({ success: false, message: 'Not authorized to record payments' });
    }

    const payment = await Payment.create({
      worker: worker._id,
      workerId: worker.workerId,
      plantation: plantationId || worker.plantationId,
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
    if (!authCheck) {
      return res.status(403).json({ success: false, message: 'Not authorized to view monitoring summary' });
    }

    const plantation = authCheck.plantation;
    const workers = await Worker.find({ plantationId });

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.find({ plantation: plantationId, date: todayStr });

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
    const allPayments = await Payment.find({ plantation: plantationId });
    const allAttendance = await Attendance.find({ plantation: plantationId });

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

    // Supervisor Info
    const supervisors = await User.find({
      _id: { $in: [plantation.user, plantation.supervisorId, ...(plantation.assignedSupervisors || [])].filter(Boolean) },
    }).select('name email phone role avatar');

    res.status(200).json({
      success: true,
      plantation: {
        id: plantation._id,
        name: plantation.name,
        location: plantation.location,
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

    const plantation = await Plantation.findById(plantationId);
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
