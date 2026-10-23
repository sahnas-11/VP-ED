const mongoose = require('mongoose');

const academicPeriodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['semester', 'mid-exam', 'final-exam', 'holiday', 'study-break'],
    default: 'mid-exam'
  },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  isNoMeetingBlock: { type: Boolean, default: true },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('AcademicPeriod', academicPeriodSchema);
