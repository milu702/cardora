const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

const cookieParser = require('cookie-parser');
const session = require('express-session');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const { getDBStatus } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Initialize Express App
const app = express();

// Connect to MongoDB Atlas
connectDB();

// Passport Config
require('./config/passport')(passport);

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

// Rate Limiting Security
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { success: false, message: 'Too many requests from this IP' },
});
app.use('/api', limiter);

// Express Middleware - Enable full CORS for local development
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.JWT_SECRET || 'cardora_secret_123',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Status & Healthcheck API Endpoint
app.get('/api/db-status', (req, res) => {
  const status = getDBStatus();
  res.status(200).json({
    success: true,
    ...status,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🌿 Cardora MERN Backend API Operating at Peak Health',
    dbStatus: getDBStatus(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mount Points
const { forgotPassword, resetPassword } = require('./controllers/authController');
app.post('/api/auth/forgot-password', forgotPassword);
app.post('/api/auth/send-otp', forgotPassword);
app.post('/api/auth/reset-password', resetPassword);
app.post('/api/auth/verify-otp', resetPassword);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/plantations', require('./routes/plantationRoutes'));
app.use('/api/community', require('./routes/communityRoutes'));
app.use('/api/marketplace', require('./routes/marketplaceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/workforce', require('./routes/workforceRoutes'));

// 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Cardora MERN Backend Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
