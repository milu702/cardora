const mongoose = require('mongoose');

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true,
    },
    plantation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AiConversation', aiConversationSchema);
