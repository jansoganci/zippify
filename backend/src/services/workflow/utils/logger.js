// Log levels and their priorities
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
};

class Logger {
  constructor() {
    this.level = LogLevel.INFO; // Default level
  }

  setLevel(level) {
    this.level = level;
  }

  debug(message, metadata = {}) {
    if (this.level <= LogLevel.DEBUG) {
      console.debug('[DEBUG]', message, metadata);
    }
  }



  debug(message, metadata = {}) {
    this.log(message, 'DEBUG', metadata);
  }

  info(message, metadata = {}) {
    this.log(message, 'INFO', metadata);
  }

  warn(message, metadata = {}) {
    this.log(message, 'WARN', metadata);
  }

  error(message, metadata = {}) {
    this.log(message, 'ERROR', metadata);
  }

  critical(message, metadata = {}) {
    this.log(message, 'CRITICAL', metadata);
  }

  // Helper method to log step execution
  logStep(step, status, details = {}) {
    const metadata = {
      step,
      status,
      timestamp: new Date().toISOString(),
      ...details
    };

    this.info(`Step ${step}: ${status}`, metadata);
  }

  // Helper method to log API calls
  logApiCall(endpoint, status, details = {}) {
    const metadata = {
      endpoint,
      status,
      timestamp: new Date().toISOString(),
      ...details
    };

    this.debug(`API Call to ${endpoint}: ${status}`, metadata);
  }
}

// Create and export a singleton instance
export const logger = new Logger();
export default logger;
