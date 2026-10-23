const ExcelJS = require('exceljs');
const ics = require('ics');
const PdfPrinter = require('pdfmake');
const Event = require('../models/Event');
const Member = require('../models/Member');
const Meeting = require('../models/Meeting');
const MentorAssignment = require('../models/MentorAssignment');
const RoleScript = require('../models/RoleScript');
const CCProject = require('../models/CCProject');

// Standard fonts for pdfmake
const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};
const printer = new PdfPrinter(fonts);

// Helper to stream PDF response
function streamPdf(docDefinition, filename, res) {
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  pdfDoc.pipe(res);
  pdfDoc.end();
}

// 1. Export Calendar as ICS (iCalendar)
const exportCalendarICS = async (req, res) => {
  const events = await Event.find({
    start: { $gte: new Date('2026-11-01') },
    type: { $ne: 'exam_break' }
  }).sort({ start: 1 });

  const icsEvents = events.map(e => {
    const s = new Date(e.start);
    const end = new Date(e.end);
    return {
      start: [s.getFullYear(), s.getMonth() + 1, s.getDate(), s.getHours(), s.getMinutes()],
      end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()],
      title: e.title,
      description: e.notes || `${e.type.toUpperCase()} - SLIIT Gavel Club`,
      location: e.venue || 'SLIIT Malabe F404',
      status: 'CONFIRMED'
    };
  });

  ics.createEvents(icsEvents, (error, value) => {
    if (error) {
      return res.status(500).json({ message: 'ICS generation failed', error });
    }
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="sliit_gavel_term_calendar.ics"');
    res.send(value);
  });
};

// 2. Export Calendar to Excel
const exportCalendarExcel = async (req, res) => {
  const events = await Event.find().sort({ start: 1 });
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Term Calendar');

  sheet.columns = [
    { header: 'Title', key: 'title', width: 35 },
    { header: 'Type', key: 'type', width: 16 },
    { header: 'Start Date & Time', key: 'start', width: 22 },
    { header: 'End Date & Time', key: 'end', width: 22 },
    { header: 'Venue', key: 'venue', width: 25 },
    { header: 'Theme', key: 'theme', width: 25 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Notes / Warnings', key: 'notes', width: 40 }
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE06D88' } };

  events.forEach(e => {
    sheet.addRow({
      title: e.title,
      type: e.type,
      start: new Date(e.start).toLocaleString('en-LK'),
      end: new Date(e.end).toLocaleString('en-LK'),
      venue: e.venue,
      theme: e.theme,
      status: e.status,
      notes: e.conflictWarning || e.notes
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="SLIIT_Gavel_Term_Calendar.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
};

// 3. Export Members and Trackers to Excel
const exportMembersExcel = async (req, res) => {
  const members = await Member.find().sort({ name: 1 }).populate('mentorId', 'name preferredName');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Members Roster');

  sheet.columns = [
    { header: 'Full Name', key: 'name', width: 30 },
    { header: 'Preferred Name', key: 'preferredName', width: 18 },
    { header: 'WhatsApp / Phone', key: 'contact', width: 18 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Batch', key: 'batch', width: 10 },
    { header: 'Faculty', key: 'faculty', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Assigned Mentor', key: 'mentor', width: 25 },
    { header: 'CC Level', key: 'ccLevel', width: 12 },
    { header: 'CL Progress', key: 'clProgress', width: 12 },
    { header: 'Activity Score', key: 'activityScore', width: 14 },
    { header: 'Reliability (%)', key: 'reliabilityScore', width: 15 },
    { header: 'Dependable Badge', key: 'badge', width: 16 }
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD46A85' } };

  members.forEach(m => {
    sheet.addRow({
      name: m.name,
      preferredName: m.preferredName,
      contact: m.contact || m.whatsapp,
      email: m.email,
      batch: m.batch,
      faculty: m.faculty,
      status: m.status,
      mentor: m.mentorId ? (m.mentorId.preferredName || m.mentorId.name) : 'Unassigned',
      ccLevel: `CC${m.ccLevel || 0}`,
      clProgress: `CL ${m.clProgress || 0}/10`,
      activityScore: m.activityScore,
      reliabilityScore: `${m.reliabilityScore}%`,
      badge: m.isDependableBadge ? 'Yes (Star)' : 'No'
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="SLIIT_Gavel_Members_Tracker.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
};

// 4. Export Mentor Mentee Pairings to Excel
const exportMentorMenteeExcel = async (req, res) => {
  const mentors = await Member.find({ isMentor: true }).sort({ name: 1 });
  const assignments = await MentorAssignment.find()
    .populate('mentorId', 'name preferredName contact')
    .populate('menteeId', 'name preferredName contact email batch ccLevel');

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Mentor-Mentee Pairings');

  sheet.columns = [
    { header: 'Mentor Name', key: 'mentor', width: 28 },
    { header: 'Mentor Contact', key: 'mentorContact', width: 18 },
    { header: 'Mentee Name', key: 'mentee', width: 28 },
    { header: 'Mentee Email', key: 'menteeEmail', width: 28 },
    { header: 'Mentee Contact', key: 'menteeContact', width: 18 },
    { header: 'Batch', key: 'batch', width: 10 },
    { header: 'CC Level', key: 'ccLevel', width: 12 },
    { header: 'Assigned Date', key: 'assignedAt', width: 16 }
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC25975' } };

  assignments.forEach(a => {
    if (a.mentorId && a.menteeId) {
      sheet.addRow({
        mentor: a.mentorId.name,
        mentorContact: a.mentorId.contact,
        mentee: a.menteeId.name,
        menteeEmail: a.menteeId.email,
        menteeContact: a.menteeId.contact,
        batch: a.menteeId.batch,
        ccLevel: `CC${a.menteeId.ccLevel || 0}`,
        assignedAt: new Date(a.assignedAt).toLocaleDateString('en-GB')
      });
    }
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="SLIIT_Gavel_Mentor_Mentee_Assignments.xlsx"');
  await workbook.xlsx.write(res);
  res.end();
};

// 5. Generate Meeting Agenda PDF (Copying 213th meeting layout exactly in cute pink aesthetic)
const exportMeetingAgendaPDF = async (req, res) => {
  const { id } = req.params;
  const meeting = await Meeting.findById(id)
    .populate('roleAssignments.memberId')
    .populate('preparedSpeeches.speakerId')
    .populate('preparedSpeeches.evaluatorId')
    .populate('tableTopicsEvaluators.evaluatorId');

  if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

  const meetingDateStr = new Date(meeting.date).toLocaleDateString('en-GB');

  // Find role assignments
  const getRoleName = (rName) => {
    const r = meeting.roleAssignments.find(x => x.role === rName);
    return r && r.memberId ? `GV ${r.memberId.preferredName || r.memberId.name}` : 'TBD';
  };

  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [28, 28, 28, 30],
    background: function(currentPage, pageSize) {
      return {
        canvas: [
          // Header navy bar
          { type: 'rect', x: 0, y: 0, w: pageSize.width, h: 90, color: '#1B2A4A' },
          // Left sidebar pink tint
          { type: 'rect', x: 0, y: 90, w: 185, h: pageSize.height - 120, color: '#FDF2F4' },
          // Footer navy bar
          { type: 'rect', x: 0, y: pageSize.height - 30, w: pageSize.width, h: 30, color: '#1B2A4A' }
        ]
      };
    },
    content: [
      // Top Header
      {
        columns: [
          {
            text: [
              { text: 'SLIIT GAVEL CLUB\n', fontSize: 13, bold: true, color: '#FFFFFF' },
              { text: `${meeting.meetingNo}TH EDUCATIONAL MEETING\n`, fontSize: 20, bold: true, color: '#F8B4C4' },
              { text: 'MEETING AGENDA', fontSize: 16, bold: true, color: '#FFFFFF' }
            ],
            width: '*'
          },
          {
            text: [
              { text: `DATE: ${meetingDateStr}\n`, fontSize: 10, bold: true, color: '#FFFFFF' },
              { text: `TIME: ${meeting.startTime} ONWARDS\n`, fontSize: 10, bold: true, color: '#FFFFFF' },
              { text: `VENUE: ${meeting.venue}\n`, fontSize: 9, color: '#F8B4C4' },
              { text: 'sliitgavel@gmail.com', fontSize: 9, color: '#FFFFFF' }
            ],
            alignment: 'right',
            width: 200
          }
        ],
        margin: [10, 0, 10, 20]
      },

      // Subheader: Theme bar
      {
        table: {
          widths: ['*'],
          body: [[
            {
              text: `“${meeting.theme.toUpperCase()}” — THEMED MEETING`,
              alignment: 'center',
              bold: true,
              fontSize: 12,
              fillColor: '#9E3258',
              color: '#FFFFFF',
              margin: [0, 4, 0, 4]
            }
          ]]
        },
        layout: 'noBorders',
        margin: [0, 5, 0, 15]
      },

      // Main columns: Left sidebar (Exco + Mission) & Right content (Timeline & Speeches)
      {
        columns: [
          // Left Sidebar (Exco list & Club Mission)
          {
            width: 170,
            margin: [5, 0, 15, 0],
            stack: [
              { text: 'CLUB EXECUTIVE COMMITTEE', fontSize: 9, bold: true, color: '#882D4B', margin: [0, 0, 0, 8] },
              
              { text: 'PRESIDENT', fontSize: 8, bold: true, color: '#666666' },
              { text: meeting.excoSnapshot?.president?.name || 'Pavan Kumarage', fontSize: 9, bold: true, color: '#1B2A4A' },
              { text: `${meeting.excoSnapshot?.president?.phone || '071 356 0640'}\n${meeting.excoSnapshot?.president?.email || 'pavanvilhan@gmail.com'}`, fontSize: 7, color: '#777777', margin: [0, 1, 0, 6] },

              { text: 'VICE PRESIDENT EDUCATION', fontSize: 8, bold: true, color: '#666666' },
              { text: meeting.excoSnapshot?.vpe?.name || 'Sahnas Thufail', fontSize: 9, bold: true, color: '#1B2A4A' },
              { text: `${meeting.excoSnapshot?.vpe?.phone || '071 663 3585'}\n${meeting.excoSnapshot?.vpe?.email || 'sahnasthufail@gmail.com'}`, fontSize: 7, color: '#777777', margin: [0, 1, 0, 6] },

              { text: 'VICE PRESIDENT MEMBERSHIP', fontSize: 8, bold: true, color: '#666666' },
              { text: meeting.excoSnapshot?.vpm?.name || 'Dilni Nishshanka', fontSize: 9, bold: true, color: '#1B2A4A' },
              { text: `${meeting.excoSnapshot?.vpm?.phone || '076 320 1664'}\n${meeting.excoSnapshot?.vpm?.email || 'nishshankadilni@gmail.com'}`, fontSize: 7, color: '#777777', margin: [0, 1, 0, 6] },

              { text: 'VICE PRESIDENT PUBLIC RELATIONS', fontSize: 8, bold: true, color: '#666666' },
              { text: meeting.excoSnapshot?.vppr?.name || 'Savini Yasanayake', fontSize: 9, bold: true, color: '#1B2A4A' },
              { text: `${meeting.excoSnapshot?.vppr?.phone || '077 888 5070'}\n${meeting.excoSnapshot?.vppr?.email || 'syasanayake@gmail.com'}`, fontSize: 7, color: '#777777', margin: [0, 1, 0, 6] },

              { text: 'SECRETARY', fontSize: 8, bold: true, color: '#666666' },
              { text: meeting.excoSnapshot?.secretary?.name || 'Mahira Ramzeen', fontSize: 9, bold: true, color: '#1B2A4A' },
              { text: `${meeting.excoSnapshot?.secretary?.phone || '077 841 9717'}\n${meeting.excoSnapshot?.secretary?.email || 'mahiraramzeen@gmail.com'}`, fontSize: 7, color: '#777777', margin: [0, 1, 0, 6] },

              { text: 'TREASURER', fontSize: 8, bold: true, color: '#666666' },
              { text: meeting.excoSnapshot?.treasurer?.name || 'Shamla Bishirhafi', fontSize: 9, bold: true, color: '#1B2A4A' },
              { text: `${meeting.excoSnapshot?.treasurer?.phone || '077 781 3593'}\n${meeting.excoSnapshot?.treasurer?.email || 'hafishamla@gmail.com'}`, fontSize: 7, color: '#777777', margin: [0, 1, 0, 6] },

              { text: 'SERGEANT-AT-ARMS', fontSize: 8, bold: true, color: '#666666' },
              { text: meeting.excoSnapshot?.saa?.name || 'Malindu Dushan', fontSize: 9, bold: true, color: '#1B2A4A' },
              { text: `${meeting.excoSnapshot?.saa?.phone || '070 587 2977'}\n${meeting.excoSnapshot?.saa?.email || 'malindudushan83@gmail.com'}`, fontSize: 7, color: '#777777', margin: [0, 1, 0, 12] },

              { text: 'CLUB MISSION:', fontSize: 9, bold: true, color: '#882D4B', margin: [0, 6, 0, 4] },
              {
                text: 'We provide a supportive and positive learning experience in which members are empowered to develop communication and leadership skills, resulting in greater self-confidence and personal growth.',
                fontSize: 7.5,
                italics: true,
                color: '#333333',
                lineHeight: 1.2
              }
            ]
          },

          // Right Column: Meeting Timings, Roles & Speakers
          {
            width: '*',
            stack: [
              // Word of the day box
              {
                table: {
                  widths: ['*'],
                  body: [[
                    {
                      text: [
                        { text: 'WORD OF THE DAY: ', bold: true, color: '#882D4B' },
                        { text: `${meeting.wordOfTheDay || 'Resilience'} — `, bold: true, color: '#1B2A4A' },
                        { text: meeting.wordMeaning || 'The capacity to recover quickly from difficulties.', italics: true, color: '#555555' }
                      ],
                      fillColor: '#FFF0F5',
                      fontSize: 8.5,
                      margin: [6, 4, 6, 4]
                    }
                  ]]
                },
                layout: 'noBorders',
                margin: [0, 0, 0, 10]
              },

              // Meeting Flow Timetable
              {
                columns: [
                  { text: meeting.fellowshipTime || '01:30 PM', bold: true, width: 60, fontSize: 8.5, color: '#882D4B' },
                  { text: 'Fellowship', bold: true, fontSize: 8.5 }
                ],
                margin: [0, 2, 0, 2]
              },
              {
                columns: [
                  { text: meeting.startTime || '02:00 PM', bold: true, width: 60, fontSize: 8.5, color: '#882D4B' },
                  { text: 'President Calls the Meeting to Order & Greets the Guests', bold: true, fontSize: 8.5 }
                ],
                margin: [0, 2, 0, 2]
              },
              {
                columns: [
                  { text: '02:10 PM', bold: true, width: 60, fontSize: 8.5, color: '#882D4B' },
                  {
                    text: [
                      { text: 'President Introduces the Toastmaster of the Day\n' },
                      { text: `Toastmaster of the Day: `, italics: true },
                      { text: getRoleName('TMOD'), bold: true, color: '#882D4B' }
                    ],
                    fontSize: 8.5
                  }
                ],
                margin: [0, 2, 0, 2]
              },
              {
                columns: [
                  { text: '02:15 PM', bold: true, width: 60, fontSize: 8.5, color: '#882D4B' },
                  {
                    text: [
                      { text: 'TMOD Calls on Meeting Roles:\n', bold: true },
                      { text: `• Ah - Counter: ${getRoleName('Ah-Counter')}\n` },
                      { text: `• Grammarian: ${getRoleName('Grammarian')}\n` },
                      { text: `• Timer: ${getRoleName('Timer')}\n` },
                      { text: `• General Evaluator: ${getRoleName('General Evaluator')}` }
                    ],
                    fontSize: 8
                  }
                ],
                margin: [0, 2, 0, 2]
              },
              {
                columns: [
                  { text: '02:25 PM', bold: true, width: 60, fontSize: 8.5, color: '#882D4B' },
                  {
                    text: [
                      { text: `TMOD Introduces Round Robin Master: `, bold: true },
                      { text: `${getRoleName('Round Robin Master')}\n`, color: '#882D4B', bold: true },
                      { text: 'Return Control to the Toastmaster', italics: true, fontSize: 7.5 }
                    ],
                    fontSize: 8.5
                  }
                ],
                margin: [0, 2, 0, 2]
              },

              // Prepared Speakers Table Header
              {
                columns: [
                  { text: '03:05 PM', bold: true, width: 60, fontSize: 8.5, color: '#882D4B' },
                  { text: 'TMOD briefs about Evaluators and Prepared Speakers', bold: true, fontSize: 8.5 }
                ],
                margin: [0, 3, 0, 4]
              },

              // Prepared Speeches Table (Exact match to 213th agenda table)
              {
                table: {
                  headerRows: 1,
                  widths: ['*', 70, '*'],
                  body: [
                    [
                      { text: 'SPEAKER', bold: true, alignment: 'center', fillColor: '#1B2A4A', color: '#FFFFFF', fontSize: 8 },
                      { text: 'PROJECT', bold: true, alignment: 'center', fillColor: '#1B2A4A', color: '#FFFFFF', fontSize: 8 },
                      { text: 'EVALUATOR', bold: true, alignment: 'center', fillColor: '#1B2A4A', color: '#FFFFFF', fontSize: 8 }
                    ],
                    ...(meeting.preparedSpeeches && meeting.preparedSpeeches.length > 0
                      ? meeting.preparedSpeeches.map((ps, idx) => [
                          { text: ps.speakerId ? `GV ${ps.speakerId.preferredName || ps.speakerId.name}` : 'TBD', alignment: 'center', fillColor: idx % 2 === 0 ? '#EAEFFA' : '#FFFFFF', fontSize: 8 },
                          { text: ps.ccProject || 'CC1', alignment: 'center', fillColor: idx % 2 === 0 ? '#EAEFFA' : '#FFFFFF', fontSize: 8, bold: true },
                          { text: ps.evaluatorId ? `GV ${ps.evaluatorId.preferredName || ps.evaluatorId.name}` : 'TBD', alignment: 'center', fillColor: idx % 2 === 0 ? '#EAEFFA' : '#FFFFFF', fontSize: 8 }
                        ])
                      : [
                          [{ text: 'GV Mahira', alignment: 'center', fontSize: 8 }, { text: 'CC9', alignment: 'center', fontSize: 8 }, { text: 'GV Pavan', alignment: 'center', fontSize: 8 }],
                          [{ text: 'GV Devinda', alignment: 'center', fontSize: 8 }, { text: 'CC1', alignment: 'center', fontSize: 8 }, { text: 'GV Nethmi', alignment: 'center', fontSize: 8 }],
                          [{ text: 'GV Britney', alignment: 'center', fontSize: 8 }, { text: 'CC1', alignment: 'center', fontSize: 8 }, { text: 'GV Savini', alignment: 'center', fontSize: 8 }]
                        ])
                  ]
                },
                margin: [60, 2, 0, 8]
              },

              {
                columns: [
                  { text: '03:35 PM', bold: true, width: 60, fontSize: 8.5, color: '#882D4B' },
                  {
                    text: [
                      { text: 'TMOD Introduces Table Topics Master: ', bold: true },
                      { text: `${getRoleName('Table Topics Master')}\n`, color: '#882D4B', bold: true },
                      { text: 'Return Control to the Toastmaster', italics: true, fontSize: 7.5 }
                    ],
                    fontSize: 8.5
                  }
                ],
                margin: [0, 2, 0, 2]
              },
              {
                columns: [
                  { text: '03:50 PM', bold: true, width: 60, fontSize: 8.5, color: '#882D4B' },
                  {
                    text: [
                      { text: `TMOD Introduces General Evaluator: ${getRoleName('General Evaluator')}\n`, bold: true },
                      { text: 'The General Evaluator calls for the reports:\n', fontSize: 7.5, italics: true },
                      { text: `• Timer: ${getRoleName('Timer')}\n• Ah-Counter: ${getRoleName('Ah-Counter')}\n• Prepared Speech Evaluators\n• Table Topics Speech Evaluations\n• Grammarian: ${getRoleName('Grammarian')}\n• General Evaluator’s Report`, fontSize: 7.5 }
                    ],
                    fontSize: 8.5
                  }
                ],
                margin: [0, 2, 0, 2]
              },
              {
                columns: [
                  { text: '04:10 PM', bold: true, width: 60, fontSize: 8.5, color: '#882D4B' },
                  {
                    text: [
                      { text: 'TMOD Calls for Votes and Presents Meeting Awards\n', bold: true },
                      { text: 'Best Speaker | Best Table Topics Speaker | Best Evaluator | Best Roleplayer\n', italics: true, fontSize: 7.5, color: '#882D4B' },
                      { text: 'Returns Control to the President', fontSize: 7.5 }
                    ],
                    fontSize: 8.5
                  }
                ],
                margin: [0, 2, 0, 2]
              },
              {
                columns: [
                  { text: '04:25 PM', bold: true, width: 60, fontSize: 8.5, color: '#882D4B' },
                  { text: 'President makes Closing Remarks and Meeting Adjourns', bold: true, fontSize: 8.5 }
                ],
                margin: [0, 2, 0, 4]
              }
            ]
          }
        ]
      },

      // Footer Banner Text
      {
        text: '#GAVELNEVERSTOPS',
        color: '#FFFFFF',
        bold: true,
        fontSize: 10,
        alignment: 'center',
        margin: [0, 20, 0, 0]
      }
    ]
  };

  streamPdf(docDefinition, `SLIIT_Gavel_Meeting_${meeting.meetingNo}_Agenda.pdf`, res);
};

// 6. Role Scripts and Logs Bundle PDF
const exportScriptsAndLogsPDF = async (req, res) => {
  const scripts = await RoleScript.find();
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [35, 35, 35, 35],
    content: [
      { text: 'SLIIT GAVEL CLUB', fontSize: 22, bold: true, color: '#9E3258', alignment: 'center' },
      { text: 'MEETING ROLE SCRIPTS & LOG SHEETS BUNDLE', fontSize: 13, bold: true, color: '#1B2A4A', alignment: 'center', margin: [0, 4, 0, 15] },
      { text: 'Official guides, verbal introduction scripts, and log recording sheets for meeting role players.', italics: true, fontSize: 9, alignment: 'center', margin: [0, 0, 0, 20] },

      ...scripts.map(s => ([
        { text: `${s.title.toUpperCase()}`, fontSize: 13, bold: true, color: '#882D4B', margin: [0, 10, 0, 4] },
        { text: s.description || '', italics: true, fontSize: 8.5, margin: [0, 0, 0, 6] },
        {
          table: {
            widths: ['*'],
            body: [[{ text: s.script, fontSize: 8.5, lineHeight: 1.2, fillColor: '#FFF5F7', margin: [6, 6, 6, 6] }]]
          },
          layout: 'noBorders',
          margin: [0, 0, 0, 8]
        },
        s.logTemplate?.columns ? {
          text: `Log Sheet Columns: ${s.logTemplate.columns.join(' | ')}`,
          fontSize: 8,
          bold: true,
          color: '#555555',
          margin: [0, 0, 0, 10]
        } : null
      ])).flat().filter(Boolean)
    ]
  };

  streamPdf(docDefinition, 'SLIIT_Gavel_Role_Scripts_And_Logs.pdf', res);
};

// 7. CC Speech Guide PDF (CC1 - CC10)
const exportCCSpeechGuidePDF = async (req, res) => {
  const projects = await CCProject.find().sort({ number: 1 });
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [35, 35, 35, 35],
    content: [
      { text: 'COMPETENT COMMUNICATION (CC) SPEECH GUIDE', fontSize: 18, bold: true, color: '#9E3258', alignment: 'center' },
      { text: 'SLIIT GAVEL CLUB — CC1 TO CC10 MANUAL REFERENCE', fontSize: 11, bold: true, color: '#1B2A4A', alignment: 'center', margin: [0, 4, 0, 20] },

      ...projects.map(p => ([
        { text: `Project ${p.number}: ${p.name} (${p.timeMin}–${p.timeMax} Minutes)`, fontSize: 12, bold: true, color: '#882D4B', margin: [0, 8, 0, 3] },
        { text: p.executiveSummary, fontSize: 8.5, italics: true, color: '#444444', margin: [0, 0, 0, 4] },
        { text: 'Objectives:', bold: true, fontSize: 8.5, color: '#1B2A4A' },
        {
          ul: p.objectives.map(obj => ({ text: obj, fontSize: 8 })),
          margin: [0, 2, 0, 6]
        }
      ])).flat()
    ]
  };

  streamPdf(docDefinition, 'SLIIT_Gavel_CC_Speech_Guide.pdf', res);
};

module.exports = {
  exportCalendarICS,
  exportCalendarExcel,
  exportMembersExcel,
  exportMentorMenteeExcel,
  exportMeetingAgendaPDF,
  exportScriptsAndLogsPDF,
  exportCCSpeechGuidePDF
};
