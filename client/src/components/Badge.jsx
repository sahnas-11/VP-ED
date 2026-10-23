import React from 'react';

export const Badge = ({ children, variant = 'default', className = '', icon: Icon }) => {
  const variants = {
    default: 'bg-pastel-100 text-pastel-700 dark:bg-pastel-900/40 dark:text-pastel-200 border-pastel-200',
    pink: 'bg-pastel-500 text-white border-transparent',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200',
    star: 'bg-gradient-to-r from-amber-400 to-rose-400 text-white shadow-sm border-transparent'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant] || variants.default} ${className}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </span>
  );
};
