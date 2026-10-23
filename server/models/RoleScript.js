const mongoose = require('mongoose');

const roleScriptSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'TMOD',
      'Ah-Counter',
      'Grammarian',
      'Timer',
      'General Evaluator',
      'Round Robin Master',
      'Table Topics Master',
      'Evaluator',
      'Word Master'
    ]
  },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  script: { type: String, required: true },
  logTemplate: {
    columns: [String],
    description: String,
    sampleRows: [mongoose.Schema.Types.Mixed]
  },
  timingRules: {
    greenMin: Number,
    yellowMin: Number,
    redMin: Number,
    description: String
  },
  tips: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('RoleScript', roleScriptSchema);
