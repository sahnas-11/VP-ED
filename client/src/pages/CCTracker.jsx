import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { CuteCard } from '../components/CuteCard';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { ExportDropdown } from '../components/ExportDropdown';
import { Mic, Plus, Search, Filter, Layers, BookOpen } from 'lucide-react';

export const CCTracker = () => {
  const [speeches, setSpeeches] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProject, setFilterProject] = useState('all');
  const [filterSource, setFilterSource] = useState('all');

  // Single Add Modal
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    ccProject: 'CC1',
    title: '',
    date: new Date().toISOString().substring(0, 10),
    meetingNo: '',
    evaluatorName: '',
    source: 'meeting',
    notes: ''
  });

  // Bulk Add Modal
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState([
    { memberId: '', ccProject: 'CC1', title: '', date: '', meetingNo: '', evaluatorName: '', source: 'speech_marathon' },
    { memberId: '', ccProject: 'CC1', title: '', date: '', meetingNo: '', evaluatorName: '', source: 'speech_marathon' },
    { memberId: '', ccProject: 'CC1', title: '', date: '', meetingNo: '', evaluatorName: '', source: 'speech_marathon' }
  ]);

  useEffect(() => {
    fetchData();
  }, [filterProject, filterSource]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [spRes, memRes] = await Promise.all([
        api.get('/members/trackers/cc-speeches', {
          params: {
            project: filterProject !== 'all' ? filterProject : undefined,
            source: filterSource !== 'all' ? filterSource : undefined
          }
        }),
        api.get('/members')
      ]);
      setSpeeches(spRes.data.data);
      setMembers(memRes.data.data);
    } catch (err) {
      console.error('Error fetching CC Tracker data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSingle = async (e) => {
    e.preventDefault();
    if (!formData.memberId) return alert('Please select a speaker');
    try {
      await api.post('/members/trackers/cc-speeches', formData);
      setIsSingleModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving speech');
    }
  };

  const handleBulkChange = (index, field, value) => {
    const updated = [...bulkRows];
    updated[index][field] = value;
    setBulkRows(updated);
  };

  const handleAddBulkRow = () => {
    setBulkRows([
      ...bulkRows,
      { memberId: '', ccProject: 'CC1', title: '', date: '', meetingNo: '', evaluatorName: '', source: 'speech_marathon' }
    ]);
  };

  const handleSaveBulk = async (e) => {
    e.preventDefault();
    const valid = bulkRows.filter(r => r.memberId && r.title && r.date);
    if (valid.length === 0) {
      return alert('Please fill in at least one valid speech row (Member, Title, Date)');
    }
    try {
      await api.post('/members/trackers/cc-speeches/bulk', { speeches: valid });
      setIsBulkModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving bulk speeches');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 flex items-center gap-2">
            General CC Speeches Tracker 🎤
          </h1>
          <p className="text-xs text-mauve-500 dark:text-mauve-200 mt-1">
            Historical speech records, meeting speeches, speech marathon entries, and manual project completions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <ExportDropdown />
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-darkpink-card text-mauve-800 dark:text-pastel-200 border border-pastel-200 dark:border-darkpink-border hover:bg-pastel-50 transition-colors shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-pastel-500" />
            <span>Bulk Add Speeches (Marathons/Posters)</span>
          </button>
          <button
            onClick={() => {
              setFormData({
                memberId: members[0]?._id || '',
                ccProject: 'CC1',
                title: '',
                date: new Date().toISOString().substring(0, 10),
                meetingNo: '',
                evaluatorName: '',
                source: 'meeting',
                notes: ''
              });
              setIsSingleModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Speech</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-cute bg-white dark:bg-darkpink-card border border-pastel-100 dark:border-darkpink-border shadow-soft flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-mauve-700 dark:text-pastel-200">
          <Filter className="w-3.5 h-3.5 text-pastel-500" />
          <span>Project Filter:</span>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-pastel-200 dark:border-darkpink-border bg-pastel-50 dark:bg-darkpink-hover font-bold"
          >
            <option value="all">All CC Projects (CC1 - CC10)</option>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <option key={n} value={`CC${n}`}>CC{n}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-mauve-700 dark:text-pastel-200">
          <span>Source:</span>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-2.5 py-1 text-xs rounded-lg border border-pastel-200 dark:border-darkpink-border bg-pastel-50 dark:bg-darkpink-hover font-bold"
          >
            <option value="all">All Sources</option>
            <option value="meeting">Club Educational Meeting</option>
            <option value="speech_marathon">Speech Marathon</option>
            <option value="joint_meeting">Joint Meeting</option>
            <option value="external">External Toastmasters Club</option>
          </select>
        </div>
      </div>

      {/* Speeches Log Table */}
      <CuteCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-pastel-100 dark:border-darkpink-border bg-pastel-50/40 dark:bg-darkpink-hover text-mauve-700 dark:text-pastel-200">
                <th className="py-3 px-4 font-bold">Speaker Name</th>
                <th className="py-3 px-4 font-bold text-center">CC Project</th>
                <th className="py-3 px-4 font-bold">Speech Title</th>
                <th className="py-3 px-4 font-bold">Date</th>
                <th className="py-3 px-4 font-bold text-center">Meeting #</th>
                <th className="py-3 px-4 font-bold">Evaluator</th>
                <th className="py-3 px-4 font-bold text-center">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pastel-50 dark:divide-darkpink-border">
              {speeches.map((s) => (
                <tr key={s._id} className="hover:bg-pastel-50/60 dark:hover:bg-darkpink-hover/60 transition-colors font-medium">
                  <td className="py-3 px-4">
                    <span className="font-bold text-mauve-900 dark:text-pastel-100">
                      {s.memberId?.name || 'Unknown Speaker'}
                    </span>
                    {s.memberId?.preferredName && (
                      <p className="text-[10px] text-mauve-500">“{s.memberId.preferredName}”</p>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Badge variant="pink">{s.ccProject}</Badge>
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-bold text-mauve-900 dark:text-pastel-100">“{s.title}”</p>
                    {s.notes && <p className="text-[10px] text-mauve-500">{s.notes}</p>}
                  </td>

                  <td className="py-3 px-4">
                    {new Date(s.date).toLocaleDateString('en-GB')}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {s.meetingNo ? `#${s.meetingNo}` : '—'}
                  </td>

                  <td className="py-3 px-4">
                    {s.evaluatorId ? s.evaluatorId.name : (s.evaluatorName || '—')}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Badge variant={s.source === 'speech_marathon' ? 'purple' : 'default'}>
                      {s.source.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CuteCard>

      {/* Single Add Speech Modal */}
      <Modal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        title="Record CC Speech"
        subtitle="Log a prepared speech given at a meeting or speech marathon"
      >
        <form onSubmit={handleSaveSingle} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
              Select Speaker
            </label>
            <select
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
            >
              <option value="">-- Choose Member --</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.preferredName || m.batch})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                CC Project
              </label>
              <select
                value={formData.ccProject}
                onChange={(e) => setFormData({ ...formData, ccProject: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <option key={n} value={`CC${n}`}>CC{n} - Project {n}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Speech Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Title of the speech"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Date Given
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Meeting # (optional)
              </label>
              <input
                type="number"
                value={formData.meetingNo}
                onChange={(e) => setFormData({ ...formData, meetingNo: e.target.value })}
                placeholder="213"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              >
                <option value="meeting">Club Meeting</option>
                <option value="speech_marathon">Speech Marathon</option>
                <option value="joint_meeting">Joint Meeting</option>
                <option value="external">External Club</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
              Evaluator Name
            </label>
            <input
              type="text"
              value={formData.evaluatorName}
              onChange={(e) => setFormData({ ...formData, evaluatorName: e.target.value })}
              placeholder="e.g. GV Pavan Kumarage"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-pastel-100 dark:border-darkpink-border">
            <button
              type="button"
              onClick={() => setIsSingleModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-mauve-600 hover:bg-pastel-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
            >
              Save Speech Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Add Speeches Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        maxWidth="max-w-4xl"
        title="Bulk Add Historical Speeches & Speech Marathons 📜"
        subtitle="Quick entry form to log speeches from past posters or marathon events"
      >
        <form onSubmit={handleSaveBulk} className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-pastel-100 text-mauve-600">
                  <th className="py-2 px-2">Speaker</th>
                  <th className="py-2 px-2">Project</th>
                  <th className="py-2 px-2">Title</th>
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2">Meeting / Event</th>
                  <th className="py-2 px-2">Evaluator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pastel-50">
                {bulkRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-2">
                      <select
                        value={row.memberId}
                        onChange={(e) => handleBulkChange(idx, 'memberId', e.target.value)}
                        className="w-40 px-2 py-1 text-xs rounded-lg border border-pastel-200 font-medium"
                      >
                        <option value="">Select Member</option>
                        {members.map(m => (
                          <option key={m._id} value={m._id}>{m.preferredName || m.name}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2 px-2">
                      <select
                        value={row.ccProject}
                        onChange={(e) => handleBulkChange(idx, 'ccProject', e.target.value)}
                        className="w-20 px-2 py-1 text-xs rounded-lg border border-pastel-200 font-bold"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <option key={n} value={`CC${n}`}>CC{n}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="Title"
                        value={row.title}
                        onChange={(e) => handleBulkChange(idx, 'title', e.target.value)}
                        className="w-36 px-2 py-1 text-xs rounded-lg border border-pastel-200"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => handleBulkChange(idx, 'date', e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-pastel-200"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="e.g. Marathon 2026"
                        value={row.meetingNo}
                        onChange={(e) => handleBulkChange(idx, 'meetingNo', e.target.value)}
                        className="w-28 px-2 py-1 text-xs rounded-lg border border-pastel-200"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="text"
                        placeholder="Evaluator"
                        value={row.evaluatorName}
                        onChange={(e) => handleBulkChange(idx, 'evaluatorName', e.target.value)}
                        className="w-28 px-2 py-1 text-xs rounded-lg border border-pastel-200"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-pastel-100">
            <button
              type="button"
              onClick={handleAddBulkRow}
              className="text-xs font-bold text-pastel-600 hover:text-pastel-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Row</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-mauve-600 hover:bg-pastel-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
              >
                Save All Speeches
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
