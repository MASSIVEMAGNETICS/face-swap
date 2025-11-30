/**
 * Project Routes
 * Handles project management endpoints
 */

const express = require('express');
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

/**
 * @route   GET /api/projects/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', authenticate, projectController.getUserStats);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', authenticate, validate(schemas.createProject), projectController.createProject);

/**
 * @route   GET /api/projects
 * @desc    Get all projects for current user
 * @access  Private
 */
router.get('/', authenticate, validate(schemas.pagination, 'query'), projectController.getProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Private
 */
router.get('/:id', authenticate, validate(schemas.idParam, 'params'), projectController.getProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private
 */
router.put('/:id', authenticate, validate(schemas.idParam, 'params'), projectController.updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private
 */
router.delete('/:id', authenticate, validate(schemas.idParam, 'params'), projectController.deleteProject);

/**
 * @route   GET /api/projects/:id/results
 * @desc    Get project results
 * @access  Private
 */
router.get('/:id/results', authenticate, validate(schemas.idParam, 'params'), projectController.getProjectResults);

/**
 * @route   DELETE /api/projects/:id/results/:resultId
 * @desc    Delete specific result from project
 * @access  Private
 */
router.delete('/:id/results/:resultId', authenticate, projectController.deleteProjectResult);

module.exports = router;
