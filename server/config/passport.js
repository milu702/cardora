const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: (process.env.GOOGLE_CLIENT_ID || 'dummy_client_id').trim(),
        clientSecret: (process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret').trim(),
        callbackURL: 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value.toLowerCase().trim() : null;
          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          const photoUrl = profile.photos && profile.photos[0] ? profile.photos[0].value : '';

          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

          if (user) {
            let needsSave = false;
            if (!user.googleId) {
              user.googleId = profile.id;
              needsSave = true;
            }
            if (photoUrl && (!user.avatar && !user.profileImage)) {
              user.avatar = photoUrl;
              user.profileImage = photoUrl;
              user.profilePhoto = photoUrl;
              user.hasCustomPhoto = true;
              needsSave = true;
            }
            user.isVerified = true;
            if (needsSave) {
              await user.save({ validateBeforeSave: false });
            }
            return done(null, user);
          }

          // Create new user if first login with Google
          const generatedUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
          let uniqueUsername = generatedUsername;
          const existingUsername = await User.findOne({ username: uniqueUsername });
          if (existingUsername) {
            uniqueUsername = `${generatedUsername}_${Math.floor(100 + Math.random() * 900)}`;
          }

          let displayName = profile.displayName || (profile.name ? profile.name.givenName : generatedUsername);
          if (!displayName || displayName === 'Cardora Planter') {
            displayName = generatedUsername.charAt(0).toUpperCase() + generatedUsername.slice(1);
          }

          user = await User.create({
            name: displayName,
            username: uniqueUsername,
            email: email,
            password: Math.random().toString(36).slice(-10),
            googleId: profile.id,
            profileImage: photoUrl,
            profilePhoto: photoUrl,
            avatar: photoUrl,
            hasCustomPhoto: Boolean(photoUrl),
            isVerified: true,
            role: 'Farmer',
            district: 'Idukki, Kerala',
            location: 'Idukki, Kerala',
          });

          return done(null, user);
        } catch (error) {
          console.error('Passport Google Strategy Error:', error.message);
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
