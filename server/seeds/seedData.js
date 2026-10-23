const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Member = require('../models/Member');
const Event = require('../models/Event');
const Meeting = require('../models/Meeting');
const CCSpeech = require('../models/CCSpeech');
const CLRecord = require('../models/CLRecord');
const BackupPool = require('../models/BackupPool');
const { seedCCProjects } = require('./seedCCManual');
const { seedRoleScripts } = require('./seedRoleScripts');
const { seedHolidaysAndPeriods } = require('./seedSriLankaHolidays');
const { seedMentorMentees } = require('./seedMentorMentees');

async function seedAll() {
  console.log('[Seed] Starting complete database seeding...');
  await connectDB();

  // 1. Seed VPE User
  await User.deleteMany({});
  const vpeUser = await User.create({
    name: 'Sahnas Thufail',
    email: 'vpe@sliitgavel.org',
    password: 'Gavel@2026',
    role: 'vpe',
    phone: '071 663 3585',
    clubName: 'SLIIT Gavel Club'
  });
  console.log(`[Seed] Created VPE user: ${vpeUser.email} / Gavel@2026`);

  // 2. Seed CC Projects CC1 - CC10
  await seedCCProjects();

  // 3. Seed Role Scripts & Logs
  await seedRoleScripts();

  // 4. Seed Sri Lankan Holidays & SLIIT Academic Periods
  await seedHolidaysAndPeriods();

  // 5. Seed Members & Mentor-Mentee Assignments from Excel
  await seedMentorMentees();

  // 6. Seed Sample Meeting (213th Meeting - Formula 1)
  const mahira = await Member.findOne({ name: /Mahira/i });
  const devinda = await Member.findOne({ name: /Devinda/i });
  const britney = await Member.findOne({ name: /Britney/i });
  const pavan = await Member.findOne({ name: /Pavan/i });
  const nethmi = await Member.findOne({ name: /Nethmi/i });
  const savini = await Member.findOne({ name: /Savini/i });
  const chathumina = await Member.findOne({ name: /Chathumina/i });
  const nilanka = await Member.findOne({ name: /Nilanka/i });
  const ifra = await Member.findOne({ name: /Ifra/i });
  const vishakya = await Member.findOne({ name: /Vishakya/i });
  const sahnas = await Member.findOne({ name: /Sahnas/i });
  const chenula = await Member.findOne({ name: /Chenula/i });
  const mihijith = await Member.findOne({ name: /Mihijith/i });
  const shamla = await Member.findOne({ name: /Shamla/i });
  const kaveesha = await Member.findOne({ name: /Kaveesha/i });

  await Meeting.deleteMany({});
  await CCSpeech.deleteMany({});
  await CLRecord.deleteMany({});
  await BackupPool.deleteMany({});

  const meeting213Date = new Date('2026-09-27T08:30:00.000Z'); // 2:00 PM Sri Lanka time
  
  // Create matching Event on calendar
  const event213 = await Event.create({
    title: '213th Educational Meeting - Formula 1',
    type: 'regular',
    start: new Date('2026-09-27T14:00:00.000+05:30'),
    end: new Date('2026-09-27T16:30:00.000+05:30'),
    venue: 'SLIIT Malabe F404',
    theme: 'Formula 1',
    notes: '213th Meeting of SLIIT Gavel Club with full prepared speeches and table topics.',
    status: 'completed'
  });

  const meeting213 = await Meeting.create({
    eventId: event213._id,
    meetingNo: 213,
    theme: 'Formula 1',
    date: new Date('2026-09-27T14:00:00.000+05:30'),
    startTime: '02:00 PM',
    fellowshipTime: '01:30 PM',
    endTime: '04:30 PM',
    venue: 'SLIIT, New Kandy Rd, Malabe F404',
    wordOfTheDay: 'Velocity',
    wordMeaning: 'Rapidity of motion or action; quickness.',
    status: 'completed',
    roleAssignments: [
      { role: 'TMOD', memberId: chathumina?._id, status: 'completed' },
      { role: 'Ah-Counter', memberId: nilanka?._id, status: 'completed' },
      { role: 'Grammarian', memberId: ifra?._id, status: 'completed' },
      { role: 'Timer', memberId: vishakya?._id, status: 'completed' },
      { role: 'General Evaluator', memberId: sahnas?._id, status: 'completed' },
      { role: 'Round Robin Master', memberId: chenula?._id, status: 'completed' },
      { role: 'Table Topics Master', memberId: mihijith?._id, status: 'completed' }
    ],
    preparedSpeeches: [
      { speakerId: mahira?._id, ccProject: 'CC9', title: 'Pedal to the Metal', evaluatorId: pavan?._id, status: 'completed' },
      { speakerId: devinda?._id, ccProject: 'CC1', title: 'The Starting Grid', evaluatorId: nethmi?._id, status: 'completed' },
      { speakerId: britney?._id, ccProject: 'CC1', title: 'Shifting Gears', evaluatorId: savini?._id, status: 'completed' }
    ],
    tableTopicsEvaluators: [
      { evaluatorId: shamla?._id },
      { evaluatorId: kaveesha?._id }
    ],
    awards: [
      { category: 'Best Speaker', winnerId: mahira?._id },
      { category: 'Best Table Topics Speaker', winnerId: devinda?._id },
      { category: 'Best Evaluator', winnerId: pavan?._id },
      { category: 'Best Roleplayer', winnerId: vishakya?._id }
    ],
    timeline: [
      { time: '01:30 PM', item: 'Fellowship', role: 'All', durationMin: 30 },
      { time: '02:00 PM', item: 'President Calls the Meeting to Order & Greets the Guests', role: 'President', durationMin: 10 },
      { time: '02:10 PM', item: 'President Introduces the Toastmaster of the Day', role: 'TMOD', durationMin: 5 },
      { time: '02:15 PM', item: 'TMOD Calls on Meeting Roles (Ah-Counter, Grammarian, Timer, General Evaluator)', role: 'TMOD', durationMin: 10 },
      { time: '02:25 PM', item: 'TMOD Introduces the Round Robin Master', role: 'Round Robin Master', durationMin: 40 },
      { time: '03:05 PM', item: 'TMOD Briefs About Evaluators and Prepared Speakers', role: 'Prepared Speakers', durationMin: 30 },
      { time: '03:35 PM', item: 'TMOD Introduces the Table Topics Master', role: 'Table Topics Master', durationMin: 15 },
      { time: '03:50 PM', item: 'TMOD Introduces the General Evaluator & Tag Team Reports', role: 'General Evaluator', durationMin: 20 },
      { time: '04:10 PM', item: 'TMOD Calls for Votes and Presents Meeting Awards', role: 'TMOD', durationMin: 15 },
      { time: '04:25 PM', item: 'President makes Closing Remarks and Meeting Adjourns', role: 'President', durationMin: 5 }
    ],
    excoSnapshot: {
      president: { name: 'Pavan Kumarage', phone: '071 356 0640', email: 'pavanvilhan@gmail.com' },
      vpe: { name: 'Sahnas Thufail', phone: '071 663 3585', email: 'sahnasthufail@gmail.com' },
      vpm: { name: 'Dilni Nishshanka', phone: '076 320 1664', email: 'nishshankadilni@gmail.com' },
      vppr: { name: 'Savini Yasanayake', phone: '077 888 5070', email: 'syasanayake@gmail.com' },
      secretary: { name: 'Mahira Ramzeen', phone: '077 841 9717', email: 'mahiraramzeen@gmail.com' },
      treasurer: { name: 'Shamla Bishirhafi', phone: '077 781 3593', email: 'hafishamla@gmail.com' },
      saa: { name: 'Malindu Dushan', phone: '070 587 2977', email: 'malindudushan83@gmail.com' }
    }
  });

  event213.meetingId = meeting213._id;
  await event213.save();

  // Create upcoming meeting (214th) in November 2026
  const event214 = await Event.create({
    title: '214th Educational Meeting - Neon Nights',
    type: 'regular',
    start: new Date('2026-11-29T14:00:00.000+05:30'),
    end: new Date('2026-11-29T16:30:00.000+05:30'),
    venue: 'SLIIT Malabe F404',
    theme: 'Neon Nights: Igniting Ideas',
    notes: 'Upcoming regular meeting after Semester 2 Final exams.',
    status: 'scheduled'
  });

  await Meeting.create({
    eventId: event214._id,
    meetingNo: 214,
    theme: 'Neon Nights: Igniting Ideas',
    date: new Date('2026-11-29T14:00:00.000+05:30'),
    startTime: '02:00 PM',
    fellowshipTime: '01:30 PM',
    endTime: '04:30 PM',
    venue: 'SLIIT Malabe F404',
    wordOfTheDay: 'Effulgent',
    wordMeaning: 'Shining brightly; radiant; resplendent.',
    status: 'published',
    roleAssignments: [
      { role: 'TMOD', memberId: nilanka?._id, status: 'confirmed' },
      { role: 'Ah-Counter', memberId: chenula?._id, status: 'confirmed' },
      { role: 'Grammarian', memberId: ifra?._id, status: 'confirmed' },
      { role: 'Timer', memberId: devinda?._id, status: 'confirmed' },
      { role: 'General Evaluator', memberId: pavan?._id, status: 'confirmed' },
      { role: 'Round Robin Master', memberId: britney?._id, status: 'invited' },
      { role: 'Table Topics Master', memberId: shamla?._id, status: 'confirmed' }
    ],
    preparedSpeeches: [
      { speakerId: devinda?._id, ccProject: 'CC2', title: 'The Blueprint of Focus', evaluatorId: sahnas?._id, status: 'confirmed' },
      { speakerId: britney?._id, ccProject: 'CC2', title: 'Overcoming the Echoes', evaluatorId: mahira?._id, status: 'confirmed' }
    ],
    tableTopicsEvaluators: [
      { evaluatorId: nethmi?._id }
    ],
    awards: [],
    timeline: [
      { time: '01:30 PM', item: 'Fellowship', role: 'All', durationMin: 30 },
      { time: '02:00 PM', item: 'President Calls Meeting to Order', role: 'President', durationMin: 10 },
      { time: '02:10 PM', item: 'President Introduces TMOD', role: 'TMOD', durationMin: 5 },
      { time: '02:15 PM', item: 'TMOD Calls Tag Team', role: 'TMOD', durationMin: 10 },
      { time: '02:25 PM', item: 'Round Robin Session', role: 'Round Robin Master', durationMin: 35 },
      { time: '03:00 PM', item: 'Prepared Speeches', role: 'Prepared Speakers', durationMin: 30 },
      { time: '03:30 PM', item: 'Table Topics Session', role: 'Table Topics Master', durationMin: 20 },
      { time: '03:50 PM', item: 'General Evaluation & Reports', role: 'General Evaluator', durationMin: 20 },
      { time: '04:10 PM', item: 'Awards & Adjournment', role: 'TMOD / President', durationMin: 20 }
    ],
    excoSnapshot: meeting213.excoSnapshot
  });

  // Seed Historical CC Speeches
  if (mahira) {
    await CCSpeech.create({
      memberId: mahira._id,
      ccProject: 'CC9',
      title: 'Pedal to the Metal',
      date: new Date('2026-09-27'),
      meetingId: meeting213._id,
      meetingNo: 213,
      evaluatorId: pavan?._id,
      evaluatorName: 'Pavan Kumarage',
      source: 'meeting',
      notes: 'Outstanding delivery on Persuade with Power'
    });
    await CCSpeech.create({
      memberId: mahira._id,
      ccProject: 'CC8',
      title: 'The Art of Visual Storytelling',
      date: new Date('2026-08-15'),
      source: 'speech_marathon',
      evaluatorName: 'External TM Evaluator',
      notes: 'Given during Colombo Speech Marathon'
    });
  }

  if (devinda) {
    await CCSpeech.create({
      memberId: devinda._id,
      ccProject: 'CC1',
      title: 'The Starting Grid',
      date: new Date('2026-09-27'),
      meetingId: meeting213._id,
      meetingNo: 213,
      evaluatorId: nethmi?._id,
      evaluatorName: 'Nethmi Maithripala',
      source: 'meeting'
    });
  }

  if (britney) {
    await CCSpeech.create({
      memberId: britney._id,
      ccProject: 'CC1',
      title: 'Shifting Gears',
      date: new Date('2026-09-27'),
      meetingId: meeting213._id,
      meetingNo: 213,
      evaluatorId: savini?._id,
      evaluatorName: 'Savini Yasanayake',
      source: 'meeting'
    });
  }

  // Seed CL Records
  const clSeedData = [
    { memberId: chathumina?._id, projectOrRole: 'TMOD', date: new Date('2026-09-27'), meetingNo: 213 },
    { memberId: nilanka?._id, projectOrRole: 'Ah-Counter', date: new Date('2026-09-27'), meetingNo: 213 },
    { memberId: ifra?._id, projectOrRole: 'Grammarian', date: new Date('2026-09-27'), meetingNo: 213 },
    { memberId: vishakya?._id, projectOrRole: 'Timer', date: new Date('2026-09-27'), meetingNo: 213 },
    { memberId: sahnas?._id, projectOrRole: 'General Evaluator', date: new Date('2026-09-27'), meetingNo: 213 },
    { memberId: chenula?._id, projectOrRole: 'Round Robin Master', date: new Date('2026-09-27'), meetingNo: 213 },
    { memberId: mihijith?._id, projectOrRole: 'Table Topics Master', date: new Date('2026-09-27'), meetingNo: 213 }
  ];

  for (const cl of clSeedData) {
    if (cl.memberId) {
      await CLRecord.create(cl);
    }
  }

  // Seed Backup Standby Pool
  const savindu = await Member.findOne({ name: /Savindu/i });
  const ravindu = await Member.findOne({ name: /Ravindu/i });
  const ashen = await Member.findOne({ name: /Ashen/i });
  
  if (savindu) {
    await BackupPool.create({
      memberId: savindu._id,
      type: 'speaker',
      roles: ['Prepared Speaker'],
      priorityFlag: true, // "first in line next meeting"
      status: 'available',
      reasonForStandby: 'Completed speech draft ready for CC1/CC2',
      notes: 'Requested next available speech slot'
    });
  }

  if (ravindu) {
    await BackupPool.create({
      memberId: ravindu._id,
      type: 'roleplayer',
      roles: ['Timer', 'Ah-Counter', 'Grammarian'],
      priorityFlag: true,
      status: 'available',
      reasonForStandby: 'Trained on Tag Team roles',
      notes: 'Available for immediate standby'
    });
  }

  if (ashen) {
    await BackupPool.create({
      memberId: ashen._id,
      type: 'both',
      roles: ['Table Topics Master', 'Round Robin Master', 'Prepared Speaker'],
      priorityFlag: false,
      status: 'available',
      reasonForStandby: 'General standby roster'
    });
  }

  console.log('[Seed] Database successfully populated with real SLIIT Gavel Club data!');
}

if (require.main === module) {
  seedAll().then(() => {
    console.log('[Seed] Done. Exiting...');
    process.exit(0);
  }).catch(err => {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  });
}

module.exports = seedAll;
