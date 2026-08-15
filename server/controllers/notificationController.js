const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    // Automatic cleanup of self-connection requests (where user === sender)
    await Notification.deleteMany({
      user: userId,
      sender: userId,
      type: 'connection_request',
    }).catch(() => {});

    let notifications = await Notification.find({ user: userId })
      .populate('sender', 'name avatar profilePhoto role')
      .sort({ createdAt: -1 });

    // Deduplicate duplicate login notifications in response
    const seenTitles = new Set();
    notifications = notifications.filter((n) => {
      if (n.type === 'login') {
        const key = `login_${n.title}`;
        if (seenTitles.has(key)) return false;
        seenTitles.add(key);
      }
      return true;
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    if (id === 'all' || id === 'read-all') {
      await Notification.updateMany({ user: userId, read: false }, { read: true });
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }

    if (mongoose.Types.ObjectId.isValid(id)) {
      const notification = await Notification.findOne({ _id: id, user: userId });
      if (notification) {
        notification.read = true;
        await notification.save();
      }
    }

    res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.updateMany({ user: userId, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
