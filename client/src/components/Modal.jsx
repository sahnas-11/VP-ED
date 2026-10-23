import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`relative w-full ${maxWidth} bg-white dark:bg-darkpink-card rounded-super shadow-2xl border border-pastel-200 dark:border-darkpink-border overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-pastel-100 dark:border-darkpink-border bg-gradient-to-r from-pastel-50 to-white dark:from-darkpink-hover dark:to-darkpink-card">
          <div>
            <h3 className="text-lg font-bold text-mauve-900 dark:text-pastel-100">{title}</h3>
            {subtitle && <p className="text-xs text-mauve-500 dark:text-mauve-200 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-mauve-500 hover:text-pastel-600 hover:bg-pastel-100 dark:hover:bg-darkpink-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
