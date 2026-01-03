console.log('📦 Loading dependencies...');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
require('dotenv').config();

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in environment variables');
  console.error('   Please create a .env file with DATABASE_URL');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set. Using default (NOT SECURE FOR PRODUCTION)');
  process.env.JWT_SECRET = 'default-jwt-secret-change-in-production';
}

console.log('✅ Dependencies loaded');

// Initialize Google Cloud credentials if needed
if (process.env.GOOGLE_CLOUD_KEY_BASE64 || process.env.GOOGLE_CLOUD_KEY_JSON) {
  try {
    const { getGoogleCloudCredentialsPath } = require('./utils/googleCloudCredentials');
    const credsPath = getGoogleCloudCredentialsPath();
    if (credsPath) {
      // Set the path for Google Cloud libraries that expect GOOGLE_APPLICATION_CREDENTIALS
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credsPath;
      console.log('✅ Google Cloud credentials initialized');
    }
  } catch (error) {
    console.warn('⚠️  Google Cloud credentials initialization failed:', error.message);
  }
}

console.log('📦 Initializing Prisma...');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log('✅ Prisma initialized');

const app = express();
const PORT = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
console.log('✅ Express app created');

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
  '/api/auth/oauth/google/callback'
]);

// Security middleware
console.log('📦 Setting up middleware...');
app.use(helmet());
console.log('✅ Helmet configured');

// Compression middleware (gzip)
app.use(compression());
console.log('✅ Compression configured');

// CORS configuration
app.use(cors({
  origin: allowedFrontendOrigin,
  credentials: true
}));
console.log('✅ CORS configured');

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
console.log('✅ Body parsers configured');

// Cookie parser
app.use(cookieParser());
console.log('✅ Cookie parser configured');

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log('✅ Morgan logging configured');
}

// Passport initialization
console.log('📦 Initializing Passport...');
const passport = require('passport');
console.log('📦 Passport module loaded, requiring config...');
try {
  require('./config/passport');
  console.log('📦 Passport config loaded, initializing middleware...');
  app.use(passport.initialize());
  console.log('✅ Passport initialized');
} catch (error) {
  console.error('❌ Error initializing Passport:', error.message);
  console.error(error.stack);
  // Continue without OAuth if it fails
}

// Enforce frontend origin for API routes
console.log('📦 Setting up origin validation middleware...');
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
console.log('✅ Origin validation middleware configured');

// Health check route
console.log('📦 Setting up routes...');
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
console.log('✅ Health check and test routes configured');

// Rate limiting
console.log('📦 Setting up rate limiters...');
const { apiLimiter, authLimiter, aiLimiter } = require('./middleware/rateLimiter');
app.use('/api', apiLimiter); // Apply to all API routes
console.log('✅ Rate limiters configured');

// API routes
console.log('📦 Loading API routes...');
console.log('  → About to require auth routes...');
try {
  const authRoutes = require('./routes/auth');
  console.log('  → Auth routes module loaded, registering...');
  // Apply stricter rate limiting to auth routes
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
  console.error('Stack:', error.stack);
  throw error;
}

try {
  console.log('  → Loading OAuth routes...');
  app.use('/api/auth/oauth', require('./routes/oauth'));
  console.log('✅ OAuth routes loaded');
} catch (error) {
  console.error('❌ Error loading OAuth routes:', error.message);
  console.error('Stack:', error.stack);
  throw error;
}

try {
  console.log('  → Loading user routes...');
  app.use('/api/users', require('./routes/users'));
  console.log('✅ User routes loaded');
} catch (error) {
  console.error('❌ Error loading user routes:', error.message);
  console.error('Stack:', error.stack);
  throw error;
}

try {
  console.log('  → Loading workout routes...');
  app.use('/api/workouts', require('./routes/workouts'));
  console.log('✅ Workout routes loaded');
} catch (error) {
  console.error('❌ Error loading workout routes:', error.message);
  console.error('Stack:', error.stack);
  throw error;
}

try {
  console.log('  → Loading meal routes...');
  app.use('/api/meals', require('./routes/meals'));
  console.log('✅ Meal routes loaded');
} catch (error) {
  console.error('❌ Error loading meal routes:', error.message);
  console.error('Stack:', error.stack);
  throw error;
}

try {
  console.log('  → Loading suggestion routes...');
  app.use('/api/suggestions', require('./routes/suggestions'));
  console.log('✅ Suggestion routes loaded');
} catch (error) {
  console.error('❌ Error loading suggestion routes:', error.message);
  console.error('Stack:', error.stack);
  throw error;
}

try {
  console.log('  → Loading health score routes...');
  app.use('/api/health-score', require('./routes/healthScore'));
  console.log('✅ Health score routes loaded');
} catch (error) {
  console.error('❌ Error loading health score routes:', error.message);
  console.error('Stack:', error.stack);
  throw error;
}

try {
  console.log('  → Loading achievement routes...');
  app.use('/api/achievements', require('./routes/achievements'));
  console.log('✅ Achievement routes loaded');
} catch (error) {
  console.error('❌ Error loading achievement routes:', error.message);
  console.error('Stack:', error.stack);
  throw error;
}

try {
  console.log('  → Loading forum routes...');
  app.use('/api/forum', require('./routes/forum'));
  console.log('✅ Forum routes loaded');
} catch (error) {
  console.error('❌ Error loading forum routes:', error.message);
  console.error('Stack:', error.stack);
  throw error;
}

try {
  console.log('  → Loading chat routes...');
  // Apply AI rate limiting to chat routes
  app.use('/api/chat', aiLimiter);
  app.use('/api/chat', require('./routes/chat'));
  console.log('✅ Chat routes loaded');
} catch (error) {
  console.error('❌ Error loading chat routes:', error.message);
  console.error('Stack:', error.stack);
  throw error;
}

try {
  console.log('  → Loading analytics routes...');
  app.use('/api/analytics', require('./routes/analytics'));
  console.log('✅ Analytics routes loaded');
} catch (error) {
  console.error('❌ Error loading analytics routes:', error.message);
  console.error('Stack:', error.stack);
  throw error;
}


// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handling middleware
console.log('📦 Loading error handler...');
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);
console.log('✅ Error handler loaded');

// Start server
console.log(`🚀 Starting server on port ${PORT}...`);
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`✅ WellNest backend is ready!`);
}).on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please use a different port.`);
  } else {
    console.error('❌ Error starting server:', error.message);
  }
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Don't exit in development, but log the error
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;

