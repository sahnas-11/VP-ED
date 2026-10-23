import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Heart, Sparkles, Calendar, BookOpen } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-darkpink-card/90 backdrop-blur-md border-b border-pastel-100 dark:border-darkpink-border px-4 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left: Branding & Term Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pastel-400 to-pastel-600 flex items-center justify-center text-white shadow-cute">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-mauve-900 dark:text-pastel-100">
                SLIIT GAVEL CLUB
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-pastel-100 text-pastel-700 dark:bg-pastel-900 dark:text-pastel-200">
                VPE Portal 🌸
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-mauve-500 dark:text-mauve-200 font-medium">
              <span className="inline-flex items-center gap-1 text-pastel-600 dark:text-pastel-400 font-semibold">
                <Calendar className="w-3 h-3" /> Term 2026/27
              </span>
              <span>•</span>
              <span className="italic">#GAVELNEVERSTOPS</span>
            </div>
          </div>
        </div>

        {/* Right: Actions, Theme Switcher & User Profile */}
        <div className="flex items-center space-x-3">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Soft Pink Light' : 'Switch to Soft Dark-Pink'}
            className="p-2 rounded-xl text-mauve-700 dark:text-pastel-200 hover:bg-pastel-100 dark:hover:bg-darkpink-hover transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-pastel-600" />}
          </button>

          {/* User info & Logout */}
          {user ? (
            <div className="flex items-center space-x-3 pl-3 border-l border-pastel-100 dark:border-darkpink-border">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-mauve-900 dark:text-pastel-100 leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] uppercase font-bold text-pastel-600 dark:text-pastel-400">
                  VP Education
                </p>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
