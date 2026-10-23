const mongoose = require('mongoose');

const backupPoolSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  type: {
    type: String,
    enum: ['speaker', 'roleplayer', 'both'],
    required: true
  },
  roles: [{
    type: String,
    enum: [
      'TMOD',
      'Ah-Counter',
      'Grammarian',
      'Timer',
      'General Evaluator',
      'Round Robin Master',
      'Table Topics Master',
      'Evaluator',
      'Prepared Speaker'
    ]
  }],
  priorityFlag: { type: Boolean, default: false }, // "first in line next meeting"
  status: {
    type: String,
    enum: ['available', 'assigned', 'declined', 'passed_over'],
    default: 'available'
  },
  reasonForStandby: { type: String, default: 'General Standby' }, // e.g. "Last-minute dropper relegated to backup", "Volunteer"
  addedAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('BackupPool', backupPoolSchema);
