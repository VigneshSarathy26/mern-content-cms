import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, RefreshCw, ShoppingCart, Truck, BarChart3, Settings, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
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
    <>
      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:static top-16 left-0 z-40 h-[calc(100vh-4rem)]
          bg-[#0c101a]/95 backdrop-blur-xl border-r border-white/10
          flex flex-col justify-between p-3.5
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        `}
      >
        {/* Top Header/Close for Mobile */}
        <div className="flex items-center justify-between lg:hidden pb-2 mb-2 border-b border-white/10">
          <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Menu</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg bg-white/5 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="space-y-1.5 overflow-y-auto overflow-x-hidden pt-1">
          {!isCollapsed && (
            <div className="hidden lg:block px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Management Modules
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isCollapsed ? 'justify-center has-tooltip' : ''
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110`} />
                
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}

                {/* Tooltip on Collapsed Desktop View */}
                {isCollapsed && (
                  <div className="tooltip-popup hidden lg:block">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Footer Banner & Desktop Quick Toggle */}
        <div className="mt-auto space-y-2 pt-3 border-t border-white/10">
          {/* Azure Status Box */}
          <div className={`rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs transition-all ${isCollapsed ? 'p-2 text-center' : 'p-3'}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} text-indigo-300 font-semibold mb-1`}>
              {!isCollapsed && <span>Azure EDA Ready</span>}
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" title="System Connected"></span>
            </div>
            {!isCollapsed && (
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Decoupled API Gateway acknowledging orders via HTTP 202.
              </p>
            )}
          </div>

          {/* Desktop Collapse Toggle Footer button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition text-xs font-medium gap-2 border border-white/5"
            title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-indigo-400" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

