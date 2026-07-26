const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, fullName, username, email, phone, password, profileImage, location, district, role } = req.body;
    const displayName = name || fullName;
    const userUsername = username ? username.trim().toLowerCase() : '';
    const userEmail = email ? email.trim().toLowerCase() : '';
    const userDistrict = district || location || 'Idukki, Kerala';

    if (!displayName || !userUsername || !userEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, username, email, and password.',
      });
    }

    const emailExists = await User.findOne({ email: userEmail });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address.' });
    }

    const usernameExists = await User.findOne({ username: userUsername });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username is already taken. Please choose another.' });
    }

    const user = await User.create({
      name: displayName,
      username: userUsername,
      email: userEmail,
      phone: phone || '',
      password,
      profileImage: profileImage || '',
      profilePhoto: profileImage || '',
      avatar: profileImage || '',
      hasCustomPhoto: Boolean(profileImage),
      location: userDistrict,
      district: userDistrict,
      role: role || 'Farmer',
      isVerified: true,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        fullName: user.name,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage || user.profilePhoto,
        avatar: user.avatar || user.profileImage || user.profilePhoto || '',
        role: user.role,
        phone: user.phone,
        location: user.location,
        district: user.district || user.location,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, username, usernameOrEmail, password } = req.body;
    const targetIdentifier = (email || username || usernameOrEmail || '').trim().toLowerCase();
    const targetPassword = typeof password === 'string' ? password.trim() : '';

    if (!targetIdentifier || !targetPassword) {
      return res.status(400).json({ success: false, message: 'Please enter your email/username and password.' });
    }

    const user = await User.findOne({
      $or: [{ email: targetIdentifier }, { username: targetIdentifier }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email or username. Click Sign Up to create one!' });
    }

    const isMatch = await user.matchPassword(targetPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password entered. Please check your password and try again.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        fullName: user.name,
        username: user.username || user.email.split('@')[0],
        email: user.email,
        avatar: user.avatar || user.profileImage || user.profilePhoto || '',
        profileImage: user.profileImage || user.avatar || user.profilePhoto || '',
        profilePhoto: user.profilePhoto || user.avatar || user.profileImage || '',
        hasCustomPhoto: Boolean(user.hasCustomPhoto || user.avatar || user.profileImage || user.profilePhoto),
        role: user.role,
        phone: user.phone,
        location: user.location,
        district: user.district || user.location,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile or /api/auth/me
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const currentImg = user.avatar || user.profileImage || user.profilePhoto;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        fullName: user.name,
        username: user.username || user.email.split('@')[0],
        email: user.email,
        avatar: currentImg,
        profileImage: currentImg,
        profilePhoto: currentImg,
        role: user.role,
        phone: user.phone,
        location: user.location,
        district: user.district || user.location,
        hasCustomPhoto: user.hasCustomPhoto || Boolean(currentImg),
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update User Profile (fullName, phone, location, district, bio, avatar, role)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const { fullName, name, username, phone, location, district, bio, avatar, profileImage, profilePhoto, role, hasCustomPhoto } = req.body;

    const updates = {};
    if (fullName || name) updates.name = fullName || name;
    if (username && username.trim()) updates.username = username.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone;
    if (location !== undefined) updates.location = location;
    if (district !== undefined) updates.district = district;
    if (bio !== undefined) updates.bio = bio;
    if (role !== undefined) updates.role = role;

    if (avatar !== undefined || profileImage !== undefined || profilePhoto !== undefined || hasCustomPhoto !== undefined) {
      const newImg = avatar !== undefined ? avatar : (profileImage !== undefined ? profileImage : profilePhoto);
      if (newImg !== undefined) {
        updates.avatar = newImg;
        updates.profileImage = newImg;
        updates.profilePhoto = newImg;
      }
      if (hasCustomPhoto !== undefined) {
        updates.hasCustomPhoto = Boolean(hasCustomPhoto);
      } else if (newImg) {
        updates.hasCustomPhoto = true;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const currentImg = updatedUser.avatar || updatedUser.profileImage || updatedUser.profilePhoto;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully in MongoDB Atlas',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        fullName: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: currentImg,
        profileImage: currentImg,
        profilePhoto: currentImg,
        hasCustomPhoto: updatedUser.hasCustomPhoto || Boolean(updatedUser.avatar),
        role: updatedUser.role,
        phone: updatedUser.phone,
        location: updatedUser.location,
        district: updatedUser.district,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = exports.getProfile;

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Google Sign In / Sign Up
// @route   POST /api/auth/google-login
// @access  Public
exports.googleLogin = async (req, res) => {
  try {
    const { name, email, googleId, profilePhoto, profileImage } = req.body;
    const targetEmail = (email || 'google_user@cardora.io').toLowerCase();
    const gId = googleId || `google_${Date.now()}`;
    const displayName = name || 'Cardora Planter';
    const img = profileImage || profilePhoto || '';
    const generatedUsername = targetEmail.split('@')[0];

    let user = await User.findOne({ $or: [{ googleId: gId }, { email: targetEmail }] });

    if (user) {
      if (!user.googleId) user.googleId = gId;
      user.isVerified = true;
      await user.save();
    } else {
      user = await User.create({
        name: displayName,
        username: generatedUsername,
        email: targetEmail,
        googleId: gId,
        profileImage: img,
        profilePhoto: img,
        isVerified: true,
        role: 'Farmer',
        location: 'Idukki, Kerala',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        fullName: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar || user.profileImage || user.profilePhoto || '',
        profileImage: user.profileImage || user.avatar || user.profilePhoto || '',
        profilePhoto: user.profilePhoto || user.avatar || user.profileImage || '',
        hasCustomPhoto: Boolean(user.hasCustomPhoto || user.avatar || user.profileImage || user.profilePhoto),
        role: user.role,
        phone: user.phone,
        location: user.location,
        district: user.district || user.location,
        bio: user.bio,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
