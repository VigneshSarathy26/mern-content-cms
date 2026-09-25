import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { ShoppingCart, Plus, Zap, CheckCircle2, Clock, XCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import CreateOrderModal from '../components/CreateOrderModal';

export default function Orders() {
  const orders = useStore((state) => state.orders);
  const fetchOrders = useStore((state) => state.fetchOrders);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'FULFILLED':
        return (
          <span className="badge badge-success">
            <CheckCircle2 className="w-3 h-3" /> FULFILLED
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="badge badge-info">
            <RefreshCw className="w-3 h-3 animate-spin text-indigo-400" /> PROCESSING
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="badge badge-danger">
            <XCircle className="w-3 h-3" /> CANCELLED
          </span>
        );
      default:
        return (
          <span className="badge badge-warning pulse">
            <Clock className="w-3 h-3" /> PENDING (202 QUEUED)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sales Orders & Event Broker Pipeline</h1>
          <p className="text-sm text-gray-400 mt-1">
            Eventual consistency stream: 202 Accepted handshakes transition live via Redis background workers
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Zap className="w-4 h-4 text-amber-300" /> New Sales Order
        </button>
      </div>

      {/* Pipeline Explanation Banner */}
      <div className="p-4 rounded-xl glass-panel border border-indigo-500/30 flex items-center gap-4 bg-gradient-to-r from-indigo-950/40 to-purple-950/40">
        <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300">
          <Zap className="w-6 h-6" />
        </div>
        <div className="text-xs text-gray-300 leading-relaxed">
          <span className="font-bold text-white block mb-0.5">Asynchronous Event Loop Lifecycle:</span>
          1. Gateway returns <span className="text-amber-400 font-mono">202 Accepted</span> in &lt;15ms → 2. Stock Worker checks SKU &amp; deducts inventory → 3. Order Worker transitions order status to <span className="text-emerald-400 font-mono">FULFILLED</span>.
        </div>
      </div>

      {/* Orders List Table */}
      <div className="glass-panel overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Client / Customer</th>
                <th>Order Items</th>
                <th>Total Value</th>
                <th>Idempotency Key</th>
                <th>Event Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    No orders created yet. Click "New Sales Order" to test the 202 Event Loop!
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id}>
                    <td className="font-mono font-bold text-white">{ord.orderNumber}</td>
                    <td className="text-gray-300 font-medium">{ord.customerName}</td>
                    <td>
                      <div className="space-y-1">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="text-xs text-indigo-200">
                            <span className="font-semibold text-white">{item.quantity}x</span> {item.name} [{item.sku}]
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="font-bold text-emerald-400">${ord.totalAmount}</td>
                    <td>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{ord.idempotencyKey?.substring(0, 18)}...</span>
                      </div>
                    </td>
                    <td>{getOrderStatusBadge(ord.status)}</td>
                    <td className="text-xs text-gray-400 font-mono">
                      {new Date(ord.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateOrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
