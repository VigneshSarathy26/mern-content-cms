const eventBroker = require('../services/eventBroker');
const logger = require('../config/logger');

const initNotificationWorker = () => {
  eventBroker.subscribe('low_stock.alert', async (eventPacket) => {
    const { sku, name, currentStock, threshold } = eventPacket.payload;
    logger.warn(
      `[NOTIFICATION SERVICE] 🚨 LOW STOCK EMAIL TRIGGER: SKU '${sku}' (${name}) stock level (${currentStock}) dropped below threshold (${threshold})!`
    );
  });
};

module.exports = initNotificationWorker;
