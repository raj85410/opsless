import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// Create a stream object for Morgan
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Helper functions for different log types
export const logError = (message, error = null, context = {}) => {
  const logData = {
    message,
    error: error ? error.message : null,
    stack: error ? error.stack : null,
    context,
    timestamp: new Date().toISOString()
  };
  
  logger.error(JSON.stringify(logData));
  
  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', logData);
  }
};

export const logInfo = (message, data = {}) => {
  const logData = {
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  logger.info(JSON.stringify(logData));
};

export const logWarn = (message, data = {}) => {
  const logData = {
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  logger.warn(JSON.stringify(logData));
};

export const logDebug = (message, data = {}) => {
  const logData = {
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  logger.debug(JSON.stringify(logData));
};

export const logHttp = (message, data = {}) => {
  const logData = {
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  logger.http(JSON.stringify(logData));
};

// AWS specific logging
export const logAWS = (service, action, data = {}) => {
  const logData = {
    service: 'aws',
    awsService: service,
    action,
    data,
    timestamp: new Date().toISOString()
  };
  
  logger.info(JSON.stringify(logData));
};

// Deployment specific logging
export const logDeployment = (deploymentId, stage, message, data = {}) => {
  const logData = {
    service: 'deployment',
    deploymentId,
    stage,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  logger.info(JSON.stringify(logData));
};

// Subscription specific logging
export const logSubscription = (userId, action, data = {}) => {
  const logData = {
    service: 'subscription',
    userId,
    action,
    data,
    timestamp: new Date().toISOString()
  };
  
  logger.info(JSON.stringify(logData));
};

// Performance logging
export const logPerformance = (operation, duration, data = {}) => {
  const logData = {
    service: 'performance',
    operation,
    duration,
    data,
    timestamp: new Date().toISOString()
  };
  
  logger.info(JSON.stringify(logData));
};

// Security logging
export const logSecurity = (event, userId = null, data = {}) => {
  const logData = {
    service: 'security',
    event,
    userId,
    data,
    timestamp: new Date().toISOString()
  };
  
  logger.warn(JSON.stringify(logData));
};

export default logger; 