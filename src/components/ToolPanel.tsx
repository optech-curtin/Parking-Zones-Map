"use client";

import React from 'react';
import { useTool, ToolType } from '../context/ToolContext';

const ToolPanel: React.FC = () => {
  const { selectedTool, setSelectedTool } = useTool();

  // Function to generate Tailwind classes for a button based on whether it's active.
  const buttonClasses = (tool: ToolType) => {
    const baseClasses = 'px-4 py-2 rounded-md text-white focus:outline-none transition-colors';
    return selectedTool === tool
      ? `${baseClasses} bg-[var(--accent-blue)]`
      : `${baseClasses} bg-[var(--text-muted)] hover:bg-[var(--text-secondary)]`;
  };

  return (
    <div className="flex space-x-4 p-4 bg-[var(--menu-header-bg)] shadow-[var(--shadow)] border border-[var(--card-border)] rounded-lg">
      <button className={buttonClasses('close')} onClick={React.useCallback(() => setSelectedTool('close'), [setSelectedTool])}>
        Close Carpark
      </button>
      <button className={buttonClasses('open')} onClick={React.useCallback(() => setSelectedTool('open'), [setSelectedTool])}>
        Open Carpark
      </button>
      <button className={buttonClasses('editBays')} onClick={React.useCallback(() => setSelectedTool('editBays'), [setSelectedTool])}>
        Edit Bays
      </button>
      <button className={buttonClasses('none')} onClick={React.useCallback(() => setSelectedTool('none'), [setSelectedTool])}>
        None
      </button>
    </div>
  );
};

export default ToolPanel;
