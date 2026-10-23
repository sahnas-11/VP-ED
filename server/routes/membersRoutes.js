const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
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
} = require('../controllers/membersController');
const { requireAuth } = require('../middleware/authMiddleware');

// Members CRUD
router.get('/', getMembers);
router.post('/', requireAuth, createMember);
router.put('/:id', requireAuth, updateMember);
router.delete('/:id', requireAuth, deleteMember);

// Trackers
router.get('/trackers/summary', getMemberTrackerSummary);
router.get('/trackers/cc-speeches', getCCSpeeches);
router.post('/trackers/cc-speeches', requireAuth, addCCSpeech);
router.post('/trackers/cc-speeches/bulk', requireAuth, bulkAddCCSpeeches);

router.get('/trackers/cl-records', getCLRecords);
router.post('/trackers/cl-records', requireAuth, addCLRecord);

// Standby Backup Pool
router.get('/standby/pool', getBackupPool);
router.post('/standby/pool', requireAuth, addToBackupPool);
router.put('/standby/pool/:id', requireAuth, updateBackupItem);
router.delete('/standby/pool/:id', requireAuth, removeFromBackupPool);

// Dashboard Widgets
router.get('/dashboard/stats', getDashboardStats);

// Upload Excel
router.post('/import-excel', requireAuth, upload.single('file'), importMembersExcel);

module.exports = router;
