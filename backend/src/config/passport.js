console.log('   → Loading passport config...');
const passport = require('passport');
console.log('   → Passport module loaded');

// Google OAuth Strategy (only if credentials are provided)
try {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
const GoogleStrategy = require('passport-google-oauth20').Strategy;
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
      `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/oauth/google/callback`;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));
    console.log('✅ Google OAuth configured');
    console.log(`   Callback URL: ${callbackURL}`);
  } else {
    console.warn('⚠️  Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
  }
} catch (error) {
  console.error('❌ Error configuring Google OAuth:', error.message);
  console.warn('⚠️  Continuing without Google OAuth...');
}

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

console.log('   → Passport config complete');

