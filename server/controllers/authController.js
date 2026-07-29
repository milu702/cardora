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
      if (user.googleId) {
        user.password = targetPassword;
        await user.save({ validateBeforeSave: false });
      } else {
        return res.status(401).json({ success: false, message: 'Incorrect password entered. Please check your password or click Forgot Password.' });
      }
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

    if (role !== undefined && typeof role === 'string') {
      const r = role.toLowerCase();
      if (r.includes('expert')) updates.role = 'Expert';
      else if (r.includes('investor')) updates.role = 'Investor';
      else if (r.includes('user')) updates.role = 'User';
      else if (r.includes('admin')) updates.role = 'admin';
      else updates.role = 'Farmer';
    }

    const imagePayload = avatar || profileImage || profilePhoto;
    if (imagePayload && typeof imagePayload === 'string' && imagePayload.trim() !== '') {
      const trimmedImg = imagePayload.trim();
      updates.avatar = trimmedImg;
      updates.profileImage = trimmedImg;
      updates.profilePhoto = trimmedImg;
      updates.hasCustomPhoto = true;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: false });

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
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google email address is required.' });
    }

    const targetEmail = email.trim().toLowerCase();
    const gId = googleId || `google_${Date.now()}`;
    const emailPrefix = targetEmail.split('@')[0];

    // Format clean distinct name from Google profile or email prefix
    let displayName = name && name.trim() && name !== 'Cardora Planter' ? name.trim() : emailPrefix.split('.')[0];
    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

    const img = profileImage || profilePhoto || '';

    let user = await User.findOne({ $or: [{ googleId: gId }, { email: targetEmail }] });

    if (user) {
      if (!user.googleId) user.googleId = gId;
      if (!user.username) user.username = emailPrefix.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      if (img && !user.avatar) {
        user.avatar = img;
        user.profileImage = img;
        user.profilePhoto = img;
        user.hasCustomPhoto = true;
      }
      user.isVerified = true;
      await user.save({ validateBeforeSave: false });
    } else {
      let uniqueUsername = emailPrefix.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      const existingUsername = await User.findOne({ username: uniqueUsername });
      if (existingUsername) {
        uniqueUsername = `${uniqueUsername}_${Math.floor(100 + Math.random() * 900)}`;
      }

      user = await User.create({
        name: displayName,
        username: uniqueUsername,
        email: targetEmail,
        password: Math.random().toString(36).slice(-10),
        googleId: gId,
        profileImage: img,
        profilePhoto: img,
        avatar: img,
        hasCustomPhoto: Boolean(img),
        isVerified: true,
        role: 'Farmer',
        location: 'Idukki, Kerala',
        district: 'Idukki, Kerala',
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
        phone: user.phone || '',
        location: user.location || 'Idukki, Kerala',
        district: user.district || user.location || 'Idukki, Kerala',
        bio: user.bio || '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const nodemailer = require('nodemailer');

// @desc    Forgot Password - Send OTP to Email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const targetEmail = email.trim().toLowerCase();
    let user = await User.findOne({ $or: [{ email: targetEmail }, { username: targetEmail }] });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (user) {
      user.otp = otpCode;
      user.otpExpire = Date.now() + 15 * 60 * 1000;
      await user.save({ validateBeforeSave: false });
    }

    // Always send real Nodemailer email to the target email address!
    let emailSent = false;
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER || 'cardora702@gmail.com',
          pass: (process.env.SMTP_PASS || 'pvaahrfsdbkaaged').replace(/\s+/g, ''),
        },
      });

      await transporter.sendMail({
        from: `"Cardora Ecosystem" <${process.env.SMTP_USER || 'cardora702@gmail.com'}>`,
        to: targetEmail,
        subject: '🔑 Cardora - Password Reset OTP Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #D7E6D5; border-radius: 16px; background-color: #ffffff;">
            <h2 style="color: #1F5E3B; margin-bottom: 8px;">Cardora Account Recovery</h2>
            <p style="color: #4A5568; font-size: 14px;">You requested a password reset for your Cardora account (${targetEmail}).</p>
            <p style="color: #4A5568; font-size: 14px; font-weight: bold;">Your 6-digit OTP security code is:</p>
            <div style="font-size: 36px; font-weight: 900; color: #1F5E3B; letter-spacing: 6px; padding: 16px; background: #DDEFD9; text-align: center; border-radius: 12px; margin: 16px 0;">
              ${otpCode}
            </div>
            <p style="font-size: 12px; color: #718096; margin-top: 20px; text-align: center;">This OTP is valid for 15 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
      emailSent = true;
      console.log(`✅ Nodemailer OTP email successfully sent to: ${targetEmail}`);
    } catch (mailError) {
      console.error('❌ Nodemailer Email Error:', mailError.message);
    }

    res.status(200).json({
      success: true,
      message: `Password reset OTP has been sent to ${targetEmail}`,
      otp: otpCode,
      emailSent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset Password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+otp +otpExpire +password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    if (user.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP security code.' });
    }

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
