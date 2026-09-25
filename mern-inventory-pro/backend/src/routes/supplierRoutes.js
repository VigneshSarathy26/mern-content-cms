const express = require('express');
const router = express.Router();
const { getSuppliers, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/supplierController');
const { protect } = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/', protect, getSuppliers);
router.post('/', protect, rbac('ADMIN', 'INVENTORY_MANAGER'), createSupplier);
router.put('/:id', protect, rbac('ADMIN', 'INVENTORY_MANAGER'), updateSupplier);
router.delete('/:id', protect, rbac('ADMIN'), deleteSupplier);

module.exports = router;
