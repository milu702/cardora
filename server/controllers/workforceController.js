const Worker = require('../models/Worker');
const Contractor = require('../models/Contractor');
const Connection = require('../models/Connection');
const ConnectionRequest = require('../models/ConnectionRequest');
const Task = require('../models/Task');
const Attendance = require('../models/Attendance');
const Payment = require('../models/Payment');
const Rating = require('../models/Rating');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Get all workers with search & filters
// @route   GET /api/workforce/workers
// @access  Public / Protected
exports.getWorkers = async (req, res) => {
  try {
    const {
      district,
      village,
      skills,
      availability,
      minRating,
      maxWage,
      verifiedOnly,
      language,
      query,
    } = req.query;

    let filter = {};

    if (district) {
      filter.district = { $regex: district, $options: 'i' };
    }

    if (village) {
      filter.village = { $regex: village, $options: 'i' };
    }

    if (availability && availability !== 'All') {
      filter.availability = availability;
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    if (maxWage) {
      filter.dailyWage = { $lte: Number(maxWage) };
    }

    if (verifiedOnly === 'true') {
      filter.isVerified = true;
    }

    if (skills) {
      const skillsArray = skills.split(',').map((s) => s.trim());
      filter.skills = { $in: skillsArray.map((s) => new RegExp(s, 'i')) };
    }

    if (language) {
      filter.languages = { $regex: language, $options: 'i' };
    }

    if (query) {
      filter.$or = [
        { fullName: { $regex: query, $options: 'i' } },
        { workerId: { $regex: query, $options: 'i' } },
        { skills: { $regex: query, $options: 'i' } },
        { district: { $regex: query, $options: 'i' } },
        { village: { $regex: query, $options: 'i' } },
      ];
    }

    const workers = await Worker.find(filter)
      .populate('user', 'name username email profilePhoto avatar phone location isVerified role')
      .sort({ rating: -1, completedJobs: -1 });

    res.status(200).json({
      success: true,
      count: workers.length,
      workers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching workers',
    });
  }
};

// @desc    Get worker details by ID
// @route   GET /api/workforce/workers/:id
// @access  Public / Protected
exports.getWorkerById = async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id).populate(
      'user',
      'name username email profilePhoto avatar phone location isVerified bio'
    );

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker profile not found' });
    }

    // Fetch ratings for worker
    const ratings = await Rating.find({ ratedUser: worker.user?._id || worker.user })
      .populate('rater', 'name username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      worker,
      ratings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update current logged-in user's worker profile
// @route   POST /api/workforce/workers/profile
// @access  Private (Worker role)
exports.updateWorkerProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    let worker = await Worker.findOne({ user: userId });

    const workerData = {
      user: userId,
      fullName: req.body.fullName || req.user.name,
      phone: req.body.phone || req.user.phone,
      gender: req.body.gender || 'Male',
      age: req.body.age || 28,
      district: req.body.district || 'Idukki',
      village: req.body.village || 'Vandanmedu',
      languages: Array.isArray(req.body.languages) ? req.body.languages : (req.body.languages || 'Malayalam, Tamil').split(','),
      experience: req.body.experience || '5 Years',
      skills: Array.isArray(req.body.skills) ? req.body.skills : (req.body.skills || '').split(','),
      specializations: Array.isArray(req.body.specializations) ? req.body.specializations : (req.body.specializations || '').split(','),
      dailyWage: Number(req.body.dailyWage) || 850,
      availability: req.body.availability || 'Available Today',
      preferredDistricts: Array.isArray(req.body.preferredDistricts) ? req.body.preferredDistricts : (req.body.preferredDistricts || '').split(','),
      bio: req.body.bio || '',
      photo: req.body.photo || req.user.avatar || req.user.profilePhoto || '',
      emergencyContact: req.body.emergencyContact || { name: '', phone: '', relation: '' },
    };

    if (!workerData.workerId) {
      workerData.workerId = 'WRK-' + Math.floor(1000 + Math.random() * 9000);
    }

    if (worker) {
      worker = await Worker.findOneAndUpdate({ user: userId }, workerData, { new: true });
    } else {
      worker = await Worker.create(workerData);
    }

    // Update user role to Worker if not set
    await User.findByIdAndUpdate(userId, { role: 'Worker' });

    res.status(200).json({
      success: true,
      worker,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get labor contractors list
// @route   GET /api/workforce/contractors
// @access  Public / Protected
exports.getContractors = async (req, res) => {
  try {
    const { district, query } = req.query;
    let filter = {};

    if (district) filter.district = { $regex: district, $options: 'i' };
    if (query) {
      filter.$or = [
        { companyName: { $regex: query, $options: 'i' } },
        { contractorId: { $regex: query, $options: 'i' } },
        { district: { $regex: query, $options: 'i' } },
      ];
    }

    const contractors = await Contractor.find(filter)
      .populate('user', 'name username email profilePhoto avatar phone location isVerified')
      .populate('managedWorkers', 'fullName workerId skills dailyWage photo availability')
      .sort({ rating: -1 });

    res.status(200).json({
      success: true,
      count: contractors.length,
      contractors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create or update current logged-in user's contractor profile
// @route   POST /api/workforce/contractors/profile
// @access  Public / Protected
exports.updateContractorProfile = async (req, res) => {
  try {
    const userId = (req.user && req.user._id) || req.body.userId || req.body.user;

    if (!userId) {
      // Find any first user or admin as fallback if user ID isn't provided
      const fallbackUser = await User.findOne({});
      if (!fallbackUser) {
        return res.status(400).json({ success: false, message: 'No registered user account found' });
      }
      req.user = fallbackUser;
    }

    const targetUserId = (req.user && req.user._id) || req.body.userId || req.body.user;
    const targetUser = req.user || (await User.findById(targetUserId));
    const userName = targetUser ? (targetUser.fullName || targetUser.name || targetUser.username || 'Labor Guild Owner') : 'Labor Guild Owner';

    let contractor = await Contractor.findOne({ user: targetUserId });

    const companyName = (req.body.companyName && req.body.companyName.trim()) || `${userName}'s Labor Guild`;
    const phone = (req.body.phone && req.body.phone.trim()) || (targetUser ? targetUser.phone : '') || '+91 94471 00000';

    const contractorData = {
      user: targetUserId,
      companyName,
      phone,
      teamSize: Number(req.body.teamSize) || 15,
      district: req.body.district || (targetUser ? targetUser.district : 'Idukki') || 'Idukki',
      preferredDistricts: Array.isArray(req.body.preferredDistricts)
        ? req.body.preferredDistricts
        : (req.body.preferredDistricts || 'Idukki, Wayanad').split(',').map((d) => d.trim()),
      specialization: req.body.specialization || 'Cardamom Plantation Workforce & Harvest Crew',
      dailyRatesRange: {
        min: Number(req.body.dailyWageMin) || 800,
        max: Number(req.body.dailyWageMax) || 1200,
      },
      availabilityStatus: req.body.availabilityStatus || 'Available for Contracts',
      bio: req.body.bio || `Licensed labor team managed by ${userName} supplying skilled cardamom workers.`,
      isVerified: true,
    };

    if (!contractor) {
      contractorData.contractorId = 'CTR-' + Math.floor(1000 + Math.random() * 9000);
      contractor = await Contractor.create(contractorData);
    } else {
      contractor = await Contractor.findOneAndUpdate({ user: targetUserId }, contractorData, { new: true });
    }

    // Update user role to Labor Contractor if not set
    await User.findByIdAndUpdate(targetUserId, { role: 'Labor Contractor', phone });

    res.status(200).json({
      success: true,
      message: 'Labor Contractor registered successfully & saved to MongoDB Atlas',
      contractor,
    });
  } catch (error) {
    console.error('updateContractorProfile Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Error updating contractor profile' });
  }
};

// @desc    Send connection request to another user
// @route   POST /api/workforce/connections/request
// @access  Private
exports.sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, note, roleType } = req.body;

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot connect with yourself' });
    }

    // Check if connection already exists
    const existingConn = await Connection.findOne({
      $or: [
        { user1: senderId, user2: receiverId },
        { user1: receiverId, user2: senderId },
      ],
      status: 'active',
    });

    if (existingConn) {
      return res.status(400).json({ success: false, message: 'You are already connected' });
    }

    // Check existing pending request
    let request = await ConnectionRequest.findOne({
      sender: senderId,
      receiver: receiverId,
      status: 'pending',
    });

    if (request) {
      return res.status(400).json({ success: false, message: 'Connection request already pending' });
    }

    request = await ConnectionRequest.create({
      sender: senderId,
      receiver: receiverId,
      note: note || 'Would like to connect on Cardora Workforce Network',
      roleType: roleType || 'owner_worker',
    });

    // Create Notification for Receiver
    await Notification.create({
      user: receiverId,
      sender: senderId,
      type: 'connection_request',
      title: '🤝 New Connection Request',
      message: `${req.user.name} sent you a connection request.`,
    });

    res.status(201).json({
      success: true,
      message: 'Connection request sent successfully',
      request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Respond to connection request (accept, reject, block)
// @route   PUT /api/workforce/connections/request/:id
// @access  Private
exports.respondConnectionRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accepted', 'rejected', 'blocked'
    const requestId = req.params.id;

    const request = await ConnectionRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Connection request not found' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this request' });
    }

    request.status = action;
    await request.save();

    if (action === 'accepted') {
      // Create bilateral Connection
      await Connection.create({
        user1: request.sender,
        user2: request.receiver,
        roleType: request.roleType,
        status: 'active',
      });

      // Send notification to sender
      await Notification.create({
        user: request.sender,
        sender: req.user._id,
        type: 'connection_accepted',
        title: '🎉 Connection Request Accepted',
        message: `${req.user.name} accepted your connection request! You can now assign work, view full profile, and message.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Connection request ${action}`,
      request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get active connections for current user
// @route   GET /api/workforce/connections
// @access  Private
exports.getConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const connections = await Connection.find({
      $or: [{ user1: userId }, { user2: userId }],
      status: 'active',
    })
      .populate('user1', 'name username email profilePhoto avatar phone location role isVerified')
      .populate('user2', 'name username email profilePhoto avatar phone location role isVerified');

    // Format output to return connected user object
    const connectedUsers = connections.map((conn) => {
      const otherUser = conn.user1._id.toString() === userId.toString() ? conn.user2 : conn.user1;
      return {
        connectionId: conn._id,
        connectedSince: conn.connectedSince,
        roleType: conn.roleType,
        user: otherUser,
      };
    });

    res.status(200).json({
      success: true,
      count: connectedUsers.length,
      connections: connectedUsers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending connection requests (incoming & outgoing)
// @route   GET /api/workforce/connections/requests
// @access  Private
exports.getConnectionRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const incoming = await ConnectionRequest.find({ receiver: userId, status: 'pending' })
      .populate('sender', 'name username email profilePhoto avatar phone location role isVerified')
      .sort({ createdAt: -1 });

    const outgoing = await ConnectionRequest.find({ sender: userId, status: 'pending' })
      .populate('receiver', 'name username email profilePhoto avatar phone location role isVerified')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      incoming,
      outgoing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new task
// @route   POST /api/workforce/tasks
// @access  Private (Owner / Contractor)
exports.createTask = async (req, res) => {
  try {
    const ownerId = req.user._id;

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || 'Medium',
      deadline: req.body.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      plantation: req.body.plantationId || null,
      plantationName: req.body.plantationName || 'Vandanmedu Green Estate',
      owner: ownerId,
      assignedWorkers: req.body.assignedWorkers || [],
      requiredWorkersCount: req.body.requiredWorkersCount || 5,
      dailyWage: req.body.dailyWage || 850,
      photos: req.body.photos || [],
      status: 'pending',
    });

    // Send notifications to assigned workers
    if (Array.isArray(req.body.assignedWorkers) && req.body.assignedWorkers.length > 0) {
      const notifs = req.body.assignedWorkers.map((wId) => ({
        user: wId,
        sender: ownerId,
        type: 'task_assigned',
        title: '📋 New Plantation Task Assigned',
        message: `You have been assigned to task: "${task.title}" at ${task.plantationName}`,
      }));
      await Notification.insertMany(notifs);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's tasks
// @route   GET /api/workforce/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const tasks = await Task.find({
      $or: [{ owner: userId }, { assignedWorkers: userId }, { contractor: userId }],
    })
      .populate('owner', 'name username avatar phone')
      .populate('assignedWorkers', 'name username avatar phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task status & progress updates
// @route   PUT /api/workforce/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status, progressText, photo } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (status) {
      task.status = status;
    }

    if (progressText) {
      task.progressUpdates.push({
        author: req.user._id,
        authorName: req.user.name,
        text: progressText,
        photos: photo ? [photo] : [],
        timestamp: new Date(),
      });
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    GPS Check-in for Attendance
// @route   POST /api/workforce/attendance/check-in
// @access  Private (Worker)
exports.checkInAttendance = async (req, res) => {
  try {
    const workerId = req.user._id;
    const { taskId, plantationId, plantationName, lat, lng, address } = req.body;
    const today = new Date().toISOString().split('T')[0];

    let attendance = await Attendance.findOne({ worker: workerId, date: today });

    if (attendance) {
      return res.status(400).json({ success: false, message: 'Worker already checked in today' });
    }

    attendance = await Attendance.create({
      worker: workerId,
      task: taskId || null,
      plantation: plantationId || null,
      plantationName: plantationName || 'Vandanmedu Green Estate',
      date: today,
      checkInTime: new Date(),
      checkInLocation: {
        lat: lat || 9.7891,
        lng: lng || 77.1685,
        address: address || 'Vandanmedu Estate, Idukki',
      },
      status: 'Present',
    });

    res.status(201).json({
      success: true,
      message: 'GPS Check-in recorded successfully! Status: Present 🟢',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    GPS Check-out for Attendance
// @route   POST /api/workforce/attendance/check-out
// @access  Private (Worker)
exports.checkOutAttendance = async (req, res) => {
  try {
    const workerId = req.user._id;
    const { lat, lng, address } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOne({ worker: workerId, date: today });

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Check-in record for today not found' });
    }

    attendance.checkOutTime = new Date();
    attendance.checkOutLocation = {
      lat: lat || 9.7891,
      lng: lng || 77.1685,
      address: address || 'Vandanmedu Estate, Idukki',
    };

    const durationHrs = Math.max(1, (attendance.checkOutTime - attendance.checkInTime) / (1000 * 60 * 60));
    attendance.workingHours = Number(durationHrs.toFixed(1));

    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'GPS Check-out recorded successfully! Total hours: ' + attendance.workingHours + ' hrs',
      attendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance records
// @route   GET /api/workforce/attendance
// @access  Private
exports.getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { workerId } = req.query;

    const queryWorker = workerId || userId;

    const history = await Attendance.find({ worker: queryWorker })
      .populate('worker', 'name username avatar phone')
      .sort({ checkInTime: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Record payment & generate receipt
// @route   POST /api/workforce/payments
// @access  Private (Owner / Contractor)
exports.recordPayment = async (req, res) => {
  try {
    const payerId = req.user._id;
    const { payeeId, taskId, amount, paymentType, paymentMethod, upiReference, notes } = req.body;

    const payment = await Payment.create({
      payer: payerId,
      payee: payeeId,
      task: taskId || null,
      amount: Number(amount),
      paymentType: paymentType || 'Daily Wage',
      paymentMethod: paymentMethod || 'UPI',
      upiReference: upiReference || 'UPI' + Math.floor(100000000000 + Math.random() * 900000000000),
      notes: notes || 'Cardamom harvest payment',
      status: 'Completed',
    });

    // Notify payee
    await Notification.create({
      user: payeeId,
      sender: payerId,
      type: 'payment_received',
      title: '💰 Payment Received!',
      message: `Received ₹${amount} via ${payment.paymentMethod} from ${req.user.name}. Receipt: ${payment.receiptNumber}`,
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded & Digital Receipt generated',
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment history
// @route   GET /api/workforce/payments
// @access  Private
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const payments = await Payment.find({
      $or: [{ payer: userId }, { payee: userId }],
    })
      .populate('payer', 'name username avatar phone')
      .populate('payee', 'name username avatar phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit worker/owner rating
// @route   POST /api/workforce/ratings
// @access  Private
exports.submitRating = async (req, res) => {
  try {
    const raterId = req.user._id;
    const { ratedUserId, taskId, score, reviewText, professionalism, quality, communication, punctuality } = req.body;

    const rating = await Rating.create({
      rater: raterId,
      ratedUser: ratedUserId,
      task: taskId || null,
      score: Number(score),
      reviewText: reviewText || '',
      professionalism: Number(professionalism) || 5,
      quality: Number(quality) || 5,
      communication: Number(communication) || 5,
      punctuality: Number(punctuality) || 5,
    });

    // Update aggregate rating on Worker model if rated user is a worker
    const allRatings = await Rating.find({ ratedUser: ratedUserId });
    const avgScore = allRatings.reduce((acc, curr) => acc + curr.score, 0) / allRatings.length;

    await Worker.findOneAndUpdate(
      { user: ratedUserId },
      { rating: Number(avgScore.toFixed(1)), totalRatingsCount: allRatings.length }
    );

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully!',
      rating,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Get verifications queue and complaints
// @route   GET /api/workforce/admin/verifications
// @access  Private (Admin)
exports.getAdminVerifications = async (req, res) => {
  try {
    const unverifiedWorkers = await Worker.find({ isVerified: false }).populate('user', 'name email phone avatar');
    const unverifiedContractors = await Contractor.find({ isVerified: false }).populate('user', 'name email phone avatar');
    const complaints = await Complaint.find()
      .populate('reportedBy', 'name email avatar')
      .populate('reportedUser', 'name email avatar role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      unverifiedWorkers,
      unverifiedContractors,
      complaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin: Verify user account or suspend fake profile
// @route   PUT /api/workforce/admin/verify/:id
// @access  Private (Admin)
exports.adminVerifyUser = async (req, res) => {
  try {
    const { targetType, action } = req.body; // targetType: 'worker' | 'contractor' | 'user', action: 'approve' | 'suspend'

    if (targetType === 'worker') {
      const worker = await Worker.findById(req.params.id);
      if (worker) {
        worker.isVerified = action === 'approve';
        worker.verificationStatus = action === 'approve' ? 'Verified' : 'Rejected';
        await worker.save();
      }
    } else if (targetType === 'contractor') {
      const contractor = await Contractor.findById(req.params.id);
      if (contractor) {
        contractor.isVerified = action === 'approve';
        contractor.verificationStatus = action === 'approve' ? 'Verified' : 'Rejected';
        await contractor.save();
      }
    }

    if (action === 'suspend') {
      await User.findByIdAndUpdate(req.params.id, { status: 'deactivated' });
    }

    res.status(200).json({
      success: true,
      message: `Account action ${action} executed successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit complaint against fake account or violation
// @route   POST /api/workforce/complaints
// @access  Private
exports.submitComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create({
      reportedBy: req.user._id,
      reportedUser: req.body.reportedUserId,
      reason: req.body.reason,
      description: req.body.description,
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted to Admin moderation team',
      complaint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
