export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Specific error handling
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Duplicate entry - Resource already exists';
  }

  if (err.code === '23503') {
    statusCode = 400;
    message = 'Invalid reference - Foreign key constraint failed';
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;
