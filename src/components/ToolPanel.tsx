"use client";

import React from 'react';
import { useTool, ToolType } from '../context/ToolContext';

const ToolPanel: React.FC = () => {
  const { selectedTool, setSelectedTool } = useTool();

  // Function to generate Tailwind classes for a button based on whether it's active.
  const buttonClasses = (tool: ToolType) => {
    const baseClasses = 'px-4 py-2 rounded-md text-white focus:outline-none transition-colors';
    return selectedTool === tool
      ? `${baseClasses} bg-blue-600`
      : `${baseClasses} bg-gray-500 hover:bg-gray-600`;
  };

  return (
    <div className="flex space-x-4 p-4 bg-gray-100 shadow-md">
      <button className={buttonClasses('close')} onClick={() => setSelectedTool('close')}>
        Close Carpark
      </button>
      <button className={buttonClasses('open')} onClick={() => setSelectedTool('open')}>
        Open Carpark
      </button>
      <button className={buttonClasses('editBays')} onClick={() => setSelectedTool('editBays')}>
        Edit Bays
      </button>
      <button className={buttonClasses('none')} onClick={() => setSelectedTool('none')}>
        None
      </button>
    </div>
  );
};

export default ToolPanel;
