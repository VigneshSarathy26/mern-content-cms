import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, ShoppingCart, Zap } from 'lucide-react';

export default function CreateOrderModal({ isOpen, onClose }) {
  const products = useStore((state) => state.products);
  const createOrder = useStore((state) => state.createOrder);

  const [customerName, setCustomerName] = useState('Acme Enterprise Corp');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const product = products.find((p) => p._id === selectedProductId) || products[0];

    if (!product) return;

    const payload = {
      customerName,
      items: [
        {
          productId: product._id,
          sku: product.sku,
          name: product.name,
          quantity: Number(quantity),
          unitPrice: product.sellingPrice,
        },
      ],
      idempotencyKey: `idemp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };

    const success = await createOrder(payload);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-6 relative border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create Sales Order</h2>
            <p className="text-xs text-indigo-300 font-mono flex items-center gap-1 mt-0.5">
              <Zap className="w-3 h-3 text-amber-400" /> Triggers HTTP 202 Accepted Event Loop
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Customer / Client Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Select Catalog Product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">-- Choose Item from Inventory --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  [{p.sku}] {p.name} - Stock: {p.stockQuantity} (${p.sellingPrice})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Order Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/50 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
            Order payload packet will be pushed to event broker immediately. API Gateway responds in under 15ms.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Zap className="w-4 h-4 text-amber-300" /> Create Sales Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
