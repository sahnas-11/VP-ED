import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { CuteCard } from '../components/CuteCard';
import { Badge } from '../components/Badge';
import { ExportDropdown } from '../components/ExportDropdown';
import { PieChart, Calendar, BarChart3, CheckCircle2 } from 'lucide-react';

export const TermOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await api.get('/calendar/term-overview');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load term overview:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pastel-500"></div>
      </div>
    );
  }

  const totals = data?.summaryTotals || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 flex items-center gap-2">
            Term Overview (Nov 2026 – Sep 2027) 📊
          </h1>
          <p className="text-xs text-mauve-500 dark:text-mauve-200 mt-1">
            Monthly educational meeting distribution, workshops, exams, and holidays
          </p>
        </div>
        <ExportDropdown />
      </div>

      {/* Summary Totals Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CuteCard>
          <p className="text-xs font-semibold text-mauve-500">Regular Meetings</p>
          <p className="text-2xl font-extrabold text-pastel-600 mt-1">{totals.regular || 0}</p>
          <p className="text-[10px] text-mauve-500 mt-0.5">Physical at SLIIT F404</p>
        </CuteCard>
        <CuteCard>
          <p className="text-xs font-semibold text-mauve-500">Online & Joint</p>
          <p className="text-2xl font-extrabold text-purple-600 mt-1">{(totals.online || 0) + (totals.joint || 0)}</p>
          <p className="text-[10px] text-mauve-500 mt-0.5">Zoom / Collaborative</p>
        </CuteCard>
        <CuteCard>
          <p className="text-xs font-semibold text-mauve-500">Workshops & Events</p>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">{(totals.workshop || 0) + (totals.event || 0)}</p>
          <p className="text-[10px] text-mauve-500 mt-0.5">Special Skill Sessions</p>
        </CuteCard>
        <CuteCard>
          <p className="text-xs font-semibold text-mauve-500">SLIIT Exams & Breaks</p>
          <p className="text-2xl font-extrabold text-slate-500 mt-1">{totals.exam_break || 0}</p>
          <p className="text-[10px] text-mauve-500 mt-0.5">No-meeting periods</p>
        </CuteCard>
      </div>

      {/* Monthly Breakdown Table */}
      <CuteCard title="Monthly Breakdown by Event Type" subtitle="Comprehensive calendar distribution table" icon={Calendar}>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-pastel-100 dark:border-darkpink-border text-mauve-600 dark:text-mauve-200">
                <th className="py-2.5 px-3 font-bold">Month</th>
                <th className="py-2.5 px-3 font-bold text-center">Regular Meetings</th>
                <th className="py-2.5 px-3 font-bold text-center">Online</th>
                <th className="py-2.5 px-3 font-bold text-center">Joint / Outdoor</th>
                <th className="py-2.5 px-3 font-bold text-center">Workshops</th>
                <th className="py-2.5 px-3 font-bold text-center">Exam Breaks</th>
                <th className="py-2.5 px-3 font-bold text-center">Holidays</th>
                <th className="py-2.5 px-3 font-bold text-center">Total Events</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pastel-50 dark:divide-darkpink-border">
              {data?.monthlyBreakdown?.map((m) => (
                <tr key={m.monthKey} className="hover:bg-pastel-50/50 dark:hover:bg-darkpink-hover transition-colors font-medium">
                  <td className="py-3 px-3 font-bold text-mauve-900 dark:text-pastel-100">
                    {m.monthLabel}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-extrabold text-pastel-600">{m.regular}</span>
                  </td>
                  <td className="py-3 px-3 text-center">{m.online}</td>
                  <td className="py-3 px-3 text-center">{m.joint + m.outdoor}</td>
                  <td className="py-3 px-3 text-center">{m.workshop + m.event}</td>
                  <td className="py-3 px-3 text-center text-slate-500">{m.exam_break}</td>
                  <td className="py-3 px-3 text-center text-rose-500">{m.holiday}</td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant="default">{m.totalEvents}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CuteCard>
    </div>
  );
};
