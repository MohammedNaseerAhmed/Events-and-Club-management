// Standardized response utility functions

export const createResponse = (success, message, data = null, error = null) => {
  const response = {
    success,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  if (error !== null) {
    response.error = error;
  }

  return response;
};

export const createSuccessResponse = (message, data = null) => {
  return createResponse(true, message, data);
};

export const createErrorResponse = (message, error = null) => {
  return createResponse(false, message, null, error);
};

export const createValidationErrorResponse = (errors) => {
  return createResponse(false, 'Validation failed', null, { validation: errors });
};

export const createNotFoundResponse = (resource = 'Resource') => {
  return createResponse(false, `${resource} not found`);
};

export const createUnauthorizedResponse = (message = 'Unauthorized access') => {
  return createResponse(false, message);
};

export const createForbiddenResponse = (message = 'Access forbidden') => {
  return createResponse(false, message);
};

export const createServerErrorResponse = (message = 'Internal server error', error = null) => {
  return createResponse(false, message, null, error);
};

// Legacy function names for backward compatibility
export const ok = (message, data = null) => {
  return createSuccessResponse(message, data);
};

export const fail = (message, error = null) => {
  return createErrorResponse(message, error);
};