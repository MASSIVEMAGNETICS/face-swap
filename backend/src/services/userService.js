/**
 * User Service
 * In-memory user management for demo purposes
 * Production would use a proper database
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../config/logger');
const { 
  NotFoundError, 
  ConflictError, 
  AuthenticationError,
  ValidationError 
} = require('../utils/errors');

/**
 * In-memory user store
 * In production, this would be replaced with a database
 */
const users = new Map();

/**
 * User Service Class
 */
class UserService {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Object} Created user (without password)
   */
  async createUser(userData) {
    const { email, password, name } = userData;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    for (const user of users.values()) {
      if (user.email === normalizedEmail) {
        throw new ConflictError('User with this email already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

    const user = {
      id: uuidv4(),
      email: normalizedEmail,
      password: hashedPassword,
      name: name || '',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        avatar: null,
        bio: '',
        settings: {
          theme: 'light',
          notifications: true,
        },
      },
      stats: {
        projectsCount: 0,
        swapsCount: 0,
        totalProcessingTime: 0,
      },
    };

    users.set(user.id, user);
    logger.info(`User created: ${user.id}`);

    return this.sanitizeUser(user);
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} Authenticated user (without password)
   */
  async authenticateUser(email, password) {
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    let foundUser = null;
    for (const user of users.values()) {
      if (user.email === normalizedEmail) {
        foundUser = user;
        break;
      }
    }

    if (!foundUser) {
      throw new AuthenticationError('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, foundUser.password);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password');
    }

    logger.info(`User authenticated: ${foundUser.id}`);
    return this.sanitizeUser(foundUser);
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Object} User (without password)
   */
  async getUserById(id) {
    const user = users.get(id);
    if (!user) {
      throw new NotFoundError('User');
    }
    return this.sanitizeUser(user);
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Object} User (without password)
   */
  async getUserByEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    
    for (const user of users.values()) {
      if (user.email === normalizedEmail) {
        return this.sanitizeUser(user);
      }
    }
    
    throw new NotFoundError('User');
  }

  /**
   * Update user profile
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user
   */
  async updateUser(id, updateData) {
    const user = users.get(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    const allowedFields = ['name', 'profile'];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'profile') {
          user.profile = { ...user.profile, ...updateData.profile };
        } else {
          user[field] = updateData[field];
        }
      }
    }

    user.updatedAt = new Date().toISOString();
    users.set(id, user);

    logger.info(`User updated: ${id}`);
    return this.sanitizeUser(user);
  }

  /**
   * Update user password
   * @param {string} id - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   */
  async updatePassword(id, currentPassword, newPassword) {
    const user = users.get(id);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new ValidationError('Current password is incorrect');
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, config.security.bcryptRounds);
    user.updatedAt = new Date().toISOString();
    users.set(id, user);

    logger.info(`Password updated for user: ${id}`);
  }

  /**
   * Delete user
   * @param {string} id - User ID
   */
  async deleteUser(id) {
    if (!users.has(id)) {
      throw new NotFoundError('User');
    }

    users.delete(id);
    logger.info(`User deleted: ${id}`);
  }

  /**
   * Update user stats
   * @param {string} id - User ID
   * @param {Object} stats - Stats to increment
   */
  async updateStats(id, stats) {
    const user = users.get(id);
    if (!user) {
      return; // Silently fail for stats updates
    }

    if (stats.projectsCount) {
      user.stats.projectsCount += stats.projectsCount;
    }
    if (stats.swapsCount) {
      user.stats.swapsCount += stats.swapsCount;
    }
    if (stats.processingTime) {
      user.stats.totalProcessingTime += stats.processingTime;
    }

    user.updatedAt = new Date().toISOString();
    users.set(id, user);
  }

  /**
   * Remove sensitive fields from user object
   * @param {Object} user - User object
   * @returns {Object} Sanitized user object
   */
  sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Get all users (admin only)
   * @param {Object} options - Pagination options
   * @returns {Object} Users list with pagination
   */
  async getAllUsers(options = {}) {
    const { page = 1, limit = 20 } = options;
    
    const allUsers = Array.from(users.values()).map(this.sanitizeUser);
    const total = allUsers.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedUsers = allUsers.slice(start, end);

    return {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

// Export singleton instance
module.exports = new UserService();
