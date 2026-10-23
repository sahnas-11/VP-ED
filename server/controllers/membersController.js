const Member = require('../models/Member');
const CCSpeech = require('../models/CCSpeech');
const CLRecord = require('../models/CLRecord');
const BackupPool = require('../models/BackupPool');
const MentorAssignment = require('../models/MentorAssignment');
const ExcelJS = require('exceljs');

// Members list with filters, search, and pagination/sorting
const getMembers = async (req, res) => {
  const { search, status, batch, faculty, isMentor, sort = 'name' } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { preferredName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { contact: { $regex: search, $options: 'i' } }
    ];
  }

  if (status && status !== 'all') filter.status = status;
  if (batch && batch !== 'all') filter.batch = batch;
  if (faculty && faculty !== 'all') filter.faculty = faculty;
  if (isMentor !== undefined && isMentor !== 'all') filter.isMentor = isMentor === 'true';

  let sortCriteria = { name: 1 };
  if (sort === 'activityScore') sortCriteria = { activityScore: -1 };
  if (sort === 'reliabilityScore') sortCriteria = { reliabilityScore: -1 };
  if (sort === 'ccLevel') sortCriteria = { ccLevel: -1 };
  if (sort === 'lastActive') sortCriteria = { lastActiveDate: -1 };

  const members = await Member.find(filter).sort(sortCriteria).populate('mentorId', 'name preferredName contact');
  res.json({ success: true, count: members.length, data: members });
};

// Create a member
const createMember = async (req, res) => {
  const member = await Member.create(req.body);
  res.status(201).json({ success: true, data: member });
};

// Update member (inline or full modal)
const updateMember = async (req, res) => {
  const { id } = req.params;
  const member = await Member.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!member) {
    return res.status(404).json({ message: 'Member not found' });
  }
  res.json({ success: true, data: member });
};

// Delete member
const deleteMember = async (req, res) => {
  const { id } = req.params;
  await Member.findByIdAndDelete(id);
  await MentorAssignment.deleteMany({ $or: [{ mentorId: id }, { menteeId: id }] });
  await BackupPool.deleteMany({ memberId: id });
  res.json({ success: true, message: 'Member removed' });
};

// TRACKER 1: CC and CL Progress per member
const getMemberTrackerSummary = async (req, res) => {
  const members = await Member.find().populate('mentorId', 'name preferredName');

  // Compute live speech count and roles count
  const speechCounts = await CCSpeech.aggregate([
    { $group: { _id: '$memberId', count: { $sum: 1 } } }
  ]);
  const roleCounts = await CLRecord.aggregate([
    { $group: { _id: '$memberId', count: { $sum: 1 } } }
  ]);

  const speechMap = {};
  speechCounts.forEach(s => { speechMap[s._id.toString()] = s.count; });
  const roleMap = {};
  roleCounts.forEach(r => { roleMap[r._id.toString()] = r.count; });

  const trackerData = members.map(m => ({
    _id: m._id,
    name: m.name,
    preferredName: m.preferredName,
    status: m.status,
    mentorName: m.mentorId ? m.mentorId.preferredName || m.mentorId.name : 'Unassigned',
    ccLevel: m.ccLevel,
    speechesCount: speechMap[m._id.toString()] || m.speechesGivenCount || 0,
    clProgress: m.clProgress,
    rolesDoneCount: roleMap[m._id.toString()] || m.rolesCompletedCount || 0,
    activityScore: m.activityScore,
    reliabilityScore: m.reliabilityScore,
    isDependableBadge: m.isDependableBadge,
    lastActiveDate: m.lastActiveDate
  }));

  res.json({ success: true, data: trackerData });
};

// TRACKER 2: General CC Speeches Tracker (CRUD + Bulk Add)
const getCCSpeeches = async (req, res) => {
  const { memberId, project, source } = req.query;
  const filter = {};
  if (memberId) filter.memberId = memberId;
  if (project) filter.ccProject = project;
  if (source) filter.source = source;

  const speeches = await CCSpeech.find(filter)
    .sort({ date: -1 })
    .populate('memberId', 'name preferredName batch')
    .populate('evaluatorId', 'name preferredName');

  res.json({ success: true, count: speeches.length, data: speeches });
};

const addCCSpeech = async (req, res) => {
  const { memberId, ccProject, title, date, meetingNo, evaluatorId, evaluatorName, source, notes } = req.body;
  const speech = await CCSpeech.create({
    memberId,
    ccProject,
    title,
    date: new Date(date),
    meetingNo,
    evaluatorId: evaluatorId || null,
    evaluatorName,
    source: source || 'meeting',
    notes
  });

  // Increment member speech count and update CC level if project is higher
  const member = await Member.findById(memberId);
  if (member) {
    member.speechesGivenCount = (member.speechesGivenCount || 0) + 1;
    member.lastActiveDate = new Date(date);
    const projNum = parseInt(ccProject.replace('CC', ''));
    if (!isNaN(projNum) && projNum > member.ccLevel) {
      member.ccLevel = projNum;
    }
    member.activityScore = Math.min(100, member.activityScore + 5);
    await member.save();
  }

  res.status(201).json({ success: true, data: speech });
};

// Bulk Add form for older speeches & speech marathons
const bulkAddCCSpeeches = async (req, res) => {
  const { speeches } = req.body; // array of speech objects
  if (!Array.isArray(speeches) || speeches.length === 0) {
    return res.status(400).json({ message: 'Speeches array required' });
  }

  const created = [];
  for (const s of speeches) {
    const doc = await CCSpeech.create({
      memberId: s.memberId,
      ccProject: s.ccProject,
      title: s.title,
      date: new Date(s.date),
      meetingNo: s.meetingNo || null,
      evaluatorName: s.evaluatorName || '',
      source: s.source || 'speech_marathon',
      notes: s.notes || ''
    });

    const member = await Member.findById(s.memberId);
    if (member) {
      member.speechesGivenCount = (member.speechesGivenCount || 0) + 1;
      const projNum = parseInt(s.ccProject.replace('CC', ''));
      if (!isNaN(projNum) && projNum > member.ccLevel) {
        member.ccLevel = projNum;
      }
      await member.save();
    }
    created.push(doc);
  }

  res.status(201).json({ success: true, count: created.length, data: created });
};

// TRACKER 3: General CL Tracker
const getCLRecords = async (req, res) => {
  const { memberId, projectOrRole } = req.query;
  const filter = {};
  if (memberId) filter.memberId = memberId;
  if (projectOrRole) filter.projectOrRole = projectOrRole;

  const records = await CLRecord.find(filter)
    .sort({ date: -1 })
    .populate('memberId', 'name preferredName batch');

  res.json({ success: true, count: records.length, data: records });
};

const addCLRecord = async (req, res) => {
  const { memberId, projectOrRole, date, meetingNo, notes } = req.body;
  const record = await CLRecord.create({
    memberId,
    projectOrRole,
    date: new Date(date),
    meetingNo,
    notes
  });

  const member = await Member.findById(memberId);
  if (member) {
    member.rolesCompletedCount = (member.rolesCompletedCount || 0) + 1;
    member.lastActiveDate = new Date(date);
    member.clProgress = Math.min(10, member.clProgress + 1);
    member.activityScore = Math.min(100, member.activityScore + 4);
    await member.save();
  }

  res.status(201).json({ success: true, data: record });
};

// TRACKER 4: Backup Pool (Standby Pool)
const getBackupPool = async (req, res) => {
  const pool = await BackupPool.find()
    .sort({ priorityFlag: -1, createdAt: 1 })
    .populate('memberId', 'name preferredName contact whatsapp batch email');
  res.json({ success: true, count: pool.length, data: pool });
};

const addToBackupPool = async (req, res) => {
  const { memberId, type, roles, priorityFlag, reasonForStandby, notes } = req.body;
  const backup = await BackupPool.create({
    memberId,
    type,
    roles,
    priorityFlag: !!priorityFlag,
    reasonForStandby: reasonForStandby || 'Volunteer standby',
    notes
  });
  res.status(201).json({ success: true, data: backup });
};

const updateBackupItem = async (req, res) => {
  const { id } = req.params;
  const item = await BackupPool.findByIdAndUpdate(id, req.body, { new: true });
  res.json({ success: true, data: item });
};

const removeFromBackupPool = async (req, res) => {
  const { id } = req.params;
  await BackupPool.findByIdAndDelete(id);
  res.json({ success: true, message: 'Removed from standby pool' });
};

// Dashboard Widgets
const getDashboardStats = async (req, res) => {
  // 1. Members close to finishing CC level (e.g., CC8, CC9)
  const closeToFinishCC = await Member.find({ ccLevel: { $gte: 7, $lte: 9 }, status: 'active' })
    .select('name preferredName ccLevel contact batch');

  // 2. Members inactive for a long time (> 45 days or never active)
  const cutOff = new Date();
  cutOff.setDate(cutOff.getDate() - 45);
  const inactiveMembers = await Member.find({
    status: 'active',
    $or: [
      { lastActiveDate: { $lt: cutOff } },
      { lastActiveDate: null }
    ]
  }).limit(10).select('name preferredName lastActiveDate contact email batch');

  // 3. Role Frequency stats for Recharts
  const roleFreq = await CLRecord.aggregate([
    { $group: { _id: '$projectOrRole', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // 4. Leaderboard by Activity Score & Reliability
  const leaderboard = await Member.find({ status: 'active' })
    .sort({ activityScore: -1, reliabilityScore: -1 })
    .limit(10)
    .select('name preferredName activityScore reliabilityScore ccLevel clProgress isDependableBadge');

  // 5. Total counts
  const totalMembers = await Member.countDocuments({ status: 'active' });
  const totalMentors = await Member.countDocuments({ isMentor: true });
  const totalSpeeches = await CCSpeech.countDocuments();
  const standbyCount = await BackupPool.countDocuments({ status: 'available' });

  res.json({
    success: true,
    data: {
      totalMembers,
      totalMentors,
      totalSpeeches,
      standbyCount,
      closeToFinishCC,
      inactiveMembers,
      roleFreq: roleFreq.map(r => ({ role: r._id, count: r.count })),
      leaderboard
    }
  });
};

// In-app Excel import for members
const importMembersExcel = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(req.file.buffer);
  const worksheet = workbook.worksheets[0];

  let addedCount = 0;
  worksheet.eachRow(async (row, rowNumber) => {
    if (rowNumber === 1) return;
    const name = row.getCell(1).value;
    const email = row.getCell(2).value;
    const contact = row.getCell(3).value;
    const batch = row.getCell(4).value;
    const faculty = row.getCell(5).value;

    if (name) {
      await Member.create({
        name: String(name).trim(),
        email: email ? String(email).trim() : '',
        contact: contact ? String(contact).trim() : '',
        batch: batch ? String(batch).trim() : 'Y1',
        faculty: faculty ? String(faculty).trim() : 'Computing'
      });
      addedCount++;
    }
  });

  res.json({ success: true, message: `Successfully parsed and queued ${addedCount} members` });
};

module.exports = {
  getMembers,
  createMember,
  updateMember,
  deleteMember,
  getMemberTrackerSummary,
  getCCSpeeches,
  addCCSpeech,
  bulkAddCCSpeeches,
  getCLRecords,
  addCLRecord,
  getBackupPool,
  addToBackupPool,
  updateBackupItem,
  removeFromBackupPool,
  getDashboardStats,
  importMembersExcel
};
