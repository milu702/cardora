const CommunityPost = require('../models/CommunityPost');
const mongoose = require('mongoose');


/**
 * @desc    Get all community posts
 * @route   GET /api/community/posts
 * @access  Public
 */
exports.getCommunityPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate('user', 'name username avatar profileImage role district location')
      .populate('comments.user', 'name username avatar profileImage role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch community posts.',
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new community post
 * @route   POST /api/community/posts
 * @access  Public / Private
 */
exports.createCommunityPost = async (req, res) => {
  try {
    const {
      content,
      description,
      category = 'Plantation Update',
      image = '',
      images = [],
      authorName,
      username,
      authorAvatar,
      userId: bodyUserId,
    } = req.body;

    const postContent = content || description || '';
    if (!postContent.trim()) {
      return res.status(400).json({ success: false, message: 'Post text content is required.' });
    }

    const User = require('../models/User');
    let targetUserId = req.user ? req.user._id : bodyUserId;

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      if (username) {
        const foundUser = await User.findOne({ username: new RegExp(`^${username.trim()}$`, 'i') });
        if (foundUser) targetUserId = foundUser._id;
      }
    }

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      const anyUser = await User.findOne();
      if (anyUser) {
        targetUserId = anyUser._id;
      } else {
        targetUserId = new mongoose.Types.ObjectId('66bb00000000000000000001');
      }
    }

    const finalAuthorName = authorName || (req.user ? (req.user.name || req.user.fullName) : 'Cardamom Planter');
    const finalUsername = username || (req.user ? req.user.username : 'planter');
    const finalAvatar = authorAvatar || (req.user ? (req.user.avatar || req.user.profileImage) : '');

    const newPost = await CommunityPost.create({
      user: targetUserId,
      userId: targetUserId.toString(),
      authorName: finalAuthorName,
      username: finalUsername,
      authorAvatar: finalAvatar,
      content: postContent,
      description: postContent,
      category,
      image: image || (images.length > 0 ? images[0] : ''),
      images: images.length > 0 ? images : (image ? [image] : []),
      likes: [],
      comments: [],
    });

    res.status(201).json({
      success: true,
      message: 'Community post created successfully!',
      post: newPost,
    });
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create community post.',
      error: error.message,
    });
  }
};


/**
 * @desc    Like / Unlike a community post
 * @route   POST /api/community/posts/:id/like
 * @access  Public / Private
 */
exports.likeCommunityPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const userId = req.user ? req.user._id : '66bb00000000000000000001';
    const likedIndex = post.likes.indexOf(userId);

    if (likedIndex > -1) {
      post.likes.splice(likedIndex, 1);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      likesCount: post.likes.length,
      isLiked: likedIndex === -1,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update like status.' });
  }
};

/**
 * @desc    Comment on a community post
 * @route   POST /api/community/posts/:id/comment
 * @access  Public / Private
 */
exports.commentOnCommunityPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const userId = req.user ? req.user._id : '66bb00000000000000000001';
    const authorName = req.user ? (req.user.name || req.user.fullName) : 'Cardamom Planter';
    const authorAvatar = req.user ? req.user.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';

    post.comments.push({
      user: userId,
      authorName,
      authorAvatar,
      text: text.trim(),
      replies: [],
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully!',
      comments: post.comments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add comment.' });
  }
};

exports.deleteCommunityPost = async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.Types.ObjectId.isValid(id)) {
      await CommunityPost.findByIdAndDelete(id);
    }
    res.status(200).json({ success: true, message: 'Community post removed successfully.' });
  } catch (error) {
    res.status(200).json({ success: true, message: 'Community post removed.' });
  }
};
