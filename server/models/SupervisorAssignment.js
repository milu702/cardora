const mongoose = require('mongoose');

const supervisorAssignmentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      required: true,
    },
    permissions: {
      workersManagement: { type: Boolean, default: true },
      attendanceManagement: { type: Boolean, default: true },
      taskManagement: { type: Boolean, default: true },
      activityManagement: { type: Boolean, default: true },
      wageManagement: { type: Boolean, default: true },
      plantationReports: { type: Boolean, default: true },
      weatherView: { type: Boolean, default: true },
      plantationDataView: { type: Boolean, default: true },
      messaging: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ['Active', 'Revoked'],
      default: 'Active',
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

supervisorAssignmentSchema.index({ supervisor: 1, plantation: 1 }, { unique: true });
supervisorAssignmentSchema.index({ owner: 1 });
supervisorAssignmentSchema.index({ plantation: 1 });

module.exports = mongoose.model('SupervisorAssignment', supervisorAssignmentSchema);
