const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_inventory_pro';
  
  try {
    const conn = await mongoose.connect(mongoURI, {
      // Mongoose 8 options
    });
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.warn(`MongoDB Connection Error: ${error.message}. Running in Mock/In-Memory Mode if DB unreachable.`);
  }
};

module.exports = connectDB;
