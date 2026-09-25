const express = require('express');
const router = express.Router();
const { getInventory, adjustInventory, getInventoryLogs } = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/', protect, getInventory);
router.post('/adjust', protect, rbac('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'), adjustInventory);
router.get('/logs', protect, getInventoryLogs);

module.exports = router;
