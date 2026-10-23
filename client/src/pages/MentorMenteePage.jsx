import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { CuteCard } from '../components/CuteCard';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { ExportDropdown } from '../components/ExportDropdown';
import {
  HeartHandshake,
  UserPlus,
  RefreshCw,
  Sparkles,
  History,
  Phone,
  Mail,
  Award,
  ChevronRight,
  Upload
} from 'lucide-react';

export const MentorMenteePage = () => {
  const [mentorsData, setMentorsData] = useState([]);
  const [unassignedMentees, setUnassignedMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-Match & Reassign Modal State
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [suggestedMatch, setSuggestedMatch] = useState(null);
  const [selectedNewMentorId, setSelectedNewMentorId] = useState('');
  const [reassignReason, setReassignReason] = useState('Load balancing & mentoring support');

  // History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [activeHistory, setActiveHistory] = useState([]);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mentors/overview');
      setMentorsData(res.data.data);
      setUnassignedMentees(res.data.unassignedMentees || []);
    } catch (err) {
      console.error('Error fetching mentors overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReassign = async (mentee) => {
    setSelectedMentee(mentee);
    setIsReassignModalOpen(true);
    try {
      const matchRes = await api.get('/mentors/suggest-match');
      setSuggestedMatch(matchRes.data.suggestedMentor);
      if (matchRes.data.suggestedMentor) {
        setSelectedNewMentorId(matchRes.data.suggestedMentor.mentor._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveReassignment = async (e) => {
    e.preventDefault();
    if (!selectedMentee || !selectedNewMentorId) return;

    try {
      await api.post('/mentors/assign', {
        mentorId: selectedNewMentorId,
        menteeId: selectedMentee._id,
        reason: reassignReason
      });
      setIsReassignModalOpen(false);
      fetchMentors();
    } catch (err) {
      alert('Reassignment failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewHistory = (history) => {
    setActiveHistory(history || []);
    setHistoryModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 flex items-center gap-2">
            Mentor - Mentee Assignments 🤝🌸
          </h1>
          <p className="text-xs text-mauve-500 dark:text-mauve-200 mt-1">
            Real-time pairing tree, mentee CC progress tracking, load-balanced auto matching, and reassignments
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <ExportDropdown />
        </div>
      </div>

      {/* Unassigned Mentees Banner if any */}
      {unassignedMentees.length > 0 && (
        <div className="p-4 rounded-super bg-amber-50 dark:bg-amber-950/40 border border-amber-200 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {unassignedMentees.length} Unassigned Mentee(s) Waiting for Mentors
              </h3>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {unassignedMentees.map(m => (
              <button
                key={m._id}
                onClick={() => handleOpenReassign(m)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-darkpink-card border border-amber-200 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
              >
                <span>{m.preferredName || m.name}</span>
                <span className="text-[10px] text-amber-600 font-bold">Assign Mentor →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mentor Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mentorsData.map(({ mentor, mentees, currentMenteeCount, maxMentees }) => {
          const loadPercent = Math.min(100, Math.round((currentMenteeCount / maxMentees) * 100));

          return (
            <CuteCard
              key={mentor._id}
              className="flex flex-col justify-between"
              ribbon={`Load: ${currentMenteeCount}/${maxMentees}`}
            >
              <div>
                {/* Mentor Header */}
                <div className="flex items-start justify-between pb-3 border-b border-pastel-100 dark:border-darkpink-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pastel-400 to-pastel-600 flex items-center justify-center text-white font-extrabold text-base shadow-cute">
                      {mentor.preferredName ? mentor.preferredName[0] : mentor.name[0]}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-mauve-900 dark:text-pastel-100 text-base">
                        {mentor.name}
                      </h3>
                      <p className="text-xs text-pastel-600 font-bold">
                        “{mentor.preferredName}” • Senior Mentor
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-mauve-500 mt-1">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-pastel-500" /> {mentor.contact || mentor.whatsapp}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-pastel-500" /> {mentor.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Load Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-bold text-mauve-600 mb-1">
                    <span>Mentee Capacity</span>
                    <span>{loadPercent}% filled</span>
                  </div>
                  <div className="w-full bg-pastel-100 dark:bg-darkpink-hover h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        loadPercent >= 90 ? 'bg-amber-500' : 'bg-pastel-500'
                      }`}
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>
                </div>

                {/* Mentees List */}
                <div className="mt-4 space-y-2">
                  <p className="text-[11px] uppercase font-bold text-mauve-500 tracking-wider">
                    Assigned Mentees ({mentees.length}):
                  </p>
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {mentees.map(({ assignmentId, mentee, history }) => (
                      <div
                        key={assignmentId}
                        className="p-2.5 rounded-xl bg-pastel-50/50 dark:bg-darkpink-hover/40 hover:bg-pastel-100/70 dark:hover:bg-darkpink-hover transition-colors flex items-center justify-between text-xs font-medium"
                      >
                        <div>
                          <p className="font-bold text-mauve-900 dark:text-pastel-100">
                            {mentee.name} {mentee.preferredName ? `(${mentee.preferredName})` : ''}
                          </p>
                          <p className="text-[10px] text-mauve-500">
                            {mentee.contact} • {mentee.batch}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="pink">CC{mentee.ccLevel || 0}</Badge>
                          <button
                            onClick={() => handleOpenReassign(mentee)}
                            className="p-1 rounded-lg text-mauve-400 hover:text-pastel-600 hover:bg-white transition-colors"
                            title="Reassign Mentor"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          {history && history.length > 0 && (
                            <button
                              onClick={() => handleViewHistory(history)}
                              className="p-1 rounded-lg text-mauve-400 hover:text-purple-600 hover:bg-white transition-colors"
                              title="View Assignment History"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {mentees.length === 0 && (
                      <p className="text-xs text-mauve-400 italic py-2 text-center">
                        No mentees assigned yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CuteCard>
          );
        })}
      </div>

      {/* Reassign Mentor Modal */}
      <Modal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        title="Reassign Mentee to Mentor"
        subtitle={`Select a new mentor for ${selectedMentee?.preferredName || selectedMentee?.name}`}
      >
        <form onSubmit={handleSaveReassignment} className="space-y-4">
          {suggestedMatch && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pastel-100 to-blush border border-pastel-200 text-xs">
              <p className="font-bold text-pastel-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pastel-600" />
                Suggested Load-Balanced Mentor: {suggestedMatch.mentor.name}
              </p>
              <p className="text-[11px] text-mauve-600 mt-1">
                Currently mentoring {suggestedMatch.currentLoad} / {suggestedMatch.capacity} mentees ({suggestedMatch.availableSlots} slots open).
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-mauve-700 mb-1">Select Mentor</label>
            <select
              value={selectedNewMentorId}
              onChange={(e) => setSelectedNewMentorId(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 bg-pastel-50/50 font-bold"
            >
              <option value="">-- Choose Mentor --</option>
              {mentorsData.map(({ mentor, currentMenteeCount, maxMentees }) => (
                <option key={mentor._id} value={mentor._id}>
                  {mentor.name} ({currentMenteeCount}/{maxMentees} mentees)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-mauve-700 mb-1">Reason for Reassignment</label>
            <input
              type="text"
              required
              value={reassignReason}
              onChange={(e) => setReassignReason(e.target.value)}
              placeholder="e.g. Mentor workload adjustment, Batch alignment"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 bg-pastel-50/50 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-pastel-100">
            <button
              type="button"
              onClick={() => setIsReassignModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-mauve-600 hover:bg-pastel-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
            >
              Confirm Reassignment
            </button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="Assignment Change History"
        subtitle="Audit log of previous mentor reassignments"
      >
        <div className="space-y-3">
          {activeHistory.map((h, i) => (
            <div key={i} className="p-3 rounded-xl bg-pastel-50/60 border border-pastel-100 text-xs">
              <p className="font-bold text-mauve-900">
                Reason: {h.reason}
              </p>
              <p className="text-[10px] text-mauve-500 mt-1">
                Date: {new Date(h.changedAt).toLocaleString('en-GB')}
              </p>
            </div>
          ))}
          {activeHistory.length === 0 && (
            <p className="text-xs text-mauve-500 italic py-2 text-center">No previous reassignments.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};
