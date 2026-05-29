import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X, CheckCircle, Bell, Navigation, AlertTriangle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'urgency' | 'success' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const styles = {
            urgency: {
              border: 'border-l-4 border-rose-500 bg-white/95',
              icon: <ShieldAlert className="w-5 h-5 text-rose-600 animate-bounce" />,
              progress: 'bg-rose-500'
            },
            success: {
              border: 'border-l-4 border-emerald-500 bg-white/95',
              icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
              progress: 'bg-emerald-500'
            },
            warning: {
              border: 'border-l-4 border-amber-500 bg-white/95',
              icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
              progress: 'bg-amber-500'
            },
            info: {
              border: 'border-l-4 border-indigo-500 bg-white/95',
              icon: <Bell className="w-5 h-5 text-indigo-600" />,
              progress: 'bg-indigo-500'
            }
          }[toast.type];

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`pointer-events-auto rounded-xl p-4 shadow-xl border border-slate-100 flex gap-3 relative overflow-hidden backdrop-blur-md ${styles.border}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {styles.icon}
              </div>
              <div className="flex-1 pr-4">
                <h4 className="text-xs font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 uppercase">
                  {toast.title}
                </h4>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  {toast.message}
                </p>
                {toast.timestamp && (
                  <span className="text-[9px] text-slate-400 font-mono mt-1 block">
                    {toast.timestamp}
                  </span>
                )}
              </div>
              <button
                type="button"
                id={`btn-close-toast-${toast.id}`}
                onClick={() => onRemove(toast.id)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
