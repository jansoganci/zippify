import winston from 'winston';

const env = process.env.NODE_ENV || 'development';

const logger = winston.createLogger({
  level: env === 'production' ? 'warn' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `[${timestamp}] ${level.toUpperCase()}: ${message} ${metaString}`.trim();
    })
  ),
  transports: [
    new winston.transports.Console(),
    // Optionally add a file transport if desired:
    // new winston.transports.File({ filename: 'logs/app.log' })
  ]
});

export default {
  info: (...args) => logger.info(...args),
  warn: (...args) => logger.warn(...args),
  error: (...args) => logger.error(...args),
};
