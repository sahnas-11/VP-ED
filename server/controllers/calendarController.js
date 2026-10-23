const Event = require('../models/Event');
const AcademicPeriod = require('../models/AcademicPeriod');
const Meeting = require('../models/Meeting');

// Helper to check conflicts with holidays or academic breaks
async function checkDateConflict(start, end) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const conflictingPeriods = await AcademicPeriod.find({
    $or: [
      { start: { $lte: endDate }, end: { $gte: startDate } }
    ]
  });

  const conflictingHolidays = await Event.find({
    type: 'holiday',
    start: { $lte: endDate },
    end: { $gte: startDate }
  });

  const warnings = [];
  conflictingPeriods.forEach(p => {
    warnings.push(`Falls within SLIIT Academic Block: ${p.name} (${p.type})`);
  });
  conflictingHolidays.forEach(h => {
    warnings.push(`Falls on Sri Lanka Public Holiday: ${h.title}${h.tentative ? ' [Tentative Moon Date]' : ''}`);
  });

  return warnings.length > 0 ? warnings.join(' | ') : null;
}

// Get all calendar events with optional date range and filters
const getEvents = async (req, res) => {
  const { start, end, type } = req.query;
  const filter = {};
  if (start && end) {
    filter.start = { $gte: new Date(start) };
    filter.end = { $lte: new Date(end) };
  }
  if (type && type !== 'all') {
    filter.type = type;
  }

  const events = await Event.find(filter).sort({ start: 1 }).populate('meetingId');
  res.json({ success: true, count: events.length, data: events });
};

// Create a new calendar event
const createEvent = async (req, res) => {
  const { title, type, start, end, venue, link, theme, notes, isBreak, tentative } = req.body;
  
  const conflict = await checkDateConflict(start, end);

  const event = await Event.create({
    title,
    type: type || 'regular',
    start: new Date(start),
    end: new Date(end),
    venue: venue || 'SLIIT Malabe F404',
    link,
    theme,
    notes,
    isBreak: !!isBreak || type === 'exam_break' || type === 'holiday',
    tentative: !!tentative,
    conflictWarning: conflict || ''
  });

  // If this is a meeting event, auto-create a linked Meeting document if requested
  if (['regular', 'online', 'joint', 'outdoor', 'workshop'].includes(event.type) && !event.isBreak) {
    const lastMeeting = await Meeting.findOne().sort({ meetingNo: -1 });
    const nextMeetingNo = lastMeeting ? lastMeeting.meetingNo + 1 : 214;
    
    const startTimeFormatted = new Date(start).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const endTimeFormatted = new Date(end).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const meeting = await Meeting.create({
      eventId: event._id,
      meetingNo: nextMeetingNo,
      theme: theme || `${event.type.toUpperCase()} Meeting`,
      date: new Date(start),
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      venue: event.venue,
      status: 'draft'
    });

    event.meetingId = meeting._id;
    await event.save();
  }

  res.status(201).json({ success: true, data: event, warning: conflict });
};

// Update an event (e.g. drag & drop reschedule or details edit)
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, type, start, end, venue, link, theme, notes, status, tentative } = req.body;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  if (start && end) {
    event.start = new Date(start);
    event.end = new Date(end);
    const conflict = await checkDateConflict(start, end);
    event.conflictWarning = conflict || '';
  }

  if (title !== undefined) event.title = title;
  if (type !== undefined) event.type = type;
  if (venue !== undefined) event.venue = venue;
  if (link !== undefined) event.link = link;
  if (theme !== undefined) event.theme = theme;
  if (notes !== undefined) event.notes = notes;
  if (status !== undefined) event.status = status;
  if (tentative !== undefined) event.tentative = tentative;

  await event.save();

  // If linked to a meeting, sync date
  if (event.meetingId) {
    await Meeting.findByIdAndUpdate(event.meetingId, {
      date: event.start,
      venue: event.venue,
      theme: event.theme || undefined
    });
  }

  res.json({ success: true, data: event, warning: event.conflictWarning });
};

// Delete an event
const deleteEvent = async (req, res) => {
  const { id } = req.params;
  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  if (event.meetingId) {
    await Meeting.findByIdAndDelete(event.meetingId);
  }

  await event.deleteOne();
  res.json({ success: true, message: 'Event deleted successfully' });
};

// Generate meeting dates (pick a weekday, range, auto-skips holidays & exams)
const generateMeetingDates = async (req, res) => {
  const {
    weekday, // 0 for Sunday, 1 for Monday, etc. Default 0 (Sunday)
    startDate, // default '2026-11-01'
    endDate,   // default '2027-09-30'
    startTime = '14:00',
    durationHours = 2.5,
    skipHolidays = true,
    skipExams = true,
    startMeetingNo
  } = req.body;

  const start = new Date(startDate || '2026-11-01');
  const end = new Date(endDate || '2027-09-30');
  const targetDay = weekday !== undefined ? parseInt(weekday) : 0; // Sunday

  const holidays = await Event.find({ type: 'holiday' });
  const academicBreaks = await AcademicPeriod.find({ isNoMeetingBlock: true });

  let cur = new Date(start);
  while (cur.getDay() !== targetDay) {
    cur.setDate(cur.getDate() + 1);
  }

  let lastMeeting = await Meeting.findOne().sort({ meetingNo: -1 });
  let nextNo = startMeetingNo ? parseInt(startMeetingNo) : (lastMeeting ? lastMeeting.meetingNo + 1 : 214);

  const createdEvents = [];
  const skippedDates = [];

  const [hours, minutes] = startTime.split(':').map(Number);

  while (cur <= end) {
    const meetingDateStart = new Date(cur);
    meetingDateStart.setHours(hours, minutes, 0, 0);

    const meetingDateEnd = new Date(meetingDateStart.getTime() + durationHours * 60 * 60 * 1000);

    // Check holiday skip
    const isHoliday = holidays.some(h => 
      meetingDateStart >= h.start && meetingDateStart <= h.end
    );

    // Check exam skip
    const isExam = academicBreaks.some(b => 
      meetingDateStart >= b.start && meetingDateStart <= b.end
    );

    if (skipHolidays && isHoliday) {
      skippedDates.push({ date: new Date(meetingDateStart), reason: 'Sri Lanka Holiday' });
    } else if (skipExams && isExam) {
      skippedDates.push({ date: new Date(meetingDateStart), reason: 'SLIIT Exam / Break' });
    } else {
      // Create Event and Meeting
      const eventTitle = `${nextNo}th Educational Meeting`;
      const event = await Event.create({
        title: eventTitle,
        type: 'regular',
        start: meetingDateStart,
        end: meetingDateEnd,
        venue: 'SLIIT Malabe F404',
        status: 'scheduled'
      });

      const meeting = await Meeting.create({
        eventId: event._id,
        meetingNo: nextNo,
        theme: 'Educational Meeting',
        date: meetingDateStart,
        startTime: meetingDateStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        endTime: meetingDateEnd.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        venue: 'SLIIT Malabe F404',
        status: 'draft'
      });

      event.meetingId = meeting._id;
      await event.save();

      createdEvents.push(event);
      nextNo++;
    }

    cur.setDate(cur.getDate() + 7);
  }

  res.json({
    success: true,
    createdCount: createdEvents.length,
    skippedCount: skippedDates.length,
    createdEvents,
    skippedDates
  });
};

// Term Overview: Monthly breakdown by event types for Nov 2026 to Sep 2027
const getTermOverview = async (req, res) => {
  const events = await Event.find({
    start: { $gte: new Date('2026-11-01T00:00:00.000Z'), $lte: new Date('2027-09-30T23:59:59.000Z') }
  }).sort({ start: 1 });

  const monthsMap = {};
  const monthNames = [
    '2026-11', '2026-12', '2027-01', '2027-02', '2027-03', '2027-04',
    '2027-05', '2027-06', '2027-07', '2027-08', '2027-09'
  ];

  monthNames.forEach(m => {
    monthsMap[m] = {
      monthKey: m,
      monthLabel: new Date(`${m}-01`).toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      totalEvents: 0,
      regular: 0,
      online: 0,
      joint: 0,
      outdoor: 0,
      workshop: 0,
      event: 0,
      exam_break: 0,
      holiday: 0,
      meetingsCount: 0
    };
  });

  events.forEach(ev => {
    const key = ev.start.toISOString().substring(0, 7);
    if (monthsMap[key]) {
      monthsMap[key].totalEvents++;
      if (monthsMap[key][ev.type] !== undefined) {
        monthsMap[key][ev.type]++;
      }
      if (['regular', 'online', 'joint', 'outdoor', 'workshop'].includes(ev.type)) {
        monthsMap[key].meetingsCount++;
      }
    }
  });

  const totals = {
    regular: 0,
    online: 0,
    joint: 0,
    outdoor: 0,
    workshop: 0,
    event: 0,
    exam_break: 0,
    holiday: 0,
    all: events.length
  };

  events.forEach(ev => {
    if (totals[ev.type] !== undefined) totals[ev.type]++;
  });

  res.json({
    success: true,
    monthlyBreakdown: Object.values(monthsMap),
    summaryTotals: totals
  });
};

// Academic Periods CRUD
const getAcademicPeriods = async (req, res) => {
  const periods = await AcademicPeriod.find().sort({ start: 1 });
  res.json({ success: true, data: periods });
};

const createAcademicPeriod = async (req, res) => {
  const { name, type, start, end, isNoMeetingBlock, notes } = req.body;
  const period = await AcademicPeriod.create({
    name,
    type,
    start: new Date(start),
    end: new Date(end),
    isNoMeetingBlock: isNoMeetingBlock !== undefined ? isNoMeetingBlock : true,
    notes
  });

  // Also add calendar block event
  await Event.create({
    title: `[Exam/Break] ${period.name}`,
    type: 'exam_break',
    start: period.start,
    end: period.end,
    isBreak: true,
    notes: period.notes
  });

  res.status(201).json({ success: true, data: period });
};

const deleteAcademicPeriod = async (req, res) => {
  const { id } = req.params;
  const period = await AcademicPeriod.findByIdAndDelete(id);
  if (period) {
    await Event.deleteMany({ title: `[Exam/Break] ${period.name}` });
  }
  res.json({ success: true, message: 'Academic period removed' });
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  generateMeetingDates,
  getTermOverview,
  getAcademicPeriods,
  createAcademicPeriod,
  deleteAcademicPeriod
};
