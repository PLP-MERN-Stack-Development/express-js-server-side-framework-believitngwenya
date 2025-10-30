// Custom error classes
class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message = 'Validation failed', details = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.details = details;
  }
}

class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = 'Validation failed';
    error.statusCode = 400;
    error.details = Object.values(err.errors).map(e => e.message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    error.message = 'Duplicate field value entered';
    error.statusCode = 400;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.statusCode = 404;
  }

  // Custom error classes
  if (err instanceof NotFoundError) {
    error.message = err.message;
    error.statusCode = err.statusCode;
  }

  if (err instanceof ValidationError) {
    error.message = err.message;
    error.statusCode = err.statusCode;
    error.details = err.details;
  }

  if (err instanceof AuthenticationError) {
    error.message = err.message;
    error.statusCode = err.statusCode;
  }

  // Send error response
  res.status(error.statusCode).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  NotFoundError,
  ValidationError,
  AuthenticationError,
  errorHandler,
  asyncHandler
};