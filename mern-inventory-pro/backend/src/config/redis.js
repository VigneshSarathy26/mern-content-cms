const Redis = require('ioredis');
const logger = require('./logger');

let redisClient = null;
let isRedisAvailable = false;

const initRedis = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  
  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 2) {
          logger.warn('Redis unreachable. Falling back to In-Memory Asynchronous Event Broker Loop emulator.');
          return null; // Stop retrying
        }
        return Math.min(times * 100, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
      logger.info('Connected to Redis Streams Broker successfully.');
    });

    redisClient.on('error', (err) => {
      isRedisAvailable = false;
      // Suppress spamming error logs
    });

    redisClient.connect().catch((err) => {
      logger.warn(`Redis connection failed (${err.message}). Dual-Mode Broker switching to In-Memory Event Loop emulator.`);
    });
  } catch (err) {
    logger.warn('Failed to initialize ioredis client. Using In-Memory Event Broker.');
  }

  return redisClient;
};

const getRedisClient = () => redisClient;
const getIsRedisAvailable = () => isRedisAvailable;

module.exports = { initRedis, getRedisClient, getIsRedisAvailable };
