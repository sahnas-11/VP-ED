const ExcelJS = require('exceljs');
const path = require('path');
const Member = require('../models/Member');
const MentorAssignment = require('../models/MentorAssignment');

async function seedMentorMentees(filePath) {
  const resolvedPath = filePath || path.join(__dirname, 'Mentor_Mentee_Assignment.xlsx');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(resolvedPath);

  const worksheet = workbook.getWorksheet('Mentor-Mentee Assignments') || workbook.worksheets[0];
  
  let currentMentorMember = null;
  const mentorDocs = new Map(); // Name -> Member doc
  let importedMentors = 0;
  let importedMentees = 0;

  // Clear existing mentor assignments and test members
  await MentorAssignment.deleteMany({});
  await Member.deleteMany({});

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // header
    const colId = row.getCell(1).value;
    const role = row.getCell(2).value ? String(row.getCell(2).value).trim() : '';
    const fullName = row.getCell(3).value ? String(row.getCell(3).value).trim() : '';
    const preferredName = row.getCell(4).value ? String(row.getCell(4).value).trim() : '';
    const email = row.getCell(5).value ? String(row.getCell(5).text || row.getCell(5).value).trim() : '';
    const whatsapp = row.getCell(6).value ? String(row.getCell(6).value).trim() : '';

    if (fullName) {
      rows.push({ colId, role, fullName, preferredName, email, whatsapp });
    }
  });

  for (const item of rows) {
    if (item.role.toUpperCase() === 'MENTOR') {
      // Create Mentor Member
      let mentor = await Member.findOne({ fullName: item.fullName });
      if (!mentor) {
        mentor = await Member.create({
          name: item.fullName,
          preferredName: item.preferredName || item.fullName.split(' ')[0],
          contact: item.whatsapp,
          whatsapp: item.whatsapp,
          email: item.email || `${item.preferredName.toLowerCase().replace(/\s+/g, '')}@sliitgavel.org`,
          batch: 'Y3/Y4',
          faculty: 'Faculty of Computing',
          status: 'active',
          isMentor: true,
          maxMentees: 10,
          ccLevel: 3,
          clProgress: 4,
          activityScore: 92,
          reliabilityScore: 100,
          rolesCompletedCount: 8,
          speechesGivenCount: 3,
          isDependableBadge: true
        });
      }
      currentMentorMember = mentor;
      mentorDocs.set(item.fullName, mentor);
      importedMentors++;
    } else if (item.role.toUpperCase() === 'MENTEE') {
      // Create Mentee Member linked to current mentor
      const mentee = await Member.create({
        name: item.fullName,
        preferredName: item.preferredName || item.fullName.split(' ')[0],
        contact: item.whatsapp,
        whatsapp: item.whatsapp,
        email: item.email,
        batch: item.email && item.email.includes('it25') ? 'Y1' : (item.email && item.email.includes('it24') ? 'Y2' : 'Y1/Y2'),
        faculty: 'Faculty of Computing',
        status: 'active',
        isMentor: false,
        mentorId: currentMentorMember ? currentMentorMember._id : null,
        ccLevel: 0,
        clProgress: 0,
        activityScore: 65,
        reliabilityScore: 95,
        rolesCompletedCount: 1,
        speechesGivenCount: 0,
        isDependableBadge: false
      });

      if (currentMentorMember) {
        await MentorAssignment.create({
          mentorId: currentMentorMember._id,
          menteeId: mentee._id,
          assignedAt: new Date('2026-09-01T00:00:00.000Z'),
          history: [{
            previousMentorId: null,
            changedAt: new Date('2026-09-01T00:00:00.000Z'),
            reason: 'Initial Excel Batch Assignment'
          }]
        });
      }
      importedMentees++;
    }
  }

  // Also seed additional key Gaveliers from the 213th agenda who might not be in the mentor sheet
  const additionalMembers = [
    { name: 'GV Chathumina', preferredName: 'Chathumina', contact: '071 112 2334', batch: 'Y2', faculty: 'Engineering', ccLevel: 2, clProgress: 3, rolesCompletedCount: 5, speechesGivenCount: 2 },
    { name: 'GV Nilanka', preferredName: 'Nilanka', contact: '072 223 3445', batch: 'Y1', faculty: 'Computing', ccLevel: 1, clProgress: 1, rolesCompletedCount: 3, speechesGivenCount: 1 },
    { name: 'GV Ifra', preferredName: 'Ifra', contact: '077 334 4556', batch: 'Y2', faculty: 'Business', ccLevel: 1, clProgress: 2, rolesCompletedCount: 4, speechesGivenCount: 1 },
    { name: 'GV Vishakya', preferredName: 'Vishakya', contact: '078 445 5667', batch: 'Y1', faculty: 'Computing', ccLevel: 1, clProgress: 2, rolesCompletedCount: 3, speechesGivenCount: 1 },
    { name: 'GV Chenula', preferredName: 'Chenula', contact: '075 556 6778', batch: 'Y2', faculty: 'Computing', ccLevel: 1, clProgress: 1, rolesCompletedCount: 2, speechesGivenCount: 1 },
    { name: 'GV Britney', preferredName: 'Britney', contact: '076 667 7889', batch: 'Y1', faculty: 'Computing', ccLevel: 0, clProgress: 0, rolesCompletedCount: 1, speechesGivenCount: 0 },
    { name: 'Dilni Nishshanka', preferredName: 'Dilni', contact: '076 320 1664', email: 'nishshankadilni@gmail.com', batch: 'Y3', faculty: 'Computing', ccLevel: 3, clProgress: 4, isMentor: true, rolesCompletedCount: 7, speechesGivenCount: 3 },
    { name: 'Malindu Dushan', preferredName: 'Malindu', contact: '070 587 2977', email: 'malindudushan83@gmail.com', batch: 'Y2', faculty: 'Computing', ccLevel: 2, clProgress: 3, rolesCompletedCount: 6, speechesGivenCount: 2 }
  ];

  for (const m of additionalMembers) {
    const existing = await Member.findOne({ name: m.name });
    if (!existing) {
      await Member.create({
        name: m.name,
        preferredName: m.preferredName,
        contact: m.contact,
        whatsapp: m.contact,
        email: m.email || `${m.preferredName.toLowerCase()}@sliitgavel.org`,
        batch: m.batch,
        faculty: m.faculty,
        status: 'active',
        isMentor: m.isMentor || false,
        ccLevel: m.ccLevel,
        clProgress: m.clProgress,
        activityScore: 78,
        reliabilityScore: 98,
        rolesCompletedCount: m.rolesCompletedCount,
        speechesGivenCount: m.speechesGivenCount,
        isDependableBadge: true
      });
    }
  }

  console.log(`[Seed] Seeded ${importedMentors} Mentors and ${importedMentees} Mentees from Excel.`);
  return { importedMentors, importedMentees };
}

module.exports = { seedMentorMentees };
