import { logger } from './logger';

export interface PerformanceMetrics {
  mapInitializationTime: number;
  layerLoadTime: number;
  dataLoadTime: number;
  preloadTime: number;
  totalLoadTime: number;
  panZoomPerformance: number[];
  memoryUsage?: number;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private timers: Map<string, number> = new Map();
  private panZoomTimes: number[] = [];

  private constructor() {
    this.metrics = {
      mapInitializationTime: 0,
      layerLoadTime: 0,
      dataLoadTime: 0,
      preloadTime: 0,
      totalLoadTime: 0,
      panZoomPerformance: []
    };
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  public startTimer(name: string): void {
    this.timers.set(name, performance.now());
    logger.debug(`Performance timer started: ${name}`, 'PerformanceMonitor');
  }

  public endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      logger.warn(`Timer ${name} was not started`, 'PerformanceMonitor');
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);
    
    logger.debug(`Performance timer ended: ${name} - ${duration.toFixed(2)}ms`, 'PerformanceMonitor');
    return duration;
  }

  public recordMapInitializationTime(time: number): void {
    this.metrics.mapInitializationTime = time;
    logger.info(`Map initialization completed in ${time.toFixed(2)}ms`, 'PerformanceMonitor');
  }

  public recordLayerLoadTime(time: number): void {
    this.metrics.layerLoadTime = time;
    logger.info(`Layer loading completed in ${time.toFixed(2)}ms`, 'PerformanceMonitor');
  }

  public recordDataLoadTime(time: number): void {
    this.metrics.dataLoadTime = time;
    logger.info(`Data loading completed in ${time.toFixed(2)}ms`, 'PerformanceMonitor');
  }

  public recordPreloadTime(time: number): void {
    this.metrics.preloadTime = time;
    logger.info(`Preloading completed in ${time.toFixed(2)}ms`, 'PerformanceMonitor');
  }

  public recordTotalLoadTime(time: number): void {
    this.metrics.totalLoadTime = time;
    logger.info(`Total load time: ${time.toFixed(2)}ms`, 'PerformanceMonitor');
  }

  public recordPanZoomTime(time: number): void {
    this.panZoomTimes.push(time);
    
    // Keep only the last 10 pan/zoom times
    if (this.panZoomTimes.length > 10) {
      this.panZoomTimes.shift();
    }
    
    this.metrics.panZoomPerformance = [...this.panZoomTimes];
    
    if (time > 100) {
      logger.warn(`Slow pan/zoom detected: ${time.toFixed(2)}ms`, 'PerformanceMonitor');
    } else {
      logger.debug(`Pan/zoom time: ${time.toFixed(2)}ms`, 'PerformanceMonitor');
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getAveragePanZoomTime(): number {
    if (this.panZoomTimes.length === 0) return 0;
    const sum = this.panZoomTimes.reduce((a, b) => a + b, 0);
    return sum / this.panZoomTimes.length;
  }

  public logPerformanceSummary(): void {
    const avgPanZoom = this.getAveragePanZoomTime();
    
    logger.info('=== Performance Summary ===', 'PerformanceMonitor');
    logger.info(`Map Initialization: ${this.metrics.mapInitializationTime.toFixed(2)}ms`, 'PerformanceMonitor');
    logger.info(`Layer Loading: ${this.metrics.layerLoadTime.toFixed(2)}ms`, 'PerformanceMonitor');
    logger.info(`Data Loading: ${this.metrics.dataLoadTime.toFixed(2)}ms`, 'PerformanceMonitor');
    logger.info(`Preloading: ${this.metrics.preloadTime.toFixed(2)}ms`, 'PerformanceMonitor');
    logger.info(`Total Load Time: ${this.metrics.totalLoadTime.toFixed(2)}ms`, 'PerformanceMonitor');
    logger.info(`Average Pan/Zoom Time: ${avgPanZoom.toFixed(2)}ms`, 'PerformanceMonitor');
    logger.info(`Pan/Zoom Samples: ${this.panZoomTimes.length}`, 'PerformanceMonitor');
    
    // Performance recommendations
    if (this.metrics.totalLoadTime > 10000) {
      logger.warn('⚠️  Total load time is high. Consider optimizing data loading.', 'PerformanceMonitor');
    }
    
    if (avgPanZoom > 50) {
      logger.warn('⚠️  Pan/zoom performance is slow. Consider reducing data complexity.', 'PerformanceMonitor');
    }
    
    logger.info('=== End Performance Summary ===', 'PerformanceMonitor');
  }

  public reset(): void {
    this.metrics = {
      mapInitializationTime: 0,
      layerLoadTime: 0,
      dataLoadTime: 0,
      preloadTime: 0,
      totalLoadTime: 0,
      panZoomPerformance: []
    };
    this.timers.clear();
    this.panZoomTimes = [];
    logger.debug('Performance metrics reset', 'PerformanceMonitor');
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance(); 