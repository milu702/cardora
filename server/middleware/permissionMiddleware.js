const mongoose = require('mongoose');
const SupervisorAssignment = require('../models/SupervisorAssignment');
const Plantation = require('../models/Plantation');

/**
 * Middleware to check specific supervisor permissions for a plantation.
 * @param {string} permissionName - Name of permission property (e.g. 'wageManagement', 'workersManagement', etc.)
 */
const checkSupervisorPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      const role = (req.user.role || '').toLowerCase();

      // Owner and Admin roles have full permissions
      if (role === 'admin' || role === 'plantation owner' || role === 'owner' || role === 'farmer' || role === 'planter') {
        return next();
      }

      if (role === 'supervisor') {
        // Resolve target plantation ID from body, params, query, or req.plantation
        let plantationId =
          req.body?.plantationId ||
          req.params?.plantationId ||
          req.query?.plantationId ||
          req.params?.id ||
          req.user?.assignedPlantation;

        const isValidId = plantationId && mongoose.Types.ObjectId.isValid(plantationId);

        if (!isValidId) {
          const defaultPlantation = await Plantation.findOne({
            $or: [{ user: req.user._id }, { supervisorId: req.user._id }, { assignedSupervisors: req.user._id }]
          });
          if (defaultPlantation) {
            plantationId = defaultPlantation._id;
            if (req.body) req.body.plantationId = plantationId;
          } else {
            // Pass through if system default can handle creation/linking
            return next();
          }
        }

        // Find active supervisor assignment
        const assignment = await SupervisorAssignment.findOne({
          supervisor: req.user._id,
          plantation: plantationId,
          status: 'Active',
        });

        if (!assignment) {
          // Check if fallback plantation assignment exists
          const plantation = mongoose.Types.ObjectId.isValid(plantationId)
            ? await Plantation.findById(plantationId)
            : null;

          if (!plantation) {
            // Pass through if no valid plantation record exists yet
            return next();
          }

          const isDirectSup = plantation.supervisorId && plantation.supervisorId.toString() === req.user._id.toString();
          const isAssignedSup = plantation.assignedSupervisors && plantation.assignedSupervisors.some(id => id.toString() === req.user._id.toString());

          if (!isDirectSup && !isAssignedSup) {
            return res.status(403).json({
              success: false,
              message: 'Your supervisor access has been revoked or is not assigned to this plantation.',
            });
          }
        } else {
          // Verify specific permission flag
          if (permissionName && assignment.permissions && assignment.permissions[permissionName] === false) {
            const formattedName = permissionName.replace(/([A-Z])/g, ' $1').toLowerCase();
            return res.status(403).json({
              success: false,
              message: `You don't have permission to manage ${formattedName} for this plantation.`,
            });
          }
        }
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

module.exports = { checkSupervisorPermission };

