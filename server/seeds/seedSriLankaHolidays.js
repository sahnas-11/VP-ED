const Event = require('../models/Event');
const AcademicPeriod = require('../models/AcademicPeriod');

const sriLankaHolidays = [
  // Nov 2026
  {
    title: 'Il Full Moon Poya Day',
    type: 'holiday',
    start: new Date('2026-11-23T00:00:00.000Z'),
    end: new Date('2026-11-23T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Moon-based Buddhist observance'
  },
  // Dec 2026
  {
    title: 'Unduvap Full Moon Poya Day',
    type: 'holiday',
    start: new Date('2026-12-23T00:00:00.000Z'),
    end: new Date('2026-12-23T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Sanghamitta Theri arrival commemoration'
  },
  {
    title: 'Christmas Day',
    type: 'holiday',
    start: new Date('2026-12-25T00:00:00.000Z'),
    end: new Date('2026-12-25T23:59:59.000Z'),
    isBreak: true,
    tentative: false,
    notes: 'Public, Bank and Mercantile Holiday'
  },
  // Jan 2027
  {
    title: 'Tamil Thai Pongal Day',
    type: 'holiday',
    start: new Date('2027-01-15T00:00:00.000Z'),
    end: new Date('2027-01-15T23:59:59.000Z'),
    isBreak: true,
    tentative: false,
    notes: 'Tamil Harvest Festival'
  },
  {
    title: 'Duruthu Full Moon Poya Day',
    type: 'holiday',
    start: new Date('2027-01-21T00:00:00.000Z'),
    end: new Date('2027-01-21T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'First visit of the Buddha to Sri Lanka'
  },
  // Feb 2027
  {
    title: 'National Independence Day (Sri Lanka)',
    type: 'holiday',
    start: new Date('2027-02-04T00:00:00.000Z'),
    end: new Date('2027-02-04T23:59:59.000Z'),
    isBreak: true,
    tentative: false,
    notes: 'Sri Lanka National Day'
  },
  {
    title: 'Navam Full Moon Poya Day',
    type: 'holiday',
    start: new Date('2027-02-20T00:00:00.000Z'),
    end: new Date('2027-02-20T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Appointment of Chief Disciples'
  },
  {
    title: 'Mahasivarathri Day',
    type: 'holiday',
    start: new Date('2027-02-27T00:00:00.000Z'),
    end: new Date('2027-02-27T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Hindu festival of Lord Shiva'
  },
  // Mar 2027
  {
    title: 'Id-Ul-Fitr (Ramazan Festival Day)',
    type: 'holiday',
    start: new Date('2027-03-09T00:00:00.000Z'),
    end: new Date('2027-03-09T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Islamic celebration (Moon sighting dependent)'
  },
  {
    title: 'Medin Full Moon Poya Day',
    type: 'holiday',
    start: new Date('2027-03-22T00:00:00.000Z'),
    end: new Date('2027-03-22T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Buddha visit to Kimbulwathpura'
  },
  {
    title: 'Good Friday',
    type: 'holiday',
    start: new Date('2027-03-26T00:00:00.000Z'),
    end: new Date('2027-03-26T23:59:59.000Z'),
    isBreak: true,
    tentative: false,
    notes: 'Christian observance'
  },
  // Apr 2027
  {
    title: 'Day prior to Sinhala & Tamil New Year Day',
    type: 'holiday',
    start: new Date('2027-04-12T00:00:00.000Z'),
    end: new Date('2027-04-12T23:59:59.000Z'),
    isBreak: true,
    tentative: false,
    notes: 'Traditional New Year holiday'
  },
  {
    title: 'Sinhala & Tamil New Year Day',
    type: 'holiday',
    start: new Date('2027-04-13T00:00:00.000Z'),
    end: new Date('2027-04-13T23:59:59.000Z'),
    isBreak: true,
    tentative: false,
    notes: 'Aluth Avurudda / Puthandu'
  },
  {
    title: 'Bak Full Moon Poya Day',
    type: 'holiday',
    start: new Date('2027-04-20T00:00:00.000Z'),
    end: new Date('2027-04-20T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Second visit of the Buddha to Nagadipa'
  },
  // May 2027
  {
    title: 'May Day (International Workers\' Day)',
    type: 'holiday',
    start: new Date('2027-05-01T00:00:00.000Z'),
    end: new Date('2027-05-01T23:59:59.000Z'),
    isBreak: true,
    tentative: false,
    notes: 'Public, Bank and Mercantile Holiday'
  },
  {
    title: 'Id-Ul-Alha (Hadji Festival Day)',
    type: 'holiday',
    start: new Date('2027-05-16T00:00:00.000Z'),
    end: new Date('2027-05-16T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Islamic feast (Moon sighting dependent)'
  },
  {
    title: 'Vesak Full Moon Poya Day',
    type: 'holiday',
    start: new Date('2027-05-19T00:00:00.000Z'),
    end: new Date('2027-05-19T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Birth, Enlightenment, and Parinirvana of the Buddha'
  },
  {
    title: 'Day following Vesak Full Moon Poya Day',
    type: 'holiday',
    start: new Date('2027-05-20T00:00:00.000Z'),
    end: new Date('2027-05-20T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Vesak celebration day 2'
  },
  // Jun 2027
  {
    title: 'Poson Full Moon Poya Day',
    type: 'holiday',
    start: new Date('2027-06-18T00:00:00.000Z'),
    end: new Date('2027-06-18T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Introduction of Buddhism to Sri Lanka by Arahat Mahinda'
  },
  // Jul 2027
  {
    title: 'Esala Full Moon Poya Day',
    type: 'holiday',
    start: new Date('2027-07-17T00:00:00.000Z'),
    end: new Date('2027-07-17T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Commemoration of Buddha First Sermon (Dhammacakkappavattana Sutta)'
  },
  // Aug 2027
  {
    title: 'Nikini Full Moon Poya Day',
    type: 'holiday',
    start: new Date('2027-08-16T00:00:00.000Z'),
    end: new Date('2027-08-16T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'First Buddhist Council & Vas retreat commencement'
  },
  {
    title: 'Milad-Un-Nabi (Holy Prophet\'s Birthday)',
    type: 'holiday',
    start: new Date('2027-08-16T00:00:00.000Z'),
    end: new Date('2027-08-16T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Prophet Muhammad birthday celebration'
  },
  // Sep 2027
  {
    title: 'Binara Full Moon Poya Day',
    type: 'holiday',
    start: new Date('2027-09-14T00:00:00.000Z'),
    end: new Date('2027-09-14T23:59:59.000Z'),
    isBreak: true,
    tentative: true,
    notes: 'Establishment of the Bhikkhuni Order'
  }
];

const defaultAcademicPeriods = [
  {
    name: 'SLIIT 2026 Semester 2 Final Examinations',
    type: 'final-exam',
    start: new Date('2026-11-09T00:00:00.000Z'),
    end: new Date('2026-11-22T23:59:59.000Z'),
    isNoMeetingBlock: true,
    notes: 'Campus examination hall block'
  },
  {
    name: 'SLIIT Year-End Vacation / Study Break',
    type: 'holiday',
    start: new Date('2026-12-19T00:00:00.000Z'),
    end: new Date('2027-01-08T23:59:59.000Z'),
    isNoMeetingBlock: true,
    notes: 'University holiday period'
  },
  {
    name: 'SLIIT 2027 Semester 1 Mid-Term Examinations',
    type: 'mid-exam',
    start: new Date('2027-03-15T00:00:00.000Z'),
    end: new Date('2027-03-28T23:59:59.000Z'),
    isNoMeetingBlock: true,
    notes: 'Mid-semester tests for all faculties'
  },
  {
    name: 'SLIIT Sinhala & Tamil New Year Vacation',
    type: 'holiday',
    start: new Date('2027-04-09T00:00:00.000Z'),
    end: new Date('2027-04-18T23:59:59.000Z'),
    isNoMeetingBlock: true,
    notes: 'Sinhala and Tamil New Year university closure'
  },
  {
    name: 'SLIIT 2027 Semester 1 Final Examinations',
    type: 'final-exam',
    start: new Date('2027-05-24T00:00:00.000Z'),
    end: new Date('2027-06-06T23:59:59.000Z'),
    isNoMeetingBlock: true,
    notes: 'Semester 1 exams'
  },
  {
    name: 'SLIIT 2027 Mid-Year Vacation',
    type: 'semester',
    start: new Date('2027-06-07T00:00:00.000Z'),
    end: new Date('2027-07-04T23:59:59.000Z'),
    isNoMeetingBlock: true,
    notes: 'Inter-semester break'
  },
  {
    name: 'SLIIT 2027 Semester 2 Mid-Term Examinations',
    type: 'mid-exam',
    start: new Date('2027-08-16T00:00:00.000Z'),
    end: new Date('2027-08-29T23:59:59.000Z'),
    isNoMeetingBlock: true,
    notes: 'Semester 2 mid exams'
  }
];

async function seedHolidaysAndPeriods() {
  // Clear and seed holidays
  await Event.deleteMany({ type: { $in: ['holiday', 'exam_break'] } });
  for (const h of sriLankaHolidays) {
    await Event.create(h);
  }

  // Clear and seed academic periods
  await AcademicPeriod.deleteMany({});
  for (const p of defaultAcademicPeriods) {
    await AcademicPeriod.create(p);
    // Also add to Event as exam_break so FullCalendar shows them directly
    await Event.create({
      title: `[Exam/Break] ${p.name}`,
      type: 'exam_break',
      start: p.start,
      end: p.end,
      isBreak: true,
      notes: p.notes
    });
  }
  console.log(`[Seed] Seeded ${sriLankaHolidays.length} Sri Lanka Holidays and ${defaultAcademicPeriods.length} Academic Periods.`);
}

module.exports = { sriLankaHolidays, defaultAcademicPeriods, seedHolidaysAndPeriods };
