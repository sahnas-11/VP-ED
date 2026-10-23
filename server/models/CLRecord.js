const mongoose = require('mongoose');

const clRecordSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  projectOrRole: { type: String, required: true }, // e.g. 'TMOD', 'Timer', 'Ah-Counter', 'Grammarian', 'General Evaluator', 'Table Topics Master', 'Round Robin Master', 'Event Chair'
  date: { type: Date, required: true },
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', default: null },
  meetingNo: { type: Number, default: null },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('CLRecord', clRecordSchema);
