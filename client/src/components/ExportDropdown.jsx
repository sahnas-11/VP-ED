import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Calendar, ChevronDown, Check } from 'lucide-react';

export const ExportDropdown = ({ meetingId }) => {
  const [isOpen, setIsOpen] = useState(false);

  const downloadFile = (url, name) => {
    window.open(`http://localhost:5050/api/exports/${url}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-pastel-50 dark:bg-darkpink-hover text-pastel-700 dark:text-pastel-200 border border-pastel-200 dark:border-darkpink-border hover:bg-pastel-100 transition-colors shadow-sm"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export Data</span>
        <ChevronDown className="w-3 h-3 ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-cute bg-white dark:bg-darkpink-card border border-pastel-200 dark:border-darkpink-border shadow-cute z-40 py-2 divide-y divide-pastel-50 dark:divide-darkpink-border">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-mauve-500">
              PDF Styled Documents
            </div>
            <div className="py-1">
              {meetingId && (
                <button
                  onClick={() => downloadFile(`meeting/${meetingId}/agenda-pdf`, 'Agenda.pdf')}
                  className="w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 text-mauve-800 dark:text-pastel-100 hover:bg-pastel-50 dark:hover:bg-darkpink-hover"
                >
                  <FileText className="w-4 h-4 text-pastel-600" />
                  <span>Meeting Agenda (PDF)</span>
                </button>
              )}
              <button
                onClick={() => downloadFile('role-scripts-pdf', 'Role_Scripts.pdf')}
                className="w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 text-mauve-800 dark:text-pastel-100 hover:bg-pastel-50 dark:hover:bg-darkpink-hover"
              >
                <FileText className="w-4 h-4 text-pastel-600" />
                <span>Role Scripts & Logs Bundle (PDF)</span>
              </button>
              <button
                onClick={() => downloadFile('cc-guide-pdf', 'CC_Speech_Guide.pdf')}
                className="w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 text-mauve-800 dark:text-pastel-100 hover:bg-pastel-50 dark:hover:bg-darkpink-hover"
              >
                <FileText className="w-4 h-4 text-pastel-600" />
                <span>CC Speech Guide CC1-CC10 (PDF)</span>
              </button>
            </div>

            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-mauve-500">
              Excel Spreadsheets
            </div>
            <div className="py-1">
              <button
                onClick={() => downloadFile('calendar/excel', 'Term_Calendar.xlsx')}
                className="w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 text-mauve-800 dark:text-pastel-100 hover:bg-pastel-50 dark:hover:bg-darkpink-hover"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Term Calendar (Excel)</span>
              </button>
              <button
                onClick={() => downloadFile('members/excel', 'Members_Roster.xlsx')}
                className="w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 text-mauve-800 dark:text-pastel-100 hover:bg-pastel-50 dark:hover:bg-darkpink-hover"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Members & Trackers (Excel)</span>
              </button>
              <button
                onClick={() => downloadFile('mentors/excel', 'Mentor_Mentees.xlsx')}
                className="w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 text-mauve-800 dark:text-pastel-100 hover:bg-pastel-50 dark:hover:bg-darkpink-hover"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Mentor-Mentee Pairings (Excel)</span>
              </button>
            </div>

            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-mauve-500">
              Calendar Integration
            </div>
            <div className="py-1">
              <button
                onClick={() => downloadFile('calendar/ics', 'calendar.ics')}
                className="w-full text-left px-4 py-2 text-xs flex items-center gap-2.5 text-mauve-800 dark:text-pastel-100 hover:bg-pastel-50 dark:hover:bg-darkpink-hover"
              >
                <Calendar className="w-4 h-4 text-blue-500" />
                <span>iCalendar (.ics for Google Calendar)</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
