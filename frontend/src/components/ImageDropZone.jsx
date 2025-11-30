/**
 * Image Drop Zone Component
 * Drag and drop file upload with preview
 */

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, X, AlertCircle } from 'lucide-react';

const ImageDropZone = ({
  onFileSelect,
  preview,
  onClear,
  label = 'Drop image here',
  description = 'or click to browse',
  accept = { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif'] },
  maxSize = 50 * 1024 * 1024, // 50MB
  disabled = false,
  error = null,
  facesDetected = null,
}) => {
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        const errorMessage = rejection.errors[0]?.message || 'File rejected';
        console.error('File rejected:', errorMessage);
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled,
  });

  const getDropZoneClass = () => {
    let baseClass = 'drop-zone relative min-h-[200px] flex flex-col items-center justify-center';
    
    if (disabled) {
      return `${baseClass} opacity-50 cursor-not-allowed`;
    }
    
    if (isDragReject) {
      return `${baseClass} border-red-500 bg-red-50`;
    }
    
    if (isDragActive) {
      return `${baseClass} drop-zone-active`;
    }
    
    if (preview) {
      return `${baseClass} border-primary-300 bg-primary-50`;
    }
    
    return `${baseClass} hover:border-primary-400 hover:bg-gray-50`;
  };

  return (
    <div className="w-full">
      <div {...getRootProps({ className: getDropZoneClass() })}>
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Preview"
              className="max-h-[300px] w-auto mx-auto rounded-lg object-contain"
            />
            
            {/* Face detection indicator */}
            {facesDetected !== null && (
              <div className="absolute top-2 left-2 bg-white rounded-full px-3 py-1 text-sm font-medium shadow-md">
                {facesDetected > 0 ? (
                  <span className="text-green-600">
                    ✓ {facesDetected} face{facesDetected !== 1 ? 's' : ''} detected
                  </span>
                ) : (
                  <span className="text-red-600">⚠ No faces detected</span>
                )}
              </div>
            )}
            
            {/* Clear button */}
            {onClear && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center p-4">
            {isDragActive ? (
              <>
                <Upload className="w-12 h-12 mx-auto text-primary-500 mb-3 animate-bounce" />
                <p className="text-primary-600 font-medium">Drop the image here</p>
              </>
            ) : isDragReject ? (
              <>
                <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-3" />
                <p className="text-red-600 font-medium">Invalid file type</p>
              </>
            ) : (
              <>
                <Image className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-700 font-medium">{label}</p>
                <p className="text-gray-500 text-sm mt-1">{description}</p>
                <p className="text-gray-400 text-xs mt-2">
                  Supports: JPEG, PNG, WebP, GIF (Max: {Math.round(maxSize / 1024 / 1024)}MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-2 flex items-center text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageDropZone;
