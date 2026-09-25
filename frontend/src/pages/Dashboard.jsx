import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Package, DollarSign, AlertTriangle, XCircle, Search, Plus, Trash2, Tag, Layers, RefreshCw } from 'lucide-react';
import AddProductModal from '../components/AddProductModal';
import StockAdjustmentModal from '../components/StockAdjustmentModal';

export default function Dashboard() {
  const products = useStore((state) => state.products);
  const inventorySummary = useStore((state) => state.inventorySummary);
  const fetchProducts = useStore((state) => state.fetchProducts);
  const fetchInventory = useStore((state) => state.fetchInventory);
  const deleteProduct = useStore((state) => state.deleteProduct);
  const user = useStore((state) => state.user);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts(selectedCategory, searchQuery);
    fetchInventory();
  }, [selectedCategory, searchQuery]);

  const categories = ['All', 'Electronics', 'Furniture', 'Accessories', 'Supplies'];

  const getStatusBadge = (product) => {
    if (product.stockQuantity === 0) {
      return <span className="badge badge-danger"><XCircle className="w-3 h-3" /> Out of Stock</span>;
    }
    if (product.stockQuantity <= product.reorderThreshold) {
      return <span className="badge badge-warning"><AlertTriangle className="w-3 h-3" /> Low Stock</span>;
    }
    return <span className="badge badge-success">In Stock</span>;
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Inventory Operational Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time stock valuation, SKU tracking & event-driven catalog control
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsAdjustModalOpen(true)} className="btn-secondary">
            <RefreshCw className="w-4 h-4" /> Quick Stock Adjust
          </button>
          {(user?.role === 'ADMIN' || user?.role === 'INVENTORY_MANAGER') && (
            <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Add New Item SKU
            </button>
          )}
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Total SKUs */}
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition duration-300">
            <Package className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Total Product SKUs</span>
          <div className="text-3xl font-extrabold text-white mt-2">{inventorySummary.totalItems || products.length}</div>
          <span className="text-xs text-indigo-400 font-mono mt-1 block">Active Catalog Items</span>
        </div>

        {/* Stat 2: Stock Valuation */}
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition duration-300">
            <DollarSign className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Total Stock Valuation</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            ${(inventorySummary.totalValuation || 0).toLocaleString()}
          </div>
          <span className="text-xs text-emerald-300/80 font-mono mt-1 block">Inventory Asset Value</span>
        </div>

        {/* Stat 3: Low Stock Count */}
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition duration-300">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Low Stock Alerts</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">{inventorySummary.lowStockCount || 0}</div>
          <span className="text-xs text-amber-300/80 font-mono mt-1 block">Below Reorder Threshold</span>
        </div>

        {/* Stat 4: Out of Stock */}
        <div className="glass-panel p-5 relative overflow-hidden group">
          <div className="absolute right-3 top-3 p-3 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition duration-300">
            <XCircle className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Out of Stock</span>
          <div className="text-3xl font-extrabold text-rose-400 mt-2">{inventorySummary.outOfStockCount || 0}</div>
          <span className="text-xs text-rose-300/80 font-mono mt-1 block">Urgent Replenishment Req</span>
        </div>
      </div>

      {/* Control Bar: Search & Category Filter Pills */}
      <div className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-gray-400 mr-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Categories:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SKU Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search SKU code or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 py-2 text-xs"
          />
        </div>
      </div>

      {/* SKU Product Items Grid / Table */}
      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-400" /> Catalog Inventory Master
          </h3>
          <span className="text-xs text-gray-400 font-mono">Showing {products.length} Items</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU Code</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Selling Price</th>
                <th>Physical Stock</th>
                <th>Location Tag</th>
                <th>Status</th>
                {user?.role === 'ADMIN' && <th className="text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-gray-500">
                    No products matching search query or category filter.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id}>
                    <td className="font-mono font-semibold text-indigo-300">{p.sku}</td>
                    <td>
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.description}</div>
                    </td>
                    <td>
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                        {p.category}
                      </span>
                    </td>
                    <td className="font-semibold text-emerald-400">${p.sellingPrice}</td>
                    <td>
                      <span className="font-bold text-white">{p.stockQuantity}</span>{' '}
                      <span className="text-xs text-gray-500">(Min: {p.reorderThreshold})</span>
                    </td>
                    <td className="text-xs text-gray-400 font-mono">{p.locationTag}</td>
                    <td>{getStatusBadge(p)}</td>
                    {user?.role === 'ADMIN' && (
                      <td className="text-right">
                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddProductModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <StockAdjustmentModal isOpen={isAdjustModalOpen} onClose={() => setIsAdjustModalOpen(false)} />
    </div>
  );
}
