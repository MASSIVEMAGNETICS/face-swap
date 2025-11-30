/**
 * Image Processing Service
 * Handles image manipulation and face detection using Sharp
 */

const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../config/logger');
const { ProcessingError } = require('../utils/errors');
const { ensureDirectory, writeBufferToFile, readFileAsBuffer } = require('../utils/fileUtils');

/**
 * Image Processing Service Class
 */
class ImageProcessingService {
  constructor() {
    this.outputDir = config.upload.processedDir;
    this.tempDir = config.upload.tempDir;
  }

  /**
   * Process and optimize image
   * @param {string|Buffer} input - Input file path or buffer
   * @param {Object} options - Processing options
   * @returns {Object} Processed image info
   */
  async processImage(input, options = {}) {
    try {
      const {
        format = 'png',
        quality = 90,
        maxWidth = 2048,
        maxHeight = 2048,
        preserveAspectRatio = true,
      } = options;

      let image = sharp(input);
      const metadata = await image.metadata();

      // Resize if needed while preserving aspect ratio
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        image = image.resize(maxWidth, maxHeight, {
          fit: preserveAspectRatio ? 'inside' : 'fill',
          withoutEnlargement: true,
        });
      }

      // Apply format conversion
      const formatOptions = this.getFormatOptions(format, quality);
      image = image[format](formatOptions);

      const buffer = await image.toBuffer();
      const newMetadata = await sharp(buffer).metadata();

      return {
        buffer,
        metadata: {
          width: newMetadata.width,
          height: newMetadata.height,
          format: newMetadata.format,
          size: buffer.length,
        },
      };
    } catch (error) {
      logger.error('Image processing failed:', error);
      throw new ProcessingError(`Failed to process image: ${error.message}`);
    }
  }

  /**
   * Get format-specific options
   * @param {string} format - Output format
   * @param {number} quality - Quality level (1-100)
   * @returns {Object} Format options
   */
  getFormatOptions(format, quality) {
    switch (format) {
      case 'jpeg':
      case 'jpg':
        return { quality, mozjpeg: true };
      case 'png':
        return { compressionLevel: 9 - Math.floor(quality / 12) };
      case 'webp':
        return { quality, lossless: quality === 100 };
      default:
        return { quality };
    }
  }

  /**
   * Generate thumbnail for image
   * @param {string|Buffer} input - Input file path or buffer
   * @param {Object} options - Thumbnail options
   * @returns {Buffer} Thumbnail buffer
   */
  async generateThumbnail(input, options = {}) {
    try {
      const {
        width = config.processing.thumbnailSize.width,
        height = config.processing.thumbnailSize.height,
        format = 'jpeg',
        quality = 80,
      } = options;

      const buffer = await sharp(input)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
        })
        [format]({ quality })
        .toBuffer();

      return buffer;
    } catch (error) {
      logger.error('Thumbnail generation failed:', error);
      throw new ProcessingError(`Failed to generate thumbnail: ${error.message}`);
    }
  }

  /**
   * Extract face region from image (basic implementation)
   * In production, this would use face-api.js or similar
   * @param {string|Buffer} input - Input file path or buffer
   * @param {Object} faceBox - Face bounding box { x, y, width, height }
   * @returns {Buffer} Cropped face region
   */
  async extractFaceRegion(input, faceBox) {
    try {
      const { x, y, width, height } = faceBox;
      
      const buffer = await sharp(input)
        .extract({
          left: Math.max(0, x),
          top: Math.max(0, y),
          width,
          height,
        })
        .toBuffer();

      return buffer;
    } catch (error) {
      logger.error('Face extraction failed:', error);
      throw new ProcessingError(`Failed to extract face region: ${error.message}`);
    }
  }

  /**
   * Composite face onto target image
   * @param {Buffer} targetBuffer - Target image buffer
   * @param {Buffer} faceBuffer - Face image buffer
   * @param {Object} position - Position { x, y }
   * @param {Object} options - Composite options
   * @returns {Buffer} Composited image buffer
   */
  async compositeFace(targetBuffer, faceBuffer, position, options = {}) {
    try {
      const { blend = 'over', opacity = 1 } = options;

      const buffer = await sharp(targetBuffer)
        .composite([
          {
            input: faceBuffer,
            left: position.x,
            top: position.y,
            blend,
            opacity,
          },
        ])
        .toBuffer();

      return buffer;
    } catch (error) {
      logger.error('Face composite failed:', error);
      throw new ProcessingError(`Failed to composite face: ${error.message}`);
    }
  }

  /**
   * Perform face swap between two images
   * This is a simplified implementation - production would use ML models
   * @param {Buffer} sourceBuffer - Source image with face to extract
   * @param {Buffer} targetBuffer - Target image to swap face into
   * @param {Object} sourceFace - Source face detection data
   * @param {Object} targetFace - Target face detection data
   * @param {Object} options - Swap options
   * @returns {Object} Result with swapped image
   */
  async performFaceSwap(sourceBuffer, targetBuffer, sourceFace, targetFace, options = {}) {
    try {
      const {
        blendStrength = 80,
        preserveExpression = true,
        enhanceFace = true,
      } = options;

      // Get target image metadata
      const targetMetadata = await sharp(targetBuffer).metadata();

      // Extract source face
      let extractedFace = await this.extractFaceRegion(sourceBuffer, sourceFace);

      // Resize face to match target face dimensions
      extractedFace = await sharp(extractedFace)
        .resize(targetFace.width, targetFace.height, {
          fit: 'fill',
        })
        .toBuffer();

      // Apply blending/smoothing if enhancement is enabled
      if (enhanceFace) {
        extractedFace = await sharp(extractedFace)
          .blur(0.5)
          .modulate({
            brightness: 1,
            saturation: 1,
          })
          .toBuffer();
      }

      // Composite face onto target
      const opacity = blendStrength / 100;
      const result = await this.compositeFace(
        targetBuffer,
        extractedFace,
        { x: targetFace.x, y: targetFace.y },
        { blend: 'over', opacity }
      );

      // Generate output filename
      const outputId = uuidv4();
      const outputFilename = `${outputId}.png`;
      const outputPath = path.join(this.outputDir, outputFilename);

      // Save result
      await ensureDirectory(this.outputDir);
      await writeBufferToFile(outputPath, result);

      // Generate thumbnail
      const thumbnail = await this.generateThumbnail(result);
      const thumbnailFilename = `${outputId}_thumb.jpg`;
      const thumbnailPath = path.join(this.outputDir, thumbnailFilename);
      await writeBufferToFile(thumbnailPath, thumbnail);

      const resultMetadata = await sharp(result).metadata();

      return {
        id: outputId,
        outputPath,
        thumbnailPath,
        filename: outputFilename,
        thumbnailFilename,
        metadata: {
          width: resultMetadata.width,
          height: resultMetadata.height,
          format: resultMetadata.format,
          size: result.length,
        },
      };
    } catch (error) {
      logger.error('Face swap failed:', error);
      throw new ProcessingError(`Failed to perform face swap: ${error.message}`);
    }
  }

  /**
   * Apply artistic filters to image
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {string} filterType - Type of filter to apply
   * @returns {Buffer} Filtered image buffer
   */
  async applyFilter(imageBuffer, filterType) {
    try {
      let image = sharp(imageBuffer);

      switch (filterType) {
        case 'grayscale':
          image = image.grayscale();
          break;
        case 'sepia':
          image = image.modulate({ saturation: 0.8 }).tint({ r: 112, g: 66, b: 20 });
          break;
        case 'blur':
          image = image.blur(5);
          break;
        case 'sharpen':
          image = image.sharpen();
          break;
        case 'enhance':
          image = image.modulate({ brightness: 1.1, saturation: 1.2 });
          break;
        case 'vintage':
          image = image.modulate({ saturation: 0.7 }).gamma(1.3);
          break;
        default:
          // No filter applied
          break;
      }

      return await image.toBuffer();
    } catch (error) {
      logger.error('Filter application failed:', error);
      throw new ProcessingError(`Failed to apply filter: ${error.message}`);
    }
  }

  /**
   * Get image metadata
   * @param {string|Buffer} input - Input file path or buffer
   * @returns {Object} Image metadata
   */
  async getMetadata(input) {
    try {
      const metadata = await sharp(input).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        hasAlpha: metadata.hasAlpha,
        orientation: metadata.orientation,
      };
    } catch (error) {
      logger.error('Metadata extraction failed:', error);
      throw new ProcessingError(`Failed to get image metadata: ${error.message}`);
    }
  }

  /**
   * Convert image format
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {string} targetFormat - Target format
   * @param {Object} options - Conversion options
   * @returns {Buffer} Converted image buffer
   */
  async convertFormat(imageBuffer, targetFormat, options = {}) {
    try {
      const { quality = 90 } = options;
      const formatOptions = this.getFormatOptions(targetFormat, quality);

      return await sharp(imageBuffer)
        [targetFormat](formatOptions)
        .toBuffer();
    } catch (error) {
      logger.error('Format conversion failed:', error);
      throw new ProcessingError(`Failed to convert image format: ${error.message}`);
    }
  }

  /**
   * Rotate image
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {number} angle - Rotation angle in degrees
   * @returns {Buffer} Rotated image buffer
   */
  async rotate(imageBuffer, angle) {
    try {
      return await sharp(imageBuffer)
        .rotate(angle)
        .toBuffer();
    } catch (error) {
      logger.error('Image rotation failed:', error);
      throw new ProcessingError(`Failed to rotate image: ${error.message}`);
    }
  }

  /**
   * Crop image
   * @param {Buffer} imageBuffer - Input image buffer
   * @param {Object} cropBox - Crop parameters { x, y, width, height }
   * @returns {Buffer} Cropped image buffer
   */
  async crop(imageBuffer, cropBox) {
    try {
      const { x, y, width, height } = cropBox;
      
      return await sharp(imageBuffer)
        .extract({
          left: Math.max(0, x),
          top: Math.max(0, y),
          width,
          height,
        })
        .toBuffer();
    } catch (error) {
      logger.error('Image crop failed:', error);
      throw new ProcessingError(`Failed to crop image: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new ImageProcessingService();
