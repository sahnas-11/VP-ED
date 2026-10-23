import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  PieChart,
  Users,
  Mic,
  Award,
  ShieldAlert,
  UserCheck,
  FileText,
  HeartHandshake,
  BookOpen
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/calendar', label: 'Term Calendar', icon: Calendar, badge: 'Nov-Sep' },
  { to: '/term-overview', label: 'Term Overview', icon: PieChart },
  { to: '/members', label: 'Members Roster', icon: Users },
  { to: '/cc-tracker', label: 'CC Tracker', icon: Mic },
  { to: '/cl-tracker', label: 'CL Tracker', icon: Award },
  { to: '/backup-pool', label: 'Standby Pool', icon: ShieldAlert },
  { to: '/mentors', label: 'Mentor - Mentee', icon: HeartHandshake },
  { to: '/meeting-planner', label: 'Meeting Planner', icon: FileText, badge: '213th+' },
  { to: '/reliability', label: 'Reliability & Nudges', icon: UserCheck },
  { to: '/guides', label: 'CC & Role Guides', icon: BookOpen }
];

export const Sidebar = () => {
  return (
    <aside className="w-64 flex-shrink-0 hidden md:block bg-white dark:bg-darkpink-card border-r border-pastel-100 dark:border-darkpink-border min-h-[calc(100vh-65px)] p-4 transition-colors">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-mauve-500 dark:text-mauve-200 mb-2">
          VPE Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-pastel-500 text-white shadow-cute'
                    : 'text-mauve-700 dark:text-mauve-200 hover:bg-pastel-50 dark:hover:bg-darkpink-hover hover:text-pastel-600'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-pastel-200/50 text-pastel-800 dark:bg-pastel-900/60 dark:text-pastel-200">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-cute bg-gradient-to-br from-pastel-50 to-blush/40 dark:from-darkpink-hover dark:to-darkpink-card border border-pastel-100 dark:border-darkpink-border text-center">
        <p className="text-xs font-bold text-mauve-900 dark:text-pastel-200">
          SLIIT Gavel VPE 🌸
        </p>
        <p className="text-[11px] text-mauve-500 dark:text-mauve-200 mt-1">
          Formula 1 Agenda • 8 Mentors • CC Manual CC1-CC10 • Sri Lanka Holidays
        </p>
      </div>
    </aside>
  );
};
