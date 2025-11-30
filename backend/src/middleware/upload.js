/**
 * File Upload Middleware
 * Secure file upload handling with Multer
 */

const multer = require('multer');
const path = require('path');
const config = require('../config');
const { generateSecureFilename, isAllowedMimeType } = require('../utils/fileUtils');
const { FileUploadError } = require('../utils/errors');

/**
 * Multer disk storage configuration
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.tempDir);
  },
  filename: (req, file, cb) => {
    const secureFilename = generateSecureFilename(file.originalname);
    cb(null, secureFilename);
  },
});

/**
 * File filter for validation
 */
const fileFilter = (req, file, cb) => {
  if (!isAllowedMimeType(file.mimetype)) {
    return cb(
      new FileUploadError(
        `File type '${file.mimetype}' is not allowed. Allowed types: ${config.upload.allowedMimeTypes.join(', ')}`
      ),
      false
    );
  }
  cb(null, true);
};

/**
 * Main upload middleware
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10, // Maximum 10 files per request
  },
});

/**
 * Single image upload
 */
const singleImage = upload.single('image');

/**
 * Multiple images upload (for source and target faces)
 */
const multipleImages = upload.fields([
  { name: 'sourceImage', maxCount: 1 },
  { name: 'targetImage', maxCount: 1 },
]);

/**
 * Video upload for face swap in video
 */
const videoUpload = upload.single('video');

/**
 * Batch upload for multiple processing
 */
const batchUpload = upload.array('images', 10);

/**
 * Memory storage for thumbnail generation
 */
const memoryStorage = multer.memoryStorage();

const memoryUpload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 10,
  },
});

/**
 * Single image to memory (for processing)
 */
const singleImageToMemory = memoryUpload.single('image');

/**
 * Multiple images to memory
 */
const multipleImagesToMemory = memoryUpload.fields([
  { name: 'sourceImage', maxCount: 1 },
  { name: 'targetImage', maxCount: 1 },
]);

module.exports = {
  upload,
  singleImage,
  multipleImages,
  videoUpload,
  batchUpload,
  singleImageToMemory,
  multipleImagesToMemory,
};
