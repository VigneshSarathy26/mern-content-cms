import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Toast from './Toast';
import { useStore } from '../store/useStore';

export default function Layout() {
  const fetchOrders = useStore((state) => state.fetchOrders);
  const fetchInventory = useStore((state) => state.fetchInventory);
  const fetchHealth = useStore((state) => state.fetchHealth);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const toggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  // Background Polling Loop for Eventual Consistency Real-Time UI Updates
  useEffect(() => {
    fetchHealth();
    fetchInventory();
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
      fetchInventory();
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      <Navbar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        onToggleMobile={toggleMobile}
      />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Mobile Backdrop Overlay */}
        {isMobileOpen && (
          <div
            onClick={closeMobile}
            className="fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          />
        )}

        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          isMobileOpen={isMobileOpen}
          onCloseMobile={closeMobile}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full transition-all duration-300">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}

