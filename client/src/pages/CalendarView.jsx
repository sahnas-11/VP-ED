import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api/axiosClient';
import { CuteCard } from '../components/CuteCard';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { ExportDropdown } from '../components/ExportDropdown';
import {
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  AlertCircle,
  Clock,
  MapPin,
  Tag,
  Wand2,
  Filter
} from 'lucide-react';

const EVENT_TYPE_COLORS = {
  regular: { bg: '#ee4375', border: '#db275e', text: '#ffffff', label: 'Regular Meeting' },
  online: { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff', label: 'Online Meeting' },
  joint: { bg: '#06b6d4', border: '#0891b2', text: '#ffffff', label: 'Joint Meeting' },
  outdoor: { bg: '#10b981', border: '#059669', text: '#ffffff', label: 'Outdoor Meeting' },
  workshop: { bg: '#f59e0b', border: '#d97706', text: '#ffffff', label: 'Educational Workshop' },
  event: { bg: '#ec4899', border: '#db2777', text: '#ffffff', label: 'Special Event' },
  exam_break: { bg: '#94a3b8', border: '#64748b', text: '#ffffff', label: 'SLIIT Exam / Break Block' },
  holiday: { bg: '#f43f5e', border: '#e11d48', text: '#ffffff', label: 'Sri Lanka Public Holiday' }
};

export const CalendarView = () => {
  const [events, setEvents] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [warningMessage, setWarningMessage] = useState('');

  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    type: 'regular',
    start: '',
    end: '',
    venue: 'SLIIT Malabe F404',
    theme: '',
    notes: '',
    tentative: false
  });

  // Generator modal state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [generatorData, setGeneratorData] = useState({
    weekday: 0, // Sunday
    startDate: '2026-11-01',
    endDate: '2027-09-30',
    startTime: '14:00',
    durationHours: 2.5,
    skipHolidays: true,
    skipExams: true,
    startMeetingNo: 214
  });
  const [generationSummary, setGenerationSummary] = useState(null);

  const calendarRef = useRef(null);

  useEffect(() => {
    fetchEvents();
  }, [selectedType]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/calendar/events', {
        params: { type: selectedType }
      });
      const formatted = res.data.data.map(e => ({
        id: e._id,
        title: e.tentative ? `🌙 [Tentative] ${e.title}` : e.title,
        start: e.start,
        end: e.end,
        backgroundColor: EVENT_TYPE_COLORS[e.type]?.bg || '#ee4375',
        borderColor: EVENT_TYPE_COLORS[e.type]?.border || '#db275e',
        textColor: EVENT_TYPE_COLORS[e.type]?.text || '#ffffff',
        extendedProps: e
      }));
      setEvents(formatted);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop reschedule
  const handleEventDrop = async (info) => {
    try {
      const res = await api.put(`/calendar/events/${info.event.id}`, {
        start: info.event.start.toISOString(),
        end: info.event.end ? info.event.end.toISOString() : new Date(info.event.start.getTime() + 2 * 3600 * 1000).toISOString()
      });
      if (res.data.warning) {
        setWarningMessage(`⚠️ Conflict Warning: ${res.data.warning}`);
        setTimeout(() => setWarningMessage(''), 8000);
      }
      fetchEvents();
    } catch (err) {
      info.revert();
      alert('Could not reschedule event.');
    }
  };

  // Click on event to view / edit
  const handleEventClick = (info) => {
    const raw = info.event.extendedProps;
    setSelectedEvent(raw);
    setEventFormData({
      title: raw.title,
      type: raw.type,
      start: raw.start ? raw.start.substring(0, 16) : '',
      end: raw.end ? raw.end.substring(0, 16) : '',
      venue: raw.venue || '',
      theme: raw.theme || '',
      notes: raw.notes || '',
      tentative: !!raw.tentative
    });
    setIsEventModalOpen(true);
  };

  // Open modal to create new event
  const handleOpenCreate = () => {
    setSelectedEvent(null);
    setEventFormData({
      title: '',
      type: 'regular',
      start: '2026-11-29T14:00',
      end: '2026-11-29T16:30',
      venue: 'SLIIT Malabe F404',
      theme: '',
      notes: '',
      tentative: false
    });
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        const res = await api.put(`/calendar/events/${selectedEvent._id}`, eventFormData);
        if (res.data.warning) {
          setWarningMessage(`⚠️ Conflict Warning: ${res.data.warning}`);
          setTimeout(() => setWarningMessage(''), 8000);
        }
      } else {
        const res = await api.post('/calendar/events', eventFormData);
        if (res.data.warning) {
          setWarningMessage(`⚠️ Conflict Warning: ${res.data.warning}`);
          setTimeout(() => setWarningMessage(''), 8000);
        }
      }
      setIsEventModalOpen(false);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving event');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/calendar/events/${selectedEvent._id}`);
        setIsEventModalOpen(false);
        fetchEvents();
      } catch (err) {
        alert('Could not delete event');
      }
    }
  };

  // Run Meeting Generator
  const handleRunGenerator = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/calendar/generate-dates', generatorData);
      setGenerationSummary(res.data);
      fetchEvents();
    } catch (err) {
      alert('Generation failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Quick Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 flex items-center gap-2">
            Term Calendar (Nov 2026 – Sep 2027) 🌸
          </h1>
          <p className="text-xs text-mauve-500 dark:text-mauve-200 mt-1">
            Sri Lanka Public Holidays • SLIIT Academic Breaks • Drag-and-drop Reschedule • Conflict Checking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <ExportDropdown />
          <button
            onClick={() => { setGenerationSummary(null); setIsGeneratorOpen(true); }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-darkpink-card text-pastel-700 dark:text-pastel-200 border border-pastel-200 dark:border-darkpink-border hover:bg-pastel-50 transition-colors shadow-sm"
          >
            <Wand2 className="w-3.5 h-3.5 text-pastel-500" />
            <span>Generate Meeting Dates</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Conflict Warning Banner if any */}
      {warningMessage && (
        <div className="p-4 rounded-cute bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Legend & Filter Bar */}
      <div className="p-4 rounded-cute bg-white dark:bg-darkpink-card border border-pastel-100 dark:border-darkpink-border shadow-soft flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-mauve-700 dark:text-pastel-200">
          <Filter className="w-3.5 h-3.5 text-pastel-500" />
          <span>Event Type Filter:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-pastel-200 dark:border-darkpink-border bg-pastel-50 dark:bg-darkpink-hover font-semibold text-mauve-900 dark:text-pastel-100"
          >
            <option value="all">All Types</option>
            {Object.entries(EVENT_TYPE_COLORS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        {/* Color Indicators */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-mauve-600 dark:text-mauve-200">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-pastel-500" /> Regular
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500" /> Online
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-cyan-500" /> Joint
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" /> Outdoor
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500" /> Workshop
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500" /> Holiday / Poya 🌙
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-400" /> SLIIT Exam Break
          </span>
        </div>
      </div>

      {/* Main FullCalendar Component */}
      <CuteCard className="overflow-hidden">
        <div className="p-2">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate="2026-11-01"
            validRange={{
              start: '2026-10-01',
              end: '2027-10-31'
            }}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,listMonth'
            }}
            events={events}
            editable={true}
            selectable={true}
            eventDrop={handleEventDrop}
            eventClick={handleEventClick}
            height="auto"
          />
        </div>
      </CuteCard>

      {/* Event Details / Edit Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title={selectedEvent ? 'Edit Calendar Event' : 'Create New Event'}
        subtitle="Manage educational meeting, workshop, or holiday block"
      >
        <form onSubmit={handleSaveEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
              Event Title
            </label>
            <input
              type="text"
              required
              value={eventFormData.title}
              onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
              placeholder="e.g. 214th Educational Meeting"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Event Type
              </label>
              <select
                value={eventFormData.type}
                onChange={(e) => setEventFormData({ ...eventFormData, type: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              >
                {Object.entries(EVENT_TYPE_COLORS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Venue / Location
              </label>
              <input
                type="text"
                value={eventFormData.venue}
                onChange={(e) => setEventFormData({ ...eventFormData, venue: e.target.value })}
                placeholder="SLIIT Malabe F404"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={eventFormData.start}
                onChange={(e) => setEventFormData({ ...eventFormData, start: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={eventFormData.end}
                onChange={(e) => setEventFormData({ ...eventFormData, end: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
              Meeting Theme (if applicable)
            </label>
            <input
              type="text"
              value={eventFormData.theme}
              onChange={(e) => setEventFormData({ ...eventFormData, theme: e.target.value })}
              placeholder="e.g. Formula 1, Neon Nights, Retro Vibes"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
              Notes / Special Instructions
            </label>
            <textarea
              rows={2}
              value={eventFormData.notes}
              onChange={(e) => setEventFormData({ ...eventFormData, notes: e.target.value })}
              placeholder="Any details or exam clash reminders..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="tentative"
              checked={eventFormData.tentative}
              onChange={(e) => setEventFormData({ ...eventFormData, tentative: e.target.checked })}
              className="rounded text-pastel-500 focus:ring-pastel-400"
            />
            <label htmlFor="tentative" className="text-xs font-bold text-mauve-700 dark:text-pastel-200">
              🌙 Flag as Tentative (Moon-sighting or Poya dependent)
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-pastel-100 dark:border-darkpink-border">
            {selectedEvent ? (
              <button
                type="button"
                onClick={handleDeleteEvent}
                className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Delete Event
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-mauve-600 hover:bg-pastel-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
              >
                Save Event
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Meeting Dates Generator Modal */}
      <Modal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        title="Weekly Meeting Dates Generator ✨"
        subtitle="Auto-schedules meetings for the term while intelligently skipping Sri Lanka holidays and SLIIT exams"
      >
        <form onSubmit={handleRunGenerator} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Meeting Day of the Week
              </label>
              <select
                value={generatorData.weekday}
                onChange={(e) => setGeneratorData({ ...generatorData, weekday: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              >
                <option value={0}>Sunday (Standard Gavel Day)</option>
                <option value={6}>Saturday</option>
                <option value={5}>Friday</option>
                <option value={4}>Thursday</option>
                <option value={3}>Wednesday</option>
                <option value={2}>Tuesday</option>
                <option value={1}>Monday</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Starting Meeting Number
              </label>
              <input
                type="number"
                value={generatorData.startMeetingNo}
                onChange={(e) => setGeneratorData({ ...generatorData, startMeetingNo: parseInt(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Date Range Start
              </label>
              <input
                type="date"
                value={generatorData.startDate}
                onChange={(e) => setGeneratorData({ ...generatorData, startDate: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Date Range End
              </label>
              <input
                type="date"
                value={generatorData.endDate}
                onChange={(e) => setGeneratorData({ ...generatorData, endDate: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Meeting Start Time
              </label>
              <input
                type="time"
                value={generatorData.startTime}
                onChange={(e) => setGeneratorData({ ...generatorData, startTime: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Duration (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                value={generatorData.durationHours}
                onChange={(e) => setGeneratorData({ ...generatorData, durationHours: parseFloat(e.target.value) })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-pastel-100 dark:border-darkpink-border">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="skipHolidays"
                checked={generatorData.skipHolidays}
                onChange={(e) => setGeneratorData({ ...generatorData, skipHolidays: e.target.checked })}
                className="rounded text-pastel-500 focus:ring-pastel-400"
              />
              <label htmlFor="skipHolidays" className="text-xs font-bold text-mauve-700 dark:text-pastel-200">
                Auto-skip Sri Lanka Public Holidays & Poya Days
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="skipExams"
                checked={generatorData.skipExams}
                onChange={(e) => setGeneratorData({ ...generatorData, skipExams: e.target.checked })}
                className="rounded text-pastel-500 focus:ring-pastel-400"
              />
              <label htmlFor="skipExams" className="text-xs font-bold text-mauve-700 dark:text-pastel-200">
                Auto-skip SLIIT Mid-Exam & Final-Exam Periods
              </label>
            </div>
          </div>

          {generationSummary && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs">
              <p className="font-bold">✨ Generated {generationSummary.createdCount} meeting dates successfully!</p>
              <p className="mt-1 text-[11px]">Skipped {generationSummary.skippedCount} dates due to public holidays or exam breaks.</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsGeneratorOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-mauve-600 hover:bg-pastel-50 transition-colors"
            >
              Done
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
            >
              Generate Dates Now
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
