const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/generateToken');

// Use a single PrismaClient instance (lazy initialization)
let prisma;
try {
  prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} catch (error) {
  console.error('❌ Error creating PrismaClient in oauthController:', error.message);
  throw error;
}

// Google OAuth callback
exports.googleCallback = async (req, res, next) => {
  try {
    const { id, displayName, emails, photos } = req.user;

    const email = emails[0].value;
    const avatar = photos[0]?.value;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (user) {
      // Update OAuth info if needed
      if (!user.oauthProvider || user.oauthProvider !== 'google') {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            oauthProvider: 'google',
            oauthId: id,
            avatar: avatar || user.avatar,
            lastLogin: new Date()
          }
        });
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            avatar: avatar || user.avatar,
            lastLogin: new Date()
          }
        });
      }
      
      // Get updated user with all fields
      user = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          dateOfBirth: true,
          gender: true,
          height: true,
          currentWeight: true,
          goalWeight: true,
          activityLevel: true,
          dailyCalorieGoal: true
        }
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          name: displayName,
          email: email.toLowerCase(),
          oauthProvider: 'google',
          oauthId: id,
          avatar: avatar,
          isEmailVerified: true,
          lastLogin: new Date()
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          dateOfBirth: true,
          gender: true,
          height: true,
          currentWeight: true,
          goalWeight: true,
          activityLevel: true,
          dailyCalorieGoal: true
        }
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    next(error);
  }
};

