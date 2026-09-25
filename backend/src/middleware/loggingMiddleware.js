const fs = require('fs');
const path = require('path');

const logDir = path.resolve(__dirname, '../../../logs');
const accessLogPath = path.join(logDir, 'access.log');

const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLine = `[${new Date().toISOString()}] ${method} ${originalUrl} ${res.statusCode} ${duration}ms - IP: ${ip}\n`;

    fs.appendFile(accessLogPath, logLine, (err) => {
      if (err) {
        // Fallback silently if disk write issue occurs
      }
    });
  });

  next();
};

module.exports = loggingMiddleware;
