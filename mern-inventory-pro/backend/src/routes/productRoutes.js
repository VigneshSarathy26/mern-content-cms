const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);
router.post('/', protect, rbac('ADMIN', 'INVENTORY_MANAGER'), createProduct);
router.put('/:id', protect, rbac('ADMIN', 'INVENTORY_MANAGER'), updateProduct);
router.delete('/:id', protect, rbac('ADMIN'), deleteProduct);

module.exports = router;
