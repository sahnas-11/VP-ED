const Meeting = require('../models/Meeting');
const Event = require('../models/Event');
const Member = require('../models/Member');
const CCSpeech = require('../models/CCSpeech');
const CLRecord = require('../models/CLRecord');
const BackupPool = require('../models/BackupPool');
const RoleScript = require('../models/RoleScript');
const CCProject = require('../models/CCProject');

// Get all meetings
const getMeetings = async (req, res) => {
  const meetings = await Meeting.find()
    .sort({ meetingNo: -1 })
    .populate('roleAssignments.memberId', 'name preferredName contact ccLevel clProgress reliabilityScore isDependableBadge')
    .populate('preparedSpeeches.speakerId', 'name preferredName contact ccLevel')
    .populate('preparedSpeeches.evaluatorId', 'name preferredName contact')
    .populate('tableTopicsEvaluators.evaluatorId', 'name preferredName')
    .populate('awards.winnerId', 'name preferredName');

  res.json({ success: true, count: meetings.length, data: meetings });
};

// Get single meeting by ID or meetingNo
const getMeetingById = async (req, res) => {
  const { id } = req.params;
  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { meetingNo: parseInt(id) };

  const meeting = await Meeting.findOne(query)
    .populate('roleAssignments.memberId')
    .populate('preparedSpeeches.speakerId')
    .populate('preparedSpeeches.evaluatorId')
    .populate('tableTopicsEvaluators.evaluatorId')
    .populate('awards.winnerId');

  if (!meeting) {
    return res.status(404).json({ message: 'Meeting not found' });
  }

  res.json({ success: true, data: meeting });
};

// Create a meeting
const createMeeting = async (req, res) => {
  const meetingData = req.body;
  if (!meetingData.date) {
    meetingData.date = new Date();
  }

  // Create or link Event
  let event = null;
  if (!meetingData.eventId) {
    event = await Event.create({
      title: `${meetingData.meetingNo}th Educational Meeting`,
      type: 'regular',
      start: new Date(meetingData.date),
      end: new Date(new Date(meetingData.date).getTime() + 2.5 * 3600 * 1000),
      venue: meetingData.venue || 'SLIIT Malabe F404',
      theme: meetingData.theme || 'Educational Meeting'
    });
    meetingData.eventId = event._id;
  }

  const meeting = await Meeting.create(meetingData);
  if (event) {
    event.meetingId = meeting._id;
    await event.save();
  }

  res.status(201).json({ success: true, data: meeting });
};

// Update meeting (planner edit)
const updateMeeting = async (req, res) => {
  const { id } = req.params;
  const meeting = await Meeting.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!meeting) {
    return res.status(404).json({ message: 'Meeting not found' });
  }

  // If status marked as completed, sync trackers
  if (req.body.status === 'completed') {
    await syncMeetingCompleted(meeting);
  }

  res.json({ success: true, data: meeting });
};

// Helper: Post-meeting sync (trackers update automatically)
async function syncMeetingCompleted(meeting) {
  // Sync Role assignments to CLRecords
  for (const ra of meeting.roleAssignments) {
    if (ra.memberId && (ra.status === 'completed' || ra.status === 'confirmed')) {
      const exists = await CLRecord.findOne({
        memberId: ra.memberId,
        meetingNo: meeting.meetingNo,
        projectOrRole: ra.role
      });
      if (!exists) {
        await CLRecord.create({
          memberId: ra.memberId,
          projectOrRole: ra.role,
          date: meeting.date,
          meetingId: meeting._id,
          meetingNo: meeting.meetingNo
        });

        // Increment member completed roles
        const m = await Member.findById(ra.memberId);
        if (m) {
          m.rolesCompletedCount = (m.rolesCompletedCount || 0) + 1;
          m.lastActiveDate = meeting.date;
          m.activityScore = Math.min(100, (m.activityScore || 50) + 5);
          await m.save();
        }
      }
    }
  }

  // Sync Prepared Speeches to CCSpeeches
  for (const ps of meeting.preparedSpeeches) {
    if (ps.speakerId && (ps.status === 'completed' || ps.status === 'confirmed')) {
      const exists = await CCSpeech.findOne({
        memberId: ps.speakerId,
        meetingNo: meeting.meetingNo,
        ccProject: ps.ccProject
      });
      if (!exists) {
        await CCSpeech.create({
          memberId: ps.speakerId,
          ccProject: ps.ccProject,
          title: ps.title || 'Untitled',
          date: meeting.date,
          meetingId: meeting._id,
          meetingNo: meeting.meetingNo,
          evaluatorId: ps.evaluatorId || null,
          source: 'meeting'
        });

        const m = await Member.findById(ps.speakerId);
        if (m) {
          m.speechesGivenCount = (m.speechesGivenCount || 0) + 1;
          const pNum = parseInt(ps.ccProject.replace('CC', ''));
          if (!isNaN(pNum) && pNum > (m.ccLevel || 0)) {
            m.ccLevel = pNum;
          }
          m.lastActiveDate = meeting.date;
          m.activityScore = Math.min(100, (m.activityScore || 50) + 8);
          await m.save();
        }
      }
    }
  }
}

// Role Suggestions: suggests members who haven't done that role recently
const getRoleRecommendations = async (req, res) => {
  const { role } = req.query; // e.g. 'TMOD', 'Timer'
  const members = await Member.find({ status: 'active' });

  // Get recent CL records for this role in the last 6 months
  const recentRecords = await CLRecord.find({ projectOrRole: role }).sort({ date: -1 });
  const recentMemberMap = {};
  recentRecords.forEach(r => {
    if (!recentMemberMap[r.memberId.toString()]) {
      recentMemberMap[r.memberId.toString()] = r.date;
    }
  });

  // Calculate recommendation score (higher is better for role)
  const recommendations = members.map(m => {
    const lastDone = recentMemberMap[m._id.toString()];
    let suitabilityScore = 100;
    let reason = 'Ready to perform role';

    if (lastDone) {
      const daysAgo = Math.floor((new Date() - new Date(lastDone)) / (1000 * 60 * 60 * 24));
      if (daysAgo < 30) {
        suitabilityScore -= 60;
        reason = `Performed this role recently (${daysAgo} days ago)`;
      } else if (daysAgo < 60) {
        suitabilityScore -= 30;
        reason = `Performed role ${daysAgo} days ago`;
      } else {
        reason = `Last performed ${daysAgo} days ago - fresh candidate`;
      }
    } else {
      suitabilityScore += 20;
      reason = 'Has not performed this role yet (great opportunity!)';
    }

    // Reliability score factor
    suitabilityScore += Math.floor((m.reliabilityScore - 80) / 2);

    return {
      member: m,
      suitabilityScore,
      reason,
      reliabilityScore: m.reliabilityScore,
      isDependableBadge: m.isDependableBadge
    };
  }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  res.json({ success: true, role, data: recommendations });
};

// Check role conflicts for current meeting (e.g. member assigned to multiple roles)
const checkMeetingRoleConflicts = async (req, res) => {
  const { roleAssignments, preparedSpeeches } = req.body;
  const memberCounts = {};
  const warnings = [];

  if (Array.isArray(roleAssignments)) {
    roleAssignments.forEach(ra => {
      if (ra.memberId) {
        const id = ra.memberId.toString();
        memberCounts[id] = (memberCounts[id] || 0) + 1;
      }
    });
  }

  if (Array.isArray(preparedSpeeches)) {
    preparedSpeeches.forEach(ps => {
      if (ps.speakerId) {
        const id = ps.speakerId.toString();
        memberCounts[id] = (memberCounts[id] || 0) + 1;
      }
    });
  }

  for (const [memberId, count] of Object.entries(memberCounts)) {
    if (count > 1) {
      const member = await Member.findById(memberId).select('name preferredName');
      if (member) {
        warnings.push(`${member.preferredName || member.name} is holding ${count} roles in this meeting!`);
      }
    }
  }

  res.json({ success: true, warnings });
};

// Mark post-meeting sync manual endpoint
const syncMeetingTrackersEndpoint = async (req, res) => {
  const { id } = req.params;
  const meeting = await Meeting.findById(id);
  if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

  await syncMeetingCompleted(meeting);
  res.json({ success: true, message: 'All CC speeches and CL records synced to member profiles!' });
};

module.exports = {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  getRoleRecommendations,
  checkMeetingRoleConflicts,
  syncMeetingTrackersEndpoint
};
