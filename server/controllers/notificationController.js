const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    let notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });

    // Seed default notifications if none present for user
    if (notifications.length === 0) {
      notifications = [
        {
          _id: 'notif-1',
          type: 'weather_alert',
          title: '🌧️ Heavy Rainfall Warning',
          message: 'Heavy mountain showers expected in High Range, Idukki. Ensure soil drainage channels are clear.',
          read: false,
          createdAt: new Date(),
        },
        {
          _id: 'notif-2',
          type: 'recommendation',
          title: '🌿 NPK Fertilization Reminder',
          message: 'Optimal weather window for organic neem cake & potash application on your plantation.',
          read: false,
          createdAt: new Date(Date.now() - 3600000 * 4),
        },
      ];
    }

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
    const notification = await Notification.findById(req.params.id);
    if (notification) {
      notification.read = true;
      await notification.save();
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
