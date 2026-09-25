const User = require('../models/User');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const InventoryLog = require('../models/InventoryLog');
const Order = require('../models/Order');
const logger = require('../config/logger');

const seedInitialData = async () => {
  try {
    // 1. Seed Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('[SEED] Database empty. Seeding default accounts (Admin, Inventory Manager, Warehouse Staff)...');
      
      const admin = new User({
        name: 'System Admin',
        email: 'admin@inventorypro.com',
        password: 'password123',
        role: 'ADMIN',
      });
      await admin.save();

      const manager = new User({
        name: 'Purchasing Manager',
        email: 'manager@inventorypro.com',
        password: 'password123',
        role: 'INVENTORY_MANAGER',
      });
      await manager.save();

      const staff = new User({
        name: 'Warehouse Operator',
        email: 'staff@inventorypro.com',
        password: 'password123',
        role: 'WAREHOUSE_STAFF',
      });
      await staff.save();

      logger.info('[SEED] Default accounts created successfully!');
    }

    // 2. Seed Suppliers
    const supplierCount = await Supplier.countDocuments();
    let defaultSupplierId = null;
    if (supplierCount === 0) {
      const supplier1 = await Supplier.create({
        name: 'Logitech Global Distribution',
        code: 'SUP-LOGI-001',
        contactEmail: 'orders@logitech-dist.com',
        phone: '+1-800-555-0199',
        leadTimeDays: 4,
        address: '7700 Gateway Blvd, Newark, CA',
      });
      const supplier2 = await Supplier.create({
        name: 'Dell Technologies Logistics',
        code: 'SUP-DELL-002',
        contactEmail: 'b2b@dell.com',
        phone: '+1-800-555-0244',
        leadTimeDays: 7,
        address: 'One Dell Way, Round Rock, TX',
      });
      defaultSupplierId = supplier1._id;
    } else {
      const firstSup = await Supplier.findOne();
      if (firstSup) defaultSupplierId = firstSup._id;
    }

    // 3. Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      logger.info('[SEED] Seeding initial product catalog & inventory SKU data...');
      
      const p1 = await Product.create({
        sku: 'ELEC-001',
        name: 'Wireless Ergonomic Mouse MX Master 3S',
        description: 'Quiet clicks 8K DPI any-surface tracking mouse',
        category: 'Electronics',
        costPrice: 65,
        sellingPrice: 99,
        stockQuantity: 45,
        reorderThreshold: 10,
        locationTag: 'Aisle 2 - Shelf B',
        supplierId: defaultSupplierId,
      });

      const p2 = await Product.create({
        sku: 'ELEC-002',
        name: 'Mechanical Gaming Keyboard RGB',
        description: 'Hot-swappable tactile switch mechanical keyboard',
        category: 'Electronics',
        costPrice: 80,
        sellingPrice: 149,
        stockQuantity: 8, // Low stock trigger test!
        reorderThreshold: 15,
        locationTag: 'Aisle 2 - Shelf C',
        supplierId: defaultSupplierId,
        isLowStockAlerted: true,
      });

      const p3 = await Product.create({
        sku: 'FURN-001',
        name: 'Ergonomic Mesh Office Desk Chair',
        description: 'High-back lumbal support breathable mesh chair',
        category: 'Furniture',
        costPrice: 180,
        sellingPrice: 349,
        stockQuantity: 22,
        reorderThreshold: 5,
        locationTag: 'Aisle 5 - Section A',
      });

      const p4 = await Product.create({
        sku: 'ACC-001',
        name: 'Thunderbolt 4 Quad-Display Docking Station',
        description: '100W Power Delivery 4K 120Hz Multi-Monitor Dock',
        category: 'Accessories',
        costPrice: 120,
        sellingPrice: 229,
        stockQuantity: 18,
        reorderThreshold: 8,
        locationTag: 'Aisle 1 - Shelf A',
      });

      const p5 = await Product.create({
        sku: 'ACC-002',
        name: 'UltraWide 34" Curved IPS Monitor',
        description: '144Hz WQHD HDR400 Ergonomic Stand Monitor',
        category: 'Electronics',
        costPrice: 380,
        sellingPrice: 599,
        stockQuantity: 12,
        reorderThreshold: 5,
        locationTag: 'Aisle 3 - Shelf D',
      });

      // Seed Initial Stock Logs
      await InventoryLog.create({
        productId: p1._id,
        sku: p1.sku,
        type: 'INITIAL',
        quantity: 45,
        previousQuantity: 0,
        newQuantity: 45,
        reason: 'Initial Warehouse Receiving Intake',
        performedBy: 'System Seed Service',
      });
    }

    // 4. Seed Sample Orders
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      const sampleProd = await Product.findOne({ sku: 'ELEC-001' });
      if (sampleProd) {
        await Order.create({
          orderNumber: 'ORD-2026-9001',
          customerName: 'Acme Enterprise Corp',
          idempotencyKey: 'idemp_sample_order_9001',
          status: 'FULFILLED',
          items: [
            {
              productId: sampleProd._id,
              sku: sampleProd.sku,
              name: sampleProd.name,
              quantity: 2,
              unitPrice: sampleProd.sellingPrice,
            },
          ],
          totalAmount: sampleProd.sellingPrice * 2,
          fulfilledAt: new Date(),
        });
      }
    }
  } catch (err) {
    logger.warn(`[SEED WARNING] ${err.message}`);
  }
};

module.exports = seedInitialData;
