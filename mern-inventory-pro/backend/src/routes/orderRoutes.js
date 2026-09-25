const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, createOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, rbac('ADMIN', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF'), createOrder);

module.exports = router;
