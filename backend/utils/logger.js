import winston from 'winston';

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Create Winston logger instance
const logger = winston.createLogger({
  levels: logLevels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write all logs to console in development
    process.env.NODE_ENV !== 'production'
      ? new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        })
      : null,
    // Always write errors to error.log
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ].filter(Boolean)
});

// Convenience methods that match console.log style
const log = {
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      logger.debug(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : arg
      ).join(' '));
    }
  },
  info: (...args) => {
    logger.info(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : arg
    ).join(' '));
  },
  warn: (...args) => {
    logger.warn(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : arg
    ).join(' '));
  },
  error: (...args) => {
    logger.error(args.map(arg => 
      arg instanceof Error ? { 
        message: arg.message, 
        stack: arg.stack,
        ...arg 
      } : arg
    ));
  }
};


export default log;
