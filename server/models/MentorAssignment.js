const mongoose = require('mongoose');

const mentorAssignmentSchema = new mongoose.Schema({
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  menteeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true, unique: true },
  assignedAt: { type: Date, default: Date.now },
  history: [{
    previousMentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    changedAt: { type: Date, default: Date.now },
    reason: { type: String, default: 'Manual reassignment' }
  }],
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('MentorAssignment', mentorAssignmentSchema);
