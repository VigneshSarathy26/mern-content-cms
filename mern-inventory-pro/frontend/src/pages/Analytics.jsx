import React from 'react';
import { useStore } from '../store/useStore';
import { BarChart3, PieChart, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function Analytics() {
  const products = useStore((state) => state.products);
  const inventorySummary = useStore((state) => state.inventorySummary);

  const categoryBreakdown = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Inventory Analytics & Stock Metrics</h1>
        <p className="text-sm text-gray-400 mt-1">
          Catalog distribution, stock valuation breakdown, and reorder velocity analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category Breakdown Card */}
        <div className="glass-panel p-6 border border-white/10">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-400" /> Category Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryBreakdown).map(([cat, count]) => {
              const pct = products.length > 0 ? ((count / products.length) * 100).toFixed(0) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-300">{cat}</span>
                    <span className="text-indigo-400">{count} SKUs ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Valuation Card */}
        <div className="glass-panel p-6 border border-white/10">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" /> Valuation Overview
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20">
              <span className="text-xs text-gray-400 block">Total Asset Valuation</span>
              <span className="text-2xl font-extrabold text-emerald-400">
                ${(inventorySummary.totalValuation || 0).toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
              <span className="text-xs text-gray-400 block">Active Catalog SKUs</span>
              <span className="text-2xl font-extrabold text-indigo-400">{products.length} Items</span>
            </div>
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className="glass-panel p-6 border border-white/10">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Low Stock Watchlist
          </h3>
          <div className="space-y-2">
            {products
              .filter((p) => p.stockQuantity <= p.reorderThreshold)
              .map((p) => (
                <div key={p._id} className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs">
                  <div>
                    <span className="font-bold text-white block">{p.name}</span>
                    <span className="text-[11px] text-gray-400 font-mono">SKU: {p.sku}</span>
                  </div>
                  <span className="font-bold text-amber-400">{p.stockQuantity} Left</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
