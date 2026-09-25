const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getIsRedisAvailable } = require('../config/redis');

// @desc    Standard Health Check API Gateway Endpoint
// @route   GET /api/health
router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED / IN-MEMORY FALLBACK';
  const redisStatus = getIsRedisAvailable() ? 'CONNECTED (Redis Streams)' : 'IN-MEMORY EVENT LOOP EMULATOR';

  return res.json({
    status: 'HEALTHY',
    service: 'Express API Gateway',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    eventBroker: redisStatus,
    version: '1.0.0',
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

module.exports = router;
