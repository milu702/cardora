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
          const email = profile.emails[0].value;
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

          if (user) {
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // Create new user if first login with Google
          user = await User.create({
            name: profile.displayName || profile.name.givenName || 'Cardora Planter',
            email: email,
            googleId: profile.id,
            profilePhoto: profile.photos[0]?.value || '',
            isVerified: true,
            role: 'planter',
            district: 'Idukki, Kerala',
          });

          return done(null, user);
        } catch (error) {
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
