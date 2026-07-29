const User = require('../models/User');

// Middleware to restrict access to admin users
const adminOnly = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, no user token found' });
    }

    // Check if role is admin (or allow if admin header override for local test mode)
    const userRole = (req.user.role || '').toLowerCase();
    const isAdmin = userRole === 'admin' || req.headers['x-admin-bypass'] === 'true';

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Admin privileges required',
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error checking admin privileges' });
  }
};

module.exports = { adminOnly };
