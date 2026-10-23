import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { CuteCard } from '../components/CuteCard';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { ShieldAlert, Plus, Star, CheckCircle, Trash2, ArrowUpRight } from 'lucide-react';

export const BackupPoolPage = () => {
  const [pool, setPool] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    memberId: '',
    type: 'roleplayer',
    roles: ['Timer'],
    priorityFlag: true,
    reasonForStandby: 'Volunteer standby',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [poolRes, memRes] = await Promise.all([
        api.get('/members/standby/pool'),
        api.get('/members')
      ]);
      setPool(poolRes.data.data);
      setMembers(memRes.data.data);
    } catch (err) {
      console.error('Error fetching standby pool:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.memberId) return alert('Please select a member');
    try {
      await api.post('/members/standby/pool', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding to standby pool');
    }
  };

  const handleRemove = async (id) => {
    try {
      await api.delete(`/members/standby/pool/${id}`);
      fetchData();
    } catch (err) {
      alert('Could not remove member from standby pool');
    }
  };

  const handleRoleToggle = (role) => {
    if (formData.roles.includes(role)) {
      setFormData({ ...formData, roles: formData.roles.filter(r => r !== role) });
    } else {
      setFormData({ ...formData, roles: [...formData.roles, role] });
    }
  };

  const allPossibleRoles = [
    'Prepared Speaker',
    'TMOD',
    'Timer',
    'Ah-Counter',
    'Grammarian',
    'General Evaluator',
    'Round Robin Master',
    'Table Topics Master',
    'Evaluator'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 flex items-center gap-2">
            Standby & Backup Pool 🛡️
          </h1>
          <p className="text-xs text-mauve-500 dark:text-mauve-200 mt-1">
            Standby speakers and roleplayers ready to fill last-minute meeting cancellations smoothly
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              memberId: members[0]?._id || '',
              type: 'roleplayer',
              roles: ['Timer'],
              priorityFlag: true,
              reasonForStandby: 'Volunteer standby',
              notes: ''
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add to Standby Pool</span>
        </button>
      </div>

      {/* Standby Pool Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pool.map((item) => (
          <CuteCard
            key={item._id}
            ribbon={item.priorityFlag ? '🌟 1st in Line Next Meeting' : null}
            className="flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-mauve-900 dark:text-pastel-100 text-sm">
                    {item.memberId?.name}
                  </h3>
                  <p className="text-xs text-pastel-600 font-bold">
                    {item.memberId?.preferredName ? `“${item.memberId.preferredName}”` : item.memberId?.batch}
                  </p>
                </div>
                <Badge variant={item.type === 'speaker' ? 'pink' : item.type === 'both' ? 'purple' : 'default'}>
                  {item.type.toUpperCase()}
                </Badge>
              </div>

              <div className="mt-3 text-xs space-y-1 text-mauve-600 dark:text-mauve-200">
                <p>📱 WhatsApp: <span className="font-semibold text-mauve-900 dark:text-pastel-100">{item.memberId?.whatsapp || item.memberId?.contact || '—'}</span></p>
                <p>💡 Standby Reason: <span className="italic">{item.reasonForStandby}</span></p>
              </div>

              <div className="mt-3">
                <p className="text-[10px] uppercase font-bold text-mauve-500 mb-1.5">Roles Ready To Cover:</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.roles.map((r, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-pastel-50 text-pastel-700 border border-pastel-200">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-pastel-100 dark:border-darkpink-border">
              <span className="text-[10px] text-mauve-400">
                Added {new Date(item.createdAt).toLocaleDateString('en-GB')}
              </span>
              <button
                onClick={() => handleRemove(item._id)}
                className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </CuteCard>
        ))}

        {pool.length === 0 && (
          <div className="col-span-full p-8 text-center bg-white dark:bg-darkpink-card rounded-super border border-pastel-200 text-xs text-mauve-500">
            Standby pool is empty. Click “Add to Standby Pool” to register backup Gaveliers.
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Gavelier to Standby Pool"
        subtitle="Flag member as ready for emergency speaking or roleplaying duties"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-mauve-700 mb-1">Select Gavelier</label>
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
              <label className="block text-xs font-bold text-mauve-700 mb-1">Standby Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 bg-pastel-50/50 font-medium"
              >
                <option value="roleplayer">Roleplayer</option>
                <option value="speaker">Prepared Speaker</option>
                <option value="both">Both (Speaker & Roleplayer)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 mb-1">Reason for Standby</label>
              <input
                type="text"
                value={formData.reasonForStandby}
                onChange={(e) => setFormData({ ...formData, reasonForStandby: e.target.value })}
                placeholder="e.g. Volunteer standby, Dropped under 48h last time"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 bg-pastel-50/50 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-mauve-700 mb-1.5">Roles Willing to Perform</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {allPossibleRoles.map(role => (
                <label key={role} className="flex items-center gap-1.5 text-xs text-mauve-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="rounded text-pastel-500 focus:ring-pastel-400"
                  />
                  <span>{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="priorityFlag"
              checked={formData.priorityFlag}
              onChange={(e) => setFormData({ ...formData, priorityFlag: e.target.checked })}
              className="rounded text-pastel-500 focus:ring-pastel-400"
            />
            <label htmlFor="priorityFlag" className="text-xs font-bold text-mauve-700">
              🌟 Flag as "First in line next meeting" (highest priority)
            </label>
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
              Add to Pool
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
