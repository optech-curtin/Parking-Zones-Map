"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the type of tools available in the app.
export type ToolType = 'none' | 'close' | 'open' | 'editBays';

interface ToolContextProps {
  selectedTool: ToolType;
  setSelectedTool: (tool: ToolType) => void;
}

// Create the context with an undefined initial value.
const ToolContext = createContext<ToolContextProps | undefined>(undefined);

// Provider component that holds the current tool state.
export const ToolProvider = ({ children }: { children: ReactNode }) => {
  const [selectedTool, setSelectedTool] = useState<ToolType>('none');

  return (
    <ToolContext.Provider value={{ selectedTool, setSelectedTool }}>
      {children}
    </ToolContext.Provider>
  );
};

// Custom hook to easily use the tool context.
export const useTool = (): ToolContextProps => {
  const context = useContext(ToolContext);
  if (!context) {
    throw new Error('useTool must be used within a ToolProvider');
  }
  return context;
};
