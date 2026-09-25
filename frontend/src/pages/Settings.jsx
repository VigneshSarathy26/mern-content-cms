import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Settings as SettingsIcon, Server, Database, Activity, RefreshCw, AlertTriangle, Key, Cpu } from 'lucide-react';

export default function Settings() {
  const systemHealth = useStore((state) => state.systemHealth);
  const fetchHealth = useStore((state) => state.fetchHealth);
  const dlqEvents = useStore((state) => state.dlqEvents);
  const fetchDLQ = useStore((state) => state.fetchDLQ);
  const retryDLQEvent = useStore((state) => state.retryDLQEvent);
  const user = useStore((state) => state.user);

  useEffect(() => {
    fetchHealth();
    fetchDLQ();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Status & Cloud Infrastructure</h1>
        <p className="text-sm text-gray-400 mt-1">
          Monitor Express Gateway health, Redis Streams Broker, Cosmos DB hooks, and Dead Letter Queue (DLQ)
        </p>
      </div>

      {/* Cloud & Broker Infrastructure Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: API Gateway */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Server className="w-5 h-5" /> Express API Gateway
            </div>
            <span className="badge badge-success">202 Accepted OK</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Ingress status on /api/health</p>
          <div className="space-y-1 text-xs font-mono text-gray-300">
            <div>Uptime: {systemHealth?.uptime || 'Active'}</div>
            <div>Version: {systemHealth?.version || '1.0.0'}</div>
          </div>
        </div>

        {/* Card 2: Redis Streams Broker */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <Activity className="w-5 h-5 animate-pulse" /> Event Broker
            </div>
            <span className="badge badge-purple">Dual-Mode</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Active Broker Engine Mode:</p>
          <div className="text-xs font-semibold text-purple-300 font-mono">
            {systemHealth?.eventBroker || 'In-Memory Async Event Loop Emulator'}
          </div>
        </div>

        {/* Card 3: Database & Entra ID */}
        <div className="glass-panel p-5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Database className="w-5 h-5" /> Database Layer
            </div>
            <span className="badge badge-success">Ready</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">MongoDB / Azure Cosmos DB</p>
          <div className="text-xs font-semibold text-emerald-300 font-mono">
            {systemHealth?.database || 'CONNECTED'}
          </div>
        </div>
      </div>

      {/* MSAL Entra ID SSO Config Info */}
      <div className="glass-panel p-6 border border-white/10">
        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-400" /> Microsoft Azure Entra ID (MSAL SSO) Configuration
        </h3>
        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Enterprise SSO is initialized using <code className="text-indigo-300">@azure/msal-react</code>. Bearer tokens are validated against Azure AD discovery keys.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono bg-black/40 p-4 rounded-xl border border-white/5">
          <div><span className="text-gray-500">Tenant ID:</span> common / azure-tenant-id</div>
          <div><span className="text-gray-500">Client ID:</span> mern-inventory-pro-app</div>
          <div><span className="text-gray-500">Redirect URI:</span> http://localhost/login</div>
          <div><span className="text-gray-500">RBAC Mapping:</span> ADMIN, INVENTORY_MANAGER, WAREHOUSE_STAFF</div>
        </div>
      </div>

      {/* Dead Letter Queue (DLQ) Operational Override Inspector */}
      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" /> Dead Letter Queue (DLQ) Operational Dashboard
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Events exceeding 3 max retries. Admins can manually trigger overrides.</p>
          </div>
          <button onClick={fetchDLQ} className="btn-secondary text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh DLQ Log
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Event Type</th>
                <th>Retry Count</th>
                <th>Error Reason</th>
                <th>Idempotency Key</th>
                <th>Timestamp</th>
                {user?.role === 'ADMIN' && <th className="text-right">Manual Override</th>}
              </tr>
            </thead>
            <tbody>
              {dlqEvents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    <span className="text-emerald-400 font-semibold block">Queue Clean! No corrupted events in Dead Letter Queue (DLQ).</span>
                    All background events processed successfully.
                  </td>
                </tr>
              ) : (
                dlqEvents.map((evt) => (
                  <tr key={evt._id || evt.eventId}>
                    <td className="font-mono text-indigo-300 font-semibold">{evt.eventId}</td>
                    <td className="font-bold text-white">{evt.eventType}</td>
                    <td>
                      <span className="badge badge-danger">{evt.retryCount || 3} Retries</span>
                    </td>
                    <td className="text-rose-300 text-xs font-mono">{evt.errorDetails || 'Worker exception'}</td>
                    <td className="text-xs text-gray-400 font-mono">{evt.idempotencyKey}</td>
                    <td className="text-xs text-gray-400">{new Date(evt.createdAt || Date.now()).toLocaleTimeString()}</td>
                    {user?.role === 'ADMIN' && (
                      <td className="text-right">
                        <button
                          onClick={() => retryDLQEvent(evt.eventId)}
                          className="btn-primary text-xs py-1 px-3"
                        >
                          Retry Event
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
