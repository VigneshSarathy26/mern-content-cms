import React from 'react';
import { useStore } from '../store/useStore';
import { ShieldCheck, UserCheck, LogOut, Activity, Cpu } from 'lucide-react';

export default function Navbar() {
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
    <header className="h-16 border-b border-white/10 bg-[#0f1523]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Inventory <span className="text-indigo-400">Pro</span>
          </h1>
          <span className="text-[10px] text-gray-400 font-mono tracking-wider">EVENT-DRIVEN ARCHITECTURE</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Event Loop Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Activity className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
          <span>Broker: {systemHealth?.eventBroker || 'Dual-Mode Active'}</span>
        </div>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-200">{user.name}</span>
              <span className="text-xs text-gray-400">{user.email}</span>
            </div>
            {getRoleBadge(user.role)}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
