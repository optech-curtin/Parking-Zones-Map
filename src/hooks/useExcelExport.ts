import { useCallback, useState, useRef } from 'react';
import { useParking } from '../context/ParkingContext';
import { ExcelExportService, ExcelExportData } from '../services/ExcelExportService';
import { MapService } from '../services/MapService';
import { logger } from '../utils/logger';

export interface UseExcelExportReturn {
  isExporting: boolean;
  exportError: string | null;
  exportToExcel: () => Promise<void>;
  setMapService: (mapService: MapService | null) => void;
}

export function useExcelExport(): UseExcelExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const mapServiceRef = useRef<MapService | null>(null);
  
  const { state } = useParking();

  const exportToExcel = useCallback(async (): Promise<void> => {
    try {
      setIsExporting(true);
      setExportError(null);

      logger.info('Starting Excel export process', 'useExcelExport');

      // Prepare the data for export
      const exportData: ExcelExportData = {
        parkingLots: state.parkingLots,
        bayTypeCounts: state.bayTypeCounts,
        bayColors: state.bayColors, // Add bay colors from ParkingContext
        mapService: mapServiceRef.current || undefined
      };

      // Validate that we have data to export
      if (!exportData.parkingLots.length && !exportData.bayTypeCounts.length) {
        throw new Error('No data available to export. Please ensure the map has loaded completely.');
      }

      // Perform the export
      const excelExportService = new ExcelExportService();
      await excelExportService.exportParkingData(exportData);

      logger.info('Excel export completed successfully', 'useExcelExport', {
        parkingLotsCount: exportData.parkingLots.length,
        bayTypesCount: exportData.bayTypeCounts.length
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during export';
      setExportError(errorMessage);
      
      logger.error('Excel export failed', 'useExcelExport', error instanceof Error ? error : undefined);
      
      // Re-throw the error so the UI can handle it appropriately
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [state]);

  const setMapService = useCallback((mapService: MapService | null) => {
    mapServiceRef.current = mapService;
  }, []);

  return {
    isExporting,
    exportError,
    exportToExcel,
    setMapService
  };
} 