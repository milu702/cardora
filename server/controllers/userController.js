const User = require('../models/User');
const CommunityPost = require('../models/CommunityPost');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { 
      fullName, name, username, phone, address, district, location, state, country, 
      bio, language, role, avatar, profileImage, profilePhoto, coverImage,
      experience, skills, certifications, education, organization
    } = req.body;

    user.name = fullName || name || user.name;
    if (username) user.username = username;
    user.phone = phone !== undefined ? phone : user.phone;
    user.address = address !== undefined ? address : user.address;
    user.district = district || location || user.district;
    user.location = location || district || user.location;
    user.state = state !== undefined ? state : user.state;
    user.country = country !== undefined ? country : user.country;
    user.bio = bio !== undefined ? bio : user.bio;
    user.language = language || user.language;
    if (role) user.role = role;
    if (coverImage) user.coverImage = coverImage;
    if (experience !== undefined) user.experience = experience;
    if (skills !== undefined) {
      user.skills = Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : user.skills);
    }
    if (certifications !== undefined) {
      user.certifications = Array.isArray(certifications) ? certifications : (typeof certifications === 'string' ? certifications.split(',').map(c => c.trim()).filter(Boolean) : user.certifications);
    }
    if (education !== undefined) user.education = education;
    if (organization !== undefined) user.organization = organization;

    const photo = avatar || profileImage || profilePhoto;
    if (photo) {
      user.avatar = photo;
      user.profileImage = photo;
      user.profilePhoto = photo;
      user.hasCustomPhoto = true;
    }

    const updatedUser = await user.save();

    // Update community posts authored by this user
    await CommunityPost.updateMany(
      { $or: [{ user: user._id }, { userId: user._id.toString() }] },
      {
        authorName: user.name,
        username: user.username,
        authorAvatar: photo || user.avatar || user.profilePhoto || user.profileImage || '',
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload profile photo
// @route   POST /api/users/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const imageUrl = req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;

    const user = await User.findById(req.user._id || req.user.id);
    if (user) {
      user.profilePhoto = imageUrl;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      imageUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id || req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.password) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Public User Profile by Username or User ID
// @route   GET /api/users/public/:identifier
// @access  Public / Private
exports.getPublicProfile = async (req, res) => {
  try {
    const { identifier } = req.params;
    const currentUserId = req.user?._id || req.user?.id;

    // Search user by ObjectId or Username
    let user;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(identifier).select('-password');
    }
    if (!user) {
      const cleanUsername = identifier.trim().toLowerCase();
      user = await User.findOne({ username: new RegExp(`^${cleanUsername}$`, 'i') }).select('-password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const Plantation = require('../models/Plantation');

    // Fetch user's community posts and plantations
    const [posts, plantations] = await Promise.all([
      CommunityPost.find({ 
        $or: [
          { user: user._id }, 
          { userId: user._id.toString() }, 
          { username: user.username },
          { authorName: user.name }
        ] 
      }).sort({ createdAt: -1 }),
      Plantation.find({ 
        $or: [{ owner: user._id }, { ownerName: user.name }, { location: user.location }] 
      }).sort({ createdAt: -1 }),
    ]);

    // Extract Media Array
    const media = [];
    posts.forEach((p) => {
      if (p.image) media.push({ id: p._id, url: p.image, type: 'image', title: p.content || 'Post Media' });
      if (p.mediaUrl) media.push({ id: p._id, url: p.mediaUrl, type: 'image', title: p.content || 'Post Media' });
    });
    plantations.forEach((pl) => {
      if (pl.imageUrl) media.push({ id: pl._id, url: pl.imageUrl, type: 'image', title: pl.name || 'Plantation Image' });
    });

    // Compute Stats
    const totalLikes = posts.reduce((acc, p) => acc + (p.likesCount || (p.likes ? p.likes.length : 0)), 0);
    const followers = user.followers || [];
    const following = user.following || [];
    const isFollowing = currentUserId ? followers.some((id) => id.toString() === currentUserId.toString()) : false;

    const stats = {
      postsCount: posts.length,
      plantationsCount: plantations.length,
      followersCount: followers.length,
      followingCount: following.length,
      totalLikes,
      totalActivities: posts.length + plantations.length + followers.length,
    };

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        fullName: user.name,
        username: user.username,
        email: user.privacy?.viewContact === 'public' || isFollowing ? user.email : 'Protected by Privacy Settings',
        phone: user.privacy?.viewContact === 'public' || isFollowing ? (user.phone || '') : 'Protected by Privacy Settings',
        avatar: user.avatar || user.profileImage || user.profilePhoto || '',
        profileImage: user.profileImage || user.avatar || user.profilePhoto || '',
        coverImage: user.coverImage || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
        role: user.role || 'Farmer',
        isVerified: user.isVerified !== false,
        bio: user.bio || 'Cardamom planter & agriculture enthusiast',
        location: user.location || user.district || 'Idukki, Kerala',
        district: user.district || user.location || 'Idukki, Kerala',
        joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Jan 2025',
        languages: ['English', 'Malayalam', 'Tamil'],
        experience: user.experience || '10+ Years Cardamom Cultivation',
        skills: user.skills && user.skills.length > 0 ? user.skills : ['Organic Farming', 'Drip Irrigation', 'NPK Management'],
        certifications: user.certifications && user.certifications.length > 0 ? user.certifications : ['Spices Board India Certified'],
        education: user.education || 'B.Sc. Agriculture / Horticulture',
        organization: user.organization || 'Cardamom Growers Association, Idukki',
        privacy: user.privacy || {},
      },
      stats,
      isFollowing,
      posts,
      plantations,
      media,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Follow / Unfollow a user
// @route   POST /api/users/:id/follow
// @access  Private
exports.toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id || req.user.id;

    if (targetUserId.toString() === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const [targetUser, currentUser] = await Promise.all([
      User.findById(targetUserId),
      User.findById(currentUserId),
    ]);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!targetUser.followers) targetUser.followers = [];
    if (!currentUser.following) currentUser.following = [];

    const isFollowing = targetUser.followers.some((id) => id.toString() === currentUserId.toString());

    if (isFollowing) {
      // Unfollow
      targetUser.followers = targetUser.followers.filter((id) => id.toString() !== currentUserId.toString());
      currentUser.following = currentUser.following.filter((id) => id.toString() !== targetUserId.toString());
      await Promise.all([targetUser.save({ validateBeforeSave: false }), currentUser.save({ validateBeforeSave: false })]);
      return res.status(200).json({ success: true, isFollowing: false, followersCount: targetUser.followers.length, message: `Unfollowed @${targetUser.username}` });
    } else {
      // Follow
      targetUser.followers.push(currentUserId);
      currentUser.following.push(targetUserId);
      await Promise.all([targetUser.save({ validateBeforeSave: false }), currentUser.save({ validateBeforeSave: false })]);

      // Create Notification
      const Notification = require('../models/Notification');
      await Notification.create({
        user: targetUser._id,
        sender: currentUser._id,
        type: 'follow',
        title: '👥 New Follower!',
        message: `${currentUser.name} (@${currentUser.username}) started following your planter updates.`,
      }).catch(() => {});

      return res.status(200).json({ success: true, isFollowing: true, followersCount: targetUser.followers.length, message: `Now following @${targetUser.username}` });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get followers list for user
// @route   GET /api/users/:id/followers
// @access  Public / Private
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'name username avatar profilePhoto role location');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, followers: user.followers || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get following list for user
// @route   GET /api/users/:id/following
// @access  Public / Private
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'name username avatar profilePhoto role location');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, following: user.following || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
