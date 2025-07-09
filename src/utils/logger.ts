export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  error?: Error;
  data?: unknown;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;
  private readonly minLevel: LogLevel;

  private constructor() {
    this.minLevel = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG;
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: string, error?: Error, data?: unknown): void {
    if (level < this.minLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
      data
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output based on level
    const prefix = context ? `[${context}]` : '';
    const timestamp = entry.timestamp.toISOString();

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(`${timestamp} ${prefix} ${message}`, data || '');
        break;
      case LogLevel.INFO:
        console.info(`${timestamp} ${prefix} ${message}`, data || '');
        break;
      case LogLevel.WARN:
        console.warn(`${timestamp} ${prefix} ${message}`, data || '');
        break;
      case LogLevel.ERROR:
        console.error(`${timestamp} ${prefix} ${message}`, error || data || '');
        break;
    }
  }

  public debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, undefined, data);
  }

  public info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, undefined, data);
  }

  public warn(message: string, context?: string, error?: Error, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, error, data);
  }

  public error(message: string, context?: string, error?: Error, data?: unknown): void {
    this.log(LogLevel.ERROR, message, context, error, data);
  }

  public getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = Logger.getInstance(); 