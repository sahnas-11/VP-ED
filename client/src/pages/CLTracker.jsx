import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { CuteCard } from '../components/CuteCard';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { ExportDropdown } from '../components/ExportDropdown';
import { Award, Plus, Filter, CheckCircle2 } from 'lucide-react';

export const CLTracker = () => {
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    projectOrRole: 'Timer',
    date: new Date().toISOString().substring(0, 10),
    meetingNo: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [roleFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, memRes] = await Promise.all([
        api.get('/members/trackers/cl-records', {
          params: { projectOrRole: roleFilter !== 'all' ? roleFilter : undefined }
        }),
        api.get('/members')
      ]);
      setRecords(recRes.data.data);
      setMembers(memRes.data.data);
    } catch (err) {
      console.error('Error fetching CL records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.memberId) return alert('Please select a member');
    try {
      await api.post('/members/trackers/cl-records', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving record');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 flex items-center gap-2">
            General CL (Competent Leadership) Tracker 🏆
          </h1>
          <p className="text-xs text-mauve-500 dark:text-mauve-200 mt-1">
            Tracking meeting roles, tag team assignments, project evaluations, and leadership achievements
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportDropdown />
          <button
            onClick={() => {
              setFormData({
                memberId: members[0]?._id || '',
                projectOrRole: 'Timer',
                date: new Date().toISOString().substring(0, 10),
                meetingNo: '',
                notes: ''
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Leadership Role</span>
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-cute bg-white dark:bg-darkpink-card border border-pastel-100 dark:border-darkpink-border shadow-soft flex items-center gap-3">
        <Filter className="w-4 h-4 text-pastel-500" />
        <span className="text-xs font-bold text-mauve-700 dark:text-pastel-200">Role Filter:</span>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-1.5 text-xs rounded-xl border border-pastel-200 font-bold bg-pastel-50/50"
        >
          <option value="all">All Roles</option>
          <option value="TMOD">Toastmaster of the Day (TMOD)</option>
          <option value="Timer">Timer</option>
          <option value="Ah-Counter">Ah-Counter</option>
          <option value="Grammarian">Grammarian</option>
          <option value="General Evaluator">General Evaluator</option>
          <option value="Table Topics Master">Table Topics Master</option>
          <option value="Round Robin Master">Round Robin Master</option>
        </select>
      </div>

      {/* CL Records Table */}
      <CuteCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-pastel-100 bg-pastel-50/40 text-mauve-700">
                <th className="py-3 px-4 font-bold">Gavelier</th>
                <th className="py-3 px-4 font-bold">Role / Leadership Project</th>
                <th className="py-3 px-4 font-bold text-center">Meeting #</th>
                <th className="py-3 px-4 font-bold">Date Completed</th>
                <th className="py-3 px-4 font-bold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pastel-50">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-pastel-50/60 transition-colors font-medium">
                  <td className="py-3 px-4">
                    <span className="font-bold text-mauve-900">{r.memberId?.name || 'Member'}</span>
                    {r.memberId?.preferredName && (
                      <p className="text-[10px] text-mauve-500">“{r.memberId.preferredName}”</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="purple">{r.projectOrRole}</Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {r.meetingNo ? `#${r.meetingNo}` : '—'}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(r.date).toLocaleDateString('en-GB')}
                  </td>
                  <td className="py-3 px-4 text-mauve-500">
                    {r.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CuteCard>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Leadership Role"
        subtitle="Log a meeting role for Competent Leadership manual progress"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-mauve-700 mb-1">Select Member</label>
            <select
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 bg-pastel-50/50 font-medium"
            >
              <option value="">-- Choose Member --</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.preferredName || m.batch})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-mauve-700 mb-1">Role / Project</label>
              <select
                value={formData.projectOrRole}
                onChange={(e) => setFormData({ ...formData, projectOrRole: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 bg-pastel-50/50 font-medium"
              >
                <option value="TMOD">TMOD</option>
                <option value="Timer">Timer</option>
                <option value="Ah-Counter">Ah-Counter</option>
                <option value="Grammarian">Grammarian</option>
                <option value="General Evaluator">General Evaluator</option>
                <option value="Table Topics Master">Table Topics Master</option>
                <option value="Round Robin Master">Round Robin Master</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 mb-1">Meeting #</label>
              <input
                type="number"
                value={formData.meetingNo}
                onChange={(e) => setFormData({ ...formData, meetingNo: e.target.value })}
                placeholder="213"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 bg-pastel-50/50 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-mauve-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 bg-pastel-50/50 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-pastel-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-mauve-600 hover:bg-pastel-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
            >
              Save Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
