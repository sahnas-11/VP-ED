const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  preferredName: { type: String, trim: true },
  contact: { type: String, trim: true },
  whatsapp: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  batch: { type: String, default: 'Y1' },
  faculty: { type: String, default: 'Computing' },
  joinDate: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'new', 'alumni'], 
    default: 'active' 
  },
  isMentor: { type: Boolean, default: false },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null },
  maxMentees: { type: Number, default: 5 },
  ccLevel: { type: Number, default: 0, min: 0, max: 10 },
  clProgress: { type: Number, default: 0, min: 0, max: 10 },
  activityScore: { type: Number, default: 50 },
  reliabilityScore: { type: Number, default: 100 },
  rolesCompletedCount: { type: Number, default: 0 },
  speechesGivenCount: { type: Number, default: 0 },
  dropsUnder48hCount: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
  isDependableBadge: { type: Boolean, default: false },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Member', memberSchema);
