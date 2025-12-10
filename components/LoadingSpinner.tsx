import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-500 dark:border-blue-300 border-t-transparent rounded-full animate-spin"></div>
      <span className="ml-2 text-gray-600 dark:text-gray-300 text-sm">Thinking...</span>
    </div>
  );
};

export default LoadingSpinner;