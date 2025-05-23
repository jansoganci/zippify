// Centralized logger utility for Zippify frontend
// Environment-aware logging with proper production handling

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  enableConsole: boolean;
  minLevel: LogLevel;
  prefix: string;
}

const config: LogConfig = {
  enableConsole: import.meta.env.MODE === 'development',
  minLevel: import.meta.env.MODE === 'production' ? 'warn' : 'debug',
  prefix: '[Zippify]'
};

const logLevels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

function shouldLog(level: LogLevel): boolean {
  return logLevels[level] >= logLevels[config.minLevel];
}

function formatMessage(level: LogLevel, component: string = '', message: string, ...args: any[]): [string, ...any[]] {
  const timestamp = new Date().toISOString();
  const prefix = component ? `${config.prefix}[${component}]` : config.prefix;
  return [`${prefix} ${level.toUpperCase()} ${timestamp}: ${message}`, ...args];
}

// Core logging functions
export function debug(message: string, ...args: any[]) {
  if (config.enableConsole && shouldLog('debug')) {
    console.log(...formatMessage('debug', '', message, ...args));
  }
}

export function info(message: string, ...args: any[]) {
  if (config.enableConsole && shouldLog('info')) {
    console.info(...formatMessage('info', '', message, ...args));
  }
}

export function warn(message: string, ...args: any[]) {
  if (config.enableConsole && shouldLog('warn')) {
    console.warn(...formatMessage('warn', '', message, ...args));
  }
}

export function error(message: string, ...args: any[]) {
  if (config.enableConsole && shouldLog('error')) {
    console.error(...formatMessage('error', '', message, ...args));
  }
  
  // In production, you might want to send to error tracking service
  if (import.meta.env.MODE === 'production') {
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  }
}

// Component-specific loggers
export function createLogger(component: string) {
  return {
    debug: (message: string, ...args: any[]) => {
      if (config.enableConsole && shouldLog('debug')) {
        console.log(...formatMessage('debug', component, message, ...args));
      }
    },
    info: (message: string, ...args: any[]) => {
      if (config.enableConsole && shouldLog('info')) {
        console.info(...formatMessage('info', component, message, ...args));
      }
    },
    warn: (message: string, ...args: any[]) => {
      if (config.enableConsole && shouldLog('warn')) {
        console.warn(...formatMessage('warn', component, message, ...args));
      }
    },
    error: (message: string, ...args: any[]) => {
      if (config.enableConsole && shouldLog('error')) {
        console.error(...formatMessage('error', component, message, ...args));
      }
      
      // In production, send to error tracking
      if (import.meta.env.MODE === 'production') {
        // TODO: Send to error tracking service
      }
    }
  };
}

// Legacy support (to be deprecated)
export function log(...args: any[]) {
  debug('LEGACY LOG:', ...args);
}
