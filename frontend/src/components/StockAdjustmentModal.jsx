import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, RefreshCw } from 'lucide-react';

export default function StockAdjustmentModal({ isOpen, onClose }) {
  const products = useStore((state) => state.products);
  const adjustStock = useStore((state) => state.adjustStock);

  const [productId, setProductId] = useState('');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(10);
  const [type, setType] = useState('ADJUSTMENT');
  const [reason, setReason] = useState('Warehouse Cycle Audit Adjustment');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) return;

    const success = await adjustStock({
      productId,
      adjustmentQuantity: Number(adjustmentQuantity),
      type,
      reason,
    });

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
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Stock Adjustment Tool</h2>
            <p className="text-xs text-gray-400">Manual inventory level correction & movement log</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Target Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="input-field"
              required
            >
              <option value="">-- Select SKU Product --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  [{p.sku}] {p.name} (Current Stock: {p.stockQuantity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Adjustment Qty (+ / -)</label>
              <input
                type="number"
                required
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
                <option value="REPLENISHMENT">Replenishment (+)</option>
                <option value="ADJUSTMENT">Adjustment (+/-)</option>
                <option value="DEDUCTION">Damage Deduction (-)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Reason / Audit Notes</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <RefreshCw className="w-4 h-4" /> Apply Stock Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
