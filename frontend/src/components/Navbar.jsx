import React from 'react';
import { useStore } from '../store/useStore';
import { ShieldCheck, UserCheck, LogOut, Activity, Cpu, Menu, PanelLeftClose, PanelLeft, Search } from 'lucide-react';

export default function Navbar({ isCollapsed, onToggleCollapse, onToggleMobile }) {
  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const systemHealth = useStore((state) => state.systemHealth);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return <span className="badge badge-purple"><ShieldCheck className="w-3 h-3" /> Admin</span>;
      case 'INVENTORY_MANAGER':
        return <span className="badge badge-info"><UserCheck className="w-3 h-3" /> Manager</span>;
      default:
        return <span className="badge badge-success">Staff</span>;
    }
  };

  return (
    <header className="h-16 border-b border-white/10 bg-[#0f1523]/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Left: Toggles & Brand */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeft className="w-5 h-5 text-indigo-400" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-400 leading-none">
              Inventory <span className="text-indigo-400 font-extrabold">Pro</span>
            </h1>
            <span className="text-[10px] text-gray-400 font-mono tracking-wider block mt-0.5">EVENT-DRIVEN ARCHITECTURE</span>
          </div>
        </div>
      </div>

      {/* Center: Search & Command Palette Mock Input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, orders, suppliers..."
            className="w-full bg-[#161d2d]/80 border border-white/10 rounded-xl pl-10 pr-12 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Health Badge & User Profile */}
      <div className="flex items-center gap-3">
        {/* System Health Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span className="hidden xl:inline">Broker:</span>
          <span>{systemHealth?.eventBroker || 'Dual-Mode Active'}</span>
        </div>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-200 leading-tight">{user.name}</span>
              <span className="text-[11px] text-gray-400">{user.email}</span>
            </div>
            <div className="hidden sm:block">
              {getRoleBadge(user.role)}
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition border border-white/5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

