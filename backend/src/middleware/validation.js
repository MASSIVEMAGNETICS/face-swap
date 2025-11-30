/**
 * Request Validation Middleware
 * Input validation using Joi schemas
 */

const Joi = require('joi');
const { ValidationError } = require('../utils/errors');

/**
 * Validate request against Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'query', 'params')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type,
      }));

      return next(new ValidationError('Validation failed', details));
    }

    // Replace with validated and sanitized values
    req[property] = value;
    next();
  };
};

/**
 * Common validation schemas
 */
const schemas = {
  // User registration schema
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .max(255)
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.max': 'Email must be less than 255 characters',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .min(8)
      .max(128)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must be less than 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required',
      }),
    name: Joi.string()
      .min(2)
      .max(100)
      .trim()
      .optional()
      .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must be less than 100 characters',
      }),
  }),

  // User login schema
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .trim()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
  }),

  // Face swap request schema
  faceSwap: Joi.object({
    sourceImageId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'Invalid source image ID format',
      }),
    targetImageId: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'Invalid target image ID format',
      }),
    options: Joi.object({
      quality: Joi.string()
        .valid('low', 'medium', 'high', 'ultra')
        .default('high'),
      preserveExpression: Joi.boolean()
        .default(true),
      blendStrength: Joi.number()
        .min(0)
        .max(100)
        .default(80),
      enhanceFace: Joi.boolean()
        .default(true),
      outputFormat: Joi.string()
        .valid('jpeg', 'png', 'webp')
        .default('png'),
    }).default(),
  }),

  // Project creation schema
  createProject: Joi.object({
    name: Joi.string()
      .min(1)
      .max(200)
      .required()
      .trim()
      .messages({
        'string.min': 'Project name is required',
        'string.max': 'Project name must be less than 200 characters',
        'any.required': 'Project name is required',
      }),
    description: Joi.string()
      .max(2000)
      .optional()
      .allow('')
      .trim(),
    type: Joi.string()
      .valid('image', 'video', 'batch')
      .default('image'),
  }),

  // Pagination schema
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20),
    sortBy: Joi.string()
      .valid('createdAt', 'updatedAt', 'name')
      .default('createdAt'),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc'),
  }),

  // ID parameter schema
  idParam: Joi.object({
    id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'Invalid ID format',
        'any.required': 'ID is required',
      }),
  }),
};

module.exports = {
  validate,
  schemas,
};
