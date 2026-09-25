const request = require('supertest');
const app = require('../src/server');

// Jest Mocking for Mongoose Models & Event Broker
jest.mock('../src/models/Product');
jest.mock('../src/models/Order');
jest.mock('../src/models/InventoryLog');
jest.mock('../src/middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = {
      _id: 'usr_mock_test_admin',
      name: 'Integration Test Admin',
      email: 'admin@inventorypro.com',
      role: 'ADMIN',
    };
    next();
  },
}));

const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

describe('Inventory & Order REST API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/inventory', () => {
    it('should return 200 OK with inventory items and populate chain', async () => {
      const mockProducts = [
        {
          _id: '60f7b0000000000000000001',
          sku: 'ELEC-001',
          name: 'Wireless Mouse',
          sellingPrice: 99,
          stockQuantity: 50,
          reorderThreshold: 10,
          supplierId: { name: 'Logitech' },
        },
      ];

      // Chain Mongoose mock setup: find().populate().sort()
      const sortMock = jest.fn().mockResolvedValue(mockProducts);
      const populateMock = jest.fn().mockReturnValue({ sort: sortMock });
      Product.find = jest.fn().mockReturnValue({ populate: populateMock });

      const response = await request(app).get('/api/inventory');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary.totalItems).toBe(1);
      expect(response.body.items).toHaveLength(1);
      expect(Product.find).toHaveBeenCalled();
    });
  });

  describe('POST /api/orders', () => {
    it('should create order and return HTTP 202 Accepted for valid order payload', async () => {
      const validPayload = {
        items: [
          {
            productId: '60f7b0000000000000000001',
            quantity: 2,
            unitPrice: 99,
          },
        ],
        customerName: 'Test Integration Client',
        idempotencyKey: 'idemp_jest_test_key_101',
      };

      Order.findOne = jest.fn().mockResolvedValue(null);
      Product.findById = jest.fn().mockResolvedValue({
        _id: '60f7b0000000000000000001',
        sku: 'ELEC-001',
        name: 'Wireless Mouse',
        sellingPrice: 99,
      });

      Order.create = jest.fn().mockResolvedValue({
        _id: 'ord_jest_101',
        orderNumber: 'ORD-2026-TEST',
        customerName: 'Test Integration Client',
        idempotencyKey: 'idemp_jest_test_key_101',
        status: 'PENDING_FULFILLMENT',
      });

      const response = await request(app)
        .post('/api/orders')
        .send(validPayload);

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('message');
      expect(response.body.status).toBe('PENDING_FULFILLMENT');
      expect(response.body).toHaveProperty('idempotencyKey');
    });

    it('should reject invalid schemas input payload with HTTP 400 Bad Request', async () => {
      const invalidPayload = {
        items: [], // Empty array violates contract
      };

      const response = await request(app)
        .post('/api/orders')
        .send(invalidPayload);

      expect(response.status).toBe(400);
    });
  });
});
