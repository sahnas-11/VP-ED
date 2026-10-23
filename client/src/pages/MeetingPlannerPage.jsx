import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosClient';
import { CuteCard } from '../components/CuteCard';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { ExportDropdown } from '../components/ExportDropdown';
import {
  FileText,
  Sparkles,
  Calendar,
  Users,
  Mic,
  Award,
  AlertTriangle,
  CheckCircle2,
  Download,
  Plus,
  Trash2,
  Clock,
  Send,
  ShieldAlert
} from 'lucide-react';
import confetti from 'canvas-confetti';

const ROLE_NAMES = [
  'TMOD',
  'Ah-Counter',
  'Grammarian',
  'Timer',
  'General Evaluator',
  'Round Robin Master',
  'Table Topics Master'
];

export const MeetingPlannerPage = () => {
  const [searchParams] = useSearchParams();
  const [meetings, setMeetings] = useState([]);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Recommendations modal
  const [isRecModalOpen, setIsRecModalOpen] = useState(false);
  const [activeRoleForRec, setActiveRoleForRec] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  // Role conflict warnings
  const [conflictWarnings, setConflictWarnings] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [meetingsRes, membersRes] = await Promise.all([
        api.get('/meetings'),
        api.get('/members')
      ]);

      const allMeetings = meetingsRes.data.data || [];
      setMeetings(allMeetings);
      setMembers(membersRes.data.data || []);

      const paramMeetingNo = searchParams.get('meetingNo');
      if (paramMeetingNo) {
        const found = allMeetings.find(m => m.meetingNo === parseInt(paramMeetingNo));
        setCurrentMeeting(found || allMeetings[0]);
      } else {
        setCurrentMeeting(allMeetings[0] || null);
      }
    } catch (err) {
      console.error('Error loading meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentMeeting) {
      checkConflicts();
    }
  }, [currentMeeting?.roleAssignments, currentMeeting?.preparedSpeeches]);

  const checkConflicts = async () => {
    if (!currentMeeting) return;
    try {
      const res = await api.post('/meetings/check-conflicts', {
        roleAssignments: currentMeeting.roleAssignments,
        preparedSpeeches: currentMeeting.preparedSpeeches
      });
      setConflictWarnings(res.data.warnings || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = (roleName, memberId) => {
    const assignments = [...(currentMeeting.roleAssignments || [])];
    const index = assignments.findIndex(r => r.role === roleName);
    if (index >= 0) {
      assignments[index] = { ...assignments[index], memberId: memberId || null, status: memberId ? 'confirmed' : 'invited' };
    } else {
      assignments.push({ role: roleName, memberId: memberId || null, status: 'confirmed' });
    }
    setCurrentMeeting({ ...currentMeeting, roleAssignments: assignments });
  };

  const handleRoleStatusChange = (roleName, newStatus) => {
    const assignments = (currentMeeting.roleAssignments || []).map(r => {
      if (r.role === roleName) {
        return { ...r, status: newStatus };
      }
      return r;
    });
    setCurrentMeeting({ ...currentMeeting, roleAssignments: assignments });
  };

  const handleAddPreparedSpeech = () => {
    const speeches = [
      ...(currentMeeting.preparedSpeeches || []),
      { speakerId: null, ccProject: 'CC1', title: '', evaluatorId: null, status: 'confirmed' }
    ];
    setCurrentMeeting({ ...currentMeeting, preparedSpeeches: speeches });
  };

  const handleSpeechChange = (idx, field, value) => {
    const speeches = [...(currentMeeting.preparedSpeeches || [])];
    speeches[idx] = { ...speeches[idx], [field]: value };
    setCurrentMeeting({ ...currentMeeting, preparedSpeeches: speeches });
  };

  const handleRemoveSpeech = (idx) => {
    const speeches = (currentMeeting.preparedSpeeches || []).filter((_, i) => i !== idx);
    setCurrentMeeting({ ...currentMeeting, preparedSpeeches: speeches });
  };

  // Open Smart Recommendations Modal for a role
  const handleOpenRecommendations = async (role) => {
    setActiveRoleForRec(role);
    setIsRecModalOpen(true);
    setRecLoading(true);
    try {
      const res = await api.get('/meetings/recommendations', { params: { role } });
      setRecommendations(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setRecLoading(false);
    }
  };

  const handleSelectRecommendedMember = (memberId) => {
    handleRoleChange(activeRoleForRec, memberId);
    setIsRecModalOpen(false);
  };

  // Save Meeting Planner Edits
  const handleSaveMeeting = async () => {
    if (!currentMeeting) return;
    try {
      setSaving(true);
      const res = await api.put(`/meetings/${currentMeeting._id}`, currentMeeting);
      setCurrentMeeting(res.data.data);
      alert('✨ Meeting plan saved successfully!');
    } catch (err) {
      alert('Error saving meeting: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Mark Completed & Sync Trackers
  const handleMarkCompletedAndSync = async () => {
    if (!currentMeeting) return;
    if (confirm(`Mark Meeting #${currentMeeting.meetingNo} as Completed and auto-sync all CC speeches and CL records to member profiles?`)) {
      try {
        await api.post(`/meetings/${currentMeeting._id}/sync-trackers`);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 8000);
      } catch (err) {
        alert('Sync error: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pastel-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Meeting Picker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 flex items-center gap-2">
            Meeting-Day Planner & Agenda 📋🌸
          </h1>
          <p className="text-xs text-mauve-500 dark:text-mauve-200 mt-1">
            213th Educational Meeting template, smart role recommendations, clash warnings, and 1-click sync
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={currentMeeting?._id || ''}
            onChange={(e) => {
              const selected = meetings.find(m => m._id === e.target.value);
              setCurrentMeeting(selected);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-white dark:bg-darkpink-card font-bold text-mauve-900 dark:text-pastel-100 shadow-sm"
          >
            {meetings.map(m => (
              <option key={m._id} value={m._id}>
                Meeting #{m.meetingNo} — {m.theme} ({new Date(m.date).toLocaleDateString('en-GB')})
              </option>
            ))}
          </select>

          <ExportDropdown meetingId={currentMeeting?._id} />

          <button
            onClick={handleSaveMeeting}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Meeting Plan'}</span>
          </button>
        </div>
      </div>

      {/* Sync Success Alert Banner */}
      {syncSuccess && (
        <div className="p-4 rounded-super bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <Sparkles className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span>🎉 Hooray! All completed roles and CC speeches from Meeting #{currentMeeting?.meetingNo} have been automatically credited to members' CC & CL profiles!</span>
        </div>
      )}

      {/* Role Conflict Warnings */}
      {conflictWarnings.length > 0 && (
        <div className="p-4 rounded-cute bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Role Overlap Warning:
          </p>
          {conflictWarnings.map((w, idx) => (
            <p key={idx} className="pl-5">• {w}</p>
          ))}
        </div>
      )}

      {/* Meeting Details Bar */}
      <CuteCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-mauve-700 dark:text-pastel-200 mb-1">
              Meeting Number
            </label>
            <input
              type="number"
              value={currentMeeting?.meetingNo || 213}
              onChange={(e) => setCurrentMeeting({ ...currentMeeting, meetingNo: parseInt(e.target.value) })}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-mauve-700 dark:text-pastel-200 mb-1">
              Theme
            </label>
            <input
              type="text"
              value={currentMeeting?.theme || ''}
              onChange={(e) => setCurrentMeeting({ ...currentMeeting, theme: e.target.value })}
              placeholder="e.g. Formula 1"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-mauve-700 dark:text-pastel-200 mb-1">
              Word of the Day
            </label>
            <input
              type="text"
              value={currentMeeting?.wordOfTheDay || ''}
              onChange={(e) => setCurrentMeeting({ ...currentMeeting, wordOfTheDay: e.target.value })}
              placeholder="e.g. Velocity"
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-mauve-700 dark:text-pastel-200 mb-1">
              Venue
            </label>
            <input
              type="text"
              value={currentMeeting?.venue || 'SLIIT Malabe F404'}
              onChange={(e) => setCurrentMeeting({ ...currentMeeting, venue: e.target.value })}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
            />
          </div>
        </div>
      </CuteCard>

      {/* Main Roles Table */}
      <CuteCard
        title="Meeting Role Assignments"
        subtitle="Click 'Suggest' to find fresh candidates who haven't done that role recently"
        icon={Users}
      >
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-pastel-100 text-mauve-700 dark:text-pastel-200">
                <th className="py-2.5 px-3 font-bold">Role</th>
                <th className="py-2.5 px-3 font-bold">Assigned Gavelier</th>
                <th className="py-2.5 px-3 font-bold">Smart Recommendation</th>
                <th className="py-2.5 px-3 font-bold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pastel-50">
              {ROLE_NAMES.map(role => {
                const assigned = (currentMeeting?.roleAssignments || []).find(r => r.role === role);
                const currentMemberId = assigned?.memberId?._id || assigned?.memberId || '';

                return (
                  <tr key={role} className="hover:bg-pastel-50/50">
                    <td className="py-3 px-3 font-bold text-mauve-900 dark:text-pastel-100">
                      {role}
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={currentMemberId}
                        onChange={(e) => handleRoleChange(role, e.target.value)}
                        className="w-56 px-2.5 py-1.5 text-xs rounded-xl border border-pastel-200 font-bold bg-white text-mauve-900"
                      >
                        <option value="">-- Unassigned (TBD) --</option>
                        {members.map(m => (
                          <option key={m._id} value={m._id}>
                            {m.name} ({m.preferredName || m.batch})
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleOpenRecommendations(role)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-pastel-600 hover:text-pastel-700 underline"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Find Best Match</span>
                      </button>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <select
                        value={assigned?.status || 'invited'}
                        onChange={(e) => handleRoleStatusChange(role, e.target.value)}
                        className="px-2 py-1 text-xs rounded-lg border border-pastel-200 font-bold"
                      >
                        <option value="invited">Invited</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="backup_needed">Backup Needed ⚠️</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CuteCard>

      {/* Prepared Speakers Table (Reproducing 213th Agenda Structure) */}
      <CuteCard
        title="Prepared Speeches & Evaluators"
        subtitle="CC Project number, speech title, speaker, and speech evaluator pairings"
        icon={Mic}
        action={
          <button
            onClick={handleAddPreparedSpeech}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-pastel-100 text-pastel-700 hover:bg-pastel-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Speaker Slot</span>
          </button>
        }
      >
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-pastel-100 text-mauve-700">
                <th className="py-2.5 px-3 font-bold">Speaker</th>
                <th className="py-2.5 px-3 font-bold text-center">Project</th>
                <th className="py-2.5 px-3 font-bold">Speech Title</th>
                <th className="py-2.5 px-3 font-bold">Evaluator</th>
                <th className="py-2.5 px-3 font-bold text-center">Status</th>
                <th className="py-2.5 px-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pastel-50">
              {(currentMeeting?.preparedSpeeches || []).map((ps, idx) => {
                const speakerId = ps.speakerId?._id || ps.speakerId || '';
                const evaluatorId = ps.evaluatorId?._id || ps.evaluatorId || '';

                return (
                  <tr key={idx} className="hover:bg-pastel-50/50">
                    <td className="py-3 px-3">
                      <select
                        value={speakerId}
                        onChange={(e) => handleSpeechChange(idx, 'speakerId', e.target.value)}
                        className="w-48 px-2.5 py-1 text-xs rounded-xl border border-pastel-200 font-bold"
                      >
                        <option value="">Select Speaker</option>
                        {members.map(m => (
                          <option key={m._id} value={m._id}>{m.preferredName || m.name}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <select
                        value={ps.ccProject || 'CC1'}
                        onChange={(e) => handleSpeechChange(idx, 'ccProject', e.target.value)}
                        className="w-20 px-2 py-1 text-xs rounded-xl border border-pastel-200 font-bold text-center"
                      >
                        {[1,2,3,4,5,6,7,8,9,10].map(n => (
                          <option key={n} value={`CC${n}`}>CC{n}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={ps.title || ''}
                        onChange={(e) => handleSpeechChange(idx, 'title', e.target.value)}
                        placeholder="e.g. Pedal to the Metal"
                        className="w-48 px-2.5 py-1 text-xs rounded-xl border border-pastel-200 font-medium"
                      />
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={evaluatorId}
                        onChange={(e) => handleSpeechChange(idx, 'evaluatorId', e.target.value)}
                        className="w-48 px-2.5 py-1 text-xs rounded-xl border border-pastel-200 font-bold"
                      >
                        <option value="">Select Evaluator</option>
                        {members.map(m => (
                          <option key={m._id} value={m._id}>{m.preferredName || m.name}</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <Badge variant={ps.status === 'completed' ? 'success' : 'pink'}>
                        {ps.status || 'confirmed'}
                      </Badge>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleRemoveSpeech(idx)}
                        className="p-1.5 text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CuteCard>

      {/* Post-Meeting Wrapup & Sync Action Banner */}
      <div className="p-6 rounded-super bg-gradient-to-r from-pastel-100 via-blush to-pastel-50 border border-pastel-200 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-mauve-900">
            Post-Meeting Educational Wrap-up 🌸
          </h3>
          <p className="text-xs text-mauve-600 mt-0.5">
            After the meeting, click here to automatically credit all speeches to the CC Tracker and roles to the CL Tracker!
          </p>
        </div>

        <button
          onClick={handleMarkCompletedAndSync}
          className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-cute transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Mark Completed & Sync Trackers</span>
        </button>
      </div>

      {/* Recommendations Modal */}
      <Modal
        isOpen={isRecModalOpen}
        onClose={() => setIsRecModalOpen(false)}
        title={`Smart Recommendations for ${activeRoleForRec}`}
        subtitle="Ranked by member suitability, reliability score, and time elapsed since last performing this role"
      >
        <div className="space-y-2">
          {recLoading ? (
            <div className="p-6 text-center text-xs text-mauve-500">Calculating recommendations...</div>
          ) : (
            recommendations.slice(0, 8).map(({ member, suitabilityScore, reason, reliabilityScore }, i) => (
              <div
                key={member._id}
                className="p-3 rounded-2xl bg-pastel-50/60 border border-pastel-100 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-mauve-900">
                    {member.name} {member.preferredName ? `(${member.preferredName})` : ''}
                  </p>
                  <p className="text-[11px] text-mauve-500 mt-0.5">{reason}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="success">Reliability: {reliabilityScore}%</Badge>
                  <button
                    onClick={() => handleSelectRecommendedMember(member._id)}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-pastel-500 text-white hover:bg-pastel-600 shadow-sm"
                  >
                    Assign Role
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
