import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import { CuteCard } from '../components/CuteCard';
import { Modal } from '../components/Modal';
import { Badge } from '../components/Badge';
import { ExportDropdown } from '../components/ExportDropdown';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Upload,
  Star,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('name');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    preferredName: '',
    contact: '',
    email: '',
    batch: 'Y1',
    faculty: 'Computing',
    status: 'active',
    isMentor: false,
    ccLevel: 0,
    clProgress: 0,
    activityScore: 60,
    reliabilityScore: 100
  });

  // Excel Upload State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [search, statusFilter, sortField]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/members', {
        params: { search, status: statusFilter, sort: sortField }
      });
      setMembers(res.data.data);
    } catch (err) {
      console.error('Error fetching members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      preferredName: '',
      contact: '',
      email: '',
      batch: 'Y1',
      faculty: 'Computing',
      status: 'active',
      isMentor: false,
      ccLevel: 0,
      clProgress: 0,
      activityScore: 60,
      reliabilityScore: 100
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m) => {
    setEditingMember(m);
    setFormData({
      name: m.name,
      preferredName: m.preferredName || '',
      contact: m.contact || m.whatsapp || '',
      email: m.email || '',
      batch: m.batch || 'Y1',
      faculty: m.faculty || 'Computing',
      status: m.status || 'active',
      isMentor: !!m.isMentor,
      ccLevel: m.ccLevel || 0,
      clProgress: m.clProgress || 0,
      activityScore: m.activityScore || 60,
      reliabilityScore: m.reliabilityScore || 100
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await api.put(`/members/${editingMember._id}`, formData);
      } else {
        await api.post('/members', formData);
      }
      setIsModalOpen(false);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving member');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to remove this member?')) {
      try {
        await api.delete(`/members/${id}`);
        fetchMembers();
      } catch (err) {
        alert('Could not delete member');
      }
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return alert('Please select an Excel file');

    try {
      setUploading(true);
      const data = new FormData();
      data.append('file', uploadFile);
      const res = await api.post('/members/import-excel', data);
      alert(res.data.message);
      setIsImportModalOpen(false);
      fetchMembers();
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-mauve-900 dark:text-pastel-100 flex items-center gap-2">
            Members Roster & Trackers 🌸
          </h1>
          <p className="text-xs text-mauve-500 dark:text-mauve-200 mt-1">
            Complete member records, CC & CL levels, activity & reliability scores, and mentor pairings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <ExportDropdown />
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-darkpink-card text-mauve-800 dark:text-pastel-200 border border-pastel-200 dark:border-darkpink-border hover:bg-pastel-50 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-pastel-500" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-cute bg-white dark:bg-darkpink-card border border-pastel-100 dark:border-darkpink-border shadow-soft flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-mauve-400" />
          <input
            type="text"
            placeholder="Search by full name, preferred name, email, or WhatsApp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium text-mauve-900 dark:text-pastel-100 focus:outline-none focus:ring-2 focus:ring-pastel-400"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-bold text-mauve-700 dark:text-pastel-200"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Members</option>
            <option value="new">New Members</option>
            <option value="inactive">Inactive</option>
            <option value="alumni">Alumni</option>
          </select>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-bold text-mauve-700 dark:text-pastel-200"
          >
            <option value="name">Sort by Name</option>
            <option value="activityScore">Sort by Activity Score</option>
            <option value="reliabilityScore">Sort by Reliability</option>
            <option value="ccLevel">Sort by CC Level</option>
            <option value="lastActive">Sort by Last Active</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <CuteCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-pastel-100 dark:border-darkpink-border bg-pastel-50/40 dark:bg-darkpink-hover text-mauve-700 dark:text-pastel-200">
                <th className="py-3 px-4 font-bold">Member Name</th>
                <th className="py-3 px-4 font-bold">Contact & Email</th>
                <th className="py-3 px-4 font-bold">Faculty / Batch</th>
                <th className="py-3 px-4 font-bold">Mentor</th>
                <th className="py-3 px-4 font-bold text-center">CC Level</th>
                <th className="py-3 px-4 font-bold text-center">CL Progress</th>
                <th className="py-3 px-4 font-bold text-center">Activity</th>
                <th className="py-3 px-4 font-bold text-center">Reliability</th>
                <th className="py-3 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pastel-50 dark:divide-darkpink-border">
              {members.map((m) => (
                <tr key={m._id} className="hover:bg-pastel-50/60 dark:hover:bg-darkpink-hover/60 transition-colors font-medium">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-mauve-900 dark:text-pastel-100">
                        {m.name}
                      </span>
                      {m.isMentor && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          Mentor
                        </span>
                      )}
                      {m.isDependableBadge && (
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" title="Dependable Member" />
                      )}
                    </div>
                    {m.preferredName && (
                      <p className="text-[11px] text-mauve-500">“{m.preferredName}”</p>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <p className="text-mauve-900 dark:text-pastel-200 font-semibold">{m.contact || m.whatsapp || '—'}</p>
                    <p className="text-[10px] text-mauve-500">{m.email || '—'}</p>
                  </td>

                  <td className="py-3 px-4">
                    <p className="text-mauve-800 dark:text-pastel-200">{m.faculty || 'Computing'}</p>
                    <p className="text-[10px] text-pastel-600 font-bold">{m.batch || 'Y1'}</p>
                  </td>

                  <td className="py-3 px-4">
                    {m.mentorId ? (
                      <span className="font-semibold text-pastel-700 dark:text-pastel-300">
                        {m.mentorId.preferredName || m.mentorId.name}
                      </span>
                    ) : m.isMentor ? (
                      <span className="text-xs text-purple-600 font-bold">Mentor Roster</span>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">Unassigned</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Badge variant={m.ccLevel >= 5 ? 'pink' : 'default'}>
                      CC{m.ccLevel || 0}
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Badge variant="purple">
                      CL {m.clProgress || 0}/10
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="font-extrabold text-mauve-900 dark:text-pastel-100">
                      {m.activityScore || 50}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <Badge variant={(m.reliabilityScore || 100) >= 90 ? 'success' : 'danger'}>
                      {m.reliabilityScore || 100}%
                    </Badge>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 rounded-lg text-mauve-600 hover:text-pastel-600 hover:bg-pastel-100 dark:hover:bg-darkpink-hover transition-colors"
                        title="Edit Member"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CuteCard>

      {/* Edit / Add Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? 'Edit Member Details' : 'Add New Gavelier'}
        subtitle="Manage contact information, batch, CC progress, and scores"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Name"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Preferred / Nickname
              </label>
              <input
                type="text"
                value={formData.preferredName}
                onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                placeholder="Preferred Name"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                WhatsApp / Contact Number
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="07X XXX XXXX"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="it25...@my.sliit.lk"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Batch
              </label>
              <select
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              >
                <option value="Y1">Y1</option>
                <option value="Y2">Y2</option>
                <option value="Y3">Y3</option>
                <option value="Y4">Y4</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Faculty
              </label>
              <select
                value={formData.faculty}
                onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              >
                <option value="Computing">Faculty of Computing</option>
                <option value="Engineering">Faculty of Engineering</option>
                <option value="Business">SLIIT Business School</option>
                <option value="Humanities">Humanities & Sciences</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              >
                <option value="active">Active</option>
                <option value="new">New</option>
                <option value="inactive">Inactive</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                CC Level (0 - 10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.ccLevel}
                onChange={(e) => setFormData({ ...formData, ccLevel: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-mauve-700 dark:text-pastel-200 mb-1">
                CL Progress (0 - 10)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.clProgress}
                onChange={(e) => setFormData({ ...formData, clProgress: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-pastel-200 dark:border-darkpink-border bg-pastel-50/50 dark:bg-darkpink-hover font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isMentor"
              checked={formData.isMentor}
              onChange={(e) => setFormData({ ...formData, isMentor: e.target.checked })}
              className="rounded text-pastel-500 focus:ring-pastel-400"
            />
            <label htmlFor="isMentor" className="text-xs font-bold text-mauve-700 dark:text-pastel-200">
              Designate as Mentor (available in Mentor-Mentee matching system)
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-pastel-100 dark:border-darkpink-border">
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
              Save Member
            </button>
          </div>
        </form>
      </Modal>

      {/* Import Excel Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Members from Excel / CSV"
        subtitle="Upload spreadsheet with columns: Name, Email, Contact, Batch, Faculty"
      >
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div className="p-6 border-2 border-dashed border-pastel-300 dark:border-darkpink-border rounded-super text-center bg-pastel-50/40 dark:bg-darkpink-hover">
            <Upload className="w-8 h-8 text-pastel-500 mx-auto mb-2" />
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="block w-full text-xs text-mauve-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-pastel-500 file:text-white hover:file:bg-pastel-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-mauve-600 hover:bg-pastel-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-pastel-500 hover:bg-pastel-600 text-white shadow-cute transition-all"
            >
              {uploading ? 'Processing...' : 'Upload & Import'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
