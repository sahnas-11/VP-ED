const mongoose = require('mongoose');

const ccSpeechSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  ccProject: { type: String, required: true }, // e.g. 'CC1' - 'CC10'
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', default: null },
  meetingNo: { type: Number, default: null },
  evaluatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
  evaluatorName: { type: String, default: '' },
  source: {
    type: String,
    enum: ['meeting', 'speech_marathon', 'marathon', 'external', 'joint_meeting'],
    default: 'meeting'
  },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('CCSpeech', ccSpeechSchema);
