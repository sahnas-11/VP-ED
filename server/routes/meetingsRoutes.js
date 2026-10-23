const express = require('express');
const router = express.Router();
const {
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  getRoleRecommendations,
  checkMeetingRoleConflicts,
  syncMeetingTrackersEndpoint
} = require('../controllers/meetingsController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', getMeetings);
router.post('/', requireAuth, createMeeting);
router.get('/recommendations', getRoleRecommendations);
router.post('/check-conflicts', checkMeetingRoleConflicts);
router.get('/:id', getMeetingById);
router.put('/:id', requireAuth, updateMeeting);
router.post('/:id/sync-trackers', requireAuth, syncMeetingTrackersEndpoint);

module.exports = router;
