import React from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';

export default function Toast() {
  const toast = useStore((state) => state.toast);
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default:
        return <Info className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/40 bg-emerald-950/80 text-emerald-100';
      case 'error':
        return 'border-rose-500/40 bg-rose-950/80 text-rose-100';
      case 'warning':
        return 'border-amber-500/40 bg-amber-950/80 text-amber-100';
      default:
        return 'border-indigo-500/40 bg-indigo-950/80 text-indigo-100';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-md shadow-2xl ${getBorderColor()}`}
      >
        {getIcon()}
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );
}
