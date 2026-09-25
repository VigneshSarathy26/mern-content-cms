import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Cpu, Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('admin@inventorypro.com');
  const [password, setPassword] = useState('password123');

  const login = useStore((state) => state.login);
  const msalLogin = useStore((state) => state.msalLogin);
  const loading = useStore((state) => state.loading);
  const navigate = useNavigate();

  const handleLocalLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/dashboard');
  };

  const handleAzureEntraIDLogin = async () => {
    const success = await msalLogin('mock_msal_entra_id_token_xyz');
    if (success) navigate('/dashboard');
  };

  const fillQuickCredentials = (quickEmail, quickRole) => {
    setEmail(quickEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#070a11] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/25 mb-4">
            <Cpu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            Inventory <span className="text-indigo-400">Pro</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Event-Driven MERN Enterprise Portal</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 border border-white/10 shadow-2xl">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" /> Sign In to Gateway
          </h2>

          <form onSubmit={handleLocalLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Email / Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="admin@inventorypro.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 text-sm mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In with Local Credentials'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <span className="relative px-3 bg-[#121824] text-xs text-gray-500 uppercase font-mono">
              Enterprise Identity (SSO)
            </span>
          </div>

          {/* Microsoft Azure Entra ID SSO Button */}
          <button
            type="button"
            onClick={handleAzureEntraIDLogin}
            className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-500/30 text-blue-200 font-semibold text-xs transition duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 23 23">
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
            Sign in with Microsoft Entra ID (MSAL)
          </button>

          {/* Quick Demo Pre-fill Pills */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Quick One-Click Demo Credentials:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillQuickCredentials('admin@inventorypro.com', 'ADMIN')}
                className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs hover:bg-purple-500/30"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('manager@inventorypro.com', 'INVENTORY_MANAGER')}
                className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs hover:bg-indigo-500/30"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => fillQuickCredentials('staff@inventorypro.com', 'WAREHOUSE_STAFF')}
                className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs hover:bg-emerald-500/30"
              >
                Staff
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Need a new workspace account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Register User
          </Link>
        </p>
      </div>
    </div>
  );
}
