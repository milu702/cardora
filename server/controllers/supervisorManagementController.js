const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const Plantation = require('../models/Plantation');
const SupervisorInvitation = require('../models/SupervisorInvitation');
const SupervisorAssignment = require('../models/SupervisorAssignment');
const PlantationActivity = require('../models/PlantationActivity');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Task = require('../models/Task');
const Worker = require('../models/Worker');
const Attendance = require('../models/Attendance');
const sendEmail = require('../utils/sendEmail');
const { logActivity } = require('../services/activityLogger');

/**
 * 1. Send Supervisor Invitation (By Owner)
 */
exports.sendSupervisorInvitation = async (req, res) => {
  try {
    const { email, plantationId, permissions, message } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Supervisor email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify plantation ownership
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

    if (plantation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Only plantation owner can send supervisor invitations' });
    }

    // Check if email already has active supervisor relationship with this owner/plantation
    const existingSupervisor = await User.findOne({ email: cleanEmail });
    if (existingSupervisor) {
      const activeAssignment = await SupervisorAssignment.findOne({
        supervisor: existingSupervisor._id,
        plantation: plantation._id,
        status: 'Active',
      });
      if (activeAssignment || (plantation.supervisorId && plantation.supervisorId.toString() === existingSupervisor._id.toString())) {
        return res.status(400).json({ success: false, message: 'Supervisor already assigned to this plantation.' });
      }
    }

    // Check for existing pending invitation
    let invitation = await SupervisorInvitation.findOne({
      email: cleanEmail,
      plantation: plantation._id,
      status: 'Pending',
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days

    const defaultPermissions = {
      workersManagement: true,
      attendanceManagement: true,
      taskManagement: true,
      activityManagement: true,
      wageManagement: true,
      plantationReports: true,
      weatherView: true,
      plantationDataView: true,
      messaging: true,
      ...(permissions || {}),
    };

    if (invitation) {
      invitation.token = token;
      invitation.expiresAt = expiresAt;
      invitation.permissions = defaultPermissions;
      invitation.message = message || invitation.message;
      await invitation.save();
    } else {
      invitation = await SupervisorInvitation.create({
        email: cleanEmail,
        owner: req.user._id,
        plantation: plantation._id,
        plantationName: plantation.name,
        permissions: defaultPermissions,
        token,
        message: message || `You have been invited to supervise ${plantation.name}`,
        expiresAt,
        status: 'Pending',
      });
    }

    const ownerName = req.user.fullName || req.user.name || 'Cardamom Estate Owner';
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/accept-invitation?token=${token}`;

    // Send email with Cardora branding
    const emailSubject = `🌿 Cardora Plantation Supervisor Invitation — ${plantation.name}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 28px; background-color: #F8FAF7; border-radius: 16px; color: #17331F; max-width: 600px; margin: 0 auto; border: 1px solid #D7E6D5;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #1F5E3B; font-weight: 900; margin: 0; font-size: 24px;">🌿 CARDORA</h2>
          <p style="color: #5C8D4E; font-size: 13px; font-weight: bold; margin-top: 4px; uppercase; tracking-wider;">Smart Cardamom Agriculture</p>
        </div>

        <div style="background-color: #FFFFFF; padding: 24px; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <h3 style="margin-top: 0; color: #17331F; font-size: 18px;">Plantation Supervisor Invitation</h3>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Hello, you have been invited by <strong>${ownerName}</strong> to supervise the following plantation estate:
          </p>

          <table style="width: 100%; margin: 16px 0; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748B;">Plantation:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1F5E3B;">${plantation.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748B;">Location:</td>
              <td style="padding: 8px 0; font-weight: bold;">${plantation.location || 'Idukki, Kerala'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748B;">Estate Owner:</td>
              <td style="padding: 8px 0; font-weight: bold;">${ownerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748B;">Invitation Expiry:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #D97706;">${new Date(expiresAt).toLocaleDateString()}</td>
            </tr>
          </table>

          ${invitation.message ? `<div style="background-color: #F1F5F9; padding: 12px 16px; border-radius: 8px; font-style: italic; font-size: 13px; color: #475569; margin: 16px 0;">"${invitation.message}"</div>` : ''}

          <div style="text-align: center; margin-top: 28px;">
            <a href="${inviteLink}" style="display: inline-block; padding: 14px 32px; background-color: #1F5E3B; color: #FFFFFF; text-decoration: none; font-weight: bold; border-radius: 12px; font-size: 15px; box-shadow: 0 4px 12px rgba(31,94,59,0.3);">
              Accept Invitation
            </a>
          </div>
        </div>

        <p style="font-size: 12px; color: #94A3B8; text-align: center; margin-top: 24px;">
          If button doesn't work, copy & paste this URL: <br/>
          <a href="${inviteLink}" style="color: #1F5E3B;">${inviteLink}</a>
        </p>
      </div>
    `;

    await sendEmail({
      email: cleanEmail,
      subject: emailSubject,
      message: `You've been invited as Plantation Supervisor for ${plantation.name}. Accept at ${inviteLink}`,
      html: emailHtml,
    });

    await logActivity({
      req,
      ownerId: req.user._id,
      plantationId: plantation._id,
      action: 'SUPERVISOR_INVITATION_SENT',
      entityType: 'SupervisorInvitation',
      entityId: invitation._id,
      description: `Sent supervisor invitation email to ${cleanEmail} for plantation "${plantation.name}"`,
      metadata: { email: cleanEmail, plantationName: plantation.name, expiresAt },
    });

    res.status(200).json({
      success: true,
      message: `Invitation successfully sent to ${cleanEmail}`,
      invitation,
    });
  } catch (error) {
    console.error('sendSupervisorInvitation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send invitation' });
  }
};

/**
 * 2. Get Invitation Details by Token (Public / Auth Route)
 */
exports.getInvitationByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await SupervisorInvitation.findOne({ token })
      .populate('owner', 'name fullName email avatar phone')
      .populate('plantation', 'name location district area variety image');

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invalid or expired invitation token.' });
    }

    if (invitation.status === 'Pending' && new Date() > new Date(invitation.expiresAt)) {
      invitation.status = 'Expired';
      await invitation.save();
      await logActivity({
        actorRole: 'system',
        ownerId: invitation.owner._id,
        plantationId: invitation.plantation._id,
        action: 'SUPERVISOR_INVITATION_EXPIRED',
        entityType: 'SupervisorInvitation',
        entityId: invitation._id,
        description: `Invitation for ${invitation.email} has expired.`,
      });
    }

    res.status(200).json({
      success: true,
      invitation,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Accept Supervisor Invitation
 */
exports.acceptSupervisorInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, name, phone } = req.body;

    const invitation = await SupervisorInvitation.findOne({ token })
      .populate('owner')
      .populate('plantation');

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found or invalid link.' });
    }

    if (invitation.status === 'Accepted') {
      return res.status(400).json({ success: false, message: 'Invitation has already been accepted.' });
    }

    if (invitation.status === 'Expired' || new Date() > new Date(invitation.expiresAt)) {
      invitation.status = 'Expired';
      await invitation.save();
      await logActivity({
        actorRole: 'system',
        ownerId: invitation.owner?._id,
        plantationId: invitation.plantation?._id,
        action: 'SUPERVISOR_INVITATION_EXPIRED',
        entityType: 'SupervisorInvitation',
        entityId: invitation._id,
        description: `Invitation acceptance attempt failed: Token expired for ${invitation.email}`,
      });
      return res.status(400).json({ success: false, message: 'This invitation link has expired.' });
    }

    if (invitation.status === 'Revoked') {
      return res.status(400).json({ success: false, message: 'This invitation was revoked by the estate owner.' });
    }

    let supervisorUser;
    if (req.user) {
      supervisorUser = req.user;
    } else {
      supervisorUser = await User.findOne({ email: invitation.email });
    }

    if (!supervisorUser) {
      const cleanEmail = invitation.email.toLowerCase();
      const username = `sup_${cleanEmail.split('@')[0]}_${Math.floor(100 + Math.random() * 900)}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
      const rawPassword = password || `Sup@${Math.floor(10000 + Math.random() * 90000)}`;

      supervisorUser = await User.create({
        name: name || cleanEmail.split('@')[0],
        username,
        email: cleanEmail,
        password: rawPassword,
        role: 'Supervisor',
        phone: phone || '',
        location: invitation.plantation?.location || 'Idukki, Kerala',
        assignedPlantation: invitation.plantation._id,
        isVerified: true,
      });
    } else {
      supervisorUser.role = 'Supervisor';
      supervisorUser.assignedPlantation = invitation.plantation._id;
      if (password) supervisorUser.password = password;
      await supervisorUser.save();
    }

    // Create or Update Supervisor Assignment
    const assignment = await SupervisorAssignment.findOneAndUpdate(
      { supervisor: supervisorUser._id, plantation: invitation.plantation._id },
      {
        owner: invitation.owner._id,
        supervisor: supervisorUser._id,
        plantation: invitation.plantation._id,
        permissions: invitation.permissions,
        status: 'Active',
        assignedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Link supervisor to plantation
    const plantation = await Plantation.findById(invitation.plantation._id);
    if (plantation) {
      plantation.supervisorId = supervisorUser._id;
      if (!plantation.assignedSupervisors) plantation.assignedSupervisors = [];
      if (!plantation.assignedSupervisors.includes(supervisorUser._id)) {
        plantation.assignedSupervisors.push(supervisorUser._id);
      }
      await plantation.save();
    }

    invitation.status = 'Accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    // Log Activity
    await logActivity({
      req,
      actorId: supervisorUser._id,
      actorRole: 'supervisor',
      actorName: supervisorUser.fullName || supervisorUser.name,
      ownerId: invitation.owner._id,
      supervisorId: supervisorUser._id,
      plantationId: invitation.plantation._id,
      action: 'SUPERVISOR_INVITATION_ACCEPTED',
      entityType: 'SupervisorInvitation',
      entityId: invitation._id,
      description: `${supervisorUser.name} accepted supervisor invitation for ${invitation.plantationName}`,
      metadata: { supervisorEmail: supervisorUser.email, plantationName: invitation.plantationName },
    });

    // Notify Owner
    await Notification.create({
      user: invitation.owner._id,
      sender: supervisorUser._id,
      type: 'system',
      title: 'Supervisor Invitation Accepted',
      message: `${supervisorUser.name} accepted your invitation to supervise ${invitation.plantationName}`,
      link: '/dashboard?tab=workforce',
    });

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully! Welcome to Cardora Supervisor Portal.',
      supervisor: {
        id: supervisorUser._id,
        name: supervisorUser.name,
        email: supervisorUser.email,
        role: supervisorUser.role,
      },
      plantationId: invitation.plantation._id,
      assignment,
    });
  } catch (error) {
    console.error('acceptSupervisorInvitation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Reject Supervisor Invitation
 */
exports.rejectSupervisorInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await SupervisorInvitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    invitation.status = 'Rejected';
    invitation.rejectedAt = new Date();
    await invitation.save();

    await logActivity({
      req,
      actorRole: 'user',
      actorName: invitation.email,
      ownerId: invitation.owner,
      plantationId: invitation.plantation,
      action: 'SUPERVISOR_INVITATION_REJECTED',
      entityType: 'SupervisorInvitation',
      entityId: invitation._id,
      description: `Invitation for ${invitation.email} was rejected.`,
    });

    await Notification.create({
      user: invitation.owner,
      type: 'alert',
      title: 'Supervisor Invitation Declined',
      message: `The invitation sent to ${invitation.email} for ${invitation.plantationName} was declined.`,
      link: '/dashboard?tab=workforce',
    });

    res.status(200).json({
      success: true,
      message: 'Invitation has been declined.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Get Owner Supervisors & Invitations
 */
exports.getOwnerSupervisors = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // Get assigned plantations for this owner
    const ownerPlantations = await Plantation.find({ user: ownerId });
    const plantationIds = ownerPlantations.map((p) => p._id);

    const assignments = await SupervisorAssignment.find({ owner: ownerId })
      .populate('supervisor', 'name fullName username email phone avatar role status createdAt')
      .populate('plantation', 'name location area district');

    const invitations = await SupervisorInvitation.find({ owner: ownerId })
      .populate('plantation', 'name location');

    // Fetch last activity for each supervisor
    const supervisorsWithLastActivity = await Promise.all(
      assignments.map(async (assign) => {
        const supObj = assign.supervisor?.toObject ? assign.supervisor.toObject() : assign.supervisor;
        let lastActivity = null;
        if (assign.supervisor) {
          lastActivity = await ActivityLog.findOne({ supervisorId: assign.supervisor._id }).sort({ createdAt: -1 });
        }
        return {
          ...assign.toObject(),
          supervisor: supObj,
          lastActivityDate: lastActivity?.createdAt || assign.assignedAt,
          lastActivityAction: lastActivity?.action || 'ASSIGNED',
          lastActivityDescription: lastActivity?.description || 'Assigned to plantation',
        };
      })
    );

    res.status(200).json({
      success: true,
      supervisors: supervisorsWithLastActivity,
      invitations,
      plantations: ownerPlantations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. Get Supervisor Detailed Profile for Owner
 */
exports.getSupervisorProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const supervisor = await User.findById(id).select('-password');
    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    const assignments = await SupervisorAssignment.find({ supervisor: id })
      .populate('plantation', 'name location district area');

    const workersCount = await Worker.countDocuments({ supervisorId: id });
    const attendanceCount = await Attendance.countDocuments({ supervisor: id });
    const completedTasksCount = await Task.countDocuments({ assignedWorkers: id, status: 'completed' });
    const totalTasksCount = await Task.countDocuments({ assignedWorkers: id });

    const recentActivities = await ActivityLog.find({ supervisorId: id })
      .sort({ createdAt: -1 })
      .limit(15);

    res.status(200).json({
      success: true,
      supervisor,
      assignments,
      summary: {
        workersCount,
        attendanceCount,
        completedTasksCount,
        totalTasksCount,
        taskCompletionRate: totalTasksCount ? Math.round((completedTasksCount / totalTasksCount) * 100) : 100,
      },
      recentActivities,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. Update Supervisor Permissions
 */
exports.updateSupervisorPermissions = async (req, res) => {
  try {
    const { id } = req.params; // SupervisorAssignment ID or Supervisor User ID
    const { permissions, plantationId } = req.body;

    let assignment;
    if (mongoose.Types.ObjectId.isValid(id)) {
      assignment = await SupervisorAssignment.findById(id);
    }
    if (!assignment && plantationId) {
      assignment = await SupervisorAssignment.findOne({ supervisor: id, plantation: plantationId });
    }
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Supervisor assignment record not found' });
    }

    if (assignment.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to change permissions' });
    }

    assignment.permissions = {
      ...assignment.permissions,
      ...permissions,
    };
    await assignment.save();

    await logActivity({
      req,
      ownerId: req.user._id,
      supervisorId: assignment.supervisor,
      plantationId: assignment.plantation,
      action: 'SUPERVISOR_PERMISSIONS_UPDATED',
      entityType: 'SupervisorAssignment',
      entityId: assignment._id,
      description: 'Owner updated supervisor permission flags',
      metadata: { permissions: assignment.permissions },
    });

    // Notify supervisor
    await Notification.create({
      user: assignment.supervisor,
      sender: req.user._id,
      type: 'system',
      title: 'Supervisor Permissions Updated',
      message: 'Your owner updated your plantation access permissions.',
      link: '/dashboard?tab=workforce',
    });

    res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
      assignment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 8. Revoke Supervisor Access
 */
exports.revokeSupervisorAccess = async (req, res) => {
  try {
    const { id } = req.params;
    let assignment = await SupervisorAssignment.findById(id);

    if (!assignment) {
      assignment = await SupervisorAssignment.findOne({ supervisor: id });
    }
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Supervisor assignment record not found' });
    }

    if (assignment.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to revoke access' });
    }

    assignment.status = 'Revoked';
    assignment.revokedAt = new Date();
    await assignment.save();

    // Remove supervisor from Plantation active reference
    const plantation = await Plantation.findById(assignment.plantation);
    if (plantation) {
      if (plantation.supervisorId && plantation.supervisorId.toString() === assignment.supervisor.toString()) {
        plantation.supervisorId = null;
      }
      if (plantation.assignedSupervisors) {
        plantation.assignedSupervisors = plantation.assignedSupervisors.filter(
          (supId) => supId.toString() !== assignment.supervisor.toString()
        );
      }
      await plantation.save();
    }

    // Historical activity logs MUST remain intact
    await logActivity({
      req,
      ownerId: req.user._id,
      supervisorId: assignment.supervisor,
      plantationId: assignment.plantation,
      action: 'SUPERVISOR_ACCESS_REVOKED',
      entityType: 'SupervisorAssignment',
      entityId: assignment._id,
      description: `Owner revoked supervisor access for plantation "${plantation?.name || 'Estate'}"`,
    });

    await Notification.create({
      user: assignment.supervisor,
      sender: req.user._id,
      type: 'alert',
      title: 'Supervisor Access Revoked',
      message: `Your access to supervise ${plantation?.name || 'estate'} has been revoked.`,
    });

    res.status(200).json({
      success: true,
      message: 'Supervisor access successfully revoked. Historical logs preserved.',
      assignment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 9. Reassign Supervisor to Another Plantation
 */
exports.reassignSupervisor = async (req, res) => {
  try {
    const { id } = req.params; // Supervisor User ID or Assignment ID
    const { newPlantationId } = req.body;

    let assignment = await SupervisorAssignment.findById(id);
    let supervisorId = id;
    if (assignment) {
      supervisorId = assignment.supervisor;
    }

    const newPlantation = await Plantation.findById(newPlantationId);
    if (!newPlantation) {
      return res.status(404).json({ success: false, message: 'Target plantation not found' });
    }

    if (newPlantation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to reassign to this plantation' });
    }

    // Mark previous active assignment as revoked or completed
    if (assignment) {
      assignment.status = 'Revoked';
      assignment.revokedAt = new Date();
      await assignment.save();
    }

    // Create new assignment
    const newAssignment = await SupervisorAssignment.create({
      owner: req.user._id,
      supervisor: supervisorId,
      plantation: newPlantation._id,
      permissions: assignment ? assignment.permissions : undefined,
      status: 'Active',
      assignedAt: new Date(),
    });

    // Update plantation supervisor link
    newPlantation.supervisorId = supervisorId;
    if (!newPlantation.assignedSupervisors.includes(supervisorId)) {
      newPlantation.assignedSupervisors.push(supervisorId);
    }
    await newPlantation.save();

    await logActivity({
      req,
      ownerId: req.user._id,
      supervisorId,
      plantationId: newPlantation._id,
      action: 'SUPERVISOR_REASSIGNED',
      entityType: 'SupervisorAssignment',
      entityId: newAssignment._id,
      description: `Supervisor reassigned to plantation "${newPlantation.name}"`,
    });

    res.status(200).json({
      success: true,
      message: `Supervisor successfully reassigned to ${newPlantation.name}`,
      assignment: newAssignment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 10. Owner Activity History (Filterable & Paginated)
 */
exports.getOwnerActivityHistory = async (req, res) => {
  try {
    const { supervisorId, plantationId, action, dateFrom, dateTo, search, page = 1, limit = 20 } = req.query;

    const query = { ownerId: req.user._id };

    if (supervisorId) {
      query.supervisorId = supervisorId;
    }
    if (plantationId) {
      query.plantationId = plantationId;
    }
    if (action && action !== 'All') {
      query.action = action;
    }
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
    }
    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { actorName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const totalCount = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('actorId', 'name fullName email avatar role')
      .populate('supervisorId', 'name fullName email')
      .populate('plantationId', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      totalCount,
      page: Number(page),
      totalPages: Math.ceil(totalCount / Number(limit)),
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 11. Plantation Combined Central History Timeline (Owner, Supervisor, System, IoT, AI)
 */
exports.getPlantationCombinedHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 25 } = req.query;

    const plantation = await Plantation.findById(id);
    if (!plantation) {
      return res.status(404).json({ success: false, message: 'Plantation not found' });
    }

    const query = { plantationId: id };
    const skip = (Number(page) - 1) * Number(limit);
    const totalCount = await ActivityLog.countDocuments(query);

    const logs = await ActivityLog.find(query)
      .populate('actorId', 'name fullName email avatar role')
      .populate('supervisorId', 'name fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      plantationName: plantation.name,
      totalCount,
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 12. Record Plantation Activity (Supervisor / Owner)
 */
exports.recordPlantationActivity = async (req, res) => {
  try {
    const {
      plantationId,
      activityType: inputType,
      type,
      title,
      date,
      block,
      description: inputDesc,
      materialsUsed,
      quantity,
      workersInvolved,
      weatherCondition,
      notes,
      photo,
    } = req.body;

    const activityType = inputType || type || title || 'Fertilizer application';
    const description = inputDesc || title || activityType || 'Plantation Field Activity';

    let plantation;
    if (plantationId && mongoose.Types.ObjectId.isValid(plantationId)) {
      plantation = await Plantation.findById(plantationId);
    }
    if (!plantation && req.user?._id) {
      plantation = await Plantation.findOne({
        $or: [
          { user: req.user._id },
          { supervisor: req.user._id },
          { assignedSupervisors: req.user._id },
        ],
      });
    }
    if (!plantation) {
      plantation = await Plantation.findOne({});
    }
    if (!plantation) {
      plantation = await Plantation.create({
        user: req.user?._id || new mongoose.Types.ObjectId(),
        title: 'Cardora Estate (Main)',
        location: 'Idukki, Kerala',
        cropType: 'Cardamom',
        areaSize: '15 Acres',
        status: 'Active',
        history: [],
      });
    }

    const activity = await PlantationActivity.create({
      plantation: plantation._id,
      supervisor: req.user?._id || plantation.user,
      owner: plantation.user || req.user?._id,
      activityType,
      date: date ? new Date(date) : new Date(),
      block: block || 'Main Block',
      description,
      materialsUsed: materialsUsed || '',
      quantity: quantity || '',
      workersInvolved: Number(workersInvolved) || 0,
      weatherCondition: weatherCondition || 'Clear',
      notes: notes || '',
      photo: photo || '',
    });

    // Append to Plantation history timeline array
    if (plantation.history) {
      plantation.history.push({
        title: title || `${activityType} — ${block || 'Main Block'}`,
        category: activityType,
        timestamp: activity.date,
        details: description,
      });
      await plantation.save().catch(() => {});
    }

    await logActivity({
      req,
      ownerId: plantation.user,
      supervisorId: req.user?._id,
      plantationId: plantation._id,
      action: 'PLANTATION_ACTIVITY_CREATED',
      entityType: 'PlantationActivity',
      entityId: activity._id,
      description: `Recorded plantation activity "${activityType}": ${description}`,
      metadata: { activityType, block, materialsUsed, quantity, workersInvolved },
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Plantation activity recorded successfully',
      activity,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 13. Get Plantation Activities
 */
exports.getPlantationActivities = async (req, res) => {
  try {
    const { plantationId } = req.query;

    const query = {};
    if (plantationId) query.plantation = plantationId;

    const activities = await PlantationActivity.find(query)
      .populate('supervisor', 'name fullName email avatar')
      .populate('plantation', 'name location')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
