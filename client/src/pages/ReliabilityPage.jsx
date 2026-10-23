import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { CuteCard } from '../components/CuteCard';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import {
  UserCheck,
  Star,
  Copy,
  Check,
  AlertTriangle,
  MessageCircle,
  ShieldAlert,
  Send,
  Heart
} from 'lucide-react';

export const ReliabilityPage = () => {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [cancelData, setCancelData] = useState({
    meetingId: '',
    role: 'Timer',
    isUnder48h: true,
    reason: 'Sudden university assignment conflict'
  });

  // WhatsApp Templates Modal
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [templates, setTemplates] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [relRes, meetRes] = await Promise.all([
        api.get('/reliability/scores'),
        api.get('/meetings')
      ]);
      setData(relRes.data.data);
      setStats(relRes.data.stats);
      setMeetings(meetRes.data.data || []);
      if (meetRes.data.data && meetRes.data.data.length > 0) {
        setCancelData(prev => ({ ...prev, meetingId: meetRes.data.data[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching reliability data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBadge = async (memberId) => {
    try {
      const res = await api.post(`/reliability/${memberId}/toggle-badge`);
      setData(prev => prev.map(m => m._id === memberId ? { ...m, isDependableBadge: res.data.isDependableBadge } : m));
    } catch (err) {
      alert('Could not toggle badge');
    }
  };

  const handleOpenCancellation = (member) => {
    setSelectedMember(member);
    setIsCancelModalOpen(true);
  };

  const handleProcessCancellation = async (e) => {
    e.preventDefault();
    if (!selectedMember || !cancelData.meetingId) return;

    try {
      const res = await api.post('/reliability/cancel-role', {
        memberId: selectedMember._id,
        meetingId: cancelData.meetingId,
        role: cancelData.role,
        isUnder48h: cancelData.isUnder48h,
        reason: cancelData.reason
      });
      alert(res.data.message);
      setIsCancelModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Cancellation processing error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenWhatsApp = async (member) => {
    setSelectedMember(member);
    try {
      const res = await api.get('/reliability/whatsapp-templates', {
        params: {
          memberId: member._id,
          meetingId: meetings[0]?._id,
          role: 'Assigned Role'
        }
      });
      setTemplates(res.data.templates);
      setIsWhatsAppModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 flex items-center gap-2">
            Reliability & Gentle Cancellations 💖
          </h1>
          <p className="text-xs text-mauve-500 dark:text-mauve-200 mt-1">
            Private exco scores, 3-day WhatsApp confirmation reminders, and automatic relegation to priority backup on late drops
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <CuteCard>
          <p className="text-xs font-semibold text-mauve-500">Club Average Reliability</p>
          <p className="text-2xl font-extrabold text-pastel-600 mt-1">
            {stats?.averageReliability || 95}%
          </p>
          <p className="text-[10px] text-mauve-500 mt-0.5">High club-wide commitment</p>
        </CuteCard>

        <CuteCard>
          <p className="text-xs font-semibold text-mauve-500">Dependable Member Stars 🌟</p>
          <p className="text-2xl font-extrabold text-amber-500 mt-1">
            {stats?.dependableCount || 0} Gaveliers
          </p>
          <p className="text-[10px] text-mauve-500 mt-0.5">Eligible for social media shoutouts</p>
        </CuteCard>

        <CuteCard>
          <p className="text-xs font-semibold text-mauve-500">Late Droppers (&lt;48h)</p>
          <p className="text-2xl font-extrabold text-rose-500 mt-1">
            {stats?.highRiskCount || 0}
          </p>
          <p className="text-[10px] text-mauve-500 mt-0.5">Relegated to priority standby</p>
        </CuteCard>
      </div>

      {/* Members Reliability Table */}
      <CuteCard className="overflow-hidden p-0" title="Private Exco Reliability Roster" subtitle="Confidential metrics for meeting role allocation" icon={UserCheck}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-pastel-100 bg-pastel-50/40 text-mauve-700">
                <th className="py-3 px-4 font-bold">Member</th>
                <th className="py-3 px-4 font-bold">Contact</th>
                <th className="py-3 px-4 font-bold text-center">Completed Roles</th>
                <th className="py-3 px-4 font-bold text-center">Late Drops (&lt;48h)</th>
                <th className="py-3 px-4 font-bold text-center">Reliability Score</th>
                <th className="py-3 px-4 font-bold text-center">Dependable Badge</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pastel-50">
              {data.map((m) => (
                <tr key={m._id} className="hover:bg-pastel-50/60 transition-colors font-medium">
                  <td className="py-3 px-4">
                    <span className="font-bold text-mauve-900">{m.name}</span>
                    {m.preferredName && <p className="text-[10px] text-mauve-500">“{m.preferredName}”</p>}
                  </td>

                  <td className="py-3 px-4 text-mauve-600">
                    {m.whatsapp || m.contact || '—'}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Badge variant="success">{m.rolesCompletedCount || 0} Done</Badge>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${m.dropsUnder48hCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                      {m.dropsUnder48hCount || 0}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="font-extrabold text-sm text-pastel-600">
                      {m.reliabilityScore || 100}%
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleBadge(m._id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                        m.isDependableBadge
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-amber-50'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${m.isDependableBadge ? 'text-amber-500 fill-amber-500' : ''}`} />
                      <span>{m.isDependableBadge ? 'Dependable' : 'Give Star'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenWhatsApp(m)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-pastel-100 text-pastel-700 hover:bg-pastel-200 transition-colors flex items-center gap-1"
                        title="Copy WhatsApp Message"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Nudge 💌</span>
                      </button>

                      <button
                        onClick={() => handleOpenCancellation(m)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                        title="Process Cancellation"
                      >
                        Cancel Role
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CuteCard>

      {/* Cancellation Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Process Cancellation (Kind but Effective)"
        subtitle={`Handling drop-out for ${selectedMember?.name}`}
      >
        <form onSubmit={handleProcessCancellation} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-mauve-700 mb-1">Select Meeting</label>
            <select
              value={cancelData.meetingId}
              onChange={(e) => setCancelData({ ...cancelData, meetingId: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 bg-pastel-50/50 font-bold"
            >
              {meetings.map(m => (
                <option key={m._id} value={m._id}>Meeting #{m.meetingNo} — {m.theme}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-mauve-700 mb-1">Role Dropped</label>
              <select
                value={cancelData.role}
                onChange={(e) => setCancelData({ ...cancelData, role: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 bg-pastel-50/50 font-bold"
              >
                <option value="Timer">Timer</option>
                <option value="Ah-Counter">Ah-Counter</option>
                <option value="Grammarian">Grammarian</option>
                <option value="TMOD">TMOD</option>
                <option value="General Evaluator">General Evaluator</option>
                <option value="Table Topics Master">Table Topics Master</option>
                <option value="Round Robin Master">Round Robin Master</option>
                <option value="Prepared Speaker">Prepared Speaker</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 mb-1">Timing of Notice</label>
              <select
                value={cancelData.isUnder48h ? 'under48' : 'advance'}
                onChange={(e) => setCancelData({ ...cancelData, isUnder48h: e.target.value === 'under48' })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 bg-pastel-50/50 font-bold"
              >
                <option value="under48">⚠️ Under 48 hours notice (Late Drop)</option>
                <option value="advance">✨ Advance notice (&gt;48 hours)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-mauve-700 mb-1">Reason</label>
            <input
              type="text"
              required
              value={cancelData.reason}
              onChange={(e) => setCancelData({ ...cancelData, reason: e.target.value })}
              placeholder="e.g. Exam assignment deadline, unwell"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 bg-pastel-50/50 font-medium"
            />
          </div>

          {cancelData.isUnder48h && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Gentle Policy Applied:
              </p>
              <p className="mt-1">
                Reliability adjusted by -15 points. Member is automatically moved to the Standby Backup Pool with "First in line next meeting" priority so they get a chance to make it up!
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-pastel-100">
            <button
              type="button"
              onClick={() => setIsCancelModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-mauve-600 hover:bg-pastel-50 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-cute transition-all"
            >
              Confirm Cancellation
            </button>
          </div>
        </form>
      </Modal>

      {/* WhatsApp Templates Modal */}
      <Modal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        maxWidth="max-w-3xl"
        title="WhatsApp Message Templates 💬🌸"
        subtitle={`Warm, cute, and ready to send to ${selectedMember?.name}`}
      >
        <div className="space-y-4">
          {templates && (
            <>
              {/* Template 1: 3-Days Before Confirmation Reminder */}
              <div className="p-4 rounded-2xl bg-pastel-50/80 border border-pastel-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pastel-700">
                    1. 3-Days Before Confirmation Reminder (Warm & Cute)
                  </span>
                  <button
                    onClick={() => copyToClipboard(templates.confirmationReminder, 'confirm')}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-pastel-500 text-white hover:bg-pastel-600 shadow-sm"
                  >
                    {copiedKey === 'confirm' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'confirm' ? 'Copied! ✨' : 'Copy Text'}</span>
                  </button>
                </div>
                <pre className="text-xs whitespace-pre-wrap font-sans text-mauve-900 bg-white p-3 rounded-xl border border-pastel-100">
                  {templates.confirmationReminder}
                </pre>
              </div>

              {/* Template 2: Cancel Early Nudge */}
              <div className="p-4 rounded-2xl bg-pastel-50/80 border border-pastel-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pastel-700">
                    2. "Cancel Early" Polite Nudge
                  </span>
                  <button
                    onClick={() => copyToClipboard(templates.earlyCancelNudge, 'nudge')}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-pastel-500 text-white hover:bg-pastel-600 shadow-sm"
                  >
                    {copiedKey === 'nudge' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'nudge' ? 'Copied! ✨' : 'Copy Text'}</span>
                  </button>
                </div>
                <pre className="text-xs whitespace-pre-wrap font-sans text-mauve-900 bg-white p-3 rounded-xl border border-pastel-100">
                  {templates.earlyCancelNudge}
                </pre>
              </div>

              {/* Template 3: Dependable Member Shoutout */}
              <div className="p-4 rounded-2xl bg-pastel-50/80 border border-pastel-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-700">
                    3. Dependable Member Social Shoutout 🌟
                  </span>
                  <button
                    onClick={() => copyToClipboard(templates.dependableShoutout, 'shoutout')}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                  >
                    {copiedKey === 'shoutout' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'shoutout' ? 'Copied! ✨' : 'Copy Text'}</span>
                  </button>
                </div>
                <pre className="text-xs whitespace-pre-wrap font-sans text-mauve-900 bg-white p-3 rounded-xl border border-pastel-100">
                  {templates.dependableShoutout}
                </pre>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
