import winston from 'winston';

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Create logs directory if it doesn't exist
import fs from 'fs';
import path from 'path';
const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

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
    }),
    // Special log file for authentication issues
    new winston.transports.File({ 
      filename: 'logs/auth.log',
      level: 'debug',
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
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ');
    logger.debug(message);
    // Always log debug to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔍 [DEBUG] ${message}`);
    }
  },
  info: (...args) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ');
    logger.info(message);
    console.log(`ℹ️  [INFO] ${message}`);
  },
  warn: (...args) => {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ');
    logger.warn(message);
    console.warn(`⚠️  [WARN] ${message}`);
  },
  error: (...args) => {
    const message = args.map(arg => 
      arg instanceof Error ? { 
        message: arg.message, 
        stack: arg.stack,
        name: arg.name,
        ...arg 
      } : arg
    );
    logger.error(message);
    console.error(`❌ [ERROR]`, ...message);
  },
  
  // Special methods for authentication debugging
  auth: (message, metadata = {}) => {
    const logData = {
      message,
      timestamp: new Date().toISOString(),
      type: 'AUTH',
      ...metadata
    };
    logger.info(logData);
    console.log(`🔐 [AUTH] ${message}`, metadata);
  },
  
  request: (req, message = 'Request received') => {
    const requestData = {
      message,
      method: req.method,
      url: req.url,
      headers: {
        'content-type': req.headers['content-type'],
        'authorization': req.headers.authorization ? 'Bearer ***' : 'none',
        'user-agent': req.headers['user-agent'],
        'x-request-id': req.headers['x-request-id']
      },
      ip: req.ip || req.connection?.remoteAddress,
      timestamp: new Date().toISOString()
    };
    logger.info(requestData);
    console.log(`🌐 [REQUEST] ${req.method} ${req.url}`, {
      auth: req.headers.authorization ? 'Bearer ***' : 'none',
      ip: requestData.ip
    });
  },
  
  response: (res, message = 'Response sent', metadata = {}) => {
    const responseData = {
      message,
      status: res.statusCode,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    logger.info(responseData);
    const emoji = res.statusCode >= 400 ? '🔴' : res.statusCode >= 300 ? '🟡' : '🟢';
    console.log(`${emoji} [RESPONSE] ${res.statusCode} - ${message}`, metadata);
  },
  
  apiCall: (endpoint, method = 'POST', metadata = {}) => {
    const apiData = {
      message: `API call to ${endpoint}`,
      endpoint,
      method,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    logger.debug(apiData);
    console.log(`🔗 [API] ${method} ${endpoint}`, metadata);
  },
  
  quota: (action, userId, metadata = {}) => {
    const quotaData = {
      message: `Quota check: ${action}`,
      action,
      userId,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    logger.info(quotaData);
    console.log(`📊 [QUOTA] ${action} for user ${userId}`, metadata);
  },
  
  // Method for 401 specific debugging
  auth401: (req, reason, metadata = {}) => {
    const auth401Data = {
      message: `401 Authentication Failed: ${reason}`,
      reason,
      method: req.method,
      url: req.url,
      headers: {
        authorization: req.headers.authorization ? `Bearer ${req.headers.authorization.substring(0, 20)}...` : 'none',
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent']
      },
      ip: req.ip || req.connection?.remoteAddress,
      timestamp: new Date().toISOString(),
      ...metadata
    };
    logger.error(auth401Data);
    console.error(`🚫 [401 ERROR] ${reason}`, {
      url: req.url,
      auth: req.headers.authorization ? 'Bearer present' : 'no auth header',
      ip: auth401Data.ip
    });
  }
};

export default log;
