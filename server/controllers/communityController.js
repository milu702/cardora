const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');

// @desc    Create a community post
// @route   POST /api/community/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { content, description, category, image, images } = req.body;
    const postText = description || content;
    if (!postText || !postText.trim()) {
      return res.status(400).json({ success: false, message: 'Post description or content is required' });
    }

    const user = await User.findById(req.user._id || req.user.id);
    const postImages = req.files ? req.files.map((f) => f.path || f.secure_url) : (images || (image ? [image] : []));
    const singleImage = image || (postImages.length > 0 ? postImages[0] : '');

    const post = await CommunityPost.create({
      user: req.user._id || req.user.id,
      userId: (req.user._id || req.user.id).toString(),
      username: user ? (user.username || user.name) : req.user.username || 'Planter',
      authorName: user ? user.name : req.user.name || 'Planter',
      authorAvatar: user ? (user.avatar || user.profileImage || user.profilePhoto) : '',
      content: postText,
      description: postText,
      category: category || 'Plantation Update',
      image: singleImage,
      images: postImages,
    });

    res.status(201).json({
      success: true,
      message: 'Community post created in MongoDB Atlas',
      post,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all community posts
// @route   GET /api/community/posts
// @access  Public
exports.getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: posts.length, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like / Unlike a post
// @route   POST /api/community/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user._id || req.user.id;
    const isLiked = post.likes.some((id) => id.toString() === userId.toString());

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: post.likes.length,
      post,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Comment on a post
// @route   POST /api/community/posts/:id/comment
// @access  Private
exports.commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const user = await User.findById(req.user._id || req.user.id);

    post.comments.push({
      user: req.user._id || req.user.id,
      authorName: user ? user.name : 'Planter',
      authorAvatar: user ? user.profilePhoto : '',
      text,
    });

    await post.save();

    res.status(201).json({ success: true, message: 'Comment added', comments: post.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a comment on a post
// @route   PUT /api/community/posts/:postId/comments/:commentId
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.id ? post.comments.id(commentId) : post.comments.find((c) => (c._id || c.id).toString() === commentId.toString());
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    comment.text = text.trim();
    await post.save();

    res.status(200).json({ success: true, message: 'Comment updated', comments: post.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reply to a comment
// @route   POST /api/community/posts/:postId/comments/:commentId/reply
// @access  Private
exports.replyToComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Reply text is required' });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = post.comments.id ? post.comments.id(commentId) : post.comments.find((c) => (c._id || c.id).toString() === commentId.toString());
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const user = await User.findById(req.user._id || req.user.id);
    const userIdStr = (req.user._id || req.user.id).toString();
    const isPostOwner = Boolean(
      (post.user && post.user.toString() === userIdStr) ||
      (post.userId && post.userId === userIdStr)
    );

    if (!comment.replies) comment.replies = [];

    comment.replies.push({
      user: req.user._id || req.user.id,
      authorName: user ? user.name : 'Planter',
      authorAvatar: user ? (user.avatar || user.profileImage || user.profilePhoto) : '',
      text: text.trim(),
      isPostOwner,
    });

    await post.save();

    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      comments: post.comments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Share a post
// @route   POST /api/community/posts/:id/share
// @access  Public
exports.sharePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.shares += 1;
    await post.save();

    res.status(200).json({ success: true, message: 'Post share counter updated', shares: post.shares });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save / Unsave post
// @route   POST /api/community/posts/:id/save
// @access  Private
exports.savePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = req.user._id || req.user.id;
    const isSaved = post.savedBy.some((id) => id.toString() === userId.toString());

    if (isSaved) {
      post.savedBy = post.savedBy.filter((id) => id.toString() !== userId.toString());
    } else {
      post.savedBy.push(userId);
    }

    await post.save();
    res.status(200).json({ success: true, isSaved: !isSaved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Report post
// @route   POST /api/community/posts/:id/report
// @access  Private
exports.reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.reports.push({
      user: req.user._id || req.user.id,
      reason: reason || 'Inappropriate Content',
    });

    await post.save();
    res.status(200).json({ success: true, message: 'Post reported to moderators' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update own post
// @route   PUT /api/community/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.content = req.body.content || post.content;
    post.category = req.body.category || post.category;
    await post.save();

    res.status(200).json({ success: true, message: 'Post updated', post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete post (Owner or Admin)
// @route   DELETE /api/community/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const userId = (req.user?._id || req.user?.id || '').toString();
    const isOwner = post.user?.toString() === userId || post.userId?.toString() === userId || post.username === req.user?.username;
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Community post deleted successfully from MongoDB Atlas' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search posts and planters
// @route   GET /api/community/search
// @access  Public
exports.searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    const query = (q || '').trim();
    const regex = new RegExp(query, 'i');

    const posts = await CommunityPost.find({
      $or: [
        { authorName: regex },
        { username: regex },
        { content: regex },
        { description: regex },
        { category: regex },
      ],
    }).sort({ createdAt: -1 });

    const users = await User.find({
      $or: [
        { name: regex },
        { username: regex },
        { email: regex },
        { location: regex },
        { district: regex },
      ],
    }).select('-password');

    res.status(200).json({ success: true, count: posts.length, posts, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
