import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, RefreshCw, ShoppingCart, Truck, BarChart3, Settings } from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Stock Adjustments', path: '/stock-adjustments', icon: RefreshCw },
    { name: 'Sales Orders', path: '/orders', icon: ShoppingCart },
    { name: 'Suppliers', path: '/suppliers', icon: Truck },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Settings & DLQ', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0c101a]/90 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
          Management Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer System Status Banner */}
      <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs">
        <div className="flex items-center justify-between text-indigo-300 font-semibold mb-1">
          <span>Azure EDA Ready</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Decoupled API Gateway acknowledging orders via HTTP 202.
        </p>
      </div>
    </aside>
  );
}
