import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Package, Plus, Trash2, Search } from 'lucide-react';
import AddProductModal from '../components/AddProductModal';

export default function Products() {
  const products = useStore((state) => state.products);
  const fetchProducts = useStore((state) => state.fetchProducts);
  const deleteProduct = useStore((state) => state.deleteProduct);
  const user = useStore((state) => state.user);

  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    fetchProducts('All', search);
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Master Product Catalog</h1>
          <p className="text-sm text-gray-400 mt-1">Manage SKUs, cost prices, margins, and stock parameters</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'INVENTORY_MANAGER') && (
          <button onClick={() => setIsAddOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Catalog Product
          </button>
        )}
      </div>

      <div className="glass-panel p-4 flex items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search catalog by SKU or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 text-xs"
          />
        </div>
        <span className="text-xs text-gray-400 font-mono">Total SKUs: {products.length}</span>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Margin</th>
                <th>Stock Level</th>
                <th>Reorder Point</th>
                <th>Warehouse Aisle</th>
                {user?.role === 'ADMIN' && <th className="text-right">Action</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const margin = p.sellingPrice > 0 ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(0) : 0;
                return (
                  <tr key={p._id}>
                    <td className="font-mono font-semibold text-indigo-300">{p.sku}</td>
                    <td className="font-medium text-white">{p.name}</td>
                    <td>{p.category}</td>
                    <td className="text-gray-400">${p.costPrice}</td>
                    <td className="text-emerald-400 font-semibold">${p.sellingPrice}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs">
                        +{margin}%
                      </span>
                    </td>
                    <td className="font-bold text-white">{p.stockQuantity}</td>
                    <td className="text-amber-400 font-mono">{p.reorderThreshold} units</td>
                    <td className="text-xs text-gray-400">{p.locationTag}</td>
                    {user?.role === 'ADMIN' && (
                      <td className="text-right">
                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddProductModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}
