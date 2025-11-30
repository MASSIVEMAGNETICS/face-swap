/**
 * Authentication Controller
 * Handles user registration, login, and token management
 */

const userService = require('../services/userService');
const { generateToken } = require('../middleware/auth');
const { successResponse, createdResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  const user = await userService.createUser({ email, password, name });
  const token = generateToken(user);

  logger.info(`New user registered: ${user.id}`);

  return createdResponse(res, {
    user,
    token,
    expiresIn: '24h',
  }, 'User registered successfully');
});

/**
 * Login user
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userService.authenticateUser(email, password);
  const token = generateToken(user);

  logger.info(`User logged in: ${user.id}`);

  return successResponse(res, {
    user,
    token,
    expiresIn: '24h',
  }, 'Login successful');
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  return successResponse(res, { user }, 'Profile retrieved successfully');
});

/**
 * Update user profile
 * PUT /api/auth/me
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, profile } = req.body;
  
  const user = await userService.updateUser(req.user.id, { name, profile });
  return successResponse(res, { user }, 'Profile updated successfully');
});

/**
 * Change password
 * PUT /api/auth/password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await userService.updatePassword(req.user.id, currentPassword, newPassword);
  return successResponse(res, null, 'Password changed successfully');
});

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  // In a production app with refresh tokens, you would invalidate the token here
  logger.info(`User logged out: ${req.user.id}`);
  return successResponse(res, null, 'Logged out successfully');
});

/**
 * Refresh token
 * POST /api/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  const token = generateToken(user);

  return successResponse(res, {
    token,
    expiresIn: '24h',
  }, 'Token refreshed successfully');
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
};
