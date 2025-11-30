/**
 * File Utilities
 * Secure file handling operations
 */

const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const config = require('../config');
const { FileUploadError } = require('./errors');

/**
 * Generate a secure unique filename
 * @param {string} originalName - Original filename
 * @returns {string} Secure filename
 */
const generateSecureFilename = (originalName) => {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const ext = path.extname(originalName).toLowerCase();
  return `${timestamp}-${randomBytes}${ext}`;
};

/**
 * Validate file MIME type
 * @param {string} mimeType - File MIME type
 * @returns {boolean} Whether the MIME type is allowed
 */
const isAllowedMimeType = (mimeType) => {
  return config.upload.allowedMimeTypes.includes(mimeType);
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @returns {boolean} Whether the file size is within limits
 */
const isAllowedFileSize = (size) => {
  return size <= config.upload.maxFileSize;
};

/**
 * Get file type category
 * @param {string} mimeType - File MIME type
 * @returns {string} File type category ('image' or 'video')
 */
const getFileCategory = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'unknown';
};

/**
 * Ensure directory exists
 * @param {string} dirPath - Directory path
 */
const ensureDirectory = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * Delete file safely
 * @param {string} filePath - File path to delete
 */
const deleteFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw new FileUploadError(`Failed to delete file: ${error.message}`);
    }
    return false;
  }
};

/**
 * Get file stats safely
 * @param {string} filePath - File path
 * @returns {Object|null} File stats or null if not found
 */
const getFileStats = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
    };
  } catch {
    return null;
  }
};

/**
 * Read file as buffer
 * @param {string} filePath - File path
 * @returns {Buffer} File content
 */
const readFileAsBuffer = async (filePath) => {
  return fs.readFile(filePath);
};

/**
 * Write buffer to file
 * @param {string} filePath - File path
 * @param {Buffer} buffer - File content
 */
const writeBufferToFile = async (filePath, buffer) => {
  const dir = path.dirname(filePath);
  await ensureDirectory(dir);
  await fs.writeFile(filePath, buffer);
};

/**
 * Clean old temporary files
 * @param {string} directory - Directory to clean
 * @param {number} maxAgeMs - Maximum age in milliseconds
 */
const cleanOldFiles = async (directory, maxAgeMs = 24 * 60 * 60 * 1000) => {
  try {
    const files = await fs.readdir(directory);
    const now = Date.now();
    const deletionPromises = [];

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await getFileStats(filePath);
      
      if (stats && stats.isFile && (now - new Date(stats.modified).getTime()) > maxAgeMs) {
        deletionPromises.push(deleteFile(filePath));
      }
    }

    await Promise.all(deletionPromises);
    return deletionPromises.length;
  } catch {
    return 0;
  }
};

module.exports = {
  generateSecureFilename,
  isAllowedMimeType,
  isAllowedFileSize,
  getFileCategory,
  ensureDirectory,
  deleteFile,
  getFileStats,
  readFileAsBuffer,
  writeBufferToFile,
  cleanOldFiles,
};
