import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { RefreshCw, History, ArrowUpRight, ArrowDownRight, CheckCircle } from 'lucide-react';
import StockAdjustmentModal from '../components/StockAdjustmentModal';

export default function Inventory() {
  const inventoryLogs = useStore((state) => state.inventoryLogs);
  const fetchInventoryLogs = useStore((state) => state.fetchInventoryLogs);
  const fetchInventory = useStore((state) => state.fetchInventory);

  const [isAdjustOpen, setIsAdjustOpen] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchInventoryLogs();
  }, []);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'SALE':
      case 'DEDUCTION':
        return (
          <span className="badge badge-danger">
            <ArrowDownRight className="w-3 h-3" /> {type}
          </span>
        );
      case 'REPLENISHMENT':
      case 'INITIAL':
        return (
          <span className="badge badge-success">
            <ArrowUpRight className="w-3 h-3" /> {type}
          </span>
        );
      default:
        return <span className="badge badge-warning">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Stock Movements & Audit Ledger</h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time transaction log of inventory adjustments, sales deductions, and intake
          </p>
        </div>
        <button onClick={() => setIsAdjustOpen(true)} className="btn-primary">
          <RefreshCw className="w-4 h-4" /> Open Stock Adjustment Tool
        </button>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" /> Stock Movement Audit Ledger
          </h3>
          <span className="text-xs text-gray-400 font-mono">Last 100 Transactions</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>SKU</th>
                <th>Movement Type</th>
                <th>Qty Delta</th>
                <th>Balance Shift</th>
                <th>Reason / Trigger</th>
                <th>Performed By</th>
              </tr>
            </thead>
            <tbody>
              {inventoryLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    No stock movements logged yet. Create orders or trigger stock adjustments.
                  </td>
                </tr>
              ) : (
                inventoryLogs.map((log) => (
                  <tr key={log._id}>
                    <td className="text-xs text-gray-400 font-mono">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="font-mono font-semibold text-indigo-300">{log.sku}</td>
                    <td>{getTypeBadge(log.type)}</td>
                    <td className={`font-bold font-mono ${log.quantity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {log.quantity >= 0 ? `+${log.quantity}` : log.quantity}
                    </td>
                    <td className="text-xs text-gray-300 font-mono">
                      {log.previousQuantity} → <span className="text-white font-bold">{log.newQuantity}</span>
                    </td>
                    <td className="text-gray-300 text-xs">{log.reason}</td>
                    <td className="text-xs text-indigo-300 font-mono">{log.performedBy}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StockAdjustmentModal isOpen={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} />
    </div>
  );
}
