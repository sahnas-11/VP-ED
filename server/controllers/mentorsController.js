const Member = require('../models/Member');
const MentorAssignment = require('../models/MentorAssignment');
const CCSpeech = require('../models/CCSpeech');
const { seedMentorMentees } = require('../seeds/seedMentorMentees');
const path = require('path');
const fs = require('fs');

// Get all mentors with their assigned mentees and mentee CC progress
const getMentorsOverview = async (req, res) => {
  const mentors = await Member.find({ isMentor: true }).sort({ name: 1 });
  const assignments = await MentorAssignment.find()
    .populate('menteeId', 'name preferredName email contact batch ccLevel speechesGivenCount clProgress lastActiveDate status')
    .sort({ assignedAt: -1 });

  // Group by mentor
  const mentorMap = {};
  mentors.forEach(m => {
    mentorMap[m._id.toString()] = {
      mentor: m,
      mentees: [],
      currentMenteeCount: 0,
      maxMentees: m.maxMentees || 8
    };
  });

  assignments.forEach(a => {
    if (a.mentorId && mentorMap[a.mentorId.toString()] && a.menteeId) {
      mentorMap[a.mentorId.toString()].mentees.push({
        assignmentId: a._id,
        mentee: a.menteeId,
        assignedAt: a.assignedAt,
        history: a.history
      });
      mentorMap[a.mentorId.toString()].currentMenteeCount++;
    }
  });

  // Also get unassigned mentees
  const assignedMenteeIds = assignments.map(a => a.menteeId?._id?.toString()).filter(Boolean);
  const unassignedMentees = await Member.find({
    _id: { $nin: assignedMenteeIds },
    isMentor: false,
    status: 'active'
  }).select('name preferredName email contact batch ccLevel');

  res.json({
    success: true,
    data: Object.values(mentorMap),
    unassignedMentees,
    totalMentors: mentors.length,
    totalAssignments: assignments.length
  });
};

// Suggest auto-match for a mentee based on mentor load balancing and capacity
const getSuggestedMentor = async (req, res) => {
  const mentors = await Member.find({ isMentor: true });
  const assignments = await MentorAssignment.aggregate([
    { $group: { _id: '$mentorId', count: { $sum: 1 } } }
  ]);

  const loadMap = {};
  assignments.forEach(a => { loadMap[a._id.toString()] = a.count; });

  // Sort mentors by lowest current load relative to maxMentees
  const scoredMentors = mentors.map(m => {
    const currentLoad = loadMap[m._id.toString()] || 0;
    const capacity = m.maxMentees || 8;
    const availableSlots = Math.max(0, capacity - currentLoad);
    return {
      mentor: m,
      currentLoad,
      capacity,
      availableSlots,
      isFull: currentLoad >= capacity
    };
  }).sort((a, b) => b.availableSlots - a.availableSlots || a.currentLoad - b.currentLoad);

  res.json({
    success: true,
    suggestedMentor: scoredMentors[0] || null,
    allMentorsWithLoad: scoredMentors
  });
};

// Assign or Reassign mentor (with history tracking)
const assignMentor = async (req, res) => {
  const { mentorId, menteeId, reason = 'Administrative assignment' } = req.body;

  let assignment = await MentorAssignment.findOne({ menteeId });
  if (assignment) {
    // Reassigning
    const previousMentorId = assignment.mentorId;
    assignment.mentorId = mentorId;
    assignment.assignedAt = new Date();
    assignment.history.push({
      previousMentorId,
      changedAt: new Date(),
      reason
    });
    await assignment.save();
  } else {
    // New assignment
    assignment = await MentorAssignment.create({
      mentorId,
      menteeId,
      assignedAt: new Date(),
      history: [{
        previousMentorId: null,
        changedAt: new Date(),
        reason
      }]
    });
  }

  // Update mentee record
  await Member.findByIdAndUpdate(menteeId, { mentorId });

  const populated = await MentorAssignment.findById(assignment._id)
    .populate('mentorId', 'name preferredName')
    .populate('menteeId', 'name preferredName');

  res.json({ success: true, data: populated });
};

// Seed / Re-import Excel from server file or uploaded file
const importExcelMentorMentees = async (req, res) => {
  let tempPath = null;
  if (req.file) {
    tempPath = path.join(__dirname, `../scratch_upload_${Date.now()}.xlsx`);
    fs.writeFileSync(tempPath, req.file.buffer);
  }

  const result = await seedMentorMentees(tempPath);
  if (tempPath && fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }

  res.json({ success: true, message: 'Mentor-Mentee Excel imported successfully', result });
};

module.exports = {
  getMentorsOverview,
  getSuggestedMentor,
  assignMentor,
  importExcelMentorMentees
};
