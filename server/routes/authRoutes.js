const express = require('express');
const router = express.Router();
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const {
  signup,
  login,
  googleLogin,
  getProfile,
  updateProfile,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Standard Authentication Routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/send-otp', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', resetPassword);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile', protect, updateProfile);
router.get('/me', protect, getProfile);
router.post('/logout', protect, logout);

// Google Authentication API
router.post('/google-login', googleLogin);

// Google OAuth 2.0 Passport Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user, info) => {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      if (err || !user) {
        console.error('[Google Auth Callback] Error during Google OAuth exchange:', err ? err.message : 'No user object returned from Passport');
        return res.redirect(`${clientUrl}/auth?error=google_auth_failed`);
      }
      const token = generateToken(user._id);
      return res.redirect(`${clientUrl}/dashboard?token=${token}`);
    })(req, res, next);
  }
);

module.exports = router;
