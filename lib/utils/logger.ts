// Simple logging utility that can be replaced with a proper logging framework
// (e.g., Winston, Pino, etc.) in production

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogOptions {
  level?: LogLevel;
  metadata?: Record<string, any>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Log an informational message
   */
  info(message: string, options?: LogOptions): void {
    this.log('info', message, options);
  }

  /**
   * Log a warning message
   */
  warn(message: string, options?: LogOptions): void {
    this.log('warn', message, options);
  }

  /**
   * Log an error message
   */
  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    const metadata = options?.metadata || {};
    if (error instanceof Error) {
      metadata.error = {
        message: error.message,
        stack: error.stack,
        name: error.name,
      };
    } else if (error) {
      metadata.error = error;
    }
    this.log('error', message, { ...options, metadata });
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, options?: LogOptions): void {
    if (this.isDevelopment) {
      this.log('debug', message, options);
    }
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, options?: LogOptions): void {
    const timestamp = new Date().toISOString();
    const metadata = options?.metadata;

    // Format log message
    const logMessage = metadata
      ? `[${timestamp}] [${level.toUpperCase()}] ${message} ${JSON.stringify(metadata)}`
      : `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    // Use appropriate console method
    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(logMessage);
        }
        break;
      default:
        console.log(logMessage);
    }

    // In production, this could be extended to:
    // - Send logs to external service (e.g., Datadog, Sentry, CloudWatch)
    // - Write to file system
    // - Send to log aggregation service
  }
}

// Export singleton instance
export const logger = new Logger();
