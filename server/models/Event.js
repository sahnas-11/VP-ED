const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: [
      'regular',
      'online',
      'joint',
      'outdoor',
      'workshop',
      'event',
      'exam_break',
      'holiday'
    ],
    default: 'regular'
  },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  venue: { type: String, default: 'SLIIT Malabe F404' },
  link: { type: String, default: '' },
  theme: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'tentative'],
    default: 'scheduled'
  },
  isBreak: { type: Boolean, default: false },
  tentative: { type: Boolean, default: false },
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', default: null },
  conflictWarning: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
