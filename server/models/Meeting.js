const mongoose = require('mongoose');

const roleAssignmentSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    enum: [
      'TMOD',
      'Ah-Counter',
      'Grammarian',
      'Timer',
      'General Evaluator',
      'Round Robin Master',
      'Table Topics Master',
      'Word Master'
    ]
  },
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
  status: {
    type: String,
    enum: ['invited', 'confirmed', 'backup_needed', 'cancelled', 'completed'],
    default: 'invited'
  },
  confirmedAt: { type: Date, default: null },
  notes: { type: String, default: '' }
}, { _id: false });

const preparedSpeechSchema = new mongoose.Schema({
  speakerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
  ccProject: { type: String, default: 'CC1' }, // CC1-CC10
  title: { type: String, default: 'Untitled' },
  evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
  status: {
    type: String,
    enum: ['confirmed', 'backup_needed', 'cancelled', 'completed'],
    default: 'confirmed'
  },
  notes: { type: String, default: '' }
}, { _id: false });

const meetingSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  meetingNo: { type: Number, required: true },
  theme: { type: String, default: 'General Educational Meeting' },
  date: { type: Date, required: true },
  startTime: { type: String, default: '02:00 PM' },
  fellowshipTime: { type: String, default: '01:30 PM' },
  endTime: { type: String, default: '04:30 PM' },
  venue: { type: String, default: 'SLIIT Malabe F404' },
  wordOfTheDay: { type: String, default: 'Resilience' },
  wordMeaning: { type: String, default: 'The capacity to withstand or recover quickly from difficulties.' },
  roleAssignments: [roleAssignmentSchema],
  preparedSpeeches: [preparedSpeechSchema],
  tableTopicsEvaluators: [{
    evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }
  }],
  awards: [{
    category: {
      type: String,
      enum: ['Best Speaker', 'Best Table Topics Speaker', 'Best Evaluator', 'Best Roleplayer']
    },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null }
  }],
  timeline: [{
    time: { type: String },
    item: { type: String },
    role: { type: String },
    durationMin: { type: Number, default: 5 }
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'completed', 'cancelled'],
    default: 'draft'
  },
  excoSnapshot: {
    president: { name: String, phone: String, email: String },
    vpe: { name: String, phone: String, email: String },
    vpm: { name: String, phone: String, email: String },
    vppr: { name: String, phone: String, email: String },
    secretary: { name: String, phone: String, email: String },
    treasurer: { name: String, phone: String, email: String },
    saa: { name: String, phone: String, email: String }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema);
