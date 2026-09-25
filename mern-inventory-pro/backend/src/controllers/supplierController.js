const Supplier = require('../models/Supplier');
const logger = require('../config/logger');

// @desc    Get all suppliers
// @route   GET /api/suppliers
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    return res.json(suppliers);
  } catch (error) {
    logger.error(`Get Suppliers Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to fetch suppliers list' });
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
const createSupplier = async (req, res) => {
  try {
    const { name, code, contactEmail, phone, leadTimeDays, address } = req.body;

    const existing = await Supplier.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: `Supplier code '${code}' already registered` });
    }

    const supplier = await Supplier.create({
      name,
      code: code.toUpperCase(),
      contactEmail,
      phone: phone || '',
      leadTimeDays: Number(leadTimeDays) || 5,
      address: address || '',
    });

    return res.status(201).json(supplier);
  } catch (error) {
    logger.error(`Create Supplier Error: ${error.message}`);
    return res.status(500).json({ message: 'Failed to create supplier record' });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    Object.assign(supplier, req.body);
    await supplier.save();
    return res.json(supplier);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update supplier' });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
const deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete supplier' });
  }
};

module.exports = { getSuppliers, createSupplier, updateSupplier, deleteSupplier };
