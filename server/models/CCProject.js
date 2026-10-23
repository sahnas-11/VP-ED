const mongoose = require('mongoose');

const ccProjectSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true }, // 1 to 10
  code: { type: String, required: true }, // 'CC1' to 'CC10'
  name: { type: String, required: true }, // e.g. 'The Ice Breaker'
  executiveSummary: { type: String, default: '' },
  objectives: [{ type: String }],
  timeMin: { type: Number, default: 5 },
  timeMax: { type: Number, default: 7 },
  evaluationCriteria: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('CCProject', ccProjectSchema);
