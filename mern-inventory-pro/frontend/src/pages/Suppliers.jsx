import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Truck, Plus, Mail, Phone, Clock, MapPin } from 'lucide-react';
import AddSupplierModal from '../components/AddSupplierModal';

export default function Suppliers() {
  const suppliers = useStore((state) => state.suppliers);
  const fetchSuppliers = useStore((state) => state.fetchSuppliers);
  const user = useStore((state) => state.user);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Supplier Vendors & Lead Times</h1>
          <p className="text-sm text-gray-400 mt-1">Manage vendor contact info, procurement channels, and delivery lead times</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'INVENTORY_MANAGER') && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Vendor Supplier
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {suppliers.map((sup) => (
          <div key={sup._id} className="glass-panel p-6 border border-white/10 relative group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{sup.name}</h3>
                  <span className="text-xs text-indigo-400 font-mono">{sup.code}</span>
                </div>
              </div>
              <span className="badge badge-info flex items-center gap-1">
                <Clock className="w-3 h-3" /> Lead Time: {sup.leadTimeDays} Days
              </span>
            </div>

            <div className="mt-6 space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span>{sup.contactEmail}</span>
              </div>
              {sup.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{sup.phone}</span>
                </div>
              )}
              {sup.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{sup.address}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AddSupplierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
