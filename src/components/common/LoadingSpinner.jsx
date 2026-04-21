import React from 'react';

/**
 * Fullscreen loading spinner.
 * @param {string} bgColor - Background color class (default: 'bg-white')
 * @param {string} spinnerColor - Border-top color class (default: 'border-t-black')
 * @param {string} trackColor - Border track color class (default: 'border-slate-200')
 */
const LoadingSpinner = ({ 
  bgColor = 'bg-white', 
  spinnerColor = 'border-t-black',
  trackColor = 'border-slate-200'
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center ${bgColor}`}>
      <div className={`w-10 h-10 border-4 ${trackColor} ${spinnerColor} rounded-full animate-spin`} />
    </div>
  );
};

export default LoadingSpinner;
