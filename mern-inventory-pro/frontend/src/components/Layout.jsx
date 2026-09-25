import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Toast from './Toast';
import { useStore } from '../store/useStore';

export default function Layout() {
  const fetchOrders = useStore((state) => state.fetchOrders);
  const fetchInventory = useStore((state) => state.fetchInventory);
  const fetchHealth = useStore((state) => state.fetchHealth);

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
    <div className="min-h-screen bg-[#0a0d14] text-gray-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}
