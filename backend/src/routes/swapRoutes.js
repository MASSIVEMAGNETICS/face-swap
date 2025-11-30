/**
 * Swap Routes
 * Handles face swap processing endpoints
 */

const express = require('express');
const swapController = require('../controllers/swapController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/swap/:projectId
 * @desc    Execute face swap for a project
 * @access  Private
 */
router.post('/:projectId', authenticate, swapController.executeSwap);

/**
 * @route   GET /api/swap/result/:resultId
 * @desc    Get swap result image
 * @access  Private
 */
router.get('/result/:resultId', authenticate, swapController.getSwapResult);

/**
 * @route   GET /api/swap/result/:resultId/thumbnail
 * @desc    Get swap result thumbnail
 * @access  Private
 */
router.get('/result/:resultId/thumbnail', authenticate, swapController.getSwapThumbnail);

/**
 * @route   GET /api/swap/download/:resultId
 * @desc    Download swap result
 * @access  Private
 */
router.get('/download/:resultId', authenticate, swapController.downloadResult);

/**
 * @route   POST /api/swap/result/:resultId/filter
 * @desc    Apply filter to swap result
 * @access  Private
 */
router.post('/result/:resultId/filter', authenticate, swapController.applyFilter);

/**
 * @route   POST /api/swap/preview
 * @desc    Preview face swap
 * @access  Private
 */
router.post('/preview', authenticate, swapController.previewSwap);

module.exports = router;
