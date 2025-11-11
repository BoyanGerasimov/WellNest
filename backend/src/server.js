const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

let allowedFrontendOrigin;
try {
  allowedFrontendOrigin = new URL(frontendUrl).origin;
} catch (error) {
  console.error('❌ Invalid FRONTEND_URL provided. Please set FRONTEND_URL to a valid URL.');
  process.exit(1);
}

const skipOriginCheckPaths = new Set([
  '/health',
  '/api/test-db',
  '/api/auth/oauth/google/callback',
  '/api/auth/oauth/github/callback'
]);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: allowedFrontendOrigin,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Passport initialization
const passport = require('passport');
require('./config/passport');
app.use(passport.initialize());

// Enforce frontend origin for API routes
app.use((req, res, next) => {
  if (skipOriginCheckPaths.has(req.path)) {
    return next();
  }

  const originHeader = req.get('origin');
  const refererHeader = req.get('referer');

  let refererOrigin;
  if (refererHeader) {
    try {
      refererOrigin = new URL(refererHeader).origin;
    } catch (error) {
      refererOrigin = undefined;
    }
  }

  const isAllowedOrigin =
    originHeader === allowedFrontendOrigin ||
    refererOrigin === allowedFrontendOrigin;

  if (!isAllowedOrigin) {
    return res.status(403).json({
      success: false,
      message: 'Requests from this source are not allowed'
    });
  }

  return next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'WellNest API is running',
    timestamp: new Date().toISOString()
  });
});

// Database connection test
app.get('/api/test-db', async (req, res) => {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    res.status(200).json({ 
      success: true, 
      message: 'Database connection successful',
      userCount 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
    });
  }
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth/oauth', require('./routes/oauth'));
app.use('/api/users', require('./routes/users'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;

