const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  generateMeetingDates,
  getTermOverview,
  getAcademicPeriods,
  createAcademicPeriod,
  deleteAcademicPeriod
} = require('../controllers/calendarController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/events', getEvents);
router.post('/events', requireAuth, createEvent);
router.put('/events/:id', requireAuth, updateEvent);
router.delete('/events/:id', requireAuth, deleteEvent);

router.post('/generate-dates', requireAuth, generateMeetingDates);
router.get('/term-overview', getTermOverview);

router.get('/academic-periods', getAcademicPeriods);
router.post('/academic-periods', requireAuth, createAcademicPeriod);
router.delete('/academic-periods/:id', requireAuth, deleteAcademicPeriod);

module.exports = router;
