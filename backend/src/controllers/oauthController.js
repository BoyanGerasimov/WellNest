const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/generateToken');
const prisma = new PrismaClient();

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

// GitHub OAuth callback
exports.githubCallback = async (req, res, next) => {
  try {
    const { id, username, displayName, photos, emails } = req.user;

    const email = emails?.[0]?.value || `${username}@github.local`;
    const avatar = photos?.[0]?.value;
    const name = displayName || username;

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (user) {
      // Update OAuth info if needed
      if (!user.oauthProvider || user.oauthProvider !== 'github') {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            oauthProvider: 'github',
            oauthId: id.toString(),
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
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          name: name,
          email: email.toLowerCase(),
          oauthProvider: 'github',
          oauthId: id.toString(),
          avatar: avatar,
          isEmailVerified: true,
          lastLogin: new Date()
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

