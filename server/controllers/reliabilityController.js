const Member = require('../models/Member');
const Meeting = require('../models/Meeting');
const BackupPool = require('../models/BackupPool');

// Get all members reliability scores (private to exco)
const getReliabilityScores = async (req, res) => {
  const members = await Member.find()
    .sort({ reliabilityScore: -1, rolesCompletedCount: -1 })
    .select('name preferredName contact whatsapp batch email reliabilityScore dropsUnder48hCount rolesCompletedCount speechesGivenCount isDependableBadge');

  const stats = {
    averageReliability: Math.round(members.reduce((acc, m) => acc + (m.reliabilityScore || 100), 0) / (members.length || 1)),
    dependableCount: members.filter(m => m.isDependableBadge).length,
    highRiskCount: members.filter(m => (m.reliabilityScore || 100) < 80).length
  };

  res.json({ success: true, stats, data: members });
};

// Process a cancellation (kind but effective)
const processCancellation = async (req, res) => {
  const { meetingId, memberId, role, isUnder48h, reason = 'Unspecified reason' } = req.body;

  const member = await Member.findById(memberId);
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    return res.status(404).json({ message: 'Meeting not found' });
  }

  // Update role status in meeting to 'cancelled'
  let roleFound = false;
  meeting.roleAssignments = meeting.roleAssignments.map(ra => {
    if (ra.role === role && ra.memberId && ra.memberId.toString() === memberId) {
      roleFound = true;
      return { ...ra.toObject(), status: 'cancelled', notes: `Cancelled: ${reason}` };
    }
    return ra;
  });

  if (!roleFound) {
    meeting.preparedSpeeches = meeting.preparedSpeeches.map(ps => {
      if (ps.speakerId && ps.speakerId.toString() === memberId) {
        return { ...ps.toObject(), status: 'cancelled', notes: `Cancelled: ${reason}` };
      }
      return ps;
    });
  }

  await meeting.save();

  // If under 48h, adjust private reliability score
  if (isUnder48h) {
    member.dropsUnder48hCount = (member.dropsUnder48hCount || 0) + 1;
    member.reliabilityScore = Math.max(20, (member.reliabilityScore || 100) - 15);
    if (member.reliabilityScore < 95) {
      member.isDependableBadge = false;
    }
    await member.save();

    // Gentle consequence: Relegate to first backup next time!
    await BackupPool.create({
      memberId: member._id,
      type: role === 'Prepared Speaker' ? 'speaker' : 'roleplayer',
      roles: [role],
      priorityFlag: true, // "First in line next meeting"
      status: 'available',
      reasonForStandby: `Drop under 48h for Meeting #${meeting.meetingNo}. Standby backup for next meeting.`,
      notes: reason
    });
  }

  res.json({
    success: true,
    message: isUnder48h
      ? `${member.preferredName || member.name} cancelled under 48h. Reliability adjusted and added as priority backup for next meeting.`
      : `${member.preferredName || member.name} cancelled in advance. Backup needed flag set.`,
    member
  });
};

// WhatsApp Reminder & Nudge Generator
const getWhatsAppTemplates = async (req, res) => {
  const { meetingId, memberId, role, type } = req.query;

  let member = null;
  let meeting = null;

  if (memberId) member = await Member.findById(memberId);
  if (meetingId) meeting = await Meeting.findById(meetingId);

  const memberName = member ? (member.preferredName || member.name) : '[Gavelier Name]';
  const meetingNo = meeting ? `${meeting.meetingNo}th` : 'upcoming';
  const meetingDate = meeting ? new Date(meeting.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }) : 'this Sunday';
  const meetingTime = meeting ? meeting.startTime : '2:00 PM';
  const meetingTheme = meeting ? meeting.theme : 'Our Educational Meeting';
  const roleName = role || '[Assigned Role]';

  const templates = {
    // 3 Days Before Confirmation Reminder (Warm & Cute tone)
    confirmationReminder: `🌸 *SLIIT Gavel Club — Meeting #${meetingNo} Role Confirmation* 🌸\n\nHey ${memberName}! ✨ Hope you're having a wonderful week!\n\nJust a gentle reminder that you are scheduled as our fabulous *${roleName}* for the *${meetingNo} Educational Meeting*!\n📅 Date: ${meetingDate}\n⏰ Time: ${meetingTime} onwards (Fellowship at 1:30 PM)\n📍 Venue: SLIIT Malabe F404\n🎨 Theme: "${meetingTheme}"\n\nCould you please send a quick "Confirmed 💖" so we can finalize our agenda? If you need any scripts, timings, or guidance, I'm right here to support you!\n\n_#GAVELNEVERSTOPS_`,

    // Cancel Early Nudge (Kind tone encouraging prompt notice)
    earlyCancelNudge: `Hi ${memberName} 🌸 We know university life and exams can get super hectic! If you foresee any clash that might prevent you from taking up your role as *${roleName}* for meeting #${meetingNo}, please let us know today (at least 48h in advance). That way, we can smoothly invite someone from our standby pool with zero stress! Thank you so much for being considerate 💕`,

    // Shoutout for Dependable Member Badge
    dependableShoutout: `🌟 *GAVEL STAR SHOUTOUT!* 🌟\nA huge round of applause to *${memberName}* for being recognized as a *Dependable Member* of SLIIT Gavel Club! 🏆✨ Thank you for always showing up, supporting the club, and inspiring us with your unwavering dedication! Keep shining! 💖🎉`
  };

  res.json({ success: true, templates });
};

// Toggle Dependable Badge
const toggleDependableBadge = async (req, res) => {
  const { id } = req.params;
  const member = await Member.findById(id);
  if (!member) return res.status(404).json({ message: 'Member not found' });

  member.isDependableBadge = !member.isDependableBadge;
  await member.save();

  res.json({ success: true, isDependableBadge: member.isDependableBadge, member });
};

module.exports = {
  getReliabilityScores,
  processCancellation,
  getWhatsAppTemplates,
  toggleDependableBadge
};
