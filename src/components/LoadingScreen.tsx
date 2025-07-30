import React from 'react';
import { LoadingProgress } from '../types';

interface LoadingScreenProps {
  progress: LoadingProgress;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  // Removed unused functions to clean up ESLint warnings

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo/Icon */}
        <div className="mb-6">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Parking Zones Map
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-end text-sm text-gray-600 mb-2">
            <span>{progress.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 