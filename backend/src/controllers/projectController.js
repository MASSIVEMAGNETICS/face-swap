/**
 * Project Controller
 * Handles CRUD operations for face swap projects
 */

const projectService = require('../services/projectService');
const userService = require('../services/userService');
const { successResponse, createdResponse, noContentResponse, paginatedResponse } = require('../utils/response');
const { asyncHandler } = require('../middleware/errorHandler');
const logger = require('../config/logger');

/**
 * Create a new project
 * POST /api/projects
 */
const createProject = asyncHandler(async (req, res) => {
  const { name, description, type } = req.body;

  const project = await projectService.createProject(
    { name, description, type },
    req.user.id
  );

  // Update user stats
  await userService.updateStats(req.user.id, { projectsCount: 1 });

  logger.info(`Project created: ${project.id} by user ${req.user.id}`);

  return createdResponse(res, { project }, 'Project created successfully');
});

/**
 * Get all projects for current user
 * GET /api/projects
 */
const getProjects = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, type } = req.query;

  const result = await projectService.getUserProjects(req.user.id, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    sortBy: sortBy || 'createdAt',
    sortOrder: sortOrder || 'desc',
    type,
  });

  return paginatedResponse(res, result.projects, result.pagination, 'Projects retrieved successfully');
});

/**
 * Get single project by ID
 * GET /api/projects/:id
 */
const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.id, req.user.id);
  return successResponse(res, { project }, 'Project retrieved successfully');
});

/**
 * Update project
 * PUT /api/projects/:id
 */
const updateProject = asyncHandler(async (req, res) => {
  const { name, description, settings } = req.body;

  const project = await projectService.updateProject(
    req.params.id,
    req.user.id,
    { name, description, settings }
  );

  return successResponse(res, { project }, 'Project updated successfully');
});

/**
 * Delete project
 * DELETE /api/projects/:id
 */
const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id, req.user.id);
  
  // Update user stats
  await userService.updateStats(req.user.id, { projectsCount: -1 });

  return noContentResponse(res);
});

/**
 * Get project results
 * GET /api/projects/:id/results
 */
const getProjectResults = asyncHandler(async (req, res) => {
  const results = await projectService.getProjectResults(req.params.id, req.user.id);
  return successResponse(res, { results }, 'Results retrieved successfully');
});

/**
 * Delete specific result from project
 * DELETE /api/projects/:id/results/:resultId
 */
const deleteProjectResult = asyncHandler(async (req, res) => {
  await projectService.deleteResult(req.params.id, req.user.id, req.params.resultId);
  return noContentResponse(res);
});

/**
 * Get user statistics
 * GET /api/projects/stats
 */
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await projectService.getUserStats(req.user.id);
  return successResponse(res, { stats }, 'Statistics retrieved successfully');
});

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectResults,
  deleteProjectResult,
  getUserStats,
};
