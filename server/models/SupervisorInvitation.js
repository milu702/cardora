const mongoose = require('mongoose');

const supervisorInvitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please add a supervisor email'],
      lowercase: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plantation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plantation',
      required: true,
    },
    plantationName: {
      type: String,
      default: '',
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
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Expired', 'Revoked'],
      default: 'Pending',
    },
    message: {
      type: String,
      default: 'You have been invited to supervise a Cardora cardamom plantation.',
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
    acceptedAt: { type: Date, default: null },
    rejectedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

supervisorInvitationSchema.index({ email: 1, owner: 1, plantation: 1 });
supervisorInvitationSchema.index({ token: 1 });

module.exports = mongoose.model('SupervisorInvitation', supervisorInvitationSchema);
