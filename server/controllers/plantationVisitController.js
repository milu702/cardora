const PlantationVisit = require('../models/PlantationVisit');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

// @desc    Schedule a new On-Site Plantation Visit request to owner
// @route   POST /api/plantation-visits
// @access  Private
exports.scheduleVisit = async (req, res) => {
  try {
    let { ownerId, plotId, plotTitle, plotLocation, visitDate, visitTime, visitorName, visitorPhone, notes } = req.body;

    // Validate that visitDate is not in the past
    if (visitDate) {
      const selectedDate = new Date(visitDate);
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);

      if (selectedDate < todayMidnight) {
        return res.status(400).json({
          success: false,
          message: 'Visit date must be today or a future date.',
        });
      }
    }


    // Resolve owner user if ownerId is a string name or username
    let ownerUser = null;
    if (ownerId && ownerId.match(/^[0-9a-fA-F]{24}$/)) {
      ownerUser = await User.findById(ownerId);
    }

    if (!ownerUser && ownerId) {
      ownerUser = await User.findOne({
        $or: [
          { username: ownerId },
          { name: new RegExp(ownerId, 'i') },
          { email: new RegExp(ownerId, 'i') },
        ],
      });
    }

    // Fallback: If no owner user matched, assign to first registered planter/admin or current user
    if (!ownerUser) {
      ownerUser = await User.findOne({ role: { $in: ['Farmer', 'Planter', 'Admin', 'admin'] } });
    }

    const finalOwnerId = ownerUser ? ownerUser._id : visitorId;

    const visit = await PlantationVisit.create({
      visitor: visitorId,
      owner: finalOwnerId,
      plot: plotId && plotId.match(/^[0-9a-fA-F]{24}$/) ? plotId : null,
      plotTitle: plotTitle || 'Cardamom Estate Plot',
      plotLocation: plotLocation || 'Idukki, Kerala',
      visitDate: visitDate || new Date().toISOString().split('T')[0],
      visitTime: visitTime || '10:00 AM',
      visitorName: visitorName || req.user.name || 'Interested Planter',
      visitorPhone: visitorPhone || req.user.phone || '',
      notes: notes || '',
      status: 'Pending',
    });

    // Notify Owner via Notification Center
    if (finalOwnerId.toString() !== visitorId.toString()) {
      await Notification.create({
        user: finalOwnerId,
        sender: visitorId,
        type: 'marketplace',
        title: '📅 New On-Site Plantation Visit Request',
        message: `${visit.visitorName} requested a site visit for "${visit.plotTitle}" on ${visit.visitDate} at ${visit.visitTime}.`,
        link: '/dashboard',
      }).catch(() => { });

      // Dispatch automated chat message to Message thread
      await Message.create({
        sender: visitorId,
        recipient: finalOwnerId,
        text: `📅 *On-Site Plantation Visit Requested*\nPlot: ${visit.plotTitle}\nRequested Date: ${visit.visitDate}\nTime Slot: ${visit.visitTime}\nVisitor Phone: ${visit.visitorPhone || 'Not provided'}`,
        messageType: 'text',
      }).catch(() => { });

      // Trigger Socket.IO real-time event if active
      const io = req.app.get('io');
      if (io) {
        io.to(finalOwnerId.toString()).emit('new_visit_request', visit);
        io.to(finalOwnerId.toString()).emit('new_notification', {
          title: '📅 New On-Site Plantation Visit Request',
          message: `${visit.visitorName} requested a site visit for "${visit.plotTitle}" on ${visit.visitDate} at ${visit.visitTime}.`,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'On-Site Plantation Visit request sent to the owner for approval!',
      visit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all visit requests received by logged-in owner
// @route   GET /api/plantation-visits/owner
// @access  Private
exports.getOwnerVisits = async (req, res) => {
  try {
    const ownerId = req.user._id || req.user.id;
    const visits = await PlantationVisit.find({ owner: ownerId })
      .populate('visitor', 'name username avatar profilePhoto phone location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      pendingCount: visits.filter((v) => v.status === 'Pending').length,
      visits,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all visit requests placed by logged-in visitor
// @route   GET /api/plantation-visits/visitor
// @access  Private
exports.getVisitorVisits = async (req, res) => {
  try {
    const visitorId = req.user._id || req.user.id;
    const visits = await PlantationVisit.find({ visitor: visitorId })
      .populate('owner', 'name username avatar profilePhoto phone location')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: visits.length,
      visits,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Plantation Visit status (Approve / Decline)
// @route   PUT /api/plantation-visits/:id/status
// @access  Private
exports.updateVisitStatus = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { status, ownerNote } = req.body;

    if (!['Approved', 'Declined', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status specified' });
    }

    const visit = await PlantationVisit.findById(id);
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Plantation Visit record not found' });
    }

    // Verify authorized user is the owner or visitor
    if (visit.owner.toString() !== userId.toString() && visit.visitor.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this visit record' });
    }

    visit.status = status;
    if (ownerNote) visit.ownerNote = ownerNote;
    await visit.save();

    // Notify Visitor of status change
    const isApproved = status === 'Approved';
    const notifTitle = isApproved ? '✅ Plantation Visit APPROVED by Owner!' : '❌ Plantation Visit Request Update';
    const notifMsg = isApproved
      ? `Your visit request for "${visit.plotTitle}" on ${visit.visitDate} at ${visit.visitTime} has been APPROVED by the owner!`
      : `Your visit request for "${visit.plotTitle}" on ${visit.visitDate} was declined by the owner.${ownerNote ? ` Note: ${ownerNote}` : ''}`;

    await Notification.create({
      user: visit.visitor,
      sender: userId,
      type: 'marketplace',
      title: notifTitle,
      message: notifMsg,
      link: '/dashboard',
    }).catch(() => { });

    // Dispatch automated status update chat message
    await Message.create({
      sender: userId,
      recipient: visit.visitor,
      text: `${isApproved ? '✅' : '❌'} *On-Site Visit Request ${status.toUpperCase()}*\nPlot: ${visit.plotTitle}\nDate: ${visit.visitDate} (${visit.visitTime})${ownerNote ? `\nOwner Note: ${ownerNote}` : ''}`,
      messageType: 'text',
    }).catch(() => { });

    // Socket.IO real-time trigger
    const io = req.app.get('io');
    if (io) {
      io.to(visit.visitor.toString()).emit('visit_status_updated', visit);
      io.to(visit.visitor.toString()).emit('new_notification', {
        title: notifTitle,
        message: notifMsg,
      });
    }

    res.status(200).json({
      success: true,
      message: `Plantation visit appointment ${status.toLowerCase()} successfully!`,
      visit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

