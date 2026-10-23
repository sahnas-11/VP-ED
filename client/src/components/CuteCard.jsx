import React from 'react';

export const CuteCard = ({ children, className = '', title, subtitle, icon: Icon, action, ribbon }) => {
  return (
    <div className={`relative bg-white dark:bg-darkpink-card border border-pastel-100 dark:border-darkpink-border rounded-cute p-5 shadow-soft hover:shadow-cute transition-all duration-300 ${className}`}>
      {ribbon && (
        <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-pastel-400 to-pastel-600 text-white text-xs font-bold px-3 py-0.5 rounded-full shadow-sm">
          {ribbon}
        </span>
      )}
      {(title || Icon || action) && (
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-pastel-50 dark:border-darkpink-border">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-pastel-100 dark:bg-darkpink-hover flex items-center justify-center text-pastel-600 dark:text-pastel-300">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && <h3 className="font-bold text-mauve-900 dark:text-pastel-100 text-base">{title}</h3>}
              {subtitle && <p className="text-xs text-mauve-500 dark:text-mauve-200">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
