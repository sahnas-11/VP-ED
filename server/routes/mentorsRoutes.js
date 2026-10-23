const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
  getMentorsOverview,
  getSuggestedMentor,
  assignMentor,
  importExcelMentorMentees
} = require('../controllers/mentorsController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/overview', getMentorsOverview);
router.get('/suggest-match', getSuggestedMentor);
router.post('/assign', requireAuth, assignMentor);
router.post('/import-excel', requireAuth, upload.single('file'), importExcelMentorMentees);

module.exports = router;
