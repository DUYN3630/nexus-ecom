import React from 'react';

/**
 * Tooltip component hiển thị text khi hover.
 * @param {string} text - Nội dung tooltip
 * @param {React.ReactNode} children - Element trigger tooltip
 */
const Tooltip = ({ text, children }) => {
  return (
    <div className="group relative flex justify-center">
      {children}
      <span className="absolute bottom-full mb-2 w-max max-w-xs scale-0 transform rounded-lg bg-gray-800 p-2 text-center text-xs text-white transition-all group-hover:scale-100 origin-bottom">
        {text}
      </span>
    </div>
  );
};

export default Tooltip;
