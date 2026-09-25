const Product = require('../models/Product');
const logger = require('../config/logger');

// @desc    Get all products catalog with filter, search & pagination
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    let products = [];
    if (Product && Product.find) {
      products = await Product.find(query).populate('supplierId').sort({ createdAt: -1 });
    }

    return res.json(products);
  } catch (error) {
    logger.error(`Get Products Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch products catalog' });
  }
};

// @desc    Get single product details
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplierId');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch product details' });
  }
};

// @desc    Create new product
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { sku, name, description, category, costPrice, sellingPrice, stockQuantity, reorderThreshold, locationTag, supplierId } = req.body;

    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return res.status(400).json({ message: `Product SKU '${sku}' already exists in catalog` });
    }

    const product = await Product.create({
      sku: sku.toUpperCase(),
      name,
      description,
      category: category || 'General',
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      stockQuantity: Number(stockQuantity) || 0,
      reorderThreshold: Number(reorderThreshold) || 10,
      locationTag: locationTag || 'Aisle 1 - Shelf A',
      supplierId: supplierId || null,
    });

    logger.info(`[PRODUCT CREATED] Created new SKU ${product.sku} (${product.name})`);
    return res.status(201).json(product);
  } catch (error) {
    logger.error(`Create Product Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to create product' });
  }
};

// @desc    Update product catalog details
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    Object.assign(product, req.body);
    await product.save();

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update product' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    logger.info(`[PRODUCT DELETED] Deleted product ID ${req.params.id}`);
    return res.json({ message: 'Product removed from catalog successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete product' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
