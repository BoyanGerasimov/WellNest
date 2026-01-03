console.log('   → Loading passport config...');
const passport = require('passport');
console.log('   → Passport module loaded');

// Google OAuth Strategy (only if credentials are provided)
try {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    
    // Construct callback URL - prioritize GOOGLE_CALLBACK_URL, then BACKEND_URL
    let callbackURL;
    if (process.env.GOOGLE_CALLBACK_URL) {
      callbackURL = process.env.GOOGLE_CALLBACK_URL;
    } else if (process.env.BACKEND_URL) {
      // Ensure BACKEND_URL doesn't have trailing slash
      const backendUrl = process.env.BACKEND_URL.replace(/\/$/, '');
      callbackURL = `${backendUrl}/api/auth/oauth/google/callback`;
    } else {
      callbackURL = 'http://localhost:5000/api/auth/oauth/google/callback';
      console.warn('⚠️  No BACKEND_URL or GOOGLE_CALLBACK_URL set, using default localhost');
    }

    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL
    }, (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }));
    
    console.log('✅ Google OAuth configured');
    console.log(`   Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...`);
    console.log(`   Callback URL: ${callbackURL}`);
    console.log(`   ⚠️  Make sure this exact URL is in Google Cloud Console:`);
    console.log(`      ${callbackURL}`);
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

