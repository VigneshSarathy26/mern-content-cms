const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const logger = require('./config/logger');
const connectDB = require('./config/db');
const { initRedis } = require('./config/redis');
const seedInitialData = require('./services/seedService');

// Background Workers
const initStockWorker = require('./workers/stockWorker');
const initOrderWorker = require('./workers/orderWorker');
const initNotificationWorker = require('./workers/notificationWorker');
const initDLQWorker = require('./workers/dlqWorker');

// Middlewares & Routes
const loggingMiddleware = require('./middleware/loggingMiddleware');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(loggingMiddleware);

// API Route Registration
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/events', eventRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(`Uncaught Server Exception: ${err.stack || err.message}`);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // 1. Connect MongoDB
  await connectDB();

  // 2. Initialize Redis Client
  initRedis();

  // 3. Initialize Asynchronous Event Workers
  initStockWorker();
  initOrderWorker();
  initNotificationWorker();
  initDLQWorker();

  // 4. Seed database with initial Admin accounts & Products
  await seedInitialData();

  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      logger.info(`=======================================================`);
      logger.info(`🚀 Express API Gateway running on port ${PORT}`);
      logger.info(`📡 Health Endpoint: http://localhost:${PORT}/api/health`);
      logger.info(`=======================================================`);
    });
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
