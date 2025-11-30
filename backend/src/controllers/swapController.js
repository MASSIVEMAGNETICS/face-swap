/**
 * Swap Controller
 * Handles face swap processing operations
 */

const path = require('path');
const fs = require('fs').promises;
const projectService = require('../services/projectService');
const userService = require('../services/userService');
const imageProcessingService = require('../services/imageProcessingService');
const { successResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const { NotFoundError } = require('../utils/errors');
const config = require('../config');
const logger = require('../config/logger');

/**
 * Execute face swap for a project
 * POST /api/swap/:projectId
 */
const executeSwap = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const options = req.body.options || {};

  const result = await projectService.processFaceSwap(
    projectId,
    req.user.id,
    options
  );

  // Update user stats
  await userService.updateStats(req.user.id, {
    swapsCount: 1,
    processingTime: result.result.processingTime,
  });

  logger.info(`Face swap completed for project ${projectId}`);

  return successResponse(res, {
    result: result.result,
    project: result.project,
  }, 'Face swap completed successfully');
});

/**
 * Get swap result image
 * GET /api/swap/result/:resultId
 */
const getSwapResult = asyncHandler(async (req, res) => {
  const { resultId } = req.params;

  // Find result across all user projects
  const projectsResult = await projectService.getUserProjects(req.user.id, { limit: 1000 });
  
  let foundResult = null;
  let foundProject = null;

  for (const project of projectsResult.projects) {
    const result = project.results.find(r => r.id === resultId);
    if (result) {
      foundResult = result;
      foundProject = project;
      break;
    }
  }

  if (!foundResult) {
    throw new NotFoundError('Result');
  }

  // Send the file
  const absolutePath = path.resolve(foundResult.outputPath);
  
  // Check if file exists
  try {
    await fs.access(absolutePath);
  } catch {
    throw new NotFoundError('Result file');
  }

  res.sendFile(absolutePath);
});

/**
 * Get swap result thumbnail
 * GET /api/swap/result/:resultId/thumbnail
 */
const getSwapThumbnail = asyncHandler(async (req, res) => {
  const { resultId } = req.params;

  const projectsResult = await projectService.getUserProjects(req.user.id, { limit: 1000 });
  
  let foundResult = null;

  for (const project of projectsResult.projects) {
    const result = project.results.find(r => r.id === resultId);
    if (result) {
      foundResult = result;
      break;
    }
  }

  if (!foundResult || !foundResult.thumbnailPath) {
    throw new NotFoundError('Result thumbnail');
  }

  const absolutePath = path.resolve(foundResult.thumbnailPath);
  
  try {
    await fs.access(absolutePath);
  } catch {
    throw new NotFoundError('Result thumbnail file');
  }

  res.sendFile(absolutePath);
});

/**
 * Download swap result
 * GET /api/swap/download/:resultId
 */
const downloadResult = asyncHandler(async (req, res) => {
  const { resultId } = req.params;
  const { format = 'png' } = req.query;

  const projectsResult = await projectService.getUserProjects(req.user.id, { limit: 1000 });
  
  let foundResult = null;

  for (const project of projectsResult.projects) {
    const result = project.results.find(r => r.id === resultId);
    if (result) {
      foundResult = result;
      break;
    }
  }

  if (!foundResult) {
    throw new NotFoundError('Result');
  }

  const absolutePath = path.resolve(foundResult.outputPath);
  
  try {
    await fs.access(absolutePath);
  } catch {
    throw new NotFoundError('Result file');
  }

  // If format conversion is requested
  if (format !== 'png' && ['jpeg', 'webp'].includes(format)) {
    const buffer = await fs.readFile(absolutePath);
    const converted = await imageProcessingService.convertFormat(buffer, format);
    
    res.setHeader('Content-Type', `image/${format}`);
    res.setHeader('Content-Disposition', `attachment; filename="face-swap-${resultId}.${format}"`);
    return res.send(converted);
  }

  res.setHeader('Content-Disposition', `attachment; filename="face-swap-${resultId}.png"`);
  res.sendFile(absolutePath);
});

/**
 * Apply filter to swap result
 * POST /api/swap/result/:resultId/filter
 */
const applyFilter = asyncHandler(async (req, res) => {
  const { resultId } = req.params;
  const { filterType } = req.body;

  const projectsResult = await projectService.getUserProjects(req.user.id, { limit: 1000 });
  
  let foundResult = null;

  for (const project of projectsResult.projects) {
    const result = project.results.find(r => r.id === resultId);
    if (result) {
      foundResult = result;
      break;
    }
  }

  if (!foundResult) {
    throw new NotFoundError('Result');
  }

  const absolutePath = path.resolve(foundResult.outputPath);
  const buffer = await fs.readFile(absolutePath);
  const filtered = await imageProcessingService.applyFilter(buffer, filterType);

  res.setHeader('Content-Type', 'image/png');
  return res.send(filtered);
});

/**
 * Preview face swap (non-destructive)
 * POST /api/swap/preview
 */
const previewSwap = asyncHandler(async (req, res) => {
  // This would be used for real-time preview
  // For now, just return a placeholder response
  return successResponse(res, {
    message: 'Preview feature - coming soon',
  }, 'Preview generated');
});

module.exports = {
  executeSwap,
  getSwapResult,
  getSwapThumbnail,
  downloadResult,
  applyFilter,
  previewSwap,
};
