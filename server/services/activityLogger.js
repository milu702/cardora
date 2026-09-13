const ActivityLog = require('../models/ActivityLog');

/**
 * Centralized Activity Logger Helper
 * Logs actions to MongoDB ActivityLog model asynchronously.
 */
const logActivity = async ({
  req,
  actorId,
  actorRole,
  actorName,
  ownerId,
  supervisorId,
  plantationId,
  action,
  entityType = 'General',
  entityId = null,
  description,
  metadata = {},
}) => {
  try {
    const finalActorId = actorId || (req?.user?._id || req?.user?.id);
    const finalActorRole = (actorRole || req?.user?.role || 'system').toLowerCase();
    const finalActorName = actorName || req?.user?.fullName || req?.user?.name || req?.user?.username || 'System';
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || '';
    const userAgent = req?.headers?.['user-agent'] || '';

    const logEntry = await ActivityLog.create({
      actorId: finalActorId,
      actorRole: finalActorRole,
      actorName: finalActorName,
      ownerId,
      supervisorId,
      plantationId,
      action,
      type: action,
      entityType,
      entityId,
      description,
      metadata,
      ipAddress,
      userAgent,
    });

    // Optional Socket.io broadcast if io is mounted on express app
    if (req?.app?.get('io')) {
      try {
        const io = req.app.get('io');
        if (plantationId) {
          io.to(`plantation:${plantationId}`).emit('activity_log', logEntry);
        }
        if (ownerId) {
          io.to(`owner:${ownerId}`).emit('activity_log', logEntry);
        }
      } catch (ioErr) {
        // Socket broadcast optional
      }
    }

    return logEntry;
  } catch (error) {
    console.error('⚠️ Failed to log activity:', error.message);
    return null;
  }
};

module.exports = { logActivity };
