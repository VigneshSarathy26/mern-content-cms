const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const logger = require('../config/logger');

// @desc    Get inventory status overview & stock items (populates Mongoose chains)
// @route   GET /api/inventory
const getInventory = async (req, res) => {
  try {
    let query = Product.find().populate('supplierId').sort({ createdAt: -1 });
    const products = await query;

    const totalValuation = products.reduce((acc, p) => acc + (p.sellingPrice * p.stockQuantity), 0);
    const lowStockCount = products.filter(p => p.stockQuantity <= p.reorderThreshold && p.stockQuantity > 0).length;
    const outOfStockCount = products.filter(p => p.stockQuantity === 0).length;

    return res.json({
      summary: {
        totalItems: products.length,
        totalValuation,
        lowStockCount,
        outOfStockCount,
      },
      items: products,
    });
  } catch (error) {
    logger.error(`Get Inventory Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch inventory status' });
  }
};

// @desc    Adjust inventory stock level manually & record movement ledger
// @route   POST /api/inventory/adjust
const adjustInventory = async (req, res) => {
  try {
    const { productId, adjustmentQuantity, type, reason } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Target product not found' });
    }

    const prevQty = product.stockQuantity;
    const qtyChange = Number(adjustmentQuantity);
    const newQty = Math.max(0, prevQty + qtyChange);

    product.stockQuantity = newQty;
    if (newQty > product.reorderThreshold) {
      product.isLowStockAlerted = false; // reset alert flag if replenished
    }
    await product.save();

    const logEntry = await InventoryLog.create({
      productId: product._id,
      sku: product.sku,
      type: type || (qtyChange >= 0 ? 'ADJUSTMENT' : 'DEDUCTION'),
      quantity: qtyChange,
      previousQuantity: prevQty,
      newQuantity: newQty,
      reason: reason || 'Manual stock adjustment tool',
      performedBy: req.user?.name || 'Inventory Manager',
    });

    logger.info(`[STOCK ADJUSTMENT] SKU ${product.sku} adjusted by ${qtyChange}: ${prevQty} -> ${newQty}`);
    return res.json({ product, logEntry });
  } catch (error) {
    logger.error(`Stock Adjustment Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to adjust stock level' });
  }
};

// @desc    Get Stock Movement Ledger audit trail
// @route   GET /api/inventory/logs
const getInventoryLogs = async (req, res) => {
  try {
    const logs = await InventoryLog.find().populate('productId').sort({ createdAt: -1 }).limit(100);
    return res.json(logs);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch inventory movement ledger' });
  }
};

module.exports = { getInventory, adjustInventory, getInventoryLogs };
