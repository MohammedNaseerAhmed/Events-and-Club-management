// Middleware to handle 404 Not Found errors for unmatched routes
export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: { message: 'Not Found' },
  });
};

// General error-handling middleware to catch all errors
export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;            // Use error status or default to 500
  const message = err.message || 'Server Error';  // Use error message or default

  res.status(status).json({
    success: false,
    error: { message },
  });
};
