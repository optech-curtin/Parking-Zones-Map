import React, { useState, useCallback } from 'react';
import { useExcelExport } from '../hooks/useExcelExport';
import { MapService } from '../services/MapService';
import { logger } from '../utils/logger';

interface ExcelExportButtonProps {
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  mapService?: MapService | null;
}

export default function ExcelExportButton({ 
  className = '', 
  variant = 'primary',
  size = 'md',
  mapService = null
}: ExcelExportButtonProps) {
  const { isExporting, exportError, exportToExcel, setMapService } = useExcelExport();
  const [showError, setShowError] = useState(false);

  // Set the MapService when the component mounts or when mapService prop changes
  const updateMapService = useCallback(() => {
    setMapService(mapService);
  }, [mapService, setMapService]);

  React.useEffect(() => {
    updateMapService();
  }, [updateMapService]);

  const handleExport = async () => {
    try {
      await exportToExcel();
      setShowError(false);
    } catch (error) {
      setShowError(true);
      logger.error('Export button error', 'ExcelExportButton', error instanceof Error ? error : undefined);
      
      // Auto-hide error after 5 seconds
      setTimeout(() => setShowError(false), 5000);
    }
  };

  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // Variant classes
  const variantClasses = {
    primary: 'bg-[var(--accent-blue)] text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-[var(--menu-body-bg)] text-[var(--text-primary)] border border-[var(--card-border)] hover:bg-[var(--menu-hover)] focus:ring-[var(--accent-blue)]'
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`${buttonClasses} ${isExporting ? 'cursor-not-allowed opacity-75 animate-pulse' : ''}`}
        title={isExporting ? 'Exporting...' : 'Export to Excel'}
      >
        {isExporting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Exporting...
          </>
        ) : (
          <>
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export Excel
          </>
        )}
      </button>

      {/* Error Toast */}
      {showError && exportError ? (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-[var(--accent-red)] text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap">
            <div className="flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {exportError}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
} 