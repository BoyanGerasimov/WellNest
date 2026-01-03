const express = require('express');
const router = express.Router();
const passport = require('passport');
const { googleCallback } = require('../controllers/oauthController');

// Google OAuth
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed` }),
  googleCallback
);

module.exports = router;

