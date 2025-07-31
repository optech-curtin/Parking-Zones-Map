import ExcelJS from 'exceljs';
import { BayTypeCount } from '../types';
import { logger } from '../utils/logger';
import { MapService } from './MapService';

export interface ExcelExportData {
  parkingLots: string[];
  bayTypeCounts: BayTypeCount[];
  bayColors: { [key: string]: string }; // Add bay colors from ParkingContext
  mapService?: MapService;
}

export class ExcelExportService {
  /**
   * Export parking data to Excel with comprehensive formatting
   */
  public async exportParkingData(data: ExcelExportData): Promise<void> {
    try {
      logger.info('Starting Excel export', 'ExcelExportService', { 
        parkingLotsCount: data.parkingLots.length,
        bayTypesCount: data.bayTypeCounts.length 
      });

      const workbook = new ExcelJS.Workbook();
      
      // Create summary sheet (Tab 1)
      await this.createSummarySheet(workbook, data);
      
      // Create zones sheet (Tab 2)
      await this.createZonesSheet(workbook, data);
      
      // Create parking lots sheet (Tab 3)
      await this.createParkingLotsSheet(workbook, data);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `Parking_Zones_Report_${timestamp}.xlsx`;

      // Save the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      logger.info('Excel export completed successfully', 'ExcelExportService', { filename });
    } catch (error) {
      logger.error('Failed to export Excel file', 'ExcelExportService', error instanceof Error ? error : undefined);
      throw new Error('Failed to export Excel file');
    }
  }

  /**
   * Create zones sheet (Tab 1) with multi-column layout
   */
  private async createZonesSheet(workbook: ExcelJS.Workbook, data: ExcelExportData): Promise<void> {
    const worksheet = workbook.addWorksheet('Zones');
    
    // Get zone summaries with proper bay counts
    const zoneSummaries = await this.getZoneSummaries(data);
    
    // Add title with better formatting
    const maxColumnsPerRow = 6;
    const titleColumns = Math.min(zoneSummaries.length, maxColumnsPerRow) * 3;
    worksheet.mergeCells(1, 1, 1, titleColumns);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = 'PARKING ZONES SUMMARY';
    titleCell.font = { bold: true, size: 18, color: { argb: '1F4E79' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7F3FF' } };
    
    // Add export date
    worksheet.mergeCells(2, 1, 2, titleColumns);
    const dateCell = worksheet.getCell(2, 1);
    dateCell.value = `Exported: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    dateCell.font = { italic: true, size: 10, color: { argb: '666666' } };
    dateCell.alignment = { horizontal: 'center' };
    
    // Create grouped layout by zones (max 6 per row)
    let currentRow = 4;
    let currentColumn = 1;
    let zoneIndex = 0;
    
    while (zoneIndex < zoneSummaries.length) {
      // Calculate how many zones to show in this row
      const zonesInThisRow = Math.min(maxColumnsPerRow, zoneSummaries.length - zoneIndex);
      
      // Process zones for this row
      for (let i = 0; i < zonesInThisRow; i++) {
        const zoneSummary = zoneSummaries[zoneIndex + i];
        const zoneColor = this.getZoneColor(zoneSummary.zone, data.bayColors);
        const textColor = this.getZoneTextColor(zoneSummary.zone, data.bayColors);
        
        // Zone header (spans 2 columns)
        worksheet.mergeCells(currentRow, currentColumn, currentRow, currentColumn + 1);
        const zoneHeaderCell = worksheet.getCell(currentRow, currentColumn);
        zoneHeaderCell.value = `${zoneSummary.zone} (Zone)`;
        zoneHeaderCell.font = { bold: true, size: 14, color: { argb: textColor } };
        zoneHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zoneColor } };
        zoneHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
        zoneHeaderCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Column headers
        const parkingLotHeader = worksheet.getCell(currentRow + 1, currentColumn);
        parkingLotHeader.value = 'Parking Lot';
        parkingLotHeader.font = { bold: true, color: { argb: textColor } };
        parkingLotHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zoneColor } };
        parkingLotHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        parkingLotHeader.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        const baysHeader = worksheet.getCell(currentRow + 1, currentColumn + 1);
        baysHeader.value = 'Number of Bays';
        baysHeader.font = { bold: true, color: { argb: textColor } };
        baysHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zoneColor } };
        baysHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        baysHeader.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Data rows
        for (let j = 0; j < zoneSummary.parkingLots.length; j++) {
          const parkingLot = zoneSummary.parkingLots[j];
          const row = currentRow + 2 + j;
          
          const parkingLotCell = worksheet.getCell(row, currentColumn);
          parkingLotCell.value = parkingLot.name;
          parkingLotCell.font = { color: { argb: textColor } };
          parkingLotCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zoneColor } };
          parkingLotCell.alignment = { horizontal: 'center', vertical: 'middle' };
          parkingLotCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          
          const baysCell = worksheet.getCell(row, currentColumn + 1);
          baysCell.value = parkingLot.bayCount;
          baysCell.font = { color: { argb: textColor } };
          baysCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zoneColor } };
          baysCell.alignment = { horizontal: 'center', vertical: 'middle' };
          baysCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
        
        // Total row
        const totalRow = currentRow + 2 + zoneSummary.parkingLots.length;
        const totalLabelCell = worksheet.getCell(totalRow, currentColumn);
        totalLabelCell.value = 'Total';
        totalLabelCell.font = { bold: true, color: { argb: textColor } };
        totalLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zoneColor } };
        totalLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
        totalLabelCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        const totalValueCell = worksheet.getCell(totalRow, currentColumn + 1);
        totalValueCell.value = zoneSummary.totalBays;
        totalValueCell.font = { bold: true, color: { argb: textColor } };
        totalValueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zoneColor } };
        totalValueCell.alignment = { horizontal: 'center', vertical: 'middle' };
        totalValueCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        currentColumn += 3; // Move to next zone (2 columns + 1 spacing)
      }
      
      // Move to next row if there are more zones
      if (zoneIndex + zonesInThisRow < zoneSummaries.length) {
        // Find the maximum number of rows used in this row of zones
        let maxRowsInThisRow = 0;
        for (let i = 0; i < zonesInThisRow; i++) {
          const zoneSummary = zoneSummaries[zoneIndex + i];
          maxRowsInThisRow = Math.max(maxRowsInThisRow, zoneSummary.parkingLots.length);
        }
        
        currentRow += 6 + maxRowsInThisRow; // 30 rows spacing + header + column headers + data rows + total
        currentColumn = 1;
      }
      
      zoneIndex += zonesInThisRow;
    }
    
    // Set column widths
    for (let i = 1; i <= maxColumnsPerRow * 3; i++) {
      const column = worksheet.getColumn(i);
      column.width = i % 3 === 0 ? 5 : 18; // Narrow spacing columns, wider data columns
    }
  }

  /**
   * Create parking lots sheet (Tab 2) with grouped layout by parking lot
   */
  private async createParkingLotsSheet(workbook: ExcelJS.Workbook, data: ExcelExportData): Promise<void> {
    const worksheet = workbook.addWorksheet('Parking Lots');
    
    // Sort parking lots alphabetically
    const sortedParkingLots = [...data.parkingLots].sort();
    
    // Add title with better formatting
    const maxColumnsPerRow = 6;
    const titleColumns = Math.min(sortedParkingLots.length, maxColumnsPerRow) * 3;
    worksheet.mergeCells(1, 1, 1, titleColumns);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = 'PARKING LOTS BREAKDOWN';
    titleCell.font = { bold: true, size: 18, color: { argb: '1F4E79' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7F3FF' } };
    
    // Add export date
    worksheet.mergeCells(2, 1, 2, titleColumns);
    const dateCell = worksheet.getCell(2, 1);
    dateCell.value = `Exported: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    dateCell.font = { italic: true, size: 10, color: { argb: '666666' } };
    dateCell.alignment = { horizontal: 'center' };
    
    // Create grouped layout by parking lots (max 6 per row)
    let currentRow = 4;
    let currentColumn = 1;
    let parkingLotIndex = 0;
    
    while (parkingLotIndex < sortedParkingLots.length) {
      // Calculate how many parking lots to show in this row
      const parkingLotsInThisRow = Math.min(maxColumnsPerRow, sortedParkingLots.length - parkingLotIndex);
      
      // Process parking lots for this row
      for (let i = 0; i < parkingLotsInThisRow; i++) {
        const parkingLot = sortedParkingLots[parkingLotIndex + i];
        
        // Parking lot header (spans 2 columns)
        worksheet.mergeCells(currentRow, currentColumn, currentRow, currentColumn + 1);
        const parkingLotHeaderCell = worksheet.getCell(currentRow, currentColumn);
        parkingLotHeaderCell.value = parkingLot;
        parkingLotHeaderCell.font = { bold: true, size: 14, color: { argb: '000000' } };
        parkingLotHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } };
        parkingLotHeaderCell.alignment = { horizontal: 'center', vertical: 'middle' };
        parkingLotHeaderCell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Column headers
        const zoneHeader = worksheet.getCell(currentRow + 1, currentColumn);
        zoneHeader.value = 'Zone';
        zoneHeader.font = { bold: true, color: { argb: '000000' } };
        zoneHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } };
        zoneHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        zoneHeader.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        const baysHeader = worksheet.getCell(currentRow + 1, currentColumn + 1);
        baysHeader.value = 'Number of Bays';
        baysHeader.font = { bold: true, color: { argb: '000000' } };
        baysHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } };
        baysHeader.alignment = { horizontal: 'center', vertical: 'middle' };
        baysHeader.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        // Get bay counts for this parking lot
        const bayCounts: Array<{ zone: string; count: number }> = [];
        if (data.mapService) {
          try {
            const bays = await data.mapService.getSelectedParkingLotBays(parkingLot);
            for (const bay of bays) {
              if (bay.count > 0) {
                bayCounts.push({ zone: bay.type, count: bay.count });
              }
            }
          } catch {
            logger.warn(`Failed to get bay counts for parking lot: ${parkingLot}`, 'ExcelExportService');
          }
        }
        
        // Data rows
        for (let j = 0; j < bayCounts.length; j++) {
          const bayData = bayCounts[j];
          const row = currentRow + 2 + j;
          const zoneColor = this.getBayTypeColor(bayData.zone, data.bayColors);
          const textColor = this.getBayTypeTextColor(bayData.zone, data.bayColors);
          
          const zoneCell = worksheet.getCell(row, currentColumn);
          zoneCell.value = bayData.zone;
          zoneCell.font = { color: { argb: textColor } };
          zoneCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zoneColor } };
          zoneCell.alignment = { horizontal: 'center', vertical: 'middle' };
          zoneCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          
          const baysCell = worksheet.getCell(row, currentColumn + 1);
          baysCell.value = bayData.count;
          baysCell.font = { color: { argb: textColor } };
          baysCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zoneColor } };
          baysCell.alignment = { horizontal: 'center', vertical: 'middle' };
          baysCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
        
        // Total row
        const totalBays = bayCounts.reduce((sum, bay) => sum + bay.count, 0);
        const totalRow = currentRow + 2 + bayCounts.length;
        
        if (bayCounts.length > 0) {
          const totalLabelCell = worksheet.getCell(totalRow, currentColumn);
          totalLabelCell.value = 'Total';
          totalLabelCell.font = { bold: true, color: { argb: '000000' } };
          totalLabelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } };
          totalLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
          totalLabelCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          
          const totalValueCell = worksheet.getCell(totalRow, currentColumn + 1);
          totalValueCell.value = totalBays;
          totalValueCell.font = { bold: true, color: { argb: '000000' } };
          totalValueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } };
          totalValueCell.alignment = { horizontal: 'center', vertical: 'middle' };
          totalValueCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
        
        currentColumn += 3; // Move to next parking lot (2 columns + 1 spacing)
      }
      
      // Move to next row if there are more parking lots
      if (parkingLotIndex + parkingLotsInThisRow < sortedParkingLots.length) {
        // Find the maximum number of rows used in this row of parking lots
        let maxRowsInThisRow = 0;
        for (let i = 0; i < parkingLotsInThisRow; i++) {
          const parkingLot = sortedParkingLots[parkingLotIndex + i];
          let bayCount = 0;
          if (data.mapService) {
            try {
              const bays = await data.mapService.getSelectedParkingLotBays(parkingLot);
              bayCount = bays.length;
            } catch {
              // Ignore errors for row calculation
            }
          }
          maxRowsInThisRow = Math.max(maxRowsInThisRow, bayCount);
        }
        
        currentRow += 2 + maxRowsInThisRow; // 2 rows spacing + header + column headers + data rows + total
        currentColumn = 1;
      }
      
      parkingLotIndex += parkingLotsInThisRow;
    }
    
    // Set column widths
    for (let i = 1; i <= maxColumnsPerRow * 3; i++) {
      const column = worksheet.getColumn(i);
      column.width = i % 3 === 0 ? 5 : 18; // Narrow spacing columns, wider data columns
    }
  }

  /**
   * Create summary sheet (Tab 1) with zone totals
   */
  private async createSummarySheet(workbook: ExcelJS.Workbook, data: ExcelExportData): Promise<void> {
    const worksheet = workbook.addWorksheet('Summary');
    
    // Get zone summaries with proper bay counts
    const zoneSummaries = await this.getZoneSummaries(data);
    
    // Add title
    worksheet.mergeCells(1, 1, 1, 2);
    const titleCell = worksheet.getCell(1, 1);
    titleCell.value = 'PARKING ZONES SUMMARY';
    titleCell.font = { bold: true, size: 18, color: { argb: '1F4E79' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E7F3FF' } };
    
    // Add export date
    worksheet.mergeCells(2, 1, 2, 2);
    const dateCell = worksheet.getCell(2, 1);
    dateCell.value = `Exported: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    dateCell.font = { italic: true, size: 10, color: { argb: '666666' } };
    dateCell.alignment = { horizontal: 'center' };
    
    // Add column headers
    const zoneHeader = worksheet.getCell(4, 1);
    zoneHeader.value = 'Zones';
    zoneHeader.font = { bold: true, size: 14, color: { argb: '000000' } };
    zoneHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } };
    zoneHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    zoneHeader.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    const totalHeader = worksheet.getCell(4, 2);
    totalHeader.value = 'Total Bays';
    totalHeader.font = { bold: true, size: 14, color: { argb: '000000' } };
    totalHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0F0F0' } };
    totalHeader.alignment = { horizontal: 'center', vertical: 'middle' };
    totalHeader.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
    
    // Add zone data
    let currentRow = 5;
    for (const zoneSummary of zoneSummaries) {
      const zoneColor = this.getZoneColor(zoneSummary.zone, data.bayColors);
      const textColor = this.getZoneTextColor(zoneSummary.zone, data.bayColors);
      
      const zoneCell = worksheet.getCell(currentRow, 1);
      zoneCell.value = zoneSummary.zone;
      zoneCell.font = { bold: true, size: 12, color: { argb: textColor } };
      zoneCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zoneColor } };
      zoneCell.alignment = { horizontal: 'center', vertical: 'middle' };
      zoneCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      const totalCell = worksheet.getCell(currentRow, 2);
      totalCell.value = zoneSummary.totalBays;
      totalCell.font = { bold: true, size: 12, color: { argb: textColor } };
      totalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zoneColor } };
      totalCell.alignment = { horizontal: 'center', vertical: 'middle' };
      totalCell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      currentRow++;
    }
    
    // Set column widths
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 15;
  }

  /**
   * Get zone summaries with proper bay counts
   */
  private async getZoneSummaries(data: ExcelExportData): Promise<Array<{
    zone: string;
    parkingLots: Array<{ name: string; bayCount: number }>;
    totalBays: number;
  }>> {
    const zoneMap = new Map<string, Array<{ name: string; bayCount: number }>>();
    
    // Initialize zones
    for (const bayType of data.bayTypeCounts) {
      zoneMap.set(bayType.type, []);
    }
    
    // Get bay counts for each parking lot and bay type
    if (data.mapService) {
      for (const parkingLot of data.parkingLots) {
        try {
          const bays = await data.mapService.getSelectedParkingLotBays(parkingLot);
          
          // Add to zone map using the BayTypeCount data
          for (const bay of bays) {
            const zone = zoneMap.get(bay.type);
            if (zone) {
              zone.push({ name: parkingLot, bayCount: bay.count });
            }
          }
        } catch {
          logger.warn(`Failed to get bays for parking lot: ${parkingLot}`, 'ExcelExportService');
        }
      }
    }
    
    // Convert to summaries and sort by total bays descending
    const summaries = Array.from(zoneMap.entries()).map(([zone, parkingLots]) => {
      const totalBays = parkingLots.reduce((sum, lot) => sum + lot.bayCount, 0);
      return { zone, parkingLots, totalBays };
    });
    
    return summaries.sort((a, b) => b.totalBays - a.totalBays);
  }

  /**
   * Get zone color from ParkingContext bay colors
   */
  private getZoneColor(zone: string, bayColors: { [key: string]: string }): string {
    const color = bayColors[zone] || '#9E9E9E'; // Use ParkingContext colors or default gray
    // Convert hex to ARGB format for ExcelJS
    return color.startsWith('#') ? color.substring(1) : color;
  }

  /**
   * Get text color for zone (white for dark backgrounds like black)
   */
  private getZoneTextColor(zone: string, bayColors: { [key: string]: string }): string {
    const color = bayColors[zone] || '#9E9E9E';
    // Use white text for dark colors (black, dark blue, etc.)
    const darkColors = ['#000000', '#000080', '#0000FF', '#000080', '#800000', '#800080'];
    // Special case for motorcycle zone - always use white text
    if (zone.toLowerCase() === 'motorcycle' || zone.toLowerCase() === 'motor') {
      return 'FFFFFF';
    }
    return darkColors.includes(color.toUpperCase()) ? 'FFFFFF' : '000000';
  }

  /**
   * Get bay type color from ParkingContext bay colors
   */
  private getBayTypeColor(bayType: string, bayColors: { [key: string]: string }): string {
    const color = bayColors[bayType] || '#9E9E9E'; // Use ParkingContext colors or default gray
    // Convert hex to ARGB format for ExcelJS
    return color.startsWith('#') ? color.substring(1) : color;
  }

  /**
   * Get text color for bay type (white for dark backgrounds like black)
   */
  private getBayTypeTextColor(bayType: string, bayColors: { [key: string]: string }): string {
    const color = bayColors[bayType] || '#9E9E9E';
    // Use white text for dark colors (black, dark blue, etc.)
    const darkColors = ['#000000', '#000080', '#0000FF', '#000080', '#800000', '#800080'];
    // Special case for motorcycle zone - always use white text
    if (bayType.toLowerCase() === 'motorcycle' || bayType.toLowerCase() === 'motor') {
      return 'FFFFFF';
    }
    return darkColors.includes(color.toUpperCase()) ? 'FFFFFF' : '000000';
  }
} 