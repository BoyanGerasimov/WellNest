const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console
  console.error(err);

  // Prisma validation error
  if (err instanceof Prisma.PrismaClientValidationError) {
    const message = 'Invalid data provided';
    error = { message, statusCode: 400 };
  }

  // Prisma unique constraint error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const message = 'Duplicate field value entered';
      error = { message, statusCode: 400 };
    } else if (err.code === 'P2025') {
      const message = 'Resource not found';
      error = { message, statusCode: 404 };
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

