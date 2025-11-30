/**
 * Loading Spinner Component
 */

import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div
      className={`loading-spinner ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

/**
 * Full Page Loading Component
 */
export const FullPageLoading = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-gray-600 font-medium">{message}</p>
    </div>
  );
};

/**
 * Processing Overlay Component
 */
export const ProcessingOverlay = ({ isProcessing, message = 'Processing...', progress = null }) => {
  if (!isProcessing) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 loading-spinner w-24 h-24 border-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            {progress !== null && (
              <span className="text-2xl font-bold text-primary-600">{progress}%</span>
            )}
          </div>
        </div>
        <p className="text-gray-700 font-medium text-lg">{message}</p>
        <p className="text-gray-500 text-sm mt-2">Please wait while we work our magic...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
