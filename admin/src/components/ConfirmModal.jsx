import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Aniq hammasini o'chirmoqchimisiz?",
  description = "Ushbu amalni ortga qaytarib bo'lmaydi. Barcha tanlangan ma'lumotlar butunlay o'chiriladi.",
  confirmText = "O'chirish",
  cancelText = "Bekor qilish",
  loading = false,
  danger = true,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-mehmon-card border border-red-500/40 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-mehmon-muted hover:text-mehmon-text transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Warning Icon */}
        <div className="w-14 h-14 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-500 shadow-sm">
          <AlertTriangle className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg sm:text-xl font-bold text-center text-mehmon-text mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-mehmon-muted text-center mb-6 leading-relaxed">
          {description}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-mehmon-input text-mehmon-text hover:bg-mehmon-subtle border border-mehmon-border text-xs font-semibold transition-all shadow-sm order-2 sm:order-1"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(220,38,38,0.4)] disabled:opacity-50 transition-all order-1 sm:order-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
