const express = require('express');
const router = express.Router();
const {
  getReliabilityScores,
  processCancellation,
  getWhatsAppTemplates,
  toggleDependableBadge
} = require('../controllers/reliabilityController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/scores', requireAuth, getReliabilityScores);
router.post('/cancel-role', requireAuth, processCancellation);
router.get('/whatsapp-templates', requireAuth, getWhatsAppTemplates);
router.post('/:id/toggle-badge', requireAuth, toggleDependableBadge);

module.exports = router;
