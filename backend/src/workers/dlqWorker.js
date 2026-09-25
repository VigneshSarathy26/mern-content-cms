const logger = require('../config/logger');

const initDLQWorker = () => {
  logger.info('[DLQ WORKER] Dead Letter Queue monitoring initialized.');
};

module.exports = initDLQWorker;
