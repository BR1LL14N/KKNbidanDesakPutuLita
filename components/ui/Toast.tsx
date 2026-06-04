'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircle2, XCircle, AlertTriangle, Info, X, ShieldAlert, Trash2
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = persistent
}

// ─── Single Toast Card ─────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: React.ReactNode; bar: string; bg: string; title: string; badge: string }
> = {
  success: {
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    bar: 'bg-emerald-500',
    bg: 'bg-[#0f1f1c]',
    title: 'text-emerald-300',
    badge: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    bar: 'bg-rose-500',
    bg: 'bg-[#1f0f0f]',
    title: 'text-rose-300',
    badge: 'bg-rose-900/60 text-rose-300 border-rose-700/50',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    bar: 'bg-amber-500',
    bg: 'bg-[#1a1500]',
    title: 'text-amber-300',
    badge: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
  },
  info: {
    icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
    bar: 'bg-sky-500',
    bg: 'bg-[#0a1520]',
    title: 'text-sky-300',
    badge: 'bg-sky-900/60 text-sky-300 border-sky-700/50',
  },
};

const VARIANT_LABEL: Record<ToastVariant, string> = {
  success: 'Berhasil',
  error: 'Gagal',
  warning: 'Peringatan',
  info: 'Informasi',
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);

  const duration = toast.duration ?? 4500;

  useEffect(() => {
    // mount animation
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (duration === 0) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        handleDismiss();
      }
    }, 30);
    return () => clearInterval(interval);
  }, [duration]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const cfg = VARIANT_CONFIG[toast.variant];

  return (
    <div
      className={`
        relative w-[340px] overflow-hidden rounded-2xl border border-white/10
        shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl
        transition-all duration-300 ease-out
        ${cfg.bg}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}
      `}
    >
      {/* Accent top bar */}
      <div className={`h-0.5 w-full ${cfg.bar}`} />

      {/* Progress bar at bottom */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 h-0.5 bg-white/10 w-full">
          <div
            className={`h-full transition-none ${cfg.bar} opacity-60`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex items-start gap-3 px-4 py-4">
        {/* Icon */}
        <div className="mt-0.5">{cfg.icon}</div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${cfg.badge}`}>
              {VARIANT_LABEL[toast.variant]}
            </span>
          </div>
          <p className={`font-bold text-sm leading-snug ${cfg.title}`}>
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>

        {/* Close btn */}
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Toast Container ───────────────────────────────────────────────────────────

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}

// ─── useToast Hook ─────────────────────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (variant: ToastVariant, title: string, message?: string, duration?: number) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, variant, title, message, duration }]);
    },
    []
  );

  const success = (title: string, message?: string) => show('success', title, message);
  const error = (title: string, message?: string) => show('error', title, message, 6000);
  const warning = (title: string, message?: string) => show('warning', title, message, 6000);
  const info = (title: string, message?: string) => show('info', title, message);

  return { toasts, dismiss, success, error, warning, info };
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
}

interface ConfirmDialogProps {
  options: ConfirmOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ options, onConfirm, onCancel }: ConfirmDialogProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (options) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [options]);

  if (!options) return null;

  const isDanger = (options.variant ?? 'danger') === 'danger';

  return (
    <div
      className={`
        fixed inset-0 z-[9998] flex items-center justify-center p-4
        transition-all duration-300
        ${visible ? 'bg-slate-950/60 backdrop-blur-sm' : 'bg-transparent'}
      `}
    >
      <div
        className={`
          bg-[#0d1117] border border-white/10 rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]
          w-full max-w-sm overflow-hidden
          transition-all duration-300
          ${visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
        `}
      >
        {/* Top accent */}
        <div className={`h-0.5 w-full ${isDanger ? 'bg-rose-500' : 'bg-amber-500'}`} />

        <div className="p-6">
          {/* Icon + title */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center shrink-0
              ${isDanger ? 'bg-rose-950/80 border border-rose-800/60' : 'bg-amber-950/80 border border-amber-800/60'}
            `}>
              {isDanger
                ? <Trash2 className="w-5 h-5 text-rose-400" />
                : <ShieldAlert className="w-5 h-5 text-amber-400" />
              }
            </div>
            <div>
              <h3 className="font-black text-white text-sm leading-snug">{options.title}</h3>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{options.message}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 mt-5">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 text-xs font-bold hover:bg-white/5 transition-colors"
            >
              {options.cancelLabel ?? 'Batal'}
            </button>
            <button
              onClick={onConfirm}
              className={`
                flex-1 px-4 py-2.5 rounded-xl text-white text-xs font-black shadow-sm transition-all
                ${isDanger
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/40'
                  : 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/40'
                }
              `}
            >
              {options.confirmLabel ?? 'Ya, Lanjutkan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── useConfirm Hook ───────────────────────────────────────────────────────────

export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolve, setResolve] = useState<((val: boolean) => void) | null>(null);

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((res) => {
      setOptions(opts);
      setResolve(() => res);
    });
  };

  const handleConfirm = () => {
    resolve?.(true);
    setOptions(null);
    setResolve(null);
  };

  const handleCancel = () => {
    resolve?.(false);
    setOptions(null);
    setResolve(null);
  };

  return { options, confirm, handleConfirm, handleCancel };
}
