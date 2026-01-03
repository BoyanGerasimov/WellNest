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
      console.log('   Using GOOGLE_CALLBACK_URL from environment');
    } else if (process.env.BACKEND_URL) {
      // Ensure BACKEND_URL doesn't have trailing slash and is public URL
      let backendUrl = process.env.BACKEND_URL.replace(/\/$/, '');
      
      console.log(`   BACKEND_URL from env: ${backendUrl}`);
      
      // Fix: Replace internal Railway URLs with public URLs
      // Railway provides RAILWAY_PUBLIC_DOMAIN or we use BACKEND_URL
      if (backendUrl.includes('railway.internal') || backendUrl.includes('.internal')) {
        console.warn('   ⚠️  BACKEND_URL is internal Railway URL, trying to find public URL...');
        // If BACKEND_URL is internal, try to get public domain
        if (process.env.RAILWAY_PUBLIC_DOMAIN) {
          backendUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
          console.log(`   Using RAILWAY_PUBLIC_DOMAIN: ${backendUrl}`);
        } else if (process.env.RAILWAY_STATIC_URL) {
          backendUrl = process.env.RAILWAY_STATIC_URL;
          console.log(`   Using RAILWAY_STATIC_URL: ${backendUrl}`);
        } else {
          console.error('❌ BACKEND_URL is internal Railway URL but no public domain found!');
          console.error('   Set BACKEND_URL to your public Railway URL in Railway dashboard:');
          console.error('   Example: https://wellnest-production-25c4.up.railway.app');
          console.error('   Or set GOOGLE_CALLBACK_URL directly to:');
          console.error('   https://wellnest-production-25c4.up.railway.app/api/auth/oauth/google/callback');
          // Don't exit - let it try with the internal URL so we can see the error
        }
      }
      
      // Ensure it's https in production
      if (process.env.NODE_ENV === 'production' && !backendUrl.startsWith('https://')) {
        if (backendUrl.startsWith('http://')) {
          backendUrl = backendUrl.replace('http://', 'https://');
        } else if (!backendUrl.includes('://')) {
          backendUrl = `https://${backendUrl}`;
        }
      }
      
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

