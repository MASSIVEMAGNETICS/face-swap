/**
 * Standardized API Response Utilities
 * Ensures consistent response structure across all endpoints
 */

/**
 * Success response wrapper
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error response wrapper
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {Array} details - Error details
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  const response = {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
    },
  };

  if (details) {
    response.error.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Paginated response wrapper
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasMore: pagination.page * pagination.limit < pagination.total,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Created response wrapper
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

/**
 * No content response wrapper
 * @param {Object} res - Express response object
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
};
