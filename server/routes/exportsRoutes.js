const express = require('express');
const router = express.Router();
const {
  exportCalendarICS,
  exportCalendarExcel,
  exportMembersExcel,
  exportMentorMenteeExcel,
  exportMeetingAgendaPDF,
  exportScriptsAndLogsPDF,
  exportCCSpeechGuidePDF
} = require('../controllers/exportsController');

router.get('/calendar/ics', exportCalendarICS);
router.get('/calendar/excel', exportCalendarExcel);
router.get('/members/excel', exportMembersExcel);
router.get('/mentors/excel', exportMentorMenteeExcel);
router.get('/meeting/:id/agenda-pdf', exportMeetingAgendaPDF);
router.get('/role-scripts-pdf', exportScriptsAndLogsPDF);
router.get('/cc-guide-pdf', exportCCSpeechGuidePDF);

module.exports = router;
