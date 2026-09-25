import { create } from 'zustand';
import { fetchWithAuth } from '../utils/api';

export const useStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  
  products: [],
  inventorySummary: { totalItems: 0, totalValuation: 0, lowStockCount: 0, outOfStockCount: 0 },
  inventoryLogs: [],
  orders: [],
  suppliers: [],
  dlqEvents: [],
  systemHealth: null,
  
  loading: false,
  toast: null,

  showToast: (message, type = 'info') => {
    set({ toast: { message, type, id: Date.now() } });
    setTimeout(() => {
      if (get().toast?.type === type) set({ toast: null });
    }, 4000);
  },

  // --- Auth Actions ---
  login: async (email, password) => {
    set({ loading: true });
    try {
      const data = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      set({ user: data, token: data.token, loading: false });
      get().showToast(`Welcome back, ${data.name}!`, 'success');
      return true;
    } catch (err) {
      set({ loading: false });
      get().showToast(err.message, 'error');
      return false;
    }
  },

  msalLogin: async (idToken) => {
    set({ loading: true });
    try {
      const data = await fetchWithAuth('/auth/msal', {
        method: 'POST',
        body: JSON.stringify({ idToken: idToken || 'mock_msal_entra_id_token' }),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));

      set({ user: data, token: data.token, loading: false });
      get().showToast('Signed in with Microsoft Entra ID', 'success');
      return true;
    } catch (err) {
      set({ loading: false });
      get().showToast(err.message, 'error');
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  // --- Products Catalog ---
  fetchProducts: async (category = 'All', search = '') => {
    try {
      let query = `/products?category=${category}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      const data = await fetchWithAuth(query);
      set({ products: data });
    } catch (err) {
      // Fallback
    }
  },

  addProduct: async (productData) => {
    try {
      const newProd = await fetchWithAuth('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });
      get().showToast(`Product ${newProd.sku} created successfully`, 'success');
      await get().fetchProducts();
      await get().fetchInventory();
      return true;
    } catch (err) {
      get().showToast(err.message, 'error');
      return false;
    }
  },

  deleteProduct: async (id) => {
    try {
      await fetchWithAuth(`/products/${id}`, { method: 'DELETE' });
      get().showToast('Product removed from catalog', 'info');
      await get().fetchProducts();
      await get().fetchInventory();
    } catch (err) {
      get().showToast(err.message, 'error');
    }
  },

  // --- Inventory & Stock Movement ---
  fetchInventory: async () => {
    try {
      const data = await fetchWithAuth('/inventory');
      set({
        inventorySummary: data.summary || get().inventorySummary,
        products: data.items || get().products,
      });
    } catch (err) {}
  },

  adjustStock: async (adjustmentData) => {
    try {
      const res = await fetchWithAuth('/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify(adjustmentData),
      });
      get().showToast(`Stock updated for SKU ${res.product.sku}: new balance ${res.product.stockQuantity}`, 'success');
      await get().fetchInventory();
      await get().fetchInventoryLogs();
      return true;
    } catch (err) {
      get().showToast(err.message, 'error');
      return false;
    }
  },

  fetchInventoryLogs: async () => {
    try {
      const logs = await fetchWithAuth('/inventory/logs');
      set({ inventoryLogs: logs });
    } catch (err) {}
  },

  // --- Orders & Async 202 Event Loops ---
  fetchOrders: async () => {
    try {
      const data = await fetchWithAuth('/orders');
      set({ orders: data });
    } catch (err) {}
  },

  createOrder: async (orderPayload) => {
    try {
      const res = await fetchWithAuth('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
      });

      // Optimistic UI state addition with PENDING_FULFILLMENT badge
      get().showToast(`⚡ 202 Accepted: Order ${res.orderNumber} queued in Event Stream!`, 'info');
      await get().fetchOrders();
      await get().fetchInventory();
      return true;
    } catch (err) {
      get().showToast(err.message, 'error');
      return false;
    }
  },

  // --- Suppliers ---
  fetchSuppliers: async () => {
    try {
      const data = await fetchWithAuth('/suppliers');
      set({ suppliers: data });
    } catch (err) {}
  },

  addSupplier: async (supplierData) => {
    try {
      await fetchWithAuth('/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplierData),
      });
      get().showToast('Supplier vendor registered', 'success');
      await get().fetchSuppliers();
      return true;
    } catch (err) {
      get().showToast(err.message, 'error');
      return false;
    }
  },

  // --- DLQ & Infrastructure ---
  fetchDLQ: async () => {
    try {
      const dlq = await fetchWithAuth('/events/dlq');
      set({ dlqEvents: dlq });
    } catch (err) {}
  },

  retryDLQEvent: async (eventId) => {
    try {
      const res = await fetchWithAuth(`/events/retry/${eventId}`, { method: 'POST' });
      get().showToast(res.message, 'success');
      await get().fetchDLQ();
    } catch (err) {
      get().showToast(err.message, 'error');
    }
  },

  fetchHealth: async () => {
    try {
      const health = await fetchWithAuth('/health');
      set({ systemHealth: health });
    } catch (err) {
      set({ systemHealth: { status: 'DEGRADED', database: 'OFFLINE', eventBroker: 'OFFLINE' } });
    }
  },
}));
