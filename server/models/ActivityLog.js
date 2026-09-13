const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actorRole: {
      type: String,
      enum: ['owner', 'supervisor', 'system', 'iot', 'ai', 'admin', 'user', 'Farmer', 'Supervisor', 'Admin', 'Plantation Owner'],
      default: 'system',
    },
    actorName: {
      type: String,
      default: 'System',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    plantationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      default: null,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      default: function () {
        return this.action;
      },
    },
    entityType: {
      type: String,
      default: 'General',
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

activityLogSchema.index({ ownerId: 1, createdAt: -1 });
activityLogSchema.index({ supervisorId: 1, createdAt: -1 });
activityLogSchema.index({ plantationId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ actorRole: 1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
