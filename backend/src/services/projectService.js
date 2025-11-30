/**
 * Project Service
 * Manages face swap projects and their assets
 */

const { v4: uuidv4 } = require('uuid');
const path = require('path');
const logger = require('../config/logger');
const config = require('../config');
const { NotFoundError, ValidationError, ProcessingError } = require('../utils/errors');
const imageProcessingService = require('./imageProcessingService');
const faceDetectionService = require('./faceDetectionService');
const { deleteFile, ensureDirectory } = require('../utils/fileUtils');

/**
 * In-memory project store
 * In production, this would be a database
 */
const projects = new Map();

/**
 * Project Service Class
 */
class ProjectService {
  /**
   * Create a new project
   * @param {Object} projectData - Project data
   * @param {string} userId - Owner user ID
   * @returns {Object} Created project
   */
  async createProject(projectData, userId) {
    const project = {
      id: uuidv4(),
      name: projectData.name,
      description: projectData.description || '',
      type: projectData.type || 'image',
      userId,
      status: 'draft',
      assets: [],
      results: [],
      settings: {
        quality: 'high',
        preserveExpression: true,
        blendStrength: 80,
        enhanceFace: true,
        outputFormat: 'png',
      },
      metadata: {
        totalSwaps: 0,
        processingTime: 0,
        lastProcessed: null,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.set(project.id, project);
    logger.info(`Project created: ${project.id} by user ${userId}`);

    return project;
  }

  /**
   * Get project by ID
   * @param {string} id - Project ID
   * @param {string} userId - User ID for authorization
   * @returns {Object} Project
   */
  async getProjectById(id, userId) {
    const project = projects.get(id);
    
    if (!project) {
      throw new NotFoundError('Project');
    }

    if (project.userId !== userId) {
      throw new NotFoundError('Project'); // Hide existence for security
    }

    return project;
  }

  /**
   * Get all projects for a user
   * @param {string} userId - User ID
   * @param {Object} options - Pagination and filter options
   * @returns {Object} Projects list with pagination
   */
  async getUserProjects(userId, options = {}) {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', type } = options;

    let userProjects = Array.from(projects.values())
      .filter((p) => p.userId === userId);

    // Filter by type if specified
    if (type) {
      userProjects = userProjects.filter((p) => p.type === type);
    }

    // Sort projects
    userProjects.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = userProjects.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProjects = userProjects.slice(start, end);

    return {
      projects: paginatedProjects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update project
   * @param {string} id - Project ID
   * @param {string} userId - User ID for authorization
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated project
   */
  async updateProject(id, userId, updateData) {
    const project = await this.getProjectById(id, userId);

    const allowedFields = ['name', 'description', 'settings'];
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'settings') {
          project.settings = { ...project.settings, ...updateData.settings };
        } else {
          project[field] = updateData[field];
        }
      }
    }

    project.updatedAt = new Date().toISOString();
    projects.set(id, project);

    logger.info(`Project updated: ${id}`);
    return project;
  }

  /**
   * Delete project
   * @param {string} id - Project ID
   * @param {string} userId - User ID for authorization
   */
  async deleteProject(id, userId) {
    const project = await this.getProjectById(id, userId);

    // Clean up associated files
    for (const asset of project.assets) {
      if (asset.path) {
        await deleteFile(asset.path).catch(() => {});
      }
      if (asset.thumbnailPath) {
        await deleteFile(asset.thumbnailPath).catch(() => {});
      }
    }

    for (const result of project.results) {
      if (result.outputPath) {
        await deleteFile(result.outputPath).catch(() => {});
      }
      if (result.thumbnailPath) {
        await deleteFile(result.thumbnailPath).catch(() => {});
      }
    }

    projects.delete(id);
    logger.info(`Project deleted: ${id}`);
  }

  /**
   * Add asset to project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @param {Object} assetData - Asset data
   * @returns {Object} Added asset
   */
  async addAsset(projectId, userId, assetData) {
    const project = await this.getProjectById(projectId, userId);

    const asset = {
      id: uuidv4(),
      type: assetData.type, // 'source' or 'target'
      filename: assetData.filename,
      originalName: assetData.originalName,
      path: assetData.path,
      thumbnailPath: assetData.thumbnailPath,
      mimeType: assetData.mimeType,
      size: assetData.size,
      metadata: assetData.metadata || {},
      faces: assetData.faces || [],
      createdAt: new Date().toISOString(),
    };

    project.assets.push(asset);
    project.updatedAt = new Date().toISOString();
    projects.set(projectId, project);

    logger.info(`Asset added to project ${projectId}: ${asset.id}`);
    return asset;
  }

  /**
   * Remove asset from project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @param {string} assetId - Asset ID
   */
  async removeAsset(projectId, userId, assetId) {
    const project = await this.getProjectById(projectId, userId);

    const assetIndex = project.assets.findIndex((a) => a.id === assetId);
    if (assetIndex === -1) {
      throw new NotFoundError('Asset');
    }

    const [asset] = project.assets.splice(assetIndex, 1);

    // Clean up files
    if (asset.path) {
      await deleteFile(asset.path).catch(() => {});
    }
    if (asset.thumbnailPath) {
      await deleteFile(asset.thumbnailPath).catch(() => {});
    }

    project.updatedAt = new Date().toISOString();
    projects.set(projectId, project);

    logger.info(`Asset removed from project ${projectId}: ${assetId}`);
  }

  /**
   * Process face swap for project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @param {Object} options - Processing options
   * @returns {Object} Processing result
   */
  async processFaceSwap(projectId, userId, options = {}) {
    const project = await this.getProjectById(projectId, userId);

    // Find source and target assets
    const sourceAsset = project.assets.find((a) => a.type === 'source');
    const targetAsset = project.assets.find((a) => a.type === 'target');

    if (!sourceAsset || !targetAsset) {
      throw new ValidationError('Both source and target images are required');
    }

    const startTime = Date.now();
    project.status = 'processing';
    projects.set(projectId, project);

    try {
      // Read images with proper error handling
      const fs = require('fs').promises;
      let sourceBuffer, targetBuffer;
      
      try {
        sourceBuffer = await fs.readFile(sourceAsset.path);
      } catch (fileError) {
        throw new ValidationError(`Source image file not found or cannot be read: ${sourceAsset.filename}`);
      }
      
      try {
        targetBuffer = await fs.readFile(targetAsset.path);
      } catch (fileError) {
        throw new ValidationError(`Target image file not found or cannot be read: ${targetAsset.filename}`);
      }

      // Get face data (use cached or detect new)
      let sourceFace = sourceAsset.faces[0];
      let targetFace = targetAsset.faces[0];

      if (!sourceFace) {
        const sourceFaces = await faceDetectionService.detectFaces(sourceBuffer);
        if (sourceFaces.length === 0) {
          throw new ValidationError('No face detected in source image');
        }
        sourceFace = sourceFaces[0];
        sourceAsset.faces = sourceFaces;
      }

      if (!targetFace) {
        const targetFaces = await faceDetectionService.detectFaces(targetBuffer);
        if (targetFaces.length === 0) {
          throw new ValidationError('No face detected in target image');
        }
        targetFace = targetFaces[0];
        targetAsset.faces = targetFaces;
      }

      // Merge options with project settings
      const processOptions = {
        ...project.settings,
        ...options,
      };

      // Perform face swap
      const result = await imageProcessingService.performFaceSwap(
        sourceBuffer,
        targetBuffer,
        sourceFace.box,
        targetFace.box,
        processOptions
      );

      // Create result record
      const resultRecord = {
        id: result.id,
        outputPath: result.outputPath,
        thumbnailPath: result.thumbnailPath,
        filename: result.filename,
        thumbnailFilename: result.thumbnailFilename,
        metadata: result.metadata,
        options: processOptions,
        processingTime: Date.now() - startTime,
        createdAt: new Date().toISOString(),
      };

      project.results.push(resultRecord);
      project.metadata.totalSwaps++;
      project.metadata.processingTime += resultRecord.processingTime;
      project.metadata.lastProcessed = new Date().toISOString();
      project.status = 'completed';
      project.updatedAt = new Date().toISOString();
      projects.set(projectId, project);

      logger.info(`Face swap completed for project ${projectId} in ${resultRecord.processingTime}ms`);

      return {
        success: true,
        result: resultRecord,
        project,
      };
    } catch (error) {
      project.status = 'error';
      project.lastError = error.message;
      projects.set(projectId, project);

      logger.error(`Face swap failed for project ${projectId}:`, error);
      throw error;
    }
  }

  /**
   * Get project results
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @returns {Array} Project results
   */
  async getProjectResults(projectId, userId) {
    const project = await this.getProjectById(projectId, userId);
    return project.results;
  }

  /**
   * Delete specific result from project
   * @param {string} projectId - Project ID
   * @param {string} userId - User ID
   * @param {string} resultId - Result ID
   */
  async deleteResult(projectId, userId, resultId) {
    const project = await this.getProjectById(projectId, userId);

    const resultIndex = project.results.findIndex((r) => r.id === resultId);
    if (resultIndex === -1) {
      throw new NotFoundError('Result');
    }

    const [result] = project.results.splice(resultIndex, 1);

    // Clean up files
    if (result.outputPath) {
      await deleteFile(result.outputPath).catch(() => {});
    }
    if (result.thumbnailPath) {
      await deleteFile(result.thumbnailPath).catch(() => {});
    }

    project.updatedAt = new Date().toISOString();
    projects.set(projectId, project);

    logger.info(`Result deleted from project ${projectId}: ${resultId}`);
  }

  /**
   * Get project statistics
   * @param {string} userId - User ID
   * @returns {Object} User's project statistics
   */
  async getUserStats(userId) {
    const userProjects = Array.from(projects.values())
      .filter((p) => p.userId === userId);

    const totalProjects = userProjects.length;
    const totalSwaps = userProjects.reduce((sum, p) => sum + p.metadata.totalSwaps, 0);
    const totalProcessingTime = userProjects.reduce((sum, p) => sum + p.metadata.processingTime, 0);
    const projectsByType = {
      image: userProjects.filter((p) => p.type === 'image').length,
      video: userProjects.filter((p) => p.type === 'video').length,
      batch: userProjects.filter((p) => p.type === 'batch').length,
    };

    return {
      totalProjects,
      totalSwaps,
      totalProcessingTime,
      projectsByType,
      averageProcessingTime: totalSwaps > 0 ? Math.round(totalProcessingTime / totalSwaps) : 0,
    };
  }
}

// Export singleton instance
module.exports = new ProjectService();
