const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    authorName: { type: String },
    authorAvatar: { type: String },
    text: {
      type: String,
      required: true,
    },
    isPostOwner: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: { type: String },
    authorAvatar: { type: String },
    text: {
      type: String,
      required: true,
    },
    replies: [replySchema],
  },
  { timestamps: true }
);

const communityPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userId: {
      type: String,
    },
    username: { type: String },
    authorName: { type: String },
    authorAvatar: { type: String },
    content: {
      type: String,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      default: 'Plantation Update',
    },
    image: { type: String },
    images: [{ type: String }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    shares: {
      type: Number,
      default: 0,
    },
    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CommunityPost', communityPostSchema);
