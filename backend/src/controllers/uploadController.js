/**
 * Upload Controller
 * Handles file uploads and asset management
 */

const path = require('path');
const { v4: uuidv4 } = require('uuid');
const projectService = require('../services/projectService');
const imageProcessingService = require('../services/imageProcessingService');
const faceDetectionService = require('../services/faceDetectionService');
const { successResponse, createdResponse, noContentResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { FileUploadError, ValidationError } = require('../utils/errors');
const { readFileAsBuffer, deleteFile, ensureDirectory, writeBufferToFile } = require('../utils/fileUtils');
const config = require('../config');
const logger = require('../config/logger');

/**
 * Upload source image
 * POST /api/upload/source
 */
const uploadSourceImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new FileUploadError('No file uploaded');
  }

  const { projectId } = req.body;
  
  if (!projectId) {
    throw new ValidationError('Project ID is required');
  }

  // Read the uploaded file
  const filePath = path.join(config.upload.tempDir, req.file.filename);
  const buffer = await readFileAsBuffer(filePath);

  // Process image and generate thumbnail
  const processed = await imageProcessingService.processImage(buffer);
  const thumbnail = await imageProcessingService.generateThumbnail(buffer);

  // Detect faces
  const faces = await faceDetectionService.detectFaces(buffer);

  // Generate paths
  const assetId = uuidv4();
  const processedFilename = `${assetId}.${processed.metadata.format}`;
  const thumbnailFilename = `${assetId}_thumb.jpg`;
  const processedPath = path.join(config.upload.processedDir, processedFilename);
  const thumbnailPath = path.join(config.upload.processedDir, thumbnailFilename);

  // Save processed files
  await ensureDirectory(config.upload.processedDir);
  await writeBufferToFile(processedPath, processed.buffer);
  await writeBufferToFile(thumbnailPath, thumbnail);

  // Clean up temp file
  await deleteFile(filePath);

  // Add asset to project
  const asset = await projectService.addAsset(projectId, req.user.id, {
    type: 'source',
    filename: processedFilename,
    originalName: req.file.originalname,
    path: processedPath,
    thumbnailPath,
    mimeType: req.file.mimetype,
    size: processed.metadata.size,
    metadata: processed.metadata,
    faces,
  });

  logger.info(`Source image uploaded: ${asset.id} for project ${projectId}`);

  return createdResponse(res, {
    asset,
    facesDetected: faces.length,
  }, 'Source image uploaded successfully');
});

/**
 * Upload target image
 * POST /api/upload/target
 */
const uploadTargetImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new FileUploadError('No file uploaded');
  }

  const { projectId } = req.body;
  
  if (!projectId) {
    throw new ValidationError('Project ID is required');
  }

  // Read the uploaded file
  const filePath = path.join(config.upload.tempDir, req.file.filename);
  const buffer = await readFileAsBuffer(filePath);

  // Process image and generate thumbnail
  const processed = await imageProcessingService.processImage(buffer);
  const thumbnail = await imageProcessingService.generateThumbnail(buffer);

  // Detect faces
  const faces = await faceDetectionService.detectFaces(buffer);

  // Generate paths
  const assetId = uuidv4();
  const processedFilename = `${assetId}.${processed.metadata.format}`;
  const thumbnailFilename = `${assetId}_thumb.jpg`;
  const processedPath = path.join(config.upload.processedDir, processedFilename);
  const thumbnailPath = path.join(config.upload.processedDir, thumbnailFilename);

  // Save processed files
  await ensureDirectory(config.upload.processedDir);
  await writeBufferToFile(processedPath, processed.buffer);
  await writeBufferToFile(thumbnailPath, thumbnail);

  // Clean up temp file
  await deleteFile(filePath);

  // Add asset to project
  const asset = await projectService.addAsset(projectId, req.user.id, {
    type: 'target',
    filename: processedFilename,
    originalName: req.file.originalname,
    path: processedPath,
    thumbnailPath,
    mimeType: req.file.mimetype,
    size: processed.metadata.size,
    metadata: processed.metadata,
    faces,
  });

  logger.info(`Target image uploaded: ${asset.id} for project ${projectId}`);

  return createdResponse(res, {
    asset,
    facesDetected: faces.length,
  }, 'Target image uploaded successfully');
});

/**
 * Upload both source and target images at once
 * POST /api/upload/pair
 */
const uploadImagePair = asyncHandler(async (req, res) => {
  if (!req.files || !req.files.sourceImage || !req.files.targetImage) {
    throw new FileUploadError('Both source and target images are required');
  }

  const { projectId } = req.body;
  
  if (!projectId) {
    throw new ValidationError('Project ID is required');
  }

  const sourceFile = req.files.sourceImage[0];
  const targetFile = req.files.targetImage[0];

  // Process both images
  const processAsset = async (file, type) => {
    const filePath = path.join(config.upload.tempDir, file.filename);
    const buffer = await readFileAsBuffer(filePath);

    const processed = await imageProcessingService.processImage(buffer);
    const thumbnail = await imageProcessingService.generateThumbnail(buffer);
    const faces = await faceDetectionService.detectFaces(buffer);

    const assetId = uuidv4();
    const processedFilename = `${assetId}.${processed.metadata.format}`;
    const thumbnailFilename = `${assetId}_thumb.jpg`;
    const processedPath = path.join(config.upload.processedDir, processedFilename);
    const thumbnailPath = path.join(config.upload.processedDir, thumbnailFilename);

    await ensureDirectory(config.upload.processedDir);
    await writeBufferToFile(processedPath, processed.buffer);
    await writeBufferToFile(thumbnailPath, thumbnail);
    await deleteFile(filePath);

    return projectService.addAsset(projectId, req.user.id, {
      type,
      filename: processedFilename,
      originalName: file.originalname,
      path: processedPath,
      thumbnailPath,
      mimeType: file.mimetype,
      size: processed.metadata.size,
      metadata: processed.metadata,
      faces,
    });
  };

  const [sourceAsset, targetAsset] = await Promise.all([
    processAsset(sourceFile, 'source'),
    processAsset(targetFile, 'target'),
  ]);

  logger.info(`Image pair uploaded for project ${projectId}`);

  return createdResponse(res, {
    sourceAsset,
    targetAsset,
  }, 'Image pair uploaded successfully');
});

/**
 * Remove asset from project
 * DELETE /api/upload/:projectId/asset/:assetId
 */
const removeAsset = asyncHandler(async (req, res) => {
  const { projectId, assetId } = req.params;

  await projectService.removeAsset(projectId, req.user.id, assetId);

  return noContentResponse(res);
});

/**
 * Detect faces in uploaded image
 * POST /api/upload/detect-faces
 */
const detectFaces = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new FileUploadError('No file uploaded');
  }

  const filePath = path.join(config.upload.tempDir, req.file.filename);
  const buffer = await readFileAsBuffer(filePath);

  const faces = await faceDetectionService.detectFaces(buffer);

  // Clean up temp file
  await deleteFile(filePath);

  return successResponse(res, {
    facesDetected: faces.length,
    faces,
  }, 'Face detection completed');
});

module.exports = {
  uploadSourceImage,
  uploadTargetImage,
  uploadImagePair,
  removeAsset,
  detectFaces,
};
