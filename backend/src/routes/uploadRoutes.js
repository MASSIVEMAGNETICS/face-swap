/**
 * Upload Routes
 * Handles file upload endpoints
 */

const express = require('express');
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');
const { singleImage, multipleImages } = require('../middleware/upload');

const router = express.Router();

/**
 * @route   POST /api/upload/source
 * @desc    Upload source image
 * @access  Private
 */
router.post('/source', authenticate, singleImage, uploadController.uploadSourceImage);

/**
 * @route   POST /api/upload/target
 * @desc    Upload target image
 * @access  Private
 */
router.post('/target', authenticate, singleImage, uploadController.uploadTargetImage);

/**
 * @route   POST /api/upload/pair
 * @desc    Upload both source and target images
 * @access  Private
 */
router.post('/pair', authenticate, multipleImages, uploadController.uploadImagePair);

/**
 * @route   DELETE /api/upload/:projectId/asset/:assetId
 * @desc    Remove asset from project
 * @access  Private
 */
router.delete('/:projectId/asset/:assetId', authenticate, uploadController.removeAsset);

/**
 * @route   POST /api/upload/detect-faces
 * @desc    Detect faces in uploaded image
 * @access  Private
 */
router.post('/detect-faces', authenticate, singleImage, uploadController.detectFaces);

module.exports = router;
